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

        // Get query parameters
        const { searchParams } = new URL(request.url)
        const status = searchParams.get("status")
        const page = parseInt(searchParams.get("page") || "1")
        const limit = parseInt(searchParams.get("limit") || "10")
        const skip = (page - 1) * limit

        // Build where clause
        const where: Record<string, any> = {}
        if (status) {
            where.status = status
        }

        // Get loan applications with user details
        const [applications, total] = await Promise.all([
            db.loan.findMany({
                where,
                skip,
                take: limit,
                orderBy: { appliedAt: "desc" },
                include: {
                    user: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            email: true,
                            membershipNumber: true
                        }
                    }
                }
            }),
            db.loan.count({ where })
        ])

        // Format the response
        const formattedApplications = applications.map((app: any) => ({
            id: app.id,
            amount: app.amount,
            purpose: app.purpose,
            termMonths: app.termMonths,
            interestRate: app.interestRate,
            monthlyPayment: app.monthlyPayment,
            totalRepayment: app.totalRepayment,
            status: app.status,
            appliedAt: app.appliedAt,
            approvedAt: app.approvedAt,
            disbursedAt: app.disbursedAt,
            collateralType: app.collateralType,
            collateralValue: app.collateralValue,
            collateralDescription: app.collateralDescription,
            applicant: {
                id: app.user.id,
                name: `${app.user.firstName} ${app.user.lastName}`,
                email: app.user.email,
                membershipNumber: app.user.membershipNumber
            }
        }))

        return NextResponse.json({
            applications: formattedApplications,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        })
    } catch (error) {
        console.error("Error fetching loan applications:", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}
