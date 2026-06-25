'use client';
import React, { useState, useEffect } from 'react';
import { Newspaper, ExternalLink } from 'lucide-react';

interface NewsItem {
    title: string;
    url: string;
    type?: string;
}

interface NewsWidgetProps {
    isDarkMode: boolean;
}

// 固定标签（根据实际数据中的 type 字段）
const TABS = ['toutiao', 'zhihu', 'bilibili', '52pj', 'douyin'];

// 标签显示名称映射
const TAB_NAMES: Record<string, string> = {
    toutiao: '今日头条',
    zhihu: '知乎',
    bilibili: '哔哩哔哩',
    '52pj': '52破解',
    douyin: '抖音',
};

export function NewsWidget({ isDarkMode }: NewsWidgetProps) {
    const [activeTab, setActiveTab] = useState(TABS[0]);
    const [news, setNews] = useState<NewsItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [allData, setAllData] = useState<Record<string, NewsItem[]>>({});

    useEffect(() => {
        fetch('https://raw.githubusercontent.com/six-666/news/main/news.json')
            .then(res => res.json())
            .then(data => {
                setAllData(data);
                setLoading(false);
            })
            .catch(() => {
                setLoading(false);
            });
    }, []);

    useEffect(() => {
        if (allData[activeTab]) {
            setNews(allData[activeTab]);
        } else {
            setNews([]);
        }
    }, [activeTab, allData]);

    return (
        <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white/60 border-white/60'}`}>
            {/* 标题 */}
            <div className="flex items-center gap-2 mb-3">
                <Newspaper size={16} className="text-indigo-500" />
                <span className="text-sm font-bold">资讯</span>
            </div>

            {/* 标签导航 */}
            <div className="flex flex-wrap gap-1 mb-2">
                {TABS.map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-2 py-0.5 rounded-full text-xs transition-all ${
                            activeTab === tab
                                ? 'bg-indigo-500 text-white'
                                : isDarkMode
                                ? 'bg-white/10 text-slate-300 hover:bg-white/20'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                    >
                        {TAB_NAMES[tab] || tab}
                    </button>
                ))}
            </div>

            {/* 资讯列表 */}
            <div className="space-y-1">
                {loading ? (
                    <div className="text-xs opacity-50 animate-pulse">加载中...</div>
                ) : news.length === 0 ? (
                    <div className="text-xs opacity-50">暂无资讯</div>
                ) : (
                    news.slice(0, 5).map((item, index) => (
                        <a
                            key={index}
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 text-xs hover:text-indigo-500 transition-colors group"
                        >
                            <span className="text-indigo-400 opacity-60 shrink-0">{index + 1}.</span>
                            <span className="truncate flex-1">{item.title}</span>
                            <ExternalLink size={10} className="opacity-0 group-hover:opacity-50 shrink-0 transition-opacity" />
                        </a>
                    ))
                )}
            </div>
        </div>
    );
}