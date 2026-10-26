import {apiJSON,apiFetch} from "@/lib/api";
export type MediaAsset={ID:number;Name:string;ContentType:string;Size:number;Ready:boolean};
export async function uploadMedia(file:File,target:{assignment_id?:number;exam_id?:number;purpose?:"material";subject_id?:number;class_id?:number}):Promise<MediaAsset>{
 if(file.size===0||file.size>20*1024*1024)throw new Error("Pilih berkas maksimal 20 MB.");
 const contentType=file.type||({pdf:"application/pdf",docx:"application/vnd.openxmlformats-officedocument.wordprocessingml.document",xlsx:"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"} as Record<string,string>)[file.name.split(".").pop()||""]||"application/octet-stream";
 const init=await apiJSON<{mode:string;asset?:MediaAsset;url?:string;headers?:Record<string,string[]>}>("/uploads/init",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({...target,name:file.name,content_type:contentType,size:file.size})});
 if(init.mode==="local"){const form=new FormData();form.set("file",file);for(const [key,value]of Object.entries(target))form.set(key,String(value));const response=await apiJSON<{data:MediaAsset}>("/uploads/local",{method:"POST",body:form});return response.data;}
 if(!init.asset||!init.url)throw new Error("Konfigurasi unggahan belum tersedia.");
 const headers=new Headers();for(const [key,values]of Object.entries(init.headers||{}))if(!["host","content-length"].includes(key.toLowerCase()))headers.set(key,values.join(","));headers.set("Content-Type",contentType);
 const response=await fetch(init.url,{method:"PUT",body:file,headers,signal:AbortSignal.timeout(120000)});if(!response.ok)throw new Error("Unggahan cloud gagal. Periksa koneksi dan coba lagi.");
 const completed=await apiJSON<{data:MediaAsset}>("/uploads/"+init.asset.ID+"/complete",{method:"POST"});return completed.data;
}
export async function mediaAccess(id:number){const result=await apiJSON<{data:MediaAsset;url?:string;path?:string}>("/uploads/"+id+"/access");if(result.url)return {...result,src:result.url,objectURL:false};if(!result.path)throw new Error("Berkas tidak tersedia.");const response=await apiFetch(result.path);if(!response.ok)throw new Error("Berkas tidak dapat dibaca.");return {...result,src:URL.createObjectURL(await response.blob()),objectURL:true};}
export function attachmentIDs(value?:string):number[]{try{const parsed:unknown=JSON.parse(value||"[]");return Array.isArray(parsed)?parsed.filter((id):id is number=>typeof id==="number"&&id>0):[]}catch{return []}}
export const answerFormats=[{value:"link",label:"Link"},{value:"pdf",label:"PDF"},{value:"image",label:"Foto / tulisan tangan"},{value:"document",label:"Word / Excel (DOCX, XLSX)"}];
