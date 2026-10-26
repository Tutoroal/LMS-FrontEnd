"use client";
import { useEffect, useId, useRef, isValidElement, cloneElement, type ReactNode } from "react";
import { X, AlertCircle, CheckCircle, BookOpen } from "lucide-react";
export const button = "lms-button lms-button-primary";
export const secondary = "lms-button lms-button-secondary";
export const danger = "lms-button lms-button-danger";
export const inputClass = "lms-input";
export const card = "lms-card";
export function PageHeading({ title, description, children }: { title: string; description: string; children?: ReactNode }) {
 return <div className="page-heading"><div><h1>{title}</h1><p className="page-description">{description}</p></div>{children}</div>;
}
export function Notice({ error, message }: { error?: string; message?: string }) {
 if (!error && !message) return null;
 return <div role={error ? "alert" : "status"} className={`lms-notice ${error ? "lms-notice-error" : "lms-notice-success"}`}>{error ? <AlertCircle className="shrink-0" size={18} /> : <CheckCircle className="shrink-0" size={18} />}<span>{error || message}</span></div>;
}
export function Empty({ text = "Belum ada data." }: { text?: string }) { return <div className={`${card} lms-empty`}><BookOpen className="mx-auto mb-4 text-slate-300" size={36} />{text}</div>; }
export function Loading() { return <p role="status" className="lms-loading"><span className="loading-dot" aria-hidden="true"/>Memuat data...</p>; }
export function Field({ label, children }: { label: string; children: ReactNode }) { const id=useId(); return <div className="lms-field"><label htmlFor={id} className="block">{label}</label>{isValidElement<{id?:string}>(children)?cloneElement(children,{id}):children}</div>; }
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
 return <div className="modal-backdrop"><div ref={ref} role="dialog" aria-modal="true" aria-labelledby={id} className="modal-panel"><div className="modal-heading"><h2 id={id} className="text-xl font-black">{title}</h2><button type="button" aria-label="Tutup dialog" onClick={close} className="icon-button"><X size={20} /></button></div>{children}</div></div>;
}
export function ConfirmDelete({ title, description, busy, confirm, close }: { title: string; description: string; busy: boolean; confirm: () => void; close: () => void }) {
 return <Modal title={title} close={close}><p className="mb-6 text-sm leading-relaxed text-slate-500">{description}</p><div className="flex justify-end gap-3"><button className={secondary} disabled={busy} onClick={close}>Batal</button><button className={danger} disabled={busy} onClick={confirm}>{busy ? "Menghapus..." : "Hapus"}</button></div></Modal>;
}
