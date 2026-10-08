const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const express = require('express');
const multer = require('multer');
const { db, UPLOAD_DIR, hashPw, checkPw, resetDemo } = require('../db');
const { jit } = require('../seed');
const Progress = require('../progress');
const { localize } = require('../messages');

const router = express.Router();

/* ---------- 공통 ---------- */
const SESSION_COOKIE = 'fishdex_sid';
const SESSION_DAYS = 7;

let speciesCache = null;
function allSpecies() {
  if (!speciesCache) {
    speciesCache = db.prepare('SELECT * FROM species ORDER BY id').all().map(r => ({
      id: r.id, name: r.name, en: r.en, hab: r.hab, rar: r.rar, avg: r.avg, desc: r.desc, descEn: r.desc_en, ...JSON.parse(r.art_json),
    }));
  }
  return speciesCache;
}
const sp = id => allSpecies().find(s => s.id === id);
const spotByName = name => db.prepare('SELECT name AS n, lat, lon FROM spots WHERE name = ?').get(name);

const toCatch = r => ({
  id: r.id, user: r.user, sid: r.species_id, len: r.length_cm, spot: r.spot,
  lat: r.lat, lon: r.lon, date: r.caught_on, memo: r.memo || '', photo: r.photo_url,
});
const userCatches = user => db.prepare('SELECT * FROM catches WHERE user = ?').all(user).map(toCatch);
const statsOf = user => Progress.userStats(userCatches(user), user, sp);

const bad = (res, msg, code = 400) => res.status(code).json({ error: localize(res.req, msg) });

function removeUpload(url) {
  if (!url || !url.startsWith('/uploads/')) return;
  fs.rm(path.join(UPLOAD_DIR, path.basename(url)), { force: true }, () => {});
}

/* ---------- 세션 (쿠키 + sessions 테이블) ---------- */
function readCookie(req, name) {
  const m = (req.headers.cookie || '').split(';').map(s => s.trim()).find(s => s.startsWith(name + '='));
  return m ? decodeURIComponent(m.slice(name.length + 1)) : null;
}
function startSession(res, user) {
  const token = crypto.randomBytes(24).toString('hex');
  db.prepare('INSERT INTO sessions (token, user, created_at) VALUES (?,?,?)').run(token, user, new Date().toISOString());
  res.cookie(SESSION_COOKIE, token, { httpOnly: true, sameSite: 'lax', maxAge: SESSION_DAYS * 864e5 });
}
// 쿠키 → req.user (세션이 있어도 유저가 지워졌으면 비로그인 취급)
router.use((req, res, next) => {
  const token = readCookie(req, SESSION_COOKIE);
  if (token) {
    const row = db.prepare(`SELECT s.user FROM sessions s JOIN users u ON u.name = s.user WHERE s.token = ?`).get(token);
    if (row) req.user = row.user;
  }
  next();
});
function requireUser(req, res, next) {
  if (!req.user) return bad(res, '로그인이 필요해요.', 401);
  next();
}

/* ---------- 업로드 ---------- */
const imageOnly = (req, file, cb) => cb(null, /^image\//.test(file.mimetype));
const limits = { fileSize: 10 * 1024 * 1024 };
const uploadPhoto = multer({
  storage: multer.diskStorage({
    destination: UPLOAD_DIR,
    filename: (req, file, cb) => {
      const ext = (path.extname(file.originalname) || '.jpg').toLowerCase().replace(/[^.a-z0-9]/g, '');
      cb(null, `${Date.now()}-${crypto.randomBytes(4).toString('hex')}${ext}`);
    },
  }),
  fileFilter: imageOnly, limits,
}).single('photo');
const identifyPhoto = multer({ storage: multer.memoryStorage(), fileFilter: imageOnly, limits }).single('photo');
// multer 에러(용량 초과 등)도 한국어 메시지로
const withUpload = mw => (req, res, next) => mw(req, res, err => (err ? bad(res, '사진은 10MB 이하 이미지만 올릴 수 있어요.') : next()));

/* ---------- 인증 ---------- */
router.post('/login', (req, res) => {
  const name = String(req.body?.name || '').trim(), pw = String(req.body?.password || '');
  const u = db.prepare('SELECT * FROM users WHERE name = ?').get(name);
  if (!u || !checkPw(pw, u.pw_hash)) return bad(res, '닉네임 또는 비밀번호가 맞지 않아요.', 401);
  startSession(res, u.name);
  res.json({ user: u.name });
});

router.post('/signup', (req, res) => {
  const name = String(req.body?.name || '').trim(), pw = String(req.body?.password || '');
  if (name.length < 2 || name.length > 12) return bad(res, '닉네임은 2~12자로 정해 주세요.');
  if (pw.length < 4) return bad(res, '비밀번호는 4자 이상이어야 해요.');
  if (db.prepare('SELECT 1 FROM users WHERE name = ?').get(name)) return bad(res, '이미 사용 중인 닉네임이에요.', 409);
  db.prepare('INSERT INTO users (name, pw_hash, created_at) VALUES (?,?,?)').run(name, hashPw(pw), new Date().toISOString());
  startSession(res, name);
  res.status(201).json({ user: name });
});

router.post('/logout', (req, res) => {
  const token = readCookie(req, SESSION_COOKIE);
  if (token) db.prepare('DELETE FROM sessions WHERE token = ?').run(token);
  res.clearCookie(SESSION_COOKIE);
  res.json({ ok: true });
});

/* ---------- 조회 (Read) ---------- */
router.get('/species', (req, res) => res.json(allSpecies()));

router.get('/spots', (req, res) => res.json(db.prepare('SELECT name AS n, name_en AS en, lat, lon FROM spots').all()));

router.get('/catches', (req, res) => {
  const sid = +req.query.sid;
  const rows = sid
    ? db.prepare('SELECT * FROM catches WHERE species_id = ? ORDER BY id').all(sid)
    : db.prepare('SELECT * FROM catches ORDER BY id').all();
  res.json(rows.map(toCatch));
});

router.get('/me', requireUser, (req, res) => {
  res.json({ user: req.user, ...Progress.summary(statsOf(req.user), sp) });
});

/* ---------- 어종 판별 (프로토타입: 참돔 1순위 고정 응답) ---------- */
const DEMO_RESULT = [{ sid: 2, p: 94 }, { sid: 1, p: 4 }, { sid: 8, p: 2 }];
router.post('/identify', withUpload(identifyPhoto), (req, res) => {
  if (!req.file) return bad(res, '판별할 사진을 올려 주세요.');
  const delay = 800 + Math.random() * 400; // 스캔 애니메이션이 보이도록
  setTimeout(() => res.json(DEMO_RESULT), delay);
});

/* ---------- 등록 (Create) ---------- */
function validate({ sid, len, date }) {
  if (!Number.isInteger(sid) || sid < 1 || sid > 20) return '어종을 선택해 주세요.';
  if (!Number.isFinite(len) || len < 1 || len > 300) return '길이는 1~300cm 사이로 입력해 주세요.';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date || '')) return '날짜를 입력해 주세요.';
  return null;
}

router.post('/catches', requireUser, withUpload(uploadPhoto), (req, res) => {
  const b = req.body || {};
  const photo = req.file ? '/uploads/' + req.file.filename : null;
  const fail = msg => { removeUpload(photo); bad(res, msg); };
  const sid = +b.sid, len = Math.round(+b.len), date = b.date, lat = parseFloat(b.lat), lon = parseFloat(b.lon);
  const err = validate({ sid, len, date });
  if (err) return fail(err);
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return fail('장소를 고르거나 지도를 눌러 위치를 찍어 주세요.');
  const spot = String(b.spot || '').trim() || `${lat.toFixed(2)}°N ${lon.toFixed(2)}°E`;

  const before = statsOf(req.user);
  const beforeAch = new Set(Progress.achievements(before, sp).filter(a => a.done).map(a => a.k));
  const info = db.prepare(`INSERT INTO catches (user, species_id, length_cm, spot, lat, lon, caught_on, memo, photo_url, created_at)
                           VALUES (?,?,?,?,?,?,?,?,?,?)`)
    .run(req.user, sid, len, spot, lat, lon, date, String(b.memo || '').trim(), photo, new Date().toISOString());
  const after = statsOf(req.user);
  const newAch = Progress.achievements(after, sp).filter(a => a.done && !beforeAch.has(a.k));

  res.status(201).json({
    catch: toCatch(db.prepare('SELECT * FROM catches WHERE id = ?').get(info.lastInsertRowid)),
    before: Progress.summary(before, sp),
    after: Progress.summary(after, sp),
    isNew: !before.species.has(sid),
    newAch,
  });
});

/* ---------- 수정 / 삭제 (Update / Delete) ---------- */
function ownCatch(req, res) {
  const row = db.prepare('SELECT * FROM catches WHERE id = ?').get(+req.params.id);
  if (!row) { bad(res, '기록을 찾을 수 없어요.', 404); return null; }
  if (row.user !== req.user) { bad(res, '본인 기록만 수정하거나 삭제할 수 있어요.', 403); return null; }
  return row;
}

router.put('/catches/:id', requireUser, (req, res) => {
  const row = ownCatch(req, res); if (!row) return;
  const b = req.body || {};
  const sid = +b.sid, len = Math.round(+b.len), date = b.date;
  const err = validate({ sid, len, date });
  if (err) return bad(res, err);
  let { spot, lat, lon } = row;
  const ns = String(b.spot || '').trim();
  if (ns && ns !== row.spot) {
    const p = spotByName(ns);
    if (!p) return bad(res, '목록에 있는 장소를 골라 주세요.');
    spot = p.n; lat = p.lat + jit(row.id, 0); lon = p.lon + jit(row.id, 1);
  }
  db.prepare('UPDATE catches SET species_id=?, length_cm=?, spot=?, lat=?, lon=?, caught_on=?, memo=? WHERE id=?')
    .run(sid, len, spot, lat, lon, date, String(b.memo || '').trim(), row.id);
  res.json(toCatch(db.prepare('SELECT * FROM catches WHERE id = ?').get(row.id)));
});

router.delete('/catches/:id', requireUser, (req, res) => {
  const row = ownCatch(req, res); if (!row) return;
  db.prepare('DELETE FROM catches WHERE id = ?').run(row.id);
  removeUpload(row.photo_url);
  res.json({ ok: true, id: row.id });
});

/* ---------- 데모 초기화 (Shift+R) ---------- */
router.post('/demo/reset', (req, res) => {
  resetDemo();
  speciesCache = null;
  res.json({ ok: true });
});

router.use((req, res) => bad(res, '없는 API예요.', 404));

module.exports = router;
