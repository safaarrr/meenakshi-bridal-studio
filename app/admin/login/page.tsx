"use client";

import { FormEvent, useState } from "react";

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Invalid login details.");
        return;
      }

      window.location.href = "/admin";
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-black px-6 text-white">

      {/* Background glow */}

      <div className="pointer-events-none fixed left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#9c810c]/10 blur-3xl" />

      {/* Login Card */}

      <div className="relative z-10 w-full max-w-md">

        {/* Brand */}

        <div className="mb-10 text-center">

          <p className="text-xs font-semibold uppercase tracking-[0.45em] text-[#9c810c]">
            Meenakshi Bridal Studio
          </p>

          <h1 className="mt-4 text-3xl font-bold">
            Admin Login
          </h1>

          <p className="mt-3 text-sm text-white/40">
            Sign in to manage your website.
          </p>

        </div>


        {/* Card */}

        <div className="rounded-2xl border border-white/10 bg-[#080808] p-8 shadow-2xl">

          <form
            onSubmit={handleLogin}
            className="space-y-6"
          >

            {/* Username */}

            <div>

              <label
                htmlFor="username"
                className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-white/50"
              >
                Username
              </label>

              <input
                id="username"
                type="text"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                placeholder="Enter username"
                autoComplete="username"
                required
                className="w-full rounded-lg border border-white/10 bg-black px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-[#9c810c]"
              />

            </div>


            {/* Password */}

            <div>

              <label
                htmlFor="password"
                className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-white/50"
              >
                Password
              </label>

              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter password"
                autoComplete="current-password"
                required
                className="w-full rounded-lg border border-white/10 bg-black px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-[#9c810c]"
              />

            </div>


            {/* Error */}

            {error && (
              <div className="rounded-lg border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-400">
                {error}
              </div>
            )}


            {/* Button */}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-[#9c810c] px-5 py-3.5 font-bold text-white transition duration-300 hover:bg-white hover:text-black disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>

          </form>


          {/* Website */}

          <a
            href="/"
            className="mt-6 block text-center text-xs text-white/30 transition hover:text-[#9c810c]"
          >
            ← Back to Website
          </a>

        </div>

      </div>

    </main>
  );
}