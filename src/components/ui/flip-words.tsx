"use client";
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";

export const WordRotator = ({
  words,
  duration = 2500,
  className,
}: {
  words: string[];
  duration?: number;
  className?: string;
}) => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % words.length);
    }, duration);
    return () => clearInterval(timer);
  }, [duration, words.length]);

  return (
    <div className={cn("relative inline-block overflow-hidden", className)}>
      <AnimatePresence mode="wait">
        <motion.span
          key={words[index]}
          initial={{ opacity: 0, rotateX: -90, y: 20 }}
          animate={{ opacity: 1, rotateX: 0, y: 0 }}
          exit={{ opacity: 0, rotateX: 90, y: -20 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          className="absolute left-0 top-0 w-full text-neutral-900 dark:text-neutral-100"
        >
          {words[index]}
        </motion.span>
      </AnimatePresence>
    </div>
  );
};
