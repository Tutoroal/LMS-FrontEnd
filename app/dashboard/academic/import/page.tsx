"use client";

import { useState, useRef } from "react";
import { UploadCloud, FileSpreadsheet, CheckCircle2, AlertCircle, Info, Download } from "lucide-react";

export default function ImportExcelPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      checkAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      checkAndSetFile(e.target.files[0]);
    }
  };

  const checkAndSetFile = (selectedFile: File) => {
    setErrorMsg("");
    setResult(null);
    if (!selectedFile.name.endsWith(".xlsx")) {
      setErrorMsg("Format tidak valid! Harap unggah file Excel (.xlsx)");
      setFile(null);
      return;
    }
    setFile(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) return;
    setIsUploading(true);
    setErrorMsg("");
    setResult(null);

    const token = localStorage.getItem("token");
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("http://localhost:8080/api/admin/import", {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` },
        body: formData, // Jangan set Content-Type, biarkan browser yang atur multipart boundary
      });

      const data = await res.json();
      if (res.ok) {
        setResult(data);
        setFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
      } else {
        setErrorMsg(data.error || "Gagal mengunggah file.");
      }
    } catch (error) {
      setErrorMsg("Koneksi ke server terputus.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden">
        <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-emerald-100 blur-3xl opacity-50"></div>
        <div className="flex items-start md:items-center justify-between flex-col md:flex-row relative z-10 gap-6">
          <div className="flex items-center gap-5">
            <div className="p-4 rounded-2xl bg-emerald-100 text-emerald-600 shadow-inner">
              <FileSpreadsheet size={32} strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-800 tracking-tight">Import Massal (Excel)</h1>
              <p className="text-slate-500 mt-1 font-medium">Unggah data Guru, Siswa, dan Kelas sekaligus untuk mencegah duplikasi.</p>
            </div>
          </div>
          
          <button className="flex items-center gap-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 px-5 py-2.5 rounded-xl font-semibold transition-all">
            <Download size={18} /> Unduh Format Template
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Kolom Upload (Kiri) */}
        <div className="lg:col-span-2 space-y-6">
          <div 
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`bg-white border-2 border-dashed rounded-3xl p-12 text-center transition-all duration-300 ease-out flex flex-col items-center justify-center min-h-[320px] ${
              isDragging ? "border-emerald-500 bg-emerald-50/50 scale-[1.01]" : 
              file ? "border-blue-500 bg-blue-50/30" : "border-slate-200 hover:border-emerald-400 hover:bg-slate-50"
            }`}
          >
            <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept=".xlsx" className="hidden" id="file-upload" />
            
            {!file ? (
              <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
                <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 transition-colors ${isDragging ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                  <UploadCloud size={40} />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">Tarik & Lepas File di Sini</h3>
                <p className="text-slate-500 font-medium mb-6">Atau klik untuk mencari file di komputer Anda.</p>
                <span className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold shadow-md shadow-emerald-200 hover:bg-emerald-700 transition-colors">Pilih File Excel</span>
              </label>
            ) : (
              <div className="flex flex-col items-center">
                <div className="w-20 h-20 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mb-6">
                  <FileSpreadsheet size={40} />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">{file.name}</h3>
                <p className="text-slate-500 font-medium mb-8">{(file.size / 1024).toFixed(2)} KB • Siap diproses</p>
                
                <div className="flex gap-4">
                  <button onClick={() => setFile(null)} className="px-6 py-3 text-slate-600 font-bold bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">Batal</button>
                  <button onClick={handleUpload} disabled={isUploading} className="px-6 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200 disabled:opacity-50">
                    {isUploading ? "Memproses Data..." : "Mulai Import Data"}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Notifikasi Hasil */}
          {errorMsg && (
            <div className="p-5 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-4 text-red-700 animate-in slide-in-from-bottom-2">
              <AlertCircle size={24} className="mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-bold">Gagal Mengunggah</h4>
                <p className="text-sm mt-1">{errorMsg}</p>
              </div>
            </div>
          )}

          {result && (
            <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-4 text-emerald-800 animate-in slide-in-from-bottom-2">
              <CheckCircle2 size={28} className="mt-1 flex-shrink-0 text-emerald-600" />
              <div className="w-full">
                <h4 className="font-bold text-lg mb-2">{result.message}</h4>
                <div className="grid grid-cols-3 gap-4 mt-4">
                  <div className="bg-white p-4 rounded-xl border border-emerald-100 text-center shadow-sm">
                    <div className="text-2xl font-black text-emerald-600">{result.detail.guru_baru}</div>
                    <div className="text-xs font-bold text-slate-500 uppercase mt-1">Guru Baru</div>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-emerald-100 text-center shadow-sm">
                    <div className="text-2xl font-black text-emerald-600">{result.detail.siswa_baru}</div>
                    <div className="text-xs font-bold text-slate-500 uppercase mt-1">Siswa Baru</div>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-emerald-100 text-center shadow-sm">
                    <div className="text-2xl font-black text-emerald-600">{result.detail.kelas_baru}</div>
                    <div className="text-xs font-bold text-slate-500 uppercase mt-1">Kelas Dibuat</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Kolom Informasi (Kanan) */}
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm h-fit">
          <div className="flex items-center gap-3 mb-6">
            <Info className="text-blue-500" size={24} />
            <h3 className="font-bold text-slate-800 text-lg">Panduan Import</h3>
          </div>
          
          <div className="space-y-6">
            <div>
              <h4 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-slate-100 text-xs flex items-center justify-center">1</span>
                Sheet "DataGuru"
              </h4>
              <p className="text-sm text-slate-500 leading-relaxed mb-2">Pastikan nama *sheet* persis <b>DataGuru</b>. Baris pertama (Header) akan diabaikan.</p>
              <div className="bg-slate-50 p-3 rounded-lg text-xs font-mono text-slate-600 border border-slate-100">
                Kolom A: Nama<br/>
                Kolom B: Email (Unik)<br/>
                Kolom C: Password<br/>
                Kolom D: Spesialisasi (Mata Pelajaran)
              </div>
            </div>

            <hr className="border-slate-100" />

            <div>
              <h4 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-slate-100 text-xs flex items-center justify-center">2</span>
                Sheet "DataSiswa"
              </h4>
              <p className="text-sm text-slate-500 leading-relaxed mb-2">Pastikan nama *sheet* persis <b>DataSiswa</b>. Jika nama kelas belum ada, sistem akan otomatis membuatkannya.</p>
              <div className="bg-slate-50 p-3 rounded-lg text-xs font-mono text-slate-600 border border-slate-100">
                Kolom A: Nama Siswa<br/>
                Kolom B: Email (Unik)<br/>
                Kolom C: Password<br/>
                Kolom D: Nama Kelas (cth: 11 RPL 2)
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}