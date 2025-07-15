import { NextRequest, NextResponse } from "next/server"
import { verify } from "jsonwebtoken"
import { db } from "@/lib/db"

export async function POST(request: NextRequest) {
    try {
        const authHeader = request.headers.get("authorization")
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const token = authHeader.split(" ")[1]
        const decoded = verify(token, process.env.JWT_SECRET!) as { userId: string }

        // Verify user exists and is active
        const user = await db.user.findUnique({
            where: { id: decoded.userId }
        })

        if (!user || user.membershipStatus !== "APPROVED") {
            return NextResponse.json({ error: "Only approved members can vote" }, { status: 403 })
        }

        const { proposalId, vote } = await request.json()

        if (!proposalId || !vote || !["FOR", "AGAINST"].includes(vote)) {
            return NextResponse.json({ error: "Invalid vote data" }, { status: 400 })
        }

        // Check if proposal exists and is active
        const proposal = await db.proposal.findUnique({
            where: { id: proposalId }
        })

        if (!proposal) {
            return NextResponse.json({ error: "Proposal not found" }, { status: 404 })
        }

        if (proposal.status !== "ACTIVE") {
            return NextResponse.json({ error: "Proposal is not active" }, { status: 400 })
        }

        // Check if voting period is still open
        const now = new Date()
        if (now > proposal.votingEndsAt) {
            return NextResponse.json({ error: "Voting period has ended" }, { status: 400 })
        }

        // Check if user has already voted
        const existingVote = await db.vote.findFirst({
            where: {
                userId: decoded.userId,
                proposalId: proposalId
            }
        })

        if (existingVote) {
            return NextResponse.json({ error: "You have already voted on this proposal" }, { status: 400 })
        }

        // Create the vote
        const newVote = await db.vote.create({
            data: {
                userId: decoded.userId,
                proposalId: proposalId,
                vote: vote
            }
        })

        // Update proposal vote counts
        const updatedCounts = await db.vote.groupBy({
            by: ["vote"],
            where: { proposalId: proposalId },
            _count: true
        })

        const votesFor = updatedCounts.find(c => c.vote === "FOR")?._count || 0
        const votesAgainst = updatedCounts.find(c => c.vote === "AGAINST")?._count || 0
        const totalVotes = votesFor + votesAgainst

        // Update proposal with new counts
        await db.proposal.update({
            where: { id: proposalId },
            data: {
                votesFor,
                votesAgainst,
                totalVotes
            }
        })

        // Check if proposal should be auto-resolved
        const requiredVotes = Math.ceil(50 * 0.5) // Assuming 50 active members
        if (totalVotes >= requiredVotes) {
            const status = votesFor > votesAgainst ? "COMPLETED" : "COMPLETED"
            await db.proposal.update({
                where: { id: proposalId },
                data: { status }
            })
        }

        return NextResponse.json({
            success: true,
            vote: newVote,
            message: "Vote recorded successfully"
        })
    } catch (error) {
        console.error("Error recording vote:", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}
