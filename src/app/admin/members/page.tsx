"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Users,
  Search,
  UserCheck,
  UserX,
  Mail,
  Phone,
  Calendar,
  Eye,
  Edit,
  Trash2,
  Filter,
  Download
} from "lucide-react"
import { formatCurrency, formatDate } from "@/lib/utils"

interface Member {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string | null
  nationalId: string | null
  status: string
  role: string
  joinedAt: string
  totalSavings: number
  totalLoans: number
  lastActivity: string | null
}

export default function MemberManagement() {
  const [user, setUser] = useState<any>(null)
  const [members, setMembers] = useState<Member[]>([])
  const [filteredMembers, setFilteredMembers] = useState<Member[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const router = useRouter()

  useEffect(() => {
    checkAdminAuth()
  }, [])

  useEffect(() => {
    filterMembers()
  }, [members, searchTerm, statusFilter])

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
      await fetchMembers(token)
    } catch (error) {
      console.error("Auth check failed:", error)
      localStorage.removeItem("token")
      router.push("/login")
    } finally {
      setIsLoading(false)
    }
  }

  const fetchMembers = async (token: string) => {
    try {
      const response = await fetch("/api/admin/members", {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (response.ok) {
        const data = await response.json()
        setMembers(data)
      }
    } catch (error) {
      console.error("Failed to fetch members:", error)
    }
  }

  const filterMembers = () => {
    let filtered = members

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(member =>
        `${member.firstName} ${member.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (member.phone && member.phone.includes(searchTerm)) ||
        (member.nationalId && member.nationalId.includes(searchTerm))
      )
    }

    // Filter by status
    if (statusFilter !== "ALL") {
      filtered = filtered.filter(member => member.status === statusFilter)
    }

    setFilteredMembers(filtered)
  }

  const handleMemberStatusChange = async (memberId: string, newStatus: string) => {
    const token = localStorage.getItem("token")
    setIsProcessing(true)

    try {
      const response = await fetch(`/api/admin/members/${memberId}/status`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ status: newStatus })
      })

      if (response.ok) {
        await fetchMembers(token!)
      }
    } catch (error) {
      console.error("Failed to update member status:", error)
    } finally {
      setIsProcessing(false)
    }
  }

  const exportMembers = () => {
    const csvContent = [
      ["Name", "Email", "Phone", "National ID", "Status", "Role", "Joined", "Total Savings", "Total Loans"],
      ...filteredMembers.map(member => [
        `${member.firstName} ${member.lastName}`,
        member.email,
        member.phone || "",
        member.nationalId || "",
        member.status,
        member.role,
        formatDate(new Date(member.joinedAt)),
        member.totalSavings.toString(),
        member.totalLoans.toString()
      ])
    ].map(row => row.join(",")).join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `members_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading members...</p>
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
                <h1 className="text-xl font-bold text-gray-900">Member Management</h1>
                <p className="text-sm text-gray-600">Manage all SACCO members</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={exportMembers}>
                <Download className="h-4 w-4 mr-1" />
                Export
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Filters and Search */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Filter className="h-5 w-5" />
              <span>Filters</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by name, email, phone, or national ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                {["ALL", "APPROVED", "PENDING", "SUSPENDED", "TERMINATED"].map((status) => (
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

        {/* Members List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>Members ({filteredMembers.length})</span>
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredMembers.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No members found</p>
                <p className="text-sm text-gray-500">Try adjusting your search or filters</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredMembers.map((member) => (
                  <div key={member.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-medium text-lg">
                            {member.firstName} {member.lastName}
                          </h3>
                          <Badge
                            variant={
                              member.status === "APPROVED" ? "default" :
                                member.status === "PENDING" ? "secondary" :
                                  "destructive"
                            }
                          >
                            {member.status}
                          </Badge>
                          <Badge variant="outline">{member.role}</Badge>
                        </div>

                        <div className="grid md:grid-cols-2 gap-2 text-sm text-gray-600">
                          <div className="flex items-center space-x-2">
                            <Mail className="h-4 w-4" />
                            <span>{member.email}</span>
                          </div>
                          {member.phone && (
                            <div className="flex items-center space-x-2">
                              <Phone className="h-4 w-4" />
                              <span>{member.phone}</span>
                            </div>
                          )}
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4" />
                            <span>Joined {formatDate(new Date(member.joinedAt))}</span>
                          </div>
                          {member.nationalId && (
                            <div className="text-xs">
                              <span>ID: {member.nationalId}</span>
                            </div>
                          )}
                        </div>

                        <div className="flex space-x-4 mt-2 text-sm">
                          <span>
                            <strong>Savings:</strong> {formatCurrency(member.totalSavings)}
                          </span>
                          <span>
                            <strong>Loans:</strong> {formatCurrency(member.totalLoans)}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col space-y-2">
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          <Button size="sm" variant="outline">
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                        </div>

                        {member.status === "PENDING" && (
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              onClick={() => handleMemberStatusChange(member.id, "APPROVED")}
                              disabled={isProcessing}
                            >
                              <UserCheck className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleMemberStatusChange(member.id, "SUSPENDED")}
                              disabled={isProcessing}
                            >
                              <UserX className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </div>
                        )}

                        {member.status === "APPROVED" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleMemberStatusChange(member.id, "SUSPENDED")}
                            disabled={isProcessing}
                          >
                            <UserX className="h-4 w-4 mr-1" />
                            Suspend
                          </Button>
                        )}

                        {member.status === "SUSPENDED" && (
                          <Button
                            size="sm"
                            onClick={() => handleMemberStatusChange(member.id, "APPROVED")}
                            disabled={isProcessing}
                          >
                            <UserCheck className="h-4 w-4 mr-1" />
                            Reactivate
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
