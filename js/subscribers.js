initAdminLayout();

let allSubscribers = [];
let subPage = 1;

async function loadSubscribers() {
  try {
    allSubscribers = await apiCall('/subscribers');
    subPage = 1;
    renderTable();
  } catch (err) {
    console.error(err);
  }
}

function renderTable() {
  const tbody = document.getElementById('subBody');
  if (allSubscribers.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;color:#94a3b8;">No subscribers yet</td></tr>';
    renderPagination('subPagination', 1, 1, function(){});
    return;
  }
  const p = paginate(allSubscribers, subPage, 15);
  tbody.innerHTML = p.data.map((s, i) => `
    <tr>
      <td>${(p.page - 1) * 15 + i + 1}</td>
      <td>${escapeHtml(s.email)}</td>
      <td>${formatDate(s.createdAt)}</td>
      <td>
        <button class="btn btn-sm btn-danger" onclick="deleteSub('${s._id}')">Delete</button>
      </td>
    </tr>
  `).join('');
  renderPagination('subPagination', p.page, p.totalPages, function(pg) { subPage = pg; renderTable(); });
}

async function deleteSub(id) {
  if (!confirm('Remove this subscriber?')) return;
  try {
    await apiCall('/subscribers/' + id, { method: 'DELETE' });
    loadSubscribers();
  } catch (err) {
    alert('Error: ' + err.message);
  }
}

loadSubscribers();
