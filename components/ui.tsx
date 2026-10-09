"use client";
import { useEffect, useId, useRef, isValidElement, cloneElement, type ReactNode } from "react";
import { X, AlertCircle, CheckCircle, BookOpen } from "lucide-react";
export const button = "inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50";
export const secondary = "inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50";
export const danger = "inline-flex items-center justify-center rounded-xl bg-red-50 px-4 py-2.5 text-sm font-bold text-red-700 hover:bg-red-100 disabled:opacity-50";
export const inputClass = "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100";
export const card = "rounded-3xl border border-slate-200 bg-white p-6 shadow-sm";
export function PageHeading({ title, description, children }: { title: string; description: string; children?: ReactNode }) {
 return <div className="flex flex-wrap items-center justify-between gap-4"><div><h1 className="text-3xl font-black tracking-tight">{title}</h1><p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-500">{description}</p></div>{children}</div>;
}
export function Notice({ error, message }: { error?: string; message?: string }) {
 if (!error && !message) return null;
 return <div role={error ? "alert" : "status"} className={`flex items-start gap-3 rounded-2xl border p-4 text-sm ${error ? "border-red-100 bg-red-50 text-red-700" : "border-emerald-100 bg-emerald-50 text-emerald-700"}`}>{error ? <AlertCircle className="shrink-0" size={18} /> : <CheckCircle className="shrink-0" size={18} />}<span>{error || message}</span></div>;
}
export function Empty({ text = "Belum ada data." }: { text?: string }) { return <div className={`${card} py-12 text-center text-slate-500`}><BookOpen className="mx-auto mb-4 text-slate-300" size={36} />{text}</div>; }
export function Loading() { return <p role="status" className="py-10 text-center text-sm text-slate-500">Memuat data...</p>; }
export function Field({ label, children }: { label: string; children: ReactNode }) { const id=useId(); return <div className="block space-y-2 text-sm font-bold text-slate-700"><label htmlFor={id} className="block">{label}</label>{isValidElement<{id?:string}>(children)?cloneElement(children,{id}):children}</div>; }
export function Modal({ title, children, close }: { title: string; children: ReactNode; close: () => void }) {
 const id = useId();
 const ref = useRef<HTMLDivElement>(null);
 const closeRef = useRef(close);
 useEffect(() => { closeRef.current = close; }, [close]);
 useEffect(() => {
  const previous = document.activeElement as HTMLElement | null;
  const overflow = document.body.style.overflow;
  document.body.style.overflow = "hidden";
  const dialog = ref.current;
  dialog?.querySelector<HTMLElement>("input, select, textarea, button")?.focus();
  const handleKey = (event: KeyboardEvent) => {
   if (event.key === "Escape") closeRef.current();
   if (event.key !== "Tab" || !dialog) return;
   const focusable = Array.from(dialog.querySelectorAll<HTMLElement>('button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), a[href]'));
   const first = focusable[0], last = focusable[focusable.length - 1];
   if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
   else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
  };
  document.addEventListener("keydown", handleKey);
  return () => { document.body.style.overflow = overflow; document.removeEventListener("keydown", handleKey); previous?.focus(); };
 }, []);
 return <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"><div ref={ref} role="dialog" aria-modal="true" aria-labelledby={id} className="max-h-[90dvh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl sm:p-8"><div className="mb-6 flex items-center justify-between gap-4"><h2 id={id} className="text-xl font-black">{title}</h2><button type="button" aria-label="Tutup dialog" onClick={close} className="rounded-xl p-2 hover:bg-slate-100"><X size={20} /></button></div>{children}</div></div>;
}
export function ConfirmDelete({ title, description, busy, confirm, close }: { title: string; description: string; busy: boolean; confirm: () => void; close: () => void }) {
 return <Modal title={title} close={close}><p className="mb-6 text-sm leading-relaxed text-slate-500">{description}</p><div className="flex justify-end gap-3"><button className={secondary} disabled={busy} onClick={close}>Batal</button><button className={danger} disabled={busy} onClick={confirm}>{busy ? "Menghapus..." : "Hapus"}</button></div></Modal>;
}
