import { Env, jsonResponse } from './_env';

let cache: { data: any[]; time: number } | null = null;
const CACHE_TTL = 5 * 60 * 1000;

export const onRequestGet: PagesFunction<Env> = async () => {
  if (cache && Date.now() - cache.time < CACHE_TTL) {
    return jsonResponse(cache.data);
  }

  try {
    const result: any[] = [];
    let idx = 1;

    // 1. 获取 PI 币数据（Gate.io）
    const gateRes = await fetch('https://api.gateio.ws/api/v4/spot/tickers?currency_pair=PI_USDT', {
      headers: { 'Accept': 'application/json' },
    });

    if (gateRes.ok) {
      const gateData = await gateRes.json() as Array<{ last: string; change_percentage: string }>;
      if (gateData.length > 0) {
        const price = parseFloat(gateData[0].last) || 0;
        const pct = parseFloat(gateData[0].change_percentage) || 0;
        const prevPrice = price / (1 + pct / 100);
        result.push({ 
          id: idx++, 
          name: 'PI', 
          price, 
          change: price - prevPrice, 
          percent: pct, 
          currency: 'USD' as const 
        });
      }
    }

    // 2. 获取美元/人民币汇率
    try {
      const forexRes = await fetch('https://api.exchangerate-api.com/v4/latest/USD', {
        headers: { 'Accept': 'application/json' },
      });
      if (forexRes.ok) {
        const forexData = await forexRes.json();
        const cnyRate = forexData.rates?.CNY;
        if (cnyRate) {
          result.push({
            id: 'usdcny',
            name: 'USD/CNY',
            price: cnyRate,
            change: 0,
            percent: 0,
            type: 'forex',
            currency: 'CNY',
          });
        }
      }
    } catch (e) {
      console.error('Forex fetch error:', e);
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