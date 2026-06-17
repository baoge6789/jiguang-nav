import { Env, jsonResponse, errorResponse } from '../../_env';

// DELETE /api/admin/fonts/:id - 删除指定字体
// CF Pages 使用 [[id]] 通配符捕获路径参数
export const onRequestDelete: PagesFunction<Env> = async (context) => {
  try {
    const id = (context.params as any).id;

    if (!id) {
      return errorResponse('Missing font id', 400);
    }

    await context.env.DB.prepare('DELETE FROM CustomFont WHERE id = ?').bind(id).run();
    return jsonResponse({ success: true });
  } catch (e: any) {
    return errorResponse('Failed to delete font: ' + e.message);
  }
};
