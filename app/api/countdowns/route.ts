import { NextResponse } from "next/server";

export async function GET() {
  try {
    const DB = (process.env as any).DB;
    if (!DB) {
      return NextResponse.json({ error: "Database not available" }, { status: 500 });
    }
    const stmt = DB.prepare("SELECT * FROM Countdown ORDER BY date ASC");
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
      .prepare("INSERT INTO Countdown (id, label, date, createdAt) VALUES (?, ?, ?, ?)")
      .bind(id, body.label, body.date, now)
      .run();
    return NextResponse.json({ id, label: body.label, date: body.date, createdAt: now }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
