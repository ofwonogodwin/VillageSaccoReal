import { NextRequest, NextResponse } from "next/server"
import { verify } from "jsonwebtoken"
import { db } from "@/lib/db"

export async function GET(request: NextRequest) {
    try {
        const authHeader = request.headers.get("authorization")
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const token = authHeader.split(" ")[1]
        const decoded = verify(token, process.env.JWT_SECRET!) as { userId: string }

        // Verify user exists
        const user = await db.user.findUnique({
            where: { id: decoded.userId }
        })

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 })
        }

        // Get proposals with vote counts and user's vote
        const proposals = await db.proposal.findMany({
            include: {
                creator: {
                    select: {
                        firstName: true,
                        lastName: true
                    }
                },
                votes: {
                    select: {
                        vote: true,
                        userId: true
                    }
                },
                _count: {
                    select: {
                        votes: true
                    }
                }
            },
            orderBy: { createdAt: "desc" }
        })

        // Calculate vote statistics and check user's vote
        const proposalsWithStats = proposals.map((proposal: any) => {
            const votesFor = proposal.votes.filter((v: any) => v.vote === "FOR").length
            const votesAgainst = proposal.votes.filter((v: any) => v.vote === "AGAINST").length
            const userVote = proposal.votes.find((v: any) => v.userId === decoded.userId)?.vote

            // Calculate required votes (simple majority of active members)
            const requiredVotes = Math.ceil(50 * 0.5) // Assuming 50 active members for now

            return {
                id: proposal.id,
                title: proposal.title,
                description: proposal.description,
                category: proposal.category,
                status: proposal.status,
                votesFor,
                votesAgainst,
                totalVotes: proposal._count.votes,
                requiredVotes,
                createdBy: proposal.creator,
                createdAt: proposal.createdAt,
                votingDeadline: proposal.votingEndsAt,
                userVote: userVote || null
            }
        })

        return NextResponse.json(proposalsWithStats)
    } catch (error) {
        console.error("Error fetching proposals:", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}

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
            return NextResponse.json({ error: "Only approved members can create proposals" }, { status: 403 })
        }

        const { title, description, category, votingDurationDays } = await request.json()

        if (!title || !description) {
            return NextResponse.json({ error: "Title and description are required" }, { status: 400 })
        }

        // Calculate voting deadline
        const votingStartsAt = new Date()
        const votingEndsAt = new Date()
        votingEndsAt.setDate(votingEndsAt.getDate() + (votingDurationDays || 7))

        const proposal = await db.proposal.create({
            data: {
                title,
                description,
                category: category || "OTHER",
                status: "ACTIVE",
                creatorId: decoded.userId,
                votingStartsAt,
                votingEndsAt
            },
            include: {
                creator: {
                    select: {
                        firstName: true,
                        lastName: true
                    }
                }
            }
        })

        return NextResponse.json(proposal)
    } catch (error) {
        console.error("Error creating proposal:", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}
