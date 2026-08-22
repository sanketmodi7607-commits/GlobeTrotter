"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = (e: FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  setError("");

  if (!email || !password) {
    setError("Please enter your email and password.");
    return;
  }

  if (!email.includes("@")) {
    setError("Please enter a valid email address.");
    return;
  }

  const savedUser = localStorage.getItem("globetrotter_user");

  if (!savedUser) {
    setError("No account found. Please create an account first.");
    return;
  }

  const user = JSON.parse(savedUser);

  if (user.email !== email || user.password !== password) {
    setError("Incorrect email or password.");
    return;
  }

  localStorage.setItem(
    "globetrotter_logged_in",
    "true"
  );

  router.push("/dashboard");
};

  return (
    <main className="min-h-screen bg-[#f7f8f3] flex items-center justify-center p-6">
      <div className="w-full max-w-6xl overflow-hidden rounded-3xl bg-white shadow-2xl lg:grid lg:grid-cols-2">
        
        {/* LEFT SIDE */}
        <div className="relative hidden min-h-[650px] overflow-hidden bg-[#163c35] lg:block">
          <div className="absolute inset-0 bg-gradient-to-br from-[#163c35] via-[#24594d] to-[#0e2924]" />

          <div className="relative z-10 flex h-full flex-col justify-between p-12 text-white">
            <div>
              <div className="mb-10 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#f4c95d] text-xl">
                  ✈
                </div>
                <span className="text-2xl font-bold">
                  GlobeTrotter
                </span>
              </div>

              <h1 className="max-w-md text-5xl font-bold leading-tight">
                Your journey.
                <br />
                <span className="text-[#f4c95d]">Your story.</span>
              </h1>

              <p className="mt-6 max-w-md text-lg leading-8 text-white/70">
                Plan unforgettable multi-city adventures, discover amazing
                destinations, and keep every part of your journey in one place.
              </p>
            </div>

            <div>
              <div className="mb-4 text-6xl">🌍</div>
              <p className="text-sm text-white/50">
                Plan • Explore • Experience
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="flex min-h-[650px] items-center justify-center px-7 py-12 sm:px-12">
          <div className="w-full max-w-md">
            
            {/* MOBILE LOGO */}
            <div className="mb-10 flex items-center gap-3 lg:hidden">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#163c35] text-lg text-white">
                ✈
              </div>
              <span className="text-xl font-bold text-[#163c35]">
                GlobeTrotter
              </span>
            </div>

            <div className="mb-10">
              <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-[#d39f20]">
                Welcome back
              </p>

              <h2 className="text-4xl font-bold tracking-tight text-[#163c35]">
                Sign in to travel
              </h2>

              <p className="mt-3 text-gray-500">
                Continue planning your next adventure.
              </p>
            </div>

            {/* LOGIN FORM */}
            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  Email address
                </label>

                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-gray-900 outline-none focus:border-[#163c35]"
                />
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="text-sm font-semibold text-gray-700"
                  >
                    Password
                  </label>

                  <button
                    type="button"
                    className="text-sm font-medium text-[#163c35] hover:underline"
                    onClick={() => alert("Password reset coming soon!")}
                  >
                    Forgot password?
                  </button>
                </div>

                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 pr-20 text-gray-900 outline-none focus:border-[#163c35]"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-500"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              {error && (
                <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="w-full rounded-xl bg-[#163c35] py-4 font-semibold text-white transition hover:bg-[#0e2c27]"
              >
                Log in →
              </button>
            </form>

            <div className="my-8 flex items-center gap-4">
              <div className="h-px flex-1 bg-gray-200" />
              <span className="text-sm text-gray-400">or</span>
              <div className="h-px flex-1 bg-gray-200" />
            </div>

            <p className="text-center text-sm text-gray-500">
              Don&apos;t have an account?{" "}
              <Link
                href="/signup"
                className="font-bold text-[#163c35] hover:underline"
              >
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}