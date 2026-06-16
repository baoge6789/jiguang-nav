import { NextResponse } from 'next/server';

const SYMBOLS = [
    { id: 'ashare', symbol: '000001.SS', name: '上证指数', type: 'index' },
    { id: 'btc', symbol: 'BTC-USD', name: '比特币', type: 'crypto' },
    { id: 'eth', symbol: 'ETH-USD', name: '以太坊', type: 'crypto' },
    { id: 'pi', symbol: 'PI-USDT', name: 'Pi 币', type: 'crypto' },
];

const TIMEOUT_MS = 3000;

async function fetchWithTimeout(url: string, options: RequestInit = {}) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), TIMEOUT_MS);
    try {
        const response = await fetch(url, { ...options, signal: controller.signal });
        return response;
    } finally {
        clearTimeout(id);
    }
}

async function fetchExchangeRate() {
    try {
        const response = await fetchWithTimeout('https://api.exchangerate-api.com/v4/latest/USD');
        if (!response.ok) throw new Error('Exchange rate API error');
        const data = await response.json();
        const rate = data.rates.CNY;
        if (rate && typeof rate === 'number' && rate > 0) return rate;
        return 7.25;
    } catch {
        return 7.25;
    }
}

async function fetchPiPriceFromOKX(rate: number) {
    try {
        const response = await fetchWithTimeout('https://www.okx.com/api/v5/market/ticker?instId=PI-USDT');
        if (!response.ok) throw new Error(`OKX API error: ${response.status}`);
        const data = await response.json();
        if (data.code === '0' && data.data && data.data.length > 0) {
            const ticker = data.data[0];
            const priceUSDT = parseFloat(ticker.last);
            const open24h = parseFloat(ticker.open24h);
            const changeUSDT = priceUSDT - open24h;
            const percent = (changeUSDT / open24h) * 100;
            const priceCNY = priceUSDT * rate;
            const changeCNY = changeUSDT * rate;

            return {
                id: 'pi',
                name: 'Pi 币',
                symbol: 'PI-USDT',
                price: parseFloat(priceCNY.toFixed(4)),
                change: parseFloat(changeCNY.toFixed(4)),
                percent: isFinite(percent) ? parseFloat(percent.toFixed(2)) : 0,
                type: 'crypto',
                currency: 'CNY',
            };
        }
        return null;
    } catch {
        return null;
    }
}

async function fetchPiPriceFromGate(rate: number) {
    try {
        const response = await fetchWithTimeout('https://api.gateio.ws/api/v4/spot/tickers?currency_pair=PI_USDT');
        if (!response.ok) throw new Error(`Gate API error: ${response.status}`);
        const data = await response.json();
        if (data && data.length > 0) {
            const ticker = data[0];
            const priceUSDT = parseFloat(ticker.last);
            const changeUSDT = parseFloat(ticker.change_24h);
            const percent = parseFloat(ticker.change_percentage);
            const priceCNY = priceUSDT * rate;
            const changeCNY = changeUSDT * rate;

            return {
                id: 'pi',
                name: 'Pi 币',
                symbol: 'PI-USDT',
                price: parseFloat(priceCNY.toFixed(4)),
                change: parseFloat(changeCNY.toFixed(4)),
                percent: isFinite(percent) ? parseFloat(percent.toFixed(2)) : 0,
                type: 'crypto',
                currency: 'CNY',
            };
        }
        return null;
    } catch {
        return null;
    }
}

async function fetchPiPrice() {
    const rate = await fetchExchangeRate();
    let result = await fetchPiPriceFromOKX(rate);
    if (result) return result;
    result = await fetchPiPriceFromGate(rate);
    if (result) return result;
    return {
        id: 'pi',
        name: 'Pi 币',
        symbol: 'PI-USDT',
        price: null,
        change: null,
        percent: null,
        type: 'crypto',
        currency: 'CNY',
        error: true,
    };
}

export async function GET() {
    try {
        const STOCK_MAP: Record<string, string> = {
            'ashare': 'sh000001',
        };

        const promises = SYMBOLS.map(async (item) => {
            if (item.id === 'pi') {
                return await fetchPiPrice();
            }

            try {
                if (STOCK_MAP[item.id]) {
                    try {
                        const code = STOCK_MAP[item.id];
                        const response = await fetchWithTimeout(`http://qt.gtimg.cn/q=${code}`, {
                            headers: { 'Referer': 'https://finance.qq.com/' },
                        });

                        if (!response.ok) throw new Error('Tencent API failed');

                        const text = await response.text();
                        const matches = text.match(/="(.*)";/);
                        if (matches && matches[1]) {
                            const parts = matches[1].split('~');
                            if (parts.length > 30) {
                                const price = parseFloat(parts[3]);
                                const change = parseFloat(parts[31]);
                                const percent = parseFloat(parts[32]);

                                if (!isNaN(price)) {
                                    return {
                                        id: item.id,
                                        name: item.name,
                                        symbol: item.symbol,
                                        price,
                                        change,
                                        percent,
                                        type: item.type,
                                        currency: 'CNY',
                                    };
                                }
                            }
                        }
                    } catch {
                        // Tencent failed, fall through
                    }
                }

                const response = await fetchWithTimeout(
                    `https://query1.finance.yahoo.com/v8/finance/chart/${item.symbol}?interval=1d&range=1d`,
                );

                if (!response.ok) {
                    throw new Error(`Yahoo API error: ${response.status}`);
                }

                const data = await response.json();
                const meta = data.chart.result[0].meta;
                const price = meta.regularMarketPrice;
                const previousClose = meta.previousClose || meta.chartPreviousClose || price;
                const change = meta.regularMarketChange ?? (price - previousClose);
                let percent = meta.regularMarketChangePercent;

                if (percent === undefined || percent === null) {
                    percent = (change / previousClose) * 100;
                }

                if (!Number.isFinite(percent) || Number.isNaN(percent)) {
                    percent = 0;
                }

                return {
                    id: item.id,
                    name: item.name,
                    symbol: item.symbol,
                    price,
                    change,
                    percent,
                    type: item.type,
                    currency: 'USD',
                };
            } catch (error) {
                console.error(`[MarketAPI] Fetch failed for ${item.symbol}:`, error);
                return {
                    id: item.id,
                    name: item.name,
                    symbol: item.symbol,
                    price: null,
                    change: null,
                    percent: null,
                    type: item.type,
                    error: true,
                };
            }
        });

        const results = await Promise.all(promises);
        return NextResponse.json(results);
    } catch (error) {
        console.error('[MarketAPI] Fatal error:', error);
        return NextResponse.json({ error: 'Failed to fetch market data' }, { status: 500 });
    }
}