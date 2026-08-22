"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!name || !email || !password || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
          confirmPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.error || "Failed to create account.");
        return;
      }

      alert("Account created successfully!");
      router.push("/");
    } catch (err) {
      setError("Something went wrong. Please check your network connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f7f8f3] flex items-center justify-center p-6">
      <div className="w-full max-w-6xl overflow-hidden rounded-3xl bg-white shadow-2xl lg:grid lg:grid-cols-2">

        {/* LEFT SIDE */}
        <div className="relative hidden min-h-[700px] overflow-hidden bg-[#163c35] lg:block">
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
                Start your
                <br />
                <span className="text-[#f4c95d]">
                  adventure.
                </span>
              </h1>

              <p className="mt-6 max-w-md text-lg leading-8 text-white/70">
                Create your account and start planning personalized
                multi-city adventures with GlobeTrotter.
              </p>
            </div>

            <div>
              <div className="mb-4 text-6xl">
                🌍
              </div>

              <p className="text-sm text-white/50">
                Plan • Explore • Experience
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="flex min-h-[700px] items-center justify-center px-7 py-12 sm:px-12">
          <div className="w-full max-w-md">

            <div className="mb-8">
              <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-[#d39f20]">
                Get started
              </p>

              <h2 className="text-4xl font-bold tracking-tight text-[#163c35]">
                Create your account
              </h2>

              <p className="mt-3 text-gray-500">
                Your next adventure starts here.
              </p>
            </div>

            <form onSubmit={handleSignup} className="space-y-4">

              {/* NAME */}
              <div>
                <label
                  htmlFor="name"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  Full name
                </label>

                <input
                  id="name"
                  type="text"
                  placeholder="Sanket Patil"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-gray-900 outline-none transition focus:border-[#163c35] focus:bg-white"
                />
              </div>

              {/* EMAIL */}
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
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-gray-900 outline-none transition focus:border-[#163c35] focus:bg-white"
                />
              </div>

              {/* PASSWORD */}
              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  Password
                </label>

                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Minimum 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 pr-20 text-gray-900 outline-none transition focus:border-[#163c35] focus:bg-white"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              {/* CONFIRM PASSWORD */}
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  Confirm password
                </label>

                <input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="Re-enter your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-gray-900 outline-none transition focus:border-[#163c35] focus:bg-white"
                />
              </div>

              {/* ERROR */}
              {error && (
                <div className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                  {error}
                </div>
              )}

              {/* CREATE ACCOUNT */}
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-[#163c35] py-4 font-semibold text-white shadow-lg transition hover:bg-[#0e2c27] disabled:opacity-50"
              >
                {loading ? "Creating account..." : "Create account →"}
              </button>
            </form>

            {/* LOGIN LINK */}
            <p className="mt-8 text-center text-sm text-gray-500">
              Already have an account?{" "}
              <Link
                href="/"
                className="font-bold text-[#163c35] hover:underline"
              >
                Log in
              </Link>
            </p>

          </div>
        </div>
      </div>
    </main>
  );
}