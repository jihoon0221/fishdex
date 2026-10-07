// XP · 레벨 · 칭호 · 도전과제 계산 (app.js의 userStats / achievements 로직을 그대로 옮김)
// 서버(require)와 브라우저(<script src="progress.js">)가 같은 파일을 함께 사용한다.
(function (root, factory) {
  const P = factory();
  if (typeof module === 'object' && module.exports) module.exports = P;
  else root.Progress = P;
})(typeof self !== 'undefined' ? self : this, function () {
  const RAR = { common: { k: '흔함', xp: 0 }, normal: { k: '보통', xp: 5 }, rare: { k: '희귀', xp: 15 }, legend: { k: '전설', xp: 40 } };
  const LV = [0, 60, 140, 240, 360, 500, 660, 840, 1040, 1260, 1500];
  const TITLES = ['', '물때 모르는 초보', '찌 보는 눈', '입질 감별사', '손맛 수집가', '갯바위 단골', '포인트 개척자', '대물 사냥꾼', '바다의 기록자', '어보 편찬자', '전설의 조사'];

  // sp: id → species({rar, hab, ...})
  function xpOf(c, sp, isNew) { return 10 + Math.round(c.len / 5) + RAR[sp(c.sid).rar].xp + (isNew ? 30 : 0); }

  function userStats(catches, user, sp) {
    const list = catches.filter(c => c.user === user).sort((a, b) => a.date.localeCompare(b.date) || a.id - b.id);
    const seen = new Set(); let xp = 0;
    list.forEach(c => { xp += xpOf(c, sp, !seen.has(c.sid)); seen.add(c.sid); });
    let lv = 1; for (let i = 1; i < LV.length; i++) if (xp >= LV[i]) lv = i + 1;
    lv = Math.min(lv, 10);
    const cur = LV[lv - 1], next = LV[lv] ?? LV[LV.length - 1];
    return { list, xp, lv, title: TITLES[lv], species: seen, cur, next, pct: lv >= 10 ? 100 : Math.round((xp - cur) / (next - cur) * 100) };
  }

  function achievements(st, sp) {
    const L = st.list, regions = new Set(L.map(c => c.spot)), hab = new Set(L.map(c => sp(c.sid).hab));
    const per = {}; L.forEach(c => per[c.sid] = (per[c.sid] || 0) + 1); const maxSame = Math.max(0, ...Object.values(per));
    const big = Math.max(0, ...L.map(c => c.len)); const legend = L.some(c => sp(c.sid).rar === 'legend');
    const A = [
      ['first', '첫 손맛', '처음으로 물고기를 등록하기', L.length, 1],
      ['dex5', '어보 입문', '서로 다른 어종 5종 수집', st.species.size, 5],
      ['dex10', '열 칸의 어보', '서로 다른 어종 10종 수집', st.species.size, 10],
      ['dex20', '어보 완성', '도감의 모든 어종 20종 수집', st.species.size, 20],
      ['big', '대물 사냥꾼', '50cm 이상 물고기 낚기', big >= 50 ? 1 : 0, 1],
      ['both', '바다와 강', '바다 어종과 민물 어종 모두 낚기', hab.size, 2],
      ['tour', '전국 일주', '서로 다른 장소 6곳에서 기록', regions.size, 6],
      ['same', '한 우물 파기', '같은 어종 5마리 낚기', maxSame, 5],
      ['legend', '전설의 손맛', '전설 등급 어종 낚기', legend ? 1 : 0, 1],
    ];
    return A.map(([k, t, d, v, goal]) => ({ k, t, d, v: Math.min(v, goal), goal, done: v >= goal }));
  }

  // API 응답용 (Set → 배열, list 제외)
  function summary(st, sp) {
    const { xp, lv, title, pct, cur, next } = st;
    return { xp, lv, title, pct, cur, next, speciesIds: [...st.species], achievements: achievements(st, sp) };
  }

  return { RAR, LV, TITLES, xpOf, userStats, achievements, summary };
});
