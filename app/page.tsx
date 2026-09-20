import Link from "next/link";

export default function PublicDashboard() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Navbar Public */}
      <header className="w-full bg-white border-b border-gray-200 py-4 px-8 flex justify-between items-center sticky top-0 z-50">
        <div className="text-2xl font-black text-blue-700 tracking-tight">
          LMS<span className="text-slate-800">Portal</span>
        </div>
        <nav>
          <Link 
            href="/login" 
            className="px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all duration-300 shadow-sm hover:shadow-md"
          >
            Masuk Portal
          </Link>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="flex-grow flex flex-col items-center justify-center text-center px-6 mt-[-4rem]">
        <div className="max-w-4xl">
          <span className="inline-block py-1 px-3 rounded-full bg-blue-100 text-blue-700 text-sm font-semibold mb-6">
            Versi 1.0 Dirilis
          </span>
          <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 mb-6 leading-tight tracking-tight">
            Sistem Manajemen Pembelajaran <br className="hidden md:block"/>
            <span className="text-blue-600">Era Digital</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-600 mb-10 leading-relaxed max-w-2xl mx-auto">
            Akses materi, kumpulkan tugas, dan pantau perkembangan akademikmu dalam satu dashboard terpadu. Khusus untuk Admin, Guru, dan Siswa terdaftar.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <Link 
              href="/login" 
              className="w-full sm:w-auto px-8 py-3.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 hover:-translate-y-0.5 transition-all duration-300 shadow-lg text-lg"
            >
              Login Internal
            </Link>
          </div>
        </div>
      </main>

      {/* Footer Minimalis */}
      <footer className="w-full py-6 text-center text-slate-500 text-sm border-t border-gray-200 bg-white">
        © {new Date().getFullYear()} LMS Portal. Hak Cipta Dilindungi.
      </footer>
    </div>
  );
}