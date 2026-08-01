/* ============================================================
   customers.js – Customers List Page
   ============================================================ */

'use strict';

const Customers = (() => {

  let _searchQuery = '';

  function render() {
    const page = document.getElementById('page-customers');
    page.innerHTML = `
      <div class="app-bar">
        <div>
          <h1>👥 Customers</h1>
          <div class="subtitle" id="customers-subtitle">Loading...</div>
        </div>
        <div class="app-bar-actions">
          <button class="icon-btn" id="customers-add-btn" title="Add Customer">➕</button>
        </div>
      </div>

      <div class="page-content">
        <div class="search-bar">
          <span class="search-icon">🔍</span>
          <input type="text" id="customers-search" placeholder="Search by name or phone..." autocomplete="off" value="${Utils.esc(_searchQuery)}">
        </div>
        <div id="customers-list"></div>
      </div>`;

    document.getElementById('customers-add-btn').addEventListener('click', () => Modals.openAddCustomer());
    document.getElementById('customers-search').addEventListener('input', e => {
      _searchQuery = e.target.value;
      renderList();
    });
    renderList();
  }

  function renderList() {
    const customers = DB.searchCustomers(_searchQuery);
    const subtitle  = document.getElementById('customers-subtitle');
    const list      = document.getElementById('customers-list');
    if (subtitle) subtitle.textContent = `${customers.length} customer${customers.length !== 1 ? 's' : ''}`;

    if (!customers.length) {
      list.innerHTML = `
        <div class="empty-state">
          <span class="empty-icon">👥</span>
          <h3>${_searchQuery ? 'No results found' : 'No customers yet'}</h3>
          <p>${_searchQuery ? 'Try a different name or phone number' : 'Tap the ➕ button to add your first customer'}</p>
          ${!_searchQuery ? `<button class="btn btn-primary mt-4" onclick="Modals.openAddCustomer()">➕ Add Customer</button>` : ''}
        </div>`;
      return;
    }

    list.innerHTML = customers.map(c => {
      const orders  = DB.getOrdersByCustomer(c.id);
      const active  = orders.find(o => !['completed','delivered'].includes(o.status));
      const balance = active ? Utils.balanceDue(active) : 0;
      return `
        <div class="customer-card" onclick="Modals.openProfile('${c.id}')">
          <div class="customer-avatar">${Utils.initials(c.name)}</div>
          <div class="customer-info">
            <div class="customer-name">${Utils.esc(c.name)}</div>
            <div class="customer-phone">📞 ${Utils.esc(c.phone)}</div>
            ${c.address ? `<div style="font-size:.72rem;color:var(--text-4);margin-top:2px">📍 ${Utils.esc(c.address)}</div>` : ''}
          </div>
          <div class="customer-meta">
            <span style="font-size:.72rem;color:var(--text-4)">${orders.length} order${orders.length !== 1 ? 's' : ''}</span>
            ${active ? Utils.paymentBadgeHTML(Utils.paymentStatus(active)) : ''}
            ${balance > 0 ? `<span style="font-size:.72rem;color:var(--unpaid);font-weight:600">${Utils.currency(balance)}</span>` : ''}
          </div>
        </div>`;
    }).join('');
  }

  return { render, renderList };
})();
