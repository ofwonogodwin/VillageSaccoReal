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

    // For now, return mock data since we haven't implemented the loan schema yet
    const mockActiveLoans = [
      {
        id: "loan-1",
        originalAmount: 5000,
        currentBalance: 3500,
        monthlyPayment: 450,
        interestRate: 15,
        termMonths: 12,
        remainingMonths: 8,
        nextDueDate: new Date(Date.now() + 5 * 86400000).toISOString(), // 5 days from now
        status: "ACTIVE",
        user: {
          firstName: "Alice",
          lastName: "Williams",
          email: "alice.williams@example.com"
        },
        isOverdue: false
      },
      {
        id: "loan-2",
        originalAmount: 3000,
        currentBalance: 2100,
        monthlyPayment: 280,
        interestRate: 12,
        termMonths: 15,
        remainingMonths: 9,
        nextDueDate: new Date(Date.now() - 3 * 86400000).toISOString(), // 3 days overdue
        status: "ACTIVE",
        user: {
          firstName: "Bob",
          lastName: "Brown",
          email: "bob.brown@example.com"
        },
        isOverdue: true,
        daysPastDue: 3
      },
      {
        id: "loan-3",
        originalAmount: 7500,
        currentBalance: 6200,
        monthlyPayment: 650,
        interestRate: 18,
        termMonths: 18,
        remainingMonths: 12,
        nextDueDate: new Date(Date.now() + 10 * 86400000).toISOString(), // 10 days from now
        status: "ACTIVE",
        user: {
          firstName: "Carol",
          lastName: "Davis",
          email: "carol.davis@example.com"
        },
        isOverdue: false
      }
    ]

    return NextResponse.json(mockActiveLoans)
  } catch (error) {
    console.error("Error fetching active loans:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
