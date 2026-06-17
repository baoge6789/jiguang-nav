import { Env, jsonResponse, errorResponse } from './_env';

// PUT /api/settings - 更新全局设置
export const onRequestPut: PagesFunction<Env> = async (context) => {
  try {
    const body: any = await context.request.json();
    const db = context.env.DB;

    // 读取现有设置
    const existing = await db.prepare('SELECT * FROM GlobalSettings WHERE id = 1').first() as any;

    const layout = body.layout ? JSON.stringify(body.layout) : (existing?.layout || '{}');
    const config = body.config ? JSON.stringify(body.config) : (existing?.config || '{}');
    const theme = body.theme ? JSON.stringify(body.theme) : (existing?.theme || '{}');
    const searchEngine = body.searchEngine ?? existing?.searchEngine ?? 'Google';

    if (existing) {
      await db
        .prepare(
          'UPDATE GlobalSettings SET layout = ?, config = ?, theme = ?, searchEngine = ?, updatedAt = datetime(\'now\') WHERE id = 1'
        )
        .bind(layout, config, theme, searchEngine)
        .run();
    } else {
      await db
        .prepare(
          'INSERT INTO GlobalSettings (id, layout, config, theme, searchEngine) VALUES (1, ?, ?, ?, ?)'
        )
        .bind(layout, config, theme, searchEngine)
        .run();
    }

    return jsonResponse({ success: true });
  } catch (e: any) {
    return errorResponse('Failed to update settings: ' + e.message);
  }
};
