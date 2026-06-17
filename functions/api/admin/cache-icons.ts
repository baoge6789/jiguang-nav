import { Env, jsonResponse, errorResponse } from '../_env';

// POST /api/admin/cache-icons - 缓存图标（CF 环境下使用外部 URL，不做本地缓存）
export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const body: any = await context.request.json();

    // 在 CF 环境中，图标使用外部 URL（Google Favicon 等服务）
    // 不做本地文件缓存，直接返回成功
    return jsonResponse({
      success: true,
      message: 'Icon caching is handled via external favicon services in CF environment.',
      processed: body.siteIds?.length || 0,
    });
  } catch (e: any) {
    return errorResponse('Cache icons failed: ' + e.message);
  }
};
