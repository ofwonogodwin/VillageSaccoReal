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
    ) as { userId: string }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get("limit") || "50")
    const offset = parseInt(searchParams.get("offset") || "0")

    const transactions = await db.transaction.findMany({
      where: {
        userId: decoded.userId,
        type: {
          in: ["DEPOSIT", "WITHDRAWAL", "INTEREST_PAYMENT"]
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
      include: {
        depositAccount: {
          select: {
            id: true,
            accountType: true
          }
        },
        withdrawalAccount: {
          select: {
            id: true,
            accountType: true
          }
        }
      }
    })

    // Transform the data for easier frontend consumption
    const transformedTransactions = transactions.map(transaction => ({
      id: transaction.id,
      type: transaction.type,
      amount: transaction.amount,
      description: transaction.description,
      reference: transaction.reference,
      status: transaction.status,
      createdAt: transaction.createdAt,
      processedAt: transaction.processedAt,
      account: transaction.depositAccount || transaction.withdrawalAccount
    }))

    return NextResponse.json(transformedTransactions)

  } catch (error) {
    console.error("Fetch transactions error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
