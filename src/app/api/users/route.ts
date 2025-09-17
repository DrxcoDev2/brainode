import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// GET /api/users
export async function GET() {
  const { data, error } = await supabase
    .from("users")
    .select("id, name, email");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data);
}

// POST /api/users
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, email, password } = body;

  const { data, error } = await supabase
    .from("users")
    .insert({ name, email, password });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ message: "Usuario creado", data }, { status: 201 });
}
