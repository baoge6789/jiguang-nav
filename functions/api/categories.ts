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

    // 检查分类是否已存在
    const existing = await db.prepare('SELECT id FROM Category WHERE name = ?').bind(name).first();
    if (existing) {
      return errorResponse('Category already exists', 409);
    }

    // 1. 插入分类
    await db.prepare(
      'INSERT INTO Category (name, "order", updatedAt) VALUES (?, ?, datetime(\'now\'))'
    ).bind(name, order).run();

    // 2. 🔥 同时创建对应的文件夹站点（关键修复）
    const folderId = `folder_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    await db.prepare(
      `INSERT INTO Site (id, name, url, type, category, parentId, "order", isHidden, createdAt, updatedAt) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`
    ).bind(
      folderId,           // id
      name,               // name (与分类同名)
      '',                 // url (文件夹没有URL)
      'folder',           // type ← 关键：标记为文件夹
      name,               // category (属于这个分类)
      null,               // parentId (根目录)
      0,                  // order
      0                   // isHidden (不隐藏)
    ).run();

    return jsonResponse({ success: true, name, order }, 201);
  } catch (e: any) {
    return errorResponse('Failed to create category: ' + e.message);
  }
};

// PUT /api/categories - 批量更新分类（全量替换）
export const onRequestPut: PagesFunction<Env> = async (context) => {
  try {
    const categories: any[] = await context.request.json();
    const db = context.env.DB;

    // 获取现有的分类名称列表（用于清理不再存在的分类）
    const existingCategories = await db.prepare('SELECT name FROM Category').all();
    const existingNames = existingCategories.results.map((row: any) => row.name);
    const newNames = categories.map(c => c.name);

    // 找出被删除的分类
    const deletedNames = existingNames.filter((name: string) => !newNames.includes(name));

    // 1. 删除所有现有分类
    await db.prepare('DELETE FROM Category').run();

    // 2. 重新插入分类
    const stmt = db.prepare(
      'INSERT INTO Category (name, color, isHidden, "order", updatedAt) VALUES (?, ?, ?, ?, datetime(\'now\'))'
    );

    const batch = categories.map((c) =>
      stmt.bind(c.name, c.color || null, c.isHidden ? 1 : 0, c.order ?? 0)
    );

    if (batch.length > 0) {
      await db.batch(batch);
    }

    // 3. 🔥 同步文件夹站点：为每个分类创建对应的文件夹
    // 先删除不再存在的分类对应的文件夹
    for (const name of deletedNames) {
      await db.prepare('DELETE FROM Site WHERE type = ? AND category = ?').bind('folder', name).run();
    }

    // 为每个分类创建或更新对应的文件夹
    for (const cat of categories) {
      const folderName = cat.name.trim();
      
      // 检查是否已有对应的文件夹
      const existingFolder = await db.prepare(
        'SELECT id FROM Site WHERE type = ? AND category = ?'
      ).bind('folder', folderName).first();

      if (existingFolder) {
        // 更新文件夹名称（如果分类改名）
        await db.prepare(
          'UPDATE Site SET name = ?, updatedAt = datetime(\'now\') WHERE id = ?'
        ).bind(folderName, existingFolder.id).run();
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

// DELETE /api/categories - 删除指定分类（同时删除对应的文件夹）
export const onRequestDelete: PagesFunction<Env> = async (context) => {
  try {
    const url = new URL(context.request.url);
    const name = url.searchParams.get('name');

    if (!name) {
      return errorResponse('Missing category name', 400);
    }

    const db = context.env.DB;

    // 1. 删除分类
    await db.prepare('DELETE FROM Category WHERE name = ?').bind(name).run();

    // 2. 🔥 同时删除对应的文件夹站点
    await db.prepare('DELETE FROM Site WHERE type = ? AND category = ?').bind('folder', name).run();

    return jsonResponse({ success: true });
  } catch (e: any) {
    return errorResponse('Failed to delete category: ' + e.message);
  }
};