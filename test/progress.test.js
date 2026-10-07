// 데모 시나리오 검증: 지훈 seed 직후 448 XP / Lv.5 → 참돔 45cm 등록 후 512 XP / Lv.6 + dex10
// Node 18.1 호환: before/after 훅 대신 상위 test 안에서 준비·정리하고,
// 내장 fetch는 Cookie 헤더를 다루지 못해 http 모듈로 요청한다.
const test = require('node:test');
const assert = require('node:assert');
const http = require('http');
const fs = require('fs');
const os = require('os');
const path = require('path');

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'fishdex-test-'));
process.env.FISHDEX_DB = path.join(tmp, 'test.db'); // 실제 data/fishdex.db는 건드리지 않음

const app = require('../server');
const { DEMO_USER, DEMO_PASSWORD } = require('../seed');

let port;

async function call(method, url, { body, cookie } = {}) {
  const headers = {};
  let payload = null;
  if (cookie) headers.cookie = cookie;
  if (body && body.multipart) {
    headers['content-type'] = body.type;
    payload = body.multipart;
  } else if (body !== undefined) {
    headers['content-type'] = 'application/json';
    payload = Buffer.from(JSON.stringify(body));
  }
  return new Promise((resolve, reject) => {
    const req = http.request({ host: '127.0.0.1', port, path: '/api' + url, method, headers }, res => {
      let raw = '';
      res.setEncoding('utf8');
      res.on('data', d => raw += d);
      res.on('end', () => resolve({
        status: res.statusCode,
        cookie: (res.headers['set-cookie'] || [''])[0].split(';')[0],
        data: raw ? JSON.parse(raw) : null,
      }));
    });
    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}
async function login(name, password) {
  const r = await call('POST', '/login', { body: { name, password } });
  assert.strictEqual(r.status, 200);
  return r.cookie;
}
// multipart 본문 직접 작성 (Node 18.1 FormData는 파일 MIME 타입을 빠뜨림)
function form(fields, file) {
  const b = '----fishdex' + Date.now(), parts = [];
  for (const [k, v] of Object.entries(fields)) parts.push(`--${b}\r\nContent-Disposition: form-data; name="${k}"\r\n\r\n${v}\r\n`);
  if (file) parts.push(`--${b}\r\nContent-Disposition: form-data; name="photo"; filename="${file.name}"\r\nContent-Type: ${file.type}\r\n\r\n${file.data}\r\n`);
  parts.push(`--${b}--\r\n`);
  return { multipart: Buffer.from(parts.join('')), type: `multipart/form-data; boundary=${b}` };
}

test('손맛어보 API', async t => {
  const server = app.listen(0);
  await new Promise(r => server.once('listening', r));
  port = server.address().port;
  try {
    await t.test('로그인 없이는 /api/me 401, 틀린 비밀번호도 401', async () => {
      assert.strictEqual((await call('GET', '/me')).status, 401);
      assert.strictEqual((await call('POST', '/login', { body: { name: DEMO_USER, password: 'wrong' } })).status, 401);
    });

    await t.test('데모 시나리오: 448 XP Lv.5 → 참돔 45cm 거제 지세포 → 512 XP Lv.6, dex10 달성', async () => {
      await call('POST', '/demo/reset');
      const cookie = await login(DEMO_USER, DEMO_PASSWORD);

      const me = (await call('GET', '/me', { cookie })).data;
      assert.strictEqual(me.user, '지훈');
      assert.strictEqual(me.speciesIds.length, 9);
      assert.strictEqual(me.xp, 448);
      assert.strictEqual(me.lv, 5);
      const mine = (await call('GET', '/catches')).data.filter(c => c.user === '지훈');
      assert.strictEqual(mine.length, 10);

      const ids = (await call('POST', '/identify', { body: form({}, { name: 'a.jpg', type: 'image/jpeg', data: 'x' }) })).data;
      assert.deepStrictEqual(ids[0], { sid: 2, p: 94 });

      const r = await call('POST', '/catches', { cookie, body: form({ sid: 2, len: 45, spot: '거제 지세포', lat: 34.83, lon: 128.71, date: '2026-10-07', memo: '' }) });
      assert.strictEqual(r.status, 201);
      assert.strictEqual(r.data.before.xp, 448);
      assert.strictEqual(r.data.before.lv, 5);
      assert.strictEqual(r.data.after.xp, 512);
      assert.strictEqual(r.data.after.lv, 6);
      assert.strictEqual(r.data.after.speciesIds.length, 10);
      assert.strictEqual(r.data.isNew, true);
      assert.ok(r.data.newAch.some(a => a.k === 'dex10'));
      assert.strictEqual(r.data.catch.user, '지훈');
    });

    await t.test('유효성 검사는 400 + 한국어 메시지', async () => {
      const cookie = await login(DEMO_USER, DEMO_PASSWORD);
      const r = await call('POST', '/catches', { cookie, body: form({ sid: 21, len: 45, lat: 1, lon: 1, date: '2026-10-07' }) });
      assert.strictEqual(r.status, 400);
      assert.match(r.data.error, /어종/);
      const r2 = await call('POST', '/catches', { cookie, body: form({ sid: 2, len: 301, lat: 1, lon: 1, date: '2026-10-07' }) });
      assert.strictEqual(r2.status, 400);
      const r3 = await call('POST', '/catches', { cookie, body: form({ sid: 2, len: 45, date: '2026-10-07' }) });
      assert.strictEqual(r3.status, 400);
    });

    await t.test('본인 기록만 수정·삭제, 장소가 바뀌면 좌표도 갱신', async () => {
      await call('POST', '/demo/reset');
      const jihoon = await login(DEMO_USER, DEMO_PASSWORD);
      const other = await login('새벽찌', DEMO_PASSWORD);
      const body = { sid: 3, len: 33, spot: '거제 지세포', date: '2026-09-06', memo: '수정' };

      assert.strictEqual((await call('PUT', '/catches/1', { cookie: other, body })).status, 403);
      assert.strictEqual((await call('DELETE', '/catches/1', { cookie: other })).status, 403);

      const up = await call('PUT', '/catches/1', { cookie: jihoon, body });
      assert.strictEqual(up.status, 200);
      assert.strictEqual(up.data.spot, '거제 지세포');
      assert.ok(Math.abs(up.data.lat - 34.83) < 0.08 && Math.abs(up.data.lon - 128.71) < 0.08);

      assert.strictEqual((await call('DELETE', '/catches/1', { cookie: jihoon })).status, 200);
      assert.strictEqual((await call('GET', '/catches')).data.length, 33);
    });

    await t.test('demo reset 후 seed 상태로 복구되고 로그인은 유지', async () => {
      const cookie = await login(DEMO_USER, DEMO_PASSWORD);
      await call('POST', '/demo/reset');
      const me = await call('GET', '/me', { cookie });
      assert.strictEqual(me.status, 200);
      assert.strictEqual(me.data.xp, 448);
      assert.strictEqual((await call('GET', '/catches')).data.length, 34);
    });
  } finally {
    server.close();
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});
