INSERT OR IGNORE INTO GlobalSettings (id, layout, config, theme, searchEngine, bingCacheMode)
VALUES (
  1,
  '{"cardHeight":100,"cardWidth":260,"gridCols":4,"gap":5,"glassOpacity":70,"isWideMode":false,"showWidgets":true,"showNavBar":true,"stickyHeader":true,"stickyFooter":false,"bgEnabled":false,"bgUrl":"","bgType":"bing","bgColor":"#F8FAFC","bgOpacity":40,"fontFamily":"system","bgScale":100,"bgX":50,"bgY":50,"navColorMode":false,"colorfulCards":false,"colorfulMixRatio":40,"colorfulOpacity":60,"fontSizeScale":100,"compactMode":false,"dialogBlur":12,"enableHover":true,"hoverIntensity":1,"enableClick":true,"clickIntensity":1,"enableDrag":true,"dragIntensity":1,"enableStagger":true,"staggerIntensity":1,"enableTabSlide":true,"tabIntensity":1,"enableModalAnim":true,"modalIntensity":1,"shadowIntensity":4,"globalTitleColor":"","globalDescColor":"","globalTitleFont":"system","globalDescFont":"system","globalTitleSize":15,"globalDescSize":12,"widgetStyle":"B"}',
  '{"siteTitle":"极光导航","logoText":"极光","logoHighlight":"导航","logoImage":"/logo.png","footerText":"© {year} JiGuang. Build your own start page.","footerLinks":[{"name":"GitHub","url":"https://github.com"},{"name":"Privacy","url":"#"}],"socialLinks":[{"icon":"github","url":"https://github.com"}],"widgetConfig":{"worldClocks":[{"name":"纽约","timezone":"America/New_York"},{"name":"伦敦","timezone":"Europe/London"},{"name":"东京","timezone":"Asia/Tokyo"}],"pomodoroDuration":25},"htmlConfig":{"header":[],"footer":[],"headerLayout":"column","footerLayout":"column"},"privateMode":false}',
  '{"isDarkMode":false}',
  'Google',
  'keep-all'
);

INSERT OR IGNORE INTO User (username, passwordHash)
VALUES ('admin', '$2b$10$pTSVGUeY0cN.4qSxb4nADulhrBR0TcTS/f0.rV7c4W56kr3Pc2gx.');

INSERT OR IGNORE INTO Category (name, color, "order") VALUES ('学习资源', '#6366F1', 0);
INSERT OR IGNORE INTO Category (name, color, "order") VALUES ('开发工具', '#6366F1', 1);
INSERT OR IGNORE INTO Category (name, color, "order") VALUES ('设计灵感', '#6366F1', 2);
INSERT OR IGNORE INTO Category (name, color, "order") VALUES ('娱乐影音', '#6366F1', 3);
INSERT OR IGNORE INTO Category (name, color, "order") VALUES ('人工智能', '#6366F1', 4);
