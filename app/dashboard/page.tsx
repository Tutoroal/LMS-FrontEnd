"use client";

import { useEffect, useState } from "react";
import { Plus, FolderOpen, FileText, Users, ExternalLink, X } from "lucide-react";

export default function DashboardPage() {
  const [roleId, setRoleId] = useState<string | null>(null);
  const [dataList, setDataList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // State Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Input Admin (Kelas)
  const [inputKelas, setInputKelas] = useState("");
  
  // Input Guru (Materi)
  const [inputJudulMateri, setInputJudulMateri] = useState("");
  const [inputUrlMateri, setInputUrlMateri] = useState("");

  const fetchData = async () => {
    const token = localStorage.getItem("token");
    const storedRoleId = localStorage.getItem("role_id");
    setRoleId(storedRoleId);

    if (!token) return;

    try {
      const endpoint = storedRoleId === "1" 
        ? "http://localhost:8080/api/admin/classes" 
        : "http://localhost:8080/api/materials";

      const response = await fetch(endpoint, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const result = await response.json();
      if (response.ok) setDataList(result.data || []);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const token = localStorage.getItem("token");

    try {
      let endpoint = "";
      let payload = {};

      if (roleId === "1") {
        endpoint = "http://localhost:8080/api/admin/classes";
        payload = { class_name: inputKelas };
      } else if (roleId === "2") {
        endpoint = "http://localhost:8080/api/teacher/materials";
        // Default subject_id: 1 (karena kita belum buat fitur manajemen mata pelajaran)
        payload = { subject_id: 1, title: inputJudulMateri, content_url: inputUrlMateri };
      }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setInputKelas("");
        setInputJudulMateri("");
        setInputUrlMateri("");
        setIsModalOpen(false);
        fetchData();
      } else {
        alert("Gagal menambahkan data. Pastikan isian benar.");
      }
    } catch (error) {
      console.error("Error submitting:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            {roleId === "1" ? "Manajemen Kelas" : "Materi Pembelajaran"}
          </h1>
          <p className="text-slate-500 mt-1">Pantau dan kelola data operasional LMS Anda di sini.</p>
        </div>
        
        {/* Tombol Tambah (Muncul untuk Admin DAN Guru) */}
        {(roleId === "1" || roleId === "2") && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-sm"
          >
            <Plus size={20} />
            {roleId === "1" ? "Tambah Kelas" : "Unggah Materi"}
          </button>
        )}
      </div>

      {/* Grid Data */}
      {loading ? (
        <div className="flex justify-center items-center h-40"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>
      ) : dataList.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center shadow-sm">
          <FolderOpen className="mx-auto h-12 w-12 text-slate-300 mb-4" />
          <h3 className="text-lg font-medium text-slate-900">Belum Ada Data</h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {dataList.map((item, index) => (
            <div key={index} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all group flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-blue-50 text-blue-600 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    {roleId === "1" ? <Users size={24} /> : <FileText size={24} />}
                  </div>
                  <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-md">ID: {item.ID}</span>
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">
                  {roleId === "1" ? item.ClassName : item.Title}
                </h3>
              </div>
              
              {/* Jika role = Guru/Siswa dan materi punya URL */}
              {item.ContentURL && (
                <a href={item.ContentURL} target="_blank" rel="noreferrer" className="mt-4 flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-2 rounded-lg w-fit transition-colors">
                  <ExternalLink size={16} /> Buka Materi
                </a>
              )}
            </div>
          ))}
        </div>
      )}

      {/* MODAL DINAMIS (Admin / Guru) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-lg font-bold text-slate-800">
                {roleId === "1" ? "Buat Kelas Baru" : "Unggah Materi Baru"}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {roleId === "1" ? (
                // Form Admin
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Nama Kelas</label>
                  <input type="text" required value={inputKelas} onChange={(e) => setInputKelas(e.target.value)} placeholder="Misal: Kelas 10 RPL 1" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500" />
                </div>
              ) : (
                // Form Guru
                <>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Judul Materi</label>
                    <input type="text" required value={inputJudulMateri} onChange={(e) => setInputJudulMateri(e.target.value)} placeholder="Misal: Algoritma Dasar" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Link Materi (Google Drive / YouTube)</label>
                    <input type="url" required value={inputUrlMateri} onChange={(e) => setInputUrlMateri(e.target.value)} placeholder="https://..." className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500" />
                  </div>
                </>
              )}
              
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-slate-600 font-medium hover:bg-slate-100 rounded-xl">Batal</button>
                <button type="submit" disabled={isSubmitting} className="px-5 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 disabled:opacity-50">
                  {isSubmitting ? "Menyimpan..." : "Simpan Data"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}