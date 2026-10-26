"use client";
import {useParams} from "next/navigation";
import GradingDesk from "@/components/grading-desk";
export default function Page(){const {id}=useParams<{id:string}>();return <GradingDesk key={id} id={id} readOnly/>}
