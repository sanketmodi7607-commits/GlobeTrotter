import { NextResponse } from "next/server";
import pool from "@/lib/db";


// GET activities
export async function GET(
  request: Request,
  {
    params,
  }: {
    params: { id: string; stopId: string };
  }
) {
  try {
    const stopId = params.stopId;

    const activitiesResult = await pool.query(
      `
      SELECT
        id,
        stop_id AS "stopId",
        title,
        time,
        cost,
        notes,
        completed
      FROM trip_activities
      WHERE stop_id = $1
      ORDER BY time ASC
      `,
      [stopId]
    );

    return NextResponse.json(
      { activities: activitiesResult.rows },
      { status: 200 }
    );
  } catch (error) {
    console.error("Database error fetching activities:", error);

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}


// POST activity
export async function POST(
  request: Request,
  {
    params,
  }: {
    params: { id: string; stopId: string };
  }
) {
  try {
    const stopId = params.stopId;

    const body = await request.json();

    const {
      title,
      time,
      cost,
      notes,
    } = body;

    if (!title) {
      return NextResponse.json(
        { error: "Activity title is required" },
        { status: 400 }
      );
    }

    // Make sure stop exists
    const stopResult = await pool.query(
      "SELECT id FROM trip_stops WHERE id = $1",
      [stopId]
    );

    if (stopResult.rows.length === 0) {
      return NextResponse.json(
        { error: "Stop not found" },
        { status: 404 }
      );
    }

    const newActivityResult = await pool.query(
      `
      INSERT INTO trip_activities (
        stop_id,
        title,
        time,
        cost,
        notes,
        completed
      )
      VALUES ($1, $2, $3, $4, $5, false)
      RETURNING
        id,
        stop_id AS "stopId",
        title,
        time,
        cost,
        notes,
        completed
      `,
      [
        stopId,
        title,
        time || null,
        cost || 0,
        notes || "",
      ]
    );

    return NextResponse.json(
      {
        message: "Activity added successfully",
        activity: newActivityResult.rows[0],
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Database error creating activity:", error);

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}