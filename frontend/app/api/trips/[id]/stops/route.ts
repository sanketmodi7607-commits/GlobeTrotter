import { NextResponse } from "next/server";
import pool from "@/lib/db";


// GET all stops for a trip
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: tripId } = await params;

    const stopsResult = await pool.query(
      `
      SELECT
        id,
        trip_id AS "tripId",
        day_number AS "dayNumber",
        title,
        description,
        location,
        date
      FROM trip_stops
      WHERE trip_id = $1
      ORDER BY day_number ASC, date ASC
      `,
      [tripId]
    );

    return NextResponse.json(
      { stops: stopsResult.rows },
      { status: 200 }
    );
  } catch (error) {
    console.error("Database error fetching trip stops:", error);

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}


// POST create a new stop
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: tripId } = await params;

    const body = await request.json();

    const {
      dayNumber,
      title,
      description,
      location,
      date,
    } = body;

    if (!title) {
      return NextResponse.json(
        { error: "Stop title is required" },
        { status: 400 }
      );
    }

    // Check trip exists
    const tripResult = await pool.query(
      "SELECT id FROM trips WHERE id = $1",
      [tripId]
    );

    if (tripResult.rows.length === 0) {
      return NextResponse.json(
        { error: "Trip not found" },
        { status: 404 }
      );
    }

    const newStopResult = await pool.query(
      `
      INSERT INTO trip_stops (
        trip_id,
        day_number,
        title,
        description,
        location,
        date
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING
        id,
        trip_id AS "tripId",
        day_number AS "dayNumber",
        title,
        description,
        location,
        date
      `,
      [
        tripId,
        dayNumber || 1,
        title,
        description || "",
        location || "",
        date || null,
      ]
    );

    return NextResponse.json(
      {
        message: "Trip stop created successfully",
        stop: newStopResult.rows[0],
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Database error creating trip stop:", error);

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}