"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, CheckCircle2 } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    email: "",
    admin_name: "",
    admin_password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(`http://localhost:8000/api/v1/auth/register-college?admin_name=${encodeURIComponent(formData.admin_name)}&admin_password=${encodeURIComponent(formData.admin_password)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          slug: formData.slug,
          email: formData.email,
          subscription_plan: "premium"
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || "Registration failed");
      }

      setIsSuccess(true);
      setTimeout(() => router.push("/login"), 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 text-center space-y-4 max-w-md w-full">
          <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto" />
          <h1 className="text-2xl font-bold text-gray-900">Registration Successful!</h1>
          <p className="text-gray-500 text-sm">Your college has been registered. Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col items-center justify-center p-6 py-12 relative">
      <Link href="/" className="absolute top-8 left-8 flex items-center gap-2 text-sm text-[#A40C24] font-semibold hover:underline transition-all">
        <ArrowLeft className="h-4 w-4" />
        Back to college site
      </Link>

      <div className="w-full max-w-lg">
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
            <h1 className="text-xl font-bold text-gray-900">Register College Portal</h1>
            <p className="text-gray-500 text-xs mt-1">Deploy an AI admissions RAG assistant for your college</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">College Name</label>
                <input
                  name="name"
                  type="text"
                  required
                  className="w-full px-4 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#A40C24] focus:border-[#A40C24] transition-all"
                  placeholder="MMCC Pune"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">URL Slug</label>
                <input
                  name="slug"
                  type="text"
                  required
                  className="w-full px-4 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#A40C24] focus:border-[#A40C24] transition-all"
                  placeholder="mmcc"
                  value={formData.slug}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Official Email</label>
              <input
                name="email"
                type="email"
                required
                className="w-full px-4 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#A40C24] focus:border-[#A40C24] transition-all"
                placeholder="admissions@mmcc.edu.in"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div className="pt-4 border-t mt-4">
              <p className="text-xs font-bold text-[#A40C24] uppercase tracking-widest mb-4">Admin Account</p>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Admin Full Name</label>
                  <input
                    name="admin_name"
                    type="text"
                    required
                    className="w-full px-4 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#A40C24] focus:border-[#A40C24] transition-all"
                    placeholder="Admissions Officer"
                    value={formData.admin_name}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Admin Password</label>
                  <input
                    name="admin_password"
                    type="password"
                    required
                    className="w-full px-4 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#A40C24] focus:border-[#A40C24] transition-all"
                    placeholder="••••••••"
                    value={formData.admin_password}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            {error && (
              <p className="text-red-600 text-xs font-semibold bg-red-50 p-2.5 rounded-lg border border-red-100">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#A40C24] hover:bg-[#830a1c] text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all shadow-sm hover:shadow active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none mt-6"
            >
              {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              {isLoading ? "Creating Account..." : "Register College"}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t text-center">
            <p className="text-xs text-gray-500">
              Already registered?{" "}
              <Link href="/login" className="text-[#A40C24] font-bold hover:underline">
                Login here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
