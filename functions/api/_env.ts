// Cloudflare Pages Functions 环境类型
export interface Env {
  DB: D1Database;
  STATIC_PASSWORD?: string;
}

// 通用 JSON 响应
export function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export function errorResponse(message: string, status = 500): Response {
  return jsonResponse({ error: message }, status);
}
