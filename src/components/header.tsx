"use client";
import Link from "next/link";
import { ModeToggle } from "./ui/mode-toggle";
import { routes } from "../app/routes";
import { useEffect, useState } from "react";
import { useUser } from "@/context/UserContext";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
  } from "./ui/dropdown-menu"
import { Button } from "./ui/button"
import { useRouter } from "next/navigation";


export default function Header() {
    const { email, logout } = useUser();
    const router = useRouter();
    const handleLogout = () => {
        logout(); // limpiar contexto y localStorage
        router.push("/login"); // redirigir al login
      };
    console.log(email);

    return (
        <div className="sticky w-full  flex items-center px-10 w-full">
            <div className="p-10">
                <h1 className="text-2xl font-medium">Brainode</h1>
            </div>
            <div className="flex p-10 space-x-8 justify-items-end items-center ml-auto">
                <Link href={routes.home}>Home</Link>
                <Link href={routes.about}>About</Link>
                <Link href={routes.contact}>Contact</Link>
                <Link href={routes.login}>Login</Link>
                <ModeToggle></ModeToggle>
                {email ? (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="icon">
                            <span className="">@</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleLogout()}>Logout</DropdownMenuItem>
                        <DropdownMenuItem>
                            Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                            Settings
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
                ) : (
                <span></span>
                )}
            </div>
        </div>
    );
}