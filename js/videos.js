initAdminLayout();
setupVideoUpload('vFile', 'vUrl');
setupImageUpload('vThumbnailFile', 'vThumbnail');

let allVideos = [];

async function loadVideos() {
  try {
    allVideos = await apiCall('/videos');
    renderTable();
  } catch (err) {
    console.error(err);
  }
}

function renderTable() {
  const tbody = document.getElementById('videoBody');
  if (allVideos.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:#94a3b8;">No videos</td></tr>';
    return;
  }
  tbody.innerHTML = allVideos.map(v => `
    <tr>
      <td>${v.sortOrder}</td>
      <td><strong>${escapeHtml(v.title)}</strong><br><small style="color:#94a3b8;">${escapeHtml(v.description)}</small></td>
      <td><span class="badge">${escapeHtml(v.tag)}</span></td>
      <td style="max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${escapeHtml(v.videoUrl)}</td>
      <td>
        <button class="btn btn-sm btn-outline" onclick="editVideo('${v._id}')">Edit</button>
        <button class="btn btn-sm btn-danger" onclick="deleteVideo('${v._id}')">Delete</button>
      </td>
    </tr>
  `).join('');
}

function showAddModal() {
  document.getElementById('modalTitle').textContent = 'Add Video';
  document.getElementById('videoForm').reset();
  document.getElementById('editId').value = '';
  openModal('videoModal');
}

function editVideo(id) {
  const v = allVideos.find(x => x._id === id);
  if (!v) return;
  document.getElementById('modalTitle').textContent = 'Edit Video';
  document.getElementById('editId').value = v._id;
  document.getElementById('vTitle').value = v.title;
  document.getElementById('vDesc').value = v.description || '';
  document.getElementById('vTag').value = v.tag || 'Cinematic';
  document.getElementById('vOrder').value = v.sortOrder || 0;
  document.getElementById('vUrl').value = v.videoUrl;
  document.getElementById('vThumbnail').value = v.thumbnailUrl || '';
  openModal('videoModal');
}

async function saveVideo() {
  const saveBtn = document.getElementById('saveVideoBtn');
  const editId = document.getElementById('editId').value;
  const body = {
    title: document.getElementById('vTitle').value.trim(),
    description: document.getElementById('vDesc').value.trim(),
    tag: document.getElementById('vTag').value,
    sortOrder: parseInt(document.getElementById('vOrder').value) || 0,
    videoUrl: document.getElementById('vUrl').value.trim(),
    thumbnailUrl: document.getElementById('vThumbnail').value.trim()
  };

  saveBtn.disabled = true;
  saveBtn.textContent = 'Saving...';

  try {
    if (editId) {
      await apiCall('/videos/' + editId, { method: 'PUT', body: JSON.stringify(body) });
    } else {
      await apiCall('/videos', { method: 'POST', body: JSON.stringify(body) });
    }
    closeModal('videoModal');
    loadVideos();
  } catch (err) {
    alert('Error: ' + err.message);
  } finally {
    saveBtn.disabled = false;
    saveBtn.textContent = 'Save';
  }
}

async function deleteVideo(id) {
  if (!confirm('Delete this video?')) return;
  try {
    await apiCall('/videos/' + id, { method: 'DELETE' });
    loadVideos();
  } catch (err) {
    alert('Error: ' + err.message);
  }
}

loadVideos();
