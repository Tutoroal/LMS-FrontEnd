"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link"; // Komponen untuk navigasi pindah halaman

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pesan, setPesan] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setPesan("");

    try {
      // Mengirim data ke Backend Golang
      const response = await fetch("http://localhost:8080/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Simpan token JWT dan Role ke memori browser
        localStorage.setItem("token", data.token);
        localStorage.setItem("role_id", data.role_id);
        
        setPesan("Login sukses! Mengalihkan ke Dashboard...");
        
        // Arahkan ke halaman dashboard internal
        setTimeout(() => {
          router.push("/dashboard");
        }, 1500);
      } else {
        setPesan(data.error || "Gagal login, periksa kembali email dan password Anda.");
      }
    } catch (error) {
      setPesan("Gagal terhubung ke server Backend. Pastikan server berjalan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 font-sans">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-100">
        
        {/* Header Form */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">Login Internal</h2>
          <p className="text-sm text-slate-500 mt-2">Masuk sebagai Admin, Guru, atau Siswa</p>
        </div>
        
        {/* Area Notifikasi Pesan */}
        {pesan && (
          <div className={`p-4 mb-6 rounded-lg text-sm font-semibold ${pesan.includes("sukses") ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
            {pesan}
          </div>
        )}

        {/* Form Login */}
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 transition-all"
              placeholder="Masukkan email terdaftar"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 transition-all"
              placeholder="Masukkan password Anda"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-3.5 px-4 mt-2 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300 disabled:shadow-none transition-all duration-300"
          >
            {loading ? "Memproses..." : "Masuk ke Dashboard"}
          </button>
        </form>

        {/* Tombol Kembali ke Beranda Public */}
        <div className="mt-8 text-center pt-6 border-t border-slate-100">
          <Link href="/" className="text-sm font-semibold text-slate-500 hover:text-blue-600 transition-colors">
            &larr; Kembali ke Beranda Utama
          </Link>
        </div>
      </div>
    </div>
  );
}