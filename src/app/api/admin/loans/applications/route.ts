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
    const mockApplications = [
      {
        id: "app-1",
        amount: 5000,
        purpose: "Small business expansion",
        termMonths: 12,
        interestRate: 15,
        status: "PENDING",
        appliedAt: new Date().toISOString(),
        user: {
          firstName: "John",
          lastName: "Doe",
          email: "john.doe@example.com"
        },
        guarantors: [
          {
            name: "Jane Smith",
            relationship: "Business Partner"
          }
        ]
      },
      {
        id: "app-2",
        amount: 2500,
        purpose: "Agricultural equipment",
        termMonths: 18,
        interestRate: 12,
        status: "PENDING",
        appliedAt: new Date(Date.now() - 86400000).toISOString(),
        user: {
          firstName: "Mary",
          lastName: "Johnson",
          email: "mary.johnson@example.com"
        },
        guarantors: [
          {
            name: "Robert Johnson",
            relationship: "Spouse"
          }
        ]
      }
    ]

    return NextResponse.json(mockApplications)
  } catch (error) {
    console.error("Error fetching loan applications:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
