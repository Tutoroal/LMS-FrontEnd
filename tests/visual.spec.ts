import {test,expect,type Page} from "@playwright/test";

const sizes=[{name:"desktop",width:1440,height:960},{name:"tablet",width:820,height:1180},{name:"mobile",width:320,height:850}];
test.beforeEach(async({page})=>{
 await page.route("**/api/**",route=>{const url=new URL(route.request().url());return route.continue({url:"http://localhost:18080"+url.pathname+url.search});});
});
async function login(page:Page,role:"admin"|"guru"|"siswa"){
 await page.goto("/login");await page.getByLabel("Identitas akun").fill(role+"@e2e.invalid");
 await page.getByLabel("Kata sandi",{exact:true}).fill("E2e-password-123");
 await page.getByRole("button",{name:"Masuk",exact:true}).click();
 await expect(page.locator("#main-content")).toBeVisible();
}
async function capture(page:Page,options:{path:string;fullPage:boolean}){
 await page.evaluate(async()=>{for(let top=0;top<document.documentElement.scrollHeight;top+=innerHeight*.8){window.scrollTo({top,behavior:"instant"});await new Promise<void>(resolve=>requestAnimationFrame(()=>resolve()));}});
 await expect.poll(()=>page.evaluate(()=>Array.from(document.images).filter(img=>{const r=img.getBoundingClientRect();return r.width>0&&r.height>0;}).every(img=>img.complete&&img.naturalWidth>0)),{message:"Load every visible image before capturing the full page"}).toBeTruthy();
 await page.evaluate(()=>window.scrollTo({top:0,behavior:"instant"}));
 await page.screenshot(options);
}
async function checkLayout(page:Page,path:string){
 await expect.poll(()=>page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth),{message:"Horizontal overflow at "+path}).toBeTruthy();
 await expect(page.locator("main").getByRole("alert")).toHaveCount(0);
 await expect.poll(()=>page.evaluate(()=>Array.from(document.images).filter(img=>{const r=img.getBoundingClientRect();return r.width>0&&r.height>0&&r.top<innerHeight&&r.bottom>0;}).every(img=>img.complete&&img.naturalWidth>0)),{message:"Missing image at "+path}).toBeTruthy();
}
test("public pages, logo, departments and narrow layouts",async({page})=>{
 for(const size of sizes){
  await page.setViewportSize(size);
  for(const path of ["/","/login","/help","/privacy"]){
   await page.goto(path);await expect(page.locator("main")).toBeVisible();await checkLayout(page,path);
   await expect(page.getByRole("img",{name:"Logo SMK Citra Negara"}).first()).toBeVisible();
   if(path==="/"){
    await expect(page.locator(".department-card")).toHaveCount(6);
    for(const name of ["PPLG","TJKT","DKV","BDR / Pemasaran","MPLB"])await expect(page.locator(".department-card").getByRole("img",{name:"Maskot "+name,exact:true})).toHaveCount(1);
   }
   if(path==="/"||path==="/login")await capture(page,{path:"test-results/design/"+(path==="/"?"landing":"login")+"-"+size.name+".png",fullPage:true});
  }
 }
 await page.emulateMedia({reducedMotion:"reduce"});await page.goto("/");
 await expect.poll(()=>page.evaluate(()=>getComputedStyle(document.documentElement).scrollBehavior)).toBe("auto");
});
const routes={
 admin:["/dashboard","/dashboard/users/guru","/dashboard/users/siswa","/dashboard/academic/classes","/dashboard/academic/classes/1","/dashboard/academic/subjects","/dashboard/academic/schedules","/dashboard/academic/import","/dashboard/profile","/dashboard/courses"],
 guru:["/dashboard/teacher","/dashboard/teacher/classes","/dashboard/teacher/materials","/dashboard/teacher/assignments","/dashboard/teacher/assignments/1","/dashboard/teacher/exams","/dashboard/teacher/exams/1","/dashboard/teacher/exams/1/results","/dashboard/profile"],
 siswa:["/dashboard/student","/dashboard/student/class","/dashboard/student/materials","/dashboard/student/assignments","/dashboard/student/exams","/dashboard/student/grades","/dashboard/profile"]
};
for(const role of ["admin","guru","siswa"] as const)test(role+" routes at desktop, tablet and mobile; dark theme",async({page})=>{
 test.setTimeout(240000);await login(page,role);
 for(const size of sizes){
  await page.setViewportSize(size);
  for(const path of routes[role]){
   await page.goto(path);await expect(page.locator("#main-content h1")).toBeVisible();await expect(page.getByRole("status").filter({hasText:/Memuat|Memeriksa/})).toHaveCount(0);
   await checkLayout(page,path);
   if(path===routes[role][0]||path.includes("users/siswa")||path.includes("assignments/1"))await capture(page,{path:"test-results/design/"+role+"-"+path.split("/").pop()+"-"+size.name+".png",fullPage:true});
  }
 }
 await page.goto("/dashboard/profile");await page.getByLabel("Mode gelap").check();
 await expect(page.locator("html")).toHaveClass("dark");
 await checkLayout(page,"dark profile");await capture(page,{path:"test-results/design/"+role+"-dark-mobile.png",fullPage:true});
 await page.setViewportSize(sizes[0]);await page.goto(routes[role][0]);await checkLayout(page,"dark overview");
 await capture(page,{path:"test-results/design/"+role+"-dark-desktop.png",fullPage:true});
 await page.goto("/dashboard/profile");await page.getByLabel("Mode gelap").uncheck();
});
test("modal fields, keyboard focus, Escape and mobile fit",async({page})=>{
 await page.setViewportSize(sizes[2]);await login(page,"admin");
 await page.goto("/dashboard/users/siswa");await page.getByRole("button",{name:"Tambah akun",exact:true}).click();
 const dialog=page.getByRole("dialog");await expect(dialog).toBeVisible();
 for(const label of ["Nama lengkap","Email","Kata sandi (minimal 8 karakter)","NISN","NIS","Kelas","Tempat lahir","Tanggal lahir","Jenis kelamin"])await expect(dialog.getByLabel(label,{exact:true})).toBeVisible();
 expect(await dialog.evaluate(el=>el.contains(document.activeElement))).toBeTruthy();
 await page.keyboard.press("Shift+Tab");expect(await dialog.evaluate(el=>el.contains(document.activeElement))).toBeTruthy();
 await checkLayout(page,"mobile account modal");await capture(page,{path:"test-results/design/account-modal-mobile.png",fullPage:true});
 await page.keyboard.press("Escape");await expect(dialog).toHaveCount(0);
 await expect(page.getByRole("button",{name:"Tambah akun",exact:true})).toBeFocused();
});
test("CBT question sheet and timer retain usable layouts",async({page,request})=>{
 const auth=await request.post("http://localhost:18080/api/login",{data:{identifier:"guru@e2e.invalid",password:"E2e-password-123"}});
 expect(auth.ok()).toBeTruthy();const {token}=await auth.json();const headers={Authorization:"Bearer "+token};
 const created=await request.post("http://localhost:18080/api/teacher/exams",{headers,data:{title:"Uji Tampilan CBT",subject_id:1,class_id:1,type:"UH",date:"2020-01-01",duration:30}});
 expect(created.ok()).toBeTruthy();const {data:exam}=await created.json();
 const question=await request.post("http://localhost:18080/api/teacher/exams/questions",{headers,data:{exam_id:exam.ID,question_text:"Pilih jawaban untuk memeriksa tampilan lembar ujian.",option_a:"Jawaban pertama",option_b:"Jawaban kedua",option_c:"Jawaban ketiga",option_d:"Jawaban keempat",correct_answer:"B"}});
 expect(question.ok()).toBeTruthy();
 expect((await request.put("http://localhost:18080/api/teacher/exams/"+exam.ID+"/active",{headers,data:{is_active:true}})).ok()).toBeTruthy();
 await login(page,"siswa");await page.goto("/dashboard/student/exams/"+exam.ID+"/take");
 await expect(page.getByRole("timer")).toBeVisible();await page.locator('input[value="B"]').check();
 for(const size of sizes){await page.setViewportSize(size);await checkLayout(page,"CBT "+size.name);await capture(page,{path:"test-results/design/cbt-"+size.name+".png",fullPage:true});}
 await page.getByRole("button",{name:"Kumpulkan Ujian",exact:true}).click();await expect(page.getByRole("dialog")).toBeVisible();
 await checkLayout(page,"CBT confirmation");await page.getByRole("button",{name:"Periksa lagi"}).click();await expect(page.getByRole("dialog")).toHaveCount(0);
});
