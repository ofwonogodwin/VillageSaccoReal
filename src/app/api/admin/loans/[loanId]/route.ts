import { NextRequest, NextResponse } from "next/server"
import { verify } from "jsonwebtoken"
import { db } from "@/lib/db"

export async function PUT(
    request: NextRequest,
    { params }: { params: { loanId: string } }
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
            where: { id: decoded.userId }
        })

        if (!user || user.role !== "ADMIN") {
            return NextResponse.json({ error: "Access denied" }, { status: 403 })
        }

        const { loanId } = params
        const body = await request.json()
        const { action } = body

        if (!action || !["approve", "reject", "disburse"].includes(action)) {
            return NextResponse.json({
                error: "Valid action (approve, reject, disburse) is required"
            }, { status: 400 })
        }

        // Get the loan application
        const loan = await db.loan.findUnique({
            where: { id: loanId },
            include: {
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true
                    }
                }
            }
        })

        if (!loan) {
            return NextResponse.json({ error: "Loan not found" }, { status: 404 })
        }

        let updateData: Record<string, any> = {}
        let message = ""

        switch (action) {
            case "approve":
                if (loan.status !== "PENDING") {
                    return NextResponse.json({
                        error: "Only pending loans can be approved"
                    }, { status: 400 })
                }

                updateData = {
                    status: "APPROVED",
                    approvedAt: new Date(),
                    approvedBy: decoded.userId
                }
                message = "Loan approved successfully"
                break

            case "reject":
                if (loan.status !== "PENDING") {
                    return NextResponse.json({
                        error: "Only pending loans can be rejected"
                    }, { status: 400 })
                }

                updateData = {
                    status: "REJECTED",
                    approvedAt: new Date(),
                    approvedBy: decoded.userId
                }
                message = "Loan rejected"
                break

            case "disburse":
                if (loan.status !== "APPROVED") {
                    return NextResponse.json({
                        error: "Only approved loans can be disbursed"
                    }, { status: 400 })
                }

                // Calculate next payment due date (1 month from disbursement)
                const nextPaymentDue = new Date()
                nextPaymentDue.setMonth(nextPaymentDue.getMonth() + 1)

                updateData = {
                    status: "DISBURSED",
                    disbursedAt: new Date(),
                    nextPaymentDue
                }

                // Create disbursement transaction
                await db.transaction.create({
                    data: {
                        userId: loan.userId,
                        type: "LOAN_DISBURSEMENT",
                        amount: loan.amount,
                        description: `Loan disbursement - ${loan.purpose}`,
                        reference: `DISBURSEMENT_${loan.id}_${Date.now()}`,
                        status: "COMPLETED",
                        processedAt: new Date()
                    }
                })

                // Generate repayment schedule
                const repayments = []
                const monthlyInterestRate = loan.interestRate / 12
                let remainingBalance = loan.amount

                for (let i = 1; i <= loan.termMonths; i++) {
                    const dueDate = new Date()
                    dueDate.setMonth(dueDate.getMonth() + i)

                    const interestAmount = remainingBalance * monthlyInterestRate
                    const principalAmount = Math.min(loan.monthlyPayment - interestAmount, remainingBalance)
                    remainingBalance -= principalAmount

                    repayments.push({
                        loanId: loan.id,
                        amount: loan.monthlyPayment,
                        principal: Math.round(principalAmount * 100) / 100,
                        interest: Math.round(interestAmount * 100) / 100,
                        dueDate,
                        status: "PENDING" as const
                    })

                    if (remainingBalance <= 0) break
                }

                // Create all repayment records
                await db.loanRepayment.createMany({
                    data: repayments
                })

                message = "Loan disbursed successfully"
                break
        }

        // Update the loan
        const updatedLoan = await db.loan.update({
            where: { id: loanId },
            data: updateData
        })

        return NextResponse.json({
            message,
            loan: {
                id: updatedLoan.id,
                status: updatedLoan.status,
                approvedAt: updatedLoan.approvedAt,
                disbursedAt: updatedLoan.disbursedAt,
                nextPaymentDue: updatedLoan.nextPaymentDue
            }
        })

    } catch (error) {
        console.error("Error updating loan status:", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}

export async function GET(
    request: NextRequest,
    { params }: { params: { loanId: string } }
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
            where: { id: decoded.userId }
        })

        if (!user || user.role !== "ADMIN") {
            return NextResponse.json({ error: "Access denied" }, { status: 403 })
        }

        const { loanId } = params

        // Get loan details with repayment schedule
        const loan = await db.loan.findUnique({
            where: { id: loanId },
            include: {
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        membershipNumber: true,
                        phone: true
                    }
                },
                repayments: {
                    orderBy: { dueDate: "asc" }
                }
            }
        })

        if (!loan) {
            return NextResponse.json({ error: "Loan not found" }, { status: 404 })
        }

        return NextResponse.json({
            id: loan.id,
            amount: loan.amount,
            purpose: loan.purpose,
            termMonths: loan.termMonths,
            interestRate: loan.interestRate,
            monthlyPayment: loan.monthlyPayment,
            totalRepayment: loan.totalRepayment,
            remainingBalance: loan.remainingBalance,
            status: loan.status,
            appliedAt: loan.appliedAt,
            approvedAt: loan.approvedAt,
            disbursedAt: loan.disbursedAt,
            nextPaymentDue: loan.nextPaymentDue,
            collateralType: loan.collateralType,
            collateralValue: loan.collateralValue,
            collateralDescription: loan.collateralDescription,
            applicant: {
                id: loan.user.id,
                name: `${loan.user.firstName} ${loan.user.lastName}`,
                email: loan.user.email,
                phone: loan.user.phone,
                membershipNumber: loan.user.membershipNumber
            },
            repaymentSchedule: loan.repayments.map(repayment => ({
                id: repayment.id,
                amount: repayment.amount,
                principal: repayment.principal,
                interest: repayment.interest,
                penalty: repayment.penalty,
                dueDate: repayment.dueDate,
                paidDate: repayment.paidDate,
                status: repayment.status
            }))
        })

    } catch (error) {
        console.error("Error fetching loan details:", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}
