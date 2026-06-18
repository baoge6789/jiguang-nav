import { NextResponse } from "next/server";
export const dynamic = 'force-dynamic';

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id;
    const DB = (process.env as any).DB;
    if (!DB) {
      return NextResponse.json({ error: "Database not available" }, { status: 500 });
    }
    await DB
      .prepare("DELETE FROM Countdown WHERE id = ?")
      .bind(id)
      .run();
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}