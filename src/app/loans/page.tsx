"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    DollarSign,
    Plus,
    Clock,
    CheckCircle,
    XCircle,
    Calculator,
    FileText,
    Calendar,
    AlertCircle,
    Shield
} from "lucide-react"
import { formatCurrency, formatDate } from "@/lib/utils"
import { WalletConnection } from "@/components/web3/WalletConnection"
import { BlockchainLoans } from "@/components/web3/BlockchainLoans"

interface LoanApplication {
    id: string
    amount: number
    purpose: string
    termMonths: number
    interestRate: number
    monthlyPayment: number
    status: string
    appliedAt: string
    processedAt?: string
}

interface ActiveLoan {
    id: string
    originalAmount: number
    currentBalance: number
    monthlyPayment: number
    nextDueDate: string
    status: string
    paymentsRemaining: number
}

export default function LoansPage() {
    const [user, setUser] = useState<any>(null)
    const [applications, setApplications] = useState<LoanApplication[]>([])
    const [activeLoans, setActiveLoans] = useState<ActiveLoan[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        checkAuth()
    }, [])

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
            setUser(userData)
            await fetchLoansData(token)
        } catch (error) {
            console.error("Auth check failed:", error)
            localStorage.removeItem("token")
            router.push("/login")
        } finally {
            setIsLoading(false)
        }
    }

    const fetchLoansData = async (token: string) => {
        try {
            // Fetch loan applications
            const applicationsResponse = await fetch("/api/loans/applications", {
                headers: { Authorization: `Bearer ${token}` }
            })
            if (applicationsResponse.ok) {
                const applicationsData = await applicationsResponse.json()
                setApplications(applicationsData)
            }

            // Fetch active loans
            const loansResponse = await fetch("/api/loans/active", {
                headers: { Authorization: `Bearer ${token}` }
            })
            if (loansResponse.ok) {
                const loansData = await loansResponse.json()
                setActiveLoans(loansData)
            }
        } catch (error) {
            console.error("Failed to fetch loans data:", error)
        }
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "PENDING":
                return <Badge variant="secondary">Pending Review</Badge>
            case "APPROVED":
                return <Badge variant="default">Approved</Badge>
            case "REJECTED":
                return <Badge variant="destructive">Rejected</Badge>
            case "DISBURSED":
                return <Badge variant="default">Disbursed</Badge>
            default:
                return <Badge variant="outline">{status}</Badge>
        }
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading loans...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => router.push("/dashboard")}
                            >
                                ← Back to Dashboard
                            </Button>
                            <div>
                                <h1 className="text-xl font-bold text-gray-900">Loan Services</h1>
                                <p className="text-sm text-gray-600">Apply for loans and manage repayments</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            <WalletConnection />
                            <Button onClick={() => router.push("/loans/apply")}>
                                <Plus className="h-4 w-4 mr-2" />
                                Apply for Loan
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto px-4 py-8">
                <Tabs defaultValue="traditional" className="space-y-6">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="traditional" className="flex items-center space-x-2">
                            <FileText className="h-4 w-4" />
                            <span>Traditional Loans</span>
                        </TabsTrigger>
                        <TabsTrigger value="blockchain" className="flex items-center space-x-2">
                            <Shield className="h-4 w-4" />
                            <span>Blockchain Loans</span>
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="traditional" className="space-y-6">
                        {/* Quick Stats */}
                        <div className="grid md:grid-cols-4 gap-6 mb-6">
                            <Card>
                                <CardContent className="p-6">
                                    <div className="flex items-center space-x-2">
                                        <FileText className="h-8 w-8 text-blue-600" />
                                        <div>
                                            <p className="text-sm text-gray-600">Applications</p>
                                            <p className="text-2xl font-bold">{applications.length}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="p-6">
                                    <div className="flex items-center space-x-2">
                                        <Clock className="h-8 w-8 text-orange-600" />
                                        <div>
                                            <p className="text-sm text-gray-600">Pending</p>
                                            <p className="text-2xl font-bold">
                                                {applications.filter(app => app.status === "PENDING").length}
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="p-6">
                                    <div className="flex items-center space-x-2">
                                        <DollarSign className="h-8 w-8 text-green-600" />
                                        <div>
                                            <p className="text-sm text-gray-600">Active Loans</p>
                                            <p className="text-2xl font-bold">{activeLoans.length}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="p-6">
                                    <div className="flex items-center space-x-2">
                                        <Calculator className="h-8 w-8 text-purple-600" />
                                        <div>
                                            <p className="text-sm text-gray-600">Total Balance</p>
                                            <p className="text-2xl font-bold">
                                                {formatCurrency(activeLoans.reduce((sum, loan) => sum + loan.currentBalance, 0))}
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Loans Tabs */}
                        <Tabs defaultValue="applications" className="space-y-6">
                            <TabsList>
                                <TabsTrigger value="applications">
                                    Applications ({applications.length})
                                </TabsTrigger>
                                <TabsTrigger value="active">
                                    Active Loans ({activeLoans.length})
                                </TabsTrigger>
                                <TabsTrigger value="calculator">
                                    Loan Calculator
                                </TabsTrigger>
                            </TabsList>

                            {/* Loan Applications */}
                            <TabsContent value="applications">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Loan Applications</CardTitle>
                                        <CardDescription>Track your loan application status</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        {applications.length === 0 ? (
                                            <div className="text-center py-12">
                                                <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                                                <p className="text-gray-600">No loan applications</p>
                                                <Button
                                                    className="mt-4"
                                                    onClick={() => router.push("/loans/apply")}
                                                >
                                                    Apply for Your First Loan
                                                </Button>
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                {applications.map((application) => (
                                                    <div key={application.id} className="border rounded-lg p-4">
                                                        <div className="flex justify-between items-start mb-4">
                                                            <div className="flex-1">
                                                                <div className="flex items-center space-x-3 mb-2">
                                                                    <h3 className="font-medium">
                                                                        {formatCurrency(application.amount)} Loan
                                                                    </h3>
                                                                    {getStatusBadge(application.status)}
                                                                </div>
                                                                <p className="text-gray-600 mb-2">{application.purpose}</p>

                                                                <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
                                                                    <div><strong>Term:</strong> {application.termMonths} months</div>
                                                                    <div><strong>Interest Rate:</strong> {application.interestRate}%</div>
                                                                    <div><strong>Monthly Payment:</strong> {formatCurrency(application.monthlyPayment)}</div>
                                                                    <div><strong>Applied:</strong> {formatDate(new Date(application.appliedAt))}</div>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {application.status === "PENDING" && (
                                                            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                                                                <div className="flex items-center space-x-2">
                                                                    <Clock className="h-4 w-4 text-yellow-600" />
                                                                    <span className="text-sm text-yellow-800">
                                                                        Your application is under review. We'll notify you once processed.
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        )}

                                                        {application.status === "APPROVED" && (
                                                            <div className="bg-green-50 border border-green-200 rounded-md p-3">
                                                                <div className="flex items-center space-x-2">
                                                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                                                    <span className="text-sm text-green-800">
                                                                        Congratulations! Your loan has been approved.
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        )}

                                                        {application.status === "REJECTED" && (
                                                            <div className="bg-red-50 border border-red-200 rounded-md p-3">
                                                                <div className="flex items-center space-x-2">
                                                                    <XCircle className="h-4 w-4 text-red-600" />
                                                                    <span className="text-sm text-red-800">
                                                                        Your application was not approved. Contact support for details.
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Active Loans */}
                            <TabsContent value="active">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Active Loans</CardTitle>
                                        <CardDescription>Manage your current loans and payments</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        {activeLoans.length === 0 ? (
                                            <div className="text-center py-12">
                                                <DollarSign className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                                                <p className="text-gray-600">No active loans</p>
                                                <p className="text-sm text-gray-500">Apply for a loan to get started</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                {activeLoans.map((loan) => (
                                                    <div key={loan.id} className="border rounded-lg p-4">
                                                        <div className="flex justify-between items-start mb-4">
                                                            <div className="flex-1">
                                                                <div className="flex items-center space-x-3 mb-2">
                                                                    <h3 className="font-medium">
                                                                        Loan #{loan.id.slice(-6)}
                                                                    </h3>
                                                                    <Badge variant="default">Active</Badge>
                                                                </div>

                                                                <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
                                                                    <div><strong>Original Amount:</strong> {formatCurrency(loan.originalAmount)}</div>
                                                                    <div><strong>Current Balance:</strong> {formatCurrency(loan.currentBalance)}</div>
                                                                    <div><strong>Monthly Payment:</strong> {formatCurrency(loan.monthlyPayment)}</div>
                                                                    <div><strong>Next Due:</strong> {formatDate(new Date(loan.nextDueDate))}</div>
                                                                    <div><strong>Payments Remaining:</strong> {loan.paymentsRemaining}</div>
                                                                </div>

                                                                {/* Payment Progress */}
                                                                <div className="mb-4">
                                                                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                                                                        <span>Loan Progress</span>
                                                                        <span>{Math.round(((loan.originalAmount - loan.currentBalance) / loan.originalAmount) * 100)}% paid</span>
                                                                    </div>
                                                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                                                        <div
                                                                            className="bg-green-600 h-2 rounded-full"
                                                                            style={{ width: `${((loan.originalAmount - loan.currentBalance) / loan.originalAmount) * 100}%` }}
                                                                        ></div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="flex space-x-3">
                                                            <Button>
                                                                <DollarSign className="h-4 w-4 mr-2" />
                                                                Make Payment
                                                            </Button>
                                                            <Button variant="outline">
                                                                <Calendar className="h-4 w-4 mr-2" />
                                                                Payment Schedule
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Loan Calculator */}
                            <TabsContent value="calculator">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center space-x-2">
                                            <Calculator className="h-5 w-5 text-blue-600" />
                                            <span>Loan Calculator</span>
                                        </CardTitle>
                                        <CardDescription>Calculate monthly payments and total interest</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-center py-12">
                                            <Calculator className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                                            <h3 className="text-lg font-medium text-gray-900 mb-2">Loan Calculator</h3>
                                            <p className="text-gray-600 mb-6">
                                                Calculate your potential loan payments
                                            </p>
                                            <Button>
                                                <Calculator className="h-4 w-4 mr-2" />
                                                Open Calculator
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </TabsContent>

                    <TabsContent value="blockchain" className="space-y-6">
                        <BlockchainLoans />
                    </TabsContent>
                </Tabs>
            </main>
        </div>
    )
}
