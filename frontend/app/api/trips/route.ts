import { NextResponse } from "next/server";
import pool from "@/lib/db"; // Adjust this import based on how you import your PostgreSQL pool

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // 1. Find the user ID based on their email
    const userResult = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [email]
    );

    if (userResult.rows.length === 0) {
      return NextResponse.json({ trips: [] }, { status: 200 });
    }

    const userId = userResult.rows[0].id;

    // 2. Query trips belonging to this user ID
    // Mapping your database columns to match the dashboard's expected interface properties
    const tripsResult = await pool.query(
      `SELECT 
         id, 
         title AS name, 
         start_date AS "startDate", 
         end_date AS "endDate", 
         total_budget AS budget, 
         cover_photo_url AS "coverImage",
         'upcoming' AS status
       FROM trips 
       WHERE user_id = $1 
       ORDER BY start_date ASC`,
      [userId]
    );

    // If your trips table doesn't have a 'cities' array column yet, we can attach an empty array or handle it
    const formattedTrips = tripsResult.rows.map(trip => ({
      ...trip,
      cities: trip.cities || ["Ahmedabad"] // Fallback or adjust if you have a cities column/relation
    }));

    return NextResponse.json({ trips: formattedTrips }, { status: 200 });

  } catch (error) {
    console.error("Database error fetching trips:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}