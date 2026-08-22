"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");

 const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Please enter your email and password.");
      return;
    }

    if (!email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    try {
      // 1. Send the email and password to your new backend API
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      // 2. Catch invalid passwords or unregistered emails
      if (!response.ok) {
        setError(data.error || "Login failed. Please check your credentials.");
        return;
      }

      // 3. Save the REAL user data returned from the database
      localStorage.setItem("globetrotter_logged_in", "true");
      localStorage.setItem("globetrotter_user", JSON.stringify(data.user));

      if (rememberMe) {
        localStorage.setItem("globetrotter_remember", "true");
      } else {
        localStorage.removeItem("globetrotter_remember");
      }

      // 4. Send them to the dashboard!
      router.push("/dashboard");

    } catch (err) {
      setError("Something went wrong. Please check your connection.");
    }
  };

  return (
    <main className="min-h-screen bg-white">
      <div className="grid min-h-screen lg:grid-cols-2">

        {/* =====================================================
            LEFT HERO SECTION
        ====================================================== */}
        <section className="relative hidden min-h-screen overflow-hidden bg-gradient-to-br from-[#eaf3ff] via-[#f4f8ff] to-white lg:block">

          {/* Decorative dots */}
          <div className="absolute left-4 top-5 h-4 w-4 rounded-full bg-[#0868c9]" />
          <div className="absolute right-16 top-20 h-3 w-3 rounded-full bg-[#08b7d5]" />
          <div className="absolute bottom-24 right-24 h-5 w-5 rounded-full bg-[#b8d1eb]" />

          {/* Globe area */}
          <div className="absolute left-1/2 top-[42%] flex -translate-x-1/2 -translate-y-1/2 items-center justify-center">

            {/* Glow */}
            <div className="absolute h-[430px] w-[430px] rounded-full bg-[#5ca7ff]/20 blur-3xl" />

            {/* Globe */}
            <div className="relative h-[390px] w-[390px] rounded-full border-[3px] border-[#78b5f5] bg-gradient-to-br from-[#dceeff] via-[#3d9af2] to-[#0571d9] shadow-[0_0_70px_rgba(30,130,230,0.28)]">

              {/* Globe highlight */}
              <div className="absolute left-[18%] top-[12%] h-[55%] w-[38%] rounded-full bg-white/20 blur-2xl" />

              {/* Horizontal latitude lines */}
              <div className="absolute left-[5%] right-[5%] top-[28%] h-[1px] bg-white/35" />
              <div className="absolute left-[2%] right-[2%] top-1/2 h-[1px] bg-white/45" />
              <div className="absolute left-[5%] right-[5%] top-[72%] h-[1px] bg-white/35" />

              {/* Vertical longitude lines */}
              <div className="absolute left-1/2 top-0 h-full w-[1px] -translate-x-1/2 rotate-[8deg] bg-white/35" />

              <div className="absolute left-[22%] top-0 h-full w-[1px] rotate-[25deg] rounded-full bg-white/30" />

              <div className="absolute right-[22%] top-0 h-full w-[1px] -rotate-[25deg] rounded-full bg-white/30" />

              {/* Stylized continents */}
              <div className="absolute left-[18%] top-[25%] h-[95px] w-[105px] rotate-[-12deg] rounded-[45%_55%_45%_50%] bg-white/80" />

              <div className="absolute left-[29%] top-[52%] h-[105px] w-[65px] rotate-[12deg] rounded-[55%_35%_50%_45%] bg-white/75" />

              <div className="absolute right-[25%] top-[25%] h-[90px] w-[100px] rotate-[8deg] rounded-[45%_55%_45%_55%] bg-white/80" />

              <div className="absolute right-[22%] top-[53%] h-[100px] w-[65px] rotate-[-10deg] rounded-[45%_55%_40%_55%] bg-white/75" />

              {/* North Africa / Europe */}
              <div className="absolute right-[34%] top-[39%] h-[65px] w-[55px] rotate-[18deg] rounded-[40%_55%_45%_40%] bg-white/70" />

              {/* Orbit 1 */}
              <div className="absolute -left-[12%] top-[39%] h-[80px] w-[124%] rotate-[8deg] rounded-[50%] border border-white/80" />

              {/* Orbit 2 */}
              <div className="absolute -left-[7%] top-[43%] h-[105px] w-[114%] -rotate-[12deg] rounded-[50%] border border-white/70" />

              {/* Location pins */}
              <MapPin className="absolute left-[27%] top-[31%]" />
              <MapPin className="absolute right-[19%] top-[48%]" />
              <MapPin className="absolute left-[38%] bottom-[19%]" />
            </div>
          </div>

          {/* Hero copy */}
          <div className="absolute bottom-12 left-10 right-10 xl:left-12">

            <h1 className="max-w-[700px] text-5xl font-bold leading-[1.08] tracking-tight text-[#111827] xl:text-6xl">
              Discover Your{" "}
              <span className="text-[#0868c9]">
                Next Story.
              </span>
            </h1>

            <p className="mt-5 max-w-[580px] text-xl leading-9 text-[#42526b]">
              Experience the world like never before with
              personalized travel itineraries and seamless
              bookings.
            </p>
          </div>
        </section>

        {/* =====================================================
            RIGHT LOGIN SECTION
        ====================================================== */}
        <section className="flex min-h-screen items-center justify-center bg-white px-6 py-10 sm:px-10 lg:px-16 xl:px-24">

          <div className="w-full max-w-[540px]">

            {/* Brand */}
            <div className="mb-12 text-center">

              <div className="text-5xl font-light tracking-[-2px] text-[#0874c9]">
                explore
              </div>

              <div className="mt-1 text-3xl font-bold text-[#075fc0]">
                GlobeTrotter
              </div>
            </div>

            {/* Heading */}
            <div className="mb-9 text-center">

              <h2 className="text-4xl font-bold tracking-tight text-[#111827]">
                Welcome Back
              </h2>

              <p className="mt-4 text-[17px] text-[#405579]">
                Enter your credentials to access your
                personalized travel world.
              </p>
            </div>

            {/* Login form */}
            <form onSubmit={handleLogin}>

              {/* Email */}
              <div className="mb-6">

                <label
                  htmlFor="email"
                  className="mb-2.5 block text-[16px] font-medium text-[#111827]"
                >
                  Email Address
                </label>

                <div className="relative">

                  <MailIcon />

                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    autoComplete="email"
                    className="h-[55px] w-full rounded-xl border border-[#9cc5f0] bg-white pl-12 pr-4 text-[16px] text-[#172033] outline-none transition placeholder:text-[#8799b2] focus:border-[#0874c9] focus:ring-2 focus:ring-[#0874c9]/15"
                  />

                </div>
              </div>

              {/* Password */}
              <div className="mb-5">

                <label
                  htmlFor="password"
                  className="mb-2.5 block text-[16px] font-medium text-[#111827]"
                >
                  Password
                </label>

                <div className="relative">

                  <LockIcon />

                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    className="h-[55px] w-full rounded-xl border border-[#9cc5f0] bg-white pl-12 pr-14 text-[16px] text-[#172033] outline-none transition placeholder:text-[#8799b2] focus:border-[#0874c9] focus:ring-2 focus:ring-[#0874c9]/15"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#52729a] transition hover:text-[#0874c9]"
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                  >
                    <EyeIcon />
                  </button>

                </div>
              </div>

              {/* Remember / Forgot */}
              <div className="mb-7 flex items-center justify-between">

                <label className="flex cursor-pointer items-center gap-3 text-[16px] text-[#354b6b]">

                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) =>
                      setRememberMe(e.target.checked)
                    }
                    className="h-5 w-5 rounded border-[#8eabc9] accent-[#0868c9]"
                  />

                  Remember me
                </label>

                <button
                  type="button"
                  onClick={() =>
                    setError(
                      "Password recovery will be connected to the backend."
                    )
                  }
                  className="font-medium text-[#0067d0] hover:underline"
                >
                  Forgot Password?
                </button>

              </div>

              {/* Error */}
              {error && (
                <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              {/* Sign in */}
              <button
                type="submit"
                className="h-[58px] w-full rounded-xl bg-gradient-to-r from-[#0868ca] to-[#08b8d4] text-[18px] font-bold text-white shadow-md shadow-[#0874c9]/20 transition hover:brightness-105 active:scale-[0.99]"
              >
                Sign In
              </button>

            </form>

            {/* Divider */}
            <div className="my-9 flex items-center gap-4">

              <div className="h-px flex-1 bg-[#cbdcf0]" />

              <span className="text-[16px] text-[#607595]">
                Or continue with
              </span>

              <div className="h-px flex-1 bg-[#cbdcf0]" />

            </div>

            {/* Social login */}
            <div className="grid grid-cols-2 gap-4">

              <button
                type="button"
                onClick={() =>
                  setError(
                    "Google sign-in will be connected to the backend."
                  )
                }
                className="flex h-[52px] items-center justify-center gap-3 rounded-xl border border-[#a8c9ed] bg-white font-medium text-[#172033] transition hover:bg-[#f5f9ff]"
              >
                <GoogleIcon />
                Google
              </button>

              <button
                type="button"
                onClick={() =>
                  setError(
                    "Apple sign-in will be connected to the backend."
                  )
                }
                className="flex h-[52px] items-center justify-center gap-3 rounded-xl border border-[#a8c9ed] bg-white font-medium text-[#172033] transition hover:bg-[#f5f9ff]"
              >
                <AppleIcon />
                Apple
              </button>

            </div>

            {/* Signup */}
            <p className="mt-9 text-center text-[16px] text-[#526887]">

              Don&apos;t have an account?{" "}

              <Link
                href="/signup"
                className="font-bold text-[#0067d0] hover:underline"
              >
                Sign up
              </Link>

            </p>

          </div>
        </section>
      </div>
    </main>
  );
}

/* ============================================================
   ICONS
============================================================ */

function MailIcon() {
  return (
    <svg
      className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#6c86a5]"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg
      className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#6c86a5]"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <rect x="5" y="10" width="14" height="10" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" />
      <circle cx="12" cy="12" r="2.5" />
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M21.6 12.23c0-.73-.06-1.43-.19-2.1H12v3.97h5.38a4.6 4.6 0 0 1-1.99 3.02v2.51h3.22c1.89-1.74 2.99-4.3 2.99-7.4Z"
      />
      <path
        fill="#34A853"
        d="M12 22c2.7 0 4.96-.9 6.61-2.37l-3.22-2.51c-.9.6-2.05.96-3.39.96-2.61 0-4.82-1.76-5.61-4.13H3.06v2.59A9.98 9.98 0 0 0 12 22Z"
      />
      <path
        fill="#FBBC05"
        d="M6.39 13.95A6.02 6.02 0 0 1 6.08 12c0-.68.12-1.34.31-1.95V7.46H3.06A10 10 0 0 0 2 12c0 1.61.38 3.13 1.06 4.54l3.33-2.59Z"
      />
      <path
        fill="#EA4335"
        d="M12 5.92c1.47 0 2.79.5 3.83 1.49l2.87-2.87C16.96 2.93 14.7 2 12 2a9.98 9.98 0 0 0-8.94 5.46l3.33 2.59C7.18 7.68 9.39 5.92 12 5.92Z"
      />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg
      width="19"
      height="19"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.53 4.08ZM12.03 7.25C11.88 5.02 13.69 3.18 15.75 3c.29 2.58-2.34 4.5-3.72 4.25Z" />
    </svg>
  );
}

function MapPin({ className }: { className: string }) {
  return (
    <div className={className}>
      <div className="relative flex h-5 w-5 items-center justify-center rounded-full bg-[#08b7d5] shadow-[0_0_12px_rgba(8,183,213,0.8)]">
        <div className="h-2 w-2 rounded-full bg-white" />
      </div>
    </div>
  );
}