import { Env, jsonResponse } from './_env';

let cache: { data: any[]; time: number } | null = null;
const CACHE_TTL = 5 * 60 * 1000;

export const onRequestGet: PagesFunction<Env> = async () => {
  if (cache && Date.now() - cache.time < CACHE_TTL) {
    return jsonResponse(cache.data);
  }

  try {
    const [gateRes, cgRes] = await Promise.all([
      fetch('https://api.gateio.ws/api/v4/spot/tickers?currency_pair=PI_USDT', {
        headers: { 'Accept': 'application/json' },
      }),
      fetch('https://api.coingecko.com/api/v3/simple/price?ids=pi-network&vs_currencies=usd&include_24hr_change=true', {
        headers: { 'Accept': 'application/json' },
      }),
    ]);

    const result: any[] = [];
    let idx = 1;

    if (gateRes.ok) {
      const gateData = await gateRes.json() as Array<{ last: string; change_percentage: string }>;
      if (gateData.length > 0) {
        const price = parseFloat(gateData[0].last) || 0;
        const pct = parseFloat(gateData[0].change_percentage) || 0;
        const prevPrice = price / (1 + pct / 100);
        result.push({ id: idx++, name: 'PI · Gate.io', price, change: price - prevPrice, percent: pct, currency: 'USD' as const });
      }
    }

    if (cgRes.ok) {
      const cgData = await cgRes.json() as Record<string, { usd: number; usd_24h_change: number }>;
      const info = cgData['pi-network'];
      if (info) {
        const price = info.usd ?? 0;
        const pct = info.usd_24h_change ?? 0;
        const prevPrice = price / (1 + pct / 100);
        result.push({ id: idx++, name: 'PI · 非小号', price, change: price - prevPrice, percent: pct, currency: 'USD' as const });
      }
    }

    if (result.length > 0) {
      cache = { data: result, time: Date.now() };
    }
    return jsonResponse(result);
  } catch (e) {
    console.error('market error:', e);
    return jsonResponse(cache?.data ?? [], 500);
  }
};
