"use client";

import Image from "next/image";
import Header from "@/components/header"
import { BackgroundRippleEffectDemo } from "@/components/Hero";
import Form from "@/components/form";
import { useEffect, useState } from "react";
import { LoaderOne } from "@/components/ui/loader";
import ExChat from "@/components/ex-chat";
import ModInfo from "@/components/mod-info";


export default function Home() {

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setIsLoading(false);
    }, 2000);
  }, []);

  return (
    isLoading ? (
      <div className="flex items-center justify-center h-screen"><LoaderOne></LoaderOne></div>
    ) : (
    <div className="font-sans ">
      <main className="flex items-center justify-center ">
        <div className="flex flex-col">
        <Header></Header>
        <BackgroundRippleEffectDemo></BackgroundRippleEffectDemo>
        <Form></Form>
        </div>
        
        
      </main>
      <div className="mx-2 my-16 space-y-16 grid grid-cols-1 lg:grid-cols-2 lg:mx-120 lg:my-24">
        <ExChat></ExChat>
        <ModInfo></ModInfo>
      </div>

    </div>
    )
  )}
