initAdminLayout();
setupImageUpload('dImageFile', 'dImage');

let allDestinations = [];

async function loadDestinations() {
  try {
    allDestinations = await apiCall('/destinations');
    renderTable();
  } catch (err) {
    console.error(err);
  }
}

function renderTable() {
  const tbody = document.getElementById('destBody');
  if (allDestinations.length === 0) {
    tbody.innerHTML = '<tr><td colspan="9" style="text-align:center;color:#94a3b8;">No destinations</td></tr>';
    return;
  }
  tbody.innerHTML = allDestinations.map(d => `
    <tr>
      <td><img class="thumb" src="${escapeHtml(d.image)}" alt="${escapeHtml(d.name)}"></td>
      <td>${d.id}</td>
      <td><strong>${escapeHtml(d.name)}</strong></td>
      <td>${escapeHtml(d.country)}</td>
      <td>${d.category}</td>
      <td>${formatPKR(d.price)}</td>
      <td>${d.rating}</td>
      <td>${d.featured ? 'Yes' : 'No'}</td>
      <td>
        <button class="btn btn-sm btn-outline" onclick="editDest(${d.id})">Edit</button>
        <button class="btn btn-sm btn-danger" onclick="deleteDest(${d.id})">Delete</button>
      </td>
    </tr>
  `).join('');
}

function showAddModal() {
  document.getElementById('modalTitle').textContent = 'Add Service';
  document.getElementById('destForm').reset();
  document.getElementById('editId').value = '';
  openModal('destModal');
}

function editDest(id) {
  const d = allDestinations.find(x => x.id === id);
  if (!d) return;
  document.getElementById('modalTitle').textContent = 'Edit Service';
  document.getElementById('editId').value = d.id;
  document.getElementById('dId').value = d.id;
  document.getElementById('dName').value = d.name;
  document.getElementById('dCountry').value = d.country;
  document.getElementById('dCategory').value = d.category;
  document.getElementById('dPrice').value = d.price;
  document.getElementById('dRating').value = d.rating;
  document.getElementById('dReviews').value = d.reviews || 0;
  document.getElementById('dFeatured').value = d.featured ? 'true' : 'false';
  document.getElementById('dImage').value = d.image;
  document.getElementById('dDesc').value = d.description;
  document.getElementById('dHighlights').value = (d.highlights || []).join(', ');
  document.getElementById('dMapX').value = d.mapX || '';
  document.getElementById('dMapY').value = d.mapY || '';
  openModal('destModal');
}

async function saveDest() {
  const saveBtn = document.getElementById('saveBtn');
  const editId = document.getElementById('editId').value;
  const body = {
    id: parseInt(document.getElementById('dId').value),
    name: document.getElementById('dName').value.trim(),
    country: document.getElementById('dCountry').value.trim(),
    category: document.getElementById('dCategory').value,
    price: parseInt(document.getElementById('dPrice').value),
    rating: parseFloat(document.getElementById('dRating').value),
    reviews: parseInt(document.getElementById('dReviews').value) || 0,
    featured: document.getElementById('dFeatured').value === 'true',
    image: document.getElementById('dImage').value.trim(),
    description: document.getElementById('dDesc').value.trim(),
    highlights: document.getElementById('dHighlights').value.split(',').map(s => s.trim()).filter(Boolean),
    mapX: parseInt(document.getElementById('dMapX').value) || 0,
    mapY: parseInt(document.getElementById('dMapY').value) || 0
  };

  saveBtn.disabled = true;
  saveBtn.textContent = 'Saving...';

  try {
    if (editId) {
      await apiCall('/destinations/' + editId, { method: 'PUT', body: JSON.stringify(body) });
    } else {
      await apiCall('/destinations', { method: 'POST', body: JSON.stringify(body) });
    }
    closeModal('destModal');
    loadDestinations();
  } catch (err) {
    alert('Error: ' + err.message);
  } finally {
    saveBtn.disabled = false;
    saveBtn.textContent = 'Save';
  }
}

async function deleteDest(id) {
  if (!confirm('Delete this destination?')) return;
  try {
    await apiCall('/destinations/' + id, { method: 'DELETE' });
    loadDestinations();
  } catch (err) {
    alert('Error: ' + err.message);
  }
}

loadDestinations();
