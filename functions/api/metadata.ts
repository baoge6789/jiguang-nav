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
    const origin = new URL(url).origin;
    const icon = `https://www.google.com/s2/favicons?domain=${origin}&sz=128`;

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
