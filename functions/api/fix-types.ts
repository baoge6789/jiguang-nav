import { Env, jsonResponse, errorResponse } from './_env';

// GET /api/fix-types - 自动修复站点类型（检测被引用为父级的站点，标记为 folder）
export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const db = context.env.DB;

    // 1. 找出所有被引用为 parentId 的站点 ID（这些应该是文件夹）
    const folderIds = await db.prepare(
      'SELECT DISTINCT parentId FROM Site WHERE parentId IS NOT NULL AND parentId != \'\' AND parentId IN (SELECT id FROM Site)'
    ).all();

    const ids = (folderIds.results as any[]).map(r => r.parentId);

    // 2. 将这些站点的 type 更新为 'folder'
    let fixedCount = 0;
    if (ids.length > 0) {
      const placeholders = ids.map(() => '?').join(',');
      await db.prepare(
        `UPDATE Site SET type = 'folder', url = '', icon = 'Folder', iconType = 'auto' WHERE id IN (${placeholders}) AND type != 'folder'`
      ).bind(...ids).run();
      fixedCount = ids.length;
    }

    // 3. 清理空字符串 parentId → NULL
    await db.prepare(
      'UPDATE Site SET parentId = NULL WHERE parentId = \'\''
    ).run();

    return jsonResponse({
      success: true,
      fixedFolders: fixedCount,
      folderIds: ids,
      message: `已修复 ${fixedCount} 个文件夹类型`
    });
  } catch (e: any) {
    return errorResponse('Failed to fix types: ' + e.message);
  }
};
