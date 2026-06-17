import { Env, jsonResponse, errorResponse } from '../../_env';

// POST /api/auth/private/verify - 验证私有模式密码
export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const { password } = await context.request.json() as any;

    if (!password) {
      return errorResponse('Missing password', 400);
    }

    // 从环境变量或数据库获取私有模式密码
    const settings = await context.env.DB
      .prepare('SELECT config FROM GlobalSettings WHERE id = 1')
      .first() as any;

    if (!settings) {
      return errorResponse('Settings not found', 500);
    }

    const config = JSON.parse(settings.config);
    const staticPassword = context.env.STATIC_PASSWORD || '123456';

    if (password === staticPassword) {
      return jsonResponse({ success: true });
    }

    return errorResponse('Invalid password', 401);
  } catch (e: any) {
    return errorResponse('Verification failed: ' + e.message);
  }
};
