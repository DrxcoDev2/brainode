import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// GET /api/conversations
export async function GET() {
  const { data, error } = await supabase
    .from("conversations")
    .select("id, user_id, model, created_at");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data);
}
