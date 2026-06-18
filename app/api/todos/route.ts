import { Env, jsonResponse, errorResponse } from '../_env';

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const stmt = context.env.DB.prepare('SELECT * FROM Todo ORDER BY createdAt DESC');
    const result = await stmt.all();
    return jsonResponse(result.results);
  } catch (e: any) {
    return errorResponse('Failed to fetch todos: ' + e.message);
  }
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const body: any = await context.request.json();
    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    await context.env.DB
      .prepare('INSERT INTO Todo (id, text, done, createdAt) VALUES (?, ?, ?, ?)')
      .bind(id, body.text, 0, now)
      .run();

    return jsonResponse({ id, text: body.text, done: false, createdAt: now }, 201);
  } catch (e: any) {
    return errorResponse('Failed to create todo: ' + e.message);
  }
};
