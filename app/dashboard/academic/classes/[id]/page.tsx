"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Users, GraduationCap, ArrowLeft, UserCheck, Mail, ShieldAlert } from "lucide-react";

export default function ClassDetailPage() {
  const params = useParams();
  const router = useRouter();
  const classId = params.id;

  const [classData, setClassData] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchClassDetails = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    try {
      // Ambil daftar kelas untuk dicari namanya
      const resClasses = await fetch("http://localhost:8080/api/admin/classes", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const dataClasses = await resClasses.json();
      if (resClasses.ok) {
        const current = (dataClasses.data || []).find((c: any) => String(c.ID) === String(classId));
        setClassData(current);
      }

      // Ambil detail siswa khusus kelas ini
      const resStudents = await fetch(`http://localhost:8080/api/admin/classes/${classId}/details`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const dataStudents = await resStudents.json();
      if (resStudents.ok) {
        setStudents(dataStudents.students || []);
      }
    } catch (error) {
      console.error("Gagal memuat detail kelas:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (classId) fetchClassDetails();
  }, [classId]);

  // Aksi mengeluarkan siswa dari kelas
  const handleRemoveFromClass = async (studentId: string) => {
    if (!confirm("Yakin ingin mengeluarkan siswa ini dari kelas?")) return;
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`http://localhost:8080/api/admin/students/${studentId}/class`, {
        method: "PUT",
        headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ class_id: null }), // Set null agar keluar dari kelas
      });
      if (res.ok) {
        fetchClassDetails();
      } else {
        alert("Gagal mengeluarkan siswa.");
      }
    } catch (error) {
      alert("Terjadi kesalahan sistem.");
    }
  };

  if (loading) {
    return <div className="py-20 text-center text-slate-400 font-bold animate-pulse">Memuat data kelas...</div>;
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto animate-in fade-in duration-500">
      
      {/* TOMBOL KEMBALI & HEADER */}
      <div className="space-y-4">
        <button 
          onClick={() => router.push("/dashboard/academic/classes")} 
          className="flex items-center gap-2 text-slate-500 hover:text-slate-800 font-bold transition-colors bg-white px-4 py-2 rounded-xl border border-slate-200 w-fit shadow-sm"
        >
          <ArrowLeft size={18} /> Kembali ke Daftar Kelas
        </button>

        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-indigo-100 blur-3xl opacity-50"></div>
          
          <div className="flex items-center gap-5 relative z-10">
            <div className="p-4 rounded-2xl bg-indigo-100 text-indigo-600 shadow-inner">
              <Users size={36} strokeWidth={2.5} />
            </div>
            <div>
              <span className="text-xs font-black tracking-wider text-indigo-600 uppercase bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
                Kontrol Panel Kelas
              </span>
              <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mt-1">
                {classData?.ClassName || "Kelas Tidak Ditemukan"}
              </h1>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl flex items-center gap-3 relative z-10 w-full md:w-auto">
            <UserCheck className="text-emerald-600" size={24} />
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase">Wali Kelas</p>
              <p className="text-base font-extrabold text-slate-800">
                {classData?.HomeroomTeacher?.Name || "Belum Ditugaskan"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* DAFTAR SISWA DI KELAS INI */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 md:p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="flex items-center gap-3">
            <GraduationCap className="text-indigo-600" size={24} />
            <h3 className="text-xl font-black text-slate-900">Daftar Siswa Terdaftar ({students.length})</h3>
          </div>
        </div>

        {students.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <ShieldAlert size={48} className="mx-auto text-slate-300" />
            <p className="text-slate-500 font-bold text-lg">Belum ada siswa yang tergabung di kelas ini.</p>
            <p className="text-slate-400 text-sm">Anda dapat memasukkan siswa melalui menu Import Excel atau edit profil siswa.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {students.map((student, idx) => (
              <div key={student.ID || student.id} className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:bg-slate-50/80 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-700 font-black flex items-center justify-center text-lg shadow-sm border border-indigo-100">
                    {idx + 1}
                  </div>
                  <div>
                    <p className="font-extrabold text-slate-900 text-lg">{student.Name || student.name}</p>
                    <div className="flex items-center gap-2 text-slate-500 text-sm font-semibold mt-0.5">
                      <Mail size={14} /> {student.Email || student.email}
                      <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs font-mono">
                        NISN: {student.NISN_NIP || student.nisn_nip || "-"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                  <button 
                    onClick={() => handleRemoveFromClass(student.ID || student.id)}
                    className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 font-bold text-sm rounded-xl transition-colors border border-red-200"
                  >
                    Keluarkan dari Kelas
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}