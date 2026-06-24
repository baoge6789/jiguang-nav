import { Env, jsonResponse, errorResponse } from './_env';

// POST /api/import - 导入配置数据
export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const data: any = await context.request.json();
    const db = context.env.DB;

    // 导入设置
    if (data.layout || data.config || data.theme) {
      const layout = data.layout ? JSON.stringify(data.layout) : undefined;
      const config = data.config ? JSON.stringify(data.config) : undefined;
      const theme = data.theme ? JSON.stringify(data.theme) : undefined;

      const existing = await db.prepare('SELECT * FROM GlobalSettings WHERE id = 1').first();

      if (existing) {
        const updates: string[] = [];
        const values: any[] = [];
        if (layout) { updates.push('layout = ?'); values.push(layout); }
        if (config) { updates.push('config = ?'); values.push(config); }
        if (theme) { updates.push('theme = ?'); values.push(theme); }
        if (data.searchEngine) { updates.push('searchEngine = ?'); values.push(data.searchEngine); }
        updates.push('updatedAt = datetime(\'now\')');

        if (updates.length > 1) {
          await db.prepare(`UPDATE GlobalSettings SET ${updates.join(', ')} WHERE id = 1`).bind(...values).run();
        }
      }
    }

    // 导入分类
    if (data.categories && Array.isArray(data.categories)) {
      await db.prepare('DELETE FROM Category').run();
      const stmt = db.prepare('INSERT INTO Category (name, color, isHidden, "order") VALUES (?, ?, ?, ?)');
      const batch = data.categories.map((c: any, i: number) =>
        stmt.bind(c.name || c, c.color || null, c.isHidden ? 1 : 0, c.order ?? i)
      );
      if (batch.length > 0) await db.batch(batch);
    }

    // ✅ 导入站点（修复：添加 type 字段）
    if (data.sites && Array.isArray(data.sites)) {
      for (const site of data.sites) {
        await db
          .prepare(
            `INSERT OR REPLACE INTO Site (id, name, url, "desc", category, color, icon, iconType, customIconUrl, "order", parentId, type)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
          )
          .bind(
            site.id || crypto.randomUUID(),
            site.name,
            site.url || '',
            site.desc || null,
            site.category || '',
            site.color || null,
            site.icon || null,
            site.iconType || 'auto',
            site.customIconUrl || null,
            site.order ?? 0,
            site.parentId || null,
            site.type || 'site'  // ✅ 关键修复：保存 type 字段
          )
          .run();
      }
    }

    return jsonResponse({ success: true });
  } catch (e: any) {
    return errorResponse('Import failed: ' + e.message);
  }
};