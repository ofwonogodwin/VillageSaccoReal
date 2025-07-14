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

    const { searchParams } = new URL(request.url)
    const period = searchParams.get("period") || "THIS_MONTH"

    // For now, return mock data since we're focusing on the UI
    // In a real implementation, you would calculate these from the database
    const mockReportData = {
      financialSummary: {
        totalSavings: 125000,
        totalLoans: 75000,
        totalInterest: 8500,
        netPosition: 58500,
        savingsGrowth: 12.5,
        loansGrowth: 8.3
      },
      membershipStats: {
        totalMembers: 150,
        activeMembers: 142,
        newMembersThisMonth: 8,
        memberRetentionRate: 94.7
      },
      transactionSummary: {
        totalTransactions: 425,
        totalVolume: 85000,
        averageTransactionSize: 200,
        depositsCount: 275,
        withdrawalsCount: 150
      },
      loanPerformance: {
        totalActiveLoans: 35,
        totalOutstanding: 75000,
        overdueLoans: 3,
        overdueAmount: 4500,
        collectionRate: 94.0
      }
    }

    return NextResponse.json(mockReportData)
  } catch (error) {
    console.error("Error fetching report data:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
