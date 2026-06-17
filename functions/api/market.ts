import { Env, jsonResponse } from './_env';

const EXCHANGES = [
  { id: 'binance', name: 'Binance' },
  { id: 'okex', name: 'OKX' },
  { id: 'gate', name: 'Gate.io' },
  { id: 'htx', name: 'HTX' },
];

let cache: { data: any[]; time: number } | null = null;
const CACHE_TTL = 5 * 60 * 1000;

export const onRequestGet: PagesFunction<Env> = async () => {
  if (cache && Date.now() - cache.time < CACHE_TTL) {
    return jsonResponse(cache.data);
  }

  try {
    const res = await fetch(
      'https://api.coingecko.com/api/v3/coins/pi-network/tickers?include_exchange_logo=false&depth=false',
      { headers: { 'Accept': 'application/json' } }
    );
    const data = await res.json() as { tickers: Array<{ market: { identifier: string; name: string }; last: number; price_change_percentage_24h: number }> };

    const result: any[] = [];
    let idx = 1;

    for (const ex of EXCHANGES) {
      const ticker = data.tickers?.find(
        (t: any) => t.market?.identifier === ex.id && t.last > 0
      );
      if (ticker) {
        const price = ticker.last;
        const pct = ticker.price_change_percentage_24h ?? 0;
        const prevPrice = price / (1 + pct / 100);
        result.push({
          id: idx++,
          name: `${ex.name}`,
          price,
          change: price - prevPrice,
          percent: pct,
          currency: 'USD' as const,
        });
      }
    }

    if (result.length === 0) {
      const fallbackRes = await fetch(
        'https://api.coingecko.com/api/v3/simple/price?ids=pi-network&vs_currencies=usd&include_24hr_change=true',
        { headers: { 'Accept': 'application/json' } }
      );
      const fallbackData = await fallbackRes.json() as Record<string, { usd: number; usd_24h_change: number }>;
      const info = fallbackData['pi-network'];
      if (info) {
        const price = info.usd ?? 0;
        const pct = info.usd_24h_change ?? 0;
        const prevPrice = price / (1 + pct / 100);
        result.push({
          id: 1, name: 'PI', price, change: price - prevPrice, percent: pct, currency: 'USD' as const,
        });
      }
    }

    cache = { data: result, time: Date.now() };
    return jsonResponse(result);
  } catch (e) {
    console.error('market error:', e);
    return jsonResponse(cache?.data ?? [], 500);
  }
};
