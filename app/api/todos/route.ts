import { NextResponse } from "next/server";

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id;
    const body = await request.json();
    const DB = (process.env as any).DB;
    if (!DB) {
      return NextResponse.json({ error: "Database not available" }, { status: 500 });
    }
    await DB
      .prepare("UPDATE Todo SET done = ? WHERE id = ?")
      .bind(body.done ? 1 : 0, id)
      .run();
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id;
    const DB = (process.env as any).DB;
    if (!DB) {
      return NextResponse.json({ error: "Database not available" }, { status: 500 });
    }
    await DB
      .prepare("DELETE FROM Todo WHERE id = ?")
      .bind(id)
      .run();
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}