import { NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { db } from "@/lib/db"

// GET - Fetch user's savings accounts
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

    const accounts = await db.savingsAccount.findMany({
      where: {
        userId: decoded.userId,
        isActive: true
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(accounts)

  } catch (error) {
    console.error("Fetch accounts error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// POST - Create new savings account
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

    const { accountType = "REGULAR" } = await request.json()

    // Check if user exists and is approved
    const user = await db.user.findUnique({
      where: { id: decoded.userId }
    })

    if (!user || user.membershipStatus !== "APPROVED") {
      return NextResponse.json(
        { error: "User not found or membership not approved" },
        { status: 403 }
      )
    }

    // Create savings account
    const account = await db.savingsAccount.create({
      data: {
        userId: decoded.userId,
        accountType: accountType,
        balance: 0,
        interestRate: accountType === "FIXED_DEPOSIT" ? 0.08 : 0.05, // 8% for fixed, 5% for regular
        totalInterestEarned: 0,
        isActive: true
      }
    })

    return NextResponse.json(account, { status: 201 })

  } catch (error) {
    console.error("Create account error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
