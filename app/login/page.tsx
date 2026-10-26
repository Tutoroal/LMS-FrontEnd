"use client";
import {useState,type FormEvent} from "react";
import {useRouter} from "next/navigation";
import Link from "next/link";
import {ArrowLeft,ArrowRight} from "lucide-react";
import {SchoolBrand,DepartmentMascot} from "@/components/branding";
import {apiJSON,jsonBody,roleHome} from "@/lib/api";
import {useAction} from "@/lib/use-resource";
import {Field,Notice,inputClass,button} from "@/components/ui";
export default function LoginPage(){
 const router=useRouter();const action=useAction();const [visible,setVisible]=useState(false);
 const login=async(event:FormEvent<HTMLFormElement>)=>{event.preventDefault();const form=new FormData(event.currentTarget);await action.run(async()=>{const data=await apiJSON<{token:string;role_id:number}>("/login",{method:"POST",...jsonBody({identifier:form.get("identifier"),password:form.get("password")})});localStorage.setItem("token",data.token);window.dispatchEvent(new Event("session-changed"));router.replace(roleHome(data.role_id));});};
 return <main className="auth-shell">
  <section className="auth-story"><SchoolBrand/><div className="auth-story-content"><p className="text-xs font-semibold tracking-[.12em] text-indigo-600">LMS CITRA NEGARA</p><h1>Belajar, berkarya,<br/>dan tumbuh bersama.</h1><p className="auth-story-description">Satu portal untuk materi belajar, tugas, ujian CBT, dan pengelolaan akademik enam jurusan.</p><div className="auth-mascots">{["PPLG","TJKT","DKV","BDR","PERHOTELAN","MPLB"].map(major=><span key={major} className="auth-mascot"><DepartmentMascot major={major} size={56}/></span>)}</div><p className="text-[11px] font-medium leading-6 tracking-wide text-slate-500">PPLG &middot; TJKT &middot; DKV &middot; BDR &middot; PERHOTELAN &middot; MPLB</p></div><p className="text-xs text-slate-500">Satu Sistem Untuk Semua</p></section>
  <section className="auth-form-side"><div className="auth-form-panel"><div className="auth-mobile-brand"><SchoolBrand/></div><Link href="/" className="inline-flex items-center gap-2 text-xs font-medium text-slate-500"><ArrowLeft size={14}/>Kembali ke beranda</Link><h2>Masuk ke portal</h2><p className="mb-7 mt-3 text-sm leading-6 text-slate-500">Gunakan NIS, NISN, NIP, atau email akun Anda.</p><Notice error={action.error}/><form onSubmit={login} className="mt-5 space-y-5"><Field label="Identitas akun"><input name="identifier" required autoComplete="username" autoFocus className={inputClass} placeholder="NIS / NISN / NIP / email"/></Field><Field label="Kata sandi"><input name="password" type={visible?"text":"password"} required autoComplete="current-password" className={inputClass}/></Field><label className="flex items-center gap-2.5 text-xs text-slate-500"><input type="checkbox" checked={visible} onChange={event=>setVisible(event.target.checked)} className="h-4 w-4 rounded"/>Tampilkan kata sandi</label><button disabled={action.busy} className={button+" w-full"}>{action.busy?"Memproses...":"Masuk"}<ArrowRight size={15}/></button></form><div className="auth-support"><p>Belum punya akun atau lupa kata sandi? Hubungi administrator atau wali kelas sekolah Anda.</p><Link href="/help" className="mt-3 inline-block font-semibold text-indigo-600">Panduan penggunaan</Link></div></div></section>
 </main>;
}
