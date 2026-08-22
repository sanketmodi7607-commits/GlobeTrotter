"use client";

import { useEffect, useRef, useState, KeyboardEvent } from "react";

export type Place = {
  name: string;
  details: string;
  country?: string;
  state?: string;
  type?: string;
};

type PlaceAutocompleteProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  multi?: boolean;
  required?: boolean;
  className?: string;
  inputClassName?: string;
  id?: string;
  name?: string;
  disabled?: boolean;
};

const POPULAR_DESTINATIONS: Place[] = [
  { name: "Mumbai", details: "Maharashtra, India", country: "India", type: "city" },
  { name: "Paris", details: "Île-de-France, France", country: "France", type: "city" },
  { name: "Tokyo", details: "Kanto, Japan", country: "Japan", type: "city" },
  { name: "Goa", details: "Goa, India", country: "India", type: "state" },
  { name: "New York", details: "New York, USA", country: "USA", type: "city" },
  { name: "Dubai", details: "Dubai, United Arab Emirates", country: "United Arab Emirates", type: "city" },
  { name: "London", details: "England, United Kingdom", country: "United Kingdom", type: "city" },
  { name: "Rome", details: "Lazio, Italy", country: "Italy", type: "city" },
];

export default function PlaceAutocomplete({
  value,
  onChange,
  placeholder = "Search destination (e.g. Mumbai, Paris, Tokyo)...",
  multi = false,
  required = false,
  className = "",
  inputClassName = "",
  id,
  name,
  disabled = false,
}: PlaceAutocompleteProps) {
  const [places, setPlaces] = useState<Place[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number>(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Extract current search token
  const query = multi ? (value.split(",").at(-1)?.trim() ?? "") : value.trim();

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch suggestions when query changes
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    if (!query) {
      setPlaces(POPULAR_DESTINATIONS);
      setIsLoading(false);
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `/api/places?q=${encodeURIComponent(query)}`,
          { signal: controller.signal }
        );
        if (response.ok) {
          const data = await response.json();
          setPlaces(data.places || []);
        }
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          // Local fallback filter
          const filtered = POPULAR_DESTINATIONS.filter((p) =>
            p.name.toLowerCase().includes(query.toLowerCase()) ||
            p.details.toLowerCase().includes(query.toLowerCase())
          );
          setPlaces(filtered);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
          setActiveIndex(-1);
        }
      }
    }, 200);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [isOpen, query]);

  const selectPlace = (place: Place) => {
    if (multi) {
      const entries = value.split(",");
      entries[entries.length - 1] = place.name;
      const formatted = entries
        .map((entry) => entry.trim())
        .filter(Boolean)
        .join(", ");
      onChange(`${formatted}, `);
    } else {
      // Single selection formatted with country or state if available
      const display = place.details
        ? `${place.name}, ${place.details.split(",").at(-1)?.trim() || place.country || ""}`
        : place.name;
      onChange(display);
    }
    setIsOpen(false);
    setActiveIndex(-1);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) {
      if (e.key === "ArrowDown" || e.key === "Enter") {
        setIsOpen(true);
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => (prev + 1 < places.length ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => (prev - 1 >= 0 ? prev - 1 : places.length - 1));
    } else if (e.key === "Enter") {
      if (activeIndex >= 0 && activeIndex < places.length) {
        e.preventDefault();
        selectPlace(places[activeIndex]);
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
      setActiveIndex(-1);
    }
  };

  const clearInput = () => {
    onChange("");
    setPlaces(POPULAR_DESTINATIONS);
    setIsOpen(true);
    inputRef.current?.focus();
  };

  // Helper to highlight matching text in search results
  const renderHighlighted = (text: string, highlight: string) => {
    if (!highlight || !text) return text;
    const index = text.toLowerCase().indexOf(highlight.toLowerCase());
    if (index === -1) return text;
    const before = text.slice(0, index);
    const match = text.slice(index, index + highlight.length);
    const after = text.slice(index + highlight.length);
    return (
      <>
        {before}
        <span className="font-extrabold text-[#0058bc] underline decoration-[#0058bc]/30">{match}</span>
        {after}
      </>
    );
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="relative flex items-center">
        {/* Leading Location Pin Icon */}
        <span className="pointer-events-none absolute left-3.5 text-slate-400 material-symbols-outlined text-[20px]">
          location_on
        </span>

        <input
          ref={inputRef}
          id={id}
          name={name}
          type="text"
          value={value}
          disabled={disabled}
          required={required}
          onChange={(event) => {
            onChange(event.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoComplete="off"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={isOpen}
          aria-controls="place-suggestions"
          className={`w-full rounded-xl border border-slate-300 bg-white py-3 pl-10 pr-10 text-sm font-medium text-[#172033] outline-none transition placeholder:text-slate-400 hover:border-slate-400 focus:border-[#0058bc] focus:ring-4 focus:ring-[#0058bc]/10 ${inputClassName}`}
        />

        {/* Action icons: Loading or Clear */}
        <div className="absolute right-3 flex items-center gap-1.5">
          {isLoading && (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#0058bc]/30 border-t-[#0058bc]" />
          )}

          {!isLoading && value && (
            <button
              type="button"
              onClick={clearInput}
              aria-label="Clear destination"
              className="flex h-6 w-6 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          )}
        </div>
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          id="place-suggestions"
          role="listbox"
          className="absolute z-50 mt-1.5 max-h-72 w-full overflow-y-auto rounded-2xl border border-slate-200 bg-white p-1.5 shadow-2xl shadow-slate-900/10 backdrop-blur"
        >
          {/* Header indicator */}
          <div className="flex items-center justify-between border-b border-slate-100 px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            <span>{query ? `Suggestions for "${query}"` : "Popular Destinations"}</span>
            <span className="text-[10px] lowercase text-slate-400">↑↓ to navigate · enter to select</span>
          </div>

          {isLoading && places.length === 0 ? (
            <div className="flex items-center gap-2.5 px-4 py-4 text-sm text-slate-500">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#0058bc]/30 border-t-[#0058bc]" />
              <span>Searching worldwide places for "{query}"…</span>
            </div>
          ) : places.length > 0 ? (
            <div className="py-1">
              {places.map((place, index) => {
                const isSelected = activeIndex === index;
                return (
                  <button
                    key={`${place.name}-${place.details}-${index}`}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onMouseEnter={() => setActiveIndex(index)}
                    onMouseDown={(e) => {
                      e.preventDefault(); // Prevent input blur before click
                      selectPlace(place);
                    }}
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition ${
                      isSelected
                        ? "bg-[#e8f0ff] text-[#0058bc]"
                        : "text-[#172033] hover:bg-slate-50"
                    }`}
                  >
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                        isSelected ? "bg-[#0058bc] text-white" : "bg-slate-100 text-[#0058bc]"
                      }`}
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        {place.type === "state" || place.type === "region" || place.type === "island"
                          ? "map"
                          : "location_on"}
                      </span>
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="truncate text-sm font-bold">
                          {renderHighlighted(place.name, query)}
                        </span>
                        {place.country && (
                          <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-600">
                            {place.country}
                          </span>
                        )}
                      </div>
                      <span className="block truncate text-xs text-slate-500">
                        {place.details || place.type || "Destination"}
                      </span>
                    </div>

                    <span className="material-symbols-outlined text-sm text-slate-300 group-hover:text-[#0058bc]">
                      north_west
                    </span>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="px-4 py-4 text-center">
              <p className="text-sm font-medium text-slate-700">
                No matching destination found for "{query}"
              </p>
              <p className="mt-1 text-xs text-slate-400">
                You can still type and use any custom city or landmark name.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

