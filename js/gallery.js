initAdminLayout();
setupImageUpload('gUrlFile', 'gUrl');

let allImages = [];

async function loadImages() {
  try {
    allImages = await apiCall('/gallery');
    renderTable();
  } catch (err) {
    console.error(err);
  }
}

function renderTable() {
  const tbody = document.getElementById('galleryBody');
  if (allImages.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:#94a3b8;">No images</td></tr>';
    return;
  }
  tbody.innerHTML = allImages.map(img => `
    <tr>
      <td><img class="thumb" src="${escapeHtml(img.imageUrl)}" alt="${escapeHtml(img.altText)}"></td>
      <td>${img.sortOrder}</td>
      <td>${escapeHtml(img.altText) || '<em style="color:#94a3b8;">none</em>'}</td>
      <td>${img.hidden ? 'Yes' : 'No'}</td>
      <td>
        <button class="btn btn-sm btn-outline" onclick="editImage('${img._id}')">Edit</button>
        <button class="btn btn-sm btn-danger" onclick="deleteImage('${img._id}')">Delete</button>
      </td>
    </tr>
  `).join('');
}

function showAddModal() {
  document.getElementById('modalTitle').textContent = 'Add Image';
  document.getElementById('galleryForm').reset();
  document.getElementById('editId').value = '';
  openModal('galleryModal');
}

function editImage(id) {
  const img = allImages.find(x => x._id === id);
  if (!img) return;
  document.getElementById('modalTitle').textContent = 'Edit Image';
  document.getElementById('editId').value = img._id;
  document.getElementById('gUrl').value = img.imageUrl;
  document.getElementById('gAlt').value = img.altText || '';
  document.getElementById('gOrder').value = img.sortOrder || 0;
  document.getElementById('gHidden').value = img.hidden ? 'true' : 'false';
  openModal('galleryModal');
}

async function saveImage() {
  const saveBtn = document.getElementById('saveImageBtn');
  const editId = document.getElementById('editId').value;
  const body = {
    imageUrl: document.getElementById('gUrl').value.trim(),
    altText: document.getElementById('gAlt').value.trim(),
    sortOrder: parseInt(document.getElementById('gOrder').value) || 0,
    hidden: document.getElementById('gHidden').value === 'true'
  };

  saveBtn.disabled = true;
  saveBtn.textContent = 'Saving...';

  try {
    if (editId) {
      await apiCall('/gallery/' + editId, { method: 'PUT', body: JSON.stringify(body) });
    } else {
      await apiCall('/gallery', { method: 'POST', body: JSON.stringify(body) });
    }
    closeModal('galleryModal');
    loadImages();
  } catch (err) {
    alert('Error: ' + err.message);
  } finally {
    saveBtn.disabled = false;
    saveBtn.textContent = 'Save';
  }
}

async function deleteImage(id) {
  if (!confirm('Delete this image?')) return;
  try {
    await apiCall('/gallery/' + id, { method: 'DELETE' });
    loadImages();
  } catch (err) {
    alert('Error: ' + err.message);
  }
}

loadImages();
