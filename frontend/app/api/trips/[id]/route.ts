import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: tripId } = await params;

    const tripResult = await pool.query(
      `
      SELECT
        id,
        title,
        title AS name,
        destination,
        description,
        start_date,
        start_date AS "startDate",
        end_date,
        end_date AS "endDate",
        total_budget,
        total_budget AS budget,
        cover_photo_url,
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

    const row = tripResult.rows[0];

    // Format start_date and end_date safely to YYYY-MM-DD or ISO string
    const formatSafeDate = (d: any): string => {
      if (!d) return "";
      if (d instanceof Date) {
        return d.toISOString().split("T")[0];
      }
      return String(d);
    };

    const startDateStr = formatSafeDate(row.startDate || row.start_date);
    const endDateStr = formatSafeDate(row.endDate || row.end_date);

    const tripCities = Array.isArray(row.cities) ? row.cities : [];
    const primaryDest = row.destination || (tripCities.length > 0 ? tripCities[0] : "Worldwide");

    const trip = {
      ...row,
      id: String(row.id),
      title: row.title || row.name || "Trip",
      name: row.title || row.name || "Trip",
      destination: primaryDest,
      cities: tripCities.length > 0 ? tripCities : [primaryDest],
      startDate: startDateStr,
      start_date: startDateStr,
      endDate: endDateStr,
      end_date: endDateStr,
      budget: Number(row.budget || row.total_budget || 0),
    };

    return NextResponse.json({ trip }, { status: 200 });
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: tripId } = await params;

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