"use client";

import { useEffect, useState } from "react";

type Place = {
  name: string;
  details: string;
  type: string;
};

type PlaceAutocompleteProps = {
  value: string;
  onChange: (value: string) => void;
};

/**
 * A multi-place input. Each comma-separated entry is searched independently,
 * allowing a trip to include cities, villages, landmarks, and regions.
 */
export default function PlaceAutocomplete({
  value,
  onChange,
}: PlaceAutocompleteProps) {
  const [places, setPlaces] = useState<Place[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const query = value.split(",").at(-1)?.trim() ?? "";

  useEffect(() => {
    if (!isOpen || query.length < 2) {
      setPlaces([]);
      setIsLoading(false);
      return;
    }

    const controller = new AbortController();
    const timeout = window.setTimeout(async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `/api/places?q=${encodeURIComponent(query)}`,
          { signal: controller.signal }
        );
        if (response.ok) {
          setPlaces((await response.json()).places ?? []);
        }
      } catch (error) {
        if ((error as Error).name !== "AbortError") setPlaces([]);
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    }, 350);

    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [isOpen, query]);

  const selectPlace = (place: Place) => {
    const entries = value.split(",");
    entries[entries.length - 1] = place.name;
    onChange(`${entries.map((entry) => entry.trim()).filter(Boolean).join(", ")}, `);
    setPlaces([]);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <input
        value={value}
        onChange={(event) => {
          onChange(event.target.value);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        onBlur={() => window.setTimeout(() => setIsOpen(false), 150)}
        placeholder="Search a city, village, landmark, or region"
        autoComplete="off"
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={isOpen && (query.length >= 2 || places.length > 0)}
        aria-controls="place-suggestions"
        className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#0058bc] focus:bg-white focus:ring-2 focus:ring-[#0058bc]/10"
      />

      {isOpen && query.length >= 2 && (
        <div
          id="place-suggestions"
          role="listbox"
          className="absolute z-20 mt-2 max-h-64 w-full overflow-y-auto rounded-xl border border-slate-200 bg-white p-1 shadow-lg"
        >
          {isLoading ? (
            <p className="px-3 py-3 text-sm text-slate-500">Searching places…</p>
          ) : places.length > 0 ? (
            places.map((place) => (
              <button
                key={`${place.name}-${place.details}`}
                type="button"
                role="option"
                aria-selected={false}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => selectPlace(place)}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left hover:bg-[#e8f0ff]"
              >
                <span className="material-symbols-outlined text-[#0058bc]">location_on</span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold text-[#172033]">{place.name}</span>
                  <span className="block truncate text-xs text-slate-500">{place.details || place.type}</span>
                </span>
              </button>
            ))
          ) : (
            <p className="px-3 py-3 text-sm text-slate-500">No matching places found. You can still enter it manually.</p>
          )}
        </div>
      )}
    </div>
  );
}
