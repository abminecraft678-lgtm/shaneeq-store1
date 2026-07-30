// admin/js/admin-auth.js
// Handles admin authentication: login request, JWT storage, and guarding
// the dashboard page from unauthenticated access.

const ADMIN_TOKEN_KEY = 'shaneeq_admin_token';
const ADMIN_INFO_KEY = 'shaneeq_admin_info';

async function adminLogin(email, password) {
  const res = await fetch(`${API_BASE_URL}/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Login failed');

  localStorage.setItem(ADMIN_TOKEN_KEY, data.token);
  localStorage.setItem(ADMIN_INFO_KEY, JSON.stringify({ name: data.name, email: data.email }));
  return data;
}

function getAdminToken() {
  return localStorage.getItem(ADMIN_TOKEN_KEY);
}

function getAdminInfo() {
  return JSON.parse(localStorage.getItem(ADMIN_INFO_KEY) || 'null');
}

function adminLogout() {
  localStorage.removeItem(ADMIN_TOKEN_KEY);
  localStorage.removeItem(ADMIN_INFO_KEY);
  window.location.href = 'login.html';
}

// Call at the top of any protected admin page - redirects to login if no token.
function requireAdminAuth() {
  if (!getAdminToken()) {
    window.location.href = 'login.html';
  }
}

// Authenticated fetch helper for all admin API calls (adds Bearer token,
// and auto-logs-out on 401 so an expired session doesn't get stuck).
async function adminApiFetch(path, options = {}) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getAdminToken()}`,
      ...(options.headers || {}),
    },
  });

  if (res.status === 401) {
    adminLogout();
    throw new Error('Session expired. Please sign in again.');
  }

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
}
