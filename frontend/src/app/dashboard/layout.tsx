"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { 
  FileText, 
  MessageSquare, 
  LogOut, 
  Menu,
  X,
  User,
  Bell,
  Users,
  BookOpen,
  Calendar,
  Briefcase,
  Award,
  FileBox
} from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
    } else {
      setIsAuthenticated(true);
      // Redirect Overview to Documents directly to only keep Chat & Ingestion
      if (pathname === "/dashboard") {
        router.push("/dashboard/documents");
      }
    }
  }, [router, pathname]);

  if (!isAuthenticated) return null;

  const navItems = [
    { name: "Documents", href: "/dashboard/documents", icon: FileText },
    { name: "Students", href: "/dashboard/students", icon: User },
    { name: "Assignments", href: "/dashboard/assignments", icon: BookOpen },
    { name: "Notices", href: "/dashboard/notices", icon: Bell },
    { name: "Events", href: "/dashboard/events", icon: Calendar },
    { name: "Placements", href: "/dashboard/placements", icon: Briefcase },
    { name: "Scholarships", href: "/dashboard/scholarships", icon: Award },
    { name: "Resources", href: "/dashboard/resources", icon: FileBox },
    { name: "Enquiries", href: "/dashboard/enquiries", icon: Users },
    { name: "Chat Monitor", href: "/dashboard/chat", icon: MessageSquare },
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex">
      {/* Sidebar */}
      <aside 
        className={`${
          isSidebarOpen ? "w-64" : "w-20"
        } transition-all duration-300 bg-[#A40C24] text-white flex flex-col z-40 shadow-xl`}
      >
        <div className="h-16 flex items-center justify-between px-6 border-b border-white/10">
          {isSidebarOpen ? (
            <div className="flex flex-col">
              <span className="font-extrabold text-sm tracking-wide">MMCC Admin</span>
              <span className="text-[9px] text-red-200 font-semibold uppercase tracking-wider">Admissions RAG Portal</span>
            </div>
          ) : (
            <div className="bg-white/20 h-8 w-8 rounded-lg flex items-center justify-center font-bold text-xs">MC</div>
          )}
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-1 hover:bg-white/10 rounded-md"
          >
            {isSidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        <nav className="flex-1 py-6 px-3 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                  isActive 
                    ? "bg-white text-[#A40C24] shadow-md font-bold" 
                    : "text-red-100 hover:bg-white/10 hover:text-white"
                }`}
              >
                <item.icon size={20} />
                {isSidebarOpen && <span className="text-sm">{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 text-red-200 hover:bg-white/10 hover:text-white rounded-xl transition-all"
          >
            <LogOut size={20} />
            {isSidebarOpen && <span className="font-medium text-sm">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 z-30">
          <h2 className="text-lg font-bold text-[#A40C24]">
            {navItems.find(item => item.href === pathname)?.name || "Dashboard"}
          </h2>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-[#0F172A]">MMCC Admin</p>
                <p className="text-[10px] text-gray-500">Admissions RAG Officer</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-[#A40C24]/10 border border-[#A40C24]/20 flex items-center justify-center text-[#A40C24] font-bold">
                M
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
