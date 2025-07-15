import { NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { db } from "@/lib/db"

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ memberId: string; action: string }> }
) {
  try {
    const { memberId, action } = await params

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

    if (!["approve", "reject"].includes(action)) {
      return NextResponse.json(
        { error: "Invalid action" },
        { status: 400 }
      )
    }

    // Check if member exists and is pending
    const member = await db.user.findUnique({
      where: { id: memberId }
    })

    if (!member) {
      return NextResponse.json(
        { error: "Member not found" },
        { status: 404 }
      )
    }

    if (member.membershipStatus !== "PENDING") {
      return NextResponse.json(
        { error: "Member is not pending approval" },
        { status: 400 }
      )
    }

    if (action === "approve") {
      // Generate membership number
      const memberCount = await db.user.count({
        where: { membershipStatus: "APPROVED" }
      })
      const membershipNumber = `MEM${String(memberCount + 1).padStart(3, '0')}`

      // Approve member in database
      const updatedMember = await db.user.update({
        where: { id: memberId },
        data: {
          membershipStatus: "APPROVED",
          membershipNumber: membershipNumber,
          approvedAt: new Date(),
          approvedBy: decoded.userId
        }
      })

      // Mark wallet as verified if they have one
      if (updatedMember.walletAddress) {
        await db.user.update({
          where: { id: memberId },
          data: {
            isWalletVerified: true
          }
        })
      }

      return NextResponse.json({
        success: true,
        message: "Member approved successfully",
        member: {
          id: updatedMember.id,
          firstName: updatedMember.firstName,
          lastName: updatedMember.lastName,
          membershipNumber: updatedMember.membershipNumber,
          walletAddress: updatedMember.walletAddress
        },
        blockchain: {
          registered: !!updatedMember.walletAddress,
          error: null,
          walletRequired: !updatedMember.walletAddress,
          note: "Blockchain registration will be enabled after contract deployment"
        }
      })
    } else {
      // Reject member (deactivate account)
      await db.user.update({
        where: { id: memberId },
        data: {
          membershipStatus: "TERMINATED",
          isActive: false,
          approvedBy: decoded.userId
        }
      })

      return NextResponse.json({
        success: true,
        message: "Member application rejected"
      })
    }

  } catch (error) {
    console.error("Member action error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
