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

        // Verify JWT token
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET || "fallback-secret"
        ) as { userId: string, email: string, role: string }

        // Get user from database
        const user = await db.user.findUnique({
            where: { id: decoded.userId },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
                membershipNumber: true,
                membershipStatus: true,
                role: true,
                isActive: true,
                joinedAt: true,
                approvedAt: true
            }
        })

        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            )
        }

        if (!user.isActive) {
            return NextResponse.json(
                { error: "Account is deactivated" },
                { status: 401 }
            )
        }

        return NextResponse.json(user)

    } catch (error) {
        console.error("Profile fetch error:", error)
        if (error instanceof jwt.JsonWebTokenError) {
            return NextResponse.json(
                { error: "Invalid token" },
                { status: 401 }
            )
        }

        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}
