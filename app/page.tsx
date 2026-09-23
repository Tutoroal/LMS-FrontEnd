"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, BookOpen, CheckCircle2, Code, Palette, Network, Briefcase, Building2, Utensils, Laptop, Sparkles, Clock, FileText, LayoutDashboard, Bell } from "lucide-react";

export default function LandingPage() {
  const [isInitializing, setIsInitializing] = useState(true);

  // Efek Loading Screen diubah menjadi jauh lebih cepat (500ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitializing(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  if (isInitializing) {
    return (
      <div className="fixed inset-0 bg-indigo-600 flex flex-col items-center justify-center z-[100] text-white">
        <BookOpen size={56} className="animate-bounce mb-6 opacity-90" strokeWidth={1.5} />
        <h2 className="text-xl font-black tracking-widest uppercase mb-2">LMS Citra Negara</h2>
        <div className="flex items-center gap-2 text-indigo-200 text-sm font-bold animate-pulse">
          <div className="w-4 h-4 border-2 border-indigo-200 border-t-transparent rounded-full animate-spin"></div>
          Memuat pengalaman sekolahmu...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-indigo-200 relative">
      
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-overlay"></div>
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>

      {/* NAVBAR */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-xl z-50 border-b border-slate-200 transition-all">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
              <BookOpen size={20} strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900 tracking-tight leading-none mb-0.5">LMS Citra Negara</h1>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Satu Sistem Untuk Semua</span>
            </div>
          </div>
          <Link 
            href="/login" 
            className="bg-slate-900 hover:bg-indigo-600 text-white px-7 py-2.5 rounded-full text-sm font-bold transition-all shadow-md hover:shadow-xl hover:-translate-y-0.5"
          >
            Masuk Siswa
          </Link>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="relative pt-36 pb-20 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          <div className="space-y-8 relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-black tracking-wide">
              <Sparkles size={14} className="text-indigo-500" />
              Siap untuk Siswa, Walas, BK, dan Admin.
            </div>
            
            <h2 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tighter leading-[1.15]">
              Satu langkah hadir, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-500">Satu sistem untuk semua.</span>
            </h2>
            
            <p className="text-lg text-slate-500 font-semibold leading-relaxed max-w-lg">
              Satu sistem untuk pembelajaran yang lebih tertib, pemantauan materi yang lebih cepat, dan pengelolaan data akademik yang lebih mudah.
            </p>
            
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link href="/login" className="flex items-center gap-3 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-2xl font-black transition-all shadow-xl shadow-indigo-200 hover:shadow-indigo-300">
                Mulai Belajar Sekarang <ArrowRight size={20} />
              </Link>
            </div>
          </div>

          {/* RIGHT VISUAL - Interactive Dashboard Peek */}
          <div className="relative animate-in fade-in zoom-in-95 duration-1000 delay-200 lg:pl-10">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-br from-indigo-100/50 to-blue-50/50 rounded-full blur-3xl -z-10"></div>
            
            <div className="bg-white/80 backdrop-blur-md p-6 md:p-8 rounded-[2rem] shadow-2xl border border-white relative z-10 transform lg:rotate-2 hover:rotate-0 transition-all duration-500">
              <div className="flex justify-between items-center mb-8 pb-6 border-b border-slate-100">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-600">
                    <Laptop size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-800">Aktivitas Hari Ini</h3>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1">Ringkasan jadwal & tugas</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-white p-5 rounded-2xl flex items-center gap-5 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center"><Clock size={24} /></div>
                  <div className="flex-1">
                    <p className="text-sm font-black text-slate-800 mb-1">PBO - Kelas XI PPLG 1</p>
                    <p className="text-xs font-bold text-slate-500">08:00 - 09:30 WIB</p>
                  </div>
                </div>
                <div className="bg-white p-5 rounded-2xl flex items-center gap-5 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center"><FileText size={24} /></div>
                  <div className="flex-1">
                    <p className="text-sm font-black text-slate-800 mb-1">Project Akhir Web</p>
                    <p className="text-xs font-bold text-slate-500">Tenggat: Besok, 23:59</p>
                  </div>
                  <span className="bg-rose-100 text-rose-700 px-3 py-1 rounded-full text-xs font-black">Belum</span>
                </div>
                <div className="bg-white p-5 rounded-2xl flex items-center gap-5 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center"><CheckCircle2 size={24} /></div>
                  <div className="flex-1">
                    <p className="text-sm font-black text-slate-800 mb-1">Desain UI/UX Figma</p>
                    <p className="text-xs font-bold text-slate-500">Selesai dinilai</p>
                  </div>
                  <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-black">Nilai: 95</span>
                </div>
              </div>
              
              <div className="absolute -bottom-8 -right-8 bg-white p-5 rounded-3xl shadow-2xl border border-slate-100 flex items-center gap-4 animate-bounce">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-600">
                  <Bell size={24} />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Pemberitahuan</p>
                  <p className="text-lg font-black text-slate-800">2 Tugas Baru</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ALUR SECTION */}
      <section className="py-24 px-6 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/20 rounded-full blur-[100px]"></div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
              <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">
                Ikuti alur singkat ini <br />
                <span className="text-indigo-400">agar aktivitasmu tercatat jelas</span> di sistem sekolah.
              </h2>
              <p className="text-slate-400 font-medium text-lg max-w-md">
                Keistimewaan LMS Citra Negara menjamin bimbingan siswa yang baik dan terarah sejak hari pertama.
              </p>
            </div>

            <div className="space-y-6">
              <div className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-3xl border border-slate-700 flex gap-6 hover:bg-slate-800 transition-colors">
                <span className="text-2xl font-black text-slate-600">01</span>
                <div>
                  <h4 className="text-lg font-black text-white mb-2 uppercase tracking-wide">Siapkan</h4>
                  <p className="text-slate-400 font-medium text-sm">Masuk ke dalam halaman login menggunakan akun NIS/NISN siswa yang sudah terdaftar untuk membuka dashboard.</p>
                </div>
              </div>
              <div className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-3xl border border-slate-700 flex gap-6 hover:bg-slate-800 transition-colors">
                <span className="text-2xl font-black text-slate-600">02</span>
                <div>
                  <h4 className="text-lg font-black text-indigo-400 mb-2 uppercase tracking-wide">Akses</h4>
                  <p className="text-slate-400 font-medium text-sm">Pilih mata pelajaran yang tersedia hari ini. Baca modul dan tonton video materi yang diberikan oleh guru.</p>
                </div>
              </div>
              <div className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-3xl border border-slate-700 flex gap-6 hover:bg-slate-800 transition-colors">
                <span className="text-2xl font-black text-slate-600">03</span>
                <div>
                  <h4 className="text-lg font-black text-white mb-2 uppercase tracking-wide">Kerjakan</h4>
                  <p className="text-slate-400 font-medium text-sm">Periksa kembali data tugas, kerjakan kuis, lalu kirimkan jawaban sebelum tenggat waktu berakhir untuk divalidasi.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* JURUSAN SECTION */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4 tracking-tight">Setiap jurusan terhubung dalam satu sistem yang praktis.</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="group bg-slate-50 p-8 rounded-[2rem] border border-slate-100 hover:bg-indigo-600 hover:shadow-2xl transition-all duration-300">
              <Code size={36} className="text-indigo-600 group-hover:text-white mb-6" />
              <div className="text-xs font-bold text-slate-400 group-hover:text-indigo-200 uppercase tracking-widest mb-2">Teknologi</div>
              <h3 className="text-2xl font-black text-slate-900 group-hover:text-white mb-3">PPLG</h3>
              <p className="text-slate-500 group-hover:text-indigo-100 font-medium text-sm">Pemrograman dan software modern.</p>
            </div>

            <div className="group bg-slate-50 p-8 rounded-[2rem] border border-slate-100 hover:bg-indigo-600 hover:shadow-2xl transition-all duration-300">
              <Palette size={36} className="text-indigo-600 group-hover:text-white mb-6" />
              <div className="text-xs font-bold text-slate-400 group-hover:text-indigo-200 uppercase tracking-widest mb-2">Kreatif</div>
              <h3 className="text-2xl font-black text-slate-900 group-hover:text-white mb-3">DKV</h3>
              <p className="text-slate-500 group-hover:text-indigo-100 font-medium text-sm">Visual branding dan multimedia.</p>
            </div>

            <div className="group bg-slate-50 p-8 rounded-[2rem] border border-slate-100 hover:bg-indigo-600 hover:shadow-2xl transition-all duration-300">
              <Network size={36} className="text-indigo-600 group-hover:text-white mb-6" />
              <div className="text-xs font-bold text-slate-400 group-hover:text-indigo-200 uppercase tracking-widest mb-2">Jaringan</div>
              <h3 className="text-2xl font-black text-slate-900 group-hover:text-white mb-3">TJKT</h3>
              <p className="text-slate-500 group-hover:text-indigo-100 font-medium text-sm">Komputer, server, dan konektivitas.</p>
            </div>

            <div className="group bg-slate-50 p-8 rounded-[2rem] border border-slate-100 hover:bg-indigo-600 hover:shadow-2xl transition-all duration-300">
              <Briefcase size={36} className="text-indigo-600 group-hover:text-white mb-6" />
              <div className="text-xs font-bold text-slate-400 group-hover:text-indigo-200 uppercase tracking-widest mb-2">Bisnis</div>
              <h3 className="text-2xl font-black text-slate-900 group-hover:text-white mb-3">Pemasaran</h3>
              <p className="text-slate-500 group-hover:text-indigo-100 font-medium text-sm">Strategi promosi dan layanan pelanggan.</p>
            </div>

            <div className="group bg-slate-50 p-8 rounded-[2rem] border border-slate-100 hover:bg-indigo-600 hover:shadow-2xl transition-all duration-300">
              <Building2 size={36} className="text-indigo-600 group-hover:text-white mb-6" />
              <div className="text-xs font-bold text-slate-400 group-hover:text-indigo-200 uppercase tracking-widest mb-2">Manajemen</div>
              <h3 className="text-2xl font-black text-slate-900 group-hover:text-white mb-3">MPLB</h3>
              <p className="text-slate-500 group-hover:text-indigo-100 font-medium text-sm">Administrasi kantor yang terstruktur.</p>
            </div>

            <div className="group bg-slate-50 p-8 rounded-[2rem] border border-slate-100 hover:bg-indigo-600 hover:shadow-2xl transition-all duration-300">
              <Utensils size={36} className="text-indigo-600 group-hover:text-white mb-6" />
              <div className="text-xs font-bold text-slate-400 group-hover:text-indigo-200 uppercase tracking-widest mb-2">Layanan</div>
              <h3 className="text-2xl font-black text-slate-900 group-hover:text-white mb-3">Perhotelan</h3>
              <p className="text-slate-500 group-hover:text-indigo-100 font-medium text-sm">Etika layanan dan hospitality.</p>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">
              <BookOpen size={16} />
            </div>
            <span className="text-base font-black text-slate-800 tracking-tight">SEKOLAH CITRA NEGARA</span>
          </div>
          <p className="text-sm font-bold text-slate-400 text-center">
            Pilihan Tepat Sekolah Yang M.A.N.T.A.P.
          </p>
          <div className="flex items-center gap-6 text-sm font-bold text-slate-400">
            <a href="#" className="hover:text-indigo-600 transition-colors">Bantuan</a>
            <a href="#" className="hover:text-indigo-600 transition-colors">Privasi</a>
          </div>
        </div>
      </footer>
    </div>
  );
}