import { test, expect, type Page } from "@playwright/test";
import { mkdirSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";

const password = "E2e-password-123";
const outputRoot = resolve("..", "Dokumentasi-LMS");
const screenshotRoot = join(outputRoot, "screenshots");
const pdfPath = resolve("..", "Dokumentasi-LMS-Admin-Guru-Siswa.pdf");

type Entry = { role: "Admin" | "Guru" | "Siswa"; title: string; description: string; path: string };
const entries: Entry[] = [
  { role: "Admin", title: "Dashboard Admin", description: "Ringkasan operasional dan analitik akademik.", path: "/dashboard" },
  { role: "Admin", title: "Manajemen Kepala Sekolah", description: "Pengelolaan akun Kepala Sekolah.", path: "/dashboard/users/kepsek" },
  { role: "Admin", title: "Manajemen Waka Kurikulum", description: "Pengelolaan akun Waka Kurikulum.", path: "/dashboard/users/waka" },
  { role: "Admin", title: "Manajemen Guru", description: "Tambah, edit, cari, dan hapus akun guru.", path: "/dashboard/users/guru" },
  { role: "Admin", title: "Manajemen Siswa", description: "Pengelolaan identitas dan penempatan kelas siswa.", path: "/dashboard/users/siswa" },
  { role: "Admin", title: "Manajemen Kelas", description: "Daftar kelas, jurusan, program, dan wali kelas.", path: "/dashboard/academic/classes" },
  { role: "Admin", title: "Detail Kelas", description: "Anggota kelas dan pemindahan siswa.", path: "/dashboard/academic/classes/1" },
  { role: "Admin", title: "Manajemen Mata Pelajaran", description: "Mapel, guru pengampu, dan alokasi kelas.", path: "/dashboard/academic/subjects" },
  { role: "Admin", title: "Manajemen Jadwal", description: "Jadwal berdasarkan kelas dan periode akademik.", path: "/dashboard/academic/schedules" },
  { role: "Admin", title: "Import Data", description: "Import akun dan data akademik melalui Excel.", path: "/dashboard/academic/import" },
  { role: "Admin", title: "Konten Pembelajaran", description: "Ringkasan materi, tugas, dan ujian.", path: "/dashboard/courses" },
  { role: "Admin", title: "Profil Admin", description: "Profil akun, password, dan preferensi tema.", path: "/dashboard/profile" },

  { role: "Guru", title: "Dashboard Guru", description: "Ringkasan kelas, tugas, ujian, dan aktivitas mengajar.", path: "/dashboard/teacher" },
  { role: "Guru", title: "Kelas yang Diajar", description: "Daftar kelas dan mata pelajaran yang diampu.", path: "/dashboard/teacher/classes" },
  { role: "Guru", title: "Materi Pembelajaran", description: "Pembuatan materi berupa tautan atau berkas privat.", path: "/dashboard/teacher/materials" },
  { role: "Guru", title: "Manajemen Tugas", description: "Pembuatan dan pengelolaan tugas siswa.", path: "/dashboard/teacher/assignments" },
  { role: "Guru", title: "Penilaian Tugas", description: "Daftar pengumpulan, nilai, dan catatan guru.", path: "/dashboard/teacher/assignments/1" },
  { role: "Guru", title: "Manajemen Ujian", description: "Pembuatan dan publikasi ujian CBT.", path: "/dashboard/teacher/exams" },
  { role: "Guru", title: "Editor Soal Ujian", description: "Pengelolaan soal pilihan ganda dan esai.", path: "/dashboard/teacher/exams/1" },
  { role: "Guru", title: "Hasil Ujian", description: "Hasil pengerjaan dan penilaian ujian siswa.", path: "/dashboard/teacher/exams/1/results" },
  { role: "Guru", title: "Laporan Guru", description: "Pratinjau dan ekspor rekap pembelajaran.", path: "/dashboard/teacher/reports" },
  { role: "Guru", title: "Profil Guru", description: "Profil akun, password, dan preferensi tema.", path: "/dashboard/profile" },

  { role: "Siswa", title: "Dashboard Siswa", description: "Ringkasan kegiatan belajar dan progres siswa.", path: "/dashboard/student" },
  { role: "Siswa", title: "Kelas dan Jadwal", description: "Informasi kelas, wali kelas, mapel, dan jadwal.", path: "/dashboard/student/class" },
  { role: "Siswa", title: "Materi Siswa", description: "Daftar serta pembaca materi pembelajaran.", path: "/dashboard/student/materials" },
  { role: "Siswa", title: "Tugas Siswa", description: "Pengumpulan jawaban dan status penilaian tugas.", path: "/dashboard/student/assignments" },
  { role: "Siswa", title: "Daftar Ujian", description: "Ujian yang tersedia beserta status pengerjaan.", path: "/dashboard/student/exams" },
  { role: "Siswa", title: "Lembar Ujian CBT", description: "Soal, navigasi, penyimpanan otomatis, dan timer.", path: "/dashboard/student/exams/1/take" },
  { role: "Siswa", title: "Rekap Nilai", description: "Nilai tugas, ujian, dan umpan balik guru.", path: "/dashboard/student/grades" },
  { role: "Siswa", title: "Profil Siswa", description: "Profil akun, password, dan preferensi tema.", path: "/dashboard/profile" },
];

async function login(page: Page, account: "admin" | "guru" | "siswa") {
  await page.goto("/login");
  await page.getByLabel("Identitas akun").fill(account + "@e2e.invalid");
  await page.getByLabel("Kata sandi", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Masuk", exact: true }).click();
  await expect(page.locator("#main-content")).toBeVisible();
}

function escapeHTML(value: string) {
  return value.replace(/[&<>"']/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]!);
}

test("generate Admin Guru Siswa documentation PDF", async ({ page }) => {
  test.setTimeout(600000);
  mkdirSync(screenshotRoot, { recursive: true });
  await page.route("**/api/**", route => {
    const url = new URL(route.request().url());
    return route.continue({ url: "http://localhost:18080" + url.pathname + url.search });
  });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: "reduce", colorScheme: "light" });

  const captures: Array<Entry & { image: string }> = [];
  for (const [account, role] of [["admin", "Admin"], ["guru", "Guru"], ["siswa", "Siswa"]] as const) {
    await page.evaluate(() => localStorage.clear()).catch(() => undefined);
    await login(page, account);
    const roleEntries = entries.filter(entry => entry.role === role);
    for (let index = 0; index < roleEntries.length; index++) {
      const entry = roleEntries[index];
      await page.goto(entry.path, { waitUntil: "networkidle" });
      await expect(page.locator("#main-content h1").first()).toBeVisible();
      await expect(page.getByRole("status").filter({ hasText: /Memuat|Memeriksa/ })).toHaveCount(0);
      await expect(page.locator("main").getByRole("alert")).toHaveCount(0);
      const imagePath = join(screenshotRoot, `${role.toLowerCase()}-${String(index + 1).padStart(2, "0")}.jpg`);
      await page.screenshot({ path: imagePath, type: "jpeg", quality: 82, fullPage: false });
      captures.push({ ...entry, image: imagePath });
    }
  }

  const sections = captures.map((capture, index) => {
    const data = readFileSync(capture.image).toString("base64");
    return `<section class="shot"><header><span>${index + 1}</span><div><small>ROLE ${escapeHTML(capture.role.toUpperCase())}</small><h2>${escapeHTML(capture.title)}</h2><p>${escapeHTML(capture.description)}</p></div></header><img src="data:image/jpeg;base64,${data}" alt="${escapeHTML(capture.title)}"></section>`;
  }).join("");
  const counts = ["Admin", "Guru", "Siswa"].map(role => `<li><strong>${role}</strong><span>${captures.filter(item => item.role === role).length} tampilan fitur</span></li>`).join("");
  await page.setContent(`<!doctype html><html><head><meta charset="utf-8"><style>
    @page{size:A4 landscape;margin:0}*{box-sizing:border-box}body{margin:0;font-family:Arial,sans-serif;color:#080c2b;background:#fff}.cover,.shot{width:297mm;height:210mm;page-break-after:always;overflow:hidden}.cover{padding:25mm;background:linear-gradient(135deg,#06091e,#192580 58%,#2a3ed5);color:white;display:flex;flex-direction:column;justify-content:space-between}.cover .mark{font-size:14px;letter-spacing:.16em;text-transform:uppercase;color:#aab2ee}.cover h1{font-size:42px;line-height:1.08;max-width:220mm;margin:8mm 0 4mm}.cover p{font-size:18px;color:#d4d8f7;max-width:190mm;line-height:1.5}.cover ul{list-style:none;padding:0;margin:0;display:flex;gap:7mm}.cover li{width:58mm;padding:5mm;border:1px solid rgba(255,255,255,.25);border-radius:5mm;background:rgba(255,255,255,.09)}.cover li strong,.cover li span{display:block}.cover li strong{font-size:20px}.cover li span{margin-top:2mm;font-size:12px;color:#d4d8f7}.cover footer{font-size:11px;color:#aab2ee}.shot{padding:9mm 11mm;background:#eef1ff}.shot header{height:24mm;display:flex;align-items:center;gap:5mm}.shot header>span{display:grid;place-items:center;width:13mm;height:13mm;border-radius:50%;background:#2a3ed5;color:white;font-weight:700}.shot small{font-size:9px;letter-spacing:.14em;color:#2a3ed5;font-weight:700}.shot h2{margin:1mm 0;font-size:20px}.shot p{margin:0;color:#55617c;font-size:11px}.shot img{display:block;width:275mm;height:166mm;object-fit:contain;object-position:top center;background:white;border:1px solid #d4d8f7;border-radius:4mm;box-shadow:0 3mm 10mm rgba(8,12,43,.14)}
  </style></head><body><section class="cover"><div><div class="mark">SMK Citra Negara · Dokumentasi LMS</div><h1>Panel Admin, Guru, dan Siswa</h1><p>Kumpulan tampilan fitur utama LMS dalam kondisi data uji. Setiap halaman diambil langsung dari aplikasi.</p></div><ul>${counts}</ul><footer>Dibuat otomatis pada ${new Date().toLocaleDateString("id-ID", { dateStyle: "long" })}</footer></section>${sections}</body></html>`, { waitUntil: "load" });
  await page.pdf({ path: pdfPath, format: "A4", landscape: true, printBackground: true, margin: { top: "0", right: "0", bottom: "0", left: "0" } });
});