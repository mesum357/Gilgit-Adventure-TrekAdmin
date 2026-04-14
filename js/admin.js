/* ============================================================
   ADMIN SHARED — Auth Guard, API Helper, Logout
   ============================================================ */

const API_BASE = '/api';

function getToken() {
  return localStorage.getItem('admin_token');
}

function requireAuth() {
  if (!getToken()) {
    window.location.href = '/admin/login.html';
  }
}

function logout() {
  localStorage.removeItem('admin_token');
  localStorage.removeItem('admin_username');
  window.location.href = '/admin/login.html';
}

async function apiCall(endpoint, options = {}) {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = 'Bearer ' + token;

  const res = await fetch(API_BASE + endpoint, {
    ...options,
    headers: { ...headers, ...options.headers }
  });

  if (res.status === 401) {
    logout();
    return null;
  }

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'API error');
  return data;
}

function initAdminLayout() {
  requireAuth();

  const username = localStorage.getItem('admin_username') || 'Admin';
  const userEl = document.getElementById('adminUser');
  if (userEl) userEl.textContent = username;

  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) logoutBtn.addEventListener('click', logout);

  // Highlight active nav link
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.admin-nav a').forEach(a => {
    const href = a.getAttribute('href');
    if (href === currentPage) a.classList.add('active');
  });

  // Dark mode
  initDarkMode();
}

function initDarkMode() {
  // Apply saved preference
  if (localStorage.getItem('admin_dark') === 'true') {
    document.body.classList.add('dark');
  }

  // Inject toggle button in topbar
  const topbarRight = document.querySelector('.topbar-right');
  if (topbarRight) {
    const btn = document.createElement('button');
    btn.className = 'btn-darkmode';
    btn.title = 'Toggle dark mode';
    btn.innerHTML = document.body.classList.contains('dark') ? '&#9788;' : '&#9790;';
    btn.addEventListener('click', () => {
      document.body.classList.toggle('dark');
      const isDark = document.body.classList.contains('dark');
      localStorage.setItem('admin_dark', isDark);
      btn.innerHTML = isDark ? '&#9788;' : '&#9790;';
    });
    topbarRight.insertBefore(btn, topbarRight.firstChild);
  }
}

function openModal(id) {
  document.getElementById(id).classList.add('open');
}

function closeModal(id) {
  document.getElementById(id).classList.remove('open');
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-PK', {
    year: 'numeric', month: 'short', day: 'numeric'
  });
}

function formatPKR(amount) {
  return 'PKR ' + Number(amount).toLocaleString('en-PK');
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

/* ── Image Upload Helper ── */
function setupImageUpload(fileInputId, urlInputId) {
  const fileInput = document.getElementById(fileInputId);
  const urlInput = document.getElementById(urlInputId);
  if (!fileInput || !urlInput) return;

  fileInput.addEventListener('change', function() {
    const file = fileInput.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { alert('Please select an image file.'); return; }
    if (file.size > 2 * 1024 * 1024) { alert('Image must be under 2MB.'); return; }

    const reader = new FileReader();
    reader.onload = function(e) {
      urlInput.value = e.target.result;
      urlInput.dispatchEvent(new Event('change'));
    };
    reader.readAsDataURL(file);
  });
}

/* ── Video Upload Helper ── */
function setupVideoUpload(fileInputId, urlInputId) {
  const fileInput = document.getElementById(fileInputId);
  const urlInput = document.getElementById(urlInputId);
  if (!fileInput || !urlInput) return;

  fileInput.addEventListener('change', function() {
    const file = fileInput.files[0];
    if (!file) return;
    if (!file.type.startsWith('video/')) { alert('Please select a video file.'); return; }
    if (file.size > 10 * 1024 * 1024) { alert('Video must be under 10MB.'); return; }

    const reader = new FileReader();
    reader.onload = function(e) {
      urlInput.value = e.target.result;
      urlInput.dispatchEvent(new Event('change'));
    };
    reader.readAsDataURL(file);
  });
}

/* ── Pagination Helper ── */
function paginate(items, page, perPage) {
  perPage = perPage || 15;
  const total = items.length;
  const totalPages = Math.ceil(total / perPage) || 1;
  page = Math.max(1, Math.min(page, totalPages));
  const start = (page - 1) * perPage;
  return { data: items.slice(start, start + perPage), page, totalPages, total };
}

function renderPagination(containerId, page, totalPages, onPageChange) {
  const el = document.getElementById(containerId);
  if (!el || totalPages <= 1) { if (el) el.innerHTML = ''; return; }
  let html = '<div style="display:flex;gap:4px;align-items:center;justify-content:center;padding:1rem;flex-wrap:wrap;">';
  html += '<button class="btn btn-sm btn-outline" ' + (page <= 1 ? 'disabled' : '') + ' data-page="' + (page - 1) + '">&laquo; Prev</button>';
  for (let i = 1; i <= totalPages; i++) {
    if (totalPages > 7 && i > 2 && i < totalPages - 1 && Math.abs(i - page) > 1) {
      if (i === 3 || i === totalPages - 2) html += '<span style="padding:0 4px;">...</span>';
      continue;
    }
    html += '<button class="btn btn-sm ' + (i === page ? 'btn-primary' : 'btn-outline') + '" data-page="' + i + '">' + i + '</button>';
  }
  html += '<button class="btn btn-sm btn-outline" ' + (page >= totalPages ? 'disabled' : '') + ' data-page="' + (page + 1) + '">Next &raquo;</button>';
  html += '</div>';
  el.innerHTML = html;
  el.querySelectorAll('[data-page]').forEach(btn => {
    btn.addEventListener('click', () => { if (!btn.disabled) onPageChange(parseInt(btn.dataset.page)); });
  });
}
