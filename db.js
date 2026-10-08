// SQLite 연결, 테이블 생성, 비어 있으면 seed 실행
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const Database = require('better-sqlite3');
const seed = require('./seed');

const DB_FILE = process.env.FISHDEX_DB || path.join(__dirname, 'data', 'fishdex.db');
const UPLOAD_DIR = path.join(__dirname, 'uploads');
fs.mkdirSync(path.dirname(DB_FILE), { recursive: true });
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const db = new Database(DB_FILE);
db.pragma('journal_mode = WAL');

db.exec(`
CREATE TABLE IF NOT EXISTS species (
  id INTEGER PRIMARY KEY, name TEXT NOT NULL, en TEXT, hab TEXT, rar TEXT,
  avg INTEGER, "desc" TEXT, desc_en TEXT, art_json TEXT
);
CREATE TABLE IF NOT EXISTS spots (
  name TEXT PRIMARY KEY, name_en TEXT, lat REAL NOT NULL, lon REAL NOT NULL
);
CREATE TABLE IF NOT EXISTS catches (
  id INTEGER PRIMARY KEY AUTOINCREMENT, user TEXT NOT NULL, species_id INTEGER NOT NULL,
  length_cm INTEGER NOT NULL, spot TEXT, lat REAL NOT NULL, lon REAL NOT NULL,
  caught_on TEXT NOT NULL, memo TEXT, photo_url TEXT, created_at TEXT
);
CREATE TABLE IF NOT EXISTS users (
  name TEXT PRIMARY KEY, pw_hash TEXT NOT NULL, created_at TEXT
);
CREATE TABLE IF NOT EXISTS sessions (
  token TEXT PRIMARY KEY, user TEXT NOT NULL, created_at TEXT
);
`);

// 예전 DB 파일에 영어 컬럼이 없으면 추가
const hasCol = (t, c) => db.prepare(`PRAGMA table_info(${t})`).all().some(r => r.name === c);
if (!hasCol('species', 'desc_en')) db.exec('ALTER TABLE species ADD COLUMN desc_en TEXT');
if (!hasCol('spots', 'name_en')) db.exec('ALTER TABLE spots ADD COLUMN name_en TEXT');

/* ---------- 비밀번호 (Node 내장 scrypt) ---------- */
function hashPw(pw) {
  const salt = crypto.randomBytes(16).toString('hex');
  return salt + ':' + crypto.scryptSync(pw, salt, 32).toString('hex');
}
function checkPw(pw, stored) {
  const [salt, h] = String(stored).split(':');
  if (!salt || !h) return false;
  const a = Buffer.from(h, 'hex'), b = crypto.scryptSync(pw, salt, 32);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

/* ---------- seed ---------- */
// 어종·포인트는 기준 데이터라 서버를 켤 때마다 seed.js 내용으로 맞춘다 (일러스트 수정이 바로 반영되도록)
const syncReference = db.transaction(() => {
  const upSp = db.prepare(`INSERT INTO species (id, name, en, hab, rar, avg, "desc", desc_en, art_json) VALUES (?,?,?,?,?,?,?,?,?)
    ON CONFLICT(id) DO UPDATE SET name=excluded.name, en=excluded.en, hab=excluded.hab, rar=excluded.rar, avg=excluded.avg,
      "desc"=excluded."desc", desc_en=excluded.desc_en, art_json=excluded.art_json`);
  for (const s of seed.SPECIES) upSp.run(s.id, s.name, s.en, s.hab, s.rar, s.avg, s.desc, s.descEn, JSON.stringify(s.art));
  const upSpot = db.prepare(`INSERT INTO spots (name, name_en, lat, lon) VALUES (?,?,?,?)
    ON CONFLICT(name) DO UPDATE SET name_en=excluded.name_en, lat=excluded.lat, lon=excluded.lon`);
  for (const p of seed.SPOTS) upSpot.run(p.n, p.en, p.lat, p.lon);
});

// sessions는 비우지 않는다: 시연 중 Shift+R을 눌러도 로그인이 유지되도록
const fillSeed = db.transaction(() => {
  db.exec(`DELETE FROM catches; DELETE FROM species; DELETE FROM spots; DELETE FROM users;
           DELETE FROM sqlite_sequence WHERE name = 'catches';`);
  syncReference();
  const insCatch = db.prepare(`INSERT INTO catches (id, user, species_id, length_cm, spot, lat, lon, caught_on, memo, photo_url, created_at)
                               VALUES (?,?,?,?,?,?,?,?,?,NULL,?)`);
  for (const c of seed.seedCatches()) insCatch.run(c.id, c.user, c.sid, c.len, c.spot, c.lat, c.lon, c.date, c.memo, c.date);
  const insUser = db.prepare('INSERT INTO users (name, pw_hash, created_at) VALUES (?,?,?)');
  const now = new Date().toISOString();
  for (const u of seed.USERS) insUser.run(u, hashPw(seed.DEMO_PASSWORD), now);
});

function clearUploads() {
  for (const f of fs.readdirSync(UPLOAD_DIR)) if (f !== '.gitkeep') fs.rmSync(path.join(UPLOAD_DIR, f), { force: true });
}

function resetDemo() { fillSeed(); clearUploads(); }

if (db.prepare('SELECT COUNT(*) AS n FROM species').get().n === 0) fillSeed();
else syncReference();

module.exports = { db, DB_FILE, UPLOAD_DIR, hashPw, checkPw, fillSeed, resetDemo };
