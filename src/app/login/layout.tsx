import { Inter } from "next/font/google";
import Header from "@/components/header";   

const inter = Inter({ subsets: ["latin"] });

export default function LoginLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <div className={inter.className + `max-w-md mx-auto`}><Header  />{children}</div>;
}