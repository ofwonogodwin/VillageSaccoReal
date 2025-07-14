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
    ) as { userId: string }

    const { accountId, amount, description = "Withdrawal" } = await request.json()

    // Validate input
    if (!accountId || !amount || amount <= 0) {
      return NextResponse.json(
        { error: "Valid account ID and positive amount required" },
        { status: 400 }
      )
    }

    // Verify account ownership and balance
    const account = await db.savingsAccount.findFirst({
      where: {
        id: accountId,
        userId: decoded.userId,
        isActive: true
      }
    })

    if (!account) {
      return NextResponse.json(
        { error: "Account not found or access denied" },
        { status: 404 }
      )
    }

    if (account.balance < amount) {
      return NextResponse.json(
        { error: "Insufficient funds" },
        { status: 400 }
      )
    }

    // Use database transaction to ensure consistency
    const result = await db.$transaction(async (prisma) => {
      // Create transaction record
      const transaction = await prisma.transaction.create({
        data: {
          userId: decoded.userId,
          type: "WITHDRAWAL",
          amount: amount,
          description: description,
          reference: `WTH-${generateId()}`,
          withdrawalAccountId: accountId,
          status: "COMPLETED",
          processedAt: new Date()
        }
      })

      // Update account balance
      const updatedAccount = await prisma.savingsAccount.update({
        where: { id: accountId },
        data: {
          balance: {
            decrement: amount
          },
          updatedAt: new Date()
        }
      })

      return { transaction, account: updatedAccount }
    })

    return NextResponse.json({
      success: true,
      transaction: result.transaction,
      newBalance: result.account.balance
    })

  } catch (error) {
    console.error("Withdrawal error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
