"use client";

import { useEffect, useState } from "react";
import { Plus, Edit2, Trash2, Search, Users, GraduationCap, X, ChevronRight, UserCheck } from "lucide-react";

export default function ManageClassesPage() {
  const [classes, setClasses] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]); // Untuk pilihan Wali Kelas
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [selectedClass, setSelectedClass] = useState<any>(null);
  
  // Data Siswa dalam Kelas
  const [classStudents, setClassStudents] = useState<any[]>([]);
  
  // Form State
  const [formData, setFormData] = useState({ class_name: "", homeroom_teacher_id: 0 });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    try {
      // Ambil Data Kelas
      const resClass = await fetch("http://localhost:8080/api/admin/classes", { headers: { "Authorization": `Bearer ${token}` } });
      const dataClass = await resClass.json();
      if (resClass.ok) setClasses(dataClass.data || []);

      // Ambil Data Guru (Untuk Dropdown Wali Kelas)
      const resUsers = await fetch("http://localhost:8080/api/admin/users", { headers: { "Authorization": `Bearer ${token}` } });
      const dataUsers = await resUsers.json();
      if (resUsers.ok) {
        const guruOnly = (dataUsers.data || []).filter((u: any) => u.role_id === 2);
        setTeachers(guruOnly);
      }
    } catch (error) {
      console.error("Gagal menarik data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // Melihat Detail Siswa dalam Kelas
  const handleViewDetails = async (cls: any) => {
    setSelectedClass(cls);
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`http://localhost:8080/api/admin/classes/${cls.ID}/details`, { headers: { "Authorization": `Bearer ${token}` } });
      const data = await res.json();
      if (res.ok) setClassStudents(data.students || []);
      setIsDetailModalOpen(true);
    } catch (error) {
      alert("Gagal memuat detail murid.");
    }
  };

  const handleOpenModal = (mode: "add" | "edit", cls: any = null) => {
    setModalMode(mode);
    if (mode === "edit" && cls) {
      setSelectedClass(cls);
      setFormData({ class_name: cls.ClassName, homeroom_teacher_id: cls.HomeroomTeacherID || 0 });
    } else {
      setFormData({ class_name: "", homeroom_teacher_id: 0 });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const token = localStorage.getItem("token");
    const endpoint = modalMode === "add" ? "http://localhost:8080/api/admin/classes" : `http://localhost:8080/api/admin/classes/${selectedClass?.ID}`;
    
    try {
      const res = await fetch(endpoint, {
        method: modalMode === "add" ? "POST" : "PUT",
        headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ 
          class_name: formData.class_name, 
          homeroom_teacher_id: Number(formData.homeroom_teacher_id) 
        }),
      });
      if (res.ok) {
        setIsModalOpen(false);
        fetchData();
      } else {
        alert("Gagal memproses data.");
      }
    } catch (error) {
      alert("Terjadi kesalahan sistem.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredClasses = classes.filter(c => c.ClassName.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6 w-full max-w-7xl mx-auto animate-in fade-in duration-500">
      
      {/* HEADER SECTION (RESPONSIVE) */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden">
        <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-indigo-100 blur-3xl opacity-50"></div>
        <div className="flex items-center gap-4 md:gap-5 relative z-10">
          <div className="p-3 md:p-4 rounded-2xl bg-indigo-100 text-indigo-600 shadow-inner">
            <Users size={32} strokeWidth={2.5} className="w-6 h-6 md:w-8 md:h-8" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">Manajemen Kelas</h1>
            <p className="text-sm md:text-base text-slate-500 mt-1 font-medium">Kelola rombongan belajar, wali kelas, dan daftar siswa.</p>
          </div>
        </div>
        <div className="flex w-full md:w-auto items-center gap-3 relative z-10 mt-4 md:mt-0">
          <button onClick={() => handleOpenModal("add")} className="w-full md:w-auto flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-md shadow-indigo-200">
            <Plus size={18} /> Tambah Kelas
          </button>
        </div>
      </div>

      {/* PENCARIAN (RESPONSIVE) */}
      <div className="relative w-full md:w-72">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input 
          type="text" 
          placeholder="Cari nama kelas..." 
          value={search} 
          onChange={(e) => setSearch(e.target.value)} 
          // PERBAIKAN TEKS INPUT: text-slate-900 font-extrabold
          className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-slate-900 font-extrabold transition-all shadow-sm" 
        />
      </div>

      {/* GRID KELAS (RESPONSIVE LAPTOP & HP) */}
      {loading ? (
        <div className="py-12 text-center text-slate-400 animate-pulse font-medium">Menyelaraskan data...</div>
      ) : filteredClasses.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-3xl border border-slate-100 shadow-sm">
          <p className="text-slate-500 font-medium">Belum ada kelas yang terdaftar.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClasses.map((cls) => (
            <div key={cls.ID} className="bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-lg transition-all p-6 flex flex-col justify-between group">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-lg text-xs font-black tracking-wider">
                    ID: {cls.ID}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleOpenModal("edit", cls)} className="text-slate-400 hover:text-indigo-600 bg-slate-50 hover:bg-indigo-50 p-2 rounded-lg transition-colors"><Edit2 size={16}/></button>
                  </div>
                </div>
                <h3 className="text-2xl font-black text-slate-800 mb-2">{cls.ClassName}</h3>
                <div className="flex items-center gap-2 mt-4 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <UserCheck size={18} className="text-emerald-500" />
                  <div>
                    <p className="text-xs text-slate-400 font-bold uppercase">Wali Kelas</p>
                    <p className="text-sm font-bold text-slate-700">
                      {cls.HomeroomTeacher?.Name || "Belum Ditugaskan"}
                    </p>
                  </div>
                </div>
              </div>
              <button onClick={() => handleViewDetails(cls)} className="mt-6 w-full flex items-center justify-between bg-slate-800 hover:bg-slate-900 text-white px-5 py-3 rounded-xl font-bold transition-colors">
                <span>Lihat Daftar Siswa</span>
                <ChevronRight size={18} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* MODAL FORM KELAS (DENGAN TEKS TEBAL) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95">
            <div className="px-6 md:px-8 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-xl font-black text-slate-800">{modalMode === "add" ? "Buat Kelas Baru" : "Edit Kelas"}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:bg-slate-200 p-2 rounded-full"><X size={16} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Nama Kelas</label>
                {/* TEKS INPUT SUPER TEBAL */}
                <input type="text" required value={formData.class_name} onChange={(e) => setFormData({...formData, class_name: e.target.value})} className="w-full px-5 py-3.5 bg-white border-2 border-slate-200 rounded-2xl focus:ring-0 focus:border-indigo-600 outline-none transition-all text-slate-900 font-extrabold text-lg" placeholder="Misal: 11 RPL 1" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Pilih Wali Kelas (Guru)</label>
                {/* SELECT SUPER TEBAL */}
                <select value={formData.homeroom_teacher_id} onChange={(e) => setFormData({...formData, homeroom_teacher_id: e.target.value})} className="w-full px-5 py-3.5 bg-white border-2 border-slate-200 rounded-2xl focus:ring-0 focus:border-indigo-600 outline-none transition-all text-slate-900 font-extrabold text-base">
                  <option value={0}>-- Belum Ditentukan --</option>
                  {teachers.map(t => (
                    <option key={t.id} value={t.id}>{t.name} ({t.specialty || "Guru"})</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3 mt-8">
                <button type="button" onClick={() => setIsModalOpen(false)} className="w-full py-3.5 text-slate-600 font-bold hover:bg-slate-100 rounded-2xl">Batal</button>
                <button type="submit" disabled={isSubmitting} className="w-full py-3.5 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 disabled:opacity-50">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DETAIL SISWA DALAM KELAS (RESPONSIVE) */}
      {isDetailModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl animate-in slide-in-from-bottom-4">
            <div className="px-6 md:px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-indigo-600 text-white rounded-t-3xl">
              <div>
                <h3 className="text-xl font-black">Rincian: {selectedClass?.ClassName}</h3>
                <p className="text-indigo-200 text-sm font-medium">Wali Kelas: {selectedClass?.HomeroomTeacher?.Name || "-"}</p>
              </div>
              <button onClick={() => setIsDetailModalOpen(false)} className="text-white/70 hover:bg-white/20 p-2 rounded-full transition-colors"><X size={20} /></button>
            </div>
            
            <div className="p-6 md:p-8 flex-1 overflow-y-auto">
              <div className="flex items-center gap-2 mb-4">
                <GraduationCap className="text-slate-400" />
                <h4 className="font-bold text-slate-700">Daftar Siswa ({classStudents.length})</h4>
              </div>
              
              {classStudents.length === 0 ? (
                <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-2xl">
                  <p className="text-slate-500 font-medium">Belum ada siswa yang dimasukkan ke kelas ini.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {classStudents.map((s, idx) => (
                    <div key={s.id} className="flex items-center gap-4 p-4 border border-slate-100 rounded-2xl hover:border-indigo-200 transition-colors bg-slate-50/50">
                      <div className="w-10 h-10 bg-indigo-100 text-indigo-700 font-black rounded-xl flex items-center justify-center">
                        {idx + 1}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 text-lg">{s.name}</p>
                        <p className="text-sm font-medium text-slate-500">{s.email}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}