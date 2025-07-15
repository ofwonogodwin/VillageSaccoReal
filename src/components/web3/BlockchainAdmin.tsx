"use client"

import { useState } from "react"
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Shield, Users, DollarSign, CheckCircle, XCircle, AlertTriangle, Settings } from "lucide-react"
import { CONTRACT_ABI, getContractAddress } from "@/lib/web3"
import { formatEther, parseEther, isAddress } from "viem"

export function BlockchainAdmin() {
    const { address, isConnected, chainId } = useAccount()
    const [memberAddress, setMemberAddress] = useState("")
    const [withdrawAmount, setWithdrawAmount] = useState("")
    const [interestRate, setInterestRate] = useState("")
    const [isLoading, setIsLoading] = useState(false)

    const contractAddress = getContractAddress(chainId || 11155111)

    // Contract read operations
    const { data: totalStats } = useReadContract({
        address: contractAddress as `0x${string}`,
        abi: CONTRACT_ABI,
        functionName: 'getTotalStats',
        query: {
            enabled: !!contractAddress && isConnected
        }
    })

    const { data: currentInterestRate } = useReadContract({
        address: contractAddress as `0x${string}`,
        abi: CONTRACT_ABI,
        functionName: 'interestRate',
        query: {
            enabled: !!contractAddress && isConnected
        }
    })

    const { data: isAdmin } = useReadContract({
        address: contractAddress as `0x${string}`,
        abi: CONTRACT_ABI,
        functionName: 'isAdmin',
        args: address ? [address] : undefined,
        query: {
            enabled: !!address && !!contractAddress && isConnected
        }
    })

    // Contract write operations
    const { writeContract, data: hash, isPending, error } = useWriteContract()

    const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
        hash,
    })

    const registerMember = async () => {
        if (!memberAddress || !isAddress(memberAddress)) {
            alert("Please enter a valid Ethereum address")
            return
        }

        try {
            setIsLoading(true)
            writeContract({
                address: contractAddress as `0x${string}`,
                abi: CONTRACT_ABI,
                functionName: 'registerMember',
                args: [memberAddress as `0x${string}`, `member_${Date.now()}`],
            })
        } catch (error) {
            console.error("Error registering member:", error)
            alert("Failed to register member")
        } finally {
            setIsLoading(false)
        }
    }

    const removeMember = async () => {
        if (!memberAddress || !isAddress(memberAddress)) {
            alert("Please enter a valid Ethereum address")
            return
        }

        try {
            setIsLoading(true)
            writeContract({
                address: contractAddress as `0x${string}`,
                abi: CONTRACT_ABI,
                functionName: 'deactivateMember',
                args: [memberAddress as `0x${string}`],
            })
        } catch (error) {
            console.error("Error removing member:", error)
            alert("Failed to remove member")
        } finally {
            setIsLoading(false)
        }
    }

    const withdrawFunds = async () => {
        if (!withdrawAmount) {
            alert("Please enter withdrawal amount")
            return
        }

        try {
            setIsLoading(true)
            writeContract({
                address: contractAddress as `0x${string}`,
                abi: CONTRACT_ABI,
                functionName: 'adminWithdraw',
                args: [parseEther(withdrawAmount)],
            })
        } catch (error) {
            console.error("Error withdrawing funds:", error)
            alert("Failed to withdraw funds")
        } finally {
            setIsLoading(false)
        }
    }

    const updateInterestRate = async () => {
        if (!interestRate) {
            alert("Please enter interest rate")
            return
        }

        try {
            setIsLoading(true)
            writeContract({
                address: contractAddress as `0x${string}`,
                abi: CONTRACT_ABI,
                functionName: 'setInterestRate',
                args: [BigInt(parseInt(interestRate))],
            })
        } catch (error) {
            console.error("Error updating interest rate:", error)
            alert("Failed to update interest rate")
        } finally {
            setIsLoading(false)
        }
    }

    const distributeInterest = async () => {
        try {
            setIsLoading(true)
            writeContract({
                address: contractAddress as `0x${string}`,
                abi: CONTRACT_ABI,
                functionName: 'distributeInterest',
            })
        } catch (error) {
            console.error("Error distributing interest:", error)
            alert("Failed to distribute interest")
        } finally {
            setIsLoading(false)
        }
    }

    if (!isConnected) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <Shield className="h-5 w-5" />
                        <span>Blockchain Admin</span>
                    </CardTitle>
                    <CardDescription>
                        Connect your wallet to access admin functions
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-gray-600">Please connect your admin wallet to manage blockchain operations.</p>
                </CardContent>
            </Card>
        )
    }

    if (!isAdmin) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <AlertTriangle className="h-5 w-5 text-orange-500" />
                        <span>Admin Access Required</span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-gray-600">You don't have admin privileges for this smart contract.</p>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="space-y-6">
            {/* Contract Overview */}
            <div className="grid md:grid-cols-3 gap-4">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center space-x-2">
                            <DollarSign className="h-8 w-8 text-green-600" />
                            <div>
                                <p className="text-sm text-gray-600">Contract Balance</p>
                                <p className="text-2xl font-bold">
                                    {totalStats ? formatEther(totalStats[3]) : "0"} ETH
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
                                <p className="text-sm text-gray-600">Total Members</p>
                                <p className="text-2xl font-bold">
                                    {totalStats ? totalStats[2].toString() : "0"}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center space-x-2">
                            <Settings className="h-8 w-8 text-purple-600" />
                            <div>
                                <p className="text-sm text-gray-600">Interest Rate</p>
                                <p className="text-2xl font-bold">
                                    {currentInterestRate ? `${Number(currentInterestRate) / 100}%` : "0%"}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Member Management */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <Users className="h-5 w-5" />
                        <span>Member Management</span>
                    </CardTitle>
                    <CardDescription>
                        Register or remove members from the blockchain
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="memberAddress">Member Wallet Address</Label>
                        <Input
                            id="memberAddress"
                            placeholder="0x..."
                            value={memberAddress}
                            onChange={(e) => setMemberAddress(e.target.value)}
                        />
                    </div>
                    <div className="flex space-x-2">
                        <Button
                            onClick={registerMember}
                            disabled={isLoading || isPending || !memberAddress}
                            className="flex-1"
                        >
                            {isLoading || isPending ? "Processing..." : "Register Member"}
                        </Button>
                        <Button
                            onClick={removeMember}
                            disabled={isLoading || isPending || !memberAddress}
                            variant="destructive"
                            className="flex-1"
                        >
                            {isLoading || isPending ? "Processing..." : "Remove Member"}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Financial Management */}
            <div className="grid md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <DollarSign className="h-5 w-5" />
                            <span>Fund Management</span>
                        </CardTitle>
                        <CardDescription>
                            Withdraw funds from the contract
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="withdrawAmount">Amount (ETH)</Label>
                            <Input
                                id="withdrawAmount"
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                value={withdrawAmount}
                                onChange={(e) => setWithdrawAmount(e.target.value)}
                            />
                        </div>
                        <Button
                            onClick={withdrawFunds}
                            disabled={isLoading || isPending || !withdrawAmount}
                            className="w-full"
                        >
                            {isLoading || isPending ? "Processing..." : "Withdraw Funds"}
                        </Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <Settings className="h-5 w-5" />
                            <span>Interest Management</span>
                        </CardTitle>
                        <CardDescription>
                            Update interest rates and distribute interest
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="interestRate">Interest Rate (%)</Label>
                            <Input
                                id="interestRate"
                                type="number"
                                placeholder="5"
                                value={interestRate}
                                onChange={(e) => setInterestRate(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Button
                                onClick={updateInterestRate}
                                disabled={isLoading || isPending || !interestRate}
                                className="w-full"
                            >
                                {isLoading || isPending ? "Processing..." : "Update Interest Rate"}
                            </Button>
                            <Button
                                onClick={distributeInterest}
                                disabled={isLoading || isPending}
                                variant="outline"
                                className="w-full"
                            >
                                {isLoading || isPending ? "Processing..." : "Distribute Interest"}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Smart Contract Information */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <Shield className="h-5 w-5" />
                        <span>Smart Contract Info</span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <span className="text-sm font-medium">Contract Address:</span>
                            <span className="text-sm text-gray-600 font-mono">{contractAddress}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm font-medium">Network:</span>
                            <span className="text-sm text-gray-600">Ethereum Testnet</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm font-medium">Admin Address:</span>
                            <span className="text-sm text-gray-600 font-mono">
                                {address?.slice(0, 6)}...{address?.slice(-4)}
                            </span>
                        </div>
                    </div>
                </CardContent>
            </Card>

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

            {error && (
                <Card>
                    <CardContent className="py-4">
                        <div className="flex items-center space-x-2 text-red-600">
                            <XCircle className="h-4 w-4" />
                            <span className="text-sm">Error: {error.message}</span>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
