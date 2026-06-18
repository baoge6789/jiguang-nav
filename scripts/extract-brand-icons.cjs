// 从 @iconify/json 中提取 BRAND_ICONS 使用的图标数据
// 运行: node scripts/extract-brand-icons.js

const fs = require('fs');
const path = require('path');

const BRAND_ICONS = [
  'logos:google-icon', 'logos:github-icon', 'logos:apple', 'logos:microsoft-icon',
  'logos:twitter', 'logos:telegram', 'logos:whatsapp-icon', 'logos:discord-icon',
  'logos:youtube-icon', 'logos:spotify-icon', 'logos:twitch', 'simple-icons:bilibili',
  'logos:react', 'logos:vue', 'logos:nodejs-icon', 'logos:python',
  'logos:typescript-icon', 'logos:javascript', 'logos:docker-icon', 'logos:tailwindcss-icon',
  'logos:figma', 'logos:notion-icon', 'logos:cloudflare-icon', 'logos:vercel-icon',
  'logos:netlify-icon', 'logos:aws', 'logos:google-cloud', 'logos:azure-icon',
  'logos:openai', 'logos:openai-icon', 'logos:anthropic-icon', 'logos:reddit-icon',
  'logos:linkedin-icon', 'logos:medium-icon', 'logos:slack-icon', 'logos:instagram-icon',
  'logos:tiktok-icon', 'logos:pinterest', 'logos:dribbble-icon', 'simple-icons:zhihu',
  'simple-icons:wechat', 'simple-icons:alipay', 'simple-icons:douban',
  'logos:nginx', 'logos:redis', 'logos:postgresql', 'logos:mysql',
  'logos:mongodb-icon', 'logos:linux-tux',
];

// Group by prefix
const grouped = {};
for (const icon of BRAND_ICONS) {
  const [prefix, name] = icon.split(':');
  if (!grouped[prefix]) grouped[prefix] = [];
  grouped[prefix].push(name);
}

const collections = {};

for (const [prefix, names] of Object.entries(grouped)) {
  const jsonPath = path.join(__dirname, '..', 'node_modules', '@iconify', 'json', 'json', `${prefix}.json`);
  const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  
  const icons = {};
  for (const name of names) {
    if (data.icons[name]) {
      icons[name] = data.icons[name];
    } else {
      console.warn(`WARNING: ${prefix}:${name} not found!`);
    }
  }
  
  collections[prefix] = {
    prefix: data.prefix,
    icons,
    width: data.width,
    height: data.height,
  };
}

// Output as TypeScript
const output = `// 品牌图标精简数据（由 scripts/extract-brand-icons.js 自动生成）
// 仅包含 EditModal 中 BRAND_ICONS 使用的 ${BRAND_ICONS.length} 个图标
import { addCollection, type IconifyJSON } from '@iconify/react';

const collections: Record<string, IconifyJSON> = ${JSON.stringify(collections, null, 2)} as any;

for (const key of Object.keys(collections)) {
  addCollection(collections[key]);
}
`;

fs.writeFileSync(path.join(__dirname, '..', 'lib', 'iconify-init.ts'), output, 'utf8');
console.log(`Done! Extracted ${BRAND_ICONS.length} icons from ${Object.keys(grouped).length} collections.`);
console.log(`Output: lib/iconify-init.ts`);

// Show size comparison
const oldSize = 7448149 + 4758299 + 8465841;
const newSize = fs.statSync(path.join(__dirname, '..', 'lib', 'iconify-init.ts')).size;
console.log(`Size: ${(oldSize/1024/1024).toFixed(1)}MB → ${(newSize/1024).toFixed(1)}KB`);
