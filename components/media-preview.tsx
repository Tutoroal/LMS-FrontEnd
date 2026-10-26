/* eslint-disable @next/next/no-img-element -- Private authenticated blob/object URLs cannot use the public image optimizer. */
"use client";
import {useEffect,useRef,useState} from "react";
import PDFPreview from "@/components/pdf-preview";
import {mediaAccess,type MediaAsset} from "@/lib/media";
import {useResource} from "@/lib/use-resource";
import {Notice,Loading,secondary,inputClass} from "@/components/ui";
export function AssetPreview({id}:{id:number}){const [resource,setResource]=useState<{id:number;src?:string;data?:MediaAsset;error?:string}|null>(null);useEffect(()=>{let cancelled=false;let objectURL="";void mediaAccess(id).then(value=>{if(value.objectURL)objectURL=value.src;if(cancelled){if(objectURL)URL.revokeObjectURL(objectURL);return};setResource({id,...value})}).catch(error=>{if(!cancelled)setResource({id,error:error instanceof Error?error.message:"Berkas gagal dimuat."})});return()=>{cancelled=true;if(objectURL)URL.revokeObjectURL(objectURL)}},[id]);if(!resource||resource.id!==id)return <Loading/>;if(resource.error)return <Notice error={resource.error}/>;return <div className="space-y-3"><div className="flex flex-wrap items-center justify-between gap-3"><p className="text-sm font-medium">{resource.data?.Name}</p><a className={secondary} href={resource.src} download={resource.data?.Name} target="_blank" rel="noopener noreferrer">Unduh berkas</a></div>{resource.data?.ContentType.startsWith("image/")?<img src={resource.src} alt={resource.data.Name} className="max-h-[650px] w-full rounded-2xl bg-slate-50 object-contain"/>:resource.data?.ContentType==="application/pdf"?<PDFPreview key={resource.src} src={resource.src!} title={resource.data.Name}/>:<OfficePreview key={id} id={id}/>}</div>}
export default function SubmissionPreview({ids,url}:{ids:number[];url?:string}){const [selected,setSelected]=useState<number|null>(null);const current=selected&&ids.includes(selected)?selected:ids[0];return <div className="space-y-4">{!!ids.length&&<div className="flex flex-wrap gap-2">{ids.map((id,index)=><button key={id} className={secondary} aria-pressed={current===id} onClick={()=>setSelected(id)}>Berkas {index+1}</button>)}</div>}{current&&<AssetPreview key={current} id={current}/>} {!!url&&<details><summary className="cursor-pointer text-sm font-semibold text-indigo-600">Pratinjau jawaban berupa link</summary><div className="mt-4 space-y-3"><iframe title="Jawaban siswa berupa link" src={previewURL(url)} sandbox="allow-scripts allow-same-origin" referrerPolicy="no-referrer" className="h-[500px] w-full rounded-2xl border border-slate-200"/><p className="text-xs text-slate-500">Sebagian penyedia link membatasi pratinjau di dalam LMS.</p><a className={secondary} href={url} target="_blank" rel="noopener noreferrer">Buka jawaban siswa</a></div></details>}</div>}
function previewURL(value:string){try{const url=new URL(value);if(url.hostname==="drive.google.com"){const match=url.pathname.match(/\/file\/d\/([^/]+)/);if(match)return "https://drive.google.com/file/d/"+encodeURIComponent(match[1])+"/preview"}return value}catch{return "about:blank"}}

type OfficeData={kind:"docx"|"xlsx";blocks?:{kind:string;text?:string;rows?:string[][]}[];rows?:string[][];sheets?:string[];sheet?:string;page:number;start_row?:number;has_next:boolean;total_pages?:number};
function OfficeTable({rows}:{rows:string[][]}){return <div className="max-w-full overflow-x-auto rounded-xl border border-slate-200"><table className="w-full text-left text-sm"><tbody>{rows.map((row,i)=><tr key={i} className="border-b border-slate-100">{row.map((cell,j)=><td key={j} className="min-w-[100px] whitespace-pre-wrap p-3">{cell}</td>)}</tr>)}</tbody></table></div>}
function OfficePreview({id}:{id:number}){
 const [sheet,setSheet]=useState("");
 const [page,setPage]=useState(1);
 const params=new URLSearchParams({page:String(page)});
 if(sheet)params.set("sheet",sheet);
 const resource=useResource<OfficeData>("/uploads/"+id+"/preview?"+params);
 const data=resource.data;
 const navigation=useRef<HTMLElement>(null);
 const lastPage=useRef("");
 useEffect(()=>{
  const key=sheet+":"+page;
  if(resource.loading||resource.error||!data||data.page!==page)return;
  if(lastPage.current&&lastPage.current!==key)navigation.current?.scrollIntoView({block:"nearest",behavior:"instant"});
  lastPage.current=key;
 },[data,page,sheet,resource.loading,resource.error]);
 return <div className="min-w-0 space-y-4">
  <Notice error={resource.error}/>
  <p className="text-xs text-slate-500">Halaman pratinjau dibagi berdasarkan isi dan pemisah halaman Word. Tata letak dapat berbeda dari berkas asli; formula Excel tidak dijalankan.</p>
  {data?.kind==="xlsx"&&<select aria-label="Sheet materi Excel" value={sheet||data.sheet||""} onChange={event=>{setSheet(event.target.value);setPage(1);}} className={inputClass}>{data.sheets?.map(name=><option key={name}>{name}</option>)}</select>}
  <nav ref={navigation} aria-label="Halaman materi" className="flex flex-wrap items-center justify-between gap-2">
   <button type="button" className={secondary} disabled={page===1||resource.loading} onClick={()=>setPage(value=>value-1)}>Halaman sebelumnya</button>
   <span role="status" className="text-xs">Halaman {page}{data?.total_pages?` dari ${data.total_pages}`:""}</span>
   <button type="button" className={secondary} disabled={!data?.has_next||resource.loading||!!resource.error} onClick={()=>setPage(value=>value+1)}>Halaman berikutnya</button>
  </nav>
  {resource.loading?<Loading/>:resource.error?<button type="button" className={secondary} onClick={resource.reload}>Coba muat ulang halaman</button>:<div key={sheet+":"+page}>{data?.kind==="xlsx"?<OfficeTable rows={data.rows||[]}/>:data?.blocks?.map((block,index)=>block.kind==="table"?<OfficeTable key={index} rows={block.rows||[]}/>:<p key={index} className="whitespace-pre-wrap text-sm leading-7">{block.text}</p>)}</div>}
  {!resource.loading&&!resource.error&&data&&!data.has_next&&<p className="text-xs text-slate-500">{page===1?"Seluruh isi materi sudah ditampilkan pada halaman ini.":"Anda sudah mencapai akhir materi."}</p>}
 </div>;
}
