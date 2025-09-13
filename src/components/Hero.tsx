"use client";
import React from "react";
import { BackgroundRippleEffect } from "@/components/ui/background-ripple-effect";
import { Button } from "@/components/ui/button";
import { WordRotator } from "@/components/ui/flip-words";

const words = [
  "Mistral",
  "Claude",
  "Qwen",
  "Gemini",
  "GPT",
];

export function BackgroundRippleEffectDemo() {
  return (
    <div className="relative flex mb-20 w-full flex-col items-start justify-start overflow-hidden">
      <div className="mt-60 w-full">
        <h2 className="relative z-10 mx-auto max-w-4xl text-center text-2xl font-bold text-neutral-800 md:text-4xl lg:text-7xl dark:text-neutral-100">
        All good things are forever
        </h2>
        <p className="relative z-10 mx-auto mt-4 max-w-xl text-center text-neutral-800 dark:text-neutral-500">
        Chat with different smart models for free without any limitations. Our goal is to put everything at your fingertips.
        </p>
        <div className="flex justify-center my-8">
          <Button className="mr-4">Get Started</Button>
          <Button variant="outline">Watch Demo</Button>
        </div>
        <WordRotator words={words} duration={1000} className="text-center flex items-center justify-center text-2xl font-medium text-neutral-800 md:text-4xl lg:text-6xl dark:text-neutral-100" />
      </div>
    </div>
  );
}
