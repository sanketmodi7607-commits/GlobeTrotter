import { NextResponse } from "next/server";
import pool from "@/lib/db";


// GET one specific stop
export async function GET(
  request: Request,
  {
    params,
  }: {
    params: { id: string; stopId: string };
  }
) {
  try {
    const { id, stopId } = params;

    const result = await pool.query(
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
      WHERE id = $1 AND trip_id = $2
      `,
      [stopId, id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "Stop not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { stop: result.rows[0] },
      { status: 200 }
    );
  } catch (error) {
    console.error("Database error fetching stop:", error);

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}


// DELETE stop
export async function DELETE(
  request: Request,
  {
    params,
  }: {
    params: { id: string; stopId: string };
  }
) {
  try {
    const { id, stopId } = params;

    const result = await pool.query(
      `
      DELETE FROM trip_stops
      WHERE id = $1 AND trip_id = $2
      RETURNING id
      `,
      [stopId, id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "Stop not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Stop deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Database error deleting stop:", error);

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}