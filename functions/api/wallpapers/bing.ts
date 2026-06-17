import { Env, jsonResponse, errorResponse } from '../_env';

// POST /api/wallpapers/bing - 同步 Bing 每日壁纸（只存 URL，不下载文件）
export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const db = context.env.DB;

    // 计算今天的日期字符串
    const now = new Date();
    const yyyy = now.getUTCFullYear();
    const mm = String(now.getUTCMonth() + 1).padStart(2, '0');
    const dd = String(now.getUTCDate()).padStart(2, '0');
    const todayStr = `${yyyy}${mm}${dd}`;
    const todayFilename = `bing-${todayStr}.jpg`;

    // 检查今天是否已有缓存
    const cached = await db
      .prepare('SELECT * FROM Wallpaper WHERE filename = ? AND type = ?')
      .bind(todayFilename, 'bing')
      .first();

    if (cached) {
      return jsonResponse({ wallpaper: cached, cached: true });
    }

    // 调用 Bing API 获取壁纸 URL
    const bingUrl = 'https://www.bing.com/HPImageArchive.aspx?format=js&idx=0&n=1&mkt=zh-CN';

    let bingData: any;
    try {
      const res = await fetch(bingUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0' },
      });
      bingData = await res.json();
    } catch {
      // Bing API 不可用，返回最新缓存
      const latest = await db
        .prepare('SELECT * FROM Wallpaper WHERE type = ? ORDER BY createdAt DESC LIMIT 1')
        .bind('bing')
        .first();
      if (latest) return jsonResponse({ wallpaper: latest, cached: true });
      return errorResponse('Bing API unreachable and no cache available', 503);
    }

    if (!bingData?.images?.[0]) {
      return errorResponse('Invalid Bing API response', 502);
    }

    const image = bingData.images[0];
    // 尝试获取 UHD 版本
    let imageUrl = `https://www.bing.com${image.url}`;
    if (imageUrl.includes('1920x1080')) {
      imageUrl = imageUrl.replace('1920x1080', 'UHD');
    } else if (image.urlbase) {
      imageUrl = `https://www.bing.com${image.urlbase}_UHD.jpg`;
    }

    const dateStr = image.startdate || todayStr;
    const filename = `bing-${dateStr}.jpg`;

    // 保存到数据库（只存 URL，不下载文件）
    const id = crypto.randomUUID();
    await db
      .prepare('INSERT INTO Wallpaper (id, url, type, filename) VALUES (?, ?, ?, ?)')
      .bind(id, imageUrl, 'bing', filename)
      .run();

    const wallpaper = await db.prepare('SELECT * FROM Wallpaper WHERE id = ?').bind(id).first();
    return jsonResponse({ wallpaper, cached: false });
  } catch (e: any) {
    return errorResponse('Failed to sync Bing wallpaper: ' + e.message);
  }
};
