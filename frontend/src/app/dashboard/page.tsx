"use client";

import { Users, User, MessageSquare, Clock, Smartphone, TrendingUp, ArrowUpRight } from "lucide-react";

export default function DashboardPage() {
  const stats = [
    { label: "Total Queries", value: "12,480", icon: MessageSquare, change: "+12.5%", color: "text-blue-500", bg: "bg-blue-50" },
    { label: "Response Time", value: "1.2s", icon: Clock, change: "-0.4s", color: "text-green-500", bg: "bg-green-50" },
    { label: "Students Helped", value: "8,300", icon: Users, change: "+18%", color: "text-purple-500", bg: "bg-purple-50" },
    { label: "WhatsApp Chats", value: "4,900", icon: Smartphone, change: "+5.2%", color: "text-orange-500", bg: "bg-orange-50" },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#0F172A]">Welcome back, Admin</h1>
        <p className="text-gray-500 text-sm">Here's what's happening with your admission bot today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div className={`p-3 rounded-xl ${stat.bg}`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <div className="flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                <TrendingUp size={12} />
                {stat.change}
              </div>
            </div>
            <div className="mt-4">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{stat.label}</p>
              <p className="text-3xl font-extrabold text-[#0F172A] mt-1">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Queries Chart Placeholder */}
        <div className="lg:col-span-2 bg-white p-8 rounded-2xl shadow-sm border border-gray-100 h-96 flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-bold text-[#0F172A]">Query Traffic</h3>
            <select className="text-sm bg-gray-50 border-none rounded-lg px-3 py-1.5 focus:ring-0">
              <option>Last 7 days</option>
              <option>Last 30 days</option>
            </select>
          </div>
          <div className="flex-1 flex items-center justify-center border-2 border-dashed border-gray-100 rounded-xl bg-gray-50/50">
            <p className="text-gray-400 text-sm italic">Analytics chart will appear here</p>
          </div>
        </div>

        {/* Recent Activity List */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
          <h3 className="font-bold text-[#0F172A] mb-6">Recent Activity</h3>
          <div className="space-y-6 flex-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                  <User size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-[#0F172A] truncate">New student query via WhatsApp</p>
                  <p className="text-[10px] text-gray-500">2 minutes ago</p>
                </div>
                <ArrowUpRight size={16} className="text-gray-300" />
              </div>
            ))}
          </div>
          <button className="mt-8 text-sm font-bold text-black hover:underline text-center">View all activity</button>
        </div>
      </div>
    </div>
  );
}
