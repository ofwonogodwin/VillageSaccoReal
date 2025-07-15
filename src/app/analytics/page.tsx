"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    Users,
    DollarSign,
    TrendingUp,
    BarChart3,
    ArrowLeft,
    Wallet,
    CreditCard,
    Vote,
    Activity
} from "lucide-react"
import { formatCurrency } from "@/lib/utils"

interface AnalyticsData {
    overview: {
        members: {
            total: number
            approved: number
            pending: number
            suspended: number
        }
        savings: {
            totalBalance: number
            averageBalance: number
            totalAccounts: number
        }
        loans: {
            totalDisbursed: number
            outstandingBalance: number
            activeLoans: number
            pendingApplications: number
            completedLoans: number
            defaultedLoans: number
        }
        transactions: {
            monthlyVolume: number
            monthlyCount: number
        }
        governance: {
            activeProposals: number
            completedProposals: number
            draftProposals: number
        }
    }
    metrics: {
        loanToSavingsRatio: number
        averageLoanSize: number
        repaymentRate: number
        memberGrowthRate: number
        savingsGrowthRate: number
    }
    monthlyTrends?: Array<{
        month: string
        deposits: number
        withdrawals: number
        loansDisbursed: number
        loanRepayments: number
        transactionCount: number
    }>
}

export default function AnalyticsPage() {
    const [user, setUser] = useState<any>(null)
    const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
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
            await fetchAnalytics(token)
        } catch (error) {
            console.error("Auth check failed:", error)
            localStorage.removeItem("token")
            router.push("/login")
        } finally {
            setIsLoading(false)
        }
    }

    const fetchAnalytics = async (token: string) => {
        try {
            const response = await fetch("/api/analytics", {
                headers: { Authorization: `Bearer ${token}` }
            })

            if (response.ok) {
                const data = await response.json()
                setAnalyticsData(data)
            }
        } catch (error) {
            console.error("Error fetching analytics:", error)
        }
    }

    const getReturnPath = () => {
        if (user?.role === "ADMIN") {
            return "/admin/dashboard"
        }
        return "/dashboard"
    }

    if (isLoading || !analyticsData) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading analytics...</p>
                </div>
            </div>
        )
    }

    const { overview, metrics, monthlyTrends } = analyticsData

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center space-x-4">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push(getReturnPath())}
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Dashboard
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
                            <p className="text-gray-600">Comprehensive view of SACCO performance</p>
                        </div>
                    </div>
                </div>
            </header>

            <div className="container mx-auto px-4 py-8">
                <Tabs defaultValue="overview" className="space-y-6">
                    <TabsList>
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="financial">Financial Metrics</TabsTrigger>
                        {monthlyTrends && <TabsTrigger value="trends">Trends</TabsTrigger>}
                    </TabsList>

                    {/* Overview Tab */}
                    <TabsContent value="overview">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            {/* Members Card */}
                            <Card>
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-gray-600">Total Members</p>
                                            <p className="text-2xl font-bold text-gray-900">{overview.members.total}</p>
                                            <p className="text-xs text-gray-500 mt-1">
                                                {overview.members.pending} pending approval
                                            </p>
                                        </div>
                                        <Users className="h-8 w-8 text-blue-600" />
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Savings Card */}
                            <Card>
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-gray-600">Total Savings</p>
                                            <p className="text-2xl font-bold text-green-900">{formatCurrency(overview.savings.totalBalance)}</p>
                                            <p className="text-xs text-gray-500 mt-1">
                                                {overview.savings.totalAccounts} accounts
                                            </p>
                                        </div>
                                        <Wallet className="h-8 w-8 text-green-600" />
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Loans Card */}
                            <Card>
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-gray-600">Active Loans</p>
                                            <p className="text-2xl font-bold text-purple-900">{overview.loans.activeLoans}</p>
                                            <p className="text-xs text-gray-500 mt-1">
                                                {formatCurrency(overview.loans.outstandingBalance)} outstanding
                                            </p>
                                        </div>
                                        <CreditCard className="h-8 w-8 text-purple-600" />
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Transactions Card */}
                            <Card>
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-gray-600">Monthly Transactions</p>
                                            <p className="text-2xl font-bold text-orange-900">{overview.transactions.monthlyCount}</p>
                                            <p className="text-xs text-gray-500 mt-1">
                                                {formatCurrency(overview.transactions.monthlyVolume)} volume
                                            </p>
                                        </div>
                                        <Activity className="h-8 w-8 text-orange-600" />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Detailed Breakdown */}
                        <div className="grid lg:grid-cols-3 gap-6">
                            {/* Member Breakdown */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center space-x-2">
                                        <Users className="h-5 w-5" />
                                        <span>Member Status</span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-600">Approved</span>
                                            <div className="flex items-center space-x-2">
                                                <div className="w-16 bg-gray-200 rounded-full h-2">
                                                    <div
                                                        className="bg-green-600 h-2 rounded-full"
                                                        style={{ width: `${(overview.members.approved / overview.members.total) * 100}%` }}
                                                    ></div>
                                                </div>
                                                <span className="text-sm font-medium">{overview.members.approved}</span>
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-600">Pending</span>
                                            <div className="flex items-center space-x-2">
                                                <div className="w-16 bg-gray-200 rounded-full h-2">
                                                    <div
                                                        className="bg-yellow-600 h-2 rounded-full"
                                                        style={{ width: `${(overview.members.pending / overview.members.total) * 100}%` }}
                                                    ></div>
                                                </div>
                                                <span className="text-sm font-medium">{overview.members.pending}</span>
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-600">Suspended</span>
                                            <div className="flex items-center space-x-2">
                                                <div className="w-16 bg-gray-200 rounded-full h-2">
                                                    <div
                                                        className="bg-red-600 h-2 rounded-full"
                                                        style={{ width: `${(overview.members.suspended / overview.members.total) * 100}%` }}
                                                    ></div>
                                                </div>
                                                <span className="text-sm font-medium">{overview.members.suspended}</span>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Loan Portfolio */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center space-x-2">
                                        <CreditCard className="h-5 w-5" />
                                        <span>Loan Portfolio</span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-600">Active Loans</span>
                                            <span className="text-sm font-medium">{overview.loans.activeLoans}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-600">Pending Applications</span>
                                            <span className="text-sm font-medium">{overview.loans.pendingApplications}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-600">Completed Loans</span>
                                            <span className="text-sm font-medium">{overview.loans.completedLoans}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-600">Defaulted Loans</span>
                                            <span className="text-sm font-medium text-red-600">{overview.loans.defaultedLoans}</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Governance */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center space-x-2">
                                        <Vote className="h-5 w-5" />
                                        <span>Governance</span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-600">Active Proposals</span>
                                            <span className="text-sm font-medium">{overview.governance.activeProposals}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-600">Completed</span>
                                            <span className="text-sm font-medium">{overview.governance.completedProposals}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-600">Draft Proposals</span>
                                            <span className="text-sm font-medium">{overview.governance.draftProposals}</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* Financial Metrics Tab */}
                    <TabsContent value="financial">
                        <div className="grid lg:grid-cols-2 gap-6">
                            {/* Key Financial Ratios */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center space-x-2">
                                        <TrendingUp className="h-5 w-5" />
                                        <span>Key Financial Ratios</span>
                                    </CardTitle>
                                    <CardDescription>
                                        Important financial health indicators
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-6">
                                        <div>
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-sm font-medium">Loan-to-Savings Ratio</span>
                                                <span className="text-sm font-bold">{metrics.loanToSavingsRatio.toFixed(1)}%</span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div
                                                    className={`h-2 rounded-full ${metrics.loanToSavingsRatio > 80 ? 'bg-red-600' : metrics.loanToSavingsRatio > 60 ? 'bg-yellow-600' : 'bg-green-600'}`}
                                                    style={{ width: `${Math.min(metrics.loanToSavingsRatio, 100)}%` }}
                                                ></div>
                                            </div>
                                            <p className="text-xs text-gray-500 mt-1">
                                                {metrics.loanToSavingsRatio > 80 ? 'High risk - consider limiting loans' :
                                                    metrics.loanToSavingsRatio > 60 ? 'Moderate - monitor closely' :
                                                        'Healthy ratio'}
                                            </p>
                                        </div>

                                        <div>
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-sm font-medium">Repayment Rate</span>
                                                <span className="text-sm font-bold">{metrics.repaymentRate.toFixed(1)}%</span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div
                                                    className={`h-2 rounded-full ${metrics.repaymentRate < 80 ? 'bg-red-600' : metrics.repaymentRate < 90 ? 'bg-yellow-600' : 'bg-green-600'}`}
                                                    style={{ width: `${metrics.repaymentRate}%` }}
                                                ></div>
                                            </div>
                                            <p className="text-xs text-gray-500 mt-1">
                                                {metrics.repaymentRate < 80 ? 'Concerning - review collection procedures' :
                                                    metrics.repaymentRate < 90 ? 'Good - room for improvement' :
                                                        'Excellent repayment performance'}
                                            </p>
                                        </div>

                                        <div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm font-medium">Average Loan Size</span>
                                                <span className="text-sm font-bold">{formatCurrency(metrics.averageLoanSize)}</span>
                                            </div>
                                        </div>

                                        <div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm font-medium">Average Savings Balance</span>
                                                <span className="text-sm font-bold">{formatCurrency(overview.savings.averageBalance)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Financial Summary */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center space-x-2">
                                        <DollarSign className="h-5 w-5" />
                                        <span>Financial Summary</span>
                                    </CardTitle>
                                    <CardDescription>
                                        Overall financial position
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="p-4 bg-green-50 rounded-lg">
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm font-medium text-green-800">Total Assets (Savings)</span>
                                                <span className="text-lg font-bold text-green-900">{formatCurrency(overview.savings.totalBalance)}</span>
                                            </div>
                                        </div>

                                        <div className="p-4 bg-purple-50 rounded-lg">
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm font-medium text-purple-800">Loans Disbursed</span>
                                                <span className="text-lg font-bold text-purple-900">{formatCurrency(overview.loans.totalDisbursed)}</span>
                                            </div>
                                        </div>

                                        <div className="p-4 bg-blue-50 rounded-lg">
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm font-medium text-blue-800">Outstanding Loans</span>
                                                <span className="text-lg font-bold text-blue-900">{formatCurrency(overview.loans.outstandingBalance)}</span>
                                            </div>
                                        </div>

                                        <div className="p-4 bg-gray-50 rounded-lg">
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm font-medium text-gray-800">Available for Lending</span>
                                                <span className="text-lg font-bold text-gray-900">
                                                    {formatCurrency(Math.max(0, overview.savings.totalBalance - overview.loans.outstandingBalance))}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* Trends Tab (Admin only) */}
                    {monthlyTrends && (
                        <TabsContent value="trends">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center space-x-2">
                                        <BarChart3 className="h-5 w-5" />
                                        <span>Monthly Trends (Last 6 Months)</span>
                                    </CardTitle>
                                    <CardDescription>
                                        Transaction and activity trends over time
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-6">
                                        {monthlyTrends.map((trend) => (
                                            <div key={trend.month} className="border-b pb-4">
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="font-medium">{trend.month}</span>
                                                    <span className="text-sm text-gray-600">{trend.transactionCount} transactions</span>
                                                </div>
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                                    <div>
                                                        <span className="text-gray-600">Deposits:</span>
                                                        <div className="font-medium text-green-600">{formatCurrency(trend.deposits)}</div>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-600">Withdrawals:</span>
                                                        <div className="font-medium text-red-600">{formatCurrency(trend.withdrawals)}</div>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-600">Loans:</span>
                                                        <div className="font-medium text-purple-600">{formatCurrency(trend.loansDisbursed)}</div>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-600">Repayments:</span>
                                                        <div className="font-medium text-blue-600">{formatCurrency(trend.loanRepayments)}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    )}
                </Tabs>
            </div>
        </div>
    )
}
