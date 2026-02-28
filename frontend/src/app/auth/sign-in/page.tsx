"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/ui/Navbar";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Auth wiring added in Chunk 7
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Full-bleed illustrated background */}
      <div className="relative flex-1 flex items-center justify-center overflow-hidden pt-16">
        {/* Blue background */}
        <div className="absolute inset-0 bg-brand-vivid" />

        {/* Decorative illustration shapes */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Large phone shape — bottom left */}
          <svg
            className="absolute -bottom-8 -left-16 opacity-90 hidden sm:block"
            width="520"
            height="380"
            viewBox="0 0 520 380"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Phone body */}
            <rect
              x="20"
              y="40"
              width="260"
              height="420"
              rx="24"
              transform="rotate(-15 20 40)"
              fill="#1597CC"
            />
            {/* Phone screen */}
            <rect
              x="44"
              y="76"
              width="216"
              height="330"
              rx="8"
              transform="rotate(-15 44 76)"
              fill="#1BAFE8"
            />
            {/* DONATE text on screen */}
            <text
              transform="rotate(-15 160 240)"
              x="60"
              y="250"
              fontSize="36"
              fontWeight="800"
              fill="#164d5e"
              opacity="0.7"
              letterSpacing="4"
            >
              DONATE
            </text>
            {/* Home button */}
            <circle
              cx="155"
              cy="415"
              r="14"
              transform="rotate(-15 155 415)"
              fill="#1597CC"
            />
          </svg>

          {/* Coin — centre-top */}
          <svg
            className="absolute top-8 left-1/2 -translate-x-1/2 opacity-90"
            width="120"
            height="120"
            viewBox="0 0 120 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="60" cy="60" r="54" fill="#F5C842" />
            <circle cx="60" cy="60" r="44" fill="#F0B429" />
            <text
              x="60"
              y="68"
              textAnchor="middle"
              fontSize="28"
              fontWeight="800"
              fill="#B8860B"
            >
              P
            </text>
          </svg>

          {/* Abstract circles — top right */}
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-brand-vivid-dark opacity-40" />
          <div className="absolute top-8 right-8 w-48 h-48 rounded-full bg-brand-blue opacity-20" />
          <div className="absolute bottom-8 right-1/4 w-32 h-32 rounded-full bg-white opacity-10" />
        </div>

        {/* Sign-in card */}
        <div className="relative z-10 w-full max-w-sm mx-4 sm:mx-auto">
          <div className="card px-8 py-9">
            <h1 className="text-2xl font-bold text-brand-teal normal-case tracking-normal mb-1">
              Sign in
            </h1>
            <p className="text-gray-500 text-sm mb-6 leading-relaxed">
              Welcome back. Sign in to donate or manage your account.
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {/* Email */}
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="input-field"
              />

              {/* Password */}
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="input-field"
              />

              {/* Remember me */}
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded accent-brand-teal cursor-pointer"
                />
                <span className="text-sm text-gray-600">Remember me</span>
              </label>

              {/* Submit row */}
              <div className="flex items-center gap-4 mt-1">
                <button type="submit" className="btn-primary">
                  Sign in
                </button>
                <Link
                  href="/auth/forgot-password"
                  className="text-sm text-brand-teal hover:text-brand-vivid transition-colors"
                >
                  Forgot your password?
                </Link>
              </div>

              {/* Register link */}
              <Link
                href="/auth/register"
                className="text-sm font-bold text-brand-teal hover:text-brand-vivid
                           transition-colors mt-1 w-fit"
              >
                Register new account
              </Link>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
