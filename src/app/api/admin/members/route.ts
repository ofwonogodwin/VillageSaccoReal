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

    // Verify user is admin
    const user = await db.user.findUnique({
      where: { id: decoded.userId },
      select: { role: true }
    })

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Get all members with their savings and loans data
    const members = await db.user.findMany({
      include: {
        savingsAccounts: {
          select: {
            balance: true
          }
        },
        transactions: {
          where: {
            type: {
              in: ["LOAN_DISBURSEMENT", "LOAN_REPAYMENT"]
            }
          },
          select: {
            amount: true,
            type: true,
            createdAt: true
          }
        }
      },
      orderBy: { createdAt: "desc" }
    })

    // Calculate totals for each member
    const membersWithTotals = members.map((member: Record<string, any>) => {
      const totalSavings = member.savingsAccounts.reduce((sum: number, account: Record<string, any>) => sum + account.balance, 0)

      const loanTransactions = member.transactions.filter((t: Record<string, any>) => t.type === "LOAN_DISBURSEMENT" || t.type === "LOAN_REPAYMENT")
      const totalDisbursed = loanTransactions
        .filter((t: Record<string, any>) => t.type === "LOAN_DISBURSEMENT")
        .reduce((sum: number, t: Record<string, any>) => sum + t.amount, 0)
      const totalPaid = loanTransactions
        .filter((t: Record<string, any>) => t.type === "LOAN_REPAYMENT")
        .reduce((sum: number, t: Record<string, any>) => sum + t.amount, 0)
      const totalLoans = totalDisbursed - totalPaid

      const lastTransaction = member.transactions.length > 0
        ? member.transactions.sort((a: Record<string, any>, b: Record<string, any>) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0]
        : null

      return {
        id: member.id,
        firstName: member.firstName,
        lastName: member.lastName,
        email: member.email,
        phone: member.phone,
        nationalId: member.nationalId,
        status: member.membershipStatus,
        role: member.role,
        joinedAt: member.createdAt,
        totalSavings,
        totalLoans: Math.max(0, totalLoans),
        lastActivity: lastTransaction?.createdAt || null
      }
    })

    return NextResponse.json(membersWithTotals)
  } catch (error) {
    console.error("Error fetching members:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
