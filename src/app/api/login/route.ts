import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  // Usar el sistema de auth de Supabase
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.user) {
    return NextResponse.json(
      { message: "Email o contraseña incorrectos" },
      { status: 401 }
    );
  }

  return NextResponse.json({
    message: "Login exitoso",
    email: data.user.email,
    name: data.user.user_metadata?.name || "",
  });
}
