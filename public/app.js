/* ---------- 데이터 ---------- */
let ME = null;                   // 로그인한 유저 (/api/me)
const RAR = Progress.RAR;
let SPECIES = [], SPOTS = [];   // 서버(/api/species, /api/spots)에서 채움
const sp = id => SPECIES.find(s=>s.id===id);
const spot = n => SPOTS.find(s=>s.n===n);
// 화면 표시용 이름 (한/영)
const spName = s => isEn()?s.en:s.name;
const spDesc = s => isEn()&&s.descEn?s.descEn:s.desc;
const spotName = n => { const x=spot(n); return isEn()&&x&&x.en?x.en:n; };
const rarK = r => t('rar.'+r);
const titleOf = lv => t('titles')[lv];
const achText = a => t('ach.'+a.k);
const pad3 = id => String(id).padStart(3,'0');

let state={catches:[]};          // 서버(/api/catches)에서 채움
async function loadCatches(){ state.catches=await api.catches(); }
async function loadAll(){ [SPECIES,SPOTS,state.catches]=await Promise.all([api.species(),api.spots(),api.catches()]); }

/* ---------- 레벨 / XP ---------- */
// 레벨 기준값 · 도전과제는 서버와 같은 progress.js 사용
const {LV} = Progress;
function userStats(user){ return Progress.userStats(state.catches, user, sp); }

/* 물고기 일러스트는 fish.js의 fishSVG() */

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
  const sea = mini?'':`<text x="${px(37.6,130)[0]}" y="${px(37.6,130)[1]}" style="fill:var(--muted);font:italic 15px var(--f-display);letter-spacing:.3em" opacity=".7">${t('map.east')}</text>
    <text x="${px(36.2,125.5)[0]}" y="${px(36.2,125.5)[1]}" style="fill:var(--muted);font:italic 15px var(--f-display);letter-spacing:.3em" opacity=".7">${t('map.west')}</text>
    <text x="${px(33.9,127.6)[0]}" y="${px(33.9,127.6)[1]}" style="fill:var(--muted);font:italic 15px var(--f-display);letter-spacing:.3em" opacity=".7">${t('map.south')}</text>`;
  let pp='';
  pins.forEach(c=>{ const [x,y]=px(c.lat,c.lon); const s=sp(c.sid); const mine=c.user===ME;
    const col=mine?'var(--float)':(s.hab==='sea'?'var(--sea)':'var(--r-normal)');
    pp+=`<g class="pin" data-id="${c.id}" transform="translate(${x.toFixed(1)} ${y.toFixed(1)})"><title>${spName(s)} ${c.len}cm · ${esc(c.user)}</title><g class="bobber" style="animation-delay:${(c.id%7)*-0.37}s"><g class="sc">
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
function fail(e){ Sound.play('error'); toast(esc(e.message)); }
function toast(html){ const t=document.createElement('div'); t.className='toast'; t.innerHTML=html; $('#toasts').append(t); setTimeout(()=>t.remove(),3600); }
let modalLocked=false;
function openModal(html,{locked=false}={}){ modalLocked=locked; $('#sheet').innerHTML=(locked?'':`<button class="x" aria-label="${t('close')}" data-close>×</button>`)+html; $('#modal').hidden=false; }
function closeModal(force){ if(modalLocked&&force!==true) return; modalLocked=false; $('#modal').hidden=true; }
$('#modal').addEventListener('click',e=>{ if(e.target.id==='modal'||e.target.closest('[data-close]')) closeModal(); });
document.addEventListener('keydown',e=>{ if(e.key==='Escape') closeModal(); });

function go(v){ view=v; document.querySelectorAll('.tab').forEach(t=>t.setAttribute('aria-current',t.dataset.view===v?'page':'false'));
  ['dex','reg','map','ach','log','set'].forEach(k=>$('#v-'+k).hidden=k!==v); render(); window.scrollTo({top:0}); }
$('#tabs').addEventListener('click',e=>{ const b=e.target.closest('.tab'); if(b&&ME){ Sound.play('tap'); go(b.dataset.view); } });
$('#lvchip').addEventListener('click',()=>go('ach'));

function render(){ if(!ME) return; renderChip(); ({dex:renderDex,reg:renderReg,map:renderMap,ach:renderAch,log:renderLog,set:renderSet})[view](); }
function renderChip(){ const st=userStats(ME);
  $('#lvchip').innerHTML=`<span class="badge"><b>${st.lv}</b></span><span class="t"><b>${esc(ME)} · ${titleOf(st.lv)}</b><span class="xpbar"><i style="width:${st.pct}%"></i></span></span>`; }

/* ---------- 도감 (Read) ---------- */
function renderDex(){
  const st=userStats(ME); const mine=st.list;
  const best=mine.reduce((m,c)=>c.len>(m?.len||0)?c:m,null);
  const list=SPECIES.filter(s=> dexFilter==='all'||(dexFilter==='sea'&&s.hab==='sea')||(dexFilter==='fresh'&&s.hab==='fresh')||(dexFilter==='locked'&&!st.species.has(s.id)));
  $('#v-dex').innerHTML=`
  <div class="summary">
    <div class="sum lead"><div class="eyebrow">${t('dex.angler',st.lv)}</div><h2>${titleOf(st.lv)}</h2>
      <div class="xpbar"><i style="width:${st.pct}%"></i></div>
      <div class="xpmeta mono"><span>${st.xp} XP</span><span>${st.lv>=10?t('dex.max'):t('dex.next',st.next-st.xp)}</span></div></div>
    <div class="sum"><span class="ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 5h7v14H4zM13 5h7v14h-7z"/></svg></span><div class="eyebrow">${t('dex.found')}</div><div class="v">${st.species.size}<small> / ${SPECIES.length}</small></div></div>
    <div class="sum"><span class="ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12c3-4 7-5 11-3l4-3v12l-4-3c-4 2-8 1-11-3z"/><circle cx="7.5" cy="11" r=".8" fill="currentColor"/></svg></span><div class="eyebrow">${t('dex.total')}</div><div class="v">${t('unit.fish',mine.length)}</div></div>
    <div class="sum"><span class="ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 17h18M5 17V9M9 17v-5M13 17V7M17 17v-4"/></svg></span><div class="eyebrow">${t('dex.best')}</div><div class="v">${best?best.len:'–'}<small> cm</small></div><div style="font-size:12px;color:var(--muted)">${best?esc(spName(sp(best.sid))+' · '+spotName(best.spot)):''}</div></div>
  </div>
  <div class="shead"><div><h2>${t('dex.title')}</h2><p>${t('dex.sub')}</p></div>
    <div class="chips" id="dexchips">${[['all',t('dex.all')],['sea',t('hab.sea')],['fresh',t('hab.fresh')],['locked',t('dex.locked')]].map(([k,l])=>`<button class="chip" data-f="${k}" aria-pressed="${dexFilter===k}">${l}</button>`).join('')}</div></div>
  <div class="dex">${list.map(s=>{ const got=st.species.has(s.id); const cs=mine.filter(c=>c.sid===s.id); const mx=Math.max(0,...cs.map(c=>c.len));
    return `<button class="entry ${got?'':'locked'}" data-sid="${s.id}">
      <span class="no"><span>No.${pad3(s.id)}</span><span class="rar ${s.rar}">${rarK(s.rar)}</span></span>
      <span class="pic">${fishSVG(s,{sil:!got})}</span>
      <span class="nm">${got?spName(s):'???'}</span>
      <span class="meta">${got?`<span>${t('unit.caught',cs.length)}</span><span class="mono">${t('dex.maxLen',mx)}</span>`:`<span>${t(s.hab==='sea'?'hab.seaSp':'hab.freshSp')}</span>`}</span>
    </button>`;}).join('')}</div>`;
  $('#dexchips').onclick=e=>{ const b=e.target.closest('.chip'); if(b){dexFilter=b.dataset.f; renderDex();} };
  $('#v-dex').querySelector('.dex').onclick=e=>{ const b=e.target.closest('.entry'); if(b) showSpecies(+b.dataset.sid); };
}
function showSpecies(id){
  const s=sp(id), st=userStats(ME), got=st.species.has(id);
  const mine=st.list.filter(c=>c.sid===id), all=state.catches.filter(c=>c.sid===id);
  if(!got){ openModal(`<div class="eyebrow">No.${pad3(id)} · ${t('hab.'+s.hab)}</div><h2 style="font-size:26px;margin-top:4px">${t('sp.unknown')}</h2>
    <div class="detail-hero">${fishSVG(s,{sil:true})}</div><p class="desc">${t('sp.unknownText',all.length)}</p>
    <div style="display:flex;gap:8px;margin-top:16px"><button class="btn primary" data-go="reg">${t('sp.snap')}</button>${all.length?`<button class="btn ghost" data-go="map" data-sp="${id}">${t('sp.onMap')}</button>`:''}</div>`); }
  else openModal(`<div class="eyebrow">No.${pad3(id)} · ${isEn()?s.name:s.en} · <span class="rar ${s.rar}">${rarK(s.rar)}</span></div>
    <h2 style="font-size:30px;margin-top:4px">${spName(s)}</h2>
    <div class="detail-hero">${fishSVG(s)}</div>
    <p class="desc">${spDesc(s)}</p>
    <div class="facts"><div><b>${mine.length}</b><span>${t('sp.mine')}</span></div><div><b>${Math.max(...mine.map(c=>c.len))}cm</b><span>${t('sp.myBest')}</span></div><div><b>${all.length}</b><span>${t('sp.all')}</span></div></div>
    <div class="eyebrow" style="margin-bottom:8px">${t('sp.myRecords')}</div>
    <div style="display:grid;gap:6px">${mine.map(c=>`<div style="display:flex;justify-content:space-between;font-size:14px;border-bottom:1px dotted var(--line);padding:4px 0"><span>${esc(spotName(c.spot))}</span><span class="mono">${c.len}cm · ${fmtDate(c.date)}</span></div>`).join('')}</div>
    <div style="display:flex;gap:8px;margin-top:18px"><button class="btn ghost" data-go="map" data-sp="${id}">${t('sp.onMap')}</button></div>`);
  $('#sheet').querySelectorAll('[data-go]').forEach(b=>b.onclick=()=>{ closeModal(); if(b.dataset.sp) mapFilter=+b.dataset.sp; go(b.dataset.go); });
}

/* ---------- 촬영 등록 (Create) ---------- */
const emptyReg=()=>({photo:null,file:null,fname:'',cands:null,sel:null,scanning:false,lat:null,lon:null,spot:''});
let reg=emptyReg();
// 어종 판별은 서버 /api/identify (프로토타입: 참돔 1순위 고정 응답)
function renderReg(){
  const s=reg.sel?sp(reg.sel):null;
  $('#v-reg').innerHTML=`
  <div class="shead"><div><h2>${t('reg.title')}</h2><p>${t('reg.sub')}</p></div></div>
  <div class="reg">
    <div class="panel">
      <h3><span class="step">1</span>${t('reg.s1')}</h3><p class="sub">${t('reg.s1sub')}</p>
      <label class="drop" id="drop" for="photo">
        ${reg.photo?`<img src="${reg.photo}" alt="${t('reg.photoAlt')}">`:`<span class="ph"><span class="cam"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/></svg></span><b>${t('reg.drop')}</b><span>${t('reg.dropSub')}</span></span>`}
        ${reg.scanning?'<span class="scan"></span><span class="scanning-label">'+t('reg.scanning')+'</span>':''}
      </label>
      <input type="file" id="photo" accept="image/*" capture="environment" hidden>
      ${reg.cands?`<div class="result"><div class="eyebrow">${t('reg.result')}</div>${reg.cands.map(c=>{const x=sp(c.sid);return `<button class="cand" data-sid="${x.id}" aria-pressed="${reg.sel===x.id}">${fishSVG(x)}<span><b>${spName(x)}</b> <span class="rar ${x.rar}">${rarK(x.rar)}</span><span class="bar"><i style="width:${c.p}%"></i></span></span><span class="pct">${c.p}%</span></button>`;}).join('')}</div>`:''}
    </div>
    <div class="panel">
      <h3><span class="step">2</span>${t('reg.s2')}</h3><p class="sub">${t('reg.s2sub')}</p>
      <form class="form" id="regform">
        <label class="f">${t('f.species')} <select id="r-sp" required><option value="">${t('f.speciesPh')}</option>${SPECIES.map(x=>`<option value="${x.id}" ${reg.sel===x.id?'selected':''}>No.${pad3(x.id)} ${spName(x)}</option>`).join('')}</select></label>
        <div class="row2">
           <label class="f">${t('f.len')}<input type="number" id="r-len" min="1" max="300" required placeholder="${s?s.avg:'35'}"></label>
           <label class="f">${t('f.date')}<input type="date" id="r-date" value="${todayStr()}" required></label>
        </div>
        <label class="f">${t('f.spot')} <span class="h">${t('f.spotHint')}</span>
          <select id="r-spot"><option value="">${t('f.choose')}</option>${SPOTS.map(x=>`<option value="${x.n}" ${reg.spot===x.n?'selected':''}>${spotName(x.n)}</option>`).join('')}${reg.spot&&!spot(reg.spot)?`<option selected>${esc(reg.spot)}</option>`:''}</select></label>
        <div class="minimap" id="minimap">${mapSVG([], {mini:true, pick:reg.lat!=null?{lat:reg.lat,lon:reg.lon}:null})}</div>
        <label class="f">${t('f.memo')} <span class="h">${t('f.memoHint')}</span><textarea id="r-memo" placeholder="${t('f.memoPh')}"></textarea></label>
        <button class="btn primary" id="r-submit" type="submit">${t('reg.submit')}</button>
      </form>
    </div>
  </div>`;
  const inp=$('#photo'), drop=$('#drop');
  inp.onchange=()=>inp.files[0]&&handleFile(inp.files[0]);
  drop.ondragover=e=>{e.preventDefault();drop.classList.add('over');};
  drop.ondragleave=()=>drop.classList.remove('over');
  drop.ondrop=e=>{e.preventDefault();drop.classList.remove('over'); const f=e.dataTransfer.files[0]; if(f&&f.type.startsWith('image/')) handleFile(f);};
  $('#v-reg').querySelectorAll('.cand').forEach(b=>b.onclick=()=>{reg.sel=+b.dataset.sid; Sound.play('tap'); keepForm(()=>renderReg());});
  $('#r-sp').onchange=e=>{reg.sel=+e.target.value||null;};
  $('#r-spot').onchange=e=>{ const x=spot(e.target.value); if(x){reg.spot=x.n;reg.lat=x.lat;reg.lon=x.lon; keepForm(()=>renderReg());} };
  const msvg=$('#minimap svg'); msvg.onclick=e=>{ const p=svgToLatLon(msvg,e); reg.lat=p.lat; reg.lon=p.lon; reg.spot=nearestSpot(p.lat,p.lon); keepForm(()=>renderReg()); };
  $('#regform').onsubmit=e=>{ e.preventDefault(); submitCatch(); };
}
function keepForm(fn){ const v={len:$('#r-len')?.value,date:$('#r-date')?.value,memo:$('#r-memo')?.value}; fn(); if(v.len!=null){$('#r-len').value=v.len;$('#r-date').value=v.date;$('#r-memo').value=v.memo;} }
async function handleFile(f){
  if(reg.photo) URL.revokeObjectURL(reg.photo);
  reg.photo=URL.createObjectURL(f); reg.file=f; reg.fname=f.name; reg.cands=null; reg.scanning=true; keepForm(renderReg); Sound.play('scan');
  try{ const cands=await api.identify(f); if(reg.file!==f) return;
    reg.cands=cands; reg.sel=cands[0].sid; Sound.play('found'); }
  catch(e){ fail(e); }
  finally{ if(reg.file===f){ reg.scanning=false; keepForm(renderReg); } }
}
let submitting=false;
async function submitCatch(){
  const sid=+$('#r-sp').value, len=+$('#r-len').value, date=$('#r-date').value, memo=$('#r-memo').value.trim();
  if(!sid){ Sound.play('error'); toast(t('reg.needSp')); return; }
  if(!len||len<1){ Sound.play('error'); toast(t('reg.needLen')); $('#r-len').focus(); return; }
  if(reg.lat==null){ Sound.play('error'); toast(t('reg.needSpot')); return; }
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
  }catch(e){ if(!authFail(e)) fail(e); }
  finally{ submitting=false; const b=$('#r-submit'); if(b) b.disabled=false; }
}
function celebrate({c,s,before,after,isNew,newAch}){
  const lvUp=after.lv>before.lv, gain=after.xp-before.xp;
  let clock=0.5; const at=()=>{const v=clock;clock+=0.7;return v;};
  const xpAt=at(), achAt=newAch.map(()=>at()), lvAt=lvUp?at():0, btnAt=at();
  const conf=Array.from({length:18},(_,i)=>{const a=i/18*Math.PI*2, r=90+(i*37)%60; const col=['var(--float)','var(--sun)','var(--aqua)','var(--sea)'][i%4];
    return `<i style="--dx:${(Math.cos(a)*r).toFixed(0)}px;--dy:${(Math.sin(a)*r).toFixed(0)}px;background:${col};animation-delay:${(achAt[0]??xpAt)+.15}s"></i>`;}).join('');
  const d=document.createElement('div'); d.className='celebrate';
  d.innerHTML=`<div class="cel-card" role="dialog" aria-label="${t('cel.label')}">
    <div class="cel-bub">${Array.from({length:8},(_,i)=>`<i style="left:${8+i*12}%;width:${5+i%3*3}px;height:${5+i%3*3}px;animation-duration:${3+i%4}s;animation-delay:${-i*.5}s"></i>`).join('')}</div>
    <div class="cel-fish">${fishSVG(s)}</div>
    <div class="eyebrow" style="position:relative">${isNew?t('cel.new'):t('cel.done')}</div>
    <h2>No.${pad3(s.id)} ${spName(s)} · ${c.len}cm</h2>
    <div class="cel-xp stage" style="animation-delay:${xpAt}s"><span>+${gain} XP</span><span class="xpbar"><i id="celbar" style="width:${before.pct}%"></i></span></div>
    ${newAch.map((a,i)=>`<div class="cel-ach stage" style="animation-delay:${achAt[i]}s"><div class="medal" style="animation-delay:${achAt[i]}s"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M5 12.5 10 17 19 7"/></svg></div><div><small>${t('cel.ach')}</small><b>${achText(a)[0]}</b><span>${achText(a)[1]}</span></div></div>`).join('')}
    <div class="confetti">${newAch.length?conf:''}</div>
    ${lvUp?`<div class="cel-lv stage" style="animation-delay:${lvAt}s">${t('cel.lvUp')} Lv.${before.lv} → <b>Lv.${after.lv}</b><div style="font-size:14px;color:var(--muted)">${t('cel.newTitle')} · ${titleOf(after.lv)}</div></div>`:''}
    <div class="cel-actions stage" style="animation-delay:${btnAt}s"><button class="btn ghost" data-act="dex">${t('cel.toDex')}</button><button class="btn primary" data-act="map">${t('cel.toMap')}</button></div>
  </div>`;
  document.body.append(d);
  Sound.play('splash'); newAch.forEach((_,i)=>Sound.play('ach',achAt[i])); if(lvUp) Sound.play('level',lvAt);
  const bar=d.querySelector('#celbar');
  setTimeout(()=>{bar.style.width=(lvUp?100:after.pct)+'%';},(xpAt+.3)*1000);
  if(lvUp) setTimeout(()=>{bar.style.transition='none';bar.style.width='0%';requestAnimationFrame(()=>requestAnimationFrame(()=>{bar.style.transition='';bar.style.width=after.pct+'%';}));},lvAt*1000);
  d.addEventListener('click',e=>{ const b=e.target.closest('[data-act]'); if(!b) return; d.remove();
    if(b.dataset.act==='map'){ mapFilter=0; mapFocus=c.id; mapSel=null; go('map'); } else render(); });
}
function levelUp(st){ const d=document.createElement('div'); d.className='levelup'; d.innerHTML=`<div class="card">${fishSVG(MASCOT)}<div class="eyebrow">${t('cel.lvUp')}</div><div class="big">Lv.${st.lv}</div><h2>${titleOf(st.lv)}</h2><p style="color:var(--muted);margin:0 0 16px">${t('cel.titleGot')}</p><button class="btn primary">${t('cel.continue')}</button></div>`; d.onclick=()=>d.remove(); document.body.append(d); }

/* ---------- 조황 지도 (모든 유저, 인근 지역 묶음) ---------- */
let mapFilter=0, mapSel=null, mapFocus=null, mapMine=false;
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
      return `<g class="pin${hl?' hl':''}${isNew?' new':''}" data-key="${esc(k.key)}" transform="translate(${x.toFixed(1)} ${y.toFixed(1)})"><title>${esc(spotName(k.label))} · ${spName(s)} ${c.len}cm</title>${rip}<g class="bobber" style="animation-delay:${(c.id%7)*-0.37}s"><g class="sc">
        <ellipse cx="0" cy="1" rx="9" ry="2.6" style="fill:var(--sea-deep)" opacity=".18"/>
        <line x1="0" y1="-19" x2="0" y2="-12" style="stroke:var(--ink)" stroke-width="1.6" stroke-linecap="round"/>
        <path d="M-6.5 -6 A6.5 6.5 0 0 1 6.5 -6Z" style="fill:${col}"/><path d="M-6.5 -6 A6.5 6.5 0 0 0 6.5 -6Z" fill="#fff"/>
        <circle cx="0" cy="-6" r="6.5" fill="none" style="stroke:var(--ink)" stroke-width="1.2" opacity=".55"/></g></g></g>`; }
    const R=13+Math.min(n,8)*1.6;
    return `<g class="cl${hl?' hl':''}${isNew?' new':''}" data-key="${esc(k.key)}" transform="translate(${x.toFixed(1)} ${y.toFixed(1)})"><title>${esc(t('map.near',spotName(k.label)))} · ${t('unit.records',n)}</title>${rip}<g class="dropper"><g class="sc">
      <circle r="${R+5}" class="halo"/><circle r="${R}" class="body"/>
      <text y="1">${n}</text>${k.mine?`<circle cx="${(R*.72).toFixed(1)}" cy="${(-R*.72).toFixed(1)}" r="5" style="fill:var(--float);stroke:#fff" stroke-width="2"/>`:''}</g></g></g>`; }).join('');
}
function catchCard(c,hl){ const s=sp(c.sid);
  return `<div class="dcard${hl?' hl':''}" data-id="${c.id}"><div class="ph">${c.photo?`<img src="${c.photo}" data-photo="${c.id}" title="${t('photo.view')}" style="cursor:zoom-in" alt="${esc(t('map.photo',spName(s)))}">`:fishSVG(s)}</div>
    <div style="min-width:0"><div><b>${spName(s)}</b> <span class="len">${c.len}cm</span>${c.id===mapFocus?'<span class="newtag">NEW</span>':''}</div>
    <div class="who">${esc(c.user)} · ${fmtDate(c.date)} · ${esc(spotName(c.spot))}</div>${c.memo?`<div class="memo">${esc(c.memo)}</div>`:''}</div></div>`; }
function renderMap(){
  const base=state.catches.filter(c=>!mapMine||c.user===ME);
  if(mapFilter&&!base.some(c=>c.sid===mapFilter)) mapFilter=0;
  const list=base.filter(c=>!mapFilter||c.sid===mapFilter);
  const cl=clusterize(list);
  if(mapFocus){ const k=cl.find(k=>k.items.some(c=>c.id===mapFocus)); if(k) mapSel=k.key; }
  const sel=cl.find(k=>k.key===mapSel); if(!sel) mapSel=null;
  const recent=list.slice().sort((a,b)=>b.date.localeCompare(a.date)||b.id-a.id);
  let side;
  if(sel){ const spc={}; sel.items.forEach(c=>spc[c.sid]=(spc[c.sid]||0)+1);
    side=`<div class="cpanel-head"><button class="btn ghost sm" data-back>${t('map.back')}</button>
      <h3>${esc(t('map.near',spotName(sel.label)))}</h3><p>${t('map.stat',sel.items.length,Object.keys(spc).length,Math.max(...sel.items.map(c=>c.len)))}</p>
      <div class="spchips">${Object.entries(spc).sort((a,b)=>b[1]-a[1]).map(([id,n])=>`<span>${spName(sp(+id))} ${n}</span>`).join('')}</div></div>
      <div class="feed">${sel.items.map(c=>catchCard(c,c.id===mapFocus)).join('')}</div>`; }
  else side=`<div class="cpanel-head"><h3>${t('map.recent')}</h3><p>${t('map.recentSub',recent.length)}</p></div>
      <div class="feed">${recent.map(c=>`<button class="fitem" data-id="${c.id}">${fishSVG(sp(c.sid))}<span><b>${spName(sp(c.sid))}</b> <span class="len">${c.len}cm</span><div class="who">${esc(c.user)} · ${esc(spotName(c.spot))}</div></span><span class="who">${fmtDate(c.date)}</span></button>`).join('')}</div>`;
  $('#v-map').innerHTML=`
  <div class="shead"><div><h2>${t('map.title')}</h2><p>${t('map.sub')}</p></div>
    <div style="display:flex;gap:12px;align-items:end;flex-wrap:wrap">
      <div class="chips" id="mmine">${[['all',t('map.everyone')],['mine',t('map.onlyMine')]].map(([k,l])=>`<button type="button" class="chip" data-m="${k}" aria-pressed="${mapMine===(k==='mine')}">${l}</button>`).join('')}</div>
      <label class="f" style="min-width:200px">${t('map.filter')}<select id="mf"><option value="0">${t('map.allSp',base.length)}</option>${SPECIES.map(s=>{const n=base.filter(c=>c.sid===s.id).length;return n?`<option value="${s.id}" ${mapFilter===s.id?'selected':''}>${spName(s)} (${n})</option>`:'';}).join('')}</select></label></div></div>
  <div class="mapwrap">
    <div><div class="bigmap" id="bigmap">${mapSVG([]).replace('</svg>',clusterSVG(cl)+'</svg>')}</div>
      <div class="legend"><span><i style="background:var(--sea)"></i>${t('hab.seaSp')}</span><span><i style="background:var(--r-normal)"></i>${t('hab.freshSp')}</span><span><i style="background:var(--float)"></i>${t('map.mine')}</span><span><i style="background:var(--sea);width:16px;height:16px;vertical-align:-3px"></i>${t('map.cluster')}</span></div></div>
    <div id="side">${side}</div>
  </div>`;
  $('#mf').onchange=e=>{mapFilter=+e.target.value; mapSel=null; mapFocus=null; renderMap();};
  $('#mmine').onclick=e=>{ const b=e.target.closest('[data-m]'); if(!b) return; mapMine=b.dataset.m==='mine'; mapSel=null; mapFocus=null; Sound.play('tap'); renderMap(); };
  $('#bigmap svg').onclick=e=>{ const g=e.target.closest('[data-key]'); mapFocus=null; mapSel=g?g.dataset.key:null; renderMap(); };
  const side$=$('#side');
  side$.onclick=e=>{ const img=e.target.closest('img[data-photo]'); if(img){ showPhoto(+img.dataset.photo); return; }
    if(e.target.closest('[data-back]')){mapSel=null;mapFocus=null;renderMap();return;}
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
  <div class="shead"><div><h2>${t('ach.title')}</h2><p>${t('ach.sub',A.filter(a=>a.done).length,A.length)}</p></div></div>
  <div class="split">
    <div class="achgrid">${A.map(a=>`<div class="ach ${a.done?'done':''}"><div class="medal">${a.done?medal:lock}</div><div><h3>${achText(a)[0]}</h3><p>${achText(a)[1]}</p>
      <div class="prog"><span class="bar"><i style="width:${a.v/a.goal*100}%"></i></span><span>${a.v}/${a.goal}</span></div></div></div>`).join('')}</div>
    <div>
      <div class="panel">
        <div class="eyebrow">${t('ach.rank')}</div>
        <ol class="rank" style="margin-top:10px">${users.map((x,i)=>`<li class="${x.u===ME?'me':''}"><span class="n">${i+1}</span><span><b>${esc(x.u)}</b><div class="s">Lv.${x.lv} ${titleOf(x.lv)} · ${t('unit.species',x.species.size)}</div></span><span class="mono">${x.xp} XP</span></li>`).join('')}</ol>
        <div class="lvtable"><div style="border:0;font-family:var(--f-mono);font-size:11px;letter-spacing:.1em">${t('ach.formula')}</div>
          ${t('titles').slice(1).map((ti,i)=>`<div class="${st.lv===i+1?'cur':''}"><span>Lv.${i+1} ${ti}</span><span class="mono">${LV[i]} XP</span></div>`).join('')}</div>
      </div>
    </div>
  </div>`;
}

/* ---------- 내 기록 (Update / Delete) ---------- */
let confirmDel=null, logQ='', logSort='new';
const LOG_SORT={
  new:(a,b)=>b.date.localeCompare(a.date)||b.id-a.id, old:(a,b)=>a.date.localeCompare(b.date)||a.id-b.id,
  big:(a,b)=>b.len-a.len||b.id-a.id, small:(a,b)=>a.len-b.len||a.id-b.id,
};
// 어종(한/영), 장소(한/영), 메모에서 찾기
function logMatches(c,q){ if(!q) return true; const s=sp(c.sid), x=spot(c.spot); return [s.name,s.en,c.spot,x&&x.en,c.memo].some(v=>v&&v.toLowerCase().includes(q)); }
function renderLog(){
  $('#v-log').innerHTML=`
  <div class="shead"><div><h2>${t('log.title')}</h2><p>${t('log.sub')}</p></div>
    <button class="btn primary sm" id="addbtn">${t('log.add')}</button></div>
  <div style="display:flex;gap:12px;flex-wrap:wrap;align-items:end;margin-bottom:14px">
    <label class="f" style="flex:1 1 240px">${t('log.search')} <span class="h mono" id="logcount"></span><input type="text" id="logq" value="${esc(logQ)}" placeholder="${t('log.searchPh')}" autocomplete="off"></label>
    <label class="f" style="flex:0 1 180px">${t('log.sort')}<select id="logsort">${['new','old','big','small'].map(k=>`<option value="${k}" ${logSort===k?'selected':''}>${t('log.sort.'+k)}</option>`).join('')}</select></label>
  </div>
  <div class="tablewrap" id="logtable"></div>`;
  $('#addbtn').onclick=()=>go('reg');
  $('#logq').oninput=e=>{ logQ=e.target.value; renderLogTable(); };
  $('#logsort').onchange=e=>{ logSort=e.target.value; Sound.play('tap'); renderLogTable(); };
  $('#logtable').onclick=e=>{
    const img=e.target.closest('img[data-photo]'); if(img){ showPhoto(+img.dataset.photo); return; }
    const b=e.target.closest('button'); if(!b) return;
    if(b.dataset.ask){confirmDel=+b.dataset.ask; renderLogTable();}
    else if(b.dataset.cancel!==undefined){confirmDel=null; renderLogTable();}
    else if(b.dataset.del) deleteCatch(+b.dataset.del);
    else if(b.dataset.edit) editCatch(+b.dataset.edit);
  };
  renderLogTable();
}
function renderLogTable(){
  const all=userStats(ME).list, q=logQ.trim().toLowerCase();
  const L=all.filter(c=>logMatches(c,q)).sort(LOG_SORT[logSort]);
  $('#logcount').textContent=q?t('log.count',L.length,all.length):'';
  $('#logtable').innerHTML=`${L.length?`<table><thead><tr><th>${t('f.photo')}</th><th>${t('f.species')}</th><th>${t('f.len').replace(' (cm)','')}</th><th>${t('f.spot')}</th><th>${t('f.date')}</th><th>${t('f.memo')}</th><th></th></tr></thead><tbody>
  ${L.map(c=>{const s=sp(c.sid);return `<tr><td><div class="thumb">${c.photo?`<img src="${c.photo}" data-photo="${c.id}" title="${t('photo.view')}" style="cursor:zoom-in" alt="${esc(t('map.photo',spName(s)))}">`:fishSVG(s)}</div></td><td><b>${spName(s)}</b></td><td class="num">${c.len}cm</td><td>${esc(spotName(c.spot))}</td><td class="num">${fmtDate(c.date)}</td><td style="color:var(--muted);max-width:220px">${esc(c.memo)||'–'}</td>
   <td><div class="actions">${confirmDel===c.id?`<span style="font-size:13px;align-self:center">${t('log.ask')}</span><button class="btn danger" data-del="${c.id}">${t('log.del')}</button><button class="btn ghost sm" data-cancel>${t('log.cancel')}</button>`:`<button class="btn ghost sm" data-edit="${c.id}">${t('log.edit')}</button><button class="btn ghost sm" data-ask="${c.id}">${t('log.del')}</button>`}</div></td></tr>`;}).join('')}
  </tbody></table>`:`<div class="empty">${all.length?t('log.noResult'):t('log.empty')}</div>`}`;
}
// 조과 사진 크게 보기
function showPhoto(id){
  const c=state.catches.find(x=>x.id===id); if(!c||!c.photo) return; const s=sp(c.sid);
  Sound.play('tap');
  openModal(`<div class="eyebrow">${esc(c.user)} · ${fmtDate(c.date)} · ${esc(spotName(c.spot))}</div><h2 style="font-size:24px;margin:4px 0 12px">${spName(s)} ${c.len}cm</h2>
  <img src="${c.photo}" alt="${esc(t('map.photo',spName(s)))}" style="display:block;width:100%;max-height:70vh;object-fit:contain;border-radius:18px;background:var(--sea-soft)">
  ${c.memo?`<p class="desc" style="margin:12px 0 0">${esc(c.memo)}</p>`:''}`);
}
async function deleteCatch(id){
  const c=state.catches.find(x=>x.id===id);
  try{ await api.deleteCatch(id); confirmDel=null; if(mapFocus===id) mapFocus=null; await loadCatches();
    Sound.play('del'); toast(esc(t('log.deleted',spName(sp(c.sid)),c.len))); render(); }
  catch(e){ if(!authFail(e)) fail(e); }
}
function editCatch(id){
  const c=state.catches.find(x=>x.id===id);
  openModal(`<div class="eyebrow">${t('edit.title')}</div><h2 style="font-size:24px;margin:4px 0 16px">${spName(sp(c.sid))} ${c.len}cm</h2>
  <form class="form" id="editform">
    <label class="f">${t('f.species')}<select id="e-sp">${SPECIES.map(x=>`<option value="${x.id}" ${x.id===c.sid?'selected':''}>${spName(x)}</option>`).join('')}</select></label>
    <div class="row2"><label class="f">${t('f.len')}<input type="number" id="e-len" min="1" value="${c.len}" required></label><label class="f">${t('f.date')}<input type="date" id="e-date" value="${c.date}" required></label></div>
    <label class="f">${t('f.spot')}<select id="e-spot">${SPOTS.map(x=>`<option value="${x.n}" ${x.n===c.spot?'selected':''}>${spotName(x.n)}</option>`).join('')}${spot(c.spot)?'':`<option selected>${esc(c.spot)}</option>`}</select></label>
    <label class="f">${t('f.memo')}<textarea id="e-memo">${esc(c.memo)}</textarea></label>
    <div style="display:flex;gap:8px;justify-content:flex-end"><button type="button" class="btn ghost" data-close>${t('log.cancel')}</button><button class="btn primary" type="submit">${t('edit.save')}</button></div>
  </form>`);
  $('#editform').onsubmit=async e=>{ e.preventDefault();
    const body={sid:+$('#e-sp').value, len:+$('#e-len').value||c.len, spot:$('#e-spot').value, date:$('#e-date').value, memo:$('#e-memo').value.trim()};
    try{ await api.updateCatch(id,body); await loadCatches(); closeModal(); Sound.play('found'); toast(t('edit.done')); render(); }
    catch(e){ if(!authFail(e)) fail(e); } };
}

const MASCOT={id:99,name:'손맛이',c:['#FF8A65','#FFE3D4','#FF6A45'],body:{h:28,hb:.88,hump:.4,sn:.6,ped:6.5,eye:.24},dorsal:{t:'soft',a:.32,b:.78,hs:10},anal:{a:.62,b:.8,h:8},tail:{t:'fork',len:34,h:24,fork:10},pat:[{t:'bands',n:3,a:.3,b:.72,w:7,col:'#FFFFFF',o:.8}]};
$('#mascot').innerHTML=fishSVG(MASCOT);
$('#bubbles').innerHTML=Array.from({length:14},(_,i)=>{const sz=4+(i*7)%10;return `<i style="left:${(i*37)%100}%;width:${sz}px;height:${sz}px;animation-duration:${4+(i*1.3)%5}s;animation-delay:${-(i*0.9)%6}s"></i>`;}).join('');
async function resetDemo(){
  try{ await api.resetDemo(); await loadAll(); mapSel=mapFocus=null; mapFilter=0; mapMine=false; logQ=''; logSort='new'; confirmDel=null; confirmReset=false; reg=emptyReg(); go('dex'); Sound.play('bubble'); toast(t('demo.reset')); }
  catch(e){ fail(e); }
}
document.addEventListener('keydown',e=>{ if(e.shiftKey&&e.key==='R'&&!e.target.closest?.('input,textarea,select')&&ME) resetDemo(); });

/* ---------- 로그인 ---------- */
// 세션이 끊기면(401) 로그인 화면으로
function authFail(e){ if(e.status!==401) return false; ME=null; showLogin(); toast(t('login.again')); return true; }
const langChips=id=>`<div class="chips" id="${id}">${[['ko','한국어'],['en','English']].map(([k,l])=>`<button type="button" class="chip" data-lang="${k}" aria-pressed="${SETTINGS.lang===k}">${l}</button>`).join('')}</div>`;
// 기존 CSS가 type=password를 꾸미지 않아서 text 입력칸과 같은 모양을 직접 지정
const PW_STYLE='width:100%;background:var(--paper);border:2px solid var(--line);border-radius:14px;padding:9px 12px;font-size:14px;font-family:var(--f-body)';
function showLogin(){
  const keep={n:$('#l-name')?.value||'', pw:$('#l-pw')?.value||''};
  openModal(`<div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap"><div class="eyebrow">${t('brand')}</div>${langChips('l-lang')}</div><h2 style="font-size:26px;margin:4px 0 6px">${t('login.title')}</h2>
  <p class="desc" style="margin:0 0 16px">${t('login.sub')}<br><span style="color:var(--muted);font-size:13px">${t('login.demo')}</span></p>
  <form class="form" id="loginform">
    <label class="f">${t('login.name')}<input type="text" id="l-name" maxlength="12" autocomplete="username" required></label>
    <label class="f">${t('login.pw')}<input type="password" id="l-pw" autocomplete="current-password" required style="${PW_STYLE}"></label>
    <div style="display:flex;gap:8px;justify-content:flex-end"><button type="button" class="btn ghost" id="l-signup">${t('login.signup')}</button><button class="btn primary" type="submit">${t('login.title')}</button></div>
  </form>`, {locked:true});
  $('#l-name').value=keep.n; $('#l-pw').value=keep.pw;
  const send=async fn=>{ const n=$('#l-name').value.trim(), pw=$('#l-pw').value;
    if(!n||!pw){ Sound.play('error'); toast(t('login.need')); return; }
    try{ const r=await fn(n,pw); Sound.play('bubble'); await enter(r.user); }catch(e){ fail(e); } };
  $('#loginform').onsubmit=e=>{ e.preventDefault(); send(api.login); };
  $('#l-signup').onclick=()=>send(api.signup);
  $('#l-lang').onclick=e=>{ const b=e.target.closest('[data-lang]'); if(b) setLang(b.dataset.lang); };
  $('#l-name').focus();
}
async function enter(user){
  ME=user; await loadCatches(); closeModal(true);
  mapSel=mapFocus=null; mapFilter=0; mapMine=false; logQ=''; logSort='new'; confirmDel=null; reg=emptyReg(); dexFilter='all'; go('dex');
}
async function logout(){ try{ await api.logout(); }catch(_){} ME=null; $('#lvchip').innerHTML=''; showLogin(); }

/* ---------- 설정 ---------- */
let confirmReset=false;
function setLang(lang){
  if(SETTINGS.lang===lang) return;
  SETTINGS.lang=lang; saveSettings(); Sound.play('tap'); applyStatic();
  if(ME) render(); else showLogin();
}
// index.html에 고정된 글자(제목, 탭 이름 등)
function applyStatic(){
  document.documentElement.lang=SETTINGS.lang; document.title=t('brand');
  $('.brand h1').textContent=t('brand'); $('.brand .tag').textContent=t('brand.tag');
  $('#tabs').setAttribute('aria-label',t('nav')); $('#lvchip').setAttribute('aria-label',t('lvchip'));
  document.querySelectorAll('[data-i18n]').forEach(el=>el.textContent=t(el.dataset.i18n));
}
function renderSet(){
  const st=userStats(ME);
  const onOff=[['on',t('set.on')],['off',t('set.off')]].map(([k,l])=>`<button type="button" class="chip" data-snd="${k}" aria-pressed="${SETTINGS.sound===(k==='on')}">${l}</button>`).join('');
  $('#v-set').innerHTML=`
  <div class="shead"><div><h2>${t('set.title')}</h2><p>${t('set.sub')}</p></div></div>
  <div style="display:grid;gap:20px;grid-template-columns:repeat(auto-fit,minmax(min(100%,300px),1fr));align-items:start">
    <div class="panel"><h3>${t('set.account')}</h3><p class="sub">Lv.${st.lv} ${titleOf(st.lv)} · ${st.xp} XP</p>
      <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap"><span>${t('set.loggedIn',esc(ME))}</span><button class="btn ghost sm" id="s-logout">${t('set.logout')}</button></div></div>
    <div class="panel"><h3>${t('set.sound')}</h3><p class="sub">${t('set.soundSub')}</p>
      <div style="display:grid;gap:14px">
        <div class="chips" id="s-snd">${onOff}</div>
        <label class="f">${t('set.volume')} <span class="h mono" id="s-volv">${SETTINGS.volume}%</span>
          <input type="range" id="s-vol" min="0" max="100" step="5" value="${SETTINGS.volume}" ${SETTINGS.sound?'':'disabled'} style="width:100%;accent-color:var(--float)"></label>
        <div><button class="btn ghost sm" id="s-test" ${SETTINGS.sound?'':'disabled'}>${t('set.preview')}</button></div>
      </div></div>
    <div class="panel"><h3>${t('set.lang')}</h3><p class="sub">${t('set.langSub')}</p>${langChips('s-lang')}</div>
    <div class="panel"><h3>${t('set.demo')}</h3><p class="sub">${t('set.demoSub')}</p>
      <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">${confirmReset?`<span style="font-size:13px">${t('set.resetAsk')}</span><button class="btn danger" id="s-reset-go">${t('set.reset')}</button><button class="btn ghost sm" id="s-reset-no">${t('log.cancel')}</button>`:`<button class="btn ghost sm" id="s-reset">${t('set.reset')}</button>`}</div></div>
  </div>`;
  $('#s-logout').onclick=logout;
  $('#s-snd').onclick=e=>{ const b=e.target.closest('[data-snd]'); if(!b) return; SETTINGS.sound=b.dataset.snd==='on'; saveSettings(); Sound.play('tap'); renderSet(); };
  $('#s-vol').oninput=e=>{ SETTINGS.volume=+e.target.value; $('#s-volv').textContent=SETTINGS.volume+'%'; saveSettings(); };
  $('#s-vol').onchange=()=>Sound.play('tap');
  $('#s-test').onclick=()=>Sound.play('level');
  $('#s-lang').onclick=e=>{ const b=e.target.closest('[data-lang]'); if(b) setLang(b.dataset.lang); };
  if(confirmReset){ $('#s-reset-go').onclick=resetDemo; $('#s-reset-no').onclick=()=>{ confirmReset=false; renderSet(); }; }
  else $('#s-reset').onclick=()=>{ confirmReset=true; renderSet(); };
}

/* ---------- 시작: 서버에서 데이터 받기 ---------- */
(async function boot(){
  applyStatic();
  try{ await loadAll(); }catch(e){ toast(t('server.down')); return; }
  // 시연용: 페이지를 열 때마다 이전 세션을 끊고 로그인 화면부터 시작
  try{ await api.logout(); }catch(_){}
  showLogin();
})();
