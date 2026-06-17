import { Env, jsonResponse, errorResponse } from '../_env';

// GET /api/admin/fonts - 获取所有自定义字体
export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const result = await context.env.DB
      .prepare('SELECT * FROM CustomFont ORDER BY createdAt DESC')
      .all();
    return jsonResponse(result.results);
  } catch (e: any) {
    return errorResponse('Failed to fetch fonts: ' + e.message);
  }
};

// POST /api/admin/fonts - 添加自定义字体
export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const font: any = await context.request.json();
    const id = crypto.randomUUID();

    await context.env.DB
      .prepare('INSERT INTO CustomFont (id, name, family, url, provider) VALUES (?, ?, ?, ?, ?)')
      .bind(id, font.name, font.family, font.url || '', font.provider || null)
      .run();

    return jsonResponse({ id, ...font }, 201);
  } catch (e: any) {
    return errorResponse('Failed to add font: ' + e.message);
  }
};
