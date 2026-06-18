import { NextResponse } from "next/server";
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const DB = (process.env as any).DB;
    if (!DB) {
      return NextResponse.json({ error: "Database not available" }, { status: 500 });
    }
    const stmt = DB.prepare("SELECT * FROM Todo ORDER BY createdAt DESC");
    const result = await stmt.all();
    return NextResponse.json(result.results);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const DB = (process.env as any).DB;
    if (!DB) {
      return NextResponse.json({ error: "Database not available" }, { status: 500 });
    }
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    await DB
      .prepare("INSERT INTO Todo (id, text, done, createdAt) VALUES (?, ?, ?, ?)")
      .bind(id, body.text, 0, now)
      .run();
    return NextResponse.json({ id, text: body.text, done: false, createdAt: now }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
