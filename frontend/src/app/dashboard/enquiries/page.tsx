"use client";

import { useState, useEffect } from "react";
import { Users, Phone, Mail, Search, BookOpen, Calendar, Loader2, MessageSquare } from "lucide-react";

interface Enquiry {
  id: number;
  name: string;
  phone: string;
  email: string | null;
  course: string | null;
  created_at: string;
}

export default function EnquiriesPage() {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [isFetching, setIsFetching] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchEnquiries();
  }, []);

  const fetchEnquiries = async () => {
    setIsFetching(true);
    const token = localStorage.getItem("token");
    try {
      const response = await fetch("http://localhost:8000/api/v1/ai/enquiries", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setEnquiries(data);
      }
    } catch (err) {
      console.error("Failed to fetch enquiries", err);
    } finally {
      setIsFetching(false);
    }
  };

  const filteredEnquiries = enquiries.filter(enq => {
    const query = searchQuery.toLowerCase();
    return (
      enq.name.toLowerCase().includes(query) ||
      enq.phone.includes(query) ||
      (enq.email && enq.email.toLowerCase().includes(query)) ||
      (enq.course && enq.course.toLowerCase().includes(query))
    );
  });

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-[#0F172A]">Student Enquiries</h1>
        <p className="text-gray-500 text-sm">Monitor student leads captured directly from your Admissions Chatbots.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-xl bg-red-50 text-[#A40C24] shrink-0">
            <Users size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Enquiries</p>
            <p className="text-2xl font-black text-gray-900 mt-1">{isFetching ? "..." : enquiries.length}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-xl bg-green-50 text-green-600 shrink-0">
            <Phone size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Active Mobile Leads</p>
            <p className="text-2xl font-black text-gray-900 mt-1">{isFetching ? "..." : enquiries.filter(e => e.phone).length}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-xl bg-blue-50 text-blue-600 shrink-0">
            <BookOpen size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Unique Courses Selected</p>
            <p className="text-2xl font-black text-gray-900 mt-1">
              {isFetching ? "..." : new Set(enquiries.map(e => e.course).filter(Boolean)).size}
            </p>
          </div>
        </div>
      </div>

      {/* Search and Table Container */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-8 py-6 border-b border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input 
              type="text" 
              placeholder="Search enquiries..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-1 focus:ring-[#A40C24] focus:border-[#A40C24] outline-none text-sm transition-all bg-gray-50/50"
            />
          </div>
          <button 
            onClick={fetchEnquiries}
            className="text-xs font-bold text-[#A40C24] hover:underline"
          >
            Refresh List
          </button>
        </div>

        <div className="overflow-x-auto">
          {isFetching ? (
            <div className="p-12 flex flex-col items-center justify-center text-gray-400 gap-4">
              <Loader2 className="animate-spin h-8 w-8" />
              <p className="text-sm italic">Retrieving captured enquiries...</p>
            </div>
          ) : filteredEnquiries.length === 0 ? (
            <div className="p-12 flex flex-col items-center justify-center text-gray-400 gap-4">
              <Users size={48} className="opacity-20" />
              <p className="text-sm italic">No enquiries match your search.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50/50">
                <tr>
                  <th className="px-8 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Student Details</th>
                  <th className="px-8 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Course of Interest</th>
                  <th className="px-8 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Date Captured</th>
                  <th className="px-8 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Quick Connect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredEnquiries.map((enq) => (
                  <tr key={enq.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-8 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-[#0F172A]">{enq.name}</span>
                        <div className="flex gap-4 mt-1 text-[11px] text-gray-500 font-medium">
                          <span className="flex items-center gap-1"><Phone size={11} /> {enq.phone}</span>
                          {enq.email && <span className="flex items-center gap-1"><Mail size={11} /> {enq.email}</span>}
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-4 text-sm font-semibold text-gray-700">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-red-50 text-[#A40C24]">
                        <BookOpen size={10} />
                        {enq.course || "General Inquiry"}
                      </span>
                    </td>
                    <td className="px-8 py-4">
                      <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                        <Calendar size={12} className="text-gray-400" />
                        {new Date(enq.created_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                      </div>
                    </td>
                    <td className="px-8 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* WhatsApp Redirect */}
                        <a 
                          href={`https://wa.me/91${enq.phone}?text=Hi%20${encodeURIComponent(enq.name)},%20this%20is%20MMCC%20Admissions%20office.%20We%20received%20your%20admission%20enquiry%20regarding%20${encodeURIComponent(enq.course || "Admission")}.`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-colors"
                          title="Connect on WhatsApp"
                        >
                          <MessageSquare size={16} />
                        </a>
                        {/* Standard Call */}
                        <a 
                          href={`tel:${enq.phone}`}
                          className="p-1.5 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                          title="Call Student"
                        >
                          <Phone size={16} />
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
