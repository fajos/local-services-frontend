"use client";

import React, { useState, useEffect, useRef } from "react";
import API from "@/lib/api";
import { toast } from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import { PaperAirplaneIcon, XMarkIcon } from "@heroicons/react/24/solid";

interface Message {
  id: string;
  sender_id: string;
  message: string;
  created_at: string;
}

interface ChatProps {
  bookingId: string;
  recipientName: string;
  onClose: () => void;
}

export default function Chat({ bookingId, recipientName, onClose }: ChatProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  const fetchMessages = async () => {
    try {
      const res = await API.get(`/chat/${bookingId}`);
      setMessages(res.data);
    } catch (err) {
      console.error("Failed to fetch messages", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [bookingId]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    const content = text;
    setText("");

    try {
      await API.post(`/chat/${bookingId}`, { message: content });
      fetchMessages();
    } catch (err) {
      toast.error("Failed to send message");
    }
  };

  return (
    <div className="flex flex-col h-[500px] w-full bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-gray-50">
        <div>
          <h3 className="text-sm font-black text-gray-900">{recipientName}</h3>
          <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Booking Chat</p>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition">
          <XMarkIcon className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
        {loading ? (
          <div className="flex justify-center py-10">
            <div className="w-6 h-6 border-2 border-cyan-200 border-t-cyan-600 rounded-full animate-spin"></div>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.sender_id === user?.id;
            return (
              <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                  isMe
                    ? "bg-cyan-600 text-white rounded-br-none"
                    : "bg-white text-gray-800 border border-gray-100 rounded-bl-none shadow-sm"
                }`}>
                  <p>{msg.message}</p>
                  <p className={`text-[10px] mt-1 ${isMe ? "text-cyan-100" : "text-gray-400"}`}>
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={scrollRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-4 bg-white border-t flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition"
        />
        <button
          type="submit"
          className="p-2 bg-cyan-600 text-white rounded-xl hover:bg-cyan-700 transition shadow-lg shadow-cyan-100"
        >
          <PaperAirplaneIcon className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
}
