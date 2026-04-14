initAdminLayout();
setupImageUpload('dlImageFile', 'dlImage');

let allDeals = [];

async function loadDeals() {
  try {
    allDeals = await apiCall('/deals');
    renderTable();
  } catch (err) {
    console.error(err);
  }
}

function renderTable() {
  const tbody = document.getElementById('dealBody');
  if (allDeals.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;color:#94a3b8;">No deals</td></tr>';
    return;
  }
  tbody.innerHTML = allDeals.map(d => {
    const expired = new Date(d.expiresAt) < Date.now();
    return `
      <tr>
        <td><img class="thumb" src="${escapeHtml(d.image)}" alt="${escapeHtml(d.name)}"></td>
        <td><strong>${escapeHtml(d.name)}</strong></td>
        <td>${escapeHtml(d.destination)}</td>
        <td>${formatPKR(d.oldPrice)}</td>
        <td>${formatPKR(d.newPrice)}</td>
        <td>${escapeHtml(d.badge)}</td>
        <td style="color:${expired ? 'var(--admin-danger)' : 'inherit'}">${formatDate(d.expiresAt)}${expired ? ' (expired)' : ''}</td>
        <td>
          <button class="btn btn-sm btn-outline" onclick="editDeal('${d._id}')">Edit</button>
          <button class="btn btn-sm btn-danger" onclick="deleteDeal('${d._id}')">Delete</button>
        </td>
      </tr>
    `;
  }).join('');
}

function showAddModal() {
  document.getElementById('modalTitle').textContent = 'Add Deal';
  document.getElementById('dealForm').reset();
  document.getElementById('editId').value = '';
  openModal('dealModal');
}

function editDeal(id) {
  const d = allDeals.find(x => x._id === id);
  if (!d) return;
  document.getElementById('modalTitle').textContent = 'Edit Deal';
  document.getElementById('editId').value = d._id;
  document.getElementById('dlName').value = d.name;
  document.getElementById('dlDest').value = d.destination;
  document.getElementById('dlOldPrice').value = d.oldPrice;
  document.getElementById('dlNewPrice').value = d.newPrice;
  document.getElementById('dlBadge').value = d.badge;
  document.getElementById('dlImage').value = d.image;
  document.getElementById('dlDesc').value = d.description;
  // Format expiresAt for datetime-local input
  const dt = new Date(d.expiresAt);
  const local = new Date(dt.getTime() - dt.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  document.getElementById('dlExpires').value = local;
  openModal('dealModal');
}

async function saveDeal() {
  const saveBtn = document.getElementById('saveDealBtn');
  const editId = document.getElementById('editId').value;
  const body = {
    name: document.getElementById('dlName').value.trim(),
    destination: document.getElementById('dlDest').value.trim(),
    oldPrice: parseInt(document.getElementById('dlOldPrice').value),
    newPrice: parseInt(document.getElementById('dlNewPrice').value),
    badge: document.getElementById('dlBadge').value.trim(),
    image: document.getElementById('dlImage').value.trim(),
    description: document.getElementById('dlDesc').value.trim(),
    expiresAt: new Date(document.getElementById('dlExpires').value).toISOString()
  };

  saveBtn.disabled = true;
  saveBtn.textContent = 'Saving...';

  try {
    if (editId) {
      await apiCall('/deals/' + editId, { method: 'PUT', body: JSON.stringify(body) });
    } else {
      await apiCall('/deals', { method: 'POST', body: JSON.stringify(body) });
    }
    closeModal('dealModal');
    loadDeals();
  } catch (err) {
    alert('Error: ' + err.message);
  } finally {
    saveBtn.disabled = false;
    saveBtn.textContent = 'Save';
  }
}

async function deleteDeal(id) {
  if (!confirm('Delete this deal?')) return;
  try {
    await apiCall('/deals/' + id, { method: 'DELETE' });
    loadDeals();
  } catch (err) {
    alert('Error: ' + err.message);
  }
}

loadDeals();
