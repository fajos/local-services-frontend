// components/ReviewModal.tsx
"use client";
import { useState } from "react";
import API from "@/lib/api";
import toast from "react-hot-toast";

export default function ReviewModal({ bookingId, onClose }: { bookingId: string; onClose: () => void }) {
  const [rating, setRating]   = useState(5);
  const [comment, setComment] = useState("");

  async function submit() {
    try {
      await API.post("/reviews", { booking_id: bookingId, rating, comment });
      toast.success("Thanks for reviewing!");
      onClose();
    } catch {
      toast.error("Could not submit review");
    }
  }
  return (
    <div className="fixed inset-0 bg-black/40 grid place-items-center z-50">
      <div className="bg-white p-6 rounded-xl w-80 space-y-3">
        <h3 className="font-semibold">Rate this provider</h3>
        <select value={rating} onChange={e=>setRating(+e.target.value)} className="w-full border p-2 rounded">
          {[5,4,3,2,1].map(n=><option key={n} value={n}>{n} ★</option>)}
        </select>
        <textarea placeholder="Optional comment"
                  className="w-full border p-2 rounded h-24 resize-none"
                  value={comment} onChange={e=>setComment(e.target.value)} />
        <button onClick={submit} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded">
          Submit
        </button>
      </div>
    </div>
  );
}