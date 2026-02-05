"use client";

import { useState } from "react";

export default function Home() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  async function analyze() {
    setLoading(true);
    const res = await fetch("/api/analyze", { method: "POST" });
    const data = await res.json();
    setResult(data);
    setLoading(false);
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-neutral-50">
      <div className="max-w-md w-full p-6 bg-white rounded-xl shadow-sm space-y-4">
        <h1 className="text-xl font-medium">LuxeSense</h1>

        <p className="text-sm text-neutral-600">
          Upload photos and a price to get a calm second opinion.
        </p>

        <button
          onClick={analyze}
          className="w-full py-2 rounded-lg bg-neutral-900 text-white"
        >
          Analyze a bag
        </button>

        {loading && <p className="text-sm">Taking a careful look…</p>}

        {result && (
          <div className="text-sm space-y-2">
            <p><strong>Verdict:</strong> {result.verdict}</p>
            <p>{result.condition}</p>
            <p>{result.price}</p>
            <p>{result.explanation}</p>
          </div>
        )}

        <button className="w-full py-2 rounded-lg border">
          Review today’s drops
        </button>
      </div>
    </main>
  );
}