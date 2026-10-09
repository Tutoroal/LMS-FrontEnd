"use client";
import { useState, type FormEvent } from "react";
import Link from "next/link";
import { apiJSON, jsonBody } from "@/lib/api";
import { useResource, useAction } from "@/lib/use-resource";
import { DEPARTMENTS, type ClassData, type UserData } from "@/lib/types";
import { PageHeading, Notice, Loading, Empty, Modal, ConfirmDelete, Field, button, secondary, danger, inputClass, card } from "@/components/ui";

export default function ClassesPage() {
 const resource = useResource<{data: ClassData[]}>("/admin/classes");
 const users = useResource<{data: UserData[]}>("/admin/users");
 const action = useAction();
 const [editing,setEditing] = useState<ClassData | null>(null);
 const [open,setOpen] = useState(false);
 const [deleting,setDeleting] = useState<ClassData | null>(null);
 const [major,setMajor] = useState("");
 const classes = (resource.data?.data || []).filter(row => !major || row.Major === major);
 const teachers = (users.data?.data || []).filter(user => user.RoleID === 2 && !(resource.data?.data || []).some(row => row.HomeroomTeacherID === user.ID && row.ID !== editing?.ID));
 const save = async (event: FormEvent<HTMLFormElement>) => {
  event.preventDefault(); const form = new FormData(event.currentTarget);
  await action.run(async () => { await apiJSON(editing ? `/admin/classes/${editing.ID}` : "/admin/classes", {method: editing ? "PUT" : "POST", ...jsonBody({class_name:form.get("class_name"),major:form.get("major"),homeroom_teacher_id:form.get("teacher_id") || null})}); setOpen(false);resource.reload();}, "Kelas tersimpan.");
 };
 return <div className="mx-auto max-w-7xl space-y-6">
  <PageHeading title="Manajemen Kelas" description="Atur rombongan belajar, enam jurusan, dan wali kelas."><button className={button} onClick={() => {setEditing(null);setOpen(true);}}>Tambah kelas</button></PageHeading>
  <Notice error={resource.error || users.error || action.error} message={action.message} />
  <select aria-label="Filter jurusan" className={`${inputClass} sm:max-w-xs`} value={major} onChange={event=>setMajor(event.target.value)}><option value="">Semua jurusan</option>{DEPARTMENTS.map(value=><option key={value}>{value}</option>)}</select>
  {resource.loading ? <Loading /> : classes.length === 0 ? <Empty text="Belum ada kelas untuk jurusan ini." /> : <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{classes.map(row=><article key={row.ID} className={card}><p className="text-xs font-bold uppercase text-indigo-600">{row.Major || "Umum"}</p><h2 className="mt-3 text-xl font-black">{row.ClassName}</h2><p className="my-3 text-sm text-slate-500">Wali kelas: {row.HomeroomTeacher?.Name || "Belum ditetapkan"}</p><p className="mb-5 text-sm text-slate-500">{users.data?.data.filter(user=>user.RoleID===3 && user.ClassID===row.ID).length || 0} siswa</p><div className="flex flex-wrap gap-2"><Link className={secondary} href={`/dashboard/academic/classes/${row.ID}`}>Lihat siswa</Link><button className={secondary} onClick={()=>{setEditing(row);setOpen(true);}}>Edit</button><button className={danger} onClick={()=>setDeleting(row)}>Hapus</button></div></article>)}</div>}
  {open && <Modal title={editing ? "Edit kelas" : "Tambah kelas"} close={()=>setOpen(false)}><form onSubmit={save} className="space-y-5"><Notice error={action.error} /><Field label="Nama kelas"><input name="class_name" required maxLength={50} defaultValue={editing?.ClassName || ""} placeholder="XI PPLG 1" className={inputClass} /></Field><Field label="Jurusan"><select name="major" defaultValue={editing?.Major || ""} className={inputClass}><option value="">Tentukan dari nama kelas</option>{DEPARTMENTS.map(value=><option key={value}>{value}</option>)}</select></Field><Field label="Wali kelas"><select name="teacher_id" defaultValue={editing?.HomeroomTeacherID || ""} className={inputClass}><option value="">Belum ditetapkan</option>{teachers.map(user=><option key={user.ID} value={user.ID}>{user.Name}</option>)}</select></Field><button className={button} disabled={action.busy}>{action.busy ? "Menyimpan..." : "Simpan kelas"}</button></form></Modal>}
  {deleting && <ConfirmDelete title={`Hapus ${deleting.ClassName}?`} description="Materi, tugas, jadwal, serta ujian dan hasil kelas ini ikut dihapus. Akun siswa dipertahankan dengan status tanpa kelas." busy={action.busy} close={()=>setDeleting(null)} confirm={()=>void action.run(async()=>{await apiJSON(`/admin/classes/${deleting.ID}`,{method:"DELETE"});setDeleting(null);resource.reload();users.reload();},"Kelas dihapus.")} />}
 </div>;
}
