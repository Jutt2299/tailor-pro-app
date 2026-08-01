/* ============================================================
   payments.js – Payments Overview Page
   ============================================================ */

'use strict';

const Payments = (() => {

  let _filter = 'all';

  function render() {
    const page = document.getElementById('page-payments');
    const stats = DB.getStats();

    page.innerHTML = `
      <div class="app-bar">
        <div>
          <h1>💰 Payments</h1>
          <div class="subtitle">Financial Overview</div>
        </div>
      </div>

      <div class="page-content">

        <!-- Summary Card -->
        <div class="payment-summary">
          <div class="payment-summary-title">Total Revenue</div>
          <div class="payment-summary-amount">${Utils.currency(stats.totalRevenue)}</div>
          <div class="payment-breakdown">
            <div class="payment-breakdown-item">
              <span class="value">${Utils.currency(stats.totalCollected)}</span>
              <span class="label">✅ Collected</span>
            </div>
            <div class="payment-breakdown-item">
              <span class="value">${Utils.currency(stats.totalPending)}</span>
              <span class="label">⏳ Pending</span>
            </div>
            <div class="payment-breakdown-item">
              <span class="value">${getOrderCountByPayment('paid')}</span>
              <span class="label">💚 Paid Orders</span>
            </div>
          </div>
        </div>

        <!-- Status Filter -->
        <div class="filter-tabs">
          <button class="filter-tab active" data-pfilter="all">All</button>
          <button class="filter-tab" data-pfilter="unpaid">🔴 Unpaid</button>
          <button class="filter-tab" data-pfilter="partial">🟡 Partial</button>
          <button class="filter-tab" data-pfilter="paid">💚 Paid</button>
        </div>

        <div id="payments-list"></div>
      </div>`;

    document.querySelectorAll('[data-pfilter]').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('[data-pfilter]').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        _filter = tab.dataset.pfilter;
        renderList();
      });
    });

    renderList();
  }

  function getOrderCountByPayment(status) {
    return DB.getOrders().filter(o => o.paymentStatus === status).length;
  }

  function renderList() {
    let orders = DB.getOrders();
    if (_filter !== 'all') orders = orders.filter(o => o.paymentStatus === _filter);
    orders = orders.sort((a, b) => {
      // Unpaid first, then partial, then paid
      const rank = { unpaid: 0, partial: 1, paid: 2 };
      return (rank[a.paymentStatus] || 0) - (rank[b.paymentStatus] || 0);
    });

    const list = document.getElementById('payments-list');
    if (!orders.length) {
      list.innerHTML = `
        <div class="empty-state">
          <span class="empty-icon">💰</span>
          <h3>No payment records</h3>
          <p>${_filter !== 'all' ? 'No orders match this filter' : 'Orders will appear here once created'}</p>
        </div>`;
      return;
    }

    list.innerHTML = orders.map(o => paymentCard(o)).join('');

    // Payment update listeners
    list.querySelectorAll('.payment-update-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const orderId = btn.dataset.orderId;
        openUpdatePaymentInline(orderId, btn);
      });
    });

    list.querySelectorAll('.receipt-btn').forEach(btn => {
      btn.addEventListener('click', () => Modals.openReceiptForOrder(btn.dataset.orderId));
    });
  }

  function paymentCard(o) {
    const customer = DB.getCustomerById(o.customerId);
    const balance  = Utils.balanceDue(o);
    const bgColor  = o.paymentStatus === 'unpaid' ? 'var(--unpaid-bg)' :
                     o.paymentStatus === 'partial' ? 'var(--partial-bg)' : 'var(--paid-bg)';

    return `
      <div class="payment-row" style="border-left:4px solid ${
        o.paymentStatus === 'unpaid' ? 'var(--unpaid)' :
        o.paymentStatus === 'partial' ? 'var(--partial)' : 'var(--paid)'}">
        <div class="payment-row-header">
          <div>
            <div class="payment-row-name">${Utils.esc(customer?.name || 'Unknown')}</div>
            <div class="payment-row-dress">🧵 ${Utils.esc(o.dressDescription)}</div>
          </div>
          ${Utils.paymentBadgeHTML(o.paymentStatus)}
        </div>

        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:12px">
          <div style="background:var(--surface-2);border-radius:var(--r-sm);padding:8px;text-align:center">
            <div style="font-size:.68rem;color:var(--text-4);margin-bottom:2px">Total</div>
            <div style="font-weight:700;font-size:.85rem">${Utils.currency(o.totalAmount)}</div>
          </div>
          <div style="background:var(--paid-bg);border-radius:var(--r-sm);padding:8px;text-align:center">
            <div style="font-size:.68rem;color:var(--text-4);margin-bottom:2px">Paid</div>
            <div style="font-weight:700;font-size:.85rem;color:#15803D">${Utils.currency(o.amountPaid)}</div>
          </div>
          <div style="background:${balance > 0 ? 'var(--unpaid-bg)' : 'var(--paid-bg)'};border-radius:var(--r-sm);padding:8px;text-align:center">
            <div style="font-size:.68rem;color:var(--text-4);margin-bottom:2px">Balance</div>
            <div style="font-weight:700;font-size:.85rem;color:${balance > 0 ? 'var(--unpaid)' : '#15803D'}">${Utils.currency(balance)}</div>
          </div>
        </div>

        ${o.previousBalance > 0 ? `
          <div style="font-size:.75rem;color:var(--text-3);margin-bottom:8px">
            Previous balance: <strong style="color:var(--unpaid)">${Utils.currency(o.previousBalance)}</strong>
          </div>` : ''}

        <div style="font-size:.72rem;color:var(--text-4);margin-bottom:10px">
          📅 Delivery: ${Utils.formatDate(o.deliveryDate)} &nbsp;|&nbsp; ${Utils.orderStatusBadgeHTML(o.status)}
        </div>

        <!-- Inline Payment Update -->
        <div id="pay-inline-${o.id}" class="hidden" style="background:var(--accent-light);border-radius:var(--r-md);padding:12px;margin-bottom:10px">
          <label style="font-size:.78rem;font-weight:600;color:var(--primary);display:block;margin-bottom:6px">Update Amount Paid (Rs.)</label>
          <div style="display:flex;gap:8px">
            <input type="number" id="pay-input-${o.id}" class="form-control" style="flex:1" value="${o.amountPaid}" min="0" placeholder="Enter amount">
            <button class="btn btn-primary btn-sm" onclick="Payments.savePay('${o.id}')">Save</button>
            <button class="btn btn-ghost btn-sm" onclick="document.getElementById('pay-inline-${o.id}').classList.add('hidden')">✕</button>
          </div>
        </div>

        <div style="display:flex;gap:6px;flex-wrap:wrap">
          ${o.paymentStatus !== 'paid' ? `
            <button class="btn btn-primary btn-sm payment-update-btn" data-order-id="${o.id}">💳 Update Payment</button>` : ''}
          <button class="btn btn-secondary btn-sm receipt-btn" data-order-id="${o.id}">🧾 Receipt</button>
        </div>
      </div>`;
  }

  function openUpdatePaymentInline(orderId, btn) {
    const inline = document.getElementById(`pay-inline-${orderId}`);
    if (inline) inline.classList.toggle('hidden');
  }

  function savePay(orderId) {
    const input = document.getElementById(`pay-input-${orderId}`);
    if (!input) return;
    const amount = parseFloat(input.value) || 0;
    DB.updateOrderPayment(orderId, amount);
    Utils.toast('Payment updated!', 'success');
    render();
  }

  return { render, savePay };
})();
