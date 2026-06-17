import { Env, jsonResponse, errorResponse } from './_env';

// GET /api/sites - 获取所有站点
export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const result = await context.env.DB
      .prepare('SELECT * FROM Site ORDER BY "order" ASC, createdAt ASC')
      .all();
    return jsonResponse(result.results);
  } catch (e: any) {
    return errorResponse('Failed to fetch sites: ' + e.message);
  }
};

// PUT /api/sites - 批量更新站点（排序、分类、隐藏、父级）
export const onRequestPut: PagesFunction<Env> = async (context) => {
  try {
    const sites: any[] = await context.request.json();
    const db = context.env.DB;

    const stmt = db.prepare(
      'UPDATE Site SET "order" = ?, category = ?, isHidden = ?, parentId = ?, updatedAt = datetime(\'now\') WHERE id = ?'
    );

    const batch = sites.map((s) =>
      stmt.bind(s.order ?? 0, s.category ?? '', s.isHidden ? 1 : 0, s.parentId ?? null, s.id)
    );

    if (batch.length > 0) {
      await db.batch(batch);
    }

    return jsonResponse({ success: true });
  } catch (e: any) {
    return errorResponse('Failed to update sites: ' + e.message);
  }
};

// POST /api/sites - 创建新站点
export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const site: any = await context.request.json();
    const db = context.env.DB;

    const id = site.id || crypto.randomUUID();

    await db
      .prepare(
        `INSERT INTO Site (id, name, url, "desc", category, color, icon, iconType, customIconUrl, "order", parentId)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(
        id,
        site.name,
        site.url,
        site.desc || null,
        site.category || '',
        site.color || null,
        site.icon || null,
        site.iconType || 'auto',
        site.customIconUrl || null,
        site.order ?? 0,
        site.parentId || null
      )
      .run();

    return jsonResponse({ id, ...site }, 201);
  } catch (e: any) {
    return errorResponse('Failed to create site: ' + e.message);
  }
};

// DELETE /api/sites - 删除站点
export const onRequestDelete: PagesFunction<Env> = async (context) => {
  try {
    const url = new URL(context.request.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return errorResponse('Missing site id', 400);
    }

    await context.env.DB.prepare('DELETE FROM Site WHERE id = ?').bind(id).run();
    return jsonResponse({ success: true });
  } catch (e: any) {
    return errorResponse('Failed to delete site: ' + e.message);
  }
};
