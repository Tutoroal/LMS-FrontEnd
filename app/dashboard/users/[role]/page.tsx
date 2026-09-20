"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Plus, Edit2, Trash2, Search, ShieldCheck, GraduationCap, Briefcase, X } from "lucide-react";

export default function UsersRolePage() {
  const params = useParams();
  const roleSlug = params.role as string;
  const targetRoleId = roleSlug === "admin" ? 1 : roleSlug === "guru" ? 2 : 3;

  const [users, setUsers] = useState<any[]>([]);
  const [classList, setClassList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nisnNip, setNisnNip] = useState("");
  const [nis, setNis] = useState("");
  const [tempatLahir, setTempatLahir] = useState("");
  const [tanggalLahir, setTanggalLahir] = useState("");
  const [jenisKelamin, setJenisKelamin] = useState("Laki-laki");
  const [specialty, setSpecialty] = useState("");
  const [classId, setClassId] = useState<string>("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const uiConfig = {
    admin: { title: "Administrator", icon: ShieldCheck, color: "text-purple-600", bg: "bg-purple-100" },
    guru: { title: "Guru Pengajar", icon: Briefcase, color: "text-emerald-600", bg: "bg-emerald-100" },
    siswa: { title: "Siswa Terdaftar", icon: GraduationCap, color: "text-amber-600", bg: "bg-amber-100" },
  };
  const currentUI = uiConfig[roleSlug as keyof typeof uiConfig] || uiConfig.siswa;
  const RoleIcon = currentUI.icon;

  const fetchData = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    try {
      const resUsers = await fetch("http://localhost:8080/api/admin/users", { headers: { "Authorization": `Bearer ${token}` } });
      const dataUsers = await resUsers.json();
      if (resUsers.ok) setUsers((dataUsers.data || []).filter((u: any) => u.RoleID === targetRoleId));

      const resClass = await fetch("http://localhost:8080/api/admin/classes", { headers: { "Authorization": `Bearer ${token}` } });
      const dataClass = await resClass.json();
      if (resClass.ok) setClassList(dataClass.data || []);
    } catch (error) {} finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [roleSlug]);

  const handleOpenModal = (mode: "add" | "edit", user: any = null) => {
    setModalMode(mode);
    if (mode === "edit" && user) {
      setSelectedId(user.ID);
      setName(user.Name || "");
      setEmail(user.Email || "");
      setPassword("");
      setNisnNip(user.NISN_NIP || "");
      setNis(user.NIS || "");
      setTempatLahir(user.TempatLahir || "");
      setTanggalLahir(user.TanggalLahir ? user.TanggalLahir.split('T')[0] : "");
      setJenisKelamin(user.JenisKelamin || "Laki-laki");
      setSpecialty(user.Specialty || "");
      setClassId(user.ClassID ? String(user.ClassID) : "");
    } else {
      setSelectedId(null);
      setName("");
      setEmail("");
      setPassword("");
      setNisnNip("");
      setNis("");
      setTempatLahir("");
      setTanggalLahir("");
      setJenisKelamin("Laki-laki");
      setSpecialty("");
      setClassId("");
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const token = localStorage.getItem("token");
    const endpoint = modalMode === "add" ? "http://localhost:8080/api/admin/users" : `http://localhost:8080/api/admin/users/${selectedId}`;
    
    const payload = {
      name, email, password, role_id: targetRoleId,
      nisn_nip: nisnNip, nis, tempat_lahir: tempatLahir,
      tanggal_lahir: tanggalLahir, jenis_kelamin: jenisKelamin, specialty,
      class_id: classId ? Number(classId) : null
    };

    try {
      const res = await fetch(endpoint, {
        method: modalMode === "add" ? "POST" : "PUT",
        headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) { setIsModalOpen(false); fetchData(); } 
      else alert("Gagal memproses data.");
    } catch (error) {} finally { setIsSubmitting(false); }
  };

  const handleDelete = async (id: string) => {
    const token = localStorage.getItem("token");
    const res = await fetch(`http://localhost:8080/api/admin/users/${id}`, { method: "DELETE", headers: { "Authorization": `Bearer ${token}` } });
    if (res.ok) { setDeleteConfirmId(null); fetchData(); }
  };

  const filteredSearch = users.filter(u => u.Name.toLowerCase().includes(search.toLowerCase()) || u.Email.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-500">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-8 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden">
        <div className={`absolute -right-10 -top-10 w-40 h-40 rounded-full ${currentUI.bg} blur-3xl opacity-50`}></div>
        <div className="flex items-center gap-5 relative z-10">
          <div className={`p-4 rounded-2xl ${currentUI.bg} ${currentUI.color} shadow-inner`}><RoleIcon size={32} strokeWidth={2.5} /></div>
          <div><h1 className="text-3xl font-black text-slate-800">Data {currentUI.title}</h1></div>
        </div>
        <div className="flex w-full md:w-auto items-center gap-3 relative z-10">
          <input 
            type="text" placeholder="Cari nama..." value={search} onChange={(e) => setSearch(e.target.value)} 
            className="w-full md:w-64 px-5 py-3.5 bg-white border-2 border-slate-200 rounded-xl focus:border-blue-500 outline-none text-slate-900 font-extrabold text-sm" 
          />
          <button onClick={() => handleOpenModal("add")} className="flex-shrink-0 flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3.5 rounded-xl font-bold shadow-md">
            <Plus size={18} /> Tambah
          </button>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-5 px-8">Informasi Akun</th>
                <th className="py-5 px-8">Identitas & Kelas</th>
                <th className="py-5 px-8">UUID (Sistem)</th>
                <th className="py-5 px-8 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? <tr><td colSpan={4} className="py-12 text-center text-slate-400 font-medium">Memuat data...</td></tr> : 
               filteredSearch.length === 0 ? <tr><td colSpan={4} className="py-12 text-center text-slate-400 font-medium">Belum ada data.</td></tr> :
               filteredSearch.map((user) => (
                <tr key={user.ID} className="hover:bg-slate-50/50 group">
                  <td className="py-5 px-8">
                    <p className="font-bold text-slate-900 text-base">{user.Name}</p>
                    <p className="text-sm font-bold text-slate-500">{user.Email}</p>
                  </td>
                  <td className="py-5 px-8">
                    <p className="font-bold text-slate-800">{user.NISN_NIP || "-"}</p>
                    {roleSlug === 'siswa' && (
                      <span className="inline-block mt-1 bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-md text-xs font-extrabold border border-indigo-100">
                        Kelas: {user.Class?.ClassName || "Belum Masuk Kelas"}
                      </span>
                    )}
                    {roleSlug === 'guru' && <p className="text-xs font-bold text-slate-500">Mapel: {user.Specialty || "-"}</p>}
                  </td>
                  <td className="py-5 px-8">
                    <span className="bg-slate-100 text-slate-500 font-mono text-xs px-2 py-1 rounded-md">{user.ID.split('-')[0]}...</span>
                  </td>
                  <td className="py-5 px-8 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => handleOpenModal("edit", user)} className="p-2 text-slate-400 hover:text-blue-600 bg-white border border-slate-200 rounded-lg"><Edit2 size={16} /></button>
                      <button onClick={() => setDeleteConfirmId(user.ID)} className="p-2 text-slate-400 hover:text-red-600 bg-white border border-slate-200 rounded-lg"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL FORM */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95">
            <div className="sticky top-0 bg-white/90 backdrop-blur-sm px-8 py-6 border-b border-slate-100 flex justify-between z-10">
              <h3 className="text-xl font-black text-slate-800">{modalMode === "add" ? `Tambah ${roleSlug}` : `Edit ${roleSlug}`}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:bg-slate-100 p-2 rounded-full"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Nama Lengkap</label>
                  <input type="text" required value={name} onChange={(e) => setName(e.target.value)} 
                    className="w-full px-5 py-3.5 bg-white border-2 border-slate-200 rounded-2xl focus:border-blue-600 outline-none text-slate-900 font-extrabold text-base shadow-sm" />
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Email Login</label>
                  <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} 
                    className="w-full px-5 py-3.5 bg-white border-2 border-slate-200 rounded-2xl focus:border-blue-600 outline-none text-slate-900 font-extrabold text-base shadow-sm" />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Kata Sandi {modalMode === "edit" ? "(Kosongkan jika tak diubah)" : ""}</label>
                  <input type="password" required={modalMode === "add"} value={password} onChange={(e) => setPassword(e.target.value)} 
                    className="w-full px-5 py-3.5 bg-white border-2 border-slate-200 rounded-2xl focus:border-blue-600 outline-none text-slate-900 font-extrabold text-base shadow-sm" />
                </div>
                
                {roleSlug === 'siswa' && (
                  <>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">NISN</label>
                      <input type="text" value={nisnNip} onChange={(e) => setNisnNip(e.target.value)} 
                        className="w-full px-5 py-3.5 bg-white border-2 border-slate-200 rounded-2xl focus:border-blue-600 outline-none text-slate-900 font-extrabold text-base shadow-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">NIS</label>
                      <input type="text" value={nis} onChange={(e) => setNis(e.target.value)} 
                        className="w-full px-5 py-3.5 bg-white border-2 border-slate-200 rounded-2xl focus:border-blue-600 outline-none text-slate-900 font-extrabold text-base shadow-sm" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-bold text-slate-700 mb-2">Rombongan Kelas</label>
                      <select value={classId} onChange={(e) => setClassId(e.target.value)} className="w-full px-5 py-3.5 bg-white border-2 border-slate-200 rounded-2xl focus:border-blue-600 outline-none text-slate-900 font-extrabold text-base shadow-sm">
                        <option value="">-- Belum Masuk Kelas --</option>
                        {classList.map((c) => (
                          <option key={c.ID} value={c.ID}>{c.ClassName}</option>
                        ))}
                      </select>
                    </div>
                  </>
                )}
                {roleSlug === 'guru' && (
                  <>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">NIP / NUPTK</label>
                      <input type="text" value={nisnNip} onChange={(e) => setNisnNip(e.target.value)} 
                        className="w-full px-5 py-3.5 bg-white border-2 border-slate-200 rounded-2xl focus:border-blue-600 outline-none text-slate-900 font-extrabold text-base shadow-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Mata Pelajaran Utama</label>
                      <input type="text" value={specialty} onChange={(e) => setSpecialty(e.target.value)} 
                        className="w-full px-5 py-3.5 bg-white border-2 border-slate-200 rounded-2xl focus:border-blue-600 outline-none text-slate-900 font-extrabold text-base shadow-sm" />
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Tempat Lahir</label>
                  <input type="text" value={tempatLahir} onChange={(e) => setTempatLahir(e.target.value)} 
                    className="w-full px-5 py-3.5 bg-white border-2 border-slate-200 rounded-2xl focus:border-blue-600 outline-none text-slate-900 font-extrabold text-base shadow-sm" />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Tanggal Lahir</label>
                  <input type="date" value={tanggalLahir} onChange={(e) => setTanggalLahir(e.target.value)} 
                    className="w-full px-5 py-3.5 bg-white border-2 border-slate-200 rounded-2xl focus:border-blue-600 outline-none text-slate-900 font-extrabold text-base shadow-sm" />
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Jenis Kelamin</label>
                  <select value={jenisKelamin} onChange={(e) => setJenisKelamin(e.target.value)} className="w-full px-5 py-3.5 bg-white border-2 border-slate-200 rounded-2xl focus:border-blue-600 outline-none text-slate-900 font-extrabold text-base shadow-sm">
                    <option value="Laki-laki">Laki-laki</option>
                    <option value="Perempuan">Perempuan</option>
                  </select>
                </div>
              </div>
              
              <button type="submit" disabled={isSubmitting} className="w-full py-4 mt-4 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 text-lg disabled:opacity-50">
                {isSubmitting ? "Menyimpan Data..." : "Simpan Data ke Sistem"}
              </button>
            </form>
          </div>
        </div>
      )}
      
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm p-8 text-center animate-in zoom-in-95">
            <h3 className="text-2xl font-black text-slate-800 mb-4">Hapus Permanen?</h3>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirmId(null)} className="flex-1 py-3 bg-slate-100 font-bold rounded-xl text-slate-600">Batal</button>
              <button onClick={() => handleDelete(deleteConfirmId)} className="flex-1 py-3 bg-red-600 font-bold rounded-xl text-white">Hapus</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}