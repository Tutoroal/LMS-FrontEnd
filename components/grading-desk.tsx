"use client";
import {useState,type FormEvent} from "react";
import Link from "next/link";
import {attachmentIDs} from "@/lib/media";
import SubmissionPreview from "@/components/media-preview";
import {apiJSON,jsonBody} from "@/lib/api";
import {useResource,useAction} from "@/lib/use-resource";
import {dateLabel,type SubmissionData,type AssignmentData} from "@/lib/types";
import {PageHeading,Notice,Loading,Empty,Field,button,secondary,inputClass,card} from "@/components/ui";
export default function GradingDesk({id,readOnly=false}:{id:string;readOnly?:boolean}){
 const [selected,setSelected]=useState<number|null>(null);const [search,setSearch]=useState("");
 const resource=useResource<{data:SubmissionData[]}>(`/teacher/assignments/${id}/submissions`);
 const assignments=useResource<{data:AssignmentData[]}>("/teacher/assignments");
 const task=assignments.data?.data.find(row=>row.ID===Number(id));
 const rows=(resource.data?.data||[]).filter(row=>(row.StudentName+row.StudentNIS).toLowerCase().includes(search.toLowerCase()));const current=rows.find(row=>row.ID===selected)||rows[0];
 return <div className="mx-auto max-w-7xl space-y-6"><Link className={secondary} href={readOnly?"/dashboard/monitor/assignments":"/dashboard/teacher/assignments"}>Kembali ke tugas</Link><PageHeading title={task?.Title||"Meja Penilaian"} description={`${task?.ClassName||""} · ${task?.SubjectName||""} · ${resource.data?.data.length||0} pengumpulan`}><button className={secondary} onClick={resource.reload}>Muat ulang</button></PageHeading><Notice error={resource.error||assignments.error}/>
 <input className={inputClass} aria-label="Cari pengumpulan" placeholder="Cari nama atau NIS siswa..." value={search} onChange={event=>setSearch(event.target.value)}/>{resource.loading?<Loading/>:!rows.length?<Empty text="Belum ada pengumpulan yang sesuai."/>:<div className="grid gap-5 lg:grid-cols-[260px_minmax(0,1fr)]"><aside className={card+" h-fit space-y-2"}><p className="mb-4 text-xs text-slate-500">Pilih siswa untuk melihat jawaban</p>{rows.map(row=><button key={row.ID} aria-pressed={current?.ID===row.ID} onClick={()=>setSelected(row.ID)} className={"w-full rounded-xl p-3 text-left text-sm "+(current?.ID===row.ID?"bg-indigo-50 text-indigo-700":"hover:bg-slate-50")}><strong className="block">{row.StudentName}</strong><span className="mt-1 block text-xs">{row.GradedAt?"Dinilai: "+row.Score:"Belum dinilai"}</span></button>)}</aside>{current&&<GradeRow key={current.ID+"-"+current.GradedAt} row={current} max={task?.MaxScore||100} reload={resource.reload} readOnly={readOnly}/>}</div>}
 </div>;
}
function GradeRow({row,max,reload,readOnly}:{row:SubmissionData;max:number;reload:()=>void;readOnly:boolean}){
 const action=useAction();
 const [score,setScore]=useState(row.GradedAt?String(row.Score):"");const [feedback,setFeedback]=useState(row.Feedback||"");
 const save=async(event:FormEvent)=>{event.preventDefault();await action.run(async()=>{await apiJSON(`/teacher/submissions/${row.ID}/grade`,{method:"PUT",...jsonBody({score:Number(score),feedback})});reload();},"Nilai tersimpan.");};
 return <section className={card}><div className="mb-5 flex flex-wrap items-center justify-between gap-3"><div><h2 className="font-black">{row.StudentName}</h2><p className="mt-1 text-sm text-slate-500">{row.StudentNIS||"Tanpa NIS"} · {row.ClassName} · {dateLabel(row.SubmittedAt,true)}</p><p className="mt-1 text-xs text-indigo-600">{row.GradedAt?"Sudah dinilai":"Menunggu penilaian"}</p></div></div><div className="mb-6"><SubmissionPreview ids={attachmentIDs(row.Attachments)} url={row.FileURL}/></div>{readOnly?<p className="text-sm">Nilai: {row.GradedAt?row.Score+" / "+max:"Belum dinilai"} &middot; {row.Feedback}</p>:<form onSubmit={save} className="grid items-end gap-4 md:grid-cols-[160px_1fr_auto]"><Field label={`Nilai (0-${max})`}><input type="number" required min={0} max={max} value={score} onChange={event=>setScore(event.target.value)} className={inputClass}/></Field><Field label="Catatan guru"><textarea rows={2} maxLength={5000} value={feedback} onChange={event=>setFeedback(event.target.value)} className={inputClass}/></Field><button className={button} disabled={action.busy}>{action.busy?"Menyimpan...":"Simpan nilai"}</button></form>}<div className="mt-4"><Notice error={action.error} message={action.message}/></div></section>;
}
