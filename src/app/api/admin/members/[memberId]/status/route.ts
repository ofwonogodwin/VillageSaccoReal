import { NextRequest, NextResponse } from "next/server"
import { verify } from "jsonwebtoken"
import { db } from "@/lib/db"

export async function PATCH(
  request: NextRequest,
  { params }: { params: { memberId: string } }
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

    const { status } = await request.json()

    if (!["APPROVED", "PENDING", "SUSPENDED", "TERMINATED"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 })
    }

    const updatedMember = await db.user.update({
      where: { id: params.memberId },
      data: { membershipStatus: status },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        membershipStatus: true
      }
    })

    return NextResponse.json(updatedMember)
  } catch (error) {
    console.error("Error updating member status:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
