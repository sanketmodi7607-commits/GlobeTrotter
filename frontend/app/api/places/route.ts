import { NextRequest, NextResponse } from "next/server";

type NominatimPlace = {
  display_name: string;
  name?: string;
  type: string;
  address?: Record<string, string>;
};

/** Search OpenStreetMap's geocoder for cities, villages, landmarks, and regions. */
export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q")?.trim() ?? "";

  if (query.length < 2) {
    return NextResponse.json({ places: [] });
  }

  try {
    const url = new URL("https://nominatim.openstreetmap.org/search");
    url.searchParams.set("q", query);
    url.searchParams.set("format", "jsonv2");
    url.searchParams.set("addressdetails", "1");
    url.searchParams.set("limit", "8");

    const response = await fetch(url, {
      headers: { "User-Agent": "GlobeTrotter place search" },
      next: { revalidate: 86400 },
    });

    if (!response.ok) throw new Error(`Place search failed: ${response.status}`);

    const results: NominatimPlace[] = await response.json();
    const places = results.map((place) => {
      const address = place.address ?? {};
      const name = place.name || place.display_name.split(",")[0];
      const details = [
        address.city || address.town || address.village || address.county || address.state,
        address.country,
      ]
        .filter(Boolean)
        .filter((item, index, list) => list.indexOf(item) === index)
        .join(", ");

      return { name, details, type: place.type };
    });

    return NextResponse.json({ places });
  } catch (error) {
    console.error("Place search error:", error);
    return NextResponse.json({ places: [] }, { status: 502 });
  }
}
