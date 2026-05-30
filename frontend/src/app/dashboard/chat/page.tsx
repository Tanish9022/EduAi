"use client";

import { useState, useRef, useEffect } from "react";
import { Send, User, Bot, Loader2, Sparkles, Clock, History } from "lucide-react";

interface Message {
  role: "user" | "ai";
  content: string;
}

interface ChatHistory {
  id: number;
  user_message: string;
  ai_response: string;
  response_time_ms: number;
  created_at: string;
}

export default function ChatMonitorPage() {
  const [activeTab, setActiveTab] = useState<"chat" | "history">("chat");
  const [messages, setMessages] = useState<Message[]>([
    { role: "ai", content: "Hello! I am your college's AI assistant. Ask me anything about admissions, fees, or courses." }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const [history, setHistory] = useState<ChatHistory[]>([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (activeTab === "chat") {
      scrollToBottom();
    } else {
      fetchHistory();
    }
  }, [messages, activeTab]);

  const fetchHistory = async () => {
    setIsHistoryLoading(true);
    const token = localStorage.getItem("token");
    try {
      const response = await fetch("http://localhost:8000/api/v1/ai/chat-history", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (response.ok) {
        setHistory(await response.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsHistoryLoading(false);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    const token = localStorage.getItem("token");

    try {
      const response = await fetch("http://localhost:8000/api/v1/ai/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ message: userMessage }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to get AI response");
      }

      setMessages((prev) => [...prev, { role: "ai", content: data.answer }]);
    } catch (err: any) {
      setMessages((prev) => [...prev, { role: "ai", content: `Error: ${err.message}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] max-w-5xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header & Tabs */}
      <div className="px-8 pt-4 border-b border-gray-100 bg-gray-50/50">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-black flex items-center justify-center text-white">
              <Bot size={20} />
            </div>
            <div>
              <h3 className="font-bold text-[#0F172A] text-sm">AI Chat Monitor</h3>
              <p className="text-[10px] text-green-600 font-bold flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-green-600 animate-pulse" />
                SYSTEM ONLINE
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-gray-400 bg-white px-3 py-1 rounded-full border border-gray-100 shadow-sm">
            <Sparkles size={12} className="text-yellow-500" />
            RAG ENABLED
          </div>
        </div>
        
        <div className="flex gap-6">
          <button 
            onClick={() => setActiveTab("chat")}
            className={`pb-3 text-sm font-bold border-b-2 transition-colors ${
              activeTab === "chat" ? "border-black text-black" : "border-transparent text-gray-400 hover:text-gray-600"
            }`}
          >
            Live Simulator
          </button>
          <button 
            onClick={() => setActiveTab("history")}
            className={`pb-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === "history" ? "border-black text-black" : "border-transparent text-gray-400 hover:text-gray-600"
            }`}
          >
            <History size={16} />
            Chat History
          </button>
        </div>
      </div>

      {activeTab === "chat" ? (
        <>
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-8 space-y-6">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`flex gap-3 max-w-[80%] ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${
                    msg.role === "user" ? "bg-gray-100 text-gray-500" : "bg-black text-white"
                  }`}>
                    {msg.role === "user" ? <User size={16} /> : <Bot size={16} />}
                  </div>
                  <div className={`p-4 rounded-2xl shadow-sm border ${
                    msg.role === "user" 
                      ? "bg-gray-50 border-gray-100 rounded-tr-none text-gray-700" 
                      : "bg-white border-gray-100 rounded-tl-none text-[#0F172A]"
                  }`}>
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="flex gap-3 max-w-[80%]">
                  <div className="h-8 w-8 rounded-full bg-black flex items-center justify-center text-white shrink-0">
                    <Bot size={16} />
                  </div>
                  <div className="p-4 rounded-2xl rounded-tl-none bg-gray-50 border border-gray-100 text-gray-400">
                    <Loader2 size={16} className="animate-spin" />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-6 border-t border-gray-100 bg-gray-50/30">
            <form onSubmit={handleSend} className="flex gap-3 bg-white p-2 rounded-2xl shadow-md border border-gray-100">
              <input 
                type="text" 
                className="flex-1 px-4 py-2 outline-none text-sm placeholder:text-gray-400"
                placeholder="Ask your AI assistant a question..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isLoading}
              />
              <button 
                type="submit"
                disabled={!input.trim() || isLoading}
                className="bg-black text-white p-2.5 rounded-xl transition-all hover:opacity-90 disabled:opacity-30 flex items-center justify-center"
              >
                <Send size={18} />
              </button>
            </form>
            <p className="text-center text-[10px] text-gray-400 mt-4">
              The AI uses your ingested documents as context to provide accurate answers.
            </p>
          </div>
        </>
      ) : (
        /* History Area */
        <div className="flex-1 overflow-y-auto p-8">
          {isHistoryLoading ? (
             <div className="flex justify-center py-12">
               <Loader2 className="animate-spin h-8 w-8 text-gray-400" />
             </div>
          ) : history.length === 0 ? (
             <div className="text-center py-12 text-gray-400 text-sm italic">
               No chat history found.
             </div>
          ) : (
            <div className="space-y-4">
              {history.map((h) => (
                <div key={h.id} className="border border-gray-100 rounded-xl p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] text-gray-400 font-bold uppercase">{new Date(h.created_at).toLocaleString()}</span>
                    <span className="text-[10px] flex items-center gap-1 text-gray-400"><Clock size={12}/> {h.response_time_ms}ms</span>
                  </div>
                  <div className="mb-2">
                    <span className="text-xs font-bold text-gray-500 mr-2">Q:</span>
                    <span className="text-sm text-[#0F172A]">{h.user_message}</span>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-green-600 mr-2">A:</span>
                    <span className="text-sm text-gray-600 line-clamp-2" title={h.ai_response}>{h.ai_response}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
