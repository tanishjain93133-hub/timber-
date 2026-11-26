/**
 * THE TIMBER LIGHTS — SUPABASE CONFIGURATION & SECURE CLIENT
 * Project: thrzaedubpfxdocjkmfa
 * Supports Public Storefront (anon) + Authenticated Admin (Supabase Auth JWT)
 */

window.SUPABASE_URL = 'https://thrzaedubpfxdocjkmfa.supabase.co';
window.SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRocnphZWR1YnBmeGRvY2prbWZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTU1MjYyNjAsImV4cCI6MjExMTEwMjI2MH0.QANJpewOooJI42fncbfgGiVh7qQiOXOk0k7Rd99qTvI';

window.SupabaseDB = (function () {
  const URL = window.SUPABASE_URL;
  const KEY = window.SUPABASE_ANON_KEY;
  const AUTH_STORAGE_KEY = 'timber_sb_session';

  // ── AUTH SESSION HELPERS ─────────────────────────────────────────
  function getSession() {
    try {
      const raw = sessionStorage.getItem(AUTH_STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function saveSession(session) {
    if (session && session.access_token) {
      const expiresAt = session.expires_at || (Math.floor(Date.now() / 1000) + (session.expires_in || 3600));
      sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({
        access_token: session.access_token,
        refresh_token: session.refresh_token,
        expires_at: expiresAt,
        user: session.user || null
      }));
    }
  }

  function clearSession() {
    sessionStorage.removeItem(AUTH_STORAGE_KEY);
  }

  function getAccessToken() {
    const s = getSession();
    return (s && s.access_token) ? s.access_token : null;
  }

  function isAuthenticated() {
    const s = getSession();
    if (!s || !s.access_token) return false;
    if (s.expires_at && Math.floor(Date.now() / 1000) >= s.expires_at - 30) {
      return false;
    }
    return true;
  }

  async function ensureFreshToken() {
    const s = getSession();
    if (!s || !s.access_token) return null;
    if (s.expires_at && Math.floor(Date.now() / 1000) >= s.expires_at - 60 && s.refresh_token) {
      const refreshed = await refreshSession(s.refresh_token);
      if (refreshed) return refreshed.access_token;
    }
    return s.access_token;
  }

  async function signIn(emailOrUsername, password) {
    // Allow shorthand 'admin' to map to the admin Supabase Auth account
    const email = emailOrUsername.includes('@')
      ? emailOrUsername.trim()
      : (emailOrUsername.trim().toLowerCase() === 'admin'
          ? 'admin@thetimberlights.com'
          : `${emailOrUsername.trim()}@thetimberlights.com`);

    const r = await fetch(`${URL}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: {
        'apikey': KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });

    const data = await r.json().catch(() => ({}));
    if (!r.ok || !data.access_token) {
      const msg = data.error_description || data.msg || data.message || 'Invalid credentials';
      return { ok: false, error: msg };
    }
    saveSession(data);
    return { ok: true, session: data };
  }

  async function refreshSession(refreshToken) {
    try {
      const r = await fetch(`${URL}/auth/v1/token?grant_type=refresh_token`, {
        method: 'POST',
        headers: {
          'apikey': KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ refresh_token: refreshToken })
      });
      if (!r.ok) {
        clearSession();
        return null;
      }
      const data = await r.json();
      saveSession(data);
      return data;
    } catch (e) {
      return null;
    }
  }

  async function signOut() {
    const token = getAccessToken();
    if (token) {
      try {
        await fetch(`${URL}/auth/v1/logout`, {
          method: 'POST',
          headers: { 'apikey': KEY, 'Authorization': 'Bearer ' + token }
        });
      } catch (e) {}
    }
    clearSession();
  }

  async function updatePassword(newPassword) {
    const token = await ensureFreshToken();
    if (!token) return { ok: false, error: 'Not authenticated' };

    const r = await fetch(`${URL}/auth/v1/user`, {
      method: 'PUT',
      headers: {
        'apikey': KEY,
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ password: newPassword })
    });

    const data = await r.json().catch(() => ({}));
    if (!r.ok) {
      return { ok: false, error: data.msg || data.message || 'Failed to update password' };
    }
    return { ok: true, user: data };
  }

  // ── REST API HELPERS ─────────────────────────────────────────────
  async function authHeaders(extra, useAuth) {
    const token = (useAuth !== false) ? (await ensureFreshToken()) : null;
    return Object.assign({
      'apikey': KEY,
      'Authorization': 'Bearer ' + (token || KEY),
      'Content-Type': 'application/json'
    }, extra || {});
  }

  async function select(table, params) {
    let url = `${URL}/rest/v1/${table}?select=*`;
    if (params && params.filter) url += '&' + params.filter;
    if (params && params.order)  url += '&order=' + params.order;
    if (params && params.limit)  url += '&limit=' + params.limit;
    const h = await authHeaders();
    const r = await fetch(url, { headers: h });
    if (!r.ok) {
      const e = await r.text();
      console.error('SB select error:', table, e);
      return [];
    }
    return r.json();
  }

  async function insert(table, data, options) {
    // Use return=minimal by default for anonymous inserts so RLS SELECT policies are not required
    const returnRep = (options && options.returning) || isAuthenticated();
    const h = await authHeaders({
      'Prefer': returnRep ? 'return=representation' : 'return=minimal'
    });
    const r = await fetch(`${URL}/rest/v1/${table}`, {
      method: 'POST',
      headers: h,
      body: JSON.stringify(data)
    });
    if (!r.ok) {
      const e = await r.text();
      console.error('SB insert error:', table, e);
      return null;
    }
    if (!returnRep) return { ok: true };
    return r.json().catch(() => ({ ok: true }));
  }

  async function upsert(table, data, conflictCol) {
    const h = await authHeaders({
      'Prefer': 'return=representation,resolution=merge-duplicates'
    });
    const r = await fetch(`${URL}/rest/v1/${table}?on_conflict=${conflictCol || 'id'}`, {
      method: 'POST',
      headers: h,
      body: JSON.stringify(data)
    });
    if (!r.ok) {
      const e = await r.text();
      console.error('SB upsert error:', table, e);
      return null;
    }
    return r.json();
  }

  async function update(table, filter, data) {
    const h = await authHeaders({ 'Prefer': 'return=representation' });
    const r = await fetch(`${URL}/rest/v1/${table}?${filter}`, {
      method: 'PATCH',
      headers: h,
      body: JSON.stringify(data)
    });
    if (!r.ok) {
      const e = await r.text();
      console.error('SB update error:', table, e);
      return null;
    }
    return r.json();
  }

  async function del(table, filter) {
    const h = await authHeaders({ 'Prefer': 'return=minimal' });
    const r = await fetch(`${URL}/rest/v1/${table}?${filter}`, {
      method: 'DELETE',
      headers: h
    });
    if (!r.ok) {
      const e = await r.text();
      console.error('SB delete error:', table, e);
      return false;
    }
    return true;
  }

  // ── REALTIME SUBSCRIPTION (WITH AUTH TOKEN) ──────────────────────
  function subscribeRealtime(table, callback) {
    const wsUrl = URL.replace('https://', 'wss://') + '/realtime/v1/websocket?apikey=' + KEY + '&vsn=1.0.0';
    let ws;
    let heartbeatTimer;
    let closedManually = false;

    function connect() {
      if (closedManually) return;
      ws = new WebSocket(wsUrl);
      ws.onopen = () => {
        const token = getAccessToken() || KEY;
        ws.send(JSON.stringify({
          topic: `realtime:public:${table}`,
          event: 'phx_join',
          payload: {
            config: {
              broadcast: { self: true },
              presence: { key: '' },
              postgres_changes: [{ event: '*', schema: 'public', table: table }]
            },
            access_token: token
          },
          ref: '1'
        }));
        ws.send(JSON.stringify({
          topic: `realtime:public:${table}`,
          event: 'access_token',
          payload: { access_token: token },
          ref: '2'
        }));
        heartbeatTimer = setInterval(() => {
          if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ topic: 'phoenix', event: 'heartbeat', payload: {}, ref: 'heartbeat' }));
          }
        }, 29000);
      };
      ws.onmessage = (msg) => {
        try {
          const data = JSON.parse(msg.data);
          if (data.event === 'postgres_changes' && data.payload && data.payload.data) {
            callback(data.payload.data);
          }
        } catch (e) {}
      };
      ws.onclose = () => {
        clearInterval(heartbeatTimer);
        if (!closedManually) setTimeout(connect, 3000);
      };
      ws.onerror = () => { try { ws.close(); } catch (e) {} };
    }

    connect();
    return {
      close: () => {
        closedManually = true;
        clearInterval(heartbeatTimer);
        if (ws) try { ws.close(); } catch (e) {}
      }
    };
  }

  // ── STOREFRONT HELPERS ───────────────────────────────────────────
  function mapDbProductToLocal(p) {
    return {
      id: p.id,
      model: p.model,
      name: p.name,
      height: p.height || '18"',
      wood: p.wood || 'Premium Ghana Teak Wood',
      price: Number(p.price) || 0,
      priceUnit: p.price_unit || p.priceUnit || 'MRP (Incl. of all taxes)',
      category: p.category || 'hanging',
      categoryLabel: p.category_label || p.categoryLabel || 'Wooden Hanging Light',
      image: p.image || 'images/products/tl_baluster_finial.jpg',
      page: p.page || 1,
      isFeatured: p.is_featured !== undefined ? p.is_featured : true,
      stock: p.stock !== undefined ? p.stock : 20,
      rating: Number(p.rating) || 5,
      reviewsCount: p.reviews_count || p.reviewsCount || 30,
      sizeNote: p.size_note || p.sizeNote || 'Size mentioned is net wood size. Bulb will be as per actual.',
      shortDesc: p.short_desc || p.shortDesc || '',
      features: Array.isArray(p.features) ? p.features : [],
      specifications: (p.specifications && typeof p.specifications === 'object') ? p.specifications : {}
    };
  }

  async function fetchProducts() {
    const rows = await select('products', { order: 'page.asc,created_at.asc' });
    return Array.isArray(rows) ? rows.map(mapDbProductToLocal) : [];
  }

  async function fetchSiteSettings() {
    const rows = await select('site_settings', { filter: 'id=eq.1', limit: 1 });
    return (rows && rows[0]) ? rows[0] : null;
  }

  function getSessionId() {
    let sid = sessionStorage.getItem('tl_session_id');
    if (!sid) {
      sid = 'tl_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
      sessionStorage.setItem('tl_session_id', sid);
    }
    return sid;
  }

  async function logQuery(type, text, productId, productName) {
    try {
      await insert('user_queries', {
        session_id: getSessionId(),
        query_type: type,
        query_text: text || null,
        product_id: productId || null,
        product_name: productName || null,
        page_url: window.location.href
      }, { returning: false });
    } catch (e) {}
  }

  return {
    signIn, signOut, isAuthenticated, getSession, getAccessToken, updatePassword,
    select, insert, upsert, update, del,
    subscribeRealtime, fetchProducts, fetchSiteSettings, mapDbProductToLocal,
    getSessionId, logQuery
  };
})();
