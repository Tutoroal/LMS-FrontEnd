"use client";
import {type FormEvent} from "react";
import {apiJSON,jsonBody} from "@/lib/api";
import {useResource,useAction} from "@/lib/use-resource";
import type {SchoolData} from "@/lib/types";
import ThemeToggle from "@/components/theme-toggle";
import {PageHeading,Notice,Loading,Field,button,inputClass,card} from "@/components/ui";
export default function SettingsPage(){
 const resource=useResource<{data:SchoolData}>("/settings");const action=useAction();
 const save=async(event:FormEvent<HTMLFormElement>)=>{event.preventDefault();const form=new FormData(event.currentTarget);await action.run(async()=>{await apiJSON("/admin/settings",{method:"PUT",...jsonBody(Object.fromEntries(form.entries()))});resource.reload();window.dispatchEvent(new Event("school-change"));},"Pengaturan sekolah tersimpan.");};
 return <div className="mx-auto max-w-4xl space-y-6"><PageHeading title="Pengaturan Sekolah" description="Informasi institusi tersimpan di server dan berlaku bagi seluruh pengguna."/><Notice error={resource.error||action.error} message={action.message}/>{resource.loading?<Loading/>:<form key={resource.data?.data.SchoolName+String(resource.data?.data.AcademicYear)} onSubmit={save} className={`${card} space-y-5`}><Field label="Nama sekolah"><input required name="school_name" maxLength={100} defaultValue={resource.data?.data.SchoolName} className={inputClass}/></Field><Field label="Tahun ajaran / semester"><input required name="academic_year" maxLength={50} defaultValue={resource.data?.data.AcademicYear} className={inputClass}/></Field><p className="text-sm text-slate-500">Pendaftaran akun dilakukan administrator. Pengguna masuk menggunakan akun yang telah dibuat atau diimpor.</p><button disabled={action.busy} className={button}>{action.busy?"Menyimpan...":"Simpan pengaturan"}</button></form>}<div className={card}><ThemeToggle/></div></div>;
}
