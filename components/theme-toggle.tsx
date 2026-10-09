"use client";
import {useSyncExternalStore} from "react";
function subscribe(listener:()=>void){window.addEventListener("theme-change",listener);window.addEventListener("storage",listener);return()=>{window.removeEventListener("theme-change",listener);window.removeEventListener("storage",listener);};}
export default function ThemeToggle(){
 const dark=useSyncExternalStore(subscribe,()=>localStorage.getItem("setting_dark_mode")==="true",()=>false);
 return <label className="flex items-center justify-between gap-4 text-sm"><span><strong>Mode gelap</strong><span className="mt-1 block text-slate-500">Preferensi tampilan untuk perangkat ini.</span></span><input type="checkbox" checked={dark} onChange={event=>{localStorage.setItem("setting_dark_mode",String(event.target.checked));window.dispatchEvent(new Event("theme-change"));}} className="h-5 w-5 accent-indigo-600"/></label>;
}
