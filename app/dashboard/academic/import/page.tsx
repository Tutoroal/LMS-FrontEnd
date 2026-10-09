"use client";
import {useState,type FormEvent} from "react";
import {apiJSON,downloadFile} from "@/lib/api";
import {useAction} from "@/lib/use-resource";
import {PageHeading,Notice,Field,button,secondary,inputClass,card} from "@/components/ui";
type ImportResult={message:string;detail:{guru_baru:number;siswa_baru:number;kelas_baru:number;akun_diperbarui:number}};
export default function ImportPage(){
 const action=useAction();const [result,setResult]=useState<ImportResult|null>(null);
 const upload=async(event:FormEvent<HTMLFormElement>)=>{event.preventDefault();const form=event.currentTarget;const data=new FormData(form);await action.run(async()=>{const file=data.get("file");if(!(file instanceof File)||file.size===0)throw new Error("Pilih file Excel terlebih dahulu.");if(file.size>10*1024*1024)throw new Error("File maksimal 10 MB.");setResult(await apiJSON<ImportResult>("/admin/import",{method:"POST",body:data}));form.reset();},"Import berhasil.");};
 return <div className="mx-auto max-w-5xl space-y-6"><PageHeading title="Import Excel" description="Tambahkan atau perbarui data guru dan siswa. Semua baris disimpan bersama setelah lolos validasi."><button disabled={action.busy} className={secondary} onClick={()=>void action.run(()=>downloadFile("/admin/import/template","Template_Import_LMS.xlsx"))}>Unduh template</button></PageHeading><Notice error={action.error} message={action.message}/>
 <form onSubmit={upload} className={`${card} space-y-5`}><Field label="Berkas Excel (.xlsx, maksimal 10 MB)"><input type="file" name="file" accept=".xlsx" required className={inputClass}/></Field><button disabled={action.busy} className={button}>{action.busy?"Memproses...":"Mulai import"}</button></form>
 {result&&<div className="grid grid-cols-2 gap-4 md:grid-cols-4">{Object.entries(result.detail).map(([key,value])=><div key={key} className={card}><p className="text-xs capitalize text-slate-500">{key.replaceAll("_"," ")}</p><p className="mt-2 text-3xl font-black">{value}</p></div>)}</div>}
 <div className={`${card} space-y-3 text-sm leading-relaxed text-slate-600`}><h2 className="font-black text-slate-900">Petunjuk pengisian</h2><p>Gunakan sheet Guru dan Siswa dari template. Identitas NIP/NIS/NISN ditulis sebagai teks agar angka nol di awal tetap tersimpan. Tanggal lahir menggunakan YYYY-MM-DD.</p><p>Kata sandi minimal 8 karakter wajib untuk akun baru. Untuk akun yang sudah ada, kolom kata sandi boleh kosong agar kata sandi tetap dipertahankan. Jika diisi, kata sandi diperbarui dan sesi lama diakhiri.</p><p>Email menentukan akun yang diperbarui. Email dengan peran berbeda dan identitas milik akun lain akan ditolak. Nama kelas baru pada sheet Siswa dibuat otomatis. Maksimal 1000 akun per berkas.</p><p>Satu baris gagal akan membatalkan seluruh import. Pesan kesalahan menunjukkan sheet dan nomor baris yang perlu diperbaiki.</p></div>
 </div>;
}
