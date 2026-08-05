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
          <h1>📋 ${I18n.t('ordersTitle')}</h1>
          <div class="subtitle" id="orders-subtitle">${I18n.t('allOrders')}</div>
        </div>
      </div>

      <div class="page-content">
        <div class="search-bar">
          <span class="search-icon">🔍</span>
          <input type="text" id="orders-search" placeholder="${I18n.t('searchOrders')}" autocomplete="off">
        </div>

        <div class="filter-tabs" id="orders-filter-tabs">
          <button class="filter-tab active" data-filter="all">${I18n.t('filterAll')}</button>
          <button class="filter-tab" data-filter="pending">⏳ ${I18n.t('pending')}</button>
          <button class="filter-tab" data-filter="in-progress">🧵 ${I18n.t('inProgress')}</button>
          <button class="filter-tab" data-filter="ready">🔵 ${I18n.t('ready')}</button>
          <button class="filter-tab" data-filter="delivered">📦 ${I18n.t('delivered')}</button>
          <button class="filter-tab" data-filter="completed">✅ ${I18n.t('completed')}</button>
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
    if (subtitle) subtitle.textContent = `${orders.length} ${I18n.t(orders.length !== 1 ? 'orderPlural' : 'orderSingular')}`;

    const list = document.getElementById('orders-list');
    if (!orders.length) {
      list.innerHTML = `
        <div class="empty-state">
          <span class="empty-icon">📋</span>
          <h3>${I18n.t('noOrders')}</h3>
          <p>${_filter !== 'all' ? I18n.t('noOrdersFilter') : I18n.t('createFirstOrder')}</p>
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
            ${balance > 0 ? `<div style="font-size:.72rem;color:var(--unpaid)">${I18n.t('due')}${Utils.currency(balance)}</div>` : ''}
          </div>
          <div class="order-delivery ${isOverdue ? 'text-danger' : ''}">
            📅 ${Utils.formatDate(o.deliveryDate)}
            ${isOverdue ? `<span style="color:var(--unpaid);font-weight:700"> · ${I18n.t('overdue')}</span>` : ''}
          </div>
        </div>

        <!-- Action Row -->
        <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:12px;padding-top:12px;border-top:1px solid var(--border-light)">
          ${statusActions(o.status, o.id)}
        <button class="btn btn-secondary btn-sm" data-action="receipt" data-order-id="${o.id}">🧾 ${I18n.t('receipt')}</button>
          <button class="btn btn-ghost btn-sm" data-action="edit" data-order-id="${o.id}">✏️ ${I18n.t('edit')}</button>
          <button class="btn btn-danger btn-sm" data-action="delete" data-order-id="${o.id}">🗑️</button>
        </div>
      </div>`;
  }

  function statusActions(status, orderId) {
    const actions = {
      pending:     [['in-progress', `🧵 ${I18n.t('actionStart')}`,   'btn-secondary']],
      'in-progress':[['ready',     `🔵 ${I18n.t('actionReady')}`, 'btn-secondary']],
      ready:       [['delivered',  `📦 ${I18n.t('actionDelivered')}`, 'btn-secondary']],
      delivered:   [['completed',  `✅ ${I18n.t('actionComplete')}`,  'btn-primary']],
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
      Utils.toast(`${I18n.t('orderMarked')} ${I18n.t(next.replace('-', ''))}!`, 'success');
      renderList();
    } else if (action === 'delete') {
      const ok = await Utils.confirm({
        icon: '🗑️', title: I18n.t('deleteOrder'),
        message: I18n.t('deleteOrderConfirm'),
        confirmText: I18n.t('deleteBtn'), danger: true,
      });
      if (ok) {
        DB.deleteOrder(orderId);
        Utils.toast(I18n.t('orderDeleted'), 'info');
        renderList();
      }
    }
  }

  // Called from modals (delete from profile view)
  async function deleteOrderFromProfile(orderId, customerId) {
      const ok = await Utils.confirm({
        icon: '🗑️', title: I18n.t('deleteOrder'),
        message: I18n.t('deleteOrderConfirmShort'),
        confirmText: I18n.t('deleteBtn'), danger: true,
      });
      if (ok) {
        DB.deleteOrder(orderId);
        Utils.toast(I18n.t('orderDeleted'), 'info');
        Modals.renderProfile(customerId);
      }
  }

  return { render, renderList, deleteOrderFromProfile };
})();
