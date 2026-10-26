"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BookOpen, Home, Users, GraduationCap, Briefcase, Layers, Settings, LogOut, Menu, X, Award, ClipboardList, Eye, FileBarChart } from "lucide-react";
import { SchoolBrand, LogoMark } from "@/components/branding";
import { apiJSON, roleHome, endLocalSession } from "@/lib/api";

type Session = { id: string; name: string; email: string; role_id: number; expires_at: string };
function allowed(path: string, role: number) {
  if (path === "/dashboard/profile") return true;
  if (role === 6) return path === "/dashboard/super-admin" || path === "/dashboard/users/admin" || path === "/dashboard/settings";
  if (role === 4 || role === 5) return path === "/dashboard/monitor" || path.startsWith("/dashboard/monitor/");
  if (role === 1) return path === "/dashboard" || path.startsWith("/dashboard/academic/") || path.startsWith("/dashboard/courses") || (path.startsWith("/dashboard/users/") && path !== "/dashboard/users/admin");
  return path === roleHome(role) || path.startsWith(role === 2 ? "/dashboard/teacher/" : "/dashboard/student/");
}
const monitorMenus=[{name:"Ringkasan",icon:Home,path:"/dashboard/monitor"},{name:"Aktivitas Kelas",icon:Layers,path:"/dashboard/monitor/classes"},{name:"Aktivitas Guru",icon:Briefcase,path:"/dashboard/monitor/teachers"},{name:"Materi Belajar",icon:BookOpen,path:"/dashboard/monitor/materials"},{name:"Tugas & Nilai",icon:ClipboardList,path:"/dashboard/monitor/assignments"},{name:"Ujian",icon:Award,path:"/dashboard/monitor/exams"},{name:"Laporan",icon:FileBarChart,path:"/dashboard/monitor/reports"}];
const menus = {
  4: monitorMenus,
  5: monitorMenus,
  6: [
    { name: "Beranda", icon: Home, path: "/dashboard/super-admin" },
    { name: "Kelola Admin", icon: Users, path: "/dashboard/users/admin" },
    { name: "Pengaturan Sistem", icon: Settings, path: "/dashboard/settings" },
  ],
  1: [
    { name: "Beranda", icon: Home, path: "/dashboard" },
    { name: "Kepala Sekolah", icon: Eye, path: "/dashboard/users/kepsek" },
    { name: "Waka Kurikulum", icon: Eye, path: "/dashboard/users/waka" },
    { name: "Manajemen Siswa", icon: GraduationCap, path: "/dashboard/users/siswa" },
    { name: "Manajemen Guru", icon: Briefcase, path: "/dashboard/users/guru" },
    { name: "Manajemen Kelas", icon: Layers, path: "/dashboard/academic/classes" },
    { name: "Mata Pelajaran", icon: BookOpen, path: "/dashboard/academic/subjects" },
    { name: "Jadwal Kelas", icon: Layers, path: "/dashboard/academic/schedules" },
    { name: "Import Excel", icon: ClipboardList, path: "/dashboard/academic/import" },
  ],
  2: [
    { name: "Beranda", icon: Home, path: "/dashboard/teacher" },
    { name: "Kelas & Jadwal", icon: Layers, path: "/dashboard/teacher/classes" },
    { name: "Materi Belajar", icon: BookOpen, path: "/dashboard/teacher/materials" },
    { name: "Tugas & Penilaian", icon: ClipboardList, path: "/dashboard/teacher/assignments" },
    { name: "Ujian CBT", icon: Award, path: "/dashboard/teacher/exams" },
    { name: "Rekap Bulanan", icon: FileBarChart, path: "/dashboard/teacher/reports" },
  ],
  3: [
    { name: "Beranda", icon: Home, path: "/dashboard/student" },
    { name: "Materi Belajar", icon: BookOpen, path: "/dashboard/student/materials" },
    { name: "Kelas & Jadwal", icon: Layers, path: "/dashboard/student/class" },
    { name: "Rekap Nilai", icon: Award, path: "/dashboard/student/grades" },
    { name: "Ujian Saya", icon: Award, path: "/dashboard/student/exams" },
    { name: "Tugas Saya", icon: ClipboardList, path: "/dashboard/student/assignments" },
  ],
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [validatedPath, setValidatedPath] = useState("");
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  const [mobilePath, setMobilePath] = useState<string | null>(null);
  const mobileOpen = mobilePath === pathname;
  const [logoutBusy, setLogoutBusy] = useState(false);
  const [logoutError, setLogoutError] = useState("");

  useEffect(() => {
    let cancelled = false;
    let verified = false;
    let expiryTimer: ReturnType<typeof setTimeout>;
    const endSession = () => {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setSession(null);
      router.replace("/login");
    };
    const validate = async () => {
      if (!localStorage.getItem("token")) { endSession(); return; }
      try {
        const current = await apiJSON<Session>("/auth/me");
        if (cancelled) return;
        if (![1, 2, 3, 4, 5, 6].includes(current.role_id)) { endSession(); return; }
        const remaining = new Date(current.expires_at).getTime() - Date.now();
        if (!Number.isFinite(remaining) || remaining <= 0) { endSession(); return; }
        clearTimeout(expiryTimer);
        expiryTimer = setTimeout(endSession, remaining);
        verified = true;
        setSession(current);
        setError("");
        if (!allowed(pathname, current.role_id)) { router.replace(roleHome(current.role_id)); return; }
        setValidatedPath(pathname);
      } catch (err) {
        if (!cancelled && !verified) setError(err instanceof Error ? err.message : "Gagal memeriksa sesi.");
      }
    };
    const storage = (event: StorageEvent) => { if (event.key === "token" || event.key === null) { setSession(null); void validate(); } };
    void validate();
    const interval = setInterval(validate, 30000);
    window.addEventListener("session-ended", endSession);
    window.addEventListener("storage", storage);
    return () => { cancelled = true; clearInterval(interval); clearTimeout(expiryTimer); window.removeEventListener("session-ended", endSession); window.removeEventListener("storage", storage); };
  }, [pathname, router, retry]);

  useEffect(() => {
    const applyTheme = () => document.documentElement.classList.toggle("dark", localStorage.getItem("setting_dark_mode") === "true");
    applyTheme();
    window.addEventListener("theme-change", applyTheme);
    return () => window.removeEventListener("theme-change", applyTheme);
  }, []);

  useEffect(() => {
    if (!mobileOpen) return;
    const escape = (event: KeyboardEvent) => { if (event.key === "Escape") setMobilePath(null); };
    window.addEventListener("keydown", escape);
    return () => window.removeEventListener("keydown", escape);
  }, [mobileOpen]);

  const logout = async () => {
    setLogoutBusy(true);
    setLogoutError("");
    try { await apiJSON("/auth/logout", { method: "POST" }); endLocalSession(); router.replace("/login"); }
    catch (reason) { setLogoutError(reason instanceof Error ? reason.message : "Logout gagal."); }
    finally { setLogoutBusy(false); }
  };

  if (error) return <div role="alert" className="p-10 text-center space-y-4"><p>{error}</p><button onClick={() => setRetry(value => value + 1)} className="rounded-xl bg-indigo-600 px-5 py-3 text-white">Coba lagi</button><button onClick={() => { endLocalSession(); router.replace("/login"); }} className="ml-3 underline">Kembali ke login</button></div>;
  if (!session || validatedPath !== pathname || !allowed(pathname, session.role_id)) return <div role="status" className="p-10 text-center text-slate-500">Memeriksa sesi...</div>;
  const activeMenus = [...menus[session.role_id as keyof typeof menus], { name: "Akun Saya", icon: Settings, path: "/dashboard/profile" }];
  const dockPaths=session.role_id===6?["/dashboard/super-admin","/dashboard/users/admin","/dashboard/settings"]:session.role_id===1?["/dashboard","/dashboard/users/siswa","/dashboard/users/guru","/dashboard/academic/classes"]:session.role_id===2?["/dashboard/teacher","/dashboard/teacher/assignments","/dashboard/teacher/exams","/dashboard/teacher/materials"]:session.role_id===3?["/dashboard/student","/dashboard/student/assignments","/dashboard/student/exams","/dashboard/student/materials"]:["/dashboard/monitor","/dashboard/monitor/classes","/dashboard/monitor/teachers","/dashboard/monitor/reports"];
  const isActive=(path:string)=>pathname===path || (path!==roleHome(session.role_id)&&pathname.startsWith(path+"/"));
  return (
    <div className="app-shell">
      {mobileOpen && <button aria-label="Tutup navigasi" onClick={() => setMobilePath(null)} className="fixed inset-0 z-30 bg-slate-900/40 backdrop-blur-sm lg:hidden" />}
      <aside id="dashboard-navigation" className={"app-sidebar lg:flex "+(mobileOpen?"flex":"hidden")}>
        <div className="sidebar-brand"><SchoolBrand compact name="cn edu" caption="LMS Citra Negara"/><button aria-label="Tutup navigasi" className="icon-button lg:hidden" onClick={() => setMobilePath(null)}><X size={18}/></button></div>
        <p className="sidebar-label">Menu utama</p>
        <nav aria-label="Menu utama" className="sidebar-nav">
          {activeMenus.map(item => {
            const active = isActive(item.path);
            return <Link key={item.path} href={item.path} onClick={() => setMobilePath(null)} aria-current={active ? "page" : undefined} className="sidebar-link"><item.icon size={18} aria-hidden="true"/>{item.name}</Link>;
          })}
        </nav>
        <div className="sidebar-footer"><button onClick={logout} disabled={logoutBusy} className="logout-button"><LogOut size={18} aria-hidden="true"/>{logoutBusy ? "Mengakhiri sesi..." : "Keluar"}</button></div>
      </aside>
      <div className="app-workspace min-h-screen">
        <header className="app-topbar">
          <div className="flex min-w-0 items-center gap-3"><button aria-label="Buka navigasi" aria-expanded={mobileOpen} aria-controls="dashboard-navigation" onClick={() => setMobilePath(pathname)} className="icon-button lg:hidden"><Menu size={20}/></button><span className="hidden sm:inline-flex lg:hidden"><LogoMark size={30}/></span><span className="portal-title">Portal {session.role_id === 6 ? "Super Admin" : session.role_id === 1 ? "Admin" : session.role_id === 2 ? "Guru" : session.role_id===3?"Siswa":session.role_id===4?"Kepala Sekolah":"Waka Kurikulum"}</span></div>
          <Link href="/dashboard/profile" className="profile-link"><span className="profile-avatar" aria-hidden="true">{session.name.slice(0,1).toUpperCase()}</span><div className="min-w-0 text-right"><p className="max-w-[160px] truncate text-sm font-semibold sm:max-w-xs">{session.name}</p><p className="mt-0.5 hidden text-[11px] text-slate-500 sm:block">{session.email}</p></div></Link>
        </header>
        <main id="main-content" className="workspace-content">{logoutError && <p role="alert" className="mb-4 rounded-xl bg-red-50 p-4 text-red-700">{logoutError}</p>}{children}</main>
      </div>
      <nav aria-label="Navigasi bawah" className="mobile-dock">{dockPaths.map(path=>{const item=activeMenus.find(value=>value.path===path)!;return <Link key={path} href={path} aria-current={isActive(path)?"page":undefined} onClick={()=>setMobilePath(null)}><item.icon size={21} aria-hidden="true"/><span>{item.name.replace("Manajemen ","").replace("Materi Belajar","Materi").replace("Tugas & Penilaian","Tugas").replace("Ujian CBT","Ujian").replace("Aktivitas ","").replace("Tugas Saya","Tugas").replace("Ujian Saya","Ujian")}</span></Link>})}<button aria-label="Menu lainnya" aria-expanded={mobileOpen} aria-controls="dashboard-navigation" onClick={()=>setMobilePath(mobileOpen?null:pathname)}><Menu size={21} aria-hidden="true"/><span>Lainnya</span></button></nav>
    </div>
  );
}
