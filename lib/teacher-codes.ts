export type TeacherCode={code:string;name:string};
export function parseTeacherCodeLines(lines:string[][]):TeacherCode[]{
 const map=new Map<string,string>();
 for(const line of lines){const values=line.map(v=>v.trim()).filter(Boolean);if(values.length<3||!/^\d{1,4}$/.test(values[0])||values[0]!==values[1]||!/[A-Za-z]/.test(values[2]))continue;const code=values[1],name=values[2];if(map.has(code)&&map.get(code)!==name)throw new Error("Kode guru "+code+" mempunyai dua nama berbeda.");map.set(code,name)}
 return [...map].map(([code,name])=>({code,name}));
}
export async function readTeacherCodes(file:File):Promise<TeacherCode[]>{
 if(file.size>10*1024*1024)throw new Error("PDF kode guru maksimal 10 MB.");const pdfjs=await import("pdfjs-dist");pdfjs.GlobalWorkerOptions.workerSrc="/pdfjs/pdf.worker.mjs";const task=pdfjs.getDocument({data:new Uint8Array(await file.arrayBuffer()),standardFontDataUrl:"/pdfjs/standard_fonts/"});
 try{const doc=await task.promise;if(doc.numPages>30)throw new Error("PDF kode guru maksimal 30 halaman.");const lines:string[][]=[];for(let page=1;page<=doc.numPages;page++){const text=await(await doc.getPage(page)).getTextContent();const items=text.items.filter(item=>"str" in item).map(item=>({text:item.str,x:item.transform[4],y:item.transform[5]})).sort((a,b)=>b.y-a.y||a.x-b.x);let lastY:number|null=null,row:{text:string;x:number}[]=[];for(const item of items){if(lastY!==null&&Math.abs(item.y-lastY)>2){lines.push(row.sort((a,b)=>a.x-b.x).map(v=>v.text));row=[]}row.push(item);lastY=item.y}if(row.length)lines.push(row.sort((a,b)=>a.x-b.x).map(v=>v.text))}const codes=parseTeacherCodeLines(lines);if(!codes.length)throw new Error("Tabel kode guru belum terbaca. Gunakan PDF teks dengan kolom nomor, kode guru, dan nama.");return codes}finally{await task.destroy()}
}
export function teacherNameKey(value:string){return value.split(",")[0].toLowerCase().replace(/[^a-z0-9]/g,"")}
