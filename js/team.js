initAdminLayout();
setupImageUpload('tImageFile', 'tImage');

let allMembers = [];

async function loadMembers() {
  try {
    allMembers = await apiCall('/team');
    renderTable();
  } catch (err) {
    console.error(err);
  }
}

function renderTable() {
  const tbody = document.getElementById('teamBody');
  if (allMembers.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:#94a3b8;">No team members</td></tr>';
    return;
  }
  tbody.innerHTML = allMembers.map(m => `
    <tr>
      <td><img class="thumb" src="${escapeHtml(m.image)}" alt="${escapeHtml(m.name)}"></td>
      <td>${m.sortOrder}</td>
      <td><strong>${escapeHtml(m.name)}</strong></td>
      <td>${escapeHtml(m.role)}</td>
      <td>
        <button class="btn btn-sm btn-outline" onclick="editMember('${m._id}')">Edit</button>
        <button class="btn btn-sm btn-danger" onclick="deleteMember('${m._id}')">Delete</button>
      </td>
    </tr>
  `).join('');
}

function showAddModal() {
  document.getElementById('modalTitle').textContent = 'Add Team Member';
  document.getElementById('teamForm').reset();
  document.getElementById('editId').value = '';
  openModal('teamModal');
}

function editMember(id) {
  const m = allMembers.find(x => x._id === id);
  if (!m) return;
  document.getElementById('modalTitle').textContent = 'Edit Team Member';
  document.getElementById('editId').value = m._id;
  document.getElementById('tName').value = m.name;
  document.getElementById('tRole').value = m.role;
  document.getElementById('tBio').value = m.bio || '';
  document.getElementById('tImage').value = m.image;
  document.getElementById('tOrder').value = m.sortOrder || 0;
  openModal('teamModal');
}

async function saveMember() {
  const saveBtn = document.getElementById('saveMemberBtn');
  const editId = document.getElementById('editId').value;
  const body = {
    name: document.getElementById('tName').value.trim(),
    role: document.getElementById('tRole').value.trim(),
    bio: document.getElementById('tBio').value.trim(),
    image: document.getElementById('tImage').value.trim(),
    sortOrder: parseInt(document.getElementById('tOrder').value) || 0
  };

  // Show loading state
  saveBtn.disabled = true;
  saveBtn.textContent = 'Saving...';

  try {
    if (editId) {
      await apiCall('/team/' + editId, { method: 'PUT', body: JSON.stringify(body) });
    } else {
      await apiCall('/team', { method: 'POST', body: JSON.stringify(body) });
    }
    closeModal('teamModal');
    loadMembers();
  } catch (err) {
    alert('Error: ' + err.message);
  } finally {
    // Restore button state
    saveBtn.disabled = false;
    saveBtn.textContent = 'Save';
  }
}

async function deleteMember(id) {
  if (!confirm('Delete this team member?')) return;
  try {
    await apiCall('/team/' + id, { method: 'DELETE' });
    loadMembers();
  } catch (err) {
    alert('Error: ' + err.message);
  }
}

loadMembers();
