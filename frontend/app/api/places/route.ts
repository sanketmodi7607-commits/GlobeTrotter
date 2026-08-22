import { NextRequest, NextResponse } from "next/server";

export type PlaceResult = {
  name: string;
  details: string;
  country: string;
  state?: string;
  type: string;
  population?: number;
};

// Rich curated list of popular global & Indian destinations for instant zero-latency matching
const CURATED_PLACES: PlaceResult[] = [
  { name: "Mumbai", details: "Maharashtra, India", country: "India", state: "Maharashtra", type: "city", population: 20000000 },
  { name: "Delhi", details: "National Capital Region, India", country: "India", state: "Delhi", type: "city", population: 19000000 },
  { name: "Bengaluru", details: "Karnataka, India", country: "India", state: "Karnataka", type: "city", population: 12000000 },
  { name: "Hyderabad", details: "Telangana, India", country: "India", state: "Telangana", type: "city", population: 10000000 },
  { name: "Ahmedabad", details: "Gujarat, India", country: "India", state: "Gujarat", type: "city", population: 8000000 },
  { name: "Chennai", details: "Tamil Nadu, India", country: "India", state: "Tamil Nadu", type: "city", population: 9000000 },
  { name: "Kolkata", details: "West Bengal, India", country: "India", state: "West Bengal", type: "city", population: 14000000 },
  { name: "Pune", details: "Maharashtra, India", country: "India", state: "Maharashtra", type: "city", population: 7000000 },
  { name: "Jaipur", details: "Rajasthan, India", country: "India", state: "Rajasthan", type: "city", population: 4000000 },
  { name: "Goa", details: "Goa, India", country: "India", state: "Goa", type: "state", population: 1500000 },
  { name: "Varanasi", details: "Uttar Pradesh, India", country: "India", state: "Uttar Pradesh", type: "city", population: 1500000 },
  { name: "Kochi", details: "Kerala, India", country: "India", state: "Kerala", type: "city", population: 2100000 },
  { name: "Udaipur", details: "Rajasthan, India", country: "India", state: "Rajasthan", type: "city", population: 600000 },
  { name: "Agra", details: "Uttar Pradesh, India", country: "India", state: "Uttar Pradesh", type: "city", population: 1700000 },
  { name: "Munich", details: "Bavaria, Germany", country: "Germany", state: "Bavaria", type: "city", population: 1500000 },
  { name: "Paris", details: "Île-de-France, France", country: "France", state: "Île-de-France", type: "city", population: 2160000 },
  { name: "Tokyo", details: "Kanto, Japan", country: "Japan", state: "Tokyo", type: "city", population: 14000000 },
  { name: "New York", details: "New York, USA", country: "USA", state: "New York", type: "city", population: 8300000 },
  { name: "London", details: "England, United Kingdom", country: "United Kingdom", state: "England", type: "city", population: 8900000 },
  { name: "Rome", details: "Lazio, Italy", country: "Italy", state: "Lazio", type: "city", population: 2870000 },
  { name: "Dubai", details: "Dubai, United Arab Emirates", country: "United Arab Emirates", state: "Dubai", type: "city", population: 3330000 },
  { name: "Singapore", details: "Singapore", country: "Singapore", type: "city", population: 5600000 },
  { name: "Bangkok", details: "Bangkok, Thailand", country: "Thailand", state: "Bangkok", type: "city", population: 10500000 },
  { name: "Bali", details: "Bali, Indonesia", country: "Indonesia", state: "Bali", type: "region", population: 4300000 },
  { name: "Barcelona", details: "Catalonia, Spain", country: "Spain", state: "Catalonia", type: "city", population: 1620000 },
  { name: "Amsterdam", details: "North Holland, Netherlands", country: "Netherlands", state: "North Holland", type: "city", population: 870000 },
  { name: "Madrid", details: "Community of Madrid, Spain", country: "Spain", state: "Madrid", type: "city", population: 3300000 },
  { name: "Sydney", details: "New South Wales, Australia", country: "Australia", state: "New South Wales", type: "city", population: 5300000 },
  { name: "Kyoto", details: "Kansai, Japan", country: "Japan", state: "Kyoto", type: "city", population: 1470000 },
  { name: "Santorini", details: "South Aegean, Greece", country: "Greece", state: "South Aegean", type: "island", population: 15500 },
  { name: "Amalfi", details: "Campania, Italy", country: "Italy", state: "Campania", type: "town", population: 5100 },
  { name: "Zurich", details: "Zurich, Switzerland", country: "Switzerland", state: "Zurich", type: "city", population: 430000 },
  { name: "Venice", details: "Veneto, Italy", country: "Italy", state: "Veneto", type: "city", population: 260000 },
  { name: "Cairo", details: "Cairo Governorate, Egypt", country: "Egypt", state: "Cairo", type: "city", population: 9500000 },
];

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q")?.trim() ?? "";

  if (query.length < 1) {
    return NextResponse.json({ places: CURATED_PLACES.slice(0, 6) });
  }

  const queryLower = query.toLowerCase();

  // 1. Check local curated places
  const matchedCurated = CURATED_PLACES.filter(
    (p) =>
      p.name.toLowerCase().includes(queryLower) ||
      p.details.toLowerCase().includes(queryLower) ||
      p.country.toLowerCase().includes(queryLower)
  );

  let apiResults: PlaceResult[] = [];

  // 2. Query Open-Meteo Geocoding API (Fast, Free, Highly reliable)
  try {
    const openMeteoUrl = new URL("https://geocoding-api.open-meteo.com/v1/search");
    openMeteoUrl.searchParams.set("name", query);
    openMeteoUrl.searchParams.set("count", "10");
    openMeteoUrl.searchParams.set("language", "en");
    openMeteoUrl.searchParams.set("format", "json");

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 2500);

    const response = await fetch(openMeteoUrl.toString(), {
      signal: controller.signal,
      next: { revalidate: 86400 },
    });
    clearTimeout(timer);

    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data.results)) {
        apiResults = data.results.map((item: any) => {
          const state = item.admin1 || "";
          const country = item.country || "";
          const detailsParts = [state, country].filter(Boolean);
          const details = detailsParts.join(", ");

          return {
            name: item.name,
            details: details || country || "Destination",
            country,
            state,
            type: "city",
            population: item.population || 0,
          };
        });
      }
    }
  } catch (error) {
    // Graceful fallback to Photon or Curated
    try {
      const photonUrl = new URL("https://photon.komoot.io/api/");
      photonUrl.searchParams.set("q", query);
      photonUrl.searchParams.set("limit", "8");

      const photonController = new AbortController();
      const pTimer = setTimeout(() => photonController.abort(), 2000);

      const pResponse = await fetch(photonUrl.toString(), {
        signal: photonController.signal,
      });
      clearTimeout(pTimer);

      if (pResponse.ok) {
        const pData = await pResponse.json();
        if (Array.isArray(pData.features)) {
          apiResults = pData.features.map((f: any) => {
            const props = f.properties || {};
            const name = props.name || "";
            const details = [props.city, props.state, props.country]
              .filter(Boolean)
              .filter((v, i, arr) => arr.indexOf(v) === i)
              .join(", ");
            return {
              name,
              details: details || props.country || "Place",
              country: props.country || "",
              state: props.state || "",
              type: props.type || "place",
              population: props.population || 0,
            };
          }).filter((p: PlaceResult) => p.name.length > 0);
        }
      }
    } catch {}
  }

  // Combine and deduplicate
  const combined = [...matchedCurated, ...apiResults];
  const seen = new Set<string>();
  const uniquePlaces: PlaceResult[] = [];

  for (const place of combined) {
    const key = `${place.name.toLowerCase()}|${place.details.toLowerCase()}`;
    if (!seen.has(key)) {
      seen.add(key);
      uniquePlaces.push(place);
    }
  }

  // Sort results:
  // 1. Exact / prefix matches on major cities and curated destinations first (e.g. "mum" -> "Mumbai" #1)
  // 2. High population destinations over obscure hamlets
  uniquePlaces.sort((a, b) => {
    const aName = a.name.toLowerCase();
    const bName = b.name.toLowerCase();

    const aPop = a.population || 0;
    const bPop = b.population || 0;

    const aStarts = aName.startsWith(queryLower) ? 1 : 0;
    const bStarts = bName.startsWith(queryLower) ? 1 : 0;
    if (aStarts !== bStarts) return bStarts - aStarts;

    // Rank major cities (>100k population) ahead of tiny obscure exact matches
    if (Math.abs(aPop - bPop) > 100000) {
      return bPop - aPop;
    }

    const aExact = aName === queryLower ? 1 : 0;
    const bExact = bName === queryLower ? 1 : 0;
    if (aExact !== bExact) return bExact - aExact;

    return bPop - aPop;
  });

  return NextResponse.json({ places: uniquePlaces.slice(0, 8) });
}


