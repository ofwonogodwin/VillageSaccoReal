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

        // Verify user exists
        const user = await db.user.findUnique({
            where: { id: decoded.userId }
        })

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 })
        }

        // Get user's loan applications
        const applications = await db.loan.findMany({
            where: { userId: decoded.userId },
            orderBy: { createdAt: "desc" },
            select: {
                id: true,
                amount: true,
                purpose: true,
                termMonths: true,
                interestRate: true,
                monthlyPayment: true,
                status: true,
                appliedAt: true,
                approvedAt: true,
                disbursedAt: true
            }
        })

        // Format the response
        const formattedApplications = applications.map(app => ({
            id: app.id,
            amount: app.amount,
            purpose: app.purpose,
            termMonths: app.termMonths,
            interestRate: app.interestRate,
            monthlyPayment: app.monthlyPayment,
            status: app.status,
            appliedAt: app.appliedAt,
            approvedAt: app.approvedAt,
            disbursedAt: app.disbursedAt
        }))

        return NextResponse.json(formattedApplications)
    } catch (error) {
        console.error("Error fetching loan applications:", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}

export async function POST(request: NextRequest) {
    try {
        const authHeader = request.headers.get("authorization")
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const token = authHeader.split(" ")[1]
        const decoded = verify(token, process.env.JWT_SECRET!) as { userId: string }

        // Verify user exists and is approved
        const user = await db.user.findUnique({
            where: { id: decoded.userId }
        })

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 })
        }

        if (user.membershipStatus !== "APPROVED") {
            return NextResponse.json({
                error: "Only approved members can apply for loans"
            }, { status: 403 })
        }

        // Parse request body
        const body = await request.json()
        const { amount, purpose, termMonths, collateralType, collateralValue, collateralDescription } = body

        // Validate required fields
        if (!amount || !purpose || !termMonths) {
            return NextResponse.json({
                error: "Amount, purpose, and term months are required"
            }, { status: 400 })
        }

        if (amount <= 0 || termMonths <= 0) {
            return NextResponse.json({
                error: "Amount and term months must be positive numbers"
            }, { status: 400 })
        }

        // Check for existing pending applications
        const existingApplication = await db.loan.findFirst({
            where: {
                userId: decoded.userId,
                status: "PENDING"
            }
        })

        if (existingApplication) {
            return NextResponse.json({
                error: "You already have a pending loan application"
            }, { status: 409 })
        }

        // Calculate loan terms (basic calculation)
        const interestRate = 0.15 // 15% annual interest rate
        const monthlyInterestRate = interestRate / 12
        const numberOfPayments = termMonths

        // Calculate monthly payment using loan formula
        const monthlyPayment = amount * (monthlyInterestRate * Math.pow(1 + monthlyInterestRate, numberOfPayments)) /
            (Math.pow(1 + monthlyInterestRate, numberOfPayments) - 1)

        const totalRepayment = monthlyPayment * termMonths
        const remainingBalance = amount

        // Create loan application
        const loan = await db.loan.create({
            data: {
                userId: decoded.userId,
                amount,
                purpose,
                termMonths,
                interestRate,
                monthlyPayment: Math.round(monthlyPayment * 100) / 100, // Round to 2 decimal places
                totalRepayment: Math.round(totalRepayment * 100) / 100,
                remainingBalance,
                collateralType,
                collateralValue,
                collateralDescription,
                status: "PENDING"
            }
        })

        return NextResponse.json({
            message: "Loan application submitted successfully",
            application: {
                id: loan.id,
                amount: loan.amount,
                purpose: loan.purpose,
                termMonths: loan.termMonths,
                interestRate: loan.interestRate,
                monthlyPayment: loan.monthlyPayment,
                status: loan.status,
                appliedAt: loan.appliedAt
            }
        }, { status: 201 })

    } catch (error) {
        console.error("Error creating loan application:", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}
