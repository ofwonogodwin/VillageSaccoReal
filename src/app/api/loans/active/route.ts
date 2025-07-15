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

        // Verify user exists
        const user = await db.user.findUnique({
            where: { id: decoded.userId }
        })

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 })
        }

        // Get user's active loans (approved and disbursed)
        const activeLoans = await db.loan.findMany({
            where: {
                userId: decoded.userId,
                status: {
                    in: ["APPROVED", "DISBURSED"]
                }
            },
            orderBy: { disbursedAt: "desc" },
            include: {
                repayments: {
                    orderBy: { dueDate: "asc" },
                    take: 3 // Get next 3 payments
                }
            }
        })

        // Format the response
        const formattedLoans = activeLoans.map(loan => ({
            id: loan.id,
            amount: loan.amount,
            purpose: loan.purpose,
            termMonths: loan.termMonths,
            interestRate: loan.interestRate,
            monthlyPayment: loan.monthlyPayment,
            totalRepayment: loan.totalRepayment,
            remainingBalance: loan.remainingBalance,
            status: loan.status,
            appliedAt: loan.appliedAt,
            approvedAt: loan.approvedAt,
            disbursedAt: loan.disbursedAt,
            nextPaymentDue: loan.nextPaymentDue,
            upcomingPayments: loan.repayments.map(repayment => ({
                id: repayment.id,
                amount: repayment.amount,
                principal: repayment.principal,
                interest: repayment.interest,
                dueDate: repayment.dueDate,
                status: repayment.status
            }))
        }))

        return NextResponse.json(formattedLoans)
    } catch (error) {
        console.error("Error fetching active loans:", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}
