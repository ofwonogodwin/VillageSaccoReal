"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DollarSign,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  FileText,
  Calculator,
  TrendingUp,
  Users,
  Calendar
} from "lucide-react"
import { formatCurrency, formatDate } from "@/lib/utils"

interface LoanApplication {
  id: string
  amount: number
  purpose: string
  termMonths: number
  interestRate: number
  status: string
  appliedAt: string
  user: {
    firstName: string
    lastName: string
    email: string
  }
  guarantors?: Array<{
    name: string
    relationship: string
  }>
}

interface ActiveLoan {
  id: string
  originalAmount: number
  currentBalance: number
  monthlyPayment: number
  interestRate: number
  termMonths: number
  remainingMonths: number
  nextDueDate: string
  status: string
  user: {
    firstName: string
    lastName: string
    email: string
  }
  isOverdue: boolean
  daysPastDue?: number
}

export default function LoanManagement() {
  const [user, setUser] = useState<any>(null)
  const [loanApplications, setLoanApplications] = useState<LoanApplication[]>([])
  const [activeLoans, setActiveLoans] = useState<ActiveLoan[]>([])
  const [filteredApplications, setFilteredApplications] = useState<LoanApplication[]>([])
  const [filteredLoans, setFilteredLoans] = useState<ActiveLoan[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const router = useRouter()

  useEffect(() => {
    checkAdminAuth()
  }, [])

  useEffect(() => {
    filterData()
  }, [loanApplications, activeLoans, searchTerm, statusFilter])

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
      const applicationsResponse = await fetch("/api/admin/loans", {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (applicationsResponse.ok) {
        const applicationsData = await applicationsResponse.json()
        setLoanApplications(applicationsData)
      }

      // Fetch active loans
      const loansResponse = await fetch("/api/admin/loans?status=DISBURSED", {
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

  const filterData = () => {
    let filteredApps = loanApplications
    let filteredActiveLoans = activeLoans

    // Filter by search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      filteredApps = filteredApps.filter(app =>
        `${app.user.firstName} ${app.user.lastName}`.toLowerCase().includes(searchLower) ||
        app.user.email.toLowerCase().includes(searchLower) ||
        app.purpose.toLowerCase().includes(searchLower)
      )

      filteredActiveLoans = filteredActiveLoans.filter(loan =>
        `${loan.user.firstName} ${loan.user.lastName}`.toLowerCase().includes(searchLower) ||
        loan.user.email.toLowerCase().includes(searchLower)
      )
    }

    // Filter by status
    if (statusFilter !== "ALL") {
      filteredApps = filteredApps.filter(app => app.status === statusFilter)
      if (statusFilter === "OVERDUE") {
        filteredActiveLoans = filteredActiveLoans.filter(loan => loan.isOverdue)
      } else if (statusFilter === "CURRENT") {
        filteredActiveLoans = filteredActiveLoans.filter(loan => !loan.isOverdue)
      }
    }

    setFilteredApplications(filteredApps)
    setFilteredLoans(filteredActiveLoans)
  }

  const handleApplicationAction = async (applicationId: string, action: 'approve' | 'reject') => {
    const token = localStorage.getItem("token")
    setIsProcessing(true)

    try {
      const response = await fetch(`/api/admin/loans/${applicationId}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` }
      })

      if (response.ok) {
        await fetchLoansData(token!)
      }
    } catch (error) {
      console.error(`Failed to ${action} loan application:`, error)
    } finally {
      setIsProcessing(false)
    }
  }

  const calculateLoanStats = () => {
    const totalApplications = loanApplications.length
    const pendingApplications = loanApplications.filter(app => app.status === "PENDING").length
    const totalActiveLoans = activeLoans.length
    const overdueLoans = activeLoans.filter(loan => loan.isOverdue).length
    const totalOutstanding = activeLoans.reduce((sum, loan) => sum + loan.currentBalance, 0)

    return {
      totalApplications,
      pendingApplications,
      totalActiveLoans,
      overdueLoans,
      totalOutstanding
    }
  }

  const stats = calculateLoanStats()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading loan management...</p>
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
                <h1 className="text-xl font-bold text-gray-900">Loan Management</h1>
                <p className="text-sm text-gray-600">Manage loan applications and active loans</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Statistics Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <FileText className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Applications</p>
                  <p className="text-xl font-bold">{stats.totalApplications}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="text-sm text-gray-600">Pending</p>
                  <p className="text-xl font-bold">{stats.pendingApplications}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">Active Loans</p>
                  <p className="text-xl font-bold">{stats.totalActiveLoans}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <div>
                  <p className="text-sm text-gray-600">Overdue</p>
                  <p className="text-xl font-bold">{stats.overdueLoans}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="text-sm text-gray-600">Outstanding</p>
                  <p className="text-lg font-bold">{formatCurrency(stats.totalOutstanding)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by member name, email, or loan purpose..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                {["ALL", "PENDING", "APPROVED", "REJECTED", "OVERDUE", "CURRENT"].map((status) => (
                  <Button
                    key={status}
                    variant={statusFilter === status ? "default" : "outline"}
                    size="sm"
                    onClick={() => setStatusFilter(status)}
                  >
                    {status}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs for Applications and Active Loans */}
        <Tabs defaultValue="applications" className="space-y-6">
          <TabsList>
            <TabsTrigger value="applications">
              Loan Applications ({filteredApplications.length})
            </TabsTrigger>
            <TabsTrigger value="active">
              Active Loans ({filteredLoans.length})
            </TabsTrigger>
          </TabsList>

          {/* Loan Applications Tab */}
          <TabsContent value="applications">
            <Card>
              <CardHeader>
                <CardTitle>Loan Applications</CardTitle>
                <CardDescription>Review and process loan applications</CardDescription>
              </CardHeader>
              <CardContent>
                {filteredApplications.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No loan applications found</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredApplications.map((application) => (
                      <div key={application.id} className="border rounded-lg p-4">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="font-medium">
                                {application.user.firstName} {application.user.lastName}
                              </h3>
                              <Badge
                                variant={
                                  application.status === "PENDING" ? "secondary" :
                                    application.status === "APPROVED" ? "default" :
                                      "destructive"
                                }
                              >
                                {application.status}
                              </Badge>
                            </div>

                            <div className="grid md:grid-cols-2 gap-2 text-sm text-gray-600 mb-2">
                              <div><strong>Amount:</strong> {formatCurrency(application.amount)}</div>
                              <div><strong>Term:</strong> {application.termMonths} months</div>
                              <div><strong>Interest Rate:</strong> {application.interestRate}%</div>
                              <div><strong>Applied:</strong> {formatDate(new Date(application.appliedAt))}</div>
                            </div>

                            <div className="text-sm">
                              <strong>Purpose:</strong> {application.purpose}
                            </div>
                          </div>

                          {application.status === "PENDING" && (
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                onClick={() => handleApplicationAction(application.id, "approve")}
                                disabled={isProcessing}
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleApplicationAction(application.id, "reject")}
                                disabled={isProcessing}
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Reject
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Active Loans Tab */}
          <TabsContent value="active">
            <Card>
              <CardHeader>
                <CardTitle>Active Loans</CardTitle>
                <CardDescription>Monitor and manage active loans</CardDescription>
              </CardHeader>
              <CardContent>
                {filteredLoans.length === 0 ? (
                  <div className="text-center py-12">
                    <DollarSign className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No active loans found</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredLoans.map((loan) => (
                      <div key={loan.id} className="border rounded-lg p-4">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="font-medium">
                                {loan.user.firstName} {loan.user.lastName}
                              </h3>
                              <Badge
                                variant={loan.isOverdue ? "destructive" : "default"}
                              >
                                {loan.isOverdue ? `${loan.daysPastDue} days overdue` : "Current"}
                              </Badge>
                            </div>

                            <div className="grid md:grid-cols-3 gap-2 text-sm text-gray-600 mb-2">
                              <div><strong>Original Amount:</strong> {formatCurrency(loan.originalAmount)}</div>
                              <div><strong>Current Balance:</strong> {formatCurrency(loan.currentBalance)}</div>
                              <div><strong>Monthly Payment:</strong> {formatCurrency(loan.monthlyPayment)}</div>
                              <div><strong>Interest Rate:</strong> {loan.interestRate}%</div>
                              <div><strong>Remaining Months:</strong> {loan.remainingMonths}</div>
                              <div><strong>Next Due:</strong> {formatDate(new Date(loan.nextDueDate))}</div>
                            </div>
                          </div>

                          <div className="flex flex-col space-y-2">
                            <Button size="sm" variant="outline">
                              <Calendar className="h-4 w-4 mr-1" />
                              View Schedule
                            </Button>
                            <Button size="sm" variant="outline">
                              <Calculator className="h-4 w-4 mr-1" />
                              Record Payment
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
