"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BookOpen, User, Lock, ArrowLeft, Loader2, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  
  // State diubah dari email menjadi identifier (Bisa menerima NIS, NISN, NIP, atau Email)
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Kita mengirim 'identifier' ke backend, bukan lagi sekadar 'email'
      const res = await fetch("http://localhost:8080/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }), 
      });

      const data = await res.json();
      
      if (res.ok) {
        localStorage.setItem("token", data.token);
        // Arahkan langsung ke dashboard sesuai role yang dikembalikan backend
        router.push("/dashboard");
      } else {
        setError(data.error || "Kredensial tidak valid. Silakan coba lagi.");
      }
    } catch (err) {
      setError("Terjadi kesalahan pada server. Pastikan backend aktif.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex font-sans bg-slate-50 selection:bg-indigo-200">
      
      {/* KIRI - Panel Visual Branding (Sembunyi di layar kecil) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-indigo-900 overflow-hidden items-center justify-center p-12">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay z-0"></div>
        
        {/* Dekorasi Cahaya & Bentuk */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
          <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600 rounded-full blur-[100px] opacity-80"></div>
          <div className="absolute bottom-10 -right-20 w-80 h-80 bg-blue-500 rounded-full blur-[100px] opacity-60"></div>
        </div>

        <div className="relative z-10 w-full max-w-lg space-y-8 animate-in fade-in slide-in-from-left-8 duration-1000">
          <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center text-white border border-white/20 shadow-xl">
            <BookOpen size={32} strokeWidth={2.5} />
          </div>
          
          <div className="space-y-4">
            <h1 className="text-5xl font-black text-white tracking-tight leading-tight">
              Portal Akademik <br /> Citra Negara
            </h1>
            <p className="text-indigo-200 font-medium text-lg leading-relaxed">
              Satu sistem terintegrasi untuk Siswa, Guru, dan Admin. Masuk menggunakan NISN atau NIP Anda untuk mengakses jadwal, materi, dan evaluasi.
            </p>
          </div>

          <div className="pt-8 flex items-center gap-4">
            <div className="flex -space-x-3">
              <div className="w-10 h-10 rounded-full border-2 border-indigo-900 bg-emerald-400"></div>
              <div className="w-10 h-10 rounded-full border-2 border-indigo-900 bg-blue-400"></div>
              <div className="w-10 h-10 rounded-full border-2 border-indigo-900 bg-purple-400"></div>
            </div>
            <span className="text-sm font-bold text-indigo-200">Bergabung dengan ribuan warga sekolah lainnya.</span>
          </div>
        </div>
      </div>

      {/* KANAN - Panel Form Login */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative">
        <Link href="/" className="absolute top-8 left-8 flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-slate-800 transition-colors">
          <ArrowLeft size={16} /> Kembali ke Beranda
        </Link>

        <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-right-8 duration-700">
          
          <div className="text-center lg:text-left">
            <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200 mb-6 mx-auto lg:mx-0 lg:hidden">
              <BookOpen size={24} />
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mb-2">Selamat Datang!</h2>
            <p className="text-slate-500 font-bold">Silakan masuk ke akun Anda.</p>
          </div>

          {error && (
            <div className="bg-red-50 border-2 border-red-100 text-red-600 px-5 py-4 rounded-2xl flex items-center gap-3 text-sm font-bold animate-in shake">
              <AlertCircle size={20} className="flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-5">
              
              {/* INPUT IDENTIFIER (NIS / NIP / EMAIL) */}
              <div className="space-y-2">
                <label className="text-sm font-black text-slate-700">NIS / NISN / NIP / Email</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <User size={20} strokeWidth={2.5} />
                  </div>
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="Masukkan identitas Anda..."
                    className="w-full pl-12 pr-5 py-4 bg-white border-2 border-slate-200 rounded-2xl focus:ring-0 focus:border-indigo-600 outline-none transition-all text-slate-900 font-extrabold text-base shadow-sm"
                  />
                </div>
              </div>

              {/* INPUT PASSWORD */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-black text-slate-700">Kata Sandi</label>
                  <a href="#" className="text-sm font-bold text-indigo-600 hover:text-indigo-700">Lupa sandi?</a>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <Lock size={20} strokeWidth={2.5} />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-12 pr-5 py-4 bg-white border-2 border-slate-200 rounded-2xl focus:ring-0 focus:border-indigo-600 outline-none transition-all text-slate-900 font-extrabold text-base shadow-sm tracking-widest"
                  />
                </div>
              </div>

            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center gap-2 py-4 px-6 border border-transparent rounded-2xl text-white bg-indigo-600 hover:bg-indigo-700 font-black text-lg shadow-xl shadow-indigo-200 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 size={22} className="animate-spin" />
                  Memproses...
                </>
              ) : (
                "Masuk Ke Sistem"
              )}
            </button>
          </form>

          <div className="pt-6 border-t border-slate-100 text-center">
            <p className="text-sm font-bold text-slate-400">
              Belum punya akun? Hubungi Admin / Wali Kelas Anda.
            </p>
          </div>

        </div>
      </div>

    </div>
  );
}