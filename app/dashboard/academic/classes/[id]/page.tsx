"use client";
import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { apiJSON, jsonBody } from "@/lib/api";
import { useResource, useAction } from "@/lib/use-resource";
import type { ClassData,UserData } from "@/lib/types";
import { PageHeading, Notice, Loading, Empty, Modal, button, secondary, danger, inputClass, card } from "@/components/ui";
export default function ClassPage(){const {id}=useParams<{id:string}>();return <ClassRoom key={id} id={id} />;}
function ClassRoom({id}:{id:string}){
 const resource=useResource<{class:ClassData;students:UserData[]}>(`/admin/classes/${id}/details`);
 const all=useResource<{data:UserData[]}>("/admin/users");const action=useAction();
 const [open,setOpen]=useState(false);const [selected,setSelected]=useState<string[]>([]);const [search,setSearch]=useState("");
 const candidates=(all.data?.data || []).filter(user=>user.RoleID===3 && user.ClassID!==Number(id) && [user.Name,user.NIS,user.Email].some(value=>value.toLowerCase().includes(search.toLowerCase())));
 const assign=()=>void action.run(async()=>{await apiJSON("/admin/students/assign",{method:"PUT",...jsonBody({class_id:Number(id),student_ids:selected})});setOpen(false);setSelected([]);resource.reload();all.reload();},"Siswa berhasil ditempatkan.");
 return <div className="mx-auto max-w-6xl space-y-6"><Link href="/dashboard/academic/classes" className={secondary}>Kembali ke kelas</Link><PageHeading title={resource.data?.class.ClassName || "Detail kelas"} description={`Wali kelas: ${resource.data?.class.HomeroomTeacher?.Name || "Belum ditetapkan"}`}><button className={button} onClick={()=>setOpen(true)}>Tambahkan siswa</button></PageHeading><Notice error={resource.error||all.error||action.error} message={action.message}/>
 {resource.loading?<Loading/>:!resource.data?.students.length?<Empty text="Belum ada siswa di kelas ini."/>:<div className={`${card} overflow-x-auto p-0`}><table className="w-full text-left text-sm"><thead className="bg-slate-50"><tr><th className="p-5">Nama</th><th className="p-5">NIS / NISN</th><th className="p-5">Email</th><th className="p-5">Aksi</th></tr></thead><tbody>{resource.data.students.map(student=><tr key={student.ID} className="border-t border-slate-100"><td className="p-5 font-bold">{student.Name}</td><td className="p-5">{student.NIS || student.NISN_NIP || "-"}</td><td className="p-5">{student.Email}</td><td className="p-5"><button className={danger} disabled={action.busy} onClick={()=>{if(window.confirm("Keluarkan siswa dari kelas ini?"))void action.run(async()=>{await apiJSON(`/admin/students/${student.ID}/class`,{method:"PUT",...jsonBody({class_id:null})});resource.reload();all.reload();},"Penempatan kelas diperbarui.");}}>Keluarkan</button></td></tr>)}</tbody></table></div>}
 {open&&<Modal title="Tempatkan siswa di kelas" close={()=>setOpen(false)}><div className="space-y-4"><Notice error={action.error}/><p className="text-sm text-slate-500">Siswa dari kelas lain akan dipindahkan ke kelas ini. Pemindahan siswa yang sedang ujian akan ditolak.</p><input aria-label="Cari siswa" value={search} onChange={event=>setSearch(event.target.value)} placeholder="Cari siswa..." className={inputClass}/><div className="max-h-72 space-y-2 overflow-auto">{candidates.map(user=><label key={user.ID} className="flex items-center gap-3 rounded-xl border border-slate-200 p-3 text-sm"><input type="checkbox" checked={selected.includes(user.ID)} onChange={()=>setSelected(values=>values.includes(user.ID)?values.filter(value=>value!==user.ID):[...values,user.ID])}/><span><strong>{user.Name}</strong><span className="ml-2 text-slate-500">{user.Class?.ClassName || "Tanpa kelas"}</span></span></label>)}</div><button disabled={action.busy||!selected.length} className={button} onClick={assign}>{action.busy?"Memindahkan...":`Tempatkan ${selected.length} siswa`}</button></div></Modal>}
 </div>;
}
