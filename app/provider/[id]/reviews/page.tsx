"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import axios from "axios";

interface Review {
  id: string;
  rating: number;
  comment?: string;
  customer_name: string;
  service_name: string;
  created_at: string;
}

export default function ProviderReviews() {
  const { id } = useParams<{ id: string }>();          // provider uuid
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    axios
      .get<Review[]>(`http://localhost:8000/providers/${id}/reviews`)
      .then(({ data }) => setReviews(data))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p className="p-6">Loading reviews…</p>;

  return (
    <main className="min-h-screen bg-white text-gray-800 p-6">
      <h1 className="text-2xl font-bold text-blue-800 mb-6">Provider reviews</h1>

      {reviews.length === 0 ? (
        <p>No reviews yet.</p>
      ) : (
        <ul className="space-y-4 max-w-xl">
          {reviews.map((r) => (
            <li key={r.id} className="bg-gray-50 border p-4 rounded-lg shadow">
              <div className="flex items-center gap-2 text-yellow-600 text-sm">
                ⭐ {r.rating}/5
                <span className="text-gray-500 text-xs">{new Date(r.created_at).toLocaleDateString()}</span>
              </div>
              <p className="text-sm text-gray-700 mt-1">{r.comment || "—"}</p>
              <p className="text-xs text-gray-500 mt-2">
                Service: <strong>{r.service_name}</strong> • by {r.customer_name}
              </p>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}