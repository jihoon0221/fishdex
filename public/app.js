/* ---------- 데이터 ---------- */
let ME = null;                   // 로그인한 유저 (/api/me)
const RAR = Progress.RAR;
let SPECIES = [], SPOTS = [];   // 서버(/api/species, /api/spots)에서 채움
const sp = id => SPECIES.find(s=>s.id===id);
const spot = n => SPOTS.find(s=>s.n===n);

let state={catches:[]};          // 서버(/api/catches)에서 채움
async function loadCatches(){ state.catches=await api.catches(); }
async function loadAll(){ [SPECIES,SPOTS,state.catches]=await Promise.all([api.species(),api.spots(),api.catches()]); }

/* ---------- 레벨 / XP ---------- */
// 레벨 기준값 · 도전과제는 서버와 같은 progress.js 사용
const {LV, TITLES} = Progress;
function userStats(user){ return Progress.userStats(state.catches, user, sp); }

/* ---------- 물고기 일러스트 (SVG 생성) ---------- */
function fishSVG(s, opt={}){
  const id='g'+Math.random().toString(36).slice(2,8), H=s.h, f=s.fork, d=s.d, sil=!!opt.sil;
  const top=50-H, bot=50+H*0.88;
  const body=`M16 52 C30 ${top} 112 ${top-2} 152 ${50-H*0.24} L152 ${50+H*0.24} C112 ${bot} 30 ${bot} 16 52 Z`;
  let tail;
  if(s.tail==='needle') tail=`M150 ${50-H*0.3} L197 51 L150 ${50+H*0.3}Z`;
  else if(s.tail==='round') tail=`M149 ${50-H*0.22} C170 ${50-H*0.95} 190 ${50-H*0.7} 189 50 C190 ${50+H*0.7} 170 ${50+H*0.95} 149 ${50+H*0.22}Z`;
  else tail=`M149 ${50-H*0.2} L190 ${50-H*0.9-f*0.6} L${182-f*0.5} 50 L190 ${50+H*0.9+f*0.6} L149 ${50+H*0.2}Z`;
  const dorsal=`M54 ${top+5} Q 80 ${top-d} 124 ${top+4} Z`;
  const anal=`M98 ${50+H*0.78} Q 114 ${bot+7} 130 ${50+H*0.42} Z`;
  const pect=`M50 56 Q 63 ${62+H*0.12} 72 59 Q 62 54 50 56Z`;
  if(sil){ const st='fill:var(--sil)'; return `<svg viewBox="0 0 200 100" aria-hidden="true"><path d="${tail}" style="${st}"/><path d="${dorsal}" style="${st}"/><path d="${anal}" style="${st}"/><path d="${body}" style="${st}"/><text x="84" y="57" text-anchor="middle" style="fill:var(--paper);font:700 16px var(--f-mono)">?</text></svg>`; }
  const [c1,c2,cf]=s.c; let pat='';
  const p=s.pat, R=(i,k)=>{const x=Math.sin((s.id*31+i)*12.9898+k*78.233)*43758.5453;return x-Math.floor(x);};
  if(p.t==='bands') for(let i=0;i<p.n;i++){ const x=36+i*(108/p.n); pat+=`<rect x="${x}" y="0" width="${80/p.n}" height="100" fill="${p.col}" opacity="${p.o}"/>`; }
  if(p.t==='spots') for(let i=0;i<p.n;i++){ const x=30+R(i,0)*115, y=(p.top?top+4:top+3)+R(i,1)*(p.top?H*0.7:H*1.6); pat+=`<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(p.r*(0.7+R(i,2)*0.6)).toFixed(2)}" fill="${p.col}" opacity="${p.o}"/>`; }
  if(p.t==='mottle') for(let i=0;i<p.n;i++){ const x=34+R(i,0)*110, y=top+4+R(i,1)*H*1.3; pat+=`<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="${(5+R(i,2)*6).toFixed(1)}" ry="${(3+R(i,3)*4).toFixed(1)}" fill="${p.col}" opacity="${p.o}"/>`; }
  if(p.t==='wave') for(let i=0;i<9;i++){ const x=40+i*12; pat+=`<path d="M${x} ${top} q 4 ${H*0.4} -2 ${H*0.75} q -4 ${H*0.2} 1 ${H*0.35}" stroke="${p.col}" stroke-width="2.2" fill="none" opacity="${p.o}"/>`; }
  if(p.t==='stripe') pat+=`<rect x="20" y="${50-H*0.12-(p.thick?3:0)}" width="135" height="${p.thick?7:3.5}" fill="${p.col}" opacity="${p.o}"/>`;
  if(p.t==='rainbow'){ pat+=`<rect x="22" y="${48-H*0.1}" width="130" height="${H*0.38}" fill="#E07A8C" opacity=".55"/>`; for(let i=0;i<18;i++){pat+=`<circle cx="${(36+R(i,0)*110).toFixed(1)}" cy="${(top+3+R(i,1)*H*1.1).toFixed(1)}" r="1.1" fill="#2E352B" opacity=".7"/>`;} }
  if(p.t==='scale') for(let r=0;r<5;r++) for(let i=0;i<10;i++){ const x=48+i*10+(r%2)*5, y=top+6+r*(H*1.7/5); pat+=`<path d="M${x} ${y} q 5 5 0 10" stroke="${cf}" stroke-width=".8" fill="none" opacity=".35"/>`; }
  return `<svg viewBox="0 0 200 100" role="img" aria-label="${s.name} 그림">
   <defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c1}"/><stop offset=".62" stop-color="${c2}"/><stop offset="1" stop-color="${c2}"/></linearGradient><clipPath id="${id}c"><path d="${body}"/></clipPath></defs>
   <path d="${tail}" fill="${cf}"/><path d="${dorsal}" fill="${cf}"/><path d="${anal}" fill="${cf}" opacity=".9"/>
   <path d="${body}" fill="url(#${id})"/><g clip-path="url(#${id}c)">${pat}</g>
   <path d="M46 ${50-H*0.45} Q 54 52 46 ${50+H*0.55}" stroke="${cf}" stroke-width="1.4" fill="none" opacity=".55"/>
   <path d="${pect}" fill="${cf}" opacity=".75"/>
   ${s.h<10?'':`<ellipse cx="42" cy="${55+H*0.08}" rx="4.6" ry="2.6" fill="#FF9DB0" opacity=".6"/>`}
   <circle cx="31" cy="46" r="${s.h<10?2.6:5.6}" fill="#fff"/><circle cx="32" cy="46.5" r="${s.h<10?1.6:3.6}" fill="#1B2430"/><circle cx="33.4" cy="44.8" r="${s.h<10?.6:1.3}" fill="#fff"/>
   <path d="M17 53 q 3.5 3 7 .5" stroke="#1B2430" stroke-width="1.3" fill="none" stroke-linecap="round" opacity=".7"/>
  </svg>`;
}

/* ---------- 지도 (위경도 → SVG) ---------- */
const MB={lat0:38.9,lon0:125.3,k:100,ky:124};
const px = (lat,lon)=>[(lon-MB.lon0)*MB.k,(MB.lat0-lat)*MB.ky];
const COAST=[[37.75,126.62],[37.95,126.9],[38.1,127.2],[38.3,127.6],[38.3,128.05],[38.61,128.36],[38.25,128.58],[37.85,128.86],[37.55,129.08],[37.1,129.36],[36.6,129.42],[36.05,129.57],[35.75,129.47],[35.45,129.36],[35.18,129.2],[35.08,128.98],[34.98,128.72],[34.85,128.45],[34.78,128.05],[34.7,127.75],[34.6,127.5],[34.52,127.25],[34.42,126.95],[34.3,126.55],[34.45,126.3],[34.75,126.35],[35.05,126.28],[35.35,126.42],[35.6,126.48],[35.95,126.62],[36.2,126.5],[36.45,126.32],[36.75,126.12],[36.98,126.35],[37.05,126.72],[37.32,126.6],[37.55,126.55]];
const coastPath='M'+COAST.map(p=>px(p[0],p[1]).map(v=>v.toFixed(1)).join(' ')).join(' L')+'Z';
function mapSVG(pins, {mini=false, pick=null}={}){
  const W=(131.4-MB.lon0)*MB.k, Hh=(MB.lat0-33)*MB.ky;
  let g='';
  for(let lon=126;lon<=131;lon++){ const [x]=px(0,lon); g+=`<line x1="${x}" y1="0" x2="${x}" y2="${Hh}" style="stroke:var(--line)" stroke-dasharray="2 5"/>`+(mini?'':`<text x="${x+4}" y="${Hh-8}" style="fill:var(--muted);font:11px var(--f-mono)">${lon}°E</text>`); }
  for(let lat=34;lat<=38;lat++){ const [,y]=px(lat,0); g+=`<line x1="0" y1="${y}" x2="${W}" y2="${y}" style="stroke:var(--line)" stroke-dasharray="2 5"/>`+(mini?'':`<text x="6" y="${y-5}" style="fill:var(--muted);font:11px var(--f-mono)">${lat}°N</text>`); }
  const [jx,jy]=px(33.38,126.55), [ux,uy]=px(37.5,130.87), [dx,dy]=px(37.24,131.86);
  const land=`<path d="${coastPath}" style="fill:var(--land);stroke:var(--land-edge)" stroke-width="1.4" stroke-linejoin="round"/>
    <ellipse cx="${jx}" cy="${jy}" rx="36" ry="17" style="fill:var(--land);stroke:var(--land-edge)" stroke-width="1.4"/>
    <circle cx="${ux}" cy="${uy}" r="5" style="fill:var(--land);stroke:var(--land-edge)" stroke-width="1.2"/>`;
  const sea = mini?'':`<text x="${px(37.6,130)[0]}" y="${px(37.6,130)[1]}" style="fill:var(--muted);font:italic 15px var(--f-display);letter-spacing:.3em" opacity=".7">동 해</text>
    <text x="${px(36.2,125.5)[0]}" y="${px(36.2,125.5)[1]}" style="fill:var(--muted);font:italic 15px var(--f-display);letter-spacing:.3em" opacity=".7">서 해</text>
    <text x="${px(33.9,127.6)[0]}" y="${px(33.9,127.6)[1]}" style="fill:var(--muted);font:italic 15px var(--f-display);letter-spacing:.3em" opacity=".7">남 해</text>`;
  let pp='';
  pins.forEach(c=>{ const [x,y]=px(c.lat,c.lon); const s=sp(c.sid); const mine=c.user===ME;
    const col=mine?'var(--float)':(s.hab==='sea'?'var(--sea)':'var(--r-normal)');
    pp+=`<g class="pin" data-id="${c.id}" transform="translate(${x.toFixed(1)} ${y.toFixed(1)})"><title>${s.name} ${c.len}cm · ${esc(c.user)}</title><g class="bobber" style="animation-delay:${(c.id%7)*-0.37}s"><g class="sc">
      <ellipse cx="0" cy="1" rx="9" ry="2.6" style="fill:var(--sea-deep)" opacity=".18"/>
      <line x1="0" y1="-19" x2="0" y2="-12" style="stroke:var(--ink)" stroke-width="1.6" stroke-linecap="round"/>
      <path d="M-6.5 -6 A6.5 6.5 0 0 1 6.5 -6Z" style="fill:${col}"/><path d="M-6.5 -6 A6.5 6.5 0 0 0 6.5 -6Z" fill="#fff"/>
      <circle cx="0" cy="-6" r="6.5" fill="none" style="stroke:var(--ink)" stroke-width="1.2" opacity=".55"/></g></g></g>`; });
  if(pick){ const [x,y]=px(pick.lat,pick.lon); pp+=`<g transform="translate(${x},${y})"><path d="M0 0 C-9 -12 -9 -24 0 -24 C9 -24 9 -12 0 0Z" style="fill:var(--float)"/><circle cy="-16" r="3.5" fill="#fff"/></g>`; }
  const wv=`<defs><pattern id="wv${mini?'m':''}" width="46" height="26" patternUnits="userSpaceOnUse"><path d="M3 13 q5 -5 10 0 t10 0" fill="none" style="stroke:var(--wave)" stroke-width="1.6" stroke-linecap="round"/><path d="M26 2 q4 -3 8 0" fill="none" style="stroke:var(--wave)" stroke-width="1.4" stroke-linecap="round"/></pattern></defs><rect width="${W}" height="${Hh}" style="fill:var(--water)"/><rect width="${W}" height="${Hh}" fill="url(#wv${mini?'m':''})"/>`;
  return `<svg viewBox="0 0 ${W} ${Hh}" data-map="1">${wv}${g}${sea}${land}${pp}</svg>`;
}
function svgToLatLon(svg, ev){ const pt=svg.createSVGPoint(); pt.x=ev.clientX; pt.y=ev.clientY; const p=pt.matrixTransform(svg.getScreenCTM().inverse()); return {lat:+(MB.lat0-p.y/MB.ky).toFixed(4), lon:+(MB.lon0+p.x/MB.k).toFixed(4)}; }
function nearestSpot(lat,lon){ let best=null,bd=1e9; SPOTS.forEach(s=>{const d=(s.lat-lat)**2+(s.lon-lon)**2; if(d<bd){bd=d;best=s;}}); return bd<0.25?best.n:`${lat.toFixed(2)}°N ${lon.toFixed(2)}°E`; }

/* ---------- 공통 ---------- */
const $=s=>document.querySelector(s);
const esc=t=>String(t??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const todayStr=()=>{const d=new Date();return new Date(d.getTime()-d.getTimezoneOffset()*60000).toISOString().slice(0,10);};
const fmtDate=d=>d.slice(5).replace('-','.');
let view='dex', dexFilter='all';
function toast(html){ const t=document.createElement('div'); t.className='toast'; t.innerHTML=html; $('#toasts').append(t); setTimeout(()=>t.remove(),3600); }
let modalLocked=false;
function openModal(html,{locked=false}={}){ modalLocked=locked; $('#sheet').innerHTML=(locked?'':'<button class="x" aria-label="닫기" data-close>×</button>')+html; $('#modal').hidden=false; }
function closeModal(force){ if(modalLocked&&force!==true) return; modalLocked=false; $('#modal').hidden=true; }
$('#modal').addEventListener('click',e=>{ if(e.target.id==='modal'||e.target.closest('[data-close]')) closeModal(); });
document.addEventListener('keydown',e=>{ if(e.key==='Escape') closeModal(); });

function go(v){ view=v; document.querySelectorAll('.tab').forEach(t=>t.setAttribute('aria-current',t.dataset.view===v?'page':'false'));
  ['dex','reg','map','ach','log'].forEach(k=>$('#v-'+k).hidden=k!==v); render(); window.scrollTo({top:0}); }
$('#tabs').addEventListener('click',e=>{ const t=e.target.closest('.tab'); if(t) go(t.dataset.view); });
$('#lvchip').addEventListener('click',()=>go('ach'));

function render(){ if(!ME) return; renderChip(); ({dex:renderDex,reg:renderReg,map:renderMap,ach:renderAch,log:renderLog})[view](); }
function renderChip(){ const st=userStats(ME);
  $('#lvchip').innerHTML=`<span class="badge"><b>${st.lv}</b></span><span class="t"><b>${esc(ME)} · ${st.title}</b><span class="xpbar"><i style="width:${st.pct}%"></i></span></span>`; }

/* ---------- 도감 (Read) ---------- */
function renderDex(){
  const st=userStats(ME); const mine=st.list;
  const best=mine.reduce((m,c)=>c.len>(m?.len||0)?c:m,null);
  const list=SPECIES.filter(s=> dexFilter==='all'||(dexFilter==='sea'&&s.hab==='sea')||(dexFilter==='fresh'&&s.hab==='fresh')||(dexFilter==='locked'&&!st.species.has(s.id)));
  $('#v-dex').innerHTML=`
  <div class="summary">
    <div class="sum lead"><div class="eyebrow">Lv.${st.lv} 조사</div><h2>${st.title}</h2>
      <div class="xpbar"><i style="width:${st.pct}%"></i></div>
      <div class="xpmeta mono"><span>${st.xp} XP</span><span>${st.lv>=10?'최고 레벨':'다음 레벨까지 '+(st.next-st.xp)+' XP'}</span></div></div>
    <div class="sum"><span class="ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 5h7v14H4zM13 5h7v14h-7z"/></svg></span><div class="eyebrow">수집한 어종</div><div class="v">${st.species.size}<small> / ${SPECIES.length}</small></div></div>
    <div class="sum"><span class="ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12c3-4 7-5 11-3l4-3v12l-4-3c-4 2-8 1-11-3z"/><circle cx="7.5" cy="11" r=".8" fill="currentColor"/></svg></span><div class="eyebrow">총 조과</div><div class="v">${mine.length}<small> 마리</small></div></div>
    <div class="sum"><span class="ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 17h18M5 17V9M9 17v-5M13 17V7M17 17v-4"/></svg></span><div class="eyebrow">최대어</div><div class="v">${best?best.len:'–'}<small> cm</small></div><div style="font-size:12px;color:var(--muted)">${best?sp(best.sid).name+' · '+best.spot:''}</div></div>
  </div>
  <div class="shead"><div><h2>나의 어보</h2><p>사진으로 등록한 물고기가 도감에 채워집니다. 빈 칸은 아직 만나지 못한 어종이에요.</p></div>
    <div class="chips" id="dexchips">${[['all','전체'],['sea','바다'],['fresh','민물'],['locked','미발견']].map(([k,l])=>`<button class="chip" data-f="${k}" aria-pressed="${dexFilter===k}">${l}</button>`).join('')}</div></div>
  <div class="dex">${list.map(s=>{ const got=st.species.has(s.id); const cs=mine.filter(c=>c.sid===s.id); const mx=Math.max(0,...cs.map(c=>c.len));
    return `<button class="entry ${got?'':'locked'}" data-sid="${s.id}">
      <span class="no"><span>No.${String(s.id).padStart(3,'0')}</span><span class="rar ${s.rar}">${RAR[s.rar].k}</span></span>
      <span class="pic">${fishSVG(s,{sil:!got})}</span>
      <span class="nm">${got?s.name:'???'}</span>
      <span class="meta">${got?`<span>${cs.length}마리</span><span class="mono">최대 ${mx}cm</span>`:`<span>${s.hab==='sea'?'바다':'민물'} 어종</span>`}</span>
    </button>`;}).join('')}</div>`;
  $('#dexchips').onclick=e=>{ const b=e.target.closest('.chip'); if(b){dexFilter=b.dataset.f; renderDex();} };
  $('#v-dex').querySelector('.dex').onclick=e=>{ const b=e.target.closest('.entry'); if(b) showSpecies(+b.dataset.sid); };
}
function showSpecies(id){
  const s=sp(id), st=userStats(ME), got=st.species.has(id);
  const mine=st.list.filter(c=>c.sid===id), all=state.catches.filter(c=>c.sid===id);
  if(!got){ openModal(`<div class="eyebrow">No.${String(id).padStart(3,'0')} · ${s.hab==='sea'?'바다':'민물'}</div><h2 style="font-size:26px;margin-top:4px">미발견 어종</h2>
    <div class="detail-hero">${fishSVG(s,{sil:true})}</div><p class="desc">아직 이 어종을 낚지 못했어요. 다른 조사들은 이 어종을 <b>${all.length}번</b> 기록했습니다.${all.length?' 조황 지도에서 어디서 잡혔는지 확인해 보세요.':''}</p>
    <div style="display:flex;gap:8px;margin-top:16px"><button class="btn primary" data-go="reg">촬영해서 등록하기</button>${all.length?`<button class="btn ghost" data-go="map" data-sp="${id}">지도에서 보기</button>`:''}</div>`); }
  else openModal(`<div class="eyebrow">No.${String(id).padStart(3,'0')} · ${s.en} · <span class="rar ${s.rar}">${RAR[s.rar].k}</span></div>
    <h2 style="font-size:30px;margin-top:4px">${s.name}</h2>
    <div class="detail-hero">${fishSVG(s)}</div>
    <p class="desc">${s.desc}</p>
    <div class="facts"><div><b>${mine.length}</b><span>내 조과</span></div><div><b>${Math.max(...mine.map(c=>c.len))}cm</b><span>내 최대어</span></div><div><b>${all.length}</b><span>전체 유저 기록</span></div></div>
    <div class="eyebrow" style="margin-bottom:8px">나의 기록</div>
    <div style="display:grid;gap:6px">${mine.map(c=>`<div style="display:flex;justify-content:space-between;font-size:14px;border-bottom:1px dotted var(--line);padding:4px 0"><span>${esc(c.spot)}</span><span class="mono">${c.len}cm · ${fmtDate(c.date)}</span></div>`).join('')}</div>
    <div style="display:flex;gap:8px;margin-top:18px"><button class="btn ghost" data-go="map" data-sp="${id}">지도에서 보기</button></div>`);
  $('#sheet').querySelectorAll('[data-go]').forEach(b=>b.onclick=()=>{ closeModal(); if(b.dataset.sp) mapFilter=+b.dataset.sp; go(b.dataset.go); });
}

/* ---------- 촬영 등록 (Create) ---------- */
const emptyReg=()=>({photo:null,file:null,fname:'',cands:null,sel:null,scanning:false,lat:null,lon:null,spot:''});
let reg=emptyReg();
// 어종 판별은 서버 /api/identify (프로토타입: 참돔 1순위 고정 응답)
function renderReg(){
  const s=reg.sel?sp(reg.sel):null;
  $('#v-reg').innerHTML=`
  <div class="shead"><div><h2>오늘의 조과 등록</h2><p>사진을 올리면 어종을 판별하고, 위치를 찍으면 조황 지도에 공유됩니다.</p></div></div>
  <div class="reg">
    <div class="panel">
      <h3><span class="step">1</span>사진으로 어종 판별</h3><p class="sub">물고기 옆모습이 잘 보이게 찍어주세요.</p>
      <label class="drop" id="drop" for="photo">
        ${reg.photo?`<img src="${reg.photo}" alt="올린 사진">`:`<span class="ph"><span class="cam"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/></svg></span><b>사진 촬영 또는 업로드</b><span>클릭하거나 사진을 끌어다 놓으세요</span></span>`}
        ${reg.scanning?'<span class="scan"></span><span class="scanning-label">AI 판별 중…</span>':''}
      </label>
      <input type="file" id="photo" accept="image/*" capture="environment" hidden>
      ${reg.cands?`<div class="result"><div class="eyebrow">판별 결과 · 하나를 고르세요</div>${reg.cands.map(c=>{const x=sp(c.sid);return `<button class="cand" data-sid="${x.id}" aria-pressed="${reg.sel===x.id}">${fishSVG(x)}<span><b>${x.name}</b> <span class="rar ${x.rar}">${RAR[x.rar].k}</span><span class="bar"><i style="width:${c.p}%"></i></span></span><span class="pct">${c.p}%</span></button>`;}).join('')}</div>`:''}
    </div>
    <div class="panel">
      <h3><span class="step">2</span>조과 정보</h3><p class="sub">길이와 장소를 입력하면 경험치가 쌓여요.</p>
      <form class="form" id="regform">
        <label class="f">어종 <select id="r-sp" required><option value="">사진을 올리거나 직접 선택</option>${SPECIES.map(x=>`<option value="${x.id}" ${reg.sel===x.id?'selected':''}>No.${String(x.id).padStart(3,'0')} ${x.name}</option>`).join('')}</select></label>
        <div class="row2">
          <label class="f">길이 (cm)<input type="number" id="r-len" min="1" max="300" required placeholder="${s?s.avg:'35'}"></label>
          <label class="f">날짜<input type="date" id="r-date" value="${todayStr()}" required></label>
        </div>
        <label class="f">장소 <span class="h">목록에서 고르거나 아래 지도를 눌러 위치를 찍으세요</span>
          <select id="r-spot"><option value="">선택</option>${SPOTS.map(x=>`<option ${reg.spot===x.n?'selected':''}>${x.n}</option>`).join('')}${reg.spot&&!spot(reg.spot)?`<option selected>${esc(reg.spot)}</option>`:''}</select></label>
        <div class="minimap" id="minimap">${mapSVG([], {mini:true, pick:reg.lat!=null?{lat:reg.lat,lon:reg.lon}:null})}</div>
        <label class="f">메모 <span class="h">채비, 물때, 미끼 등</span><textarea id="r-memo" placeholder="예: 3물, 크릴 밑밥, 갯바위 홈통"></textarea></label>
        <button class="btn primary" id="r-submit" type="submit">어보에 등록하기</button>
      </form>
    </div>
  </div>`;
  const inp=$('#photo'), drop=$('#drop');
  inp.onchange=()=>inp.files[0]&&handleFile(inp.files[0]);
  drop.ondragover=e=>{e.preventDefault();drop.classList.add('over');};
  drop.ondragleave=()=>drop.classList.remove('over');
  drop.ondrop=e=>{e.preventDefault();drop.classList.remove('over'); const f=e.dataTransfer.files[0]; if(f&&f.type.startsWith('image/')) handleFile(f);};
  $('#v-reg').querySelectorAll('.cand').forEach(b=>b.onclick=()=>{reg.sel=+b.dataset.sid; keepForm(()=>renderReg());});
  $('#r-sp').onchange=e=>{reg.sel=+e.target.value||null;};
  $('#r-spot').onchange=e=>{ const x=spot(e.target.value); if(x){reg.spot=x.n;reg.lat=x.lat;reg.lon=x.lon; keepForm(()=>renderReg());} };
  const msvg=$('#minimap svg'); msvg.onclick=e=>{ const p=svgToLatLon(msvg,e); reg.lat=p.lat; reg.lon=p.lon; reg.spot=nearestSpot(p.lat,p.lon); keepForm(()=>renderReg()); };
  $('#regform').onsubmit=e=>{ e.preventDefault(); submitCatch(); };
}
function keepForm(fn){ const v={len:$('#r-len')?.value,date:$('#r-date')?.value,memo:$('#r-memo')?.value}; fn(); if(v.len!=null){$('#r-len').value=v.len;$('#r-date').value=v.date;$('#r-memo').value=v.memo;} }
async function handleFile(f){
  if(reg.photo) URL.revokeObjectURL(reg.photo);
  reg.photo=URL.createObjectURL(f); reg.file=f; reg.fname=f.name; reg.cands=null; reg.scanning=true; keepForm(renderReg);
  try{ const cands=await api.identify(f); if(reg.file!==f) return;
    reg.cands=cands; reg.sel=cands[0].sid; }
  catch(e){ toast(esc(e.message)); }
  finally{ if(reg.file===f){ reg.scanning=false; keepForm(renderReg); } }
}
let submitting=false;
async function submitCatch(){
  const sid=+$('#r-sp').value, len=+$('#r-len').value, date=$('#r-date').value, memo=$('#r-memo').value.trim();
  if(!sid){ toast('어종을 선택해 주세요.'); return; }
  if(!len||len<1){ toast('길이를 cm 단위로 입력해 주세요.'); $('#r-len').focus(); return; }
  if(reg.lat==null){ toast('장소를 고르거나 지도를 눌러 위치를 찍어 주세요.'); return; }
  if(submitting) return; submitting=true; $('#r-submit').disabled=true;
  const fd=new FormData();
  if(reg.file) fd.append('photo',reg.file);
  Object.entries({sid,len,spot:reg.spot,lat:reg.lat,lon:reg.lon,date,memo}).forEach(([k,v])=>fd.append(k,v));
  try{
    const r=await api.createCatch(fd);
    await loadCatches();
    if(reg.photo) URL.revokeObjectURL(reg.photo);
    reg=emptyReg();
    go('dex');
    celebrate({c:r.catch,s:sp(r.catch.sid),before:r.before,after:r.after,isNew:r.isNew,newAch:r.newAch});
  }catch(e){ if(!authFail(e)) toast(esc(e.message)); }
  finally{ submitting=false; const b=$('#r-submit'); if(b) b.disabled=false; }
}
function celebrate({c,s,before,after,isNew,newAch}){
  const lvUp=after.lv>before.lv, gain=after.xp-before.xp;
  let t=0.5; const at=()=>{const v=t;t+=0.7;return v;};
  const xpAt=at(), achAt=newAch.map(()=>at()), lvAt=lvUp?at():0, btnAt=at();
  const conf=Array.from({length:18},(_,i)=>{const a=i/18*Math.PI*2, r=90+(i*37)%60; const col=['var(--float)','var(--sun)','var(--aqua)','var(--sea)'][i%4];
    return `<i style="--dx:${(Math.cos(a)*r).toFixed(0)}px;--dy:${(Math.sin(a)*r).toFixed(0)}px;background:${col};animation-delay:${(achAt[0]??xpAt)+.15}s"></i>`;}).join('');
  const d=document.createElement('div'); d.className='celebrate';
  d.innerHTML=`<div class="cel-card" role="dialog" aria-label="등록 완료">
    <div class="cel-bub">${Array.from({length:8},(_,i)=>`<i style="left:${8+i*12}%;width:${5+i%3*3}px;height:${5+i%3*3}px;animation-duration:${3+i%4}s;animation-delay:${-i*.5}s"></i>`).join('')}</div>
    <div class="cel-fish">${fishSVG(s)}</div>
    <div class="eyebrow" style="position:relative">${isNew?'새 어종 발견!':'조과 등록 완료'}</div>
    <h2>No.${String(s.id).padStart(3,'0')} ${s.name} · ${c.len}cm</h2>
    <div class="cel-xp stage" style="animation-delay:${xpAt}s"><span>+${gain} XP</span><span class="xpbar"><i id="celbar" style="width:${before.pct}%"></i></span></div>
    ${newAch.map((a,i)=>`<div class="cel-ach stage" style="animation-delay:${achAt[i]}s"><div class="medal" style="animation-delay:${achAt[i]}s"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M5 12.5 10 17 19 7"/></svg></div><div><small>도전과제 달성</small><b>${a.t}</b><span>${a.d}</span></div></div>`).join('')}
    <div class="confetti">${newAch.length?conf:''}</div>
    ${lvUp?`<div class="cel-lv stage" style="animation-delay:${lvAt}s">레벨 업! Lv.${before.lv} → <b>Lv.${after.lv}</b><div style="font-size:14px;color:var(--muted)">새 칭호 · ${after.title}</div></div>`:''}
    <div class="cel-actions stage" style="animation-delay:${btnAt}s"><button class="btn ghost" data-act="dex">도감 보기</button><button class="btn primary" data-act="map">조황 지도에서 보기</button></div>
  </div>`;
  document.body.append(d);
  const bar=d.querySelector('#celbar');
  setTimeout(()=>{bar.style.width=(lvUp?100:after.pct)+'%';},(xpAt+.3)*1000);
  if(lvUp) setTimeout(()=>{bar.style.transition='none';bar.style.width='0%';requestAnimationFrame(()=>requestAnimationFrame(()=>{bar.style.transition='';bar.style.width=after.pct+'%';}));},lvAt*1000);
  d.addEventListener('click',e=>{ const b=e.target.closest('[data-act]'); if(!b) return; d.remove();
    if(b.dataset.act==='map'){ mapFilter=0; mapFocus=c.id; mapSel=null; go('map'); } else render(); });
}
function levelUp(st){ const d=document.createElement('div'); d.className='levelup'; d.innerHTML=`<div class="card">${fishSVG(MASCOT)}<div class="eyebrow">레벨 업!</div><div class="big">Lv.${st.lv}</div><h2>${st.title}</h2><p style="color:var(--muted);margin:0 0 16px">새 칭호를 얻었어요.</p><button class="btn primary">계속하기</button></div>`; d.onclick=()=>d.remove(); document.body.append(d); }

/* ---------- 조황 지도 (모든 유저, 인근 지역 묶음) ---------- */
let mapFilter=0, mapSel=null, mapFocus=null;
function clusterize(list){
  const cl=[]; const R2=0.42**2;
  list.forEach(c=>{ let best=null,bd=R2; cl.forEach(k=>{const d=(k.lat-c.lat)**2+(k.lon-c.lon)**2; if(d<bd){bd=d;best=k;}});
    if(best){ best.items.push(c); const n=best.items.length; best.lat=(best.lat*(n-1)+c.lat)/n; best.lon=(best.lon*(n-1)+c.lon)/n; }
    else cl.push({items:[c],lat:c.lat,lon:c.lon}); });
  cl.forEach(k=>{ const cnt={}; k.items.forEach(c=>cnt[c.spot]=(cnt[c.spot]||0)+1); k.label=Object.entries(cnt).sort((a,b)=>b[1]-a[1])[0][0];
    k.key=k.label; k.mine=k.items.some(c=>c.user===ME); k.items.sort((a,b)=>b.date.localeCompare(a.date)||b.id-a.id); });
  return cl;
}
function clusterSVG(cl){
  return cl.map(k=>{ const [x,y]=px(k.lat,k.lon); const n=k.items.length; const isNew=mapFocus&&k.items.some(c=>c.id===mapFocus); const hl=mapSel===k.key;
    const rip=isNew?`<circle class="ripple" r="12" cx="0" cy="${n>1?0:-6}"/>`:'';
    if(n===1){ const c=k.items[0], s=sp(c.sid); const col=c.user===ME?'var(--float)':(s.hab==='sea'?'var(--sea)':'var(--r-normal)');
      return `<g class="pin${hl?' hl':''}${isNew?' new':''}" data-key="${esc(k.key)}" transform="translate(${x.toFixed(1)} ${y.toFixed(1)})"><title>${esc(k.label)} · ${s.name} ${c.len}cm</title>${rip}<g class="bobber" style="animation-delay:${(c.id%7)*-0.37}s"><g class="sc">
        <ellipse cx="0" cy="1" rx="9" ry="2.6" style="fill:var(--sea-deep)" opacity=".18"/>
        <line x1="0" y1="-19" x2="0" y2="-12" style="stroke:var(--ink)" stroke-width="1.6" stroke-linecap="round"/>
        <path d="M-6.5 -6 A6.5 6.5 0 0 1 6.5 -6Z" style="fill:${col}"/><path d="M-6.5 -6 A6.5 6.5 0 0 0 6.5 -6Z" fill="#fff"/>
        <circle cx="0" cy="-6" r="6.5" fill="none" style="stroke:var(--ink)" stroke-width="1.2" opacity=".55"/></g></g></g>`; }
    const R=13+Math.min(n,8)*1.6;
    return `<g class="cl${hl?' hl':''}${isNew?' new':''}" data-key="${esc(k.key)}" transform="translate(${x.toFixed(1)} ${y.toFixed(1)})"><title>${esc(k.label)} 인근 · ${n}건</title>${rip}<g class="dropper"><g class="sc">
      <circle r="${R+5}" class="halo"/><circle r="${R}" class="body"/>
      <text y="1">${n}</text>${k.mine?`<circle cx="${(R*.72).toFixed(1)}" cy="${(-R*.72).toFixed(1)}" r="5" style="fill:var(--float);stroke:#fff" stroke-width="2"/>`:''}</g></g></g>`; }).join('');
}
function catchCard(c,hl){ const s=sp(c.sid);
  return `<div class="dcard${hl?' hl':''}" data-id="${c.id}"><div class="ph">${c.photo?`<img src="${c.photo}" alt="${s.name} 사진">`:fishSVG(s)}</div>
    <div style="min-width:0"><div><b>${s.name}</b> <span class="len">${c.len}cm</span>${c.id===mapFocus?'<span class="newtag">NEW</span>':''}</div>
    <div class="who">${esc(c.user)} · ${fmtDate(c.date)} · ${esc(c.spot)}</div>${c.memo?`<div class="memo">${esc(c.memo)}</div>`:''}</div></div>`; }
function renderMap(){
  const list=state.catches.filter(c=>!mapFilter||c.sid===mapFilter);
  const cl=clusterize(list);
  if(mapFocus){ const k=cl.find(k=>k.items.some(c=>c.id===mapFocus)); if(k) mapSel=k.key; }
  const sel=cl.find(k=>k.key===mapSel); if(!sel) mapSel=null;
  const recent=list.slice().sort((a,b)=>b.date.localeCompare(a.date)||b.id-a.id);
  let side;
  if(sel){ const spc={}; sel.items.forEach(c=>spc[c.sid]=(spc[c.sid]||0)+1);
    side=`<div class="cpanel-head"><button class="btn ghost sm" data-back>← 전체 조황</button>
      <h3>${esc(sel.label)} 인근</h3><p>${sel.items.length}건 · ${Object.keys(spc).length}종 · 최대 ${Math.max(...sel.items.map(c=>c.len))}cm</p>
      <div class="spchips">${Object.entries(spc).sort((a,b)=>b[1]-a[1]).map(([id,n])=>`<span>${sp(+id).name} ${n}</span>`).join('')}</div></div>
      <div class="feed">${sel.items.map(c=>catchCard(c,c.id===mapFocus)).join('')}</div>`; }
  else side=`<div class="cpanel-head"><h3>최근 조황</h3><p>${recent.length}건 · 지도의 묶음이나 찌를 누르면 그 지역 기록이 여기 나와요.</p></div>
      <div class="feed">${recent.map(c=>`<button class="fitem" data-id="${c.id}">${fishSVG(sp(c.sid))}<span><b>${sp(c.sid).name}</b> <span class="len">${c.len}cm</span><div class="who">${esc(c.user)} · ${esc(c.spot)}</div></span><span class="who">${fmtDate(c.date)}</span></button>`).join('')}</div>`;
  $('#v-map').innerHTML=`
  <div class="shead"><div><h2>조황 지도</h2><p>모든 조사들의 기록이 지도에 모입니다. 가까운 곳의 기록은 숫자로 묶여 보여요.</p></div>
    <label class="f" style="min-width:200px">어종 필터<select id="mf"><option value="0">전체 어종 (${state.catches.length})</option>${SPECIES.map(s=>{const n=state.catches.filter(c=>c.sid===s.id).length;return n?`<option value="${s.id}" ${mapFilter===s.id?'selected':''}>${s.name} (${n})</option>`:'';}).join('')}</select></label></div>
  <div class="mapwrap">
    <div><div class="bigmap" id="bigmap">${mapSVG([]).replace('</svg>',clusterSVG(cl)+'</svg>')}</div>
      <div class="legend"><span><i style="background:var(--sea)"></i>바다 어종</span><span><i style="background:var(--r-normal)"></i>민물 어종</span><span><i style="background:var(--float)"></i>내 기록</span><span><i style="background:var(--sea);width:16px;height:16px;vertical-align:-3px"></i>숫자 = 인근 기록 묶음</span></div></div>
    <div id="side">${side}</div>
  </div>`;
  $('#mf').onchange=e=>{mapFilter=+e.target.value; mapSel=null; mapFocus=null; renderMap();};
  $('#bigmap svg').onclick=e=>{ const g=e.target.closest('[data-key]'); mapFocus=null; mapSel=g?g.dataset.key:null; renderMap(); };
  const side$=$('#side');
  side$.onclick=e=>{ if(e.target.closest('[data-back]')){mapSel=null;mapFocus=null;renderMap();return;}
    const b=e.target.closest('.fitem'); if(b){ const id=+b.dataset.id; const k=cl.find(k=>k.items.some(c=>c.id===id)); mapFocus=null; mapSel=k.key; renderMap();
      const el=$(`#side .dcard[data-id="${id}"]`); if(el){el.classList.add('hl'); el.scrollIntoView({block:'nearest'});} } };
  if(mapFocus){ const el=$(`#side .dcard[data-id="${mapFocus}"]`); if(el) el.scrollIntoView({block:'nearest'}); }
}

/* ---------- 도전과제 + 레벨 ---------- */
function achievements(st){ return Progress.achievements(st, sp); }
function renderAch(){
  const st=userStats(ME), A=achievements(st);
  const users=[...new Set(state.catches.map(c=>c.user))].map(u=>({u,...userStats(u)})).sort((a,b)=>b.xp-a.xp);
  const medal='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12.5 10 17 19 7"/></svg>';
  const lock='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="6" y="11" width="12" height="9" rx="2"/><path d="M9 11V8a3 3 0 0 1 6 0v3"/></svg>';
  $('#v-ach').innerHTML=`
  <div class="shead"><div><h2>도전과제</h2><p>${A.filter(a=>a.done).length} / ${A.length} 달성 · 물고기를 등록할 때마다 경험치가 오르고 레벨이 올라갑니다.</p></div></div>
  <div class="split">
    <div class="achgrid">${A.map(a=>`<div class="ach ${a.done?'done':''}"><div class="medal">${a.done?medal:lock}</div><div><h3>${a.t}</h3><p>${a.d}</p>
      <div class="prog"><span class="bar"><i style="width:${a.v/a.goal*100}%"></i></span><span>${a.v}/${a.goal}</span></div></div></div>`).join('')}</div>
    <div>
      <div class="panel">
        <div class="eyebrow">이번 시즌 랭킹</div>
        <ol class="rank" style="margin-top:10px">${users.map((x,i)=>`<li class="${x.u===ME?'me':''}"><span class="n">${i+1}</span><span><b>${esc(x.u)}</b><div class="s">Lv.${x.lv} ${x.title} · ${x.species.size}종</div></span><span class="mono">${x.xp} XP</span></li>`).join('')}</ol>
        <div class="lvtable"><div style="border:0;font-family:var(--f-mono);font-size:11px;letter-spacing:.1em">경험치 = 10 + 길이÷5 + 희귀도 보너스 + 새 어종 30</div>
          ${TITLES.slice(1).map((t,i)=>`<div class="${st.lv===i+1?'cur':''}"><span>Lv.${i+1} ${t}</span><span class="mono">${LV[i]} XP</span></div>`).join('')}</div>
        <div style="display:flex;justify-content:space-between;align-items:center;margin-top:14px;font-size:13px;color:var(--muted)"><span>${esc(ME)} 님으로 로그인 중</span><button class="btn ghost sm" id="logout">로그아웃</button></div>
      </div>
    </div>
  </div>`;
  $('#logout').onclick=logout;
}

/* ---------- 내 기록 (Update / Delete) ---------- */
let confirmDel=null;
function renderLog(){
  const L=userStats(ME).list.slice().reverse();
  $('#v-log').innerHTML=`
  <div class="shead"><div><h2>내 조과 기록</h2><p>등록한 기록을 수정하거나 삭제할 수 있어요. 삭제하면 지도와 도감에서도 빠집니다.</p></div>
    <button class="btn primary sm" id="addbtn">+ 새 조과 등록</button></div>
  <div class="tablewrap">${L.length?`<table><thead><tr><th>사진</th><th>어종</th><th>길이</th><th>장소</th><th>날짜</th><th>메모</th><th></th></tr></thead><tbody>
  ${L.map(c=>{const s=sp(c.sid);return `<tr><td><div class="thumb">${c.photo?`<img src="${c.photo}" alt="">`:fishSVG(s)}</div></td><td><b>${s.name}</b></td><td class="num">${c.len}cm</td><td>${esc(c.spot)}</td><td class="num">${fmtDate(c.date)}</td><td style="color:var(--muted);max-width:220px">${esc(c.memo)||'–'}</td>
   <td><div class="actions">${confirmDel===c.id?`<span style="font-size:13px;align-self:center">삭제할까요?</span><button class="btn danger" data-del="${c.id}">삭제</button><button class="btn ghost sm" data-cancel>취소</button>`:`<button class="btn ghost sm" data-edit="${c.id}">수정</button><button class="btn ghost sm" data-ask="${c.id}">삭제</button>`}</div></td></tr>`;}).join('')}
  </tbody></table>`:`<div class="empty">아직 기록이 없어요. 첫 물고기를 등록해 보세요.</div>`}</div>`;
  $('#addbtn').onclick=()=>go('reg');
  $('#v-log').querySelector('.tablewrap').onclick=e=>{
    const t=e.target.closest('button'); if(!t) return;
    if(t.dataset.ask){confirmDel=+t.dataset.ask; renderLog();}
    else if(t.dataset.cancel!==undefined){confirmDel=null; renderLog();}
    else if(t.dataset.del) deleteCatch(+t.dataset.del);
    else if(t.dataset.edit) editCatch(+t.dataset.edit);
  };
}
async function deleteCatch(id){
  const c=state.catches.find(x=>x.id===id);
  try{ await api.deleteCatch(id); confirmDel=null; if(mapFocus===id) mapFocus=null; await loadCatches();
    toast(`${sp(c.sid).name} ${c.len}cm 기록을 삭제했어요.`); render(); }
  catch(e){ if(!authFail(e)) toast(esc(e.message)); }
}
function editCatch(id){
  const c=state.catches.find(x=>x.id===id);
  openModal(`<div class="eyebrow">기록 수정</div><h2 style="font-size:24px;margin:4px 0 16px">${sp(c.sid).name} ${c.len}cm</h2>
  <form class="form" id="editform">
    <label class="f">어종<select id="e-sp">${SPECIES.map(x=>`<option value="${x.id}" ${x.id===c.sid?'selected':''}>${x.name}</option>`).join('')}</select></label>
    <div class="row2"><label class="f">길이 (cm)<input type="number" id="e-len" min="1" value="${c.len}" required></label><label class="f">날짜<input type="date" id="e-date" value="${c.date}" required></label></div>
    <label class="f">장소<select id="e-spot">${SPOTS.map(x=>`<option ${x.n===c.spot?'selected':''}>${x.n}</option>`).join('')}${spot(c.spot)?'':`<option selected>${esc(c.spot)}</option>`}</select></label>
    <label class="f">메모<textarea id="e-memo">${esc(c.memo)}</textarea></label>
    <div style="display:flex;gap:8px;justify-content:flex-end"><button type="button" class="btn ghost" data-close>취소</button><button class="btn primary" type="submit">저장</button></div>
  </form>`);
  $('#editform').onsubmit=async e=>{ e.preventDefault();
    const body={sid:+$('#e-sp').value, len:+$('#e-len').value||c.len, spot:$('#e-spot').value, date:$('#e-date').value, memo:$('#e-memo').value.trim()};
    try{ await api.updateCatch(id,body); await loadCatches(); closeModal(); toast('기록을 수정했어요.'); render(); }
    catch(e){ if(!authFail(e)) toast(esc(e.message)); } };
}

const MASCOT={id:99,name:'손맛이',c:['#FF8A65','#FFE3D4','#FF6A45'],h:30,fork:8,d:12,tail:'fork',pat:{t:'bands',n:3,col:'#FFFFFF',o:.75}};
$('#mascot').innerHTML=fishSVG(MASCOT);
$('#bubbles').innerHTML=Array.from({length:14},(_,i)=>{const sz=4+(i*7)%10;return `<i style="left:${(i*37)%100}%;width:${sz}px;height:${sz}px;animation-duration:${4+(i*1.3)%5}s;animation-delay:${-(i*0.9)%6}s"></i>`;}).join('');
document.addEventListener('keydown',async e=>{ if(e.shiftKey&&e.key==='R'&&!e.target.closest?.('input,textarea,select')&&ME){
  try{ await api.resetDemo(); await loadAll(); mapSel=mapFocus=null; mapFilter=0; confirmDel=null; reg=emptyReg(); go('dex'); toast('데모 데이터로 초기화했어요.'); }
  catch(e){ toast(esc(e.message)); } } });

/* ---------- 로그인 ---------- */
// 세션이 끊기면(401) 로그인 화면으로
function authFail(e){ if(e.status!==401) return false; ME=null; showLogin(); toast('다시 로그인해 주세요.'); return true; }
function showLogin(){
  openModal(`<div class="eyebrow">손맛어보</div><h2 style="font-size:26px;margin:4px 0 6px">로그인</h2>
  <p class="desc" style="margin:0 0 16px">닉네임과 비밀번호로 들어가요. 처음이면 회원가입을 눌러 주세요.<br><span style="color:var(--muted);font-size:13px">데모 계정 · 지훈 / 1234</span></p>
  <form class="form" id="loginform">
    <label class="f">닉네임<input id="l-name" maxlength="12" autocomplete="username" required></label>
    <label class="f">비밀번호<input type="password" id="l-pw" autocomplete="current-password" required></label>
    <div style="display:flex;gap:8px;justify-content:flex-end"><button type="button" class="btn ghost" id="l-signup">회원가입</button><button class="btn primary" type="submit">로그인</button></div>
  </form>`, {locked:true});
  const send=async fn=>{ const n=$('#l-name').value.trim(), pw=$('#l-pw').value;
    if(!n||!pw){ toast('닉네임과 비밀번호를 입력해 주세요.'); return; }
    try{ const r=await fn(n,pw); await enter(r.user); }catch(e){ toast(esc(e.message)); } };
  $('#loginform').onsubmit=e=>{ e.preventDefault(); send(api.login); };
  $('#l-signup').onclick=()=>send(api.signup);
  $('#l-name').focus();
}
async function enter(user){
  ME=user; await loadCatches(); closeModal(true);
  mapSel=mapFocus=null; mapFilter=0; confirmDel=null; reg=emptyReg(); dexFilter='all'; go('dex');
}
async function logout(){ try{ await api.logout(); }catch(_){} ME=null; $('#lvchip').innerHTML=''; showLogin(); }

/* ---------- 시작: 서버에서 데이터 받기 ---------- */
(async function boot(){
  try{ await loadAll(); }catch(e){ toast('서버에 연결하지 못했어요. npm start로 서버를 켰는지 확인해 주세요.'); return; }
  // 시연용: 페이지를 열 때마다 이전 세션을 끊고 로그인 화면부터 시작
  try{ await api.logout(); }catch(_){}
  showLogin();
})();
