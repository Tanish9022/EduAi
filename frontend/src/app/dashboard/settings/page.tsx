"use client";

import { User, Shield, CreditCard, Bell, Save } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-[#0F172A]">Settings</h1>
        <p className="text-gray-500 text-sm">Manage your college profile and application settings.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Settings Navigation */}
        <div className="space-y-1">
          {[
            { name: "Profile", icon: User, active: true },
            { name: "Security", icon: Shield, active: false },
            { name: "Billing", icon: CreditCard, active: false },
            { name: "Notifications", icon: Bell, active: false },
          ].map((item) => (
            <button 
              key={item.name}
              className={`flex items-center gap-3 w-full px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                item.active ? "bg-black text-white shadow-md" : "text-gray-500 hover:bg-white hover:text-black"
              }`}
            >
              <item.icon size={18} />
              {item.name}
            </button>
          ))}
        </div>

        {/* Settings Content */}
        <div className="md:col-span-3 space-y-6">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 space-y-6">
            <h3 className="font-bold text-[#0F172A]">College Profile</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">College Name</label>
                <input 
                  type="text" 
                  defaultValue="EduAI University"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black focus:border-transparent outline-none text-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Official Email</label>
                <input 
                  type="email" 
                  defaultValue="admissions@eduai-uni.edu"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black focus:border-transparent outline-none text-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">URL Slug</label>
                <input 
                  type="text" 
                  defaultValue="eduai-uni"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-400 outline-none text-sm cursor-not-allowed"
                  disabled
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Plan</label>
                <div className="px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm font-bold text-black flex items-center justify-between">
                  Standard Plan
                  <span className="text-[10px] text-green-600 bg-green-50 px-2 py-0.5 rounded-full">ACTIVE</span>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t flex justify-end">
              <button className="bg-black text-white px-8 py-2.5 rounded-xl font-semibold flex items-center gap-2 transition-opacity hover:opacity-90">
                <Save size={18} />
                Save Changes
              </button>
            </div>
          </div>

          <div className="bg-red-50 p-8 rounded-2xl border border-red-100 flex items-center justify-between">
            <div>
              <h4 className="font-bold text-red-700">Danger Zone</h4>
              <p className="text-xs text-red-600 mt-1">Permanently delete your college data and AI indices.</p>
            </div>
            <button className="bg-red-600 text-white px-6 py-2 rounded-xl text-sm font-bold hover:bg-red-700 transition-colors">
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
