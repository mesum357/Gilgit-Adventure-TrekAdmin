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
  document.getElementById('itineraryRows').innerHTML = '';
  document.getElementById('dGallery').value = '';
  document.getElementById('dIncludes').value = '';
  document.getElementById('dExcludes').value = '';
  document.getElementById('dDuration').value = '';
  document.getElementById('dGroupSize').value = '';
  document.getElementById('dDifficulty').value = '';
  document.getElementById('dBestSeason').value = '';
  document.getElementById('dRoute').value = '';
  openModal('destModal');
}

/* ── Itinerary dynamic rows ── */
function addItineraryRow(day, title, desc) {
  var container = document.getElementById('itineraryRows');
  var row = document.createElement('div');
  row.className = 'form-row';
  row.style.cssText = 'align-items:flex-start;margin-bottom:6px;gap:6px;';
  row.innerHTML =
    '<input type="text" class="form-control itin-day" placeholder="Day" value="' + (day || '') + '" style="width:60px;flex:none;">' +
    '<input type="text" class="form-control itin-title" placeholder="Title" value="' + (title || '') + '" style="flex:1;">' +
    '<input type="text" class="form-control itin-desc" placeholder="Description" value="' + (desc || '') + '" style="flex:2;">' +
    '<button type="button" class="btn btn-sm btn-danger" onclick="this.parentElement.remove()" style="flex:none;">×</button>';
  container.appendChild(row);
}

function getItineraryFromForm() {
  var rows = document.querySelectorAll('#itineraryRows .form-row');
  var itinerary = [];
  rows.forEach(function(row) {
    var day = row.querySelector('.itin-day').value.trim();
    var title = row.querySelector('.itin-title').value.trim();
    var desc = row.querySelector('.itin-desc').value.trim();
    if (day || title || desc) {
      itinerary.push({ day: day, title: title, description: desc });
    }
  });
  return itinerary;
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

  // Tour-specific fields
  document.getElementById('dDuration').value = d.duration || '';
  document.getElementById('dGroupSize').value = d.groupSize || '';
  document.getElementById('dDifficulty').value = d.difficulty || '';
  document.getElementById('dBestSeason').value = d.bestSeason || '';
  document.getElementById('dRoute').value = (d.route || []).join(', ');
  document.getElementById('dGallery').value = (d.gallery || []).join('\n');
  document.getElementById('dIncludes').value = (d.includes || []).join('\n');
  document.getElementById('dExcludes').value = (d.excludes || []).join('\n');

  // Populate itinerary rows
  var itinContainer = document.getElementById('itineraryRows');
  itinContainer.innerHTML = '';
  if (d.itinerary && d.itinerary.length > 0) {
    d.itinerary.forEach(function(item) {
      addItineraryRow(item.day, item.title, item.description);
    });
  }

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
    mapY: parseInt(document.getElementById('dMapY').value) || 0,
    // Tour-specific fields
    duration: document.getElementById('dDuration').value.trim() || undefined,
    groupSize: document.getElementById('dGroupSize').value.trim() || undefined,
    difficulty: document.getElementById('dDifficulty').value || undefined,
    bestSeason: document.getElementById('dBestSeason').value.trim() || undefined,
    route: document.getElementById('dRoute').value.split(',').map(s => s.trim()).filter(Boolean),
    gallery: document.getElementById('dGallery').value.split('\n').map(s => s.trim()).filter(Boolean),
    includes: document.getElementById('dIncludes').value.split('\n').map(s => s.trim()).filter(Boolean),
    excludes: document.getElementById('dExcludes').value.split('\n').map(s => s.trim()).filter(Boolean),
    itinerary: getItineraryFromForm()
  };

  // Remove undefined fields so they don't overwrite existing data
  Object.keys(body).forEach(function(k) { if (body[k] === undefined) delete body[k]; });

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
