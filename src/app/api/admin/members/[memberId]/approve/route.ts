import { NextRequest, NextResponse } from "next/server"
import { verify } from "jsonwebtoken"
import { db } from "@/lib/db"

export async function POST(
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
        const admin = await db.user.findUnique({
            where: { id: decoded.userId }
        })

        if (!admin || admin.role !== "ADMIN") {
            return NextResponse.json({ error: "Access denied" }, { status: 403 })
        }

        const { memberId } = params

        // Find the member to approve
        const member = await db.user.findUnique({
            where: { id: memberId }
        })

        if (!member) {
            return NextResponse.json({ error: "Member not found" }, { status: 404 })
        }

        if (member.membershipStatus !== "PENDING") {
            return NextResponse.json({ 
                error: "Member is not pending approval" 
            }, { status: 400 })
        }

        // Generate membership number
        const memberCount = await db.user.count({
            where: { membershipStatus: "APPROVED" }
        })
        const membershipNumber = `MEM${String(memberCount + 1).padStart(4, '0')}`

        // Approve the member
        const updatedMember = await db.user.update({
            where: { id: memberId },
            data: {
                membershipStatus: "APPROVED",
                membershipNumber,
                approvedAt: new Date(),
                approvedBy: decoded.userId
            }
        })

        // Create a savings account for the new member
        await db.savingsAccount.create({
            data: {
                userId: updatedMember.id,
                accountType: "REGULAR",
                balance: 0,
                interestRate: 0.05, // 5% annual interest
                isActive: true
            }
        })

        return NextResponse.json({
            message: "Member approved successfully",
            member: {
                id: updatedMember.id,
                name: `${updatedMember.firstName} ${updatedMember.lastName}`,
                email: updatedMember.email,
                membershipNumber: updatedMember.membershipNumber,
                membershipStatus: updatedMember.membershipStatus
            }
        })

    } catch (error) {
        console.error("Error approving member:", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}
