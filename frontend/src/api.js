const API_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api`;

export function getToken() { return localStorage.getItem('token'); }
export function setSession(data) {
  localStorage.setItem('token', data.token);
  localStorage.setItem('user', JSON.stringify(data.user));
}
export function clearSession() { localStorage.removeItem('token'); localStorage.removeItem('user'); }
export function getUser() { try { return JSON.parse(localStorage.getItem('user') || 'null'); } catch { return null; } }

async function request(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (res.status === 401 && path !== '/auth/login') {
    clearSession();
    window.location.href = '/login';
  }
  if (!res.ok) throw new Error(data.error || 'Error de comunicación');
  return data;
}

export async function api(path, options = {}) {
  try { return await request(path, options); }
  catch (e) {
    if (e instanceof TypeError) {
      await new Promise(r => setTimeout(r, 350));
      return request(path, options);
    }
    throw e;
  }
}
