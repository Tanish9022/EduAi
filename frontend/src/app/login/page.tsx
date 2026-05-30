"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, Award } from "lucide-react";
import { API_BASE_URL } from "@/config";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("username", email);
      formData.append("password", password);

      const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {

        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Invalid email or password");
      }

      const data = await response.json();
      localStorage.setItem("token", data.access_token);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col items-center justify-center p-6 relative">
      <Link href="/" className="absolute top-8 left-8 flex items-center gap-2 text-sm text-[#A40C24] font-semibold hover:underline transition-all">
        <ArrowLeft className="h-4 w-4" />
        Back to college site
      </Link>

      <div className="w-full max-w-md">
        {/* Branding header */}
        <div className="mb-6 flex flex-col items-center gap-2">
          <div className="h-14 w-14 rounded-full bg-[#A40C24] flex items-center justify-center text-white font-extrabold text-xl shadow-md">
            MMM
          </div>
          <h2 className="text-center font-extrabold text-[#A40C24] tracking-wide text-lg">MMCC Pune</h2>
          <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">Marathwada Mitra Mandal's College of Commerce</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <div className="mb-8 text-center">
            <h1 className="text-xl font-bold text-gray-900">Admin Login</h1>
            <p className="text-gray-500 text-xs mt-1">Manage documents & chatbot knowledge base</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Email Address</label>
              <input
                type="email"
                required
                className="w-full px-4 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#A40C24] focus:border-[#A40C24] transition-all"
                placeholder="admin@mmcc.edu.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Password</label>
              <input
                type="password"
                required
                className="w-full px-4 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#A40C24] focus:border-[#A40C24] transition-all"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {error && (
              <p className="text-red-600 text-xs font-semibold bg-red-50 p-2.5 rounded-lg border border-red-100 flex items-center gap-1.5">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#A40C24] hover:bg-[#830a1c] text-white py-2.5 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all shadow-sm hover:shadow active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
            >
              {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              {isLoading ? "Logging in..." : "Login"}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t text-center">
            <p className="text-xs text-gray-500">
              Don't have an account?{" "}
              <Link href="/register" className="text-[#A40C24] font-bold hover:underline">
                Register your college
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
