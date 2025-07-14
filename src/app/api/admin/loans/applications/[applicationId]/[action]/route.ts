import { NextRequest, NextResponse } from "next/server"
import { verify } from "jsonwebtoken"
import { db } from "@/lib/db"

export async function PATCH(
  request: NextRequest,
  { params }: { params: { applicationId: string; action: string } }
) {
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

    const { applicationId, action } = params

    if (!["approve", "reject"].includes(action)) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }

    // For now, just return success since we haven't implemented the loan schema yet
    // In a real implementation, you would:
    // 1. Update the loan application status
    // 2. If approved, create a new loan record
    // 3. Create a transaction record for the disbursement
    // 4. Update the member's loan balance

    const result = {
      id: applicationId,
      status: action === "approve" ? "APPROVED" : "REJECTED",
      processedAt: new Date().toISOString(),
      processedBy: decoded.userId
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error processing loan application:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
