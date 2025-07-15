import { NextRequest, NextResponse } from "next/server"
import { verify } from "jsonwebtoken"
import { db } from "@/lib/db"

export async function GET(request: NextRequest) {
    try {
        const authHeader = request.headers.get("authorization")
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const token = authHeader.split(" ")[1]
        const decoded = verify(token, process.env.JWT_SECRET!) as { userId: string }

        // Verify user exists and is admin (for detailed analytics)
        const user = await db.user.findUnique({
            where: { id: decoded.userId }
        })

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 })
        }

        const isAdmin = user.role === "ADMIN"

        // Get overview statistics
        const [
            memberStats,
            savingsStats,
            loanStats,
            transactionStats,
            governanceStats
        ] = await Promise.all([
            // Member statistics
            db.user.groupBy({
                by: ['membershipStatus'],
                _count: true
            }),

            // Savings statistics
            db.savingsAccount.aggregate({
                _sum: { balance: true },
                _count: true,
                _avg: { balance: true }
            }),

            // Loan statistics
            db.loan.groupBy({
                by: ['status'],
                _count: true,
                _sum: { amount: true, remainingBalance: true }
            }),

            // Transaction statistics (last 30 days)
            db.transaction.aggregate({
                where: {
                    createdAt: {
                        gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                    }
                },
                _sum: { amount: true },
                _count: true
            }),

            // Governance statistics
            db.proposal.groupBy({
                by: ['status'],
                _count: true
            })
        ])

        // Process member statistics
        const memberData = memberStats.reduce((acc, item) => {
            acc[item.membershipStatus.toLowerCase()] = item._count
            return acc
        }, {} as Record<string, number>)

        // Process loan statistics
        const loanData = loanStats.reduce((acc, item) => {
            acc[item.status.toLowerCase()] = {
                count: item._count,
                totalAmount: item._sum.amount || 0,
                remainingBalance: item._sum.remainingBalance || 0
            }
            return acc
        }, {} as Record<string, any>)

        // Process governance statistics
        const governanceData = governanceStats.reduce((acc, item) => {
            acc[item.status.toLowerCase()] = item._count
            return acc
        }, {} as Record<string, number>)

        // Calculate financial metrics
        const totalSavings = savingsStats._sum.balance || 0
        const totalLoansAmount = loanData.disbursed?.totalAmount || 0
        const outstandingLoans = loanData.disbursed?.remainingBalance || 0
        const loanToSavingsRatio = totalSavings > 0 ? (totalLoansAmount / totalSavings) * 100 : 0

        // Monthly trends (last 6 months) - only for admin
        let monthlyTrends: Array<{
            month: string
            deposits: number
            withdrawals: number
            loansDisbursed: number
            loanRepayments: number
            transactionCount: number
        }> = []
        if (isAdmin) {
            const sixMonthsAgo = new Date()
            sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

            const monthlyData = await db.$queryRaw`
        SELECT 
          strftime('%Y-%m', date) as month,
          SUM(CASE WHEN type = 'DEPOSIT' THEN amount ELSE 0 END) as deposits,
          SUM(CASE WHEN type = 'WITHDRAWAL' THEN amount ELSE 0 END) as withdrawals,
          SUM(CASE WHEN type = 'LOAN_DISBURSEMENT' THEN amount ELSE 0 END) as loans_disbursed,
          SUM(CASE WHEN type = 'LOAN_REPAYMENT' THEN amount ELSE 0 END) as loan_repayments,
          COUNT(*) as transaction_count
        FROM (
          SELECT 
            createdAt as date,
            type,
            amount
          FROM transactions 
          WHERE createdAt >= ${sixMonthsAgo.toISOString()}
        )
        GROUP BY strftime('%Y-%m', date)
        ORDER BY month
      ` as any[]

            monthlyTrends = monthlyData.map(row => ({
                month: row.month,
                deposits: Number(row.deposits) || 0,
                withdrawals: Number(row.withdrawals) || 0,
                loansDisbursed: Number(row.loans_disbursed) || 0,
                loanRepayments: Number(row.loan_repayments) || 0,
                transactionCount: Number(row.transaction_count) || 0
            }))
        }

        const analytics = {
            overview: {
                members: {
                    total: (memberData.approved || 0) + (memberData.pending || 0) + (memberData.suspended || 0),
                    approved: memberData.approved || 0,
                    pending: memberData.pending || 0,
                    suspended: memberData.suspended || 0
                },
                savings: {
                    totalBalance: totalSavings,
                    averageBalance: savingsStats._avg.balance || 0,
                    totalAccounts: savingsStats._count || 0
                },
                loans: {
                    totalDisbursed: totalLoansAmount,
                    outstandingBalance: outstandingLoans,
                    activeLoans: loanData.disbursed?.count || 0,
                    pendingApplications: loanData.pending?.count || 0,
                    completedLoans: loanData.completed?.count || 0,
                    defaultedLoans: loanData.defaulted?.count || 0
                },
                transactions: {
                    monthlyVolume: transactionStats._sum.amount || 0,
                    monthlyCount: transactionStats._count || 0
                },
                governance: {
                    activeProposals: governanceData.active || 0,
                    completedProposals: governanceData.completed || 0,
                    draftProposals: governanceData.draft || 0
                }
            },
            metrics: {
                loanToSavingsRatio: Math.round(loanToSavingsRatio * 100) / 100,
                averageLoanSize: loanData.disbursed?.count > 0 ?
                    Math.round((totalLoansAmount / loanData.disbursed.count) * 100) / 100 : 0,
                repaymentRate: outstandingLoans > 0 ?
                    Math.round(((totalLoansAmount - outstandingLoans) / totalLoansAmount) * 100 * 100) / 100 : 100,
                memberGrowthRate: 0, // This would need historical data to calculate
                savingsGrowthRate: 0 // This would need historical data to calculate
            },
            ...(isAdmin && { monthlyTrends })
        }

        return NextResponse.json(analytics)
    } catch (error) {
        console.error("Error fetching analytics:", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}
