"use client";
import {useParams} from "next/navigation";
import QuestionBuilder from "@/components/question-builder";
export default function Page(){const {id}=useParams<{id:string}>();return <QuestionBuilder key={id} id={id} readOnly/>;}
