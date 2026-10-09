export const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api").replace(/\/$/, "");

export async function apiFetch(input: string, init: RequestInit = {}): Promise<Response> {
 const url = input.startsWith("http://localhost:8080/api") ? input.replace("http://localhost:8080/api", API_BASE) : input.startsWith("/") ? API_BASE + input : input;
 const headers = new Headers(init.headers);
 const token = localStorage.getItem("token");
 if (token) headers.set("Authorization", `Bearer ${token}`);
 const controller = new AbortController();
 const relayAbort = () => controller.abort(init.signal?.reason);
 init.signal?.addEventListener("abort", relayAbort, { once: true });
 if (init.signal?.aborted) relayAbort();
 const timer = setTimeout(() => controller.abort(new Error("Permintaan terlalu lama. Periksa koneksi lalu coba lagi.")), input.includes("/import") ? 120000 : 20000);
 try {
  const response = await fetch(url, { ...init, headers, cache: "no-store", signal: controller.signal });
  if (response.status === 401 && !url.endsWith("/login")) { endLocalSession(); }
  return response;
 } finally { clearTimeout(timer); init.signal?.removeEventListener("abort", relayAbort); }
}
export function endLocalSession() {
 localStorage.removeItem("token"); localStorage.removeItem("user");
 window.dispatchEvent(new Event("session-ended"));
}
export async function apiJSON<T = { message: string }>(path: string, init?: RequestInit): Promise<T> {
 const response = await apiFetch(path, init);
 let data: unknown;
 try { data = await response.json(); } catch { throw new Error("Respons server tidak valid. Periksa konfigurasi layanan."); }
 if (!response.ok) {
  const message = typeof data === "object" && data !== null && "error" in data && typeof data.error === "string" ? data.error : "Permintaan gagal. Silakan coba lagi.";
  throw new Error(message);
 }
 return data as T;
}
export function jsonBody(value: unknown): RequestInit { return { headers: { "Content-Type": "application/json" }, body: JSON.stringify(value) }; }
export async function downloadFile(path: string, filename: string) {
 const response = await apiFetch(path);
 if (!response.ok) { const data = await response.json(); throw new Error(data.error || "Unduhan gagal."); }
 const url = URL.createObjectURL(await response.blob());
 const link = document.createElement("a"); link.href = url; link.download = filename; document.body.appendChild(link); link.click(); link.remove();
 setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export function roleHome(role: number) { return role === 2 ? "/dashboard/teacher" : role === 3 ? "/dashboard/student" : "/dashboard"; }
