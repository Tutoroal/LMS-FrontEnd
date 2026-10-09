"use client";
import { useState, type FormEvent } from "react";
import { apiJSON,jsonBody } from "@/lib/api";
import { useResource,useAction } from "@/lib/use-resource";
import type {SubjectData,UserData} from "@/lib/types";
import {PageHeading,Notice,Loading,Empty,Modal,ConfirmDelete,Field,button,secondary,danger,inputClass,card} from "@/components/ui";
export default function SubjectsPage(){
 const resource=useResource<{data:SubjectData[]}>("/subjects");const users=useResource<{data:UserData[]}>("/admin/users");const action=useAction();
 const [open,setOpen]=useState(false);const [editing,setEditing]=useState<SubjectData|null>(null);const [deleting,setDeleting]=useState<SubjectData|null>(null);
 const save=async(event:FormEvent<HTMLFormElement>)=>{event.preventDefault();const form=new FormData(event.currentTarget);await action.run(async()=>{await apiJSON(editing?`/admin/subjects/${editing.ID}`:"/admin/subjects",{method:editing?"PUT":"POST",...jsonBody(Object.fromEntries(form.entries()))});setOpen(false);resource.reload();},"Mapel tersimpan.");};
 return <div className="mx-auto max-w-6xl space-y-6"><PageHeading title="Mata Pelajaran" description="Tetapkan guru pengampu. Akses materi, tugas, dan ujian mengikuti pengampu mapel."><button className={button} onClick={()=>{setEditing(null);setOpen(true);}}>Tambah mapel</button></PageHeading><Notice error={resource.error||users.error||action.error} message={action.message}/>
 {resource.loading?<Loading/>:!resource.data?.data.length?<Empty text="Belum ada mata pelajaran."/>:<div className="grid gap-5 md:grid-cols-2">{resource.data.data.map(row=><article key={row.ID} className={card}><h2 className="text-lg font-black">{row.SubjectName}</h2><p className="my-3 text-sm text-slate-500">Pengampu: {row.Teacher?.Name || "Belum ditetapkan"}</p><div className="flex gap-2"><button className={secondary} onClick={()=>{setEditing(row);setOpen(true);}}>Edit / ganti guru</button><button className={danger} onClick={()=>setDeleting(row)}>Hapus</button></div></article>)}</div>}
 {open&&<Modal title={editing?"Edit mata pelajaran":"Tambah mata pelajaran"} close={()=>setOpen(false)}><form onSubmit={save} className="space-y-5"><Notice error={action.error}/><Field label="Nama mata pelajaran"><input name="subject_name" required maxLength={100} defaultValue={editing?.SubjectName||""} className={inputClass}/></Field><Field label="Guru pengampu"><select required name="teacher_id" defaultValue={editing?.TeacherID||""} className={inputClass}><option value="">Pilih guru</option>{users.data?.data.filter(user=>user.RoleID===2).map(user=><option key={user.ID} value={user.ID}>{user.Name}</option>)}</select></Field><button disabled={action.busy} className={button}>{action.busy?"Menyimpan...":"Simpan mapel"}</button></form></Modal>}
 {deleting&&<ConfirmDelete title={`Hapus ${deleting.SubjectName}?`} description="Semua materi, tugas/pengumpulan, jadwal, dan ujian/hasil pada mapel ini akan ikut dihapus." busy={action.busy} close={()=>setDeleting(null)} confirm={()=>void action.run(async()=>{await apiJSON(`/admin/subjects/${deleting.ID}`,{method:"DELETE"});setDeleting(null);resource.reload();},"Mapel dihapus.")}/>}
 </div>;
}
