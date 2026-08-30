import { NextResponse } from "next/server";
import pool from "@/lib/db";

// Helper to choose a relevant cover image if none is provided
function getCoverPhotoForDestination(destination: string): string {
  const destLower = (destination || "").toLowerCase();
  if (destLower.includes("mumbai") || destLower.includes("india") || destLower.includes("delhi") || destLower.includes("goa")) {
    return "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=1200&q=80"; // Mumbai Gateway of India
  }
  if (destLower.includes("paris") || destLower.includes("france")) {
    return "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80";
  }
  if (destLower.includes("tokyo") || destLower.includes("japan") || destLower.includes("kyoto")) {
    return "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80";
  }
  if (destLower.includes("york") || destLower.includes("usa")) {
    return "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=1200&q=80";
  }
  if (destLower.includes("london") || destLower.includes("uk")) {
    return "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=1200&q=80";
  }
  if (destLower.includes("rome") || destLower.includes("italy")) {
    return "https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=1200&q=80";
  }
  if (destLower.includes("dubai")) {
    return "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1200&q=80";
  }
  return "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80";
}

// GET all trips for a user (or all trips if no email is supplied)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    let tripsResult;

    if (email) {
      const userResult = await pool.query(
        "SELECT id FROM users WHERE email = $1",
        [email]
      );

      if (userResult.rows.length === 0) {
        return NextResponse.json({ trips: [] }, { status: 200 });
      }

      const userId = userResult.rows[0].id;

      tripsResult = await pool.query(
        `
        SELECT
          id,
          title AS name,
          title,
          destination,
          description,
          start_date AS "startDate",
          start_date,
          end_date AS "endDate",
          end_date,
          total_budget AS budget,
          cover_photo_url AS "coverImage",
          cities
        FROM trips
        WHERE user_id = $1
        ORDER BY start_date DESC NULLS LAST, created_at DESC
        `,
        [userId]
      );
    } else {
      // Fallback: return all available trips
      tripsResult = await pool.query(
        `
        SELECT
          id,
          title AS name,
          title,
          destination,
          description,
          start_date AS "startDate",
          start_date,
          end_date AS "endDate",
          end_date,
          total_budget AS budget,
          cover_photo_url AS "coverImage",
          cities
        FROM trips
        ORDER BY start_date DESC NULLS LAST, created_at DESC
        LIMIT 20
        `
      );
    }

    const trips = tripsResult.rows.map((trip) => {
      const tripCities = Array.isArray(trip.cities) ? trip.cities : [];
      const primaryDest = trip.destination || (tripCities.length > 0 ? tripCities[0] : "Worldwide");
      return {
        ...trip,
        id: String(trip.id),
        destination: primaryDest,
        cities: tripCities.length > 0 ? tripCities : [primaryDest],
      };
    });

    return NextResponse.json({ trips }, { status: 200 });
  } catch (error) {
    console.error("Database error fetching trips:", error);
    return NextResponse.json(
      { error: "Internal Server Error", trips: [] },
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
      title,
      destination,
      start_date,
      end_date,
      description,
      budget,
      coverImage,
      cities,
    } = body;

    // Required fields validation
    if (!title || !destination || !start_date) {
      return NextResponse.json(
        {
          error: "Trip title, destination and start date are required",
        },
        { status: 400 }
      );
    }

    const userEmail = email || "traveler@globetrotter.app";

    // 1. Find or create user in PostgreSQL to guarantee valid foreign key
    let userId: number;
    const userResult = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [userEmail]
    );

    if (userResult.rows.length === 0) {
      const userName = userEmail.split("@")[0] || "Traveler";
      const insertUser = await pool.query(
        `INSERT INTO users (name, email, password_hash) 
         VALUES ($1, $2, $3) 
         RETURNING id`,
        [userName, userEmail, "oauth_or_demo_hash"]
      );
      userId = insertUser.rows[0].id;
    } else {
      userId = userResult.rows[0].id;
    }

    // Format destination and cities array
    const tripCities: string[] =
      Array.isArray(cities) && cities.length > 0
        ? cities
        : destination.split(",").map((c: string) => c.trim()).filter(Boolean);

    const primaryDest = destination.trim() || tripCities[0] || "Destination";
    const selectedCover = coverImage || getCoverPhotoForDestination(primaryDest);

    // 2. Create trip in database
    const result = await pool.query(
      `
      INSERT INTO trips (
        user_id,
        title,
        destination,
        description,
        start_date,
        end_date,
        total_budget,
        cover_photo_url,
        cities
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING
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
      `,
      [
        userId,
        title.trim(),
        primaryDest,
        description || "",
        start_date,
        end_date || null,
        Number(budget) || 0,
        selectedCover,
        tripCities,
      ]
    );

    const createdRow = result.rows[0];
    const createdTrip = {
      ...createdRow,
      id: String(createdRow.id),
      destination: createdRow.destination || primaryDest,
      cities: createdRow.cities || tripCities,
    };

    return NextResponse.json(
      {
        message: "Trip created successfully",
        trip: createdTrip,
        id: createdTrip.id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Database error creating trip:", error);

    return NextResponse.json(
      {
        error: "Failed to create trip",
        details:
          error instanceof Error
            ? error.message
            : "Unknown database error",
      },
      { status: 500 }
    );
  }
}