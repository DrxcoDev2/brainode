"use client";

import Image from "next/image";
import Header from "@/components/header"
import { BackgroundRippleEffectDemo } from "@/components/Hero";
import Form from "@/components/form";
import { useEffect, useState } from "react";
import { LoaderOne } from "@/components/ui/loader";
import ExChat from "@/components/ex-chat";

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
    <div className="font-sans flex items-center justify-center ">
      <main className="">
        <Header></Header>
        <BackgroundRippleEffectDemo></BackgroundRippleEffectDemo>
        <Form></Form>
        <ExChat></ExChat>
      </main>

    </div>
    )
  )}
