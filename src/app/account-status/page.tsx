"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { NotificationBanner } from "@/components/ui/notification-banner"
import { CheckCircle, Clock, XCircle, AlertTriangle, ArrowLeft } from "lucide-react"

interface UserData {
    id: string
    firstName: string
    lastName: string
    email: string
    membershipNumber: string | null
    role: string
    membershipStatus: string
    joinedAt: string
    approvedAt?: string
}

export default function AccountStatusPage() {
    const [user, setUser] = useState<UserData | null>(null)
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
            const response = await fetch("/api/user/profile", {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })

            if (!response.ok) {
                throw new Error("Authentication failed")
            }

            const userData = await response.json()
            setUser(userData)
        } catch (error) {
            console.error("Auth check failed:", error)
            localStorage.removeItem("token")
            router.push("/login")
        } finally {
            setIsLoading(false)
        }
    }

    const getStatusInfo = (status: string) => {
        switch (status) {
            case 'PENDING':
                return {
                    icon: Clock,
                    color: 'text-orange-600',
                    bgColor: 'bg-orange-100',
                    title: 'Pending Approval',
                    description: 'Your registration is under review'
                }
            case 'APPROVED':
                return {
                    icon: CheckCircle,
                    color: 'text-green-600',
                    bgColor: 'bg-green-100',
                    title: 'Approved',
                    description: 'Your account is fully activated'
                }
            case 'SUSPENDED':
                return {
                    icon: XCircle,
                    color: 'text-red-600',
                    bgColor: 'bg-red-100',
                    title: 'Suspended',
                    description: 'Your account has been temporarily suspended'
                }
            default:
                return {
                    icon: AlertTriangle,
                    color: 'text-gray-600',
                    bgColor: 'bg-gray-100',
                    title: 'Unknown Status',
                    description: 'Contact support for assistance'
                }
        }
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading account status...</p>
                </div>
            </div>
        )
    }

    if (!user) return null

    const statusInfo = getStatusInfo(user.membershipStatus)
    const StatusIcon = statusInfo.icon

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4">
                {/* Header */}
                <div className="mb-8">
                    <Button
                        variant="ghost"
                        onClick={() => router.back()}
                        className="mb-4"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back
                    </Button>
                    <h1 className="text-3xl font-bold text-gray-900">Account Status</h1>
                    <p className="text-gray-600 mt-2">View your current membership status and account details</p>
                </div>

                {/* Status Card */}
                <Card className="mb-8">
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <div className={`p-2 rounded-full ${statusInfo.bgColor} mr-3`}>
                                <StatusIcon className={`h-6 w-6 ${statusInfo.color}`} />
                            </div>
                            Membership Status: {statusInfo.title}
                        </CardTitle>
                        <CardDescription>{statusInfo.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h3 className="font-medium text-gray-900 mb-2">Personal Information</h3>
                                <div className="space-y-2 text-sm">
                                    <p><span className="font-medium">Name:</span> {user.firstName} {user.lastName}</p>
                                    <p><span className="font-medium">Email:</span> {user.email}</p>
                                    <p><span className="font-medium">Member ID:</span> {user.membershipNumber || 'Not assigned'}</p>
                                    <p><span className="font-medium">Role:</span> {user.role}</p>
                                </div>
                            </div>
                            <div>
                                <h3 className="font-medium text-gray-900 mb-2">Account Timeline</h3>
                                <div className="space-y-2 text-sm">
                                    <p><span className="font-medium">Registered:</span> {new Date(user.joinedAt).toLocaleDateString()}</p>
                                    {user.approvedAt && (
                                        <p><span className="font-medium">Approved:</span> {new Date(user.approvedAt).toLocaleDateString()}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Status-specific notifications */}
                {user.membershipStatus === 'PENDING' && (
                    <NotificationBanner
                        type="pending"
                        title="Registration Under Review"
                        message="Your registration is currently being reviewed by our administrators. This process typically takes up to 24 hours. You will receive an email notification once your account is approved and ready to use. Thank you for your patience!"
                        className="mb-6"
                    />
                )}

                {user.membershipStatus === 'APPROVED' && (
                    <NotificationBanner
                        type="success"
                        title="Account Active"
                        message="Congratulations! Your account has been approved and is fully active. You now have access to all SACCO services including savings, loans, and governance features."
                        className="mb-6"
                    />
                )}

                {user.membershipStatus === 'SUSPENDED' && (
                    <NotificationBanner
                        type="warning"
                        title="Account Suspended"
                        message="Your account has been temporarily suspended. Please contact our support team for more information about reactivating your account."
                        className="mb-6"
                    />
                )}

                {/* Information Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Approval Process</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3 text-sm">
                                <div className="flex items-center">
                                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                                    <span>Registration submitted</span>
                                </div>
                                <div className="flex items-center">
                                    <div className={`w-2 h-2 rounded-full mr-3 ${user.membershipStatus === 'PENDING' ? 'bg-orange-500' : 'bg-green-500'
                                        }`}></div>
                                    <span>Admin review (up to 24 hours)</span>
                                </div>
                                <div className="flex items-center">
                                    <div className={`w-2 h-2 rounded-full mr-3 ${user.membershipStatus === 'APPROVED' ? 'bg-green-500' : 'bg-gray-300'
                                        }`}></div>
                                    <span>Account activation</span>
                                </div>
                                <div className="flex items-center">
                                    <div className={`w-2 h-2 rounded-full mr-3 ${user.membershipStatus === 'APPROVED' ? 'bg-green-500' : 'bg-gray-300'
                                        }`}></div>
                                    <span>Full access to SACCO services</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Need Help?</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3 text-sm">
                                <p>If you have questions about your account status or the approval process:</p>
                                <ul className="space-y-2">
                                    <li>• Check this page for status updates</li>
                                    <li>• Watch your email for notifications</li>
                                    <li>• Contact our support team</li>
                                    <li>• Visit our help center</li>
                                </ul>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
