"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    Vote,
    Plus,
    CheckCircle,
    XCircle,
    Clock,
    Users,
    Calendar,
    FileText,
    ThumbsUp,
    ThumbsDown,
    BarChart3,
    Shield
} from "lucide-react"
import { formatDate } from "@/lib/utils"
import { WalletConnection } from "@/components/web3/WalletConnection"
import { BlockchainGovernance } from "@/components/web3/BlockchainGovernance"

interface Proposal {
    id: string
    title: string
    description: string
    category: string
    status: string
    votesFor: number
    votesAgainst: number
    totalVotes: number
    requiredVotes: number
    createdBy: {
        firstName: string
        lastName: string
    }
    createdAt: string
    votingDeadline: string
    userVote?: string
}

export default function GovernancePage() {
    const [user, setUser] = useState<any>(null)
    const [proposals, setProposals] = useState<Proposal[]>([])
    const [activeProposals, setActiveProposals] = useState<Proposal[]>([])
    const [completedProposals, setCompletedProposals] = useState<Proposal[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isVoting, setIsVoting] = useState(false)
    const router = useRouter()

    useEffect(() => {
        checkAuth()
    }, [])

    useEffect(() => {
        if (proposals.length > 0) {
            setActiveProposals(proposals.filter(p => p.status === "ACTIVE"))
            setCompletedProposals(proposals.filter(p => ["APPROVED", "REJECTED", "EXPIRED"].includes(p.status)))
        }
    }, [proposals])

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
            await fetchProposals(token)
        } catch (error) {
            console.error("Auth check failed:", error)
            localStorage.removeItem("token")
            router.push("/login")
        } finally {
            setIsLoading(false)
        }
    }

    const fetchProposals = async (token: string) => {
        try {
            const response = await fetch("/api/governance/proposals", {
                headers: { Authorization: `Bearer ${token}` }
            })
            if (response.ok) {
                const data = await response.json()
                setProposals(data)
            }
        } catch (error) {
            console.error("Failed to fetch proposals:", error)
        }
    }

    const handleVote = async (proposalId: string, vote: 'FOR' | 'AGAINST') => {
        const token = localStorage.getItem("token")
        setIsVoting(true)

        try {
            const response = await fetch("/api/governance/vote", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    proposalId,
                    vote
                })
            })

            if (response.ok) {
                await fetchProposals(token!)
            }
        } catch (error) {
            console.error("Failed to vote:", error)
        } finally {
            setIsVoting(false)
        }
    }

    const getStatusBadge = (proposal: Proposal) => {
        switch (proposal.status) {
            case "ACTIVE":
                return <Badge variant="secondary">Active</Badge>
            case "APPROVED":
                return <Badge variant="default">Approved</Badge>
            case "REJECTED":
                return <Badge variant="destructive">Rejected</Badge>
            case "EXPIRED":
                return <Badge variant="outline">Expired</Badge>
            default:
                return <Badge variant="outline">{proposal.status}</Badge>
        }
    }

    const getVoteProgress = (proposal: Proposal) => {
        const percentage = proposal.requiredVotes > 0
            ? (proposal.totalVotes / proposal.requiredVotes) * 100
            : 0
        return Math.min(percentage, 100)
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading governance...</p>
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
                                <h1 className="text-xl font-bold text-gray-900">Governance</h1>
                                <p className="text-sm text-gray-600">Participate in SACCO decision-making</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            <WalletConnection />
                            <Button onClick={() => router.push("/governance/create")}>
                                <Plus className="h-4 w-4 mr-2" />
                                New Proposal
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
                            <Vote className="h-4 w-4" />
                            <span>Traditional Governance</span>
                        </TabsTrigger>
                        <TabsTrigger value="blockchain" className="flex items-center space-x-2">
                            <Shield className="h-4 w-4" />
                            <span>Blockchain Governance</span>
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="traditional" className="space-y-6">
                        {/* Stats */}
                        <div className="grid md:grid-cols-4 gap-6">
                            <Card>
                                <CardContent className="p-6">
                                    <div className="flex items-center space-x-2">
                                        <Vote className="h-8 w-8 text-blue-600" />
                                        <div>
                                            <p className="text-sm text-gray-600">Total Proposals</p>
                                            <p className="text-2xl font-bold">{proposals.length}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="p-6">
                                    <div className="flex items-center space-x-2">
                                        <Clock className="h-8 w-8 text-orange-600" />
                                        <div>
                                            <p className="text-sm text-gray-600">Active Votes</p>
                                            <p className="text-2xl font-bold">{activeProposals.length}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="p-6">
                                    <div className="flex items-center space-x-2">
                                        <CheckCircle className="h-8 w-8 text-green-600" />
                                        <div>
                                            <p className="text-sm text-gray-600">Approved</p>
                                            <p className="text-2xl font-bold">
                                                {completedProposals.filter(p => p.status === "APPROVED").length}
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="p-6">
                                    <div className="flex items-center space-x-2">
                                        <Users className="h-8 w-8 text-purple-600" />
                                        <div>
                                            <p className="text-sm text-gray-600">Participation</p>
                                            <p className="text-2xl font-bold">
                                                {activeProposals.length > 0
                                                    ? Math.round(activeProposals.reduce((sum, p) => sum + p.totalVotes, 0) / activeProposals.length)
                                                    : 0
                                                }
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Proposals Tabs */}
                        <Tabs defaultValue="active" className="space-y-6">
                            <TabsList>
                                <TabsTrigger value="active">
                                    Active Proposals ({activeProposals.length})
                                </TabsTrigger>
                                <TabsTrigger value="completed">
                                    Completed ({completedProposals.length})
                                </TabsTrigger>
                            </TabsList>

                            {/* Active Proposals */}
                            <TabsContent value="active">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Active Proposals</CardTitle>
                                        <CardDescription>Vote on current proposals</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        {activeProposals.length === 0 ? (
                                            <div className="text-center py-12">
                                                <Vote className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                                                <p className="text-gray-600">No active proposals</p>
                                                <Button
                                                    className="mt-4"
                                                    onClick={() => router.push("/governance/create")}
                                                >
                                                    Create First Proposal
                                                </Button>
                                            </div>
                                        ) : (
                                            <div className="space-y-6">
                                                {activeProposals.map((proposal) => (
                                                    <div key={proposal.id} className="border rounded-lg p-6">
                                                        <div className="flex justify-between items-start mb-4">
                                                            <div className="flex-1">
                                                                <div className="flex items-center space-x-3 mb-2">
                                                                    <h3 className="text-lg font-medium">{proposal.title}</h3>
                                                                    {getStatusBadge(proposal)}
                                                                    <Badge variant="outline">{proposal.category}</Badge>
                                                                </div>
                                                                <p className="text-gray-600 mb-4">{proposal.description}</p>

                                                                <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
                                                                    <div>
                                                                        <strong>Created by:</strong> {proposal.createdBy.firstName} {proposal.createdBy.lastName}
                                                                    </div>
                                                                    <div>
                                                                        <strong>Deadline:</strong> {formatDate(new Date(proposal.votingDeadline))}
                                                                    </div>
                                                                    <div>
                                                                        <strong>Required Votes:</strong> {proposal.requiredVotes}
                                                                    </div>
                                                                    <div>
                                                                        <strong>Current Votes:</strong> {proposal.totalVotes}
                                                                    </div>
                                                                </div>

                                                                {/* Vote Progress */}
                                                                <div className="mb-4">
                                                                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                                                                        <span>Voting Progress</span>
                                                                        <span>{proposal.totalVotes}/{proposal.requiredVotes}</span>
                                                                    </div>
                                                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                                                        <div
                                                                            className="bg-blue-600 h-2 rounded-full"
                                                                            style={{ width: `${getVoteProgress(proposal)}%` }}
                                                                        ></div>
                                                                    </div>
                                                                </div>

                                                                {/* Vote Results */}
                                                                <div className="flex space-x-6 mb-4">
                                                                    <div className="flex items-center space-x-2">
                                                                        <ThumbsUp className="h-4 w-4 text-green-600" />
                                                                        <span className="text-green-600 font-medium">
                                                                            For: {proposal.votesFor}
                                                                        </span>
                                                                    </div>
                                                                    <div className="flex items-center space-x-2">
                                                                        <ThumbsDown className="h-4 w-4 text-red-600" />
                                                                        <span className="text-red-600 font-medium">
                                                                            Against: {proposal.votesAgainst}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Voting Buttons */}
                                                        {!proposal.userVote ? (
                                                            <div className="flex space-x-3">
                                                                <Button
                                                                    onClick={() => handleVote(proposal.id, "FOR")}
                                                                    disabled={isVoting}
                                                                    className="bg-green-600 hover:bg-green-700"
                                                                >
                                                                    <ThumbsUp className="h-4 w-4 mr-2" />
                                                                    Vote For
                                                                </Button>
                                                                <Button
                                                                    variant="outline"
                                                                    onClick={() => handleVote(proposal.id, "AGAINST")}
                                                                    disabled={isVoting}
                                                                >
                                                                    <ThumbsDown className="h-4 w-4 mr-2" />
                                                                    Vote Against
                                                                </Button>
                                                            </div>
                                                        ) : (
                                                            <div className="flex items-center space-x-2">
                                                                <Badge variant={proposal.userVote === "FOR" ? "default" : "destructive"}>
                                                                    You voted: {proposal.userVote}
                                                                </Badge>
                                                                <span className="text-sm text-gray-600">
                                                                    Your vote has been recorded
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Completed Proposals */}
                            <TabsContent value="completed">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Completed Proposals</CardTitle>
                                        <CardDescription>History of past votes and decisions</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        {completedProposals.length === 0 ? (
                                            <div className="text-center py-12">
                                                <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                                                <p className="text-gray-600">No completed proposals</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                {completedProposals.map((proposal) => (
                                                    <div key={proposal.id} className="border rounded-lg p-4">
                                                        <div className="flex justify-between items-start">
                                                            <div className="flex-1">
                                                                <div className="flex items-center space-x-3 mb-2">
                                                                    <h4 className="font-medium">{proposal.title}</h4>
                                                                    {getStatusBadge(proposal)}
                                                                    <Badge variant="outline">{proposal.category}</Badge>
                                                                </div>
                                                                <p className="text-sm text-gray-600 mb-2">{proposal.description}</p>

                                                                <div className="flex space-x-6 text-sm">
                                                                    <span>For: {proposal.votesFor}</span>
                                                                    <span>Against: {proposal.votesAgainst}</span>
                                                                    <span>Total: {proposal.totalVotes}</span>
                                                                    <span>Created: {formatDate(new Date(proposal.createdAt))}</span>
                                                                </div>
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
                    </TabsContent>

                    <TabsContent value="blockchain" className="space-y-6">
                        <BlockchainGovernance />
                    </TabsContent>
                </Tabs>
            </main>
        </div>
    )
}
