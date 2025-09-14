import { NextResponse } from "next/server";




// Mostrar usuario logueado
export default async function POST(request: Request) {
    try {
        const { email, password } = await request.json();

        const res = await fetch("http://localhost:2000/users", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            cache: "no-store",
            body: JSON.stringify({ email, password })
        });

        if (!res.ok) {
            const err = await res.text();
            return NextResponse.json(
                { error: err || "Error en el login" },
                { status: res.status }
            );
        }

        const data = await res.json();
        console.log("Usuario logueado:", data);

        return NextResponse.json({ message: "Usuario logueado", user: data });

    } catch (error: any) {
        console.error("Error en el login:", error);
        return NextResponse.json(
            { error: error.message || "Error inesperado" },
            { status: 500 }
        );
    }
}
