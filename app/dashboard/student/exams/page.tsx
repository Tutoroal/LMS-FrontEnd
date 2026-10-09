"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Award, Calendar, Clock, CheckCircle, Play } from "lucide-react";
import { apiJSON } from "@/lib/api";

type ExamItem = {
  exam: { ID: number; Title: string; Type: string; Date: string; Duration: number; IsActive: boolean };
  subject_name: string; has_completed: boolean; has_started: boolean; can_start: boolean;
  result: { Score: number };
};
export default function StudentExamsPage() {
  const [exams, setExams] = useState<ExamItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const load = useCallback(async () => {
    try { const data = await apiJSON<{ data: ExamItem[] }>("/student/exams"); setExams(data.data); setError(""); }
    catch (err) { setError(err instanceof Error ? err.message : "Gagal memuat ujian."); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { const initial = setTimeout(load, 0); const timer = setInterval(load, 30000); return () => { clearTimeout(initial); clearInterval(timer); }; }, [load]);
  return <div className="mx-auto max-w-7xl space-y-8">
    <div className="flex items-center gap-4"><Award size={36} className="text-purple-600" /><div><h1 className="text-3xl font-black">Ujian Saya</h1><p className="mt-1 text-slate-500">Pilih ujian sesuai jadwal. Waktu dimulai saat Anda membuka lembar ujian.</p></div></div>
    {error && <div role="alert" className="rounded-2xl bg-red-50 p-4 text-red-700">{error} <button onClick={load} className="ml-3 underline">Coba lagi</button></div>}
    {loading ? <p role="status">Memuat jadwal ujian...</p> : exams.length === 0 && !error ? <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center"><CheckCircle className="mx-auto mb-3 text-slate-400" size={40} /><h2 className="font-bold">Belum ada jadwal ujian untuk kelas Anda.</h2></div> :
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">{exams.map(item => <article key={item.exam.ID} className="flex flex-col justify-between rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div><p className="text-xs font-bold uppercase text-purple-600">{item.exam.Type} · {item.subject_name}</p><h2 className="my-3 text-xl font-black">{item.exam.Title}</h2><p className="flex items-center gap-2 text-sm text-slate-500"><Calendar size={16} />{new Date(item.exam.Date).toLocaleDateString("id-ID", { dateStyle: "long", timeZone: "UTC" })}</p><p className="mt-2 flex items-center gap-2 text-sm text-slate-500"><Clock size={16} />{item.exam.Duration} menit</p></div>
        <div className="mt-6 border-t border-slate-100 pt-4">{item.has_completed ? <p className="rounded-xl bg-emerald-50 p-3 text-center font-bold text-emerald-700">Selesai · Nilai {item.result.Score.toFixed(2)}</p> : item.can_start ? <Link href={`/dashboard/student/exams/${item.exam.ID}/take`} prefetch={false} className="flex items-center justify-center gap-2 rounded-xl bg-purple-600 p-3 font-bold text-white hover:bg-purple-700"><Play size={16} />{item.has_started ? "Lanjutkan Ujian" : "Mulai Ujian"}</Link> : <p className="rounded-xl bg-slate-50 p-3 text-center text-sm text-slate-500">{item.exam.IsActive ? "Menunggu jadwal atau kelengkapan soal" : "Menunggu dibuka guru"}</p>}</div>
      </article>)}</div>}
  </div>;
}
