import { NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { db } from "@/lib/db"
import { generateId } from "@/lib/utils"

export async function POST(request: NextRequest) {
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

    // Only admins can trigger interest calculation
    if (decoded.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      )
    }

    // Get all active savings accounts
    const accounts = await db.savingsAccount.findMany({
      where: { isActive: true }
    })

    const results = []

    for (const account of accounts) {
      // Calculate days since last interest calculation
      const lastCalculated = new Date(account.lastInterestCalculated)
      const now = new Date()
      const daysDiff = Math.floor((now.getTime() - lastCalculated.getTime()) / (1000 * 60 * 60 * 24))

      if (daysDiff > 0 && account.balance > 0) {
        // Calculate daily interest (annual rate / 365)
        const dailyRate = account.interestRate / 365
        const interestAmount = account.balance * dailyRate * daysDiff

        if (interestAmount > 0.01) { // Only process if interest is more than 1 cent
          await db.$transaction(async (prisma) => {
            // Create interest transaction
            await prisma.transaction.create({
              data: {
                userId: account.userId,
                type: "INTEREST_PAYMENT",
                amount: interestAmount,
                description: `Interest payment for ${daysDiff} days`,
                reference: `INT-${generateId()}`,
                savingsAccountId: account.id,
                status: "COMPLETED",
                processedAt: now
              }
            })

            // Update account with new balance and interest
            await prisma.savingsAccount.update({
              where: { id: account.id },
              data: {
                balance: {
                  increment: interestAmount
                },
                totalInterestEarned: {
                  increment: interestAmount
                },
                lastInterestCalculated: now,
                updatedAt: now
              }
            })
          })

          results.push({
            accountId: account.id,
            userId: account.userId,
            interestAmount,
            days: daysDiff
          })
        }
      }
    }

    return NextResponse.json({
      success: true,
      processed: results.length,
      totalInterestPaid: results.reduce((sum, r) => sum + r.interestAmount, 0),
      results
    })

  } catch (error) {
    console.error("Interest calculation error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
