import { Env, jsonResponse, errorResponse } from './_env';

// GET /api/countdowns - 获取倒计时
export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const result = await context.env.DB
      .prepare('SELECT * FROM Countdown ORDER BY createdAt DESC')
      .all();
    return jsonResponse(result.results);
  } catch (e: any) {
    return errorResponse('Failed to fetch countdowns: ' + e.message);
  }
};

// POST /api/countdowns - 添加倒计时
export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const body: any = await context.request.json();
    const id = crypto.randomUUID();

    await context.env.DB
      .prepare('INSERT INTO Countdown (id, label, date) VALUES (?, ?, ?)')
      .bind(id, body.label, body.date)
      .run();

    const countdown = await context.env.DB.prepare('SELECT * FROM Countdown WHERE id = ?').bind(id).first();
    return jsonResponse(countdown, 201);
  } catch (e: any) {
    return errorResponse('Failed to add countdown: ' + e.message);
  }
};

// DELETE /api/countdowns - 删除倒计时
export const onRequestDelete: PagesFunction<Env> = async (context) => {
  try {
    const url = new URL(context.request.url);
    const id = url.searchParams.get('id');

    if (!id) return errorResponse('Missing id', 400);

    await context.env.DB.prepare('DELETE FROM Countdown WHERE id = ?').bind(id).run();
    return jsonResponse({ success: true });
  } catch (e: any) {
    return errorResponse('Failed to delete countdown: ' + e.message);
  }
};
