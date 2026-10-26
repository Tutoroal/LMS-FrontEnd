"use client";
import {useEffect,useRef,useState} from "react";
import type {PDFDocumentLoadingTask,PDFDocumentProxy,RenderTask} from "pdfjs-dist";
import {Loading,Notice,secondary} from "@/components/ui";

export default function PDFPreview({src,title}:{src:string;title:string}){
 const [document,setDocument]=useState<PDFDocumentProxy|null>(null);
 const [page,setPage]=useState(1);
 const [rendered,setRendered]=useState(0);
 const [error,setError]=useState("");
 const [text,setText]=useState("");
 const [retry,setRetry]=useState(0);
 const canvas=useRef<HTMLCanvasElement>(null);
 useEffect(()=>{
  let cancelled=false;
  let loading:PDFDocumentLoadingTask|undefined;
  void (async()=>{
   const pdfjs=await import("pdfjs-dist");
   if(cancelled)return;
   pdfjs.GlobalWorkerOptions.workerSrc="/pdfjs/pdf.worker.mjs";
   loading=pdfjs.getDocument({url:src,standardFontDataUrl:"/pdfjs/standard_fonts/"});
   const loaded=await loading.promise;
   if(!cancelled){setDocument(loaded);setError("");}
  })().catch(reason=>{if(!cancelled)setError(reason instanceof Error?reason.message:"PDF gagal dimuat.");});
  return()=>{cancelled=true;void loading?.destroy();};
 },[src,retry]);
 useEffect(()=>{
  if(!document)return;
  let cancelled=false;
  let task:RenderTask|undefined;
  void (async()=>{
   const current=await document.getPage(page);
   if(cancelled||!canvas.current)return;
   const base=current.getViewport({scale:1});
   const viewport=current.getViewport({scale:Math.min(1.5,2048/base.width,3072/base.height)});
   const target=canvas.current;
   target.width=viewport.width;target.height=viewport.height;
   task=current.render({canvas:target,viewport});
   const [,content]=await Promise.all([task.promise,current.getTextContent()]);
   if(!cancelled){setText(content.items.map(item=>"str" in item?item.str:"").join(" "));setRendered(page);setError("");}
  })().catch(reason=>{if(!cancelled)setError(reason instanceof Error?reason.message:"Halaman PDF gagal dimuat.");});
  return()=>{cancelled=true;task?.cancel();};
 },[document,page]);
 const busy=!document||rendered!==page;
 const changePage=(next:number)=>{setError("");setPage(next);};
 return <section aria-label="Pembaca PDF" className="min-w-0 space-y-4">
  <Notice error={error}/>
  {error&&<button type="button" className={secondary} onClick={()=>{setDocument(null);setRendered(0);setError("");setRetry(value=>value+1);}}>Coba muat ulang PDF</button>}
  <nav aria-label="Halaman materi" className="flex flex-wrap items-center justify-between gap-2">
   <button type="button" className={secondary} disabled={page<=1||busy} onClick={()=>changePage(page-1)}>Halaman sebelumnya</button>
   <span role="status" className="text-xs">Halaman {page}{document? ` dari ${document.numPages}`:""}</span>
   <button type="button" className={secondary} disabled={!document||page>=document.numPages||busy} onClick={()=>changePage(page+1)}>Halaman berikutnya</button>
  </nav>
  {busy&&!error&&<Loading/>}
  <canvas ref={canvas} role="img" aria-label={`${title}, halaman ${page}`} className={"h-auto w-full rounded-xl bg-white "+(busy?"hidden":"block")}/>
  {!busy&&<p className="sr-only">{text}</p>}
  {!!document&&document.numPages===1&&<p className="text-xs text-slate-500">Seluruh materi PDF berada di satu halaman.</p>}
 </section>;
}
