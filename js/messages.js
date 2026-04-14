initAdminLayout();

let allMessages = [];
let currentMsgId = null;
let msgPage = 1;

async function loadMessages() {
  try {
    allMessages = await apiCall('/contact');
    msgPage = 1;
    renderTable();
  } catch (err) {
    console.error(err);
  }
}

function renderTable() {
  const filter = document.getElementById('statusFilter').value;
  const filtered = filter === 'all' ? allMessages : allMessages.filter(m => m.status === filter);
  const tbody = document.getElementById('msgBody');

  if (filtered.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:#94a3b8;">No messages found</td></tr>';
    renderPagination('msgPagination', 1, 1, function(){});
    return;
  }

  const p = paginate(filtered, msgPage, 15);
  tbody.innerHTML = p.data.map((m, i) => `
    <tr style="${m.status === 'unread' ? 'font-weight:600;' : ''}">
      <td>${(p.page - 1) * 15 + i + 1}</td>
      <td>${escapeHtml(m.name)}</td>
      <td>${escapeHtml(m.email)}</td>
      <td>${escapeHtml(m.subject)}</td>
      <td><span class="badge badge-${m.status}">${m.status}</span></td>
      <td>${formatDate(m.createdAt)}</td>
      <td>
        <button class="btn btn-sm btn-primary" onclick="viewMsg('${m._id}')">View</button>
        <button class="btn btn-sm btn-danger" onclick="deleteMsg('${m._id}')">Delete</button>
      </td>
    </tr>
  `).join('');
  renderPagination('msgPagination', p.page, p.totalPages, function(pg) { msgPage = pg; renderTable(); });
}

function viewMsg(id) {
  const m = allMessages.find(msg => msg._id === id);
  if (!m) return;
  currentMsgId = id;

  document.getElementById('modalSubject').textContent = m.subject;
  document.getElementById('modalName').textContent = m.name;
  document.getElementById('modalEmail').textContent = m.email;
  document.getElementById('modalPhone').textContent = m.phone || '—';
  document.getElementById('modalDate').textContent = formatDate(m.createdAt);
  document.getElementById('modalMessage').textContent = m.message;
  document.getElementById('modalStatus').value = m.status;

  openModal('viewModal');

  if (m.status === 'unread') {
    apiCall('/contact/' + id, {
      method: 'PUT',
      body: JSON.stringify({ status: 'read' })
    }).then(() => {
      m.status = 'read';
      renderTable();
    });
  }
}

async function updateStatus() {
  const updateBtn = document.getElementById('updateMsgStatusBtn');
  if (!currentMsgId) return;
  const status = document.getElementById('modalStatus').value;

  updateBtn.disabled = true;
  updateBtn.textContent = 'Saving...';

  try {
    await apiCall('/contact/' + currentMsgId, {
      method: 'PUT',
      body: JSON.stringify({ status })
    });
    const m = allMessages.find(msg => msg._id === currentMsgId);
    if (m) m.status = status;
    renderTable();
    closeModal('viewModal');
  } catch (err) {
    alert('Error: ' + err.message);
  } finally {
    updateBtn.disabled = false;
    updateBtn.textContent = 'Save Status';
  }
}

async function deleteMsg(id) {
  if (!confirm('Delete this message?')) return;
  try {
    await apiCall('/contact/' + id, { method: 'DELETE' });
    loadMessages();
  } catch (err) {
    alert('Error: ' + err.message);
  }
}

document.getElementById('statusFilter').addEventListener('change', function() { msgPage = 1; renderTable(); });

loadMessages();
