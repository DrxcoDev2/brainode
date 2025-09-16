"use client";
import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { IconBrandGithub, IconBrandGoogle } from "@tabler/icons-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";

export default function Login() {
  const router = useRouter();
  const { setUser } = useUser(); 
  const [email, setLocalEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Login submitted", email, password);
  
    try {
      const res = await fetch("http://localhost:2000/login", {
        cache: "no-store",
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
  
      if (!res.ok) {
        throw new Error("Error en el login");
      }
  
      const data = await res.json();
      console.log("Respuesta de login:", data);
  
      // Aquí tomamos directamente los campos que devuelve Go
      const emailFromApi = data.email;
      const nameFromApi = data.name;
  
      if (!emailFromApi) {
        alert("Email no encontrado en la respuesta del servidor");
        return;
      }
  
      // Guardamos en contexto y localStorage
      setUser(emailFromApi, nameFromApi);
      localStorage.setItem("userEmail", emailFromApi);
      localStorage.setItem("userName", nameFromApi);
  
      // Redirigir a home
      router.push("/");
    } catch (error: any) {
      console.error("Error en el login:", error);
      alert(error.message || "Error desconocido en login");
    }
  };

  return (
    <div className="shadow-input mx-auto w-full max-w-md rounded-none flex flex-col items-center justify-center h-auto mt-20 bg-white p-4 md:rounded-2xl md:p-8 dark:bg-black">
      <h2 className="text-xl font-bold text-neutral-800 dark:text-neutral-200">Login</h2>
      <p className="mt-2 max-w-sm text-sm text-neutral-600 dark:text-neutral-300">Login to your account</p>

      <form className="my-8" onSubmit={handleSubmit}>
        <div className="mb-4 flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-2">
          <LabelInputContainer>
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              placeholder="projectmayhem@fc.com"
              type="email"
              value={email}
              onChange={(e) => setLocalEmail(e.target.value)}
            />
          </LabelInputContainer>
          <LabelInputContainer>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              placeholder="\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </LabelInputContainer>
        </div>

        <button
          className="group/btn relative block h-10 w-full rounded-md bg-gradient-to-br from-black to-neutral-600 font-medium text-white shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:bg-zinc-800 dark:from-zinc-900 dark:to-zinc-900 dark:shadow-[0px_1px_0px_0px_#27272a_inset,0px_-1px_0px_0px_#27272a_inset]"
          type="submit"
        >
          Login &rarr;
          <BottomGradient />
        </button>
      </form>

      <div className="mt-5 text-center">
        <p className="text-sm">
          Don&apos;t have an account?{" "}
          <Link href="/#signup" className="text-blue-500">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}

const BottomGradient = () => (
  <>
    <span className="absolute inset-x-0 -bottom-px block h-px w-full bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-0 transition duration-500 group-hover/btn:opacity-100" />
    <span className="absolute inset-x-10 -bottom-px mx-auto block h-px w-1/2 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-0 blur-sm transition duration-500 group-hover/btn:opacity-100" />
  </>
);

const LabelInputContainer = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={cn("flex w-full flex-col space-y-2", className)}>{children}</div>
);
