"use client"

import { useState, useEffect } from "react"
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Vote, Plus, Clock, CheckCircle, XCircle, AlertTriangle, Users } from "lucide-react"
import { CONTRACT_ABI, getContractAddress } from "@/lib/web3"
import { formatEther, parseEther } from "viem"

interface Proposal {
    id: number
    title: string
    description: string
    proposer: string
    votesFor: bigint
    votesAgainst: bigint
    deadline: number
    executed: boolean
    exists: boolean
}

export function BlockchainGovernance() {
    const { address, isConnected, chainId } = useAccount()
    const [proposals, setProposals] = useState<Proposal[]>([])
    const [newProposal, setNewProposal] = useState({ title: "", description: "" })
    const [selectedProposal, setSelectedProposal] = useState<number | null>(null)
    const [isLoading, setIsLoading] = useState(false)

    const contractAddress = getContractAddress(chainId || 11155111)

    // Contract interaction hooks
    const { data: proposalCount } = useReadContract({
        address: contractAddress as `0x${string}`,
        abi: CONTRACT_ABI,
        functionName: 'nextProposalId',
        query: {
            enabled: !!contractAddress && isConnected
        }
    })

    const { data: isMember } = useReadContract({
        address: contractAddress as `0x${string}`,
        abi: CONTRACT_ABI,
        functionName: 'isMember',
        args: address ? [address] : undefined,
        query: {
            enabled: !!address && !!contractAddress && isConnected
        }
    })

    const { writeContract, data: hash, isPending, error } = useWriteContract()

    const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
        hash,
    })

    // Load proposals
    useEffect(() => {
        if (proposalCount && Number(proposalCount) > 0) {
            loadProposals()
        }
    }, [proposalCount])

    const loadProposals = async () => {
        if (!proposalCount) return

        const proposalsData: Proposal[] = []
        for (let i = 1; i <= Number(proposalCount); i++) {
            try {
                // This would require a getProposal function in the smart contract
                // For now, we'll create mock data
                proposalsData.push({
                    id: i,
                    title: `Proposal ${i}`,
                    description: `This is proposal number ${i} for SACCO governance`,
                    proposer: "0x742d35Cc6634C0532925a3b8D295759aADF1bB21",
                    votesFor: parseEther("50"),
                    votesAgainst: parseEther("20"),
                    deadline: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days from now
                    executed: false,
                    exists: true
                })
            } catch (error) {
                console.error(`Error loading proposal ${i}:`, error)
            }
        }
        setProposals(proposalsData)
    }

    const createProposal = async () => {
        if (!newProposal.title || !newProposal.description) {
            alert("Please fill in all fields")
            return
        }

        try {
            setIsLoading(true)

            // Note: This assumes a createProposal function exists in the smart contract
            writeContract({
                address: contractAddress as `0x${string}`,
                abi: CONTRACT_ABI,
                functionName: 'createProposal',
                args: [newProposal.title, newProposal.description, BigInt(7 * 24 * 60 * 60)], // 7 days voting period
            })

            setNewProposal({ title: "", description: "" })
        } catch (error) {
            console.error("Error creating proposal:", error)
            alert("Failed to create proposal")
        } finally {
            setIsLoading(false)
        }
    }

    const vote = async (proposalId: number, support: boolean) => {
        try {
            setIsLoading(true)

            writeContract({
                address: contractAddress as `0x${string}`,
                abi: CONTRACT_ABI,
                functionName: 'vote',
                args: [BigInt(proposalId), support],
            })
        } catch (error) {
            console.error("Error voting:", error)
            alert("Failed to vote")
        } finally {
            setIsLoading(false)
        }
    }

    const executeProposal = async (proposalId: number) => {
        try {
            setIsLoading(true)

            writeContract({
                address: contractAddress as `0x${string}`,
                abi: CONTRACT_ABI,
                functionName: 'executeProposal',
                args: [BigInt(proposalId)],
            })
        } catch (error) {
            console.error("Error executing proposal:", error)
            alert("Failed to execute proposal")
        } finally {
            setIsLoading(false)
        }
    }

    const getProposalStatus = (proposal: Proposal) => {
        const now = Date.now()
        if (proposal.executed) return "executed"
        if (now > proposal.deadline) return "expired"
        return "active"
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "active":
                return <Badge className="bg-green-100 text-green-800">Active</Badge>
            case "executed":
                return <Badge className="bg-blue-100 text-blue-800">Executed</Badge>
            case "expired":
                return <Badge className="bg-red-100 text-red-800">Expired</Badge>
            default:
                return <Badge variant="secondary">Unknown</Badge>
        }
    }

    if (!isConnected) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <Vote className="h-5 w-5" />
                        <span>Blockchain Governance</span>
                    </CardTitle>
                    <CardDescription>
                        Connect your wallet to participate in SACCO governance
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-gray-600">Please connect your wallet to view and participate in governance proposals.</p>
                </CardContent>
            </Card>
        )
    }

    if (!isMember) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <AlertTriangle className="h-5 w-5 text-orange-500" />
                        <span>Member Access Required</span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-gray-600">You must be a registered SACCO member to participate in governance.</p>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="space-y-6">
            {/* Create Proposal */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <Plus className="h-5 w-5" />
                        <span>Create Proposal</span>
                    </CardTitle>
                    <CardDescription>
                        Submit a new proposal for SACCO governance
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="title">Proposal Title</Label>
                        <Input
                            id="title"
                            placeholder="Enter proposal title"
                            value={newProposal.title}
                            onChange={(e) => setNewProposal({ ...newProposal, title: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <textarea
                            id="description"
                            className="w-full min-h-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Describe your proposal in detail"
                            value={newProposal.description}
                            onChange={(e) => setNewProposal({ ...newProposal, description: e.target.value })}
                        />
                    </div>
                    <Button
                        onClick={createProposal}
                        disabled={isLoading || isPending || !newProposal.title || !newProposal.description}
                        className="w-full"
                    >
                        {isLoading || isPending ? "Creating..." : "Create Proposal"}
                    </Button>
                    {error && (
                        <p className="text-red-600 text-sm">Error: {error.message}</p>
                    )}
                </CardContent>
            </Card>

            {/* Governance Stats */}
            <div className="grid md:grid-cols-3 gap-4">
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
                                <p className="text-sm text-gray-600">Active Proposals</p>
                                <p className="text-2xl font-bold">
                                    {proposals.filter(p => getProposalStatus(p) === "active").length}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center space-x-2">
                            <CheckCircle className="h-8 w-8 text-green-600" />
                            <div>
                                <p className="text-sm text-gray-600">Executed</p>
                                <p className="text-2xl font-bold">
                                    {proposals.filter(p => p.executed).length}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Proposals List */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold">Active Proposals</h3>
                {proposals.length === 0 ? (
                    <Card>
                        <CardContent className="py-8 text-center">
                            <Vote className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No Proposals Yet</h3>
                            <p className="text-gray-600">Be the first to create a proposal for SACCO governance</p>
                        </CardContent>
                    </Card>
                ) : (
                    proposals.map((proposal) => {
                        const status = getProposalStatus(proposal)
                        const totalVotes = proposal.votesFor + proposal.votesAgainst
                        const forPercentage = totalVotes > 0 ? Number((proposal.votesFor * 100n) / totalVotes) : 0
                        const againstPercentage = totalVotes > 0 ? Number((proposal.votesAgainst * 100n) / totalVotes) : 0

                        return (
                            <Card key={proposal.id}>
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <CardTitle className="text-base">{proposal.title}</CardTitle>
                                            <CardDescription>
                                                Proposed by {proposal.proposer.slice(0, 6)}...{proposal.proposer.slice(-4)}
                                            </CardDescription>
                                        </div>
                                        {getStatusBadge(status)}
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <p className="text-sm text-gray-700">{proposal.description}</p>

                                    {/* Voting Results */}
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span>For: {formatEther(proposal.votesFor)} ETH ({forPercentage}%)</span>
                                            <span>Against: {formatEther(proposal.votesAgainst)} ETH ({againstPercentage}%)</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-green-600 h-2 rounded-l-full"
                                                style={{ width: `${forPercentage}%` }}
                                            ></div>
                                        </div>
                                    </div>

                                    {/* Voting Buttons */}
                                    {status === "active" && (
                                        <div className="flex space-x-2">
                                            <Button
                                                onClick={() => vote(proposal.id, true)}
                                                disabled={isLoading || isPending}
                                                className="flex-1 bg-green-600 hover:bg-green-700"
                                            >
                                                <CheckCircle className="h-4 w-4 mr-2" />
                                                Vote For
                                            </Button>
                                            <Button
                                                onClick={() => vote(proposal.id, false)}
                                                disabled={isLoading || isPending}
                                                variant="outline"
                                                className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
                                            >
                                                <XCircle className="h-4 w-4 mr-2" />
                                                Vote Against
                                            </Button>
                                        </div>
                                    )}

                                    {/* Execute Button (for admins or when conditions are met) */}
                                    {status === "expired" && !proposal.executed && proposal.votesFor > proposal.votesAgainst && (
                                        <Button
                                            onClick={() => executeProposal(proposal.id)}
                                            disabled={isLoading || isPending}
                                            className="w-full"
                                        >
                                            Execute Proposal
                                        </Button>
                                    )}

                                    {/* Deadline Info */}
                                    <div className="text-xs text-gray-500">
                                        Deadline: {new Date(proposal.deadline).toLocaleDateString()}
                                    </div>
                                </CardContent>
                            </Card>
                        )
                    })
                )}
            </div>

            {/* Transaction Status */}
            {(isPending || isConfirming) && (
                <Card>
                    <CardContent className="py-4">
                        <div className="flex items-center space-x-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                            <span className="text-sm">
                                {isPending ? "Confirming transaction..." : "Waiting for confirmation..."}
                            </span>
                        </div>
                    </CardContent>
                </Card>
            )}

            {isConfirmed && (
                <Card>
                    <CardContent className="py-4">
                        <div className="flex items-center space-x-2 text-green-600">
                            <CheckCircle className="h-4 w-4" />
                            <span className="text-sm">Transaction confirmed!</span>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
