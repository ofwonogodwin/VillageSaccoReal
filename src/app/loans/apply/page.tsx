"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    DollarSign,
    Calculator,
    ArrowLeft,
    FileText,
    AlertCircle,
    CheckCircle
} from "lucide-react"
import { formatCurrency } from "@/lib/utils"

export default function LoanApplication() {
    const [user, setUser] = useState<any>(null)
    const [formData, setFormData] = useState({
        amount: "",
        purpose: "",
        termMonths: "12",
        guarantorName: "",
        guarantorPhone: "",
        guarantorRelationship: ""
    })
    const [calculatedData, setCalculatedData] = useState({
        monthlyPayment: 0,
        totalInterest: 0,
        totalRepayment: 0,
        interestRate: 15 // Default 15% annual rate
    })
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState("")
    const [success, setSuccess] = useState(false)
    const router = useRouter()

    useEffect(() => {
        checkAuth()
    }, [])

    useEffect(() => {
        calculateLoan()
    }, [formData.amount, formData.termMonths])

    const checkAuth = async () => {
        const token = localStorage.getItem("token")
        if (!token) {
            router.push("/login")
            return
        }

        try {
            const userResponse = await fetch("/api/user/profile", {
                headers: { Authorization: `Bearer ${token}` }
            })

            if (!userResponse.ok) {
                throw new Error("Authentication failed")
            }

            const userData = await userResponse.json()
            if (userData.membershipStatus !== "APPROVED") {
                setError("Only approved members can apply for loans")
                return
            }
            setUser(userData)
        } catch (error) {
            console.error("Auth check failed:", error)
            localStorage.removeItem("token")
            router.push("/login")
        }
    }

    const calculateLoan = () => {
        const principal = parseFloat(formData.amount) || 0
        const termMonths = parseInt(formData.termMonths) || 12
        const annualRate = calculatedData.interestRate / 100
        const monthlyRate = annualRate / 12

        if (principal > 0 && termMonths > 0) {
            // Calculate monthly payment using loan formula
            const monthlyPayment = principal * (monthlyRate * Math.pow(1 + monthlyRate, termMonths)) /
                (Math.pow(1 + monthlyRate, termMonths) - 1)

            const totalRepayment = monthlyPayment * termMonths
            const totalInterest = totalRepayment - principal

            setCalculatedData(prev => ({
                ...prev,
                monthlyPayment: isNaN(monthlyPayment) ? 0 : monthlyPayment,
                totalInterest: isNaN(totalInterest) ? 0 : totalInterest,
                totalRepayment: isNaN(totalRepayment) ? 0 : totalRepayment
            }))
        } else {
            setCalculatedData(prev => ({
                ...prev,
                monthlyPayment: 0,
                totalInterest: 0,
                totalRepayment: 0
            }))
        }
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")
        setIsSubmitting(true)

        // Validation
        if (!formData.amount || !formData.purpose || !formData.guarantorName || !formData.guarantorPhone) {
            setError("Please fill in all required fields")
            setIsSubmitting(false)
            return
        }

        const amount = parseFloat(formData.amount)
        if (amount < 100 || amount > 50000) {
            setError("Loan amount must be between $100 and $50,000")
            setIsSubmitting(false)
            return
        }

        const token = localStorage.getItem("token")
        if (!token) {
            router.push("/login")
            return
        }

        try {
            const response = await fetch("/api/loans/applications", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    ...formData,
                    amount: amount,
                    termMonths: parseInt(formData.termMonths),
                    interestRate: calculatedData.interestRate,
                    monthlyPayment: calculatedData.monthlyPayment
                })
            })

            if (response.ok) {
                setSuccess(true)
                setTimeout(() => {
                    router.push("/loans")
                }, 3000)
            } else {
                const errorData = await response.json()
                setError(errorData.error || "Failed to submit loan application")
            }
        } catch (error) {
            setError("Failed to submit application. Please try again.")
        } finally {
            setIsSubmitting(false)
        }
    }

    if (success) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Card className="max-w-md">
                    <CardContent className="p-8 text-center">
                        <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
                        <h2 className="text-xl font-bold text-gray-900 mb-2">Application Submitted!</h2>
                        <p className="text-gray-600 mb-4">
                            Your loan application has been submitted successfully. You'll be notified once it's reviewed.
                        </p>
                        <Button onClick={() => router.push("/loans")}>
                            View Applications
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center space-x-4">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push("/loans")}
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Loans
                        </Button>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900">Loan Application</h1>
                            <p className="text-sm text-gray-600">Apply for a loan from Village SACCO</p>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto px-4 py-8">
                <div className="max-w-4xl mx-auto">
                    <div className="grid lg:grid-cols-2 gap-8">
                        {/* Application Form */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <FileText className="h-5 w-5 text-blue-600" />
                                    <span>Loan Application Details</span>
                                </CardTitle>
                                <CardDescription>
                                    Fill in your loan requirements and guarantor information
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    {error && (
                                        <div className="bg-red-50 border border-red-200 rounded-md p-4">
                                            <div className="flex items-center space-x-2">
                                                <AlertCircle className="h-4 w-4 text-red-600" />
                                                <p className="text-red-800 text-sm">{error}</p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Loan Amount */}
                                    <div className="space-y-2">
                                        <Label htmlFor="amount">Loan Amount ($) *</Label>
                                        <Input
                                            id="amount"
                                            name="amount"
                                            type="number"
                                            min="100"
                                            max="50000"
                                            step="10"
                                            value={formData.amount}
                                            onChange={handleInputChange}
                                            placeholder="Enter loan amount"
                                            required
                                        />
                                        <p className="text-xs text-gray-600">Minimum: $100 | Maximum: $50,000</p>
                                    </div>

                                    {/* Loan Term */}
                                    <div className="space-y-2">
                                        <Label htmlFor="termMonths">Loan Term (Months)</Label>
                                        <select
                                            id="termMonths"
                                            name="termMonths"
                                            value={formData.termMonths}
                                            onChange={handleInputChange}
                                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        >
                                            <option value="6">6 months</option>
                                            <option value="12">12 months</option>
                                            <option value="18">18 months</option>
                                            <option value="24">24 months</option>
                                            <option value="36">36 months</option>
                                        </select>
                                    </div>

                                    {/* Purpose */}
                                    <div className="space-y-2">
                                        <Label htmlFor="purpose">Purpose of Loan *</Label>
                                        <textarea
                                            id="purpose"
                                            name="purpose"
                                            value={formData.purpose}
                                            onChange={handleInputChange}
                                            rows={3}
                                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="Describe how you plan to use the loan..."
                                            required
                                        />
                                    </div>

                                    {/* Guarantor Information */}
                                    <div className="border-t pt-6">
                                        <h3 className="text-lg font-medium text-gray-900 mb-4">Guarantor Information</h3>

                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="guarantorName">Guarantor Full Name *</Label>
                                                <Input
                                                    id="guarantorName"
                                                    name="guarantorName"
                                                    value={formData.guarantorName}
                                                    onChange={handleInputChange}
                                                    placeholder="Enter guarantor's full name"
                                                    required
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="guarantorPhone">Guarantor Phone Number *</Label>
                                                <Input
                                                    id="guarantorPhone"
                                                    name="guarantorPhone"
                                                    type="tel"
                                                    value={formData.guarantorPhone}
                                                    onChange={handleInputChange}
                                                    placeholder="Enter guarantor's phone number"
                                                    required
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="guarantorRelationship">Relationship to Guarantor</Label>
                                                <Input
                                                    id="guarantorRelationship"
                                                    name="guarantorRelationship"
                                                    value={formData.guarantorRelationship}
                                                    onChange={handleInputChange}
                                                    placeholder="e.g., Friend, Family member, Business partner"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <Button
                                        type="submit"
                                        className="w-full"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                Submitting Application...
                                            </>
                                        ) : (
                                            <>
                                                <FileText className="h-4 w-4 mr-2" />
                                                Submit Loan Application
                                            </>
                                        )}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>

                        {/* Loan Calculator */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <Calculator className="h-5 w-5 text-green-600" />
                                    <span>Loan Calculation</span>
                                </CardTitle>
                                <CardDescription>
                                    Preview your loan terms and monthly payments
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Loan Summary */}
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                    <h4 className="font-medium text-blue-900 mb-3">Loan Summary</h4>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-blue-800">Loan Amount:</span>
                                            <span className="font-medium text-blue-900">
                                                {formatCurrency(parseFloat(formData.amount) || 0)}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-blue-800">Interest Rate:</span>
                                            <span className="font-medium text-blue-900">{calculatedData.interestRate}% APR</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-blue-800">Loan Term:</span>
                                            <span className="font-medium text-blue-900">{formData.termMonths} months</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Payment Breakdown */}
                                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                    <h4 className="font-medium text-green-900 mb-3">Payment Breakdown</h4>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-green-800">Monthly Payment:</span>
                                            <span className="font-bold text-green-900">
                                                {formatCurrency(calculatedData.monthlyPayment)}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-green-800">Total Interest:</span>
                                            <span className="font-medium text-green-900">
                                                {formatCurrency(calculatedData.totalInterest)}
                                            </span>
                                        </div>
                                        <div className="flex justify-between border-t border-green-300 pt-2">
                                            <span className="text-green-800 font-medium">Total Repayment:</span>
                                            <span className="font-bold text-green-900">
                                                {formatCurrency(calculatedData.totalRepayment)}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Requirements */}
                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                    <h4 className="font-medium text-yellow-900 mb-3">Loan Requirements</h4>
                                    <ul className="text-sm text-yellow-800 space-y-1">
                                        <li>• Must be an approved SACCO member</li>
                                        <li>• Minimum savings balance of $50</li>
                                        <li>• Valid guarantor information required</li>
                                        <li>• Loan amount: $100 - $50,000</li>
                                        <li>• Maximum term: 36 months</li>
                                    </ul>
                                </div>

                                {/* Contact Info */}
                                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                                    <h4 className="font-medium text-gray-900 mb-2">Need Help?</h4>
                                    <p className="text-sm text-gray-600 mb-2">
                                        Contact our loan officers for assistance with your application.
                                    </p>
                                    <p className="text-sm text-gray-800">
                                        <strong>Phone:</strong> +1 (555) 123-4567<br />
                                        <strong>Email:</strong> loans@villagesacco.com
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>
        </div>
    )
}
