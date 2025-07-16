import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(request: NextRequest) {
    try {
        // Test database connection
        console.log("Testing database connection...")
        
        // Try a simple query
        const userCount = await db.user.count()
        console.log("Database connection successful. User count:", userCount)
        
        // Check environment variables
        const envCheck = {
            DATABASE_URL: !!process.env.DATABASE_URL,
            JWT_SECRET: !!process.env.JWT_SECRET,
            NODE_ENV: process.env.NODE_ENV
        }
        
        return NextResponse.json({
            status: "healthy",
            database: {
                connected: true,
                userCount
            },
            environment: envCheck,
            timestamp: new Date().toISOString()
        })
        
    } catch (error) {
        console.error("Health check failed:", error)
        
        return NextResponse.json({
            status: "unhealthy",
            error: error instanceof Error ? error.message : "Unknown error",
            environment: {
                DATABASE_URL: !!process.env.DATABASE_URL,
                JWT_SECRET: !!process.env.JWT_SECRET,
                NODE_ENV: process.env.NODE_ENV
            },
            timestamp: new Date().toISOString()
        }, { status: 500 })
    }
}
