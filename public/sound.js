/* ---------- 효과음 (Web Audio로 합성, 파일 없음) ---------- */
const Sound = (() => {
  let ctx = null, master = null;
  function init() {
    if (ctx) return ctx;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC(); master = ctx.createGain(); master.connect(ctx.destination);
    return ctx;
  }
  function note(freq, at, dur, { type = 'sine', vol = .3, to = null } = {}) {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, at);
    if (to) o.frequency.exponentialRampToValueAtTime(to, at + dur);
    g.gain.setValueAtTime(.0001, at);
    g.gain.exponentialRampToValueAtTime(vol, at + .012);
    g.gain.exponentialRampToValueAtTime(.0001, at + dur);
    o.connect(g); g.connect(master); o.start(at); o.stop(at + dur + .03);
  }
  const FX = {
    tap: t => note(700, t, .07, { type: 'triangle', vol: .12 }),
    bubble: t => { note(380, t, .12, { vol: .2, to: 820 }); note(520, t + .09, .1, { vol: .14, to: 1040 }); },
    scan: t => { for (let i = 0; i < 5; i++) note(420 + i * 90, t + i * .16, .12, { vol: .1, to: 760 + i * 120 }); },
    found: t => { note(784, t, .12, { type: 'triangle', vol: .18 }); note(1175, t + .1, .2, { type: 'triangle', vol: .18 }); },
    splash: t => { note(260, t, .28, { vol: .22, to: 880 }); [523, 659, 784].forEach((f, i) => note(f, t + .2 + i * .08, .24, { type: 'triangle', vol: .16 })); },
    ach: t => [1047, 1319, 1568, 2093].forEach((f, i) => note(f, t + i * .07, .32, { vol: .13 })),
    level: t => [523, 659, 784, 1047, 784, 1047].forEach((f, i) => note(f, t + i * .11, i === 5 ? .55 : .16, { type: 'square', vol: .06 })),
    del: t => note(340, t, .24, { type: 'triangle', vol: .18, to: 130 }),
    error: t => { note(240, t, .12, { type: 'square', vol: .06 }); note(190, t + .14, .2, { type: 'square', vol: .06 }); },
  };
  return {
    // delay: 초 단위 (축하 연출 타이밍에 맞춤)
    play(name, delay = 0) {
      if (!SETTINGS.sound || !SETTINGS.volume || !FX[name]) return;
      try {
        if (!init()) return;
        if (ctx.state === 'suspended') ctx.resume();
        master.gain.value = Math.pow(SETTINGS.volume / 100, 1.5);
        FX[name](ctx.currentTime + .01 + delay);
      } catch (_) {}
    },
  };
})();
