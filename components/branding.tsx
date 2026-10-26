import Image from "next/image";
import { BookOpen, Hotel } from "lucide-react";

export function LogoMark({ size = 44, className = "" }: { size?: number; className?: string }) {
 return <span className={`school-logo ${className}`} style={{ width: size, height: size }}><Image src="/branding/logo-smk.png" alt="Logo SMK Citra Negara" fill sizes={`${size}px`} className="object-contain" /></span>;
}
export function SchoolBrand({ compact = false, name = "LMS Citra Negara", caption = "Satu Sistem Untuk Semua" }: { compact?: boolean; name?: string; caption?: string }) {
 return <span className={`school-brand ${compact ? "school-brand-compact" : ""}`}><LogoMark size={compact ? 38 : 44} /><span className="min-w-0"><strong>{name}</strong><span className="brand-caption">{caption}</span></span></span>;
}
const mascots: Record<string, string> = { PPLG: "pplg", TJKT: "tjkt", DKV: "dkv", BDR: "bdr", PM: "bdr", MPLB: "mplb" };
export function DepartmentMascot({ major, size = 76, className = "" }: { major?: string; size?: number; className?: string }) {
 const name = (major || "").trim().toUpperCase(), asset = mascots[name];
 return <span className={`department-art ${className}`} style={{ width: size, height: size }}>{asset ? <Image src={`/branding/${asset}.png`} alt={`Maskot ${name === "BDR" ? "BDR / Pemasaran" : name}`} fill sizes={`${size}px`} className="object-contain" /> : name === "PERHOTELAN" ? <Hotel size={Math.min(size * .46, 56)} strokeWidth={1.4} aria-label="Jurusan Perhotelan" /> : <BookOpen size={Math.min(size * .4, 36)} strokeWidth={1.5} aria-label="Kelas" />}</span>;
}
