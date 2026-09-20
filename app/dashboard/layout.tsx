"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { 
  LayoutDashboard, BookOpen, LogOut, Menu, X, 
  ShieldCheck, GraduationCap, Briefcase, ChevronRight 
} from "lucide-react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [role, setRole] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const token = localStorage.getItem("token");
    const roleId = localStorage.getItem("role_id");

    if (!token) {
      router.push("/login");
      return;
    }
    
    if (roleId === "1") setRole("Admin");
    else if (roleId === "2") setRole("Guru");
    else if (roleId === "3") setRole("Siswa");
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role_id");
    router.push("/login");
  };

  if (!isClient) return null;

  // Komponen Helper untuk Link Sidebar yang rapi
  const SidebarLink = ({ href, icon: Icon, label, colorClass }: any) => {
    const isActive = pathname.includes(href);
    return (
      <Link 
        href={href} 
        className={`group flex items-center justify-between px-3 py-3 rounded-xl transition-all duration-300 ${
          isActive 
            ? `bg-blue-50 border-l-4 border-blue-600 text-blue-700 shadow-sm` 
            : `text-slate-600 hover:bg-slate-50 hover:text-slate-900 border-l-4 border-transparent`
        }`}
      >
        <div className="flex items-center gap-3">
          <div className={`${isActive ? 'text-blue-600' : colorClass || 'text-slate-400 group-hover:text-slate-600'} transition-colors`}>
            <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
          </div>
          {isSidebarOpen && <span className={`font-medium ${isActive ? 'font-bold' : ''}`}>{label}</span>}
        </div>
        {isSidebarOpen && isActive && <ChevronRight size={16} className="text-blue-600" />}
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans selection:bg-blue-100 selection:text-blue-900">
      
      {/* SIDEBAR */}
      <aside className={`bg-white border-r border-slate-200 transition-all duration-500 ease-out flex flex-col fixed h-full z-30 shadow-[4px_0_24px_rgba(0,0,0,0.02)] ${isSidebarOpen ? 'w-72' : 'w-20'}`}>
        
        {/* Logo Area */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-slate-100/80">
          {isSidebarOpen && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-md shadow-blue-200">
                <span className="text-white font-black text-sm">L</span>
              </div>
              <span className="text-xl font-black text-slate-800 tracking-tight">LMS<span className="text-blue-600">Portal</span></span>
            </div>
          )}
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors">
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Menu Navigasi */}
        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-8 hide-scrollbar">
          
          {/* Section: Menu Utama */}
          <div className="space-y-2">
            {isSidebarOpen && <h3 className="px-3 text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Menu Utama</h3>}
            <SidebarLink href="/dashboard" icon={LayoutDashboard} label="Beranda Dasbor" />
          </div>

          {/* Section: Manajemen Pengguna (KHUSUS ADMIN) */}
          {role === "Admin" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-500">
              
              {/* Grup Akun */}
              <div>
                {isSidebarOpen && <h3 className="px-3 text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Kelola Pengguna</h3>}
                <div className="space-y-1">
                  <SidebarLink href="/dashboard/users/admin" icon={ShieldCheck} label="Data Administrator" colorClass="text-purple-500" />
                  <SidebarLink href="/dashboard/users/guru" icon={Briefcase} label="Data Guru Pengajar" colorClass="text-emerald-500" />
                  <SidebarLink href="/dashboard/users/siswa" icon={GraduationCap} label="Data Siswa Terdaftar" colorClass="text-amber-500" />
                </div>
              </div>

              {/* Grup Akademik & Impor Excel */}
              <div>
                {isSidebarOpen && <h3 className="px-3 text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Operasional Sekolah</h3>}
                <div className="space-y-1">
                  <SidebarLink href="/dashboard/academic/classes" icon={LayoutDashboard} label="Kelas & Wali Kelas" colorClass="text-indigo-500" />
                  <SidebarLink href="/dashboard/academic/schedules" icon={BookOpen} label="Jadwal Pelajaran" colorClass="text-rose-500" />
                  <SidebarLink href="/dashboard/academic/import" icon={Briefcase} label="Import Data (Excel)" colorClass="text-emerald-600" />
                </div>
              </div>
            </div>
          )}
          {/* Section: Akademik (GURU & SISWA) */}
          {role !== "Admin" && (
            <div className="space-y-2">
              {isSidebarOpen && <h3 className="px-3 text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Akademik</h3>}
              <SidebarLink href="/dashboard/courses" icon={BookOpen} label="Materi & Tugas" />
            </div>
          )}
        </div>

        {/* Profil Bawah */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 m-4 rounded-2xl">
          <div className={`flex items-center gap-3 mb-4 ${!isSidebarOpen && 'justify-center'}`}>
            <div className="w-10 h-10 bg-white border border-slate-200 text-blue-700 rounded-full flex items-center justify-center font-bold shadow-sm relative">
              {role.charAt(0)}
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></span>
            </div>
            {isSidebarOpen && (
              <div className="overflow-hidden">
                <p className="text-sm font-bold text-slate-800 truncate">Sistem {role}</p>
                <p className="text-xs text-slate-500 font-medium">Sedang Aktif</p>
              </div>
            )}
          </div>
          <button onClick={handleLogout} className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-slate-600 hover:text-red-600 hover:bg-red-50 transition-colors ${!isSidebarOpen && 'justify-center'}`}>
            <LogOut size={18} />
            {isSidebarOpen && <span className="font-semibold text-sm">Keluar Akun</span>}
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className={`flex-1 transition-all duration-500 ease-out ${isSidebarOpen ? 'ml-72' : 'ml-20'} flex flex-col min-h-screen`}>
        <div className="p-8 flex-1">
          {children}
        </div>
      </main>
    </div>
  );
}