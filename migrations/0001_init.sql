-- D1 数据库初始化 Schema
-- 极光导航 (JiGuang Navigation)

-- ========== 核心表 ==========

CREATE TABLE IF NOT EXISTS Site (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  "desc" TEXT,
  category TEXT NOT NULL DEFAULT '',
  color TEXT,
  icon TEXT,
  iconType TEXT,
  customIconUrl TEXT,
  "order" INTEGER NOT NULL DEFAULT 0,
  parentId TEXT,
  isHidden INTEGER NOT NULL DEFAULT 0,
  type TEXT NOT NULL DEFAULT 'site',
  createdAt TEXT NOT NULL DEFAULT (datetime('now')),
  updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS Category (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  name TEXT NOT NULL UNIQUE,
  color TEXT,
  isHidden INTEGER NOT NULL DEFAULT 0,
  "order" INTEGER NOT NULL DEFAULT 0,
  createdAt TEXT NOT NULL DEFAULT (datetime('now')),
  updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS User (
  username TEXT PRIMARY KEY,
  passwordHash TEXT NOT NULL,
  createdAt TEXT NOT NULL DEFAULT (datetime('now')),
  updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS GlobalSettings (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  layout TEXT NOT NULL DEFAULT '{}',
  config TEXT NOT NULL DEFAULT '{}',
  theme TEXT NOT NULL DEFAULT '{}',
  searchEngine TEXT NOT NULL DEFAULT 'Google',
  bingCacheMode TEXT NOT NULL DEFAULT 'keep-all',
  privatePassword TEXT,
  updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS Wallpaper (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  url TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'bing',
  filename TEXT NOT NULL,
  size INTEGER,
  createdAt TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS CustomFont (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  name TEXT NOT NULL,
  family TEXT NOT NULL,
  url TEXT NOT NULL DEFAULT '',
  provider TEXT,
  createdAt TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS Todo (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  text TEXT NOT NULL,
  done INTEGER NOT NULL DEFAULT 0,
  createdAt TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS Countdown (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  label TEXT NOT NULL,
  date TEXT NOT NULL,
  createdAt TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ========== 默认设置 ==========

INSERT OR IGNORE INTO GlobalSettings (id, layout, config, theme, searchEngine, bingCacheMode)
VALUES (
  1,
  '{"cardHeight":100,"cardWidth":260,"gridCols":4,"gap":5,"glassOpacity":70,"isWideMode":false,"showWidgets":true,"showNavBar":true,"stickyHeader":true,"stickyFooter":false,"bgEnabled":false,"bgUrl":"","bgType":"bing","bgColor":"#F8FAFC","bgOpacity":40,"fontFamily":"system","bgScale":100,"bgX":50,"bgY":50,"navColorMode":false,"colorfulCards":false,"colorfulMixRatio":40,"colorfulOpacity":60,"fontSizeScale":100,"compactMode":false,"dialogBlur":12,"enableHover":true,"hoverIntensity":1,"enableClick":true,"clickIntensity":1,"enableDrag":true,"dragIntensity":1,"enableStagger":true,"staggerIntensity":1,"enableTabSlide":true,"tabIntensity":1,"enableModalAnim":true,"modalIntensity":1,"shadowIntensity":4,"globalTitleColor":"","globalDescColor":"","globalTitleFont":"system","globalDescFont":"system","globalTitleSize":15,"globalDescSize":12,"widgetStyle":"B"}',
  '{"siteTitle":"极光导航","logoText":"极光","logoHighlight":"导航","logoImage":"/logo.png","footerText":"© {year} JiGuang. Build your own start page.","footerLinks":[{"name":"GitHub","url":"https://github.com"},{"name":"Privacy","url":"#"}],"socialLinks":[{"icon":"github","url":"https://github.com"}],"widgetConfig":{"worldClocks":[{"name":"纽约","timezone":"America/New_York"},{"name":"伦敦","timezone":"Europe/London"},{"name":"东京","timezone":"Asia/Tokyo"}],"pomodoroDuration":25},"htmlConfig":{"header":[],"footer":[],"headerLayout":"column","footerLayout":"column"},"privateMode":false}',
  '{"isDarkMode":false}',
  'Google',
  'keep-all'
);

-- 默认管理员 (admin / 123456)
INSERT OR IGNORE INTO User (username, passwordHash)
VALUES ('admin', '$2b$10$pTSVGUeY0cN.4qSxb4nADulhrBR0TcTS/f0.rV7c4W56kr3Pc2gx.');

-- ========== 分类种子数据 ==========

INSERT OR IGNORE INTO Category (name, color, "order") VALUES ('学习资源', '#6366F1', 0);
INSERT OR IGNORE INTO Category (name, color, "order") VALUES ('开发工具', '#6366F1', 1);
INSERT OR IGNORE INTO Category (name, color, "order") VALUES ('设计灵感', '#6366F1', 2);
INSERT OR IGNORE INTO Category (name, color, "order") VALUES ('娱乐影音', '#6366F1', 3);
INSERT OR IGNORE INTO Category (name, color, "order") VALUES ('人工智能', '#6366F1', 4);

-- ========== 站点种子数据 ==========

-- 学习资源
INSERT OR IGNORE INTO Site (id, name, url, "desc", category, color, icon, iconType, "order") VALUES ('1', 'Google', 'https://google.com', '全球最大的搜索引擎。', '学习资源', '#4285F4', 'Globe', 'auto', 0);
INSERT OR IGNORE INTO Site (id, name, url, "desc", category, color, icon, iconType, "order") VALUES ('9', 'MDN', 'https://developer.mozilla.org', 'Web 开发技术权威文档。', '学习资源', '#000000', 'BookOpen', 'auto', 0);
INSERT OR IGNORE INTO Site (id, name, url, "desc", category, color, icon, iconType, "order") VALUES ('14', 'Stack Overflow', 'https://stackoverflow.com', '程序员问答社区。', '学习资源', '#F48024', 'Code', 'auto', 0);
INSERT OR IGNORE INTO Site (id, name, url, "desc", category, color, icon, iconType, "order") VALUES ('101', '掘金', 'https://juejin.cn', '帮助开发者成长的社区。', '学习资源', '#1E80FF', 'BookOpen', 'auto', 0);
INSERT OR IGNORE INTO Site (id, name, url, "desc", category, color, icon, iconType, "order") VALUES ('102', '知乎', 'https://www.zhihu.com', '有问题，就会有答案。', '学习资源', '#0084FF', 'MessageSquare', 'auto', 0);
INSERT OR IGNORE INTO Site (id, name, url, "desc", category, color, icon, iconType, "order") VALUES ('103', 'FreeCodeCamp', 'https://www.freecodecamp.org', '免费学习编程的开源社区。', '学习资源', '#0A0A23', 'Code', 'auto', 0);
INSERT OR IGNORE INTO Site (id, name, url, "desc", category, color, icon, iconType, "order") VALUES ('104', 'LeetCode', 'https://leetcode.cn', '海量编程算法题库。', '学习资源', '#FFA116', 'Code', 'auto', 0);
INSERT OR IGNORE INTO Site (id, name, url, "desc", category, color, icon, iconType, "order") VALUES ('105', 'Wikipedia', 'https://www.wikipedia.org', '自由的百科全书。', '学习资源', '#636466', 'Globe', 'auto', 0);
INSERT OR IGNORE INTO Site (id, name, url, "desc", category, color, icon, iconType, "order") VALUES ('106', 'Coursera', 'https://www.coursera.org', '世界顶级在线课程平台。', '学习资源', '#0056D2', 'BookOpen', 'auto', 0);
INSERT OR IGNORE INTO Site (id, name, url, "desc", category, color, icon, iconType, "order") VALUES ('107', 'TED', 'https://www.ted.com', '传播有价值的思想。', '学习资源', '#E62B1E', 'Monitor', 'auto', 0);
INSERT OR IGNORE INTO Site (id, name, url, "desc", category, color, icon, iconType, "order") VALUES ('108', 'CSDN', 'https://www.csdn.net', '专业开发者社区。', '学习资源', '#FC5531', 'Code', 'auto', 0);
INSERT OR IGNORE INTO Site (id, name, url, "desc", category, color, icon, iconType, "order") VALUES ('109', 'InfoQ', 'https://www.infoq.cn', '促进软件开发领域知识与创新。', '学习资源', '#1D8955', 'BookOpen', 'auto', 0);

-- 开发工具
INSERT OR IGNORE INTO Site (id, name, url, "desc", category, color, icon, iconType, "order") VALUES ('2', 'GitHub', 'https://github.com', '全球最大的开源社区。', '开发工具', '#181717', 'Github', 'auto', 0);
INSERT OR IGNORE INTO Site (id, name, url, "desc", category, color, icon, iconType, "order") VALUES ('6', 'React', 'https://react.dev', '构建用户界面的库。', '开发工具', '#61DAFB', 'Code', 'auto', 0);
INSERT OR IGNORE INTO Site (id, name, url, "desc", category, color, icon, iconType, "order") VALUES ('10', 'Vercel', 'https://vercel.com', '前端部署与托管平台。', '开发工具', '#000000', 'Code', 'auto', 0);
INSERT OR IGNORE INTO Site (id, name, url, "desc", category, color, icon, iconType, "order") VALUES ('201', 'Vue.js', 'https://vuejs.org', '渐进式 JavaScript 框架。', '开发工具', '#4FC08D', 'Code', 'auto', 0);
INSERT OR IGNORE INTO Site (id, name, url, "desc", category, color, icon, iconType, "order") VALUES ('202', 'Tailwind CSS', 'https://tailwindcss.com', '原子化 CSS 框架。', '开发工具', '#06B6D4', 'Palette', 'auto', 0);
INSERT OR IGNORE INTO Site (id, name, url, "desc", category, color, icon, iconType, "order") VALUES ('203', 'Next.js', 'https://nextjs.org', 'React 生产环境框架。', '开发工具', '#000000', 'Code', 'auto', 0);
INSERT OR IGNORE INTO Site (id, name, url, "desc", category, color, icon, iconType, "order") VALUES ('204', 'Docker', 'https://www.docker.com', '应用容器引擎。', '开发工具', '#2496ED', 'Code', 'auto', 0);
INSERT OR IGNORE INTO Site (id, name, url, "desc", category, color, icon, iconType, "order") VALUES ('205', 'TypeScript', 'https://www.typescriptlang.org', '具有类型语法的 JavaScript。', '开发工具', '#3178C6', 'Code', 'auto', 0);
INSERT OR IGNORE INTO Site (id, name, url, "desc", category, color, icon, iconType, "order") VALUES ('206', 'GitLab', 'https://gitlab.com', 'DevOps 生命周期工具。', '开发工具', '#FC6D26', 'Github', 'auto', 0);
INSERT OR IGNORE INTO Site (id, name, url, "desc", category, color, icon, iconType, "order") VALUES ('207', 'Postman', 'https://www.postman.com', 'API 开发协作平台。', '开发工具', '#FF6C37', 'Zap', 'auto', 0);
INSERT OR IGNORE INTO Site (id, name, url, "desc", category, color, icon, iconType, "order") VALUES ('208', 'NPM', 'https://www.npmjs.com', 'Node.js 包管理器。', '开发工具', '#CB3837', 'Code', 'auto', 0);
INSERT OR IGNORE INTO Site (id, name, url, "desc", category, color, icon, iconType, "order") VALUES ('209', 'Cloudflare', 'https://www.cloudflare.com', 'Web 性能和安全公司。', '开发工具', '#F38020', 'Cloud', 'auto', 0);

-- 设计灵感
INSERT OR IGNORE INTO Site (id, name, url, "desc", category, color, icon, iconType, "order") VALUES ('4', 'Dribbble', 'https://dribbble.com', '设计师灵感分享社区。', '设计灵感', '#EA4C89', 'ImageIcon', 'auto', 0);
INSERT OR IGNORE INTO Site (id, name, url, "desc", category, color, icon, iconType, "order") VALUES ('7', 'Figma', 'https://figma.com', '在线协作界面设计工具。', '设计灵感', '#F24E1E', 'Palette', 'auto', 0);
INSERT OR IGNORE INTO Site (id, name, url, "desc", category, color, icon, iconType, "order") VALUES ('301', 'Behance', 'https://www.behance.net', '展示和发现创意作品。', '设计灵感', '#1769FF', 'ImageIcon', 'auto', 0);
INSERT OR IGNORE INTO Site (id, name, url, "desc", category, color, icon, iconType, "order") VALUES ('302', 'Pinterest', 'https://www.pinterest.com', '发现图片与灵感。', '设计灵感', '#BD081C', 'ImageIcon', 'auto', 0);
INSERT OR IGNORE INTO Site (id, name, url, "desc", category, color, icon, iconType, "order") VALUES ('303', 'Unsplash', 'https://unsplash.com', '免费高清素材图片。', '设计灵感', '#000000', 'ImageIcon', 'auto', 0);
INSERT OR IGNORE INTO Site (id, name, url, "desc", category, color, icon, iconType, "order") VALUES ('304', 'Pexels', 'https://www.pexels.com', '免费素材图片和视频。', '设计灵感', '#05A081', 'ImageIcon', 'auto', 0);
INSERT OR IGNORE INTO Site (id, name, url, "desc", category, color, icon, iconType, "order") VALUES ('305', 'IconFont', 'https://www.iconfont.cn', '阿里巴巴矢量图标库。', '设计灵感', '#EC4899', 'Palette', 'auto', 0);
INSERT OR IGNORE INTO Site (id, name, url, "desc", category, color, icon, iconType, "order") VALUES ('306', 'Awwwards', 'https://www.awwwards.com', '网页设计与创新奖项。', '设计灵感', '#222222', 'Globe', 'auto', 0);
INSERT OR IGNORE INTO Site (id, name, url, "desc", category, color, icon, iconType, "order") VALUES ('307', 'Material Design', 'https://m3.material.io', 'Google 开源设计系统。', '设计灵感', '#7C4DFF', 'Palette', 'auto', 0);
INSERT OR IGNORE INTO Site (id, name, url, "desc", category, color, icon, iconType, "order") VALUES ('308', 'Coolors', 'https://coolors.co', '超快速的配色生成器。', '设计灵感', '#0066FF', 'Palette', 'auto', 0);
INSERT OR IGNORE INTO Site (id, name, url, "desc", category, color, icon, iconType, "order") VALUES ('309', 'Google Fonts', 'https://fonts.google.com', '免费开源字体库。', '设计灵感', '#4285F4', 'BookOpen', 'auto', 0);
INSERT OR IGNORE INTO Site (id, name, url, "desc", category, color, icon, iconType, "order") VALUES ('310', 'Canva', 'https://www.canva.com', '在线平面设计工具。', '设计灵感', '#00C4CC', 'Palette', 'auto', 0);

-- 娱乐影音
INSERT OR IGNORE INTO Site (id, name, url, "desc", category, color, icon, iconType, "order") VALUES ('3', 'Bilibili', 'https://bilibili.com', '二次元与年轻人的聚集地。', '娱乐影音', '#00AEEC', 'Youtube', 'auto', 0);
INSERT OR IGNORE INTO Site (id, name, url, "desc", category, color, icon, iconType, "order") VALUES ('401', 'YouTube', 'https://www.youtube.com', '全球最大的视频网站。', '娱乐影音', '#FF0000', 'Youtube', 'auto', 0);
INSERT OR IGNORE INTO Site (id, name, url, "desc", category, color, icon, iconType, "order") VALUES ('402', 'Netflix', 'https://www.netflix.com', '流媒体影视巨头。', '娱乐影音', '#E50914', 'Monitor', 'auto', 0);
INSERT OR IGNORE INTO Site (id, name, url, "desc", category, color, icon, iconType, "order") VALUES ('403', 'Spotify', 'https://open.spotify.com', '数字音乐流媒体服务。', '娱乐影音', '#1DB954', 'Music', 'auto', 0);
INSERT OR IGNORE INTO Site (id, name, url, "desc", category, color, icon, iconType, "order") VALUES ('404', 'Steam', 'https://store.steampowered.com', '全球最大的游戏平台。', '娱乐影音', '#171A21', 'Gamepad', 'auto', 0);
INSERT OR IGNORE INTO Site (id, name, url, "desc", category, color, icon, iconType, "order") VALUES ('405', 'Twitch', 'https://www.twitch.tv', '游戏直播平台。', '娱乐影音', '#9146FF', 'Gamepad', 'auto', 0);
INSERT OR IGNORE INTO Site (id, name, url, "desc", category, color, icon, iconType, "order") VALUES ('406', '豆瓣', 'https://www.douban.com', '电影书籍音乐评分。', '娱乐影音', '#007722', 'BookOpen', 'auto', 0);
INSERT OR IGNORE INTO Site (id, name, url, "desc", category, color, icon, iconType, "order") VALUES ('407', '网易云音乐', 'https://music.163.com', '专注于发现与分享。', '娱乐影音', '#C20C0C', 'Music', 'auto', 0);
INSERT OR IGNORE INTO Site (id, name, url, "desc", category, color, icon, iconType, "order") VALUES ('408', 'Epic Games', 'https://store.epicgames.com', '每周免费送游戏。', '娱乐影音', '#313131', 'Gamepad', 'auto', 0);
INSERT OR IGNORE INTO Site (id, name, url, "desc", category, color, icon, iconType, "order") VALUES ('409', 'Discord', 'https://discord.com', '游戏玩家语音聊天软件。', '娱乐影音', '#5865F2', 'MessageSquare', 'auto', 0);
INSERT OR IGNORE INTO Site (id, name, url, "desc", category, color, icon, iconType, "order") VALUES ('410', '微博', 'https://weibo.com', '随时随地发现新鲜事。', '娱乐影音', '#E6162D', 'Globe', 'auto', 0);
INSERT OR IGNORE INTO Site (id, name, url, "desc", category, color, icon, iconType, "order") VALUES ('411', 'Apple Music', 'https://music.apple.com', '苹果音乐流媒体。', '娱乐影音', '#FA243C', 'Music', 'auto', 0);

-- 人工智能
INSERT OR IGNORE INTO Site (id, name, url, "desc", category, color, icon, iconType, "order") VALUES ('5', 'ChatGPT', 'https://chat.openai.com', 'OpenAI开发的智能对话模型。', '人工智能', '#10A37F', 'Coffee', 'auto', 0);
INSERT OR IGNORE INTO Site (id, name, url, "desc", category, color, icon, iconType, "order") VALUES ('12', 'Midjourney', 'https://midjourney.com', 'AI 图像生成工具。', '人工智能', '#000000', 'ImageIcon', 'auto', 0);
INSERT OR IGNORE INTO Site (id, name, url, "desc", category, color, icon, iconType, "order") VALUES ('501', 'Claude', 'https://claude.ai', 'Anthropic 开发的 AI 助手。', '人工智能', '#D97757', 'Coffee', 'auto', 0);
INSERT OR IGNORE INTO Site (id, name, url, "desc", category, color, icon, iconType, "order") VALUES ('502', 'Gemini', 'https://gemini.google.com', 'Google 最强多模态模型。', '人工智能', '#4E88F9', 'Coffee', 'auto', 0);
INSERT OR IGNORE INTO Site (id, name, url, "desc", category, color, icon, iconType, "order") VALUES ('503', 'Hugging Face', 'https://huggingface.co', 'AI 模型开源社区。', '人工智能', '#FFD21E', 'Code', 'auto', 0);
INSERT OR IGNORE INTO Site (id, name, url, "desc", category, color, icon, iconType, "order") VALUES ('504', 'Poe', 'https://poe.com', 'Quora 推出的 AI 聚合平台。', '人工智能', '#4C32CC', 'MessageSquare', 'auto', 0);
INSERT OR IGNORE INTO Site (id, name, url, "desc", category, color, icon, iconType, "order") VALUES ('505', 'Perplexity', 'https://www.perplexity.ai', 'AI 驱动的搜索引擎。', '人工智能', '#115E59', 'Search', 'auto', 0);
INSERT OR IGNORE INTO Site (id, name, url, "desc", category, color, icon, iconType, "order") VALUES ('506', 'Notion AI', 'https://www.notion.so', '集成在笔记中的 AI 助手。', '人工智能', '#000000', 'BookOpen', 'auto', 0);
INSERT OR IGNORE INTO Site (id, name, url, "desc", category, color, icon, iconType, "order") VALUES ('507', 'Civitai', 'https://civitai.com', 'Stable Diffusion 模型库。', '人工智能', '#2A6DE9', 'ImageIcon', 'auto', 0);
INSERT OR IGNORE INTO Site (id, name, url, "desc", category, color, icon, iconType, "order") VALUES ('508', 'Runway', 'https://runwayml.com', 'AI 视频编辑与生成。', '人工智能', '#000000', 'Monitor', 'auto', 0);
INSERT OR IGNORE INTO Site (id, name, url, "desc", category, color, icon, iconType, "order") VALUES ('509', '通义千问', 'https://tongyi.aliyun.com', '阿里巴巴大语言模型。', '人工智能', '#6236FF', 'Coffee', 'auto', 0);
INSERT OR IGNORE INTO Site (id, name, url, "desc", category, color, icon, iconType, "order") VALUES ('510', '文心一言', 'https://yiyan.baidu.com', '百度新一代知识增强大模型。', '人工智能', '#2932E1', 'Coffee', 'auto', 0);
