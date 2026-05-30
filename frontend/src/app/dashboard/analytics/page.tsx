"use client";

import { useState, useEffect } from "react";
import { MessageSquare, Clock, Users, FileText, Loader2 } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { API_BASE_URL } from "@/config";

interface Overview {
  total_queries: number;
  avg_response_time_ms: number;
  students_helped: number;
  documents_indexed: number;
  queries_today: number;
  queries_this_week: number;
}

interface OverTimeData {
  date: string;
  count: number;
}

interface TopQuestion {
  question: string;
  count: number;
}

export default function AnalyticsPage() {
  const [overview, setOverview] = useState<Overview | null>(null);
  const [overTime, setOverTime] = useState<OverTimeData[]>([]);
  const [topQuestions, setTopQuestions] = useState<TopQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [period, setPeriod] = useState("7d");

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    const token = localStorage.getItem("token");
    const headers = { "Authorization": `Bearer ${token}` };

    try {
      const [overviewRes, timeRes, topRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/v1/analytics/overview`, { headers }),
        fetch(`${API_BASE_URL}/api/v1/analytics/queries-over-time?period=${period}`, { headers }),
        fetch(`${API_BASE_URL}/api/v1/analytics/top-questions`, { headers })
      ]);


      if (overviewRes.ok) setOverview(await overviewRes.json());
      if (timeRes.ok) setOverTime(await timeRes.json());
      if (topRes.ok) setTopQuestions(await topRes.json());
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && !overview) {
    return (
      <div className="h-96 flex items-center justify-center">
        <Loader2 className="animate-spin h-8 w-8 text-gray-400" />
      </div>
    );
  }

  const stats = [
    { label: "Total Queries", value: overview?.total_queries || 0, icon: MessageSquare, color: "text-blue-500", bg: "bg-blue-50" },
    { label: "Avg Response Time", value: overview ? `${(overview.avg_response_time_ms / 1000).toFixed(2)}s` : "0s", icon: Clock, color: "text-green-500", bg: "bg-green-50" },
    { label: "Students Helped", value: overview?.students_helped || 0, icon: Users, color: "text-purple-500", bg: "bg-purple-50" },
    { label: "Documents Indexed", value: overview?.documents_indexed || 0, icon: FileText, color: "text-orange-500", bg: "bg-orange-50" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[#0F172A]">Analytics</h1>
        <p className="text-gray-500 text-sm">Real-time usage data for your admission assistant.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div className={`p-3 rounded-xl ${stat.bg}`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{stat.label}</p>
              <p className="text-3xl font-extrabold text-[#0F172A] mt-1">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart */}
        <div className="lg:col-span-2 bg-white p-8 rounded-2xl shadow-sm border border-gray-100 h-96 flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-bold text-[#0F172A]">Queries Over Time</h3>
            <select 
              value={period} 
              onChange={(e) => setPeriod(e.target.value)}
              className="text-sm bg-gray-50 border-none rounded-lg px-3 py-1.5 focus:ring-0"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
            </select>
          </div>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={overTime}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} dx={-10} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: '1px solid #f1f5f9', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  cursor={{ stroke: '#f1f5f9', strokeWidth: 2 }}
                />
                <Line type="monotone" dataKey="count" stroke="#0F172A" strokeWidth={3} dot={{ r: 4, fill: '#0F172A', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Questions */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
          <h3 className="font-bold text-[#0F172A] mb-6">Top Questions</h3>
          <div className="space-y-4 flex-1 overflow-y-auto pr-2">
            {topQuestions.length === 0 ? (
              <p className="text-sm text-gray-400 italic text-center mt-10">No questions recorded yet.</p>
            ) : (
              topQuestions.map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-gray-50 flex items-center justify-center text-xs font-bold text-gray-500 shrink-0">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#0F172A] truncate" title={item.question}>
                      {item.question}
                    </p>
                  </div>
                  <div className="text-xs font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded-lg">
                    {item.count}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
