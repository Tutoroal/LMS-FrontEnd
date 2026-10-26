"use client";
import {useState} from "react";
import {AssetPreview} from "@/components/media-preview";
import {Modal,secondary} from "@/components/ui";
export default function MaterialOpen({assetId,url,title}:{assetId?:number|null;url:string;title:string}){const [open,setOpen]=useState(false);if(!assetId)return <a href={url} target="_blank" rel="noopener noreferrer" className={secondary}>Buka materi</a>;return <><button className={secondary} onClick={()=>setOpen(true)}>Baca materi</button>{open&&<Modal title={title} close={()=>setOpen(false)}><AssetPreview id={assetId}/></Modal>}</>}
