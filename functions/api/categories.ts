import { Env, jsonResponse, errorResponse } from './_env';

// POST /api/categories - 添加单个分类（同时创建对应文件夹）
export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const body: any = await context.request.json();
    const db = context.env.DB;

    if (!body.name || !body.name.trim()) {
      return errorResponse('Missing category name', 400);
    }

    const name = body.name.trim();
    const order = body.order ?? 0;

    const existing = await db.prepare('SELECT id FROM Category WHERE name = ?').bind(name).first();
    if (existing) {
      return errorResponse('Category already exists', 409);
    }

    await db.prepare(
      'INSERT INTO Category (name, "order", updatedAt) VALUES (?, ?, datetime(\'now\'))'
    ).bind(name, order).run();

    // 创建对应的文件夹
    const folderId = `folder_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    await db.prepare(
      `INSERT INTO Site (id, name, url, type, category, parentId, "order", isHidden, createdAt, updatedAt) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`
    ).bind(
      folderId, name, '', 'folder', name, null, 0, 0
    ).run();

    return jsonResponse({ success: true, name, order }, 201);
  } catch (e: any) {
    return errorResponse('Failed to create category: ' + e.message);
  }
};

// PUT /api/categories - 批量更新分类
export const onRequestPut: PagesFunction<Env> = async (context) => {
  try {
    const categories: any[] = await context.request.json();
    const db = context.env.DB;

    const existingCategories = await db.prepare('SELECT id, name FROM Category').all();
    const oldNames = existingCategories.results.map((row: any) => row.name);

    // 检测分类改名
    const nameMap: Record<string, string> = {};
    for (const oldName of oldNames) {
      const matched = categories.find(c => c.name === oldName);
      if (matched && oldName !== matched.name) {
        nameMap[oldName] = matched.name;
      }
    }

    const newNames = categories.map(c => c.name);
    const deletedNames = oldNames.filter((name: string) => !newNames.includes(name));

    // 删除所有现有分类
    await db.prepare('DELETE FROM Category').run();

    // 重新插入分类
    const stmt = db.prepare(
      'INSERT INTO Category (name, color, isHidden, "order", updatedAt) VALUES (?, ?, ?, ?, datetime(\'now\'))'
    );

    const batch = categories.map((c) =>
      stmt.bind(c.name, c.color || null, c.isHidden ? 1 : 0, c.order ?? 0)
    );

    if (batch.length > 0) {
      await db.batch(batch);
    }

    // 处理文件夹
    // 删除不再存在的分类对应的文件夹
    for (const name of deletedNames) {
      await db.prepare('DELETE FROM Site WHERE type = ? AND category = ?').bind('folder', name).run();
    }

    // 为每个分类创建或更新对应的文件夹
    for (const cat of categories) {
      const folderName = cat.name.trim();

      const existingFolder = await db.prepare(
        'SELECT id, name FROM Site WHERE type = ? AND category = ?'
      ).bind('folder', folderName).first();

      if (existingFolder) {
        // ✅ 只有分类真正改名时才更新文件夹名
        const oldCategoryName = Object.keys(nameMap).find(key => nameMap[key] === folderName);
        if (oldCategoryName && existingFolder.name === oldCategoryName) {
          await db.prepare(
            'UPDATE Site SET name = ?, updatedAt = datetime(\'now\') WHERE id = ?'
          ).bind(folderName, existingFolder.id).run();
        }
        // 否则保持原样，不覆盖用户手动修改的文件夹名
      } else {
        // 创建新的文件夹
        const folderId = `folder_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
        await db.prepare(
          `INSERT INTO Site (id, name, url, type, category, parentId, "order", isHidden, createdAt, updatedAt) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`
        ).bind(
          folderId,
          folderName,
          '',
          'folder',
          folderName,
          null,
          0,
          0
        ).run();
      }
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

    const db = context.env.DB;

    await db.prepare('DELETE FROM Category WHERE name = ?').bind(name).run();
    await db.prepare('DELETE FROM Site WHERE type = ? AND category = ?').bind('folder', name).run();

    return jsonResponse({ success: true });
  } catch (e: any) {
    return errorResponse('Failed to delete category: ' + e.message);
  }
};