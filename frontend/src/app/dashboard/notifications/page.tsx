"use client";

import { useState } from "react";
import { Bell, Send, Loader2, CheckCircle2, AlertCircle, Clock } from "lucide-react";
import { API_BASE_URL } from "@/config";

export default function NotificationsPage() {
  const [message, setMessage] = useState("");
  const [channel, setChannel] = useState("whatsapp");
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setIsLoading(true);
    setStatus(null);

    const token = localStorage.getItem("token");

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/notifications/broadcast`, {

        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ message, channel }),
      });

      if (!response.ok) {
        throw new Error("Broadcast failed");
      }

      setStatus({ type: "success", message: "Broadcast sent successfully!" });
      setMessage("");
    } catch (err: any) {
      setStatus({ type: "error", message: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  const scheduledNotices = [
    { id: 1, title: "Registration Deadline Reminder", date: "June 15, 2026", status: "Scheduled", channel: "WhatsApp" },
    { id: 2, title: "Fee Payment Alert", date: "July 1, 2026", status: "Scheduled", channel: "Email" },
  ];

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-[#0F172A]">Notifications</h1>
        <p className="text-gray-500 text-sm">Send broadcasts and manage scheduled alerts for prospective students.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-xl bg-blue-50 text-blue-600">
              <Send size={24} />
            </div>
            <h3 className="font-bold text-[#0F172A]">Send Broadcast</h3>
          </div>
          
          <form onSubmit={handleBroadcast} className="flex-1 flex flex-col gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Message</label>
              <textarea 
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black focus:border-transparent outline-none text-sm resize-none h-32"
                placeholder="Type your announcement here..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Channel</label>
              <select 
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black focus:border-transparent outline-none text-sm bg-white"
                value={channel}
                onChange={(e) => setChannel(e.target.value)}
              >
                <option value="whatsapp">WhatsApp</option>
                <option value="email">Email</option>
              </select>
            </div>
            
            <div className="mt-auto pt-4">
              <button 
                type="submit"
                disabled={isLoading || !message.trim()}
                className="w-full bg-black text-white px-8 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send size={18} />}
                {isLoading ? "Sending..." : "Send Broadcast"}
              </button>
            </div>
          </form>

          {status && (
            <div className={`mt-4 p-4 rounded-xl flex items-center gap-3 text-sm ${
              status.type === "success" ? "bg-green-50 text-green-700 border border-green-100" : "bg-red-50 text-red-700 border border-red-100"
            }`}>
              {status.type === "success" ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
              {status.message}
            </div>
          )}
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-xl bg-orange-50 text-orange-600">
              <Bell size={24} />
            </div>
            <h3 className="font-bold text-[#0F172A]">Scheduled Notices</h3>
          </div>
          
          <div className="space-y-4 flex-1">
            {scheduledNotices.map((notice) => (
              <div key={notice.id} className="p-4 rounded-xl border border-gray-100 flex flex-col gap-2">
                <div className="flex justify-between items-start">
                  <span className="font-bold text-sm text-[#0F172A]">{notice.title}</span>
                  <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-full uppercase tracking-widest">{notice.status}</span>
                </div>
                <div className="flex justify-between items-center text-xs text-gray-500">
                  <span className="flex items-center gap-1"><Clock size={14} className="text-gray-400"/> {notice.date}</span>
                  <span className="font-medium bg-gray-50 px-2 py-1 rounded-md">{notice.channel}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
