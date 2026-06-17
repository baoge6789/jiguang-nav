/**
 * 壁纸/图标 URL 处理（CF 环境简化版）
 * 所有资源使用外部 URL，不做本地文件存储
 *
 * @param url - 原始 URL
 * @returns 处理后的 URL
 */
export function getUploadUrl(url: string | undefined | null): string {
    if (!url) return '';

    // 外部 URL 直接返回
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
        return url;
    }

    // 移除旧的 /api/uploads/ 前缀（已不再使用）
    if (url.startsWith('/api/uploads/')) {
        return url.replace('/api/uploads/', '');
    }

    // 其他路径原样返回
    return url;
}

/**
 * 检查是否是上传路径
 */
export function isUploadPath(url: string | undefined | null): boolean {
    if (!url) return false;
    return url.startsWith('/uploads/') || url.startsWith('/api/uploads/');
}
