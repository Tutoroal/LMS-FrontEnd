"use client";
import {useParams} from "next/navigation";
import Link from "next/link";
import {downloadFile} from "@/lib/api";
import {useResource,useAction} from "@/lib/use-resource";
import {dateLabel,type ExamData,type ExamResultData} from "@/lib/types";
import {PageHeading,Notice,Loading,Empty,secondary,card} from "@/components/ui";
export default function ResultsPage(){const {id}=useParams<{id:string}>();return <Results key={id} id={id}/>;}
function Results({id}:{id:string}){
 const resource=useResource<{exam:ExamData;data:ExamResultData[];student_count:number}>(`/teacher/exams/${id}/results`);const action=useAction();
 const rows=resource.data?.data||[];const average=rows.length?rows.reduce((total,row)=>total+row.Score,0)/rows.length:0;
 return <div className="mx-auto max-w-7xl space-y-6"><Link className={secondary} href="/dashboard/teacher/exams">Kembali ke ujian</Link><PageHeading title={resource.data?.exam.Title||"Hasil Ujian"} description="Nilai dihitung otomatis oleh server. Kumpulkan rekap nilai dalam Excel."><div className="flex gap-3"><button className={secondary} onClick={resource.reload}>Muat ulang</button><button className={secondary} disabled={action.busy} onClick={()=>void action.run(()=>downloadFile("/teacher/export/report","Laporan_Nilai_Siswa.xlsx"))}>Export Excel</button></div></PageHeading><Notice error={resource.error||action.error}/>
 <div className="grid gap-4 sm:grid-cols-3">{[["Selesai",rows.length],["Siswa kelas",resource.data?.student_count||0],["Rata-rata",average.toFixed(2)]].map(([label,value])=><div key={label} className={card}><p className="text-sm text-slate-500">{label}</p><p className="mt-2 text-3xl font-black">{value}</p></div>)}</div>
 {resource.loading?<Loading/>:!rows.length?<Empty text="Belum ada hasil ujian."/>:<div className={`${card} overflow-x-auto p-0`}><table className="w-full text-left text-sm"><thead className="bg-slate-50"><tr><th className="p-5">Siswa</th><th className="p-5">NIS</th><th className="p-5">Nilai / 100</th><th className="p-5">Selesai</th></tr></thead><tbody>{rows.map(row=><tr key={row.ID} className="border-t border-slate-100"><td className="p-5 font-bold">{row.StudentName}</td><td className="p-5">{row.StudentNIS||"?"}</td><td className="p-5 font-black text-indigo-600">{row.Score.toFixed(2)}</td><td className="p-5">{row.SubmittedAt?dateLabel(row.SubmittedAt,true):"?"}</td></tr>)}</tbody></table></div>}
 </div>;
}
