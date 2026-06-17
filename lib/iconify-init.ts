// 预加载品牌图标数据到 Iconify 运行时
// 这样图标渲染不需要外部 CDN，直接从本地数据读取
import { addCollection, type IconifyJSON } from '@iconify/react';
import logosData from '@iconify/json/json/logos.json';
import simpleIconsData from '@iconify/json/json/simple-icons.json';
import materialSymbolsData from '@iconify/json/json/material-symbols.json';

addCollection(logosData as unknown as IconifyJSON);
addCollection(simpleIconsData as unknown as IconifyJSON);
addCollection(materialSymbolsData as unknown as IconifyJSON);
