import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  const { email, password, name } = await req.json();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name }, // se guarda en user_metadata
    },
  });

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }

  return NextResponse.json({
    message: "Usuario registrado",
    email: data.user?.email,
    name,
  });
}
