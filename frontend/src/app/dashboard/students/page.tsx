"use client";

import { useState, useEffect } from "react";
import { User, Phone, BookOpen, Clock, Calendar } from "lucide-react";

interface Student {
  id: number;
  phone_number: string;
  department: string | null;
  year: string | null;
  division: string | null;
  created_at: string;
}

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:8000/api/v1/students", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error("Failed to fetch students");
      const data = await res.json();
      setStudents(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-gray-500">Loading students...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-[#0F172A]">Registered Students</h2>
          <p className="text-sm text-gray-500 mt-1">
            Manage students onboarded via the WhatsApp and Website bots.
          </p>
        </div>
        <div className="bg-[#A40C24]/10 text-[#A40C24] px-4 py-2 rounded-xl font-bold">
          Total: {students.length}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-[#F8FAFC] text-gray-500 text-xs uppercase font-semibold">
              <tr>
                <th className="px-6 py-4">Phone Number</th>
                <th className="px-6 py-4">Department</th>
                <th className="px-6 py-4">Year</th>
                <th className="px-6 py-4">Division</th>
                <th className="px-6 py-4">Registered At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {students.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    No students registered yet. They will appear here once they interact with the bot.
                  </td>
                </tr>
              ) : (
                students.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900 flex items-center gap-2">
                      <Phone size={14} className="text-gray-400" />
                      {student.phone_number}
                    </td>
                    <td className="px-6 py-4">
                      {student.department ? (
                        <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-md font-medium text-xs">
                          {student.department}
                        </span>
                      ) : (
                        <span className="text-gray-400 italic">Pending</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {student.year || <span className="text-gray-400 italic">Pending</span>}
                    </td>
                    <td className="px-6 py-4">
                      {student.division || <span className="text-gray-400 italic">Pending</span>}
                    </td>
                    <td className="px-6 py-4 text-gray-400 text-xs">
                      {new Date(student.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
