"use client";
import {useState,type FormEvent} from "react";
import {useParams} from "next/navigation";
import Link from "next/link";
import {apiJSON,jsonBody} from "@/lib/api";
import {useResource,useAction} from "@/lib/use-resource";
import {dateLabel,type SubmissionData,type AssignmentData} from "@/lib/types";
import {PageHeading,Notice,Loading,Empty,Field,button,secondary,inputClass,card} from "@/components/ui";
export default function GradePage(){const {id}=useParams<{id:string}>();return <GradingDesk key={id} id={id}/>;}
function GradingDesk({id}:{id:string}){
 const resource=useResource<{data:SubmissionData[]}>(`/teacher/assignments/${id}/submissions`);
 const assignments=useResource<{data:AssignmentData[]}>("/teacher/assignments");
 const task=assignments.data?.data.find(row=>row.ID===Number(id));
 return <div className="mx-auto max-w-7xl space-y-6"><Link className={secondary} href="/dashboard/teacher/assignments">Kembali ke tugas</Link><PageHeading title={task?.Title||"Meja Penilaian"} description={`${task?.ClassName||""} · ${task?.SubjectName||""} · ${resource.data?.data.length||0} pengumpulan`}><button className={secondary} onClick={resource.reload}>Muat ulang</button></PageHeading><Notice error={resource.error||assignments.error}/>
 {resource.loading?<Loading/>:!resource.data?.data.length?<Empty text="Belum ada siswa yang mengumpulkan tugas."/>:<div className="space-y-5">{resource.data.data.map(row=><GradeRow key={row.ID+"-"+row.GradedAt} row={row} max={task?.MaxScore||100} reload={resource.reload}/>)}</div>}
 </div>;
}
function GradeRow({row,max,reload}:{row:SubmissionData;max:number;reload:()=>void}){
 const action=useAction();
 const [score,setScore]=useState(row.GradedAt?String(row.Score):"");const [feedback,setFeedback]=useState(row.Feedback||"");
 const save=async(event:FormEvent)=>{event.preventDefault();await action.run(async()=>{await apiJSON(`/teacher/submissions/${row.ID}/grade`,{method:"PUT",...jsonBody({score:Number(score),feedback})});reload();},"Nilai tersimpan.");};
 return <section className={card}><div className="mb-5 flex flex-wrap items-center justify-between gap-3"><div><h2 className="font-black">{row.StudentName}</h2><p className="mt-1 text-sm text-slate-500">{row.StudentNIS||"Tanpa NIS"} · {row.ClassName} · {dateLabel(row.SubmittedAt,true)}</p><p className="mt-1 text-xs text-indigo-600">{row.GradedAt?"Sudah dinilai":"Menunggu penilaian"}</p></div><a href={row.FileURL} target="_blank" rel="noopener noreferrer" className={secondary}>Buka jawaban siswa</a></div><form onSubmit={save} className="grid items-end gap-4 md:grid-cols-[160px_1fr_auto]"><Field label={`Nilai (0-${max})`}><input type="number" required min={0} max={max} value={score} onChange={event=>setScore(event.target.value)} className={inputClass}/></Field><Field label="Catatan guru"><textarea rows={2} maxLength={5000} value={feedback} onChange={event=>setFeedback(event.target.value)} className={inputClass}/></Field><button className={button} disabled={action.busy}>{action.busy?"Menyimpan...":"Simpan nilai"}</button></form><div className="mt-4"><Notice error={action.error} message={action.message}/></div></section>;
}
