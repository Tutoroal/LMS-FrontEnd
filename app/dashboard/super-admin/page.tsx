"use client";
import Link from "next/link";
import {ShieldCheck,Users,Settings,Activity,ChevronRight} from "lucide-react";
import Analytics from "@/components/analytics";
import {useResource} from "@/lib/use-resource";
import type {UserData,SchoolData} from "@/lib/types";
import {PageHeading,Notice,Loading,card} from "@/components/ui";

export default function SuperAdminHome(){
 const users=useResource<{data:UserData[]}>("/admin/users");
 const settings=useResource<{data:SchoolData}>("/settings");
 const admins=users.data?.data||[];
 const summaryCards=[{label:"Administrator aktif",value:String(admins.length),icon:Users},{label:"Nama sekolah",value:settings.data?.data.SchoolName||"Belum diatur",icon:ShieldCheck},{label:"Tahun ajaran",value:settings.data?.data.AcademicYear||"Belum diatur",icon:Activity}];
 return <div className="mx-auto max-w-7xl space-y-6">
  <PageHeading title="Beranda Super Admin" description="Kelola administrator dan konfigurasi global LMS. Operasional akademik tetap ditangani Admin."/>
  <Notice error={users.error||settings.error}/>
  {users.loading?<Loading/>:<>
   <div className="grid gap-4 sm:grid-cols-3">
    {summaryCards.map(item=><section key={item.label} className={card+" stat-card"}><span className="stat-icon"><item.icon size={18} aria-hidden="true"/></span><p className="text-sm text-slate-500">{item.label}</p><p className="mt-3 text-xl font-black">{item.value}</p></section>)}
   </div>
   <div className="grid gap-4 sm:grid-cols-2">
    <Link href="/dashboard/users/admin" className={card+" quick-link"}><div><h2 className="font-semibold">Kelola Administrator</h2><p className="mt-2 text-sm text-slate-500">Buat, perbarui, atau nonaktifkan akun Admin operasional.</p></div><ChevronRight size={18}/></Link>
    <Link href="/dashboard/settings" className={card+" quick-link"}><div><h2 className="font-semibold">Pengaturan Sistem</h2><p className="mt-2 text-sm text-slate-500">Atur identitas sekolah serta tahun ajaran yang berlaku.</p></div><Settings size={18}/></Link>
   </div>
  </>}
  <Analytics kind="admin"/>
 </div>;
}
