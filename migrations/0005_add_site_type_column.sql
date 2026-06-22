-- 为 Site 表添加 type 列（支持文件夹类型）
-- 执行方式：在 CF Dashboard > D1 > Console 中粘贴执行
ALTER TABLE Site ADD COLUMN type TEXT NOT NULL DEFAULT 'site';
