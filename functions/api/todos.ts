import { Env, jsonResponse, errorResponse } from './_env';

// GET /api/todos - 获取待办事项
export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const result = await context.env.DB
      .prepare('SELECT * FROM Todo ORDER BY createdAt DESC')
      .all();
    return jsonResponse(result.results);
  } catch (e: any) {
    return errorResponse('Failed to fetch todos: ' + e.message);
  }
};

// POST /api/todos - 添加待办事项
export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const body: any = await context.request.json();
    const id = crypto.randomUUID();

    await context.env.DB
      .prepare('INSERT INTO Todo (id, text) VALUES (?, ?)')
      .bind(id, body.text)
      .run();

    const todo = await context.env.DB.prepare('SELECT * FROM Todo WHERE id = ?').bind(id).first();
    return jsonResponse(todo, 201);
  } catch (e: any) {
    return errorResponse('Failed to add todo: ' + e.message);
  }
};

// PUT /api/todos - 更新待办事项（标记完成/未完成）
export const onRequestPut: PagesFunction<Env> = async (context) => {
  try {
    const body: any = await context.request.json();

    await context.env.DB
      .prepare('UPDATE Todo SET done = ?, text = COALESCE(?, text) WHERE id = ?')
      .bind(body.done ? 1 : 0, body.text || null, body.id)
      .run();

    return jsonResponse({ success: true });
  } catch (e: any) {
    return errorResponse('Failed to update todo: ' + e.message);
  }
};

// DELETE /api/todos - 删除待办事项
export const onRequestDelete: PagesFunction<Env> = async (context) => {
  try {
    const url = new URL(context.request.url);
    const id = url.searchParams.get('id');

    if (!id) return errorResponse('Missing id', 400);

    await context.env.DB.prepare('DELETE FROM Todo WHERE id = ?').bind(id).run();
    return jsonResponse({ success: true });
  } catch (e: any) {
    return errorResponse('Failed to delete todo: ' + e.message);
  }
};
