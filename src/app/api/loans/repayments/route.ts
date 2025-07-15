import { NextRequest, NextResponse } from "next/server"
import { verify } from "jsonwebtoken"
import { db } from "@/lib/db"

export async function POST(request: NextRequest) {
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

        // Parse request body
        const body = await request.json()
        const { loanId, amount } = body

        // Validate required fields
        if (!loanId || !amount) {
            return NextResponse.json({
                error: "Loan ID and amount are required"
            }, { status: 400 })
        }

        if (amount <= 0) {
            return NextResponse.json({
                error: "Payment amount must be positive"
            }, { status: 400 })
        }

        // Verify loan belongs to user and is active
        const loan = await db.loan.findFirst({
            where: {
                id: loanId,
                userId: decoded.userId,
                status: "DISBURSED"
            },
            include: {
                repayments: {
                    where: { status: "PENDING" },
                    orderBy: { dueDate: "asc" },
                    take: 1
                }
            }
        })

        if (!loan) {
            return NextResponse.json({
                error: "Loan not found or not eligible for payment"
            }, { status: 404 })
        }

        if (loan.remainingBalance <= 0) {
            return NextResponse.json({
                error: "Loan is already fully paid"
            }, { status: 400 })
        }

        // Check if there's a pending repayment schedule
        let repaymentToUpdate = loan.repayments[0]

        if (!repaymentToUpdate) {
            // Create a new repayment record if none exists
            const nextDueDate = loan.nextPaymentDue || new Date()
            const monthlyInterestRate = loan.interestRate / 12
            const interestAmount = loan.remainingBalance * monthlyInterestRate
            const principalAmount = Math.min(loan.monthlyPayment - interestAmount, loan.remainingBalance)

            repaymentToUpdate = await db.loanRepayment.create({
                data: {
                    loanId: loan.id,
                    amount: loan.monthlyPayment,
                    principal: principalAmount,
                    interest: interestAmount,
                    dueDate: nextDueDate,
                    status: "PENDING"
                }
            })
        }

        // Create transaction record
        const transaction = await db.transaction.create({
            data: {
                userId: decoded.userId,
                type: "LOAN_REPAYMENT",
                amount: amount,
                description: `Loan repayment for loan ${loan.id.slice(-8)}`,
                reference: `LOAN_${loan.id}_${Date.now()}`,
                status: "COMPLETED",
                processedAt: new Date()
            }
        })

        // Calculate payment allocation
        const paymentAmount = Math.min(amount, repaymentToUpdate.amount)
        const remainingAfterPayment = Math.max(0, loan.remainingBalance - paymentAmount)

        // Update repayment record
        await db.loanRepayment.update({
            where: { id: repaymentToUpdate.id },
            data: {
                paidDate: new Date(),
                status: paymentAmount >= repaymentToUpdate.amount ? "PAID" : "PARTIAL",
                transactionId: transaction.id
            }
        })

        // Calculate next payment due date
        const nextPaymentDue = new Date()
        nextPaymentDue.setMonth(nextPaymentDue.getMonth() + 1)

        // Update loan record
        const updatedLoan = await db.loan.update({
            where: { id: loan.id },
            data: {
                remainingBalance: remainingAfterPayment,
                nextPaymentDue: remainingAfterPayment > 0 ? nextPaymentDue : null,
                status: remainingAfterPayment <= 0 ? "COMPLETED" : "DISBURSED"
            }
        })

        return NextResponse.json({
            message: "Payment processed successfully",
            payment: {
                transactionId: transaction.id,
                amount: paymentAmount,
                remainingBalance: remainingAfterPayment,
                nextPaymentDue: updatedLoan.nextPaymentDue,
                loanStatus: updatedLoan.status
            }
        })

    } catch (error) {
        console.error("Error processing loan payment:", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}

export async function GET(request: NextRequest) {
    try {
        const authHeader = request.headers.get("authorization")
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const token = authHeader.split(" ")[1]
        const decoded = verify(token, process.env.JWT_SECRET!) as { userId: string }

        // Get loan ID from query params
        const { searchParams } = new URL(request.url)
        const loanId = searchParams.get("loanId")

        if (!loanId) {
            return NextResponse.json({
                error: "Loan ID is required"
            }, { status: 400 })
        }

        // Verify loan belongs to user
        const loan = await db.loan.findFirst({
            where: {
                id: loanId,
                userId: decoded.userId
            }
        })

        if (!loan) {
            return NextResponse.json({
                error: "Loan not found"
            }, { status: 404 })
        }

        // Get repayment history
        const repayments = await db.loanRepayment.findMany({
            where: { loanId },
            orderBy: { dueDate: "desc" },
            include: {
                transaction: {
                    select: {
                        id: true,
                        reference: true,
                        processedAt: true
                    }
                }
            }
        })

        return NextResponse.json(repayments)
    } catch (error) {
        console.error("Error fetching repayment history:", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}
