/* ============================================================
   orders.js – Orders List Page
   ============================================================ */

'use strict';

const Orders = (() => {

  let _filter = 'all';
  let _search = '';

  function render() {
    const page = document.getElementById('page-orders');
    page.innerHTML = `
      <div class="app-bar">
        <div>
          <h1>📋 Orders</h1>
          <div class="subtitle" id="orders-subtitle">All orders</div>
        </div>
      </div>

      <div class="page-content">
        <div class="search-bar">
          <span class="search-icon">🔍</span>
          <input type="text" id="orders-search" placeholder="Search by customer or dress..." autocomplete="off">
        </div>

        <div class="filter-tabs" id="orders-filter-tabs">
          <button class="filter-tab active" data-filter="all">All</button>
          <button class="filter-tab" data-filter="pending">⏳ Pending</button>
          <button class="filter-tab" data-filter="in-progress">🧵 In Progress</button>
          <button class="filter-tab" data-filter="ready">🔵 Ready</button>
          <button class="filter-tab" data-filter="delivered">📦 Delivered</button>
          <button class="filter-tab" data-filter="completed">✅ Completed</button>
        </div>

        <div id="orders-list"></div>
      </div>`;

    // Filter tabs
    document.querySelectorAll('#orders-filter-tabs .filter-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('#orders-filter-tabs .filter-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        _filter = tab.dataset.filter;
        renderList();
      });
    });

    // Search
    document.getElementById('orders-search').addEventListener('input', e => {
      _search = e.target.value.toLowerCase().trim();
      renderList();
    });

    renderList();
  }

  function renderList() {
    let orders = DB.getOrders();
    if (_filter !== 'all') orders = orders.filter(o => o.status === _filter);
    if (_search) {
      orders = orders.filter(o => {
        const customer = DB.getCustomerById(o.customerId);
        return (
          o.dressDescription.toLowerCase().includes(_search) ||
          (customer && customer.name.toLowerCase().includes(_search)) ||
          (customer && customer.phone.includes(_search))
        );
      });
    }

    const subtitle = document.getElementById('orders-subtitle');
    if (subtitle) subtitle.textContent = `${orders.length} order${orders.length !== 1 ? 's' : ''}`;

    const list = document.getElementById('orders-list');
    if (!orders.length) {
      list.innerHTML = `
        <div class="empty-state">
          <span class="empty-icon">📋</span>
          <h3>No orders found</h3>
          <p>${_filter !== 'all' ? 'No orders match this filter' : 'Add customers to create orders'}</p>
        </div>`;
      return;
    }

    list.innerHTML = orders.map(o => orderCard(o)).join('');

    // Action buttons
    list.querySelectorAll('[data-action]').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        const { action, orderId } = btn.dataset;
        handleAction(action, orderId);
      });
    });
  }

  function orderCard(o) {
    const customer = DB.getCustomerById(o.customerId);
    const balance  = Utils.balanceDue(o);
    const isOverdue = o.deliveryDate && Utils.isPast(o.deliveryDate) &&
                      !['delivered','completed'].includes(o.status);

    return `
      <div class="order-card">
        <div class="order-card-header">
          <div style="flex:1;min-width:0">
            <div class="order-dress-title">🧵 ${Utils.esc(o.dressDescription)}</div>
            <div class="order-customer-name" style="cursor:pointer;color:var(--primary)" onclick="Modals.openProfile('${o.customerId}')">
              👤 ${Utils.esc(customer?.name || 'Unknown')}
            </div>
          </div>
          <div style="display:flex;flex-direction:column;align-items:flex-end;gap:4px;flex-shrink:0">
            ${Utils.orderStatusBadgeHTML(o.status)}
            ${Utils.paymentBadgeHTML(o.paymentStatus)}
          </div>
        </div>

        ${o.specialInstructions ? `
          <div style="background:var(--surface-2);border-radius:var(--r-sm);padding:7px 10px;
                      font-size:.76rem;color:var(--text-3);margin-bottom:10px">
            ✂️ ${Utils.esc(o.specialInstructions)}
          </div>` : ''}

        <div class="order-card-footer">
          <div>
            <div class="order-amount">${Utils.currency(o.totalAmount)}</div>
            ${balance > 0 ? `<div style="font-size:.72rem;color:var(--unpaid)">Due: ${Utils.currency(balance)}</div>` : ''}
          </div>
          <div class="order-delivery ${isOverdue ? 'text-danger' : ''}">
            📅 ${Utils.formatDate(o.deliveryDate)}
            ${isOverdue ? '<span style="color:var(--unpaid);font-weight:700"> · Overdue!</span>' : ''}
          </div>
        </div>

        <!-- Action Row -->
        <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:12px;padding-top:12px;border-top:1px solid var(--border-light)">
          ${statusActions(o.status, o.id)}
          <button class="btn btn-secondary btn-sm" data-action="receipt" data-order-id="${o.id}">🧾 Receipt</button>
          <button class="btn btn-ghost btn-sm" data-action="edit" data-order-id="${o.id}">✏️ Edit</button>
          <button class="btn btn-danger btn-sm" data-action="delete" data-order-id="${o.id}">🗑️</button>
        </div>
      </div>`;
  }

  function statusActions(status, orderId) {
    const actions = {
      pending:     [['in-progress', '🧵 Start',   'btn-secondary']],
      'in-progress':[['ready',     '🔵 Mark Ready','btn-secondary']],
      ready:       [['delivered',  '📦 Delivered', 'btn-secondary']],
      delivered:   [['completed',  '✅ Complete',  'btn-primary']],
      completed:   [],
    };
    return (actions[status] || []).map(([nextStatus, label, cls]) =>
      `<button class="btn ${cls} btn-sm" data-action="status" data-order-id="${orderId}" data-next="${nextStatus}">${label}</button>`
    ).join('');
  }

  async function handleAction(action, orderId) {
    if (action === 'receipt') {
      Modals.openReceiptForOrder(orderId);
    } else if (action === 'edit') {
      Modals.openEditOrder(orderId);
    } else if (action === 'status') {
      // handled by data-next attribute, so re-read
      const btn = document.querySelector(`[data-action="status"][data-order-id="${orderId}"]`);
      if (!btn) return;
      const next = btn.dataset.next;
      DB.updateOrderStatus(orderId, next);
      Utils.toast(`Order marked as ${next.replace('-', ' ')}!`, 'success');
      renderList();
    } else if (action === 'delete') {
      const ok = await Utils.confirm({
        icon: '🗑️', title: 'Delete Order',
        message: 'Are you sure you want to delete this order? This cannot be undone.',
        confirmText: 'Delete', danger: true,
      });
      if (ok) {
        DB.deleteOrder(orderId);
        Utils.toast('Order deleted', 'info');
        renderList();
      }
    }
  }

  // Called from modals (delete from profile view)
  async function deleteOrderFromProfile(orderId, customerId) {
    const ok = await Utils.confirm({
      icon: '🗑️', title: 'Delete Order',
      message: 'Are you sure? This cannot be undone.',
      confirmText: 'Delete', danger: true,
    });
    if (ok) {
      DB.deleteOrder(orderId);
      Utils.toast('Order deleted', 'info');
      Modals.renderProfile(customerId);
    }
  }

  return { render, renderList, deleteOrderFromProfile };
})();
