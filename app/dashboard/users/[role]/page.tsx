"use client";
import { useState, type FormEvent } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { apiJSON, jsonBody } from "@/lib/api";
import { useResource, useAction } from "@/lib/use-resource";
import type { UserData, ClassData } from "@/lib/types";
import { PageHeading, Notice, Empty, Loading, Modal, ConfirmDelete, Field, button, secondary, danger, inputClass, card } from "@/components/ui";

export default function UsersPage() {
 const { role } = useParams<{ role: string }>();
 if (!["admin","guru","siswa"].includes(role)) return <Notice error="Peran tidak ditemukan." />;
 return <UsersManager key={role} role={role} />;
}
function UsersManager({ role }: { role: string }) {
 const targetRole = role === "admin" ? 1 : role === "guru" ? 2 : 3;
 const resource = useResource<{ data: UserData[] }>("/admin/users");
 const classes = useResource<{ data: ClassData[] }>("/admin/classes");
 const action = useAction();
 const [search, setSearch] = useState("");
 const [editing, setEditing] = useState<UserData | null>(null);
 const [open, setOpen] = useState(false);
 const [deleting, setDeleting] = useState<UserData | null>(null);
 const users = (resource.data?.data || []).filter(user => user.RoleID === targetRole && [user.Name, user.Email, user.NIS, user.NISN_NIP, user.Class?.ClassName || ""].some(value => value.toLowerCase().includes(search.toLowerCase())));
 const save = async (event: FormEvent<HTMLFormElement>) => {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const payload = Object.fromEntries(form.entries());
  await action.run(async () => {
   await apiJSON(editing ? `/admin/users/${editing.ID}` : "/admin/users", { method: editing ? "PUT" : "POST", ...jsonBody({ ...payload, role_id: targetRole, class_id: form.get("class_id") ? Number(form.get("class_id")) : null }) });
   setOpen(false); resource.reload();
  }, "Data akun tersimpan.");
 };
 return <div className="mx-auto max-w-7xl space-y-6">
  <PageHeading title={`Manajemen ${role === "admin" ? "Administrator" : role === "guru" ? "Guru" : "Siswa"}`} description="Kelola akun, identitas, dan penempatan kelas. Tetapkan ulang akun bertanda kelas lama yang sudah tidak tersedia."><div className="flex gap-3"><Link className={secondary} href="/dashboard/academic/import">Import Excel</Link><button className={button} onClick={() => { setEditing(null); setOpen(true); }}>Tambah akun</button></div></PageHeading>
  <Notice error={resource.error || action.error || classes.error} message={action.message} />
  <input aria-label="Cari pengguna" className={inputClass} placeholder="Cari nama, email, NIS/NIP, atau kelas..." value={search} onChange={event => setSearch(event.target.value)} />
  {resource.loading ? <Loading /> : users.length === 0 ? <Empty text="Tidak ada akun yang sesuai." /> : <div className={`${card} overflow-x-auto p-0`}><table className="w-full text-left text-sm"><thead className="bg-slate-50 text-slate-500"><tr><th className="p-5">Nama / Identitas</th><th className="p-5">Email</th><th className="p-5">Akademik</th><th className="p-5">Aksi</th></tr></thead><tbody>{users.map(user => <tr key={user.ID} className="border-t border-slate-100"><td className="p-5"><p className="font-bold">{user.Name}</p><p className="mt-1 text-xs text-slate-500">{user.NISN_NIP || user.NIS || "-"}</p></td><td className="p-5">{user.Email}</td><td className="p-5">{targetRole === 3 ? user.Class?.ClassName || (user.LegacyClassReference ? "Perlu penempatan (kelas lama #" + user.LegacyClassReference + ")" : "Tanpa kelas") : user.Specialty || "-"}</td><td className="p-5"><div className="flex gap-2"><button className={secondary} onClick={() => { setEditing(user); setOpen(true); }}>Edit</button><button className={danger} onClick={() => setDeleting(user)}>Hapus</button></div></td></tr>)}</tbody></table></div>}
  {open && <Modal title={editing ? "Edit akun" : "Tambah akun"} close={() => setOpen(false)}><form onSubmit={save} className="space-y-5"><Notice error={action.error} /><div className="grid gap-4 sm:grid-cols-2">
   <Field label="Nama lengkap"><input name="name" required maxLength={100} defaultValue={editing?.Name || ""} className={inputClass} /></Field>
   <Field label="Email"><input name="email" type="email" required defaultValue={editing?.Email || ""} className={inputClass} /></Field>
   <Field label={editing ? "Kata sandi baru (opsional)" : "Kata sandi (minimal 8 karakter)"}><input name="password" type="password" minLength={8} maxLength={72} required={!editing} autoComplete="new-password" className={inputClass} /></Field>
   {targetRole !== 1 && <Field label={targetRole === 2 ? "NIP/NUPTK" : "NISN"}><input name="nisn_nip" required={targetRole === 2} maxLength={50} defaultValue={editing?.NISN_NIP || ""} className={inputClass} /></Field>}
   {targetRole === 3 && <><Field label="NIS"><input name="nis" defaultValue={editing?.NIS || ""} maxLength={50} className={inputClass} /></Field><Field label="Kelas"><select name="class_id" defaultValue={editing?.ClassID || ""} className={inputClass}><option value="">Tanpa kelas</option>{classes.data?.data.map(row => <option key={row.ID} value={row.ID}>{row.ClassName}</option>)}</select></Field></>}
   {targetRole === 2 && <Field label="Keahlian / bidang"><input name="specialty" defaultValue={editing?.Specialty || ""} maxLength={100} className={inputClass} /></Field>}
   <Field label="Tempat lahir"><input name="tempat_lahir" defaultValue={editing?.TempatLahir || ""} className={inputClass} /></Field>
   <Field label="Tanggal lahir"><input name="tanggal_lahir" type="date" defaultValue={editing?.TanggalLahir?.slice(0,10) || ""} className={inputClass} /></Field>
   <Field label="Jenis kelamin"><select name="jenis_kelamin" defaultValue={editing?.JenisKelamin || ""} className={inputClass}><option value="">Belum diisi</option><option>Laki-laki</option><option>Perempuan</option></select></Field>
  </div><button disabled={action.busy} className={button}>{action.busy ? "Menyimpan..." : "Simpan akun"}</button></form></Modal>}
  {deleting && <ConfirmDelete title={`Hapus ${deleting.Name}?`} description="Akun dan data siswa terkait akan dihapus. Guru yang masih menjadi wali kelas atau pengampu mapel harus dilepas terlebih dahulu." busy={action.busy} close={() => setDeleting(null)} confirm={() => void action.run(async () => { await apiJSON(`/admin/users/${deleting.ID}`, { method: "DELETE" }); setDeleting(null); resource.reload(); }, "Akun dihapus.")} />}
 </div>;
}
