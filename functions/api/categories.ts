import { Env, jsonResponse, errorResponse } from './_env';

// PUT /api/categories - 批量更新分类（全量替换）
export const onRequestPut: PagesFunction<Env> = async (context) => {
  try {
    const categories: any[] = await context.request.json();
    const db = context.env.DB;

    // 删除所有现有分类，然后重新插入（全量同步策略）
    await db.prepare('DELETE FROM Category').run();

    const stmt = db.prepare(
      'INSERT INTO Category (name, color, isHidden, "order", updatedAt) VALUES (?, ?, ?, ?, datetime(\'now\'))'
    );

    const batch = categories.map((c) =>
      stmt.bind(c.name, c.color || null, c.isHidden ? 1 : 0, c.order ?? 0)
    );

    if (batch.length > 0) {
      await db.batch(batch);
    }

    return jsonResponse({ success: true });
  } catch (e: any) {
    return errorResponse('Failed to update categories: ' + e.message);
  }
};

// DELETE /api/categories - 删除指定分类
export const onRequestDelete: PagesFunction<Env> = async (context) => {
  try {
    const url = new URL(context.request.url);
    const name = url.searchParams.get('name');

    if (!name) {
      return errorResponse('Missing category name', 400);
    }

    await context.env.DB.prepare('DELETE FROM Category WHERE name = ?').bind(name).run();
    return jsonResponse({ success: true });
  } catch (e: any) {
    return errorResponse('Failed to delete category: ' + e.message);
  }
};
