import { NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { db } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "fallback-secret"
    ) as { userId: string, role: string }

    // Check admin access
    if (decoded.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      )
    }

    // Get total members
    const totalMembers = await db.user.count({
      where: { isActive: true }
    })

    // Get pending members
    const pendingMembers = await db.user.count({
      where: {
        membershipStatus: "PENDING",
        isActive: true
      }
    })

    // Get total savings
    const savingsAgg = await db.savingsAccount.aggregate({
      where: { isActive: true },
      _sum: {
        balance: true
      }
    })

    // Get total active loans
    const loansAgg = await db.loan.aggregate({
      where: {
        status: { in: ["APPROVED", "DISBURSED"] },
        isActive: true
      },
      _sum: {
        remainingBalance: true
      }
    })

    // Get total transactions this month
    const currentMonth = new Date()
    currentMonth.setDate(1)

    const totalTransactions = await db.transaction.count({
      where: {
        createdAt: {
          gte: currentMonth
        }
      }
    })

    // Calculate monthly growth (simplified)
    const lastMonth = new Date(currentMonth)
    lastMonth.setMonth(lastMonth.getMonth() - 1)

    const lastMonthTransactions = await db.transaction.count({
      where: {
        createdAt: {
          gte: lastMonth,
          lt: currentMonth
        }
      }
    })

    const monthlyGrowth = lastMonthTransactions > 0
      ? Math.round(((totalTransactions - lastMonthTransactions) / lastMonthTransactions) * 100)
      : 0

    const stats = {
      totalMembers,
      pendingMembers,
      totalSavings: savingsAgg._sum.balance || 0,
      totalLoans: loansAgg._sum.remainingBalance || 0,
      totalTransactions,
      monthlyGrowth
    }

    return NextResponse.json(stats)

  } catch (error) {
    console.error("Admin stats error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
