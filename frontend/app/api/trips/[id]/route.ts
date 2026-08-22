import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const tripId = params.id;

    const tripResult = await pool.query(
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
      WHERE id = $1
      `,
      [tripId]
    );

    if (tripResult.rows.length === 0) {
      return NextResponse.json(
        { error: "Trip not found" },
        { status: 404 }
      );
    }

    const trip = tripResult.rows[0];

    return NextResponse.json(
      {
        trip: {
          ...trip,
          cities: trip.cities || [],
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Database error fetching trip:", error);

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}


// DELETE a trip
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const tripId = params.id;

    const result = await pool.query(
      `
      DELETE FROM trips
      WHERE id = $1
      RETURNING id
      `,
      [tripId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "Trip not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Trip deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Database error deleting trip:", error);

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}