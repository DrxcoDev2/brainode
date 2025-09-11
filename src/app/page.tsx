import Image from "next/image";
import Header from "@/components/header"
import { BackgroundRippleEffectDemo } from "@/components/Hero";

export default function Home() {
  return (
    <div className="font-sans flex items-center justify-center ">
      <main className="">
        <Header></Header>
        <BackgroundRippleEffectDemo></BackgroundRippleEffectDemo>
      </main>

    </div>
  );
}
