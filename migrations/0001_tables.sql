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
