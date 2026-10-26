import {test,expect,type Page} from "@playwright/test";
import {readFileSync} from "node:fs";
const api="http://localhost:18080/api";
const password="E2e-password-123";
test.beforeEach(async({page})=>{
 await page.route("**/api/**",route=>{const url=new URL(route.request().url());return route.continue({url:api+url.pathname.slice(4)+url.search});});
});
async function loginStudent(page:Page){
 await page.goto("/login");
 await page.getByLabel("Identitas akun").fill("siswa@e2e.invalid");
 await page.getByLabel("Kata sandi",{exact:true}).fill(password);
 await page.getByRole("button",{name:"Masuk",exact:true}).click();
 await expect(page.locator("#main-content")).toBeVisible();
 await page.goto("/dashboard/student/materials");
}
function twoPagePDF(){
 const stream=(value:string)=>"BT /F1 18 Tf 40 750 Td ("+value+") Tj ET";
 const first=stream("Materi PDF pertama"),second=stream("Materi PDF kedua");
 const objects=[
  "<< /Type /Catalog /Pages 2 0 R >>",
  "<< /Type /Pages /Kids [3 0 R 4 0 R] /Count 2 >>",
  "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 5 0 R >> >> /Contents 6 0 R >>",
  "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 5 0 R >> >> /Contents 7 0 R >>",
  "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
  ...[first,second].map(text=>"<< /Length "+Buffer.byteLength(text)+" >>\nstream\n"+text+"\nendstream")
 ];
 let body="%PDF-1.4\n";const offsets=[0];
 objects.forEach((value,index)=>{offsets.push(Buffer.byteLength(body));body+=(index+1)+" 0 obj\n"+value+"\nendobj\n";});
 const xref=Buffer.byteLength(body);
 body+="xref\n0 8\n0000000000 65535 f \n"+offsets.slice(1).map(offset=>String(offset).padStart(10,"0")+" 00000 n \n").join("")+"trailer\n<< /Size 8 /Root 1 0 R >>\nstartxref\n"+xref+"\n%%EOF";
 return Buffer.from(body);
}
for(const format of ["Word","PDF"] as const)test("student "+format+" pagination on mobile, tablet and desktop",async({page,request})=>{
 const errors:string[]=[];page.on("pageerror",error=>errors.push(error.message));
 const response=await request.post(api+"/login",{data:{identifier:"guru@e2e.invalid",password}});
 expect(response.ok()).toBeTruthy();
 const {token}=await response.json();const headers={Authorization:"Bearer "+token};
 const uploaded=await request.post(api+"/uploads/local",{headers,multipart:{
  purpose:"material",subject_id:"1",class_id:"1",
  file:format==="Word"?{name:"pages.docx",mimeType:"application/vnd.openxmlformats-officedocument.wordprocessingml.document",buffer:readFileSync("tests/fixtures/material-pages.docx")}:{name:"pages.pdf",mimeType:"application/pdf",buffer:twoPagePDF()}
 }});
 expect(uploaded.ok(),await uploaded.text()).toBeTruthy();
 const {data:asset}=await uploaded.json();
 const title="Navigasi "+format+" Dua Halaman";
 expect((await request.post(api+"/teacher/materials",{headers,data:{title,subject_id:1,class_id:1,asset_id:asset.ID}})).ok()).toBeTruthy();
 await loginStudent(page);
 for(const width of [390,820,1440]){
  await page.setViewportSize({width,height:900});
  await page.getByRole("article").filter({has:page.getByRole("heading",{name:title,exact:true})}).getByRole("button",{name:"Baca materi",exact:true}).click();
  const dialog=page.getByRole("dialog");
  const next=dialog.getByRole("button",{name:"Halaman berikutnya",exact:true});
  const previous=dialog.getByRole("button",{name:"Halaman sebelumnya",exact:true});
  await expect(next).toBeEnabled();
  await expect(previous).toBeDisabled();
  await expect(dialog.getByText("Halaman 1 dari 2",{exact:true})).toBeVisible();
  await next.click();
  await expect(previous).toBeEnabled();
  await expect(dialog.getByText("Halaman 2 dari 2",{exact:true})).toBeVisible();
  await expect(next).toBeDisabled();
  await expect(dialog.getByText(format==="Word"?"Materi halaman kedua":"Materi PDF kedua",{exact:true})).toHaveCount(1);
  if(format==="PDF")await expect(dialog.getByRole("img",{name:"pages.pdf, halaman 2"})).toBeVisible();
  await previous.click();
  await expect(next).toBeEnabled();
  await expect(dialog.getByText(format==="Word"?"Materi halaman pertama":"Materi PDF pertama",{exact:true})).toHaveCount(1);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
  await dialog.getByRole("button",{name:"Tutup dialog",exact:true}).click();
 }
 if(format==="Word"){
  await page.getByRole("article").filter({has:page.getByRole("heading",{name:title,exact:true})}).getByRole("button",{name:"Baca materi",exact:true}).click();
  const dialog=page.getByRole("dialog");
  await expect(dialog.getByText("Materi halaman pertama",{exact:true})).toBeVisible();
  await page.route("**/uploads/"+asset.ID+"/preview?page=2",route=>route.fulfill({status:503,contentType:"application/json",body:JSON.stringify({error:"Gangguan sementara saat memuat materi."})}),{times:1});
  await dialog.getByRole("button",{name:"Halaman berikutnya",exact:true}).click();
  await expect(dialog.getByRole("alert")).toContainText("Gangguan sementara");
  await expect(dialog.getByText("Materi halaman pertama",{exact:true})).toHaveCount(0);
  await dialog.getByRole("button",{name:"Coba muat ulang halaman",exact:true}).click();
  await expect(dialog.getByText("Materi halaman kedua",{exact:true})).toBeVisible();
 }
 expect(errors).toEqual([]);
});
