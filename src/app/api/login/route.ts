import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("email", email)
    .single();

  if (error || !data || data.password !== password) {
    return NextResponse.json({ message: "Email o contraseña incorrectos" }, { status: 401 });
  }

  return NextResponse.json({
    message: "Login exitoso",
    name: data.name,
    email: data.email,
  });
}
