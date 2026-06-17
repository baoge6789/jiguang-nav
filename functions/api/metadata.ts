import { jsonResponse, errorResponse } from './_env';

export const onRequestGet: PagesFunction<any> = async (context) => {
  const url = new URL(context.request.url).searchParams.get('url');
  if (!url) return errorResponse('Missing url parameter', 400);

  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; JiguangBot/1.0)' },
      redirect: 'follow',
    });
    if (!res.ok) return jsonResponse({ title: '', description: '', icon: '' });

    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('text/html')) {
      return jsonResponse({ title: '', description: '', icon: '' });
    }

    const html = await res.text();
    const title = extractTitle(html);
    const description = extractMeta(html, 'description');
    // 从目标网站 HTML 中提取内置 logo 图标
    const icon = extractFavicon(html, url);

    return jsonResponse({ title, description, icon });
  } catch (e: any) {
    return jsonResponse({ title: '', description: '', icon: '' });
  }
};

function extractTitle(html: string): string {
  const ogMatch = html.match(/<meta\s+property="og:title"\s+content="([^"]*)"/i);
  if (ogMatch?.[1]) return decodeEntities(ogMatch[1]);

  const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
  if (titleMatch?.[1]) return decodeEntities(titleMatch[1].trim());

  return '';
}

function extractMeta(html: string, name: string): string {
  const ogMatch = html.match(new RegExp(`<meta\\s+property="og:${name}"\\s+content="([^"]*)"`, 'i'));
  if (ogMatch?.[1]) return decodeEntities(ogMatch[1]);

  const nameMatch = html.match(new RegExp(`<meta\\s+name="${name}"\\s+content="([^"]*)"`, 'i'));
  if (nameMatch?.[1]) return decodeEntities(nameMatch[1]);

  return '';
}

/**
 * 从 HTML 中提取网站内置 favicon / apple-touch-icon
 * 优先级：apple-touch-icon > icon (大尺寸) > shortcut icon > /favicon.ico
 */
function extractFavicon(html: string, pageUrl: string): string {
  const origin = new URL(pageUrl).origin;
  const baseUrl = new URL(pageUrl);

  // 收集所有 link 标签中的图标引用
  const linkRe = /<link\b[^>]*>/gi;
  let best = '';
  let bestSize = 0;

  let m: RegExpExecArray | null;
  while ((m = linkRe.exec(html))) {
    const tag = m[0];
    const relMatch = tag.match(/\brel\s*=\s*["']([^"']+)["']/i);
    if (!relMatch) continue;
    const rel = relMatch[1].toLowerCase().trim();

    if (!['icon', 'shortcut icon', 'apple-touch-icon', 'apple-touch-icon-precomposed'].includes(rel)) continue;

    const hrefMatch = tag.match(/\bhref\s*=\s*["']([^"']+)["']/i);
    if (!hrefMatch?.[1]) continue;

    const href = hrefMatch[1].trim();
    if (!href || href.startsWith('data:')) continue; // 跳过 base64 内联图标

    // 转绝对 URL
    let absUrl: string;
    try {
      absUrl = new URL(href, baseUrl).href;
    } catch {
      continue;
    }

    // apple-touch-icon 优先级最高（通常 180x180 高清）
    if (rel.includes('apple-touch-icon')) {
      // 取尺寸最大的 apple-touch-icon
      const sizeMatch = tag.match(/\bsizes\s*=\s*["']?(\d+)x(\d+)/i);
      const size = sizeMatch ? parseInt(sizeMatch[1]) : 180;
      if (size >= bestSize || !best) {
        best = absUrl;
        bestSize = size;
      }
      continue;
    }

    // 普通 icon / shortcut icon —— 取大尺寸
    const sizeMatch = tag.match(/\bsizes\s*=\s*["']?(\d+)x(\d+)/i);
    const size = sizeMatch ? parseInt(sizeMatch[1]) : 32;
    if (size > bestSize) {
      best = absUrl;
      bestSize = size;
    }
  }

  if (best) return best;

  // 兜底：访问 /favicon.ico
  return origin + '/favicon.ico';
}

function decodeEntities(str: string): string {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, '/');
}
