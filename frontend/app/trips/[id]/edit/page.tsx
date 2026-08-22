"use client";

import Link from "next/link";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import PlaceAutocomplete from "../../../components/PlaceAutocomplete";
import { getTrip, updateTrip, type Trip } from "../../../../lib/mockData";

export default function EditTripPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [description, setDescription] = useState("");
  const [cities, setCities] = useState("");
  const [budget, setBudget] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const savedTrip = getTrip(params.id);
    if (!savedTrip) return;
    setTrip(savedTrip);
    setName(savedTrip.name);
    setStartDate(savedTrip.startDate);
    setEndDate(savedTrip.endDate);
    setDescription(savedTrip.description);
    setCities(savedTrip.cities.join(", "));
    setBudget(String(savedTrip.budget));
    setCoverImage(savedTrip.coverImage);
  }, [params.id]);

  const chooseCoverPhoto = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file for the cover photo.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setCoverImage(String(reader.result));
    reader.readAsDataURL(file);
  };

  const saveTrip = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    if (!trip || !name.trim() || !startDate || !endDate) {
      setError("Trip name and travel dates are required.");
      return;
    }
    if (new Date(endDate) < new Date(startDate)) {
      setError("End date cannot be before the start date.");
      return;
    }

    updateTrip({
      ...trip,
      name: name.trim(),
      startDate,
      endDate,
      description: description.trim(),
      cities: cities.split(",").map((city) => city.trim()).filter(Boolean),
      budget: Number(budget) || 0,
      coverImage: coverImage || trip.coverImage,
    });
    router.push(`/trips/${trip.id}`);
  };

  if (!trip) {
    return <main className="grid min-h-screen place-items-center bg-[#f7f9fc] text-slate-600">Trip not found.</main>;
  }

  return (
    <main className="min-h-screen bg-[#f7f9fc] px-6 py-10 text-[#172033]">
      <div className="mx-auto max-w-3xl">
        <Link href={`/trips/${trip.id}`} className="text-sm font-semibold text-[#0058bc]">← Back to trip</Link>
        <h1 className="mt-5 text-4xl font-bold">Edit trip</h1>
        <p className="mt-2 text-slate-500">Update your trip details, destinations, budget, and cover photo.</p>

        <form onSubmit={saveTrip} className="mt-8 space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <Field label="Trip name *"><input value={name} onChange={(e) => setName(e.target.value)} className="field" /></Field>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Start date *"><input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="field" /></Field>
            <Field label="End date *"><input type="date" min={startDate} value={endDate} onChange={(e) => setEndDate(e.target.value)} className="field" /></Field>
          </div>
          <Field label="Destinations"><PlaceAutocomplete value={cities} onChange={setCities} /></Field>
          <Field label="Estimated budget"><input type="number" min="0" value={budget} onChange={(e) => setBudget(e.target.value)} className="field" /></Field>
          <Field label="Trip description"><textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} className="field resize-none" /></Field>
          <Field label="Cover photo (optional)">
            <input type="file" accept="image/*" onChange={chooseCoverPhoto} className="block w-full text-sm text-slate-600 file:mr-4 file:rounded-lg file:border-0 file:bg-[#e8f0ff] file:px-4 file:py-2 file:font-semibold file:text-[#0058bc]" />
            {coverImage && <img src={coverImage} alt="Selected cover" className="mt-3 h-32 w-full rounded-xl object-cover" />}
          </Field>
          {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}
          <button type="submit" className="w-full rounded-xl bg-[#0058bc] px-6 py-3.5 font-semibold text-white hover:bg-[#004ca0]">Save changes</button>
        </form>
      </div>
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block text-sm font-semibold text-[#172033]"><span className="mb-2 block">{label}</span>{children}</label>;
}
