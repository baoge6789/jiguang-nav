import { Env, jsonResponse, errorResponse } from './_env';

// GET /api/wallpapers - 获取壁纸列表
export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const url = new URL(context.request.url);
    const type = url.searchParams.get('type');

    let query = 'SELECT * FROM Wallpaper';
    const params: any[] = [];

    if (type) {
      query += ' WHERE type = ?';
      params.push(type);
    }

    query += ' ORDER BY createdAt DESC';

    const stmt = context.env.DB.prepare(query);
    const result = params.length > 0 ? await stmt.bind(...params).all() : await stmt.all();

    return jsonResponse(result.results);
  } catch (e: any) {
    return errorResponse('Failed to fetch wallpapers: ' + e.message);
  }
};

// POST /api/wallpapers - 添加壁纸（URL 模式，不上传文件）
export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const contentType = context.request.headers.get('content-type') || '';

    // JSON 模式：直接存 URL
    if (contentType.includes('application/json')) {
      const body: any = await context.request.json();
      const id = crypto.randomUUID();

      await context.env.DB
        .prepare('INSERT INTO Wallpaper (id, url, type, filename) VALUES (?, ?, ?, ?)')
        .bind(id, body.url, body.type || 'custom', body.filename || `custom-${Date.now()}.jpg`)
        .run();

      return jsonResponse({ id, ...body }, 201);
    }

    // FormData 模式：不支持文件上传（无 R2），返回错误提示
    return errorResponse('File upload is not supported. Please use URL-based wallpapers.', 400);
  } catch (e: any) {
    return errorResponse('Failed to add wallpaper: ' + e.message);
  }
};

// DELETE /api/wallpapers - 删除壁纸
export const onRequestDelete: PagesFunction<Env> = async (context) => {
  try {
    const url = new URL(context.request.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return errorResponse('Missing wallpaper id', 400);
    }

    await context.env.DB.prepare('DELETE FROM Wallpaper WHERE id = ?').bind(id).run();
    return jsonResponse({ success: true });
  } catch (e: any) {
    return errorResponse('Failed to delete wallpaper: ' + e.message);
  }
};
