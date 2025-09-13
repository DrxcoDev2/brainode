import Link from "next/link";
import { ModeToggle } from "./ui/mode-toggle";
import { routes } from "../app/routes";


export default function Header() {
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
            </div>
        </div>
    );
}