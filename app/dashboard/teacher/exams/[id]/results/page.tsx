"use client";
import {useParams} from "next/navigation";
import ExamResults from "@/components/exam-results";
export default function Page(){const {id}=useParams<{id:string}>();return <ExamResults key={id} id={id} />;}
