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
    let cnyRate = 6.77; // 默认汇率，如果获取失败则使用此值

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
          name: 'PI(Gate)', 
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
        const rate = forexData.rates?.CNY;
        if (rate) {
          cnyRate = rate;
          result.push({
            id: 'usdcny',
            name: 'USD/CNY',
            price: rate,
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

    // 3. 获取黄金价格（人民币/克）
    try {
      const goldRes = await fetch('https://api.gold-api.com/price/XAU', {
        headers: { 'Accept': 'application/json' },
      });
      if (goldRes.ok) {
        const goldData = await goldRes.json();
        const usdPerOunce = goldData.price || 0;
        // 1盎司 = 31.1035克，转为人民币/克
        const cnyPerGram = (usdPerOunce / 31.1035) * cnyRate;
        result.push({
          id: 'gold',
          name: '黄金',
          price: Math.round(cnyPerGram * 100) / 100, // 保留两位小数
          change: 0,
          percent: 0,
          type: 'commodity',
          currency: 'CNY/g',
        });
      } else {
        // 备用方案：如果 API 失败，使用最近价格
        console.warn('Gold API failed, using fallback');
        result.push({
          id: 'gold',
          name: '黄金',
          price: 598.00,
          change: 0,
          percent: 0,
          type: 'commodity',
          currency: 'CNY/g',
        });
      }
    } catch (e) {
      console.error('Gold fetch error:', e);
      // 出错时使用备用数据
      result.push({
        id: 'gold',
        name: '黄金',
        price: 598.00,
        change: 0,
        percent: 0,
        type: 'commodity',
        currency: 'CNY/g',
      });
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