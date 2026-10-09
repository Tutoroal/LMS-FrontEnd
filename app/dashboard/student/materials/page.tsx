"use client";
import {useState} from "react";
import {useResource} from "@/lib/use-resource";
import type {MaterialData} from "@/lib/types";
import {PageHeading,Notice,Loading,Empty,inputClass,secondary,card} from "@/components/ui";
export default function StudentMaterials(){
 const resource=useResource<{data:MaterialData[]}>("/student/materials");const [search,setSearch]=useState("");
 const rows=(resource.data?.data||[]).filter(row=>[row.Title,row.SubjectName].some(value=>value.toLowerCase().includes(search.toLowerCase())));
 return <div className="mx-auto max-w-7xl space-y-6"><PageHeading title="Materi Belajar" description="Modul, video, dan referensi yang dibagikan guru khusus kelas Anda."/><Notice error={resource.error}/><input aria-label="Cari materi" placeholder="Cari judul atau mapel..." value={search} onChange={event=>setSearch(event.target.value)} className={inputClass}/>{resource.loading?<Loading/>:!rows.length?<Empty text="Belum ada materi yang sesuai."/>:<div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{rows.map(row=><article key={row.ID} className={card}><p className="text-xs font-bold text-indigo-600">{row.SubjectName}</p><h2 className="my-4 text-xl font-black">{row.Title}</h2><a href={row.ContentURL} target="_blank" rel="noopener noreferrer" className={secondary}>Buka materi</a></article>)}</div>}</div>;
}
