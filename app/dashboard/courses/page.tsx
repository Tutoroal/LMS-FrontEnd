"use client";

import { useState } from "react";
import { Send, CheckCircle } from "lucide-react";

export default function CoursesPage() {
  const [fileUrl, setFileUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pesan, setPesan] = useState("");

  const handleSubmitTugas = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setPesan("");
    const token = localStorage.getItem("token");

    try {
      const response = await fetch("http://localhost:8080/api/student/submissions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        // Default assignment_id: 1 karena kita belum buat modul Tugas spesifik
        body: JSON.stringify({ assignment_id: 1, file_url: fileUrl }),
      });

      if (response.ok) {
        setPesan("Tugas berhasil dikumpulkan!");
        setFileUrl("");
      } else {
        setPesan("Gagal mengumpulkan tugas. Pastikan Anda masuk sebagai Siswa.");
      }
    } catch (error) {
      setPesan("Gagal terhubung ke server.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm text-center">
        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 rotate-3">
          <Send size={32} />
        </div>
        <h1 className="text-3xl font-extrabold text-slate-800">Ruang Pengumpulan Tugas</h1>
        <p className="text-slate-500 mt-2 max-w-lg mx-auto">
          Selesaikan tugas Anda tepat waktu. Unggah dokumen Anda ke Google Drive dan tempelkan *link*-nya di bawah ini.
        </p>
      </div>

      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
        {pesan && (
          <div className={`p-4 mb-6 rounded-xl flex items-center gap-3 ${pesan.includes("berhasil") ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
            <CheckCircle size={20} />
            <span className="font-semibold">{pesan}</span>
          </div>
        )}

        <form onSubmit={handleSubmitTugas} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Link Jawaban Tugas (URL)</label>
            <input 
              type="url" 
              required
              value={fileUrl}
              onChange={(e) => setFileUrl(e.target.value)}
              placeholder="https://docs.google.com/..." 
              className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all" 
            />
          </div>
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-md shadow-blue-200 flex justify-center items-center gap-2"
          >
            {isSubmitting ? "Mengirim Data..." : (
              <>
                Kirim Tugas Sekarang <Send size={18} />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}