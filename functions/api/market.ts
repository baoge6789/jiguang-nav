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
    let cnyRate = 7.25;

    // 1. PI 币（Gate.io）
    const gateRes = await fetch('https://api.gateio.ws/api/v4/spot/tickers?currency_pair=PI_USDT', {
      headers: { 'Accept': 'application/json' },
    });

    if (gateRes.ok) {
      const gateData = await gateRes.json() as Array<{ last: string; change_percentage: string }>;
      if (gateData.length > 0) {
        const priceUSD = parseFloat(gateData[0].last) || 0;
        const pct = parseFloat(gateData[0].change_percentage) || 0;
        const prevPrice = priceUSD / (1 + pct / 100);
        result.push({ 
          id: idx++, 
          name: 'PI-USD', 
          price: priceUSD, 
          change: priceUSD - prevPrice, 
          percent: pct, 
          currency: 'USD' as const 
        });
      }
    }

    // 2. USD/CNY 汇率
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

    // 3. PI-CNY（复用 PI-USD 的 change 和 percent）
    try {
      const piUSD = result.find((r: any) => r.id === 1);
      if (piUSD && cnyRate > 0) {
        const priceCNY = piUSD.price * cnyRate;
        result.push({
          id: 'pi-cny',
          name: 'PI-CNY',
          price: Math.round(priceCNY * 10000) / 10000,
          change: piUSD.change,
          percent: piUSD.percent,
          type: 'crypto',
          currency: 'CNY',
        });
      }
    } catch (e) {
      console.error('PI CNY calculation error:', e);
    }

    // 4. 黄金/克
    try {
      const goldRes = await fetch('https://api.gold-api.com/price/XAU', {
        headers: { 'Accept': 'application/json' },
      });
      if (goldRes.ok) {
        const goldData = await goldRes.json();
        const usdPerOunce = goldData.price || 0;
        const cnyPerGram = (usdPerOunce / 31.1035) * cnyRate;
        result.push({
          id: 'gold',
          name: '黄金/克',
          price: Math.round(cnyPerGram * 100) / 100,
          change: 0,
          percent: 0,
          type: 'commodity',
          currency: 'CNY',
        });
      } else {
        result.push({
          id: 'gold',
          name: '黄金/克',
          price: 598.00,
          change: 0,
          percent: 0,
          type: 'commodity',
          currency: 'CNY',
        });
      }
    } catch (e) {
      console.error('Gold fetch error:', e);
      result.push({
        id: 'gold',
        name: '黄金/克',
        price: 598.00,
        change: 0,
        percent: 0,
        type: 'commodity',
        currency: 'CNY',
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