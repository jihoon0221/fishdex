/* ---------- 서버 API 호출 모음 ---------- */
const api = (() => {
  async function req(method, url, body) {
    const opt = { method, headers: {} };
    if (body instanceof FormData) opt.body = body;
    else if (body !== undefined) { opt.headers['Content-Type'] = 'application/json'; opt.body = JSON.stringify(body); }
    const res = await fetch('/api' + url, opt);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) { const e = new Error(data.error || '서버와 통신하지 못했어요.'); e.status = res.status; throw e; }
    return data;
  }
  return {
    species: () => req('GET', '/species'),
    spots: () => req('GET', '/spots'),
    catches: () => req('GET', '/catches'),
    me: () => req('GET', '/me'),
    login: (name, password) => req('POST', '/login', { name, password }),
    signup: (name, password) => req('POST', '/signup', { name, password }),
    logout: () => req('POST', '/logout'),
    identify: file => { const fd = new FormData(); fd.append('photo', file); return req('POST', '/identify', fd); },
    createCatch: fd => req('POST', '/catches', fd),
    updateCatch: (id, body) => req('PUT', '/catches/' + id, body),
    deleteCatch: id => req('DELETE', '/catches/' + id),
    resetDemo: () => req('POST', '/demo/reset'),
  };
})();
