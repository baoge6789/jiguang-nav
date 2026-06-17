import { Env, jsonResponse } from './_env';

// GET /api/market - 返回空数组（市场功能暂未实现）
export const onRequestGet: PagesFunction<Env> = async () => {
  return jsonResponse([]);
};
