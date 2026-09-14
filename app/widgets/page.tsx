"use client";
import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { WidgetDashboard } from '@/app/components/widgets/WidgetDashboard';

export default function WidgetsPage() {
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [sitesCount, setSitesCount] = useState(0);
    const [widgetStyle, setWidgetStyle] = useState<'A' | 'B' | 'C'>('B');
    const [widgetConfig, setWidgetConfig] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const init = async () => {
            const savedTheme = localStorage.getItem('aurora_theme');
            setIsDarkMode(savedTheme === 'dark');

            const cached = localStorage.getItem('aurora_cache');
            if (cached) {
                try {
                    const data = JSON.parse(cached);
                    if (data.sites) setSitesCount(data.sites.length);
                    if (data.settings?.layout?.widgetStyle) setWidgetStyle(data.settings.layout.widgetStyle);
                    if (data.settings?.config?.widgetConfig) setWidgetConfig(data.settings.config.widgetConfig);
                    setLoading(false);
                } catch {}
            }

            try {
                const res = await fetch('/api/init');
                if (res.ok) {
                    const data = await res.json();
                    if (data.sites) setSitesCount(data.sites.length);
                    if (data.settings?.layout?.widgetStyle) setWidgetStyle(data.settings.layout.widgetStyle);
                    if (data.settings?.config?.widgetConfig) setWidgetConfig(data.settings.config.widgetConfig);
                }
            } catch {}
            setLoading(false);
        };
        init();
    }, []);

    // 关闭页面：优先 close()，不行就 history.back()，再不行回首页
    const handleClose = () => {
        // 尝试关闭标签页（只有脚本打开的标签页才能关）
        window.close();
        // 如果没关掉（手动打开的标签页关不掉），延迟后尝试返回
        setTimeout(() => {
            if (window.history.length > 1) {
                window.history.back();
            } else {
                window.location.href = '/';
            }
        }, 100);
    };

    if (loading) {
        return (
            <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-slate-900' : 'bg-slate-50'}`}>
                <div className="w-10 h-10 rounded-full border-4 border-indigo-500/30 border-t-indigo-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className={`min-h-screen p-4 md:p-8 ${isDarkMode ? 'bg-slate-900' : 'bg-slate-50'}`}>
            <div className="max-w-5xl mx-auto flex flex-col items-center">
                {/* 标题栏 */}
                <div className="w-full mb-6 flex items-center justify-between">
                    <h1 className={`text-xl md:text-2xl font-bold flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                        📊 信息看板
                    </h1>
                    <button
                        onClick={handleClose}
                        className={`p-2.5 rounded-full transition-all active:scale-95 ${
                            isDarkMode
                                ? 'bg-white/10 hover:bg-white/20 text-white'
                                : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                        }`}
                        title="关闭"
                    >
                        <X size={22} />
                    </button>
                </div>

                {/* 卡片区 - 居中 */}
                <div className="w-full flex justify-center">
                    <WidgetDashboard
                        isDarkMode={isDarkMode}
                        sitesCount={sitesCount}
                        widgetStyle={widgetStyle}
                        widgetConfig={widgetConfig}
                    />
                </div>
            </div>
        </div>
    );
}