# Redesign LMS Citra Negara

> Catatan: dokumen ini mencatat tahap redesign visual pertama. Revisi akademik dan navigasi berikutnya mengubah backend serta menambah PDF.js dan adapter S3; lihat [README proyek](../README.md#revisi-akademik-dan-antarmuka) dan [panduan demo](../DEPLOYMENT.md). Screenshot revisi terbaru ada di ../.runtime/revision-evidence.

Tanggal verifikasi: 10 Oktober 2026.

Redesign visual pada aplikasi Next.js yang sudah ada. Sistem Go, skema database, API, otorisasi, rute, alur pengiriman, validasi, dan nilai data tetap dipertahankan. Tidak ada dependensi baru.

## Tampilan

- Tipografi sistem: -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif.
- Permukaan putih dan abu netral, aksen indigo yang lebih tenang, batas tipis, bayangan ringan, dan radius konsisten.
- Komponen bersama untuk tombol, input, kartu, heading, notifikasi, loading, empty state, dan modal.
- Navigasi, halaman publik, login, dan dasbor Admin/Guru/Siswa ditata ulang.
- Gaya bersama berlaku pada manajemen akun/kelas/mapel/jadwal, import, materi, tugas, penilaian, question builder, hasil ujian, profil, dan pengaturan.
- Tabel tetap menyajikan semua kolom dan dapat digeser pada layar kecil.
- Mode gelap, indikator fokus, perilaku modal, dan preferensi reduced motion dipertahankan.
- Tombol navigasi CBT disesuaikan agar muat pada layar 320 px; timer, penyimpanan otomatis, dan pengiriman tetap memakai kode yang sama.

## File utama

| Lokasi | Perubahan |
| --- | --- |
| app/globals.css | Token warna/typografi, komponen visual, mode gelap, responsive rules, reduced motion |
| components/ui.tsx | Tampilan komponen bersama; kontrak props dan perilaku interaksi dipertahankan |
| components/branding.tsx | Logo sekolah dan pemetaan maskot jurusan melalui Next Image |
| components/theme-toggle.tsx | Tampilan sakelar preferensi tema |
| app/layout.tsx | Metadata ikon memakai logo sekolah |
| app/page.tsx, app/login/page.tsx | Komposisi halaman publik dan autentikasi |
| app/help/page.tsx, app/privacy/page.tsx | Branding dan tipografi dokumen |
| app/dashboard/layout.tsx | Sidebar/header seluruh peran |
| app/dashboard/page.tsx, teacher/page.tsx, student/page.tsx | Ringkasan, statistik, dan akses cepat |
| app/dashboard/academic/classes/page.tsx, classes/[id]/page.tsx | Identitas jurusan dan tampilan pencarian/detail kelas |
| app/dashboard/users/[role]/page.tsx | Pencarian dan tampilan tabel akun |
| components/schedules.tsx, components/teacher-content.tsx | Kartu jadwal/materi/tugas serta identitas jurusan |
| app/dashboard/teacher/exams/page.tsx | Kartu ujian |
| app/dashboard/student/materials/page.tsx, grades/page.tsx, exams/page.tsx | Konsistensi tampilan portal siswa |
| app/dashboard/student/exams/[id]/take/page.tsx | Tampilan soal, timer, konfirmasi, dan pagination |
| public/branding/*.png | Salinan asli enam aset yang diberikan pengguna |
| tests/visual.spec.ts | Pemeriksaan halaman, aset, overflow, tema, keyboard/modal, dan CBT |

Halaman yang memakai komponen bersama memperoleh desain baru tanpa perubahan pada handler atau data binding masing-masing.

## Aset

| File yang diberikan | Penggunaan | Aset publik |
| --- | --- | --- |
| LOGO SMK.png | Logo utama, sidebar, login, halaman publik, metadata ikon | /branding/logo-smk.png |
| PPLG MASKOT.png | PPLG | /branding/pplg.png |
| TJKT MASKOT.png | TJKT | /branding/tjkt.png |
| DKV MASKOT.png | DKV | /branding/dkv.png |
| PM MASKOT.png | BDR / Pemasaran, sesuai konfirmasi pengguna | /branding/bdr.png |
| MPLB MASKOT.png | MPLB | /branding/mplb.png |

Perhotelan memakai ikon Hotel dari Lucide karena tidak ada maskot Perhotelan pada aset yang diberikan. File PNG disalin byte-for-byte; warna, transparansi, dan proporsi asli dipertahankan. Next Image menangani ukuran gambar yang disajikan di halaman.

## Verifikasi

- npm run lint: lulus, tanpa warning.
- npm run typecheck: lulus.
- npm run build: lulus untuk seluruh rute.
- Enam pengujian lama pada tests/lms.spec.ts: lulus, mencakup pengumpulan tugas, nilai nol, penguncian jawaban, CBT/refresh/timer otomatis, hasil ujian, Excel, manajemen kelas/pengaturan, peran, navigasi mobile, logout, serta pembuatan materi/soal.
- Enam pengujian visual pada tests/visual.spec.ts: masing-masing lulus. Halaman publik dan CBT diulang setelah penyempurnaan screenshot dan pagination.
- Ukuran layar: desktop 1440 x 960, tablet 820 x 1180, mobile 320 x 850. Uji alur mobile lama juga memakai 390 x 844.
- Seluruh halaman portal tiap peran dikunjungi pada ketiga ukuran layar. Mode gelap dan interaksi keyboard/modal diperiksa.
- Perbandingan AST: 106 pemanggilan API/helper dan atribut seluruh form/control yang diperiksa tetap identik, dengan className dikecualikan.
- Hash sumber backend tidak berubah.
- Pengujian browser memakai backend Gin nyata dan database fixture terpisah pada .runtime/e2e, bukan database sekolah.

Screenshot hasil pemeriksaan tersimpan di ../.runtime/redesign-evidence. Periksa landing-desktop.png, landing-mobile.png, login-desktop.png, guru-dark-desktop.png, admin-siswa-mobile.png, teacher-grading.png, dan cbt-mobile.png.
