/* ============================================================
   modals.js – All Modal Dialogs
   - Add/Edit Customer
   - Add/Edit Order
   - Receipt
   - Customer Profile (full-page modal)
   ============================================================ */

'use strict';

const Modals = (() => {

  /* ── Generic Modal helpers ──────────────────────────────── */
  function openOverlay(id) {
    const el = document.getElementById(id);
    if (el) requestAnimationFrame(() => el.classList.add('open'));
  }
  function closeOverlay(id) {
    const el = document.getElementById(id);
    if (el) el.classList.remove('open');
  }
  function bindClose(overlayId, ...btnIds) {
    const overlay = document.getElementById(overlayId);
    if (!overlay) return;
    overlay.addEventListener('click', e => { if (e.target === overlay) closeOverlay(overlayId); });
    btnIds.forEach(id => {
      const btn = document.getElementById(id);
      if (btn) btn.addEventListener('click', () => closeOverlay(overlayId));
    });
  }

  /* ════════════════════════════════════════════════════════════
     CUSTOMER MODAL (Add / Edit)
     ════════════════════════════════════════════════════════════ */

  function initCustomerModal() {
    const html = `
    <div class="modal-overlay" id="modal-customer">
      <div class="modal-sheet">
        <div class="modal-handle"></div>
        <div class="modal-header">
          <h2 class="modal-title" id="modal-customer-title">Add Customer</h2>
          <button class="modal-close" id="modal-customer-close">✕</button>
        </div>
        <div class="modal-body">
          <form id="form-customer" novalidate>
            <input type="hidden" id="customer-edit-id">

            <div class="section-title">👤 Personal Info</div>

            <div class="form-group">
              <label class="form-label" for="c-name">Full Name <span class="required">*</span></label>
              <input class="form-control" id="c-name" type="text" placeholder="e.g. Fatima Khan" autocomplete="off">
            </div>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label" for="c-phone">Phone <span class="required">*</span></label>
                <input class="form-control" id="c-phone" type="tel" placeholder="03xx-xxxxxxx">
              </div>
              <div class="form-group">
                <label class="form-label" for="c-address">Address</label>
                <input class="form-control" id="c-address" type="text" placeholder="Optional">
              </div>
            </div>

            <div class="section-title" style="margin-top:0">📏 Body Measurements (inches)</div>
            <div class="measurement-section">
              <div class="measurement-grid">
                <div class="measurement-field">
                  <label for="m-chest">Chest</label>
                  <input id="m-chest" type="number" step="0.5" placeholder="e.g. 36">
                </div>
                <div class="measurement-field">
                  <label for="m-waist">Waist</label>
                  <input id="m-waist" type="number" step="0.5" placeholder="e.g. 28">
                </div>
                <div class="measurement-field">
                  <label for="m-hips">Hips</label>
                  <input id="m-hips" type="number" step="0.5" placeholder="e.g. 38">
                </div>
                <div class="measurement-field">
                  <label for="m-shoulder">Shoulder</label>
                  <input id="m-shoulder" type="number" step="0.5" placeholder="e.g. 14">
                </div>
                <div class="measurement-field">
                  <label for="m-sleeve">Sleeve</label>
                  <input id="m-sleeve" type="number" step="0.5" placeholder="e.g. 22">
                </div>
                <div class="measurement-field">
                  <label for="m-length">Length</label>
                  <input id="m-length" type="number" step="0.5" placeholder="e.g. 42">
                </div>
                <div class="measurement-field">
                  <label for="m-neck">Neck</label>
                  <input id="m-neck" type="number" step="0.5" placeholder="e.g. 14">
                </div>
                <div class="measurement-field">
                  <label for="m-thigh">Thigh</label>
                  <input id="m-thigh" type="number" step="0.5" placeholder="e.g. 20">
                </div>
              </div>
              <div class="form-group" style="margin-top:12px;margin-bottom:0">
                <label class="form-label" for="m-notes">Measurement Notes</label>
                <textarea class="form-control" id="m-notes" rows="2" placeholder="Any special notes about measurements..."></textarea>
              </div>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" id="modal-customer-cancel">Cancel</button>
          <button class="btn btn-primary" id="modal-customer-save">💾 Save Customer</button>
        </div>
      </div>
    </div>`;
    document.body.insertAdjacentHTML('beforeend', html);
    bindClose('modal-customer', 'modal-customer-close', 'modal-customer-cancel');
    document.getElementById('modal-customer-save').addEventListener('click', saveCustomer);
  }

  function openAddCustomer(prefill = {}) {
    document.getElementById('modal-customer-title').textContent = 'Add New Customer';
    document.getElementById('customer-edit-id').value = '';
    clearCustomerForm();
    if (prefill.name)  document.getElementById('c-name').value  = prefill.name;
    if (prefill.phone) document.getElementById('c-phone').value = prefill.phone;
    openOverlay('modal-customer');
  }

  function openEditCustomer(customerId) {
    const customer = DB.getCustomerById(customerId);
    if (!customer) return;
    document.getElementById('modal-customer-title').textContent = 'Edit Customer';
    document.getElementById('customer-edit-id').value = customer.id;
    document.getElementById('c-name').value    = customer.name    || '';
    document.getElementById('c-phone').value   = customer.phone   || '';
    document.getElementById('c-address').value = customer.address || '';
    const m = customer.measurements || {};
    document.getElementById('m-chest').value    = m.chest    || '';
    document.getElementById('m-waist').value    = m.waist    || '';
    document.getElementById('m-hips').value     = m.hips     || '';
    document.getElementById('m-shoulder').value = m.shoulder || '';
    document.getElementById('m-sleeve').value   = m.sleeve   || '';
    document.getElementById('m-length').value   = m.length   || '';
    document.getElementById('m-neck').value     = m.neck     || '';
    document.getElementById('m-thigh').value    = m.thigh    || '';
    document.getElementById('m-notes').value    = m.notes    || '';
    openOverlay('modal-customer');
  }

  function clearCustomerForm() {
    ['c-name','c-phone','c-address','m-chest','m-waist','m-hips',
     'm-shoulder','m-sleeve','m-length','m-neck','m-thigh','m-notes']
      .forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
  }

  function saveCustomer() {
    const name  = document.getElementById('c-name').value.trim();
    const phone = document.getElementById('c-phone').value.trim();
    if (!name)  { Utils.toast('Name is required', 'error');  return; }
    if (!phone) { Utils.toast('Phone is required', 'error'); return; }

    const data = {
      name, phone,
      address: document.getElementById('c-address').value.trim(),
      measurements: {
        chest:    document.getElementById('m-chest').value,
        waist:    document.getElementById('m-waist').value,
        hips:     document.getElementById('m-hips').value,
        shoulder: document.getElementById('m-shoulder').value,
        sleeve:   document.getElementById('m-sleeve').value,
        length:   document.getElementById('m-length').value,
        neck:     document.getElementById('m-neck').value,
        thigh:    document.getElementById('m-thigh').value,
        notes:    document.getElementById('m-notes').value,
      },
    };
    const editId = document.getElementById('customer-edit-id').value;
    if (editId) {
      DB.updateCustomer(editId, data);
      Utils.toast('Customer updated!', 'success');
    } else {
      DB.addCustomer(data);
      Utils.toast('Customer added!', 'success');
    }
    closeOverlay('modal-customer');
    App.refreshCurrentPage();
  }

  /* ════════════════════════════════════════════════════════════
     ORDER MODAL (Add / Edit)
     ════════════════════════════════════════════════════════════ */

  function initOrderModal() {
    const html = `
    <div class="modal-overlay" id="modal-order">
      <div class="modal-sheet">
        <div class="modal-handle"></div>
        <div class="modal-header">
          <h2 class="modal-title" id="modal-order-title">New Order</h2>
          <button class="modal-close" id="modal-order-close">✕</button>
        </div>
        <div class="modal-body">
          <form id="form-order" novalidate>
            <input type="hidden" id="order-edit-id">
            <input type="hidden" id="order-customer-id">

            <div class="form-group">
              <label class="form-label">Customer</label>
              <div id="order-customer-display" style="
                background:var(--surface-2);border-radius:var(--r-md);
                padding:10px 14px;font-size:.9rem;color:var(--text);
                font-weight:500;border:1.5px solid var(--border);">—</div>
            </div>

            <div class="form-group">
              <label class="form-label" for="o-dress">Dress Description <span class="required">*</span></label>
              <textarea class="form-control" id="o-dress" rows="2" placeholder="e.g. Embroidered lawn suit, 3-piece..."></textarea>
            </div>

            <div class="form-group">
              <label class="form-label" for="o-instructions">Special Stitching Instructions</label>
              <textarea class="form-control" id="o-instructions" rows="2" placeholder="e.g. Boat neck, puff sleeves, fitted waist..."></textarea>
            </div>

            <div class="section-title" style="margin-top:0">💰 Payment Details</div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label" for="o-total">Total Amount (Rs.) <span class="required">*</span></label>
                <input class="form-control" id="o-total" type="number" min="0" placeholder="0">
              </div>
              <div class="form-group">
                <label class="form-label" for="o-paid">Amount Paid (Rs.)</label>
                <input class="form-control" id="o-paid" type="number" min="0" placeholder="0">
              </div>
            </div>
            <div class="form-group">
              <label class="form-label" for="o-prev-balance">Previous Balance (Rs.)</label>
              <input class="form-control" id="o-prev-balance" type="number" min="0" placeholder="0">
              <div class="form-hint">Any outstanding amount from past orders</div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label" for="o-delivery">Delivery Date</label>
                <input class="form-control" id="o-delivery" type="date">
              </div>
              <div class="form-group">
                <label class="form-label" for="o-status">Order Status</label>
                <select class="form-control" id="o-status">
                  <option value="pending">⏳ Pending</option>
                  <option value="in-progress">🧵 In Progress</option>
                  <option value="ready">🔵 Ready</option>
                  <option value="delivered">📦 Delivered</option>
                  <option value="completed">✅ Completed</option>
                </select>
              </div>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" id="modal-order-cancel">Cancel</button>
          <button class="btn btn-primary" id="modal-order-save">💾 Save Order</button>
        </div>
      </div>
    </div>`;
    document.body.insertAdjacentHTML('beforeend', html);
    bindClose('modal-order', 'modal-order-close', 'modal-order-cancel');
    document.getElementById('modal-order-save').addEventListener('click', saveOrder);
  }

  function openAddOrder(customerId) {
    const customer = DB.getCustomerById(customerId);
    if (!customer) { Utils.toast('Customer not found', 'error'); return; }
    document.getElementById('modal-order-title').textContent = 'New Order';
    document.getElementById('order-edit-id').value    = '';
    document.getElementById('order-customer-id').value = customerId;
    document.getElementById('order-customer-display').textContent = `${customer.name} · ${customer.phone}`;
    clearOrderForm();
    openOverlay('modal-order');
  }

  function openEditOrder(orderId) {
    const order    = DB.getOrderById(orderId);
    if (!order) return;
    const customer = DB.getCustomerById(order.customerId);
    document.getElementById('modal-order-title').textContent = 'Edit Order';
    document.getElementById('order-edit-id').value     = order.id;
    document.getElementById('order-customer-id').value = order.customerId;
    document.getElementById('order-customer-display').textContent = customer
      ? `${customer.name} · ${customer.phone}` : 'Unknown Customer';
    document.getElementById('o-dress').value         = order.dressDescription    || '';
    document.getElementById('o-instructions').value  = order.specialInstructions || '';
    document.getElementById('o-total').value          = order.totalAmount         || '';
    document.getElementById('o-paid').value           = order.amountPaid          || '';
    document.getElementById('o-prev-balance').value   = order.previousBalance     || '';
    document.getElementById('o-delivery').value       = order.deliveryDate        || '';
    document.getElementById('o-status').value         = order.status              || 'pending';
    openOverlay('modal-order');
  }

  function clearOrderForm() {
    ['o-dress','o-instructions','o-total','o-paid','o-prev-balance','o-delivery']
      .forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
    document.getElementById('o-status').value = 'pending';
  }

  function saveOrder() {
    const dress = document.getElementById('o-dress').value.trim();
    const total = document.getElementById('o-total').value;
    if (!dress) { Utils.toast('Dress description is required', 'error'); return; }
    if (!total) { Utils.toast('Total amount is required', 'error'); return; }

    const data = {
      customerId:          document.getElementById('order-customer-id').value,
      dressDescription:    dress,
      specialInstructions: document.getElementById('o-instructions').value.trim(),
      totalAmount:         parseFloat(total) || 0,
      amountPaid:          parseFloat(document.getElementById('o-paid').value) || 0,
      previousBalance:     parseFloat(document.getElementById('o-prev-balance').value) || 0,
      deliveryDate:        document.getElementById('o-delivery').value,
      status:              document.getElementById('o-status').value,
    };
    const editId = document.getElementById('order-edit-id').value;
    if (editId) {
      DB.updateOrder(editId, data);
      Utils.toast('Order updated!', 'success');
    } else {
      DB.addOrder(data);
      Utils.toast('Order added!', 'success');
    }
    closeOverlay('modal-order');
    App.refreshCurrentPage();
  }

  /* ════════════════════════════════════════════════════════════
     RECEIPT MODAL
     ════════════════════════════════════════════════════════════ */

  function initReceiptModal() {
    const html = `
    <div class="modal-overlay" id="modal-receipt">
      <div class="modal-sheet">
        <div class="modal-handle"></div>
        <div class="modal-header">
          <h2 class="modal-title">🧾 Receipt</h2>
          <button class="modal-close" id="modal-receipt-close">✕</button>
        </div>
        <div class="modal-body" id="modal-receipt-body"></div>
        <div class="modal-footer">
          <button class="btn btn-secondary" id="modal-receipt-print">🖨️ Print</button>
          <button class="btn btn-primary" id="modal-receipt-pdf">📄 Download PDF</button>
        </div>
      </div>
    </div>`;
    document.body.insertAdjacentHTML('beforeend', html);
    bindClose('modal-receipt', 'modal-receipt-close');
    document.getElementById('modal-receipt-print').addEventListener('click', () => window.print());
    document.getElementById('modal-receipt-pdf').addEventListener('click', downloadReceiptPDF);
  }

  function openReceipt(orderId) {
    const order    = DB.getOrderById(orderId);
    if (!order) return;
    const customer = DB.getCustomerById(order.customerId);
    const settings = DB.getSettings();
    const balance  = Utils.balanceDue(order);
    const pStatus  = order.paymentStatus;
    const body     = document.getElementById('modal-receipt-body');

    body.innerHTML = `
      <div class="receipt-paper" id="receipt-content">
        <div class="receipt-header">
          <h3>${Utils.esc(settings.shopName)}</h3>
          <p>${Utils.esc(settings.address || '')}</p>
          ${settings.phone ? `<p>📞 ${Utils.esc(settings.phone)}</p>` : ''}
        </div>
        <div class="receipt-body">
          <div style="display:flex;justify-content:space-between;margin-bottom:4px">
            <span style="font-size:.75rem;color:var(--text-3)">Receipt Date</span>
            <span style="font-size:.8rem;font-weight:600">${Utils.formatDate(Utils.today())}</span>
          </div>
          <div style="display:flex;justify-content:space-between;margin-bottom:12px">
            <span style="font-size:.75rem;color:var(--text-3)">Order ID</span>
            <span style="font-size:.72rem;color:var(--text-3)">#${order.id.slice(-8).toUpperCase()}</span>
          </div>

          <hr class="receipt-divider">

          <div class="receipt-row">
            <span class="label">Customer</span>
            <span class="value">${Utils.esc(customer?.name || '—')}</span>
          </div>
          <div class="receipt-row">
            <span class="label">Phone</span>
            <span class="value">${Utils.esc(customer?.phone || '—')}</span>
          </div>
          <div class="receipt-row">
            <span class="label">Dress</span>
            <span class="value" style="max-width:55%;text-align:right">${Utils.esc(order.dressDescription)}</span>
          </div>
          ${order.specialInstructions ? `
          <div class="receipt-row">
            <span class="label">Instructions</span>
            <span class="value" style="max-width:55%;text-align:right;font-size:.78rem">${Utils.esc(order.specialInstructions)}</span>
          </div>` : ''}
          <div class="receipt-row">
            <span class="label">Delivery Date</span>
            <span class="value">${Utils.formatDate(order.deliveryDate)}</span>
          </div>

          <hr class="receipt-divider">

          <div class="receipt-row">
            <span class="label">Total Amount</span>
            <span class="value">${Utils.currency(order.totalAmount)}</span>
          </div>
          ${order.previousBalance > 0 ? `
          <div class="receipt-row">
            <span class="label" style="color:var(--unpaid)">Previous Balance</span>
            <span class="value" style="color:var(--unpaid)">${Utils.currency(order.previousBalance)}</span>
          </div>` : ''}
          <div class="receipt-row">
            <span class="label">Amount Paid</span>
            <span class="value" style="color:var(--paid)">− ${Utils.currency(order.amountPaid)}</span>
          </div>

          <div class="receipt-total">
            <span class="label">Balance Due</span>
            <span class="value">${Utils.currency(balance)}</span>
          </div>

          <div style="margin-top:12px;text-align:center">
            ${Utils.paymentBadgeHTML(pStatus)}
          </div>
        </div>
        <div class="receipt-footer">${Utils.esc(settings.thankYouMsg || 'Thank you for your business!')}</div>
      </div>`;

    openOverlay('modal-receipt');
  }

  function downloadReceiptPDF() {
    if (typeof jspdf === 'undefined' && typeof window.jspdf === 'undefined') {
      Utils.toast('PDF library loading... please try again', 'warning');
      return;
    }
    const { jsPDF } = window.jspdf;
    const order    = DB.getOrderById(document.getElementById('order-edit-id')?.value || _currentReceiptOrderId);
    // Fallback: just print
    window.print();
  }

  let _currentReceiptOrderId = null;
  function openReceiptForOrder(orderId) {
    _currentReceiptOrderId = orderId;
    openReceipt(orderId);
  }

  /* ════════════════════════════════════════════════════════════
     CUSTOMER PROFILE (Full-screen modal)
     ════════════════════════════════════════════════════════════ */

  function initProfileModal() {
    const html = `
    <div class="modal-overlay" id="modal-profile" style="align-items:stretch">
      <div class="modal-sheet" style="max-height:100dvh;border-radius:0">
        <div id="modal-profile-content"></div>
      </div>
    </div>`;
    document.body.insertAdjacentHTML('beforeend', html);
    document.getElementById('modal-profile').addEventListener('click', e => {
      if (e.target.id === 'modal-profile') closeOverlay('modal-profile');
    });
  }

  function openProfile(customerId) {
    renderProfile(customerId);
    openOverlay('modal-profile');
  }

  function renderProfile(customerId) {
    const customer = DB.getCustomerById(customerId);
    if (!customer) return;
    const orders  = DB.getOrdersByCustomer(customerId);
    const m       = customer.measurements || {};
    const content = document.getElementById('modal-profile-content');

    const activeOrder = orders.find(o => !['completed','delivered'].includes(o.status));
    const pStatus = activeOrder ? Utils.paymentStatus(activeOrder) : null;

    content.innerHTML = `
      <!-- Back Bar -->
      <div style="display:flex;align-items:center;gap:12px;padding:14px 16px;
                  background:var(--primary);color:#fff;position:sticky;top:0;z-index:10">
        <button onclick="document.getElementById('modal-profile').classList.remove('open')"
          style="background:rgba(255,255,255,.2);border:none;color:#fff;border-radius:50%;
                 width:34px;height:34px;display:flex;align-items:center;justify-content:center;
                 cursor:pointer;font-size:1.1rem">←</button>
        <div>
          <div style="font-weight:700;font-size:.95rem">${Utils.esc(customer.name)}</div>
          <div style="font-size:.72rem;opacity:.8">Customer Profile</div>
        </div>
        <div style="margin-left:auto;display:flex;gap:8px">
          <button class="profile-action-btn" onclick="Modals.editCustomerFromProfile('${customer.id}')">✏️ Edit</button>
          <button class="profile-action-btn" onclick="Modals.addOrderFromProfile('${customer.id}')">➕ Order</button>
        </div>
      </div>

      <!-- Profile Header -->
      <div class="profile-header">
        <div class="profile-avatar">${Utils.initials(customer.name)}</div>
        <div class="profile-name">${Utils.esc(customer.name)}</div>
        <div class="profile-phone">📞 ${Utils.esc(customer.phone)}</div>
        ${customer.address ? `<div style="font-size:.78rem;opacity:.8;margin-top:4px">📍 ${Utils.esc(customer.address)}</div>` : ''}
        ${pStatus ? Utils.paymentBadgeHTML(pStatus) : ''}
      </div>

      <!-- Tabs -->
      <div class="profile-tabs">
        <button class="profile-tab-btn active" data-tab="tab-measurements">📏 Measurements</button>
        <button class="profile-tab-btn" data-tab="tab-orders">📋 Orders (${orders.length})</button>
      </div>

      <!-- Measurements Tab -->
      <div id="tab-measurements" class="profile-tab-panel active" style="padding:16px">
        ${Object.entries({Chest:m.chest,Waist:m.waist,Hips:m.hips,Shoulder:m.shoulder,
                          Sleeve:m.sleeve,Length:m.length,Neck:m.neck,Thigh:m.thigh})
          .filter(([,v]) => v)
          .map(([k,v]) => `
            <div class="info-row" style="background:var(--surface);border-radius:var(--r-md);
                 margin-bottom:8px;border:1px solid var(--border-light);padding:10px 14px">
              <span style="font-size:.78rem;color:var(--text-3);width:90px;flex-shrink:0">${k}</span>
              <span style="font-weight:600;font-size:.9rem">${Utils.esc(v)}"</span>
            </div>`).join('') || '<div style="color:var(--text-4);font-size:.85rem;padding:8px">No measurements recorded yet.</div>'}
        ${m.notes ? `
          <div style="background:var(--accent-light);border-radius:var(--r-md);padding:12px;margin-top:8px;border:1px solid var(--primary-light)">
            <div style="font-size:.72rem;font-weight:700;color:var(--primary);text-transform:uppercase;letter-spacing:.06em;margin-bottom:4px">Notes</div>
            <div style="font-size:.85rem;color:var(--text)">${Utils.esc(m.notes)}</div>
          </div>` : ''}
      </div>

      <!-- Orders Tab -->
      <div id="tab-orders" class="profile-tab-panel" style="padding:16px">
        ${orders.length === 0 ? `
          <div class="empty-state" style="padding:40px 20px">
            <span class="empty-icon">🧵</span>
            <h3>No orders yet</h3>
            <p>Add a new order for this customer</p>
            <button class="btn btn-primary mt-4" onclick="Modals.addOrderFromProfile('${customer.id}')">➕ Add Order</button>
          </div>` :
          orders.map(o => orderHistoryCard(o, customer)).join('')}
      </div>
    `;

    // Tab switching
    content.querySelectorAll('.profile-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        content.querySelectorAll('.profile-tab-btn').forEach(b => b.classList.remove('active'));
        content.querySelectorAll('.profile-tab-panel').forEach(p => p.classList.remove('active'));
        btn.classList.add('active');
        content.querySelector(`#${btn.dataset.tab}`).classList.add('active');
      });
    });
  }

  function orderHistoryCard(order, customer) {
    const balance = Utils.balanceDue(order);
    return `
      <div class="order-card" style="margin-bottom:12px">
        <div class="order-card-header">
          <div>
            <div class="order-dress-title">🧵 ${Utils.esc(order.dressDescription)}</div>
            <div class="order-customer-name">${Utils.formatDate(order.createdAt)}</div>
          </div>
          <div style="display:flex;flex-direction:column;align-items:flex-end;gap:4px">
            ${Utils.orderStatusBadgeHTML(order.status)}
            ${Utils.paymentBadgeHTML(order.paymentStatus)}
          </div>
        </div>
        ${order.specialInstructions ? `
          <div style="background:var(--surface-2);border-radius:var(--r-sm);padding:8px 10px;
                      font-size:.78rem;color:var(--text-3);margin-bottom:10px">
            ✂️ ${Utils.esc(order.specialInstructions)}
          </div>` : ''}
        <div class="order-card-footer">
          <div>
            <div class="order-amount">${Utils.currency(order.totalAmount)}</div>
            ${balance > 0 ? `<div style="font-size:.72rem;color:var(--unpaid)">Balance: ${Utils.currency(balance)}</div>` : ''}
          </div>
          <div style="display:flex;gap:6px;flex-wrap:wrap;justify-content:flex-end">
            <button class="btn btn-secondary btn-sm" onclick="Modals.openReceiptForOrder('${order.id}')">🧾</button>
            <button class="btn btn-ghost btn-sm" onclick="Modals.openEditOrder('${order.id}')">✏️</button>
            <button class="btn btn-danger btn-sm" onclick="Pages.deleteOrder('${order.id}','${order.customerId}')">🗑️</button>
          </div>
        </div>
        ${order.deliveryDate ? `
          <div class="order-delivery" style="margin-top:8px;padding-top:8px;border-top:1px solid var(--border-light)">
            📅 ${Utils.formatDate(order.deliveryDate)}
            <span style="color:${Utils.isPast(order.deliveryDate) && !['delivered','completed'].includes(order.status) ? 'var(--unpaid)' : 'var(--text-3)'}">
              · ${Utils.formatDeliveryStatus(order.deliveryDate)}
            </span>
          </div>` : ''}
      </div>`;
  }

  function editCustomerFromProfile(customerId) {
    closeOverlay('modal-profile');
    setTimeout(() => openEditCustomer(customerId), 200);
  }

  function addOrderFromProfile(customerId) {
    closeOverlay('modal-profile');
    setTimeout(() => openAddOrder(customerId), 200);
  }

  /* ── Init All Modals ────────────────────────────────────── */
  function init() {
    initCustomerModal();
    initOrderModal();
    initReceiptModal();
    initProfileModal();
  }

  /* ── Public ─────────────────────────────────────────────── */
  return {
    init,
    openAddCustomer, openEditCustomer,
    openAddOrder, openEditOrder,
    openReceiptForOrder,
    openProfile,
    renderProfile,
    editCustomerFromProfile, addOrderFromProfile,
    closeOverlay,
  };
})();
