import Link from "next/link";
import { ModeToggle } from "./ui/mode-toggle";


export default function Header() {
    return (
        <div className="sticky w-full  flex items-center px-10 w-full">
            <div className="p-10">
                <h1 className="text-2xl font-medium">BrainCode</h1>
            </div>
            <div className="flex p-10 space-x-8 justify-items-end items-center ml-auto">
                <Link href={"/"}>Home</Link>
                <Link href={"/about"}>About</Link>
                <Link href={"/contact"}>Contact</Link>
                <Link href={"/login"}>Login</Link>
                <ModeToggle></ModeToggle>
            </div>
        </div>
    );
}