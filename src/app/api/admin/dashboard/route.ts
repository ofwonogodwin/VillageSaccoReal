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
            where: { id: decoded.userId }
        })

        if (!user || user.role !== "ADMIN") {
            return NextResponse.json({ error: "Access denied" }, { status: 403 })
        }

        // Get dashboard statistics
        const [
            totalMembers,
            pendingApprovals,
            totalLoans,
            activeLoans,
            savingsAccounts,
            pendingMembers
        ] = await Promise.all([
            // Total approved members
            db.user.count({
                where: { membershipStatus: "APPROVED" }
            }),
            // Pending member approvals
            db.user.count({
                where: { membershipStatus: "PENDING" }
            }),
            // Total loans count
            db.loan.count(),
            // Active loans count
            db.loan.count({
                where: { status: "DISBURSED" }
            }),
            // Total savings
            db.savingsAccount.aggregate({
                _sum: { balance: true }
            }),
            // Get pending members for approval
            db.user.findMany({
                where: { membershipStatus: "PENDING" },
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                    role: true,
                    membershipStatus: true,
                    joinedAt: true
                },
                orderBy: { joinedAt: "desc" },
                take: 10
            })
        ])

        const stats = {
            totalMembers,
            pendingApprovals,
            totalLoans,
            activeLoans,
            totalSavings: savingsAccounts._sum.balance || 0
        }

        return NextResponse.json({
            stats,
            pendingMembers
        })

    } catch (error) {
        console.error("Error fetching admin dashboard data:", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}
