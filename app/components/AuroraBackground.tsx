import React, { useState, useEffect, useMemo } from 'react';
import NextImage from 'next/image';
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

    // ✅ 极光层 - 透明度大幅降低，减少模糊感
    const defaultAurora = (
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
            <div
                className={`absolute top-[-20%] left-[-10%] w-[70%] h-[70%] rounded-full ${isDarkMode ? 'opacity-40' : 'opacity-20'}`}
                style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)' }} />
            <div
                className={`absolute bottom-[-10%] right-[-20%] w-[60%] h-[60%] rounded-full ${isDarkMode ? 'opacity-40' : 'opacity-20'}`}
                style={{ background: 'radial-gradient(circle, rgba(6,182,212,0.10) 0%, transparent 70%)' }} />
            {/* ✅ 噪点图层 - 透明度大幅降低 */}
            <div className="absolute inset-0 opacity-[0.02] brightness-100 contrast-150 mix-blend-overlay"
                style={{ backgroundImage: `url("${NOISE_BASE64}")` }}></div>
        </div>
    );

    if (layoutSettings?.bgEnabled) {
        // Mode 1: Pure Color
        if (layoutSettings.bgType === 'color') {
            return (
                <div
                    className="fixed inset-0 z-0 pointer-events-none transition-colors duration-500"
                    style={{ backgroundColor: layoutSettings.bgColor || '#F8FAFC' }}
                />
            );
        }

        // Mode 2: Custom/Bing Image
        if (layoutSettings?.bgUrl) {
            const isCustom = layoutSettings.bgType === 'custom';
            const scale = isCustom ? (layoutSettings.bgScale || 100) / 100 : 1;
            const bgX = isCustom ? (layoutSettings.bgX ?? 50) : 50;
            const bgY = isCustom ? (layoutSettings.bgY ?? 50) : 50;

            return (
                <>
                    {/* ✅ 极光层透明度降低 */}
                    {defaultAurora}
                    <div className={`fixed inset-0 z-0 pointer-events-none overflow-hidden transition-opacity duration-700 ease-in-out ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
                        {/* Use native img for upload paths to avoid Next.js Image optimization issues in Docker */}
                        {isUploadPath(layoutSettings.bgUrl) ? (
                            <img
                                src={getUploadUrl(layoutSettings.bgUrl)}
                                alt="Background"
                                className="absolute inset-0 w-full h-full"
                                style={{
                                    objectFit: 'cover',
                                    objectPosition: `${bgX}% ${bgY}%`,
                                    transform: `scale(${scale})`,
                                }}
                                onLoad={() => setIsLoaded(true)}
                            />
                        ) : (
                            <NextImage
                                src={layoutSettings.bgUrl || ''}
                                alt="Background"
                                fill
                                priority
                                quality={95}
                                style={{
                                    objectFit: 'cover',
                                    objectPosition: `${bgX}% ${bgY}%`,
                                    transform: `scale(${scale})`,
                                }}
                                onLoad={() => setIsLoaded(true)}
                            />
                        )}
                        {/* ✅ 黑色遮罩透明度降低 */}
                        <div
                            className="absolute inset-0 bg-black transition-opacity duration-300"
                            style={{ opacity: (layoutSettings.bgOpacity ?? 20) / 100 }}
                        />
                        {/* ✅ 噪点图层透明度降低 */}
                        <div className="absolute inset-0 opacity-[0.02] pointer-events-none"
                            style={{ backgroundImage: `url("${NOISE_BASE64}")` }}></div>
                    </div>
                </>
            );
        }
    }

    // Default Aurora Mode
    return defaultAurora;
}