"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BookOpen, Home, Users, GraduationCap, Briefcase, Layers, Settings, LogOut, Menu, X, Award, ClipboardList } from "lucide-react";
import { apiJSON, roleHome, endLocalSession } from "@/lib/api";

type Session = { id: string; name: string; email: string; role_id: number; expires_at: string };
function allowed(path: string, role: number) {
  if (path === "/dashboard/profile") return true;
  if (role === 1) return path === "/dashboard" || ["/dashboard/users/", "/dashboard/academic/", "/dashboard/settings", "/dashboard/courses"].some(prefix => path.startsWith(prefix));
  return path === roleHome(role) || path.startsWith(role === 2 ? "/dashboard/teacher/" : "/dashboard/student/");
}
const menus = {
  1: [
    { name: "Beranda", icon: Home, path: "/dashboard" },
    { name: "Manajemen Akun", icon: Users, path: "/dashboard/users/admin" },
    { name: "Manajemen Siswa", icon: GraduationCap, path: "/dashboard/users/siswa" },
    { name: "Manajemen Guru", icon: Briefcase, path: "/dashboard/users/guru" },
    { name: "Manajemen Kelas", icon: Layers, path: "/dashboard/academic/classes" },
    { name: "Mata Pelajaran", icon: BookOpen, path: "/dashboard/academic/subjects" },
    { name: "Jadwal Kelas", icon: Layers, path: "/dashboard/academic/schedules" },
    { name: "Import Excel", icon: ClipboardList, path: "/dashboard/academic/import" },
    { name: "Pengaturan Sistem", icon: Settings, path: "/dashboard/settings" },
  ],
  2: [
    { name: "Beranda", icon: Home, path: "/dashboard/teacher" },
    { name: "Kelas & Jadwal", icon: Layers, path: "/dashboard/teacher/classes" },
    { name: "Materi Belajar", icon: BookOpen, path: "/dashboard/teacher/materials" },
    { name: "Tugas & Penilaian", icon: ClipboardList, path: "/dashboard/teacher/assignments" },
    { name: "Ujian CBT", icon: Award, path: "/dashboard/teacher/exams" },
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
        if (![1, 2, 3].includes(current.role_id)) { endSession(); return; }
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
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      {mobileOpen && <button aria-label="Tutup navigasi" onClick={() => setMobilePath(null)} className="fixed inset-0 z-30 bg-slate-900/50 lg:hidden" />}
      <aside id="dashboard-navigation" className={`fixed inset-y-0 left-0 z-40 w-[280px] flex-col border-r border-slate-200 bg-white lg:flex ${mobileOpen ? "flex" : "hidden"}`}>
        <div className="flex h-20 items-center justify-between border-b border-slate-100 px-6">
          <span className="flex items-center gap-3 text-xl font-black"><BookOpen className="text-indigo-600" /> cn edu</span>
          <button aria-label="Tutup navigasi" className="lg:hidden p-2" onClick={() => setMobilePath(null)}><X /></button>
        </div>
        <nav aria-label="Menu utama" className="flex-1 space-y-2 overflow-y-auto p-4">
          {activeMenus.map(item => {
            const active = pathname === item.path || (item.path !== "/dashboard" && item.path !== "/dashboard/teacher" && item.path !== "/dashboard/student" && pathname.startsWith(item.path + "/"));
            return <Link key={item.path} href={item.path} onClick={() => setMobilePath(null)} aria-current={active ? "page" : undefined} className={`flex items-center gap-3 rounded-2xl px-4 py-3.5 font-bold ${active ? "bg-indigo-50 text-indigo-700" : "text-slate-500 hover:bg-slate-50"}`}><item.icon size={20} />{item.name}</Link>;
          })}
        </nav>
        <button onClick={logout} disabled={logoutBusy} className="m-4 flex items-center gap-3 rounded-xl p-4 text-red-600 hover:bg-red-50"><LogOut size={20} />{logoutBusy ? "Mengakhiri sesi..." : "Keluar"}</button>
      </aside>
      <div className="min-h-screen lg:ml-[280px]">
        <header className="sticky top-0 z-20 flex min-h-20 items-center justify-between gap-4 border-b border-slate-200 bg-white px-4 sm:px-10">
          <div className="flex items-center gap-3"><button aria-label="Buka navigasi" aria-expanded={mobileOpen} aria-controls="dashboard-navigation" onClick={() => setMobilePath(pathname)} className="rounded-xl p-2 lg:hidden"><Menu /></button><span className="text-lg font-black">Portal {session.role_id === 1 ? "Admin" : session.role_id === 2 ? "Guru" : "Siswa"}</span></div>
          <div className="min-w-0 text-right"><p className="truncate font-bold">{session.name}</p><p className="hidden text-xs text-slate-500 sm:block">{session.email}</p></div>
        </header>
        <main className="p-4 sm:p-8 lg:p-10">{logoutError && <p role="alert" className="mb-4 rounded-xl bg-red-50 p-4 text-red-700">{logoutError}</p>}{children}</main>
      </div>
    </div>
  );
}
