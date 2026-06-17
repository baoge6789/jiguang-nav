import { Env, jsonResponse, errorResponse } from './_env';

// GET /api/init - 返回全部初始数据（站点、分类、设置）
export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const db = context.env.DB;

    const [sites, categories, settings] = await Promise.all([
      db.prepare('SELECT * FROM Site ORDER BY "order" ASC, createdAt ASC').all(),
      db.prepare('SELECT * FROM Category ORDER BY "order" ASC').all(),
      db.prepare('SELECT * FROM GlobalSettings WHERE id = 1').first(),
    ]);

    const settingsObj = settings
      ? {
          layout: JSON.parse(settings.layout as string),
          config: JSON.parse(settings.config as string),
          theme: JSON.parse(settings.theme as string),
          searchEngine: settings.searchEngine,
          bingCacheMode: settings.bingCacheMode,
        }
      : null;

    return jsonResponse({
      sites: sites.results,
      categories: categories.results,
      settings: settingsObj,
    });
  } catch (e: any) {
    return errorResponse('Failed to load init data: ' + e.message);
  }
};
