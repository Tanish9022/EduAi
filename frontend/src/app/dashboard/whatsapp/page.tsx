"use client";

import { useState, useEffect } from "react";
import { Phone, Copy, CheckCircle2, Loader2, MessageSquare } from "lucide-react";

interface WhatsAppMessage {
  id: number;
  user_message: string;
  ai_response: string;
  created_at: string;
}

export default function WhatsAppPage() {
  const [messages, setMessages] = useState<WhatsAppMessage[]>([]);
  const [isFetching, setIsFetching] = useState(true);
  const [copied, setCopied] = useState(false);

  const webhookUrl = "https://yourdomain.com/api/v1/whatsapp/webhook";

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    setIsFetching(true);
    const token = localStorage.getItem("token");
    try {
      const response = await fetch("http://localhost:8000/api/v1/ai/chat-history", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        // Since we don't have a specific 'source' field in ChatLog yet, 
        // we'll just show the latest history as a proxy for the demo.
        // In a real app, filter by source='whatsapp'
        setMessages(data.slice(0, 20));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsFetching(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(webhookUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-[#0F172A]">WhatsApp Integration</h1>
        <p className="text-gray-500 text-sm">Connect your admission assistant to Meta WhatsApp Business API.</p>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex items-start gap-6">
        <div className="p-4 rounded-full bg-green-50 text-green-600 shrink-0">
          <Phone size={32} />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-[#0F172A] flex items-center gap-2">
            Status: <span className="text-orange-500 text-sm">Not Configured</span>
          </h3>
          <p className="text-sm text-gray-500 mt-2">
            To enable WhatsApp replies, set your <code>WHATSAPP_TOKEN</code> and <code>WHATSAPP_PHONE_NUMBER_ID</code> in the backend `.env` file.
          </p>
          
          <div className="mt-6">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-2">Webhook URL</label>
            <div className="flex items-center gap-2">
              <code className="flex-1 bg-gray-50 border border-gray-100 px-4 py-2.5 rounded-xl text-sm text-gray-600">
                {webhookUrl}
              </code>
              <button 
                onClick={copyToClipboard}
                className="bg-black text-white px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 hover:opacity-90 transition-opacity"
              >
                {copied ? <CheckCircle2 size={18} className="text-green-400" /> : <Copy size={18} />}
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-2">Paste this URL into your Meta Developer Portal Webhook configuration.</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-bold text-[#0F172A]">Recent WhatsApp Messages</h3>
          <button onClick={fetchMessages} className="text-xs font-bold text-blue-600 hover:underline">Refresh</button>
        </div>
        
        <div className="p-8">
          {isFetching ? (
            <div className="flex flex-col items-center justify-center text-gray-400 gap-4 py-8">
              <Loader2 className="animate-spin h-8 w-8" />
              <p className="text-sm italic">Loading messages...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-gray-400 gap-4 py-8">
              <MessageSquare size={48} className="opacity-20" />
              <p className="text-sm italic">No messages received yet.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {messages.map((msg) => (
                <div key={msg.id} className="border border-gray-100 rounded-xl p-4 flex flex-col gap-3">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] text-gray-400 font-bold uppercase">{new Date(msg.created_at).toLocaleString()}</span>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700">
                    <span className="font-bold mr-2 text-gray-500">User:</span> {msg.user_message}
                  </div>
                  <div className="bg-green-50/50 rounded-lg p-3 text-sm text-gray-700">
                    <span className="font-bold mr-2 text-green-600">AI:</span> {msg.ai_response}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
