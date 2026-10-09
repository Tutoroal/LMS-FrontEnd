"use client";
import { useCallback, useEffect, useState } from "react";
import { apiJSON } from "./api";

export function useResource<T>(path: string | null) {
 const [data, setData] = useState<T | null>(null);
 const [error, setError] = useState("");
 const [loading, setLoading] = useState(true);
 const [revision, setRevision] = useState(0);
 const reload = useCallback(() => { setLoading(true); setRevision(value => value + 1); }, []);
 useEffect(() => {
  if (!path) return;
  const controller = new AbortController();
  apiJSON<T>(path, { signal: controller.signal }).then(value => {
   setData(value); setError(""); setLoading(false);
  }).catch(reason => {
   if (!controller.signal.aborted) { setError(reason instanceof Error ? reason.message : "Gagal memuat data."); setLoading(false); }
  });
  return () => controller.abort();
 }, [path, revision]);
 return { data, error, loading, reload };
}
export function useAction() {
 const [busy, setBusy] = useState(false);
 const [error, setError] = useState("");
 const [message, setMessage] = useState("");
 const run = useCallback(async (action: () => Promise<void>, success = "") => {
  setBusy(true); setError(""); setMessage("");
  try { await action(); setMessage(success); return true; }
  catch (reason) { setError(reason instanceof Error ? reason.message : "Tindakan gagal."); return false; }
  finally { setBusy(false); }
 }, []);
 return { busy, error, message, run };
}
