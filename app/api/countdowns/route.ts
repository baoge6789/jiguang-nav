import { Env, jsonResponse, errorResponse } from '../_env';

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const stmt = context.env.DB.prepare('SELECT * FROM Countdown ORDER BY date ASC');
    const result = await stmt.all();
    return jsonResponse(result.results);
  } catch (e: any) {
    return errorResponse('Failed to fetch countdowns: ' + e.message);
  }
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const body: any = await context.request.json();
    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    await context.env.DB
      .prepare('INSERT INTO Countdown (id, label, date, createdAt) VALUES (?, ?, ?, ?)')
      .bind(id, body.label, body.date, now)
      .run();

    return jsonResponse({ id, label: body.label, date: body.date, createdAt: now }, 201);
  } catch (e: any) {
    return errorResponse('Failed to create countdown: ' + e.message);
  }
};
