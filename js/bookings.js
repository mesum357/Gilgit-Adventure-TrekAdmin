initAdminLayout();

let allBookings = [];
let currentPage = 1;

async function loadBookings() {
  try {
    allBookings = await apiCall('/bookings');
    currentPage = 1;
    renderTable();
  } catch (err) {
    console.error(err);
  }
}

function renderTable() {
  const tbody = document.getElementById('bookBody');
  if (allBookings.length === 0) {
    tbody.innerHTML = '<tr><td colspan="9" style="text-align:center;color:#94a3b8;">No bookings yet</td></tr>';
    renderPagination('bookPagination', 1, 1, function(){});
    return;
  }
  const p = paginate(allBookings, currentPage, 15);
  tbody.innerHTML = p.data.map(b => `
    <tr>
      <td><strong>${escapeHtml(b.reference)}</strong></td>
      <td>
        ${b.customerName ? '<strong>' + escapeHtml(b.customerName) + '</strong><br>' : ''}
        ${b.customerEmail ? '<span style="font-size:0.75rem;color:#64748b;">' + escapeHtml(b.customerEmail) + '</span><br>' : ''}
        ${b.customerPhone ? '<span style="font-size:0.75rem;color:#64748b;">' + escapeHtml(b.customerPhone) + '</span>' : ''}
        ${!b.customerName && !b.customerEmail ? '<span style="color:#94a3b8;">—</span>' : ''}
      </td>
      <td>${escapeHtml(b.destination)}</td>
      <td>${b.checkIn || 'Flexible'} &rarr; ${b.checkOut || 'Flexible'}</td>
      <td>${b.adults}A ${b.children ? '+ ' + b.children + 'C' : ''}</td>
      <td>${b.totalPrice ? formatPKR(b.totalPrice) : '—'}</td>
      <td><span class="badge badge-${b.status}">${b.status}</span></td>
      <td>${formatDate(b.createdAt)}</td>
      <td>
        <button class="btn btn-sm btn-outline" onclick="editStatus('${b._id}', '${b.status}')">Status</button>
        <button class="btn btn-sm btn-danger" onclick="deleteBooking('${b._id}')">Delete</button>
      </td>
    </tr>
  `).join('');
  renderPagination('bookPagination', p.page, p.totalPages, function(pg) { currentPage = pg; renderTable(); });
}

function editStatus(id, currentStatus) {
  document.getElementById('editBookingId').value = id;
  document.getElementById('bookingStatus').value = currentStatus;
  openModal('statusModal');
}

async function updateStatus() {
  const updateBtn = document.getElementById('updateStatusBtn');
  const id = document.getElementById('editBookingId').value;
  const status = document.getElementById('bookingStatus').value;

  updateBtn.disabled = true;
  updateBtn.textContent = 'Updating...';

  try {
    await apiCall('/bookings/' + id, { method: 'PUT', body: JSON.stringify({ status }) });
    closeModal('statusModal');
    loadBookings();
  } catch (err) {
    alert('Error: ' + err.message);
  } finally {
    updateBtn.disabled = false;
    updateBtn.textContent = 'Update';
  }
}

async function deleteBooking(id) {
  if (!confirm('Delete this booking?')) return;
  try {
    await apiCall('/bookings/' + id, { method: 'DELETE' });
    loadBookings();
  } catch (err) {
    alert('Error: ' + err.message);
  }
}

loadBookings();
