"use client";
import {useParams} from "next/navigation";
import Schedules from "@/components/schedules";
export default function Page(){const {id}=useParams<{id:string}>();return <Schedules classId={Number(id)}/>;}
