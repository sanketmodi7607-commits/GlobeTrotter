import { NextResponse } from "next/server";
import pool from "@/lib/db";

// GET all trips for a user
// Example:
// /api/trips?email=test@gmail.com
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    const userResult = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [email]
    );

    if (userResult.rows.length === 0) {
      return NextResponse.json({ trips: [] }, { status: 200 });
    }

    const userId = userResult.rows[0].id;

    const tripsResult = await pool.query(
      `
      SELECT
        id,
        title AS name,
        description,
        start_date AS "startDate",
        end_date AS "endDate",
        total_budget AS budget,
        cover_photo_url AS "coverImage",
        cities
      FROM trips
      WHERE user_id = $1
      ORDER BY start_date ASC
      `,
      [userId]
    );

    const formattedTrips = tripsResult.rows.map((trip) => ({
      ...trip,
      cities: trip.cities || [],
      status: getTripStatus(trip.startDate, trip.endDate),
    }));

    return NextResponse.json(
      { trips: formattedTrips },
      { status: 200 }
    );
  } catch (error) {
    console.error("Database error fetching trips:", error);

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}


// POST create a new trip
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      email,
      name,
      description,
      startDate,
      endDate,
      budget,
      coverImage,
      cities,
    } = body;

    if (!email || !name) {
      return NextResponse.json(
        { error: "Email and trip name are required" },
        { status: 400 }
      );
    }

    const userResult = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [email]
    );

    if (userResult.rows.length === 0) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const userId = userResult.rows[0].id;

    const newTripResult = await pool.query(
      `
      INSERT INTO trips (
        user_id,
        title,
        description,
        start_date,
        end_date,
        total_budget,
        cover_photo_url,
        cities
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING
        id,
        title AS name,
        description,
        start_date AS "startDate",
        end_date AS "endDate",
        total_budget AS budget,
        cover_photo_url AS "coverImage",
        cities
      `,
      [
        userId,
        name,
        description || "",
        startDate || null,
        endDate || null,
        budget || 0,
        coverImage ||
          "https://images.unsplash.com/photo-1488646953014-85cb44e25828",
        cities || [],
      ]
    );

    return NextResponse.json(
      {
        message: "Trip created successfully",
        trip: newTripResult.rows[0],
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Database error creating trip:", error);

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}


// Calculate trip status
function getTripStatus(startDate: string | null, endDate: string | null) {
  if (!startDate) return "upcoming";

  const now = new Date();
  const start = new Date(startDate);
  const end = endDate ? new Date(endDate) : start;

  if (now < start) return "upcoming";
  if (now > end) return "completed";

  return "ongoing";
}