import React, { useState, useEffect, useRef } from 'react';
import NextImage from 'next/image';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Globe, MoreHorizontal, ExternalLink, Folder } from 'lucide-react';
import { Icon } from '@iconify/react';
import { hexToRgb, getAccessibleTextColor, shouldUseTextShadow, FAVICON_PROVIDERS, getSimpleFaviconUrl, isIconifyIcon } from '@/lib/utils';
import { ICON_MAP, FONTS } from '@/lib/constants';
import { useFonts } from '@/app/hooks/useFonts';
import { useOnlineStatus } from '@/app/hooks/useOnlineStatus';

interface SiteCardProps {
    site: any;
    isLoggedIn: boolean;
    isDarkMode: boolean;
    settings: any;
    onEdit?: () => void;
    onDelete?: () => void;
    onContextMenu?: (e: React.MouseEvent, id: any) => void;
    isOverlay?: boolean;
    onFolderClick?: (folder: any) => void;
    isDropTarget?: boolean;
    childCount?: number;
}

export const SiteCard = React.memo(function SiteCard({
    site,
    isLoggedIn,
    isDarkMode,
    settings,
    onEdit,
    onDelete,
    onContextMenu,
    isOverlay,
    onFolderClick,
    childCount = 0,
    isDropTarget,
}: SiteCardProps) {
    const isOnline = useOnlineStatus();
    const [iconState, setIconState] = useState(0);
    const [imgSrc, setImgSrc] = useState<string | null>(null);
    const [hasError, setHasError] = useState(false);
    const [imgLoading, setImgLoading] = useState(true);

    // 长按计时器
    const longPressTimer = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        setIconState(0);
        setHasError(false);
        setImgLoading(true);
    }, [site.url, site.iconType, isOnline]);

    useEffect(() => {
        setImgLoading(true);
        if ((site.iconType === 'upload' || site.iconType === 'link') && site.customIconUrl) {
            setImgSrc(site.customIconUrl);
            setHasError(false);
        } else if (site.iconType === 'auto' && site.icon && (site.icon.startsWith('/') || site.icon.startsWith('http'))) {
            setImgSrc(site.icon);
            setHasError(false);
        }
    }, [site.customIconUrl, site.iconType, site.icon]);

    const handleClick = (e: React.MouseEvent) => {
        if (site.type === 'folder') {
            e.preventDefault();
            onFolderClick?.(site);
            return;
        }

        e.preventDefault();
        window.open(site.url, '_blank');
    };

    const handleImageError = () => {
        if (hasError) return;
        setHasError(true);
    };

    // 长按事件处理（手机端编辑）- 文件夹不触发
    const handleTouchStart = (e: React.TouchEvent) => {
        if (site.type === 'folder' || !isLoggedIn) return;
        
        longPressTimer.current = setTimeout(() => {
            onEdit && onEdit();
            if (navigator.vibrate) navigator.vibrate(50);
        }, 500);
    };

    const handleTouchEnd = () => {
        if (longPressTimer.current) {
            clearTimeout(longPressTimer.current);
            longPressTimer.current = null;
        }
    };

    const handleTouchMove = () => {
        if (longPressTimer.current) {
            clearTimeout(longPressTimer.current);
            longPressTimer.current = null;
        }
    };

    const Icon = site.type === 'folder' ? Folder : (ICON_MAP[site.icon] || Globe);
    const brandRgb = hexToRgb(site.color || '#6366f1');
    const bgBase = isDarkMode ? [30, 41, 59] : [255, 255, 255];
    const isWallpaperMode = settings.bgEnabled && (settings.bgType === 'bing' || settings.bgType === 'custom');
    const safeOpacity = settings.glassOpacity / 100;

    const shadowLevel = settings.shadowIntensity ?? 4;
    const isFlat = shadowLevel === 0;
    const shadowMultiplier = shadowLevel / 4;
    const hoverMultiplier = Math.min((shadowMultiplier * 1.5) + 0.2, 2.5);

    let bgColor, borderColor, boxShadow, hoverBoxShadow;

    if (settings.colorfulCards) {
        const mixPercent = settings.colorfulMixRatio ?? 40;
        const opacityPercent = settings.colorfulOpacity ?? 60;
        const mixRatio = mixPercent / 100;
        const overlayOpacity = opacityPercent / 100;
        const gradientAlpha = Math.max(0.1, overlayOpacity - 0.2);

        if (isWallpaperMode) {
            const r = Math.round(bgBase[0] * (1 - mixRatio) + brandRgb.r * mixRatio);
            const g = Math.round(bgBase[1] * (1 - mixRatio) + brandRgb.g * mixRatio);
            const b = Math.round(bgBase[2] * (1 - mixRatio) + brandRgb.b * mixRatio);

            bgColor = `rgba(${r}, ${g}, ${b}, ${Math.max(safeOpacity, 0.8)})`;
            borderColor = `rgba(${brandRgb.r}, ${brandRgb.g}, ${brandRgb.b}, ${isDarkMode ? 0.6 : 0.5})`;
            boxShadow = isFlat ? 'none' : `0 ${8 * shadowMultiplier}px ${32 * shadowMultiplier}px -${8 * shadowMultiplier}px rgba(${brandRgb.r}, ${brandRgb.g}, ${brandRgb.b}, ${0.4 * Math.min(shadowMultiplier, 1.2)})`;
            hoverBoxShadow = isFlat ? 'none' : `0 ${12 * hoverMultiplier}px ${40 * hoverMultiplier}px -${10 * hoverMultiplier}px rgba(${brandRgb.r}, ${brandRgb.g}, ${brandRgb.b}, ${0.5 * Math.min(hoverMultiplier, 1.2)})`;
        } else {
            bgColor = `rgba(${brandRgb.r}, ${brandRgb.g}, ${brandRgb.b}, ${Math.max(safeOpacity, 0.85)})`;
            borderColor = `rgba(${brandRgb.r}, ${brandRgb.g}, ${brandRgb.b}, ${Math.min(safeOpacity + 0.3, 1)})`;
            boxShadow = isFlat ? 'none' : `0 ${8 * shadowMultiplier}px ${32 * shadowMultiplier}px -${8 * shadowMultiplier}px rgba(${brandRgb.r}, ${brandRgb.g}, ${brandRgb.b}, ${0.25 * Math.min(shadowMultiplier, 1.2)})`;
            hoverBoxShadow = isFlat ? 'none' : `0 ${12 * hoverMultiplier}px ${40 * hoverMultiplier}px -${10 * hoverMultiplier}px rgba(${brandRgb.r}, ${brandRgb.g}, ${brandRgb.b}, ${0.35 * Math.min(hoverMultiplier, 1.2)})`;
        }
    } else {
        bgColor = `rgba(${bgBase[0]}, ${bgBase[1]}, ${bgBase[2]}, ${Math.max(safeOpacity, 0.88)})`;
        borderColor = `rgba(${isDarkMode ? '255,255,255' : '0,0,0'}, ${isDarkMode ? 0.15 : 0.08})`;
        boxShadow = isFlat ? 'none' : (isDarkMode
            ? `0 ${8 * shadowMultiplier}px ${32 * shadowMultiplier}px -${8 * shadowMultiplier}px rgba(0,0,0,${0.5 * Math.min(shadowMultiplier, 1)})`
            : `0 ${8 * shadowMultiplier}px ${32 * shadowMultiplier}px -${8 * shadowMultiplier}px rgba(0,0,0,${0.1 * Math.min(shadowMultiplier, 1.5)})`);
        hoverBoxShadow = isFlat ? 'none' : (isDarkMode
            ? `0 ${12 * hoverMultiplier}px ${40 * hoverMultiplier}px -${10 * hoverMultiplier}px rgba(0,0,0,${0.6 * Math.min(hoverMultiplier, 1)})`
            : `0 ${12 * hoverMultiplier}px ${40 * hoverMultiplier}px -${10 * hoverMultiplier}px rgba(0,0,0,${0.15 * Math.min(hoverMultiplier, 1.5)})`);
    }

    let perceivedBg = isDarkMode ? '#1e293b' : '#ffffff';
    let forceWhiteText = false;

    if (isWallpaperMode && settings.glassOpacity < 60) {
        forceWhiteText = true;
    } else if (settings.colorfulCards && (settings.glassOpacity >= 60)) {
        perceivedBg = site.color || '#6366f1';
    }

    const realWidth = settings.cardWidth || 260;
    const cardRef = React.useRef<HTMLAnchorElement>(null);

    const textColor = forceWhiteText ? '#ffffff' : getAccessibleTextColor(perceivedBg);
    const hasShadow = forceWhiteText || shouldUseTextShadow(textColor);

    const height = settings.cardHeight;
    const width = realWidth;

    const isTinyHeight = height < 85;
    const isSmallHeight = height < 110;
    const isTinyWidth = width < 140;
    const isSmallWidth = width < 200;
    const isMicroHeight = height < 60;
    const isMicroWidth = width < 110;

    let iconSizePx = 40;
    let paddingClass = 'p-4';
    let gapClass = 'gap-3';
    let titleSizeBonus = 0;

    if (isMicroHeight || isMicroWidth) {
        iconSizePx = 30;
    } else if (height < 60 || width < 140) {
        iconSizePx = 24;
    } else if (width < 200) {
        iconSizePx = 32;
    } else {
        iconSizePx = 40;
    }

    if (isMicroHeight || isMicroWidth) {
        paddingClass = 'p-1.5 px-2';
        gapClass = 'gap-2';
        titleSizeBonus = -3;
    } else if (height < 85 || width < 140) {
        paddingClass = 'p-2.5';
        gapClass = 'gap-2';
        titleSizeBonus = -2;
    } else if (height < 110 || width < 200) {
        paddingClass = 'p-3';
        gapClass = 'gap-2.5';
        titleSizeBonus = -1;
    } else {
        paddingClass = 'p-4';
        gapClass = 'gap-3';
        titleSizeBonus = 0;
    }

    const { allFonts } = useFonts();
    const resolveFont = (id: string) => {
        if (id === 'system') return undefined;
        return allFonts.find(f => f.id === id)?.family || undefined;
    };

    const titleFontFamily = resolveFont(site.titleFont) || resolveFont(settings.globalTitleFont);
    const descFontFamily = resolveFont(site.descFont) || resolveFont(settings.globalDescFont);

    const titleColorStyle = site.titleColor || settings.globalTitleColor || textColor;
    const descColorStyle = site.descColor || settings.globalDescColor || textColor;
    const titleFontSize = site.titleSize || settings.globalTitleSize;
    const descFontSize = site.descSize || settings.globalDescSize;

    // ============================================================
    // 图标渲染 - 品牌图标优先
    // ============================================================
    let renderIcon;

    // 1. 最高优先级：Iconify 品牌图标
    if (isIconifyIcon(site.icon)) {
        renderIcon = (
            <div className="w-full h-full rounded-xl flex items-center justify-center bg-white dark:bg-slate-700 shadow-md">
                <Icon icon={site.icon} width={iconSizePx * 0.75} height={iconSizePx * 0.75} />
            </div>
        );
    }
    // 2. 自定义上传或链接图标
    else if ((site.iconType === 'upload' || site.iconType === 'link') && site.customIconUrl && !hasError) {
        renderIcon = (
            <div className="w-full h-full rounded-xl overflow-hidden relative">
                {imgLoading && <div className="absolute inset-0 bg-white/5 animate-pulse rounded-xl" />}
                <NextImage
                    key={site.customIconUrl}
                    src={site.customIconUrl}
                    alt={site.name}
                    width={40}
                    height={40}
                    className="object-contain w-full h-full"
                    onLoad={() => setImgLoading(false)}
                    onError={() => { setHasError(true); setImgLoading(false); }}
                    unoptimized={true}
                />
            </div>
        );
    }
    // 3. 自动获取 favicon
    else if (site.iconType === 'auto' && site.url) {
        let currentSrc = '';
        let showImage = false;

        if (!hasError && site.icon && (site.icon.startsWith('/') || site.icon.startsWith('http'))) {
            currentSrc = site.icon;
            showImage = true;
        } else if (isOnline) {
            let providerIndex = iconState;
            if (site.icon && (site.icon.startsWith('/') || site.icon.startsWith('http'))) {
                providerIndex = iconState - 1;
            }
            if (providerIndex >= 0 && providerIndex < FAVICON_PROVIDERS.length) {
                try {
                    const domain = new URL(site.url).hostname;
                    currentSrc = FAVICON_PROVIDERS[providerIndex](domain);
                    showImage = true;
                } catch (e) {}
            }
        }

        if (showImage) {
            renderIcon = (
                <div className="w-full h-full rounded-xl overflow-hidden relative">
                    {imgLoading && <div className="absolute inset-0 bg-white/5 animate-pulse rounded-xl" />}
                    <NextImage
                        key={currentSrc}
                        src={currentSrc}
                        alt={site.name}
                        width={40}
                        height={40}
                        className={`object-contain w-full h-full transition-opacity duration-300 ${imgLoading ? 'opacity-0' : 'opacity-100'}`}
                        onLoad={() => setImgLoading(false)}
                        onError={() => {
                            setHasError(true);
                            setImgLoading(false);
                            setIconState(prev => prev + 1);
                        }}
                        unoptimized={true}
                    />
                </div>
            );
        }
    }

    // 4. 兜底：Lucide 图库图标或首字母
    if (!renderIcon) {
        const firstLetter = site.name ? site.name.charAt(0).toUpperCase() : '?';
        const IconComponent = site.type === 'folder' ? Folder : (ICON_MAP[site.icon] || Globe);
        
        // 判断是否是图库图标或文件夹
        const isLibraryIcon = site.iconType === 'library' || site.type === 'folder';
        
        // ✅ 图标大小不变，背景缩小
        const iconSize = iconSizePx * 0.6;        // 图标保持原来大小
        const containerSize = iconSizePx * 0.7;   // 背景缩小到70%
        
        renderIcon = (
            <div
                className="flex items-center justify-center text-white shadow-md font-bold relative rounded-xl"
                style={{ 
                    backgroundColor: site.color || '#6366f1',
                    width: containerSize,
                    height: containerSize,
                    fontSize: containerSize * 0.4
                }}
            >
                {isLibraryIcon && IconComponent ? <IconComponent size={iconSize} /> : firstLetter}
            </div>
        );
    }

    // Layout Modes
    const isRowLayout = height < 75;
    const isTightLayout = height >= 75 && height <= 90;
    const isStandardLayout = height > 90;

    const showDesc = height > 24;

    const Description = ({ className = '' }: { className?: string }) => (
        <span
            className={`opacity-70 ${hasShadow ? 'text-shadow-sm' : ''} ${className}`}
            style={{
                color: descColorStyle,
                fontFamily: descFontFamily,
                fontSize: descFontSize ? `${descFontSize}px` : undefined,
                maxWidth: isRowLayout ? '50%' : undefined
            }}
        >
            {site.desc}
        </span>
    );

    const showCount = site.type === 'folder' && (childCount || 0) > 0;
    const isShortName = site.name && site.name.length <= 5;

    return (
        <div
            className={`spotlight-card relative h-full overflow-hidden ${isOverlay ? 'shadow-2xl scale-105 cursor-grabbing' : ''}`}
            style={{
                borderRadius: settings.cardRadius ?? 16,
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                ...(isDropTarget && site.type === 'folder' ? {
                    transform: 'scale(1.05)',
                    boxShadow: '0 0 20px rgba(34, 197, 94, 0.5), 0 0 40px rgba(34, 197, 94, 0.3)',
                } : {})
            }}
        >
            <a
                ref={cardRef}
                href={isLoggedIn || isOverlay || site.type === 'folder' ? undefined : site.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleClick}
                onContextMenu={(e) => onContextMenu && onContextMenu(e, site.id)}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                onTouchMove={handleTouchMove}
                title={site.desc || site.name}
                className={`group relative block h-full border transition-all duration-200 overflow-hidden isolate z-10 card-hover-target ${isLoggedIn ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'} ${site.isHidden && isLoggedIn ? 'opacity-50 grayscale' : ''}`}
                style={{
                    height: `var(--mobile-card-height, ${settings.cardHeight}px)`,
                    borderRadius: settings.cardRadius ?? 16,
                    backgroundColor: bgColor,
                    borderColor: borderColor,
                    boxShadow: boxShadow,
                    backdropFilter: 'none',
                    WebkitBackdropFilter: 'none'
                }}
            >
                {settings.colorfulCards && (
                    <div className="absolute inset-0 pointer-events-none"
                        style={{
                            opacity: (settings.colorfulOpacity ?? 60) / 100,
                            background: `linear-gradient(to bottom right, transparent, rgba(${brandRgb.r}, ${brandRgb.g}, ${brandRgb.b}, ${Math.max(0.1, ((settings.colorfulOpacity ?? 60) / 100) - 0.2)}))`
                        }}
                    />
                )}

                <div className={`relative z-10 h-full flex flex-col ${paddingClass} ${isStandardLayout ? 'justify-between' : 'justify-center'}`}>
                    <div className={`flex ${isStandardLayout ? 'items-start' : 'items-center'} justify-between w-full ${gapClass}`}>
                        <div className={`flex items-center ${gapClass} min-w-0 flex-1 overflow-hidden`}>
                            <div className="relative shrink-0" style={{ width: iconSizePx, height: iconSizePx }}>
                                <div className={`w-full h-full rounded-xl overflow-hidden ${site.type === 'folder' ? 'mt-1 ml-1' : ''}`}>
                                    {renderIcon}
                                </div>
                            </div>

                            <div className={`flex min-w-0 overflow-hidden ${isRowLayout ? 'flex-row items-baseline gap-1 sm:gap-2 flex-1' : 'flex-col'} ${isShortName ? 'items-center w-full' : ''}`}>
                                <span
                                    className={`font-bold break-words line-clamp-2 text-xs sm:text-sm md:text-base leading-tight ${hasShadow ? 'text-shadow-sm' : ''} ${isShortName ? 'text-center w-full' : 'text-left'}`}
                                    style={{ color: titleColorStyle, fontFamily: titleFontFamily, fontSize: titleFontSize ? `${titleFontSize}px` : undefined }}
                                    title={site.name}
                                >
                                    {site.name}
                                </span>

                                {showDesc && !isStandardLayout && site.desc && (
                                    <Description className={`truncate text-xs ${isRowLayout ? 'flex-1' : 'mt-0.5'}`} />
                                )}
                            </div>
                        </div>

                        {/* ✅ 三个点：登录后常驻显示，悬停背景加深，文件夹靠上对齐 */}
                        <div className={`flex items-center gap-1 sm:gap-1.5 shrink-0 ${site.type === 'folder' ? 'self-start mt-0.5' : ''}`}>
                            {isLoggedIn ? (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onEdit && onEdit();
                                    }}
                                    className="p-1.5 rounded-lg transition-all active:scale-95 shrink-0 hover:bg-black/10 dark:hover:bg-white/20 text-slate-400 hover:text-slate-700 dark:text-slate-500 dark:hover:text-white"
                                >
                                    <MoreHorizontal size={16} />
                                </button>
                            ) : (
                                <ExternalLink size={14} className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0" style={{ color: textColor }} />
                            )}
                        </div>
                    </div>

                    {showDesc && isStandardLayout && site.desc && (
                        <p className={`text-xs leading-relaxed line-clamp-2 opacity-70 mt-2 ${hasShadow ? 'text-shadow-sm' : ''}`}
                            style={{ color: descColorStyle, fontFamily: descFontFamily, fontSize: descFontSize ? `${descFontSize}px` : undefined }}
                        >
                            {site.desc}
                        </p>
                    )}
                    
                    {/* ✅ 数量角标 - 左上角，背景缩小，数字保持14px */}
                    {site.type === 'folder' && childCount !== undefined && childCount > 0 && (
                        <div className="absolute top-0 left-0 flex items-center justify-center min-w-[20px] h-[20px] px-1 rounded-full text-[14px] font-bold text-white shadow-lg z-20"
                            style={{
                                backgroundColor: site.color || '#6366f1',
                                boxShadow: `0 2px 8px -1px rgba(${brandRgb.r}, ${brandRgb.g}, ${brandRgb.b}, 0.5)`
                            }}>
                            {childCount}
                        </div>
                    )}
                </div>
            </a>
        </div>
    );
});

export const SortableSiteCard = React.memo(function SortableSiteCard({ site, isLoggedIn, ...props }: any) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: site.id,
        disabled: !isLoggedIn
    });
    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : 'auto',
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className="h-full"
        >
            <div
                className="h-full"
                style={{
                    opacity: isDragging ? 0.5 : 1,
                    transition: 'opacity 0.2s ease'
                }}
            >
                <SiteCard site={site} isLoggedIn={isLoggedIn} {...props} />
            </div>
        </div>
    );
});