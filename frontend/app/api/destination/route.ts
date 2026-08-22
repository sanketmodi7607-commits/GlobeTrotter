import { NextResponse } from "next/server";
// Import your database connection pool/client (e.g., pg)
import pool from "@/lib/db"; 

export async function GET() {
  try {
    // Query your cities table from the database
    const result = await pool.query("SELECT * FROM cities ORDER BY id ASC");
    
    return NextResponse.json({ destinations: result.rows }, { status: 200 });
  } catch (error) {
    console.error("Database error fetching destinations:", error);
    return NextResponse.json({ error: "Failed to fetch destinations" }, { status: 500 });
  }
}