"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const [name, setName] = useState("");
  const router = useRouter();

  function handleStart() {
    const player = name.trim().toLowerCase();
    if (player) {
      router.push(`/play/${encodeURIComponent(player)}`);
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <h1 className="mb-8 text-4xl font-bold tracking-tight">Karaoke</h1>
      <p className="mb-8 text-lg text-stone-400">Enter your name to begin.</p>
      <div className="flex gap-3">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleStart()}
          placeholder="Your name"
          className="rounded-lg border border-stone-700 bg-stone-900 px-4 py-2 text-stone-100 placeholder-stone-500 focus:border-amber-500 focus:outline-none"
        />
        <button
          onClick={handleStart}
          disabled={!name.trim()}
          className="rounded-lg bg-amber-600 px-6 py-2 font-medium text-white transition hover:bg-amber-500 disabled:opacity-40"
        >
          Play
        </button>
      </div>
    </main>
  );
}
