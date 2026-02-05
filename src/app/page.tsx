"use client";

import { useState } from "react";

export default function Home() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

async function analyze() {
  setLoading(true);

  const res = await fetch("/api/analyze", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      price: 12000,
      images: [
        "data:image/jpeg;base64,TEST"
      ],
    })
  });

  const data = await res.json();
  console.log("API response:", data);

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
  	  <div className="text-sm whitespace-pre-wrap">
    	    {result.analysis}
  	  </div>
	)}


        <button className="w-full py-2 rounded-lg border">
          Review today’s drops
        </button>
      </div>
    </main>
  );
}