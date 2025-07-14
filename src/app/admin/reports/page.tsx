"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  FileText,
  Download,
  TrendingUp,
  Users,
  DollarSign,
  Calendar,
  BarChart3,
  PieChart,
  LineChart,
  AlertCircle
} from "lucide-react"
import { formatCurrency, formatDate } from "@/lib/utils"

interface ReportData {
  financialSummary: {
    totalSavings: number
    totalLoans: number
    totalInterest: number
    netPosition: number
    savingsGrowth: number
    loansGrowth: number
  }
  membershipStats: {
    totalMembers: number
    activeMembers: number
    newMembersThisMonth: number
    memberRetentionRate: number
  }
  transactionSummary: {
    totalTransactions: number
    totalVolume: number
    averageTransactionSize: number
    depositsCount: number
    withdrawalsCount: number
  }
  loanPerformance: {
    totalActiveLoans: number
    totalOutstanding: number
    overdueLoans: number
    overdueAmount: number
    collectionRate: number
  }
}

export default function AdminReports() {
  const [user, setUser] = useState<any>(null)
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [selectedPeriod, setSelectedPeriod] = useState("THIS_MONTH")
  const [isLoading, setIsLoading] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const router = useRouter()

  useEffect(() => {
    checkAdminAuth()
  }, [])

  useEffect(() => {
    if (user) {
      fetchReportData()
    }
  }, [user, selectedPeriod])

  const checkAdminAuth = async () => {
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
      if (userData.role !== "ADMIN") {
        router.push("/dashboard")
        return
      }

      setUser(userData)
    } catch (error) {
      console.error("Auth check failed:", error)
      localStorage.removeItem("token")
      router.push("/login")
    } finally {
      setIsLoading(false)
    }
  }

  const fetchReportData = async () => {
    const token = localStorage.getItem("token")
    try {
      const response = await fetch(`/api/admin/reports?period=${selectedPeriod}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (response.ok) {
        const data = await response.json()
        setReportData(data)
      }
    } catch (error) {
      console.error("Failed to fetch report data:", error)
    }
  }

  const generateReport = async (reportType: string) => {
    const token = localStorage.getItem("token")
    setIsGenerating(true)

    try {
      const response = await fetch(`/api/admin/reports/generate`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          reportType,
          period: selectedPeriod
        })
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `${reportType}_${selectedPeriod}_${new Date().toISOString().split('T')[0]}.pdf`
        a.click()
      }
    } catch (error) {
      console.error("Failed to generate report:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  const periodOptions = [
    { value: "THIS_WEEK", label: "This Week" },
    { value: "THIS_MONTH", label: "This Month" },
    { value: "THIS_QUARTER", label: "This Quarter" },
    { value: "THIS_YEAR", label: "This Year" },
    { value: "LAST_MONTH", label: "Last Month" },
    { value: "LAST_QUARTER", label: "Last Quarter" },
    { value: "LAST_YEAR", label: "Last Year" }
  ]

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading reports...</p>
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
                onClick={() => router.push("/admin/dashboard")}
              >
                ← Back to Dashboard
              </Button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Reports & Analytics</h1>
                <p className="text-sm text-gray-600">Financial reports and business intelligence</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="border rounded px-3 py-1 text-sm"
              >
                {periodOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Quick Stats */}
        {reportData && (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-8 w-8 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-600">Total Savings</p>
                    <p className="text-2xl font-bold">{formatCurrency(reportData.financialSummary.totalSavings)}</p>
                    <p className="text-xs text-green-600">
                      +{reportData.financialSummary.savingsGrowth}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Users className="h-8 w-8 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600">Active Members</p>
                    <p className="text-2xl font-bold">{reportData.membershipStats.activeMembers}</p>
                    <p className="text-xs text-blue-600">
                      {reportData.membershipStats.newMembersThisMonth} new this month
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-8 w-8 text-purple-600" />
                  <div>
                    <p className="text-sm text-gray-600">Outstanding Loans</p>
                    <p className="text-2xl font-bold">{formatCurrency(reportData.loanPerformance.totalOutstanding)}</p>
                    <p className="text-xs text-purple-600">
                      {reportData.loanPerformance.totalActiveLoans} active loans
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-8 w-8 text-red-600" />
                  <div>
                    <p className="text-sm text-gray-600">Overdue Loans</p>
                    <p className="text-2xl font-bold">{reportData.loanPerformance.overdueLoans}</p>
                    <p className="text-xs text-red-600">
                      {formatCurrency(reportData.loanPerformance.overdueAmount)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Report Tabs */}
        <Tabs defaultValue="financial" className="space-y-6">
          <TabsList>
            <TabsTrigger value="financial">Financial Reports</TabsTrigger>
            <TabsTrigger value="membership">Membership Reports</TabsTrigger>
            <TabsTrigger value="loans">Loan Reports</TabsTrigger>
            <TabsTrigger value="custom">Custom Reports</TabsTrigger>
          </TabsList>

          {/* Financial Reports */}
          <TabsContent value="financial">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="h-5 w-5 text-green-600" />
                    <span>Financial Summary</span>
                  </CardTitle>
                  <CardDescription>Overview of financial performance</CardDescription>
                </CardHeader>
                <CardContent>
                  {reportData ? (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span>Total Savings:</span>
                        <span className="font-medium">{formatCurrency(reportData.financialSummary.totalSavings)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Total Loans:</span>
                        <span className="font-medium">{formatCurrency(reportData.financialSummary.totalLoans)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Interest Earned:</span>
                        <span className="font-medium">{formatCurrency(reportData.financialSummary.totalInterest)}</span>
                      </div>
                      <div className="flex justify-between items-center border-t pt-2">
                        <span className="font-medium">Net Position:</span>
                        <span className="font-bold text-green-600">
                          {formatCurrency(reportData.financialSummary.netPosition)}
                        </span>
                      </div>
                      <Button
                        className="w-full mt-4"
                        onClick={() => generateReport("FINANCIAL_SUMMARY")}
                        disabled={isGenerating}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Generate Financial Report
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">Loading financial data...</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <LineChart className="h-5 w-5 text-blue-600" />
                    <span>Transaction Analysis</span>
                  </CardTitle>
                  <CardDescription>Transaction volume and patterns</CardDescription>
                </CardHeader>
                <CardContent>
                  {reportData ? (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span>Total Transactions:</span>
                        <span className="font-medium">{reportData.transactionSummary.totalTransactions}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Total Volume:</span>
                        <span className="font-medium">{formatCurrency(reportData.transactionSummary.totalVolume)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Average Size:</span>
                        <span className="font-medium">{formatCurrency(reportData.transactionSummary.averageTransactionSize)}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 pt-2">
                        <div className="text-center">
                          <p className="text-sm text-gray-600">Deposits</p>
                          <p className="text-lg font-medium text-green-600">{reportData.transactionSummary.depositsCount}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-gray-600">Withdrawals</p>
                          <p className="text-lg font-medium text-red-600">{reportData.transactionSummary.withdrawalsCount}</p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        className="w-full mt-4"
                        onClick={() => generateReport("TRANSACTION_ANALYSIS")}
                        disabled={isGenerating}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Generate Transaction Report
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <LineChart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">Loading transaction data...</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Membership Reports */}
          <TabsContent value="membership">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  <span>Membership Analytics</span>
                </CardTitle>
                <CardDescription>Member growth and engagement metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  {reportData ? (
                    <>
                      <div className="space-y-4">
                        <h4 className="font-medium">Membership Overview</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span>Total Members:</span>
                            <span className="font-medium">{reportData.membershipStats.totalMembers}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Active Members:</span>
                            <span className="font-medium">{reportData.membershipStats.activeMembers}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>New This Month:</span>
                            <span className="font-medium">{reportData.membershipStats.newMembersThisMonth}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Retention Rate:</span>
                            <span className="font-medium">{reportData.membershipStats.memberRetentionRate}%</span>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <h4 className="font-medium">Quick Actions</h4>
                        <div className="space-y-2">
                          <Button
                            variant="outline"
                            className="w-full justify-start"
                            onClick={() => generateReport("MEMBERSHIP_ROSTER")}
                            disabled={isGenerating}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Export Member List
                          </Button>
                          <Button
                            variant="outline"
                            className="w-full justify-start"
                            onClick={() => generateReport("MEMBER_ACTIVITY")}
                            disabled={isGenerating}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Member Activity Report
                          </Button>
                          <Button
                            variant="outline"
                            className="w-full justify-start"
                            onClick={() => generateReport("GROWTH_ANALYSIS")}
                            disabled={isGenerating}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Growth Analysis
                          </Button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-8 col-span-2">
                      <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">Loading membership data...</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Loan Reports */}
          <TabsContent value="loans">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <DollarSign className="h-5 w-5 text-purple-600" />
                  <span>Loan Portfolio Analysis</span>
                </CardTitle>
                <CardDescription>Loan performance and risk assessment</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  {reportData ? (
                    <>
                      <div className="space-y-4">
                        <h4 className="font-medium">Portfolio Overview</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span>Active Loans:</span>
                            <span className="font-medium">{reportData.loanPerformance.totalActiveLoans}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Total Outstanding:</span>
                            <span className="font-medium">{formatCurrency(reportData.loanPerformance.totalOutstanding)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Overdue Loans:</span>
                            <span className="font-medium text-red-600">{reportData.loanPerformance.overdueLoans}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Overdue Amount:</span>
                            <span className="font-medium text-red-600">{formatCurrency(reportData.loanPerformance.overdueAmount)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Collection Rate:</span>
                            <span className="font-medium">{reportData.loanPerformance.collectionRate}%</span>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <h4 className="font-medium">Loan Reports</h4>
                        <div className="space-y-2">
                          <Button
                            variant="outline"
                            className="w-full justify-start"
                            onClick={() => generateReport("LOAN_PORTFOLIO")}
                            disabled={isGenerating}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Portfolio Summary
                          </Button>
                          <Button
                            variant="outline"
                            className="w-full justify-start"
                            onClick={() => generateReport("OVERDUE_LOANS")}
                            disabled={isGenerating}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Overdue Loans Report
                          </Button>
                          <Button
                            variant="outline"
                            className="w-full justify-start"
                            onClick={() => generateReport("LOAN_PERFORMANCE")}
                            disabled={isGenerating}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Performance Analysis
                          </Button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-8 col-span-2">
                      <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">Loading loan data...</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Custom Reports */}
          <TabsContent value="custom">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <PieChart className="h-5 w-5 text-orange-600" />
                  <span>Custom Reports</span>
                </CardTitle>
                <CardDescription>Build custom reports and analytics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <PieChart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Custom Report Builder</h3>
                  <p className="text-gray-600 mb-6">
                    Create custom reports with specific metrics and date ranges
                  </p>
                  <Button>
                    <FileText className="h-4 w-4 mr-2" />
                    Launch Report Builder
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
