import React, { useState, useEffect, useMemo } from 'react';
import { NOISE_BASE64 } from '@/lib/utils';
import { getUploadUrl, isUploadPath } from '@/lib/upload-url';

interface AuroraBackgroundProps {
    isDarkMode: boolean;
    layoutSettings: any;
}

export function AuroraBackground({ isDarkMode, layoutSettings }: AuroraBackgroundProps) {
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        setIsLoaded(false);
    }, [layoutSettings?.bgUrl]);

    const defaultAurora = (
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
            <div
                className={`absolute top-[-20%] left-[-10%] w-[70%] h-[70%] rounded-full ${isDarkMode ? 'opacity-90' : 'opacity-50'}`}
                style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 70%)' }} />
            <div
                className={`absolute bottom-[-10%] right-[-20%] w-[60%] h-[60%] rounded-full ${isDarkMode ? 'opacity-90' : 'opacity-50'}`}
                style={{ background: 'radial-gradient(circle, rgba(6,182,212,0.18) 0%, transparent 70%)' }} />
            <div className="absolute inset-0 opacity-[0.08] brightness-100 contrast-150 mix-blend-overlay"
                style={{ backgroundImage: `url("${NOISE_BASE64}")` }}></div>
        </div>
    );

    if (layoutSettings?.bgEnabled) {
        if (layoutSettings.bgType === 'color') {
            return (
                <div
                    className="fixed inset-0 z-0 pointer-events-none transition-colors duration-500"
                    style={{ backgroundColor: layoutSettings.bgColor || '#F8FAFC' }}
                />
            );
        }

        if (layoutSettings?.bgUrl) {
            const isCustom = layoutSettings.bgType === 'custom';
            // ✅ 强制缩放比例为 1（不缩放）
            const scale = 1;
            const bgX = isCustom ? (layoutSettings.bgX ?? 50) : 50;
            const bgY = isCustom ? (layoutSettings.bgY ?? 50) : 50;
            const bgUrl = getUploadUrl(layoutSettings.bgUrl);

            return (
                <>
                    {defaultAurora}
                    <div className={`fixed inset-0 z-0 pointer-events-none overflow-hidden transition-opacity duration-700 ease-in-out ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
                        {/* ✅ 使用原生 img，避免 NextImage 压缩 */}
                        <img
                            src={bgUrl}
                            alt="Background"
                            className="absolute inset-0 w-full h-full"
                            style={{
                                objectFit: 'cover',
                                objectPosition: `${bgX}% ${bgY}%`,
                                // ✅ 移除 transform: scale
                            }}
                            onLoad={() => setIsLoaded(true)}
                        />
                        {/* ✅ 降低遮罩浓度上限，让壁纸更清晰 */}
                        <div
                            className="absolute inset-0 bg-black transition-opacity duration-300"
                            style={{ opacity: Math.min((layoutSettings.bgOpacity ?? 10) / 100, 0.3) }}
                        />
                        {/* ✅ 降低噪点透明度 */}
                        <div className="absolute inset-0 opacity-[0.02] pointer-events-none"
                            style={{ backgroundImage: `url("${NOISE_BASE64}")` }}></div>
                    </div>
                </>
            );
        }
    }

    return defaultAurora;
}