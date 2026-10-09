"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Clock, CheckCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { apiJSON } from "@/lib/api";

type Option = "A" | "B" | "C" | "D";
type Answers = Record<string, Option>;
type Question = { ID: number; QuestionText: string; OptionA: string; OptionB: string; OptionC: string; OptionD: string };
type Result = { Score: number };
type Attempt = {
  exam: { ID: number; Title: string; Duration: number };
  questions?: Question[]; answers?: Answers; expires_at?: string; server_time?: string; result?: Result;
};
const json = (answers: Answers) => ({ headers: { "Content-Type": "application/json" }, body: JSON.stringify({ answers }) });

export default function TakeExamPage() {
  const { id } = useParams<{ id: string }>();
  return <ExamSheet key={id} id={id} />;
}

function ExamSheet({ id }: { id: string }) {
  const [attempt, setAttempt] = useState<Attempt | null>(null);
  const [answers, setAnswers] = useState<Answers>({});
  const [result, setResult] = useState<Result | null>(null);
  const [current, setCurrent] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [error, setError] = useState("");
  const [saveStatus, setSaveStatus] = useState("Semua jawaban tersimpan");
  const [submitting, setSubmitting] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [reload, setReload] = useState(0);
  const answersRef = useRef<Answers>({});
  const pending = useRef<Answers>({});
  const saving = useRef<Promise<void> | null>(null);
  const deadline = useRef(0);
  const finished = useRef(false);
  const submittingRef = useRef(false);
  const autoAttempted = useRef(false);

  const complete = useCallback((value: Result) => {
    finished.current = true;
    setResult(value);
    setError("");
    setConfirm(false);
  }, []);

  const flush = useCallback((): Promise<void> => {
    if (saving.current) return saving.current;
    saving.current = (async () => {
      while (!finished.current && Object.keys(pending.current).length > 0) {
        const batch = { ...pending.current };
        setSaveStatus("Menyimpan jawaban...");
        try {
          const response = await apiJSON<{ result?: Result }>(`/student/exams/${id}/answers`, { method: "PUT", ...json(batch) });
          if (response.result) { complete(response.result); return; }
          for (const [key, value] of Object.entries(batch)) { if (pending.current[key] === value) delete pending.current[key]; }
          setSaveStatus(Object.keys(pending.current).length ? "Menyimpan jawaban..." : "Semua jawaban tersimpan");
        } catch {
          setSaveStatus("Jawaban belum tersimpan. Periksa koneksi; sistem akan mencoba lagi.");
          return;
        }
      }
    })().finally(() => { saving.current = null; });
    return saving.current;
  }, [id, complete]);

  const submit = useCallback(async () => {
    if (submittingRef.current || finished.current) return;
    submittingRef.current = true;
    setSubmitting(true);
    setError("");
    setConfirm(false);
    try {
      await flush();
      if (finished.current) return;
      const data = await apiJSON<{ result: Result }>(`/student/exams/${id}/submit`, { method: "POST", ...json(answersRef.current) });
      complete(data.result);
    } catch (err) { setError(err instanceof Error ? err.message : "Pengiriman gagal. Coba lagi."); }
    finally { submittingRef.current = false; setSubmitting(false); }
  }, [id, flush, complete]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const data = await apiJSON<Attempt>(`/student/exams/${id}/start`, { method: "POST" });
        if (cancelled) return;
        if (data.result) { setAttempt(data); complete(data.result); return; }
        if (!data.questions?.length || !data.expires_at || !data.server_time) throw new Error("Data ujian belum lengkap.");
        const remaining = Math.max(0, new Date(data.expires_at).getTime() - new Date(data.server_time).getTime());
        // A monotonic clock resists local clock changes; the server enforces the actual deadline.
        deadline.current = performance.now() + remaining;
        answersRef.current = data.answers || {};
        setAnswers(answersRef.current);
        setSeconds(Math.ceil(remaining / 1000));
        setAttempt(data);
        setError("");
      } catch (err) { if (!cancelled) setError(err instanceof Error ? err.message : "Gagal memuat ujian."); }
    };
    void load();
    return () => { cancelled = true; };
  }, [id, reload, complete]);

  useEffect(() => {
    if (!attempt || result) return;
    const tick = () => {
      const left = Math.max(0, Math.ceil((deadline.current - performance.now()) / 1000));
      setSeconds(left);
      if (left === 0 && !autoAttempted.current) { autoAttempted.current = true; void submit(); }
    };
    const interval = setInterval(tick, 250);
    const retry = setInterval(() => { if (Object.keys(pending.current).length) void flush(); }, 5000);
    const beforeUnload = (event: BeforeUnloadEvent) => { if (Object.keys(pending.current).length || submittingRef.current) event.preventDefault(); };
    const resume = () => { tick(); void flush(); };
    window.addEventListener("beforeunload", beforeUnload);
    window.addEventListener("online", resume);
    document.addEventListener("visibilitychange", tick);
    return () => { clearInterval(interval); clearInterval(retry); window.removeEventListener("beforeunload", beforeUnload); window.removeEventListener("online", resume); document.removeEventListener("visibilitychange", tick); };
  }, [attempt, result, submit, flush]);

  const choose = (questionID: number, option: Option) => {
    if (finished.current || submittingRef.current || seconds === 0) return;
    answersRef.current = { ...answersRef.current, [questionID]: option };
    pending.current[questionID] = option;
    setAnswers(answersRef.current);
    void flush();
  };

  if (result) return <section className="mx-auto max-w-xl rounded-3xl border border-emerald-200 bg-white p-10 text-center shadow-sm"><CheckCircle className="mx-auto text-emerald-600" size={56} /><h1 className="mt-4 text-2xl font-black">Ujian selesai</h1><p className="mt-2 text-slate-500">{attempt?.exam.Title}</p><p className="my-6 text-5xl font-black text-emerald-600">{result.Score.toFixed(2)}<span className="text-lg text-slate-400"> / 100</span></p><p className="mb-6 text-sm text-slate-500">Hasil sudah tersimpan. Jawaban tidak dapat diubah.</p><Link href="/dashboard/student/exams" className="inline-block rounded-xl bg-indigo-600 px-6 py-3 font-bold text-white">Kembali ke daftar ujian</Link></section>;
  if (!attempt) return <div className="space-y-4 p-8 text-center">{error ? <><p role="alert" className="text-red-600">{error}</p><button className="rounded-xl bg-indigo-600 px-5 py-3 text-white" onClick={() => setReload(value => value + 1)}>Coba lagi</button><Link href="/dashboard/student/exams" className="block underline">Kembali ke daftar ujian</Link></> : <p role="status">Menyiapkan lembar ujian...</p>}</div>;
  const questions = attempt.questions || [];
  const question = questions[current];
  if (!question) return <p role="alert">Soal tidak tersedia.</p>;
  const answered = Object.keys(answers).length;
  return <div className="mx-auto max-w-6xl space-y-6">
    <div className="flex flex-wrap items-center justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-widest text-indigo-600">Lembar ujian</p><h1 className="mt-1 text-2xl font-black">{attempt.exam.Title}</h1><p className="mt-2 text-sm text-slate-500">Jawaban disimpan otomatis. Waktu tetap berjalan jika halaman ditutup.</p></div><div role="timer" aria-label="Sisa waktu" className={`flex items-center gap-2 rounded-2xl px-5 py-3 font-mono text-2xl font-bold ${seconds <= 60 ? "bg-red-50 text-red-600" : "bg-indigo-50 text-indigo-700"}`}><Clock size={22} />{String(Math.floor(seconds / 60)).padStart(2, "0")}:{String(seconds % 60).padStart(2, "0")}</div></div>
    {error && <div role="alert" className="rounded-xl bg-red-50 p-4 text-red-700">{error} <button disabled={submitting} onClick={() => void submit()} className="ml-2 underline">Coba kirim lagi</button></div>}
    {seconds === 0 && <p role="status" className="rounded-xl bg-amber-50 p-4 text-amber-800">Waktu habis. Jawaban yang diterima server sebelum batas waktu akan dinilai.{submitting ? " Mengirim..." : ""}</p>}
    <div className="grid gap-6 lg:grid-cols-[1fr_260px]">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="mb-5 text-sm font-bold text-indigo-600">Soal {current + 1} dari {questions.length}</p>
        <fieldset disabled={seconds === 0 || submitting} className="space-y-4"><legend className="mb-6 whitespace-pre-wrap text-lg font-bold leading-relaxed">{question.QuestionText}</legend>
          {(["A", "B", "C", "D"] as const).map(option => <label key={option} className={`flex cursor-pointer items-start gap-4 rounded-2xl border-2 p-4 transition-colors ${answers[question.ID] === option ? "border-indigo-500 bg-indigo-50 text-indigo-900" : "border-slate-200 hover:border-indigo-300"}`}><input type="radio" name={`question-${question.ID}`} value={option} checked={answers[question.ID] === option} onChange={() => choose(question.ID, option)} className="mt-1 accent-indigo-600" /><span className="font-bold">{option}.</span><span className="whitespace-pre-wrap">{question[`Option${option}`]}</span></label>)}
        </fieldset>
        <div className="mt-8 flex justify-between gap-3"><button disabled={current === 0} onClick={() => setCurrent(value => value - 1)} className="flex items-center rounded-xl bg-slate-50 px-4 py-3 font-bold disabled:opacity-40"><ChevronLeft size={18} />Sebelumnya</button><button disabled={current === questions.length - 1} onClick={() => setCurrent(value => value + 1)} className="flex items-center rounded-xl bg-slate-50 px-4 py-3 font-bold disabled:opacity-40">Berikutnya<ChevronRight size={18} /></button></div>
      </section>
      <aside className="h-fit rounded-3xl border border-slate-200 bg-white p-6"><h2 className="font-black">Navigasi soal</h2><p className="mt-2 text-sm text-slate-500">{answered} dari {questions.length} terjawab</p><div className="my-5 grid grid-cols-5 gap-2">{questions.map((q, index) => <button key={q.ID} aria-label={`Soal ${index + 1}, ${answers[q.ID] ? "terjawab" : "belum dijawab"}`} aria-current={index === current ? "step" : undefined} onClick={() => setCurrent(index)} className={`rounded-lg border py-2 font-bold ${index === current ? "ring-2 ring-indigo-500 ring-offset-2" : ""} ${answers[q.ID] ? "border-indigo-600 bg-indigo-600 text-white" : "border-slate-200 bg-slate-50"}`}>{index + 1}</button>)}</div><p role="status" className="mb-5 text-xs text-slate-500">{saveStatus}</p><button disabled={submitting} onClick={() => seconds === 0 ? void submit() : setConfirm(true)} className="w-full rounded-xl bg-indigo-600 py-3 font-bold text-white disabled:opacity-50">{submitting ? "Mengirim..." : "Kumpulkan Ujian"}</button></aside>
    </div>
    {confirm && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"><section role="dialog" aria-modal="true" aria-labelledby="submit-title" className="w-full max-w-md rounded-3xl bg-white p-8"><h2 id="submit-title" className="text-xl font-black">Kumpulkan ujian sekarang?</h2><p className="my-4 text-slate-500">{questions.length - answered > 0 ? `Masih ada ${questions.length - answered} soal belum dijawab. ` : "Semua soal sudah dijawab. "}Setelah dikumpulkan, jawaban tidak dapat diubah.</p><div className="flex gap-3"><button autoFocus onClick={() => setConfirm(false)} className="flex-1 rounded-xl bg-slate-100 p-3 font-bold">Periksa lagi</button><button onClick={() => void submit()} className="flex-1 rounded-xl bg-indigo-600 p-3 font-bold text-white">Ya, kumpulkan</button></div></section></div>}
  </div>;
}
