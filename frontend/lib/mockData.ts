export type Trip = {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  description: string;
  cities: string[];
  budget: number;
  status: "upcoming" | "completed" | "draft";
  coverImage: string;
};

export const defaultTrips: Trip[] = [
  {
    id: "1",
    name: "European Summer",
    startDate: "2026-06-12",
    endDate: "2026-06-24",
    description: "A summer adventure across Europe.",
    cities: ["Paris", "Rome", "Barcelona"],
    budget: 2840,
    status: "upcoming",
    coverImage:
      "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "2",
    name: "Japan Adventure",
    startDate: "2026-10-04",
    endDate: "2026-10-15",
    description: "Exploring Japan from Tokyo to Osaka.",
    cities: ["Tokyo", "Kyoto", "Osaka"],
    budget: 3120,
    status: "upcoming",
    coverImage:
      "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80",
  },
];

export const destinations = [
  {
    name: "Santorini",
    country: "Greece",
    image:
      "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Kyoto",
    country: "Japan",
    image:
      "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Amalfi Coast",
    country: "Italy",
    image:
      "https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=800&q=80",
  },
];

export function getTrips(): Trip[] {
  if (typeof window === "undefined") {
    return defaultTrips;
  }

  const stored = localStorage.getItem("globetrotter_trips");

  if (!stored) {
    localStorage.setItem(
      "globetrotter_trips",
      JSON.stringify(defaultTrips)
    );

    return defaultTrips;
  }

  try {
    return JSON.parse(stored);
  } catch {
    return defaultTrips;
  }
}

export function saveTrips(trips: Trip[]) {
  localStorage.setItem(
    "globetrotter_trips",
    JSON.stringify(trips)
  );
}

export function updateTrip(updatedTrip: Trip): void {
  saveTrips(getTrips().map((trip) => (trip.id === updatedTrip.id ? updatedTrip : trip)));
}

export function deleteTrip(tripId: string): void {
  saveTrips(getTrips().filter((trip) => trip.id !== tripId));
}

export function getTrip(id: string) {
  return getTrips().find((trip) => trip.id === id);
}
