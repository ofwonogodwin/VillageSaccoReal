"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    FileText,
    Calendar,
    Users,
    ArrowLeft
} from "lucide-react"

export default function CreateProposal() {
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        category: "POLICY",
        votingDurationDays: 7
    })
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState("")
    const router = useRouter()

    const categories = [
        { value: "POLICY", label: "Policy Change" },
        { value: "FINANCIAL", label: "Financial Decision" },
        { value: "MEMBERSHIP", label: "Membership Rules" },
        { value: "OPERATIONAL", label: "Operational Change" },
        { value: "OTHER", label: "Other" }
    ]

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")
        setIsSubmitting(true)

        if (!formData.title.trim() || !formData.description.trim()) {
            setError("Please fill in all required fields")
            setIsSubmitting(false)
            return
        }

        const token = localStorage.getItem("token")
        if (!token) {
            router.push("/login")
            return
        }

        try {
            const response = await fetch("/api/governance/proposals", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            })

            if (response.ok) {
                router.push("/governance")
            } else {
                const errorData = await response.json()
                setError(errorData.error || "Failed to create proposal")
            }
        } catch (error) {
            setError("Failed to create proposal. Please try again.")
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: name === "votingDurationDays" ? parseInt(value) || 7 : value
        }))
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
                            onClick={() => router.push("/governance")}
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Governance
                        </Button>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900">Create New Proposal</h1>
                            <p className="text-sm text-gray-600">Submit a proposal for community voting</p>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto px-4 py-8">
                <div className="max-w-2xl mx-auto">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <FileText className="h-5 w-5 text-blue-600" />
                                <span>Proposal Details</span>
                            </CardTitle>
                            <CardDescription>
                                Provide clear and detailed information about your proposal
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {error && (
                                    <div className="bg-red-50 border border-red-200 rounded-md p-4">
                                        <p className="text-red-800 text-sm">{error}</p>
                                    </div>
                                )}

                                {/* Title */}
                                <div className="space-y-2">
                                    <Label htmlFor="title">Proposal Title *</Label>
                                    <Input
                                        id="title"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleInputChange}
                                        placeholder="Enter a clear and concise title"
                                        required
                                    />
                                </div>

                                {/* Category */}
                                <div className="space-y-2">
                                    <Label htmlFor="category">Category</Label>
                                    <select
                                        id="category"
                                        name="category"
                                        value={formData.category}
                                        onChange={handleInputChange}
                                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        {categories.map(cat => (
                                            <option key={cat.value} value={cat.value}>
                                                {cat.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Description */}
                                <div className="space-y-2">
                                    <Label htmlFor="description">Description *</Label>
                                    <textarea
                                        id="description"
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        rows={6}
                                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Provide a detailed description of your proposal, including the rationale and expected impact..."
                                        required
                                    />
                                </div>

                                {/* Voting Duration */}
                                <div className="space-y-2">
                                    <Label htmlFor="votingDurationDays">Voting Duration (Days)</Label>
                                    <Input
                                        id="votingDurationDays"
                                        name="votingDurationDays"
                                        type="number"
                                        min="1"
                                        max="30"
                                        value={formData.votingDurationDays}
                                        onChange={handleInputChange}
                                    />
                                    <p className="text-xs text-gray-600">
                                        How many days should members have to vote on this proposal?
                                    </p>
                                </div>

                                {/* Info Box */}
                                <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                                    <div className="flex items-start space-x-3">
                                        <Users className="h-5 w-5 text-blue-600 mt-0.5" />
                                        <div className="text-sm">
                                            <h4 className="font-medium text-blue-900 mb-1">Voting Requirements</h4>
                                            <ul className="text-blue-800 space-y-1">
                                                <li>• Minimum 50% of active members must vote</li>
                                                <li>• Simple majority (&gt;50%) needed for approval</li>
                                                <li>• Admin review required for implementation</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>

                                {/* Submit Button */}
                                <div className="flex justify-end space-x-3">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => router.push("/governance")}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                Creating...
                                            </>
                                        ) : (
                                            <>
                                                <FileText className="h-4 w-4 mr-2" />
                                                Create Proposal
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    )
}
