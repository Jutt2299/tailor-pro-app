/* ============================================================
   dashboard.js – Dashboard / Home Page
   ============================================================ */

'use strict';

const Dashboard = (() => {

  function render() {
    const stats    = DB.getStats();
    const settings = DB.getSettings();
    const greeting = getGreeting();
    const page = document.getElementById('page-home');

    page.innerHTML = `
      <div class="app-bar">
        <div>
          <h1 style="display:flex; align-items:center; gap:8px;">
            <img src="assets/logo.jpg" alt="Logo" style="width:32px; height:32px; border-radius:50%; border:1px solid var(--primary); object-fit:cover;">
            ${Utils.esc(settings.shopName)}
          </h1>
          <div class="subtitle">${greeting}, ${Utils.formatDate(Utils.today())}</div>
        </div>
        <div class="app-bar-actions">
          <button class="icon-btn" id="dash-search-toggle" title="Search">🔍</button>
          <button class="icon-btn" id="dash-settings-btn" title="Settings">⚙️</button>
        </div>
      </div>

      <!-- Quick Search (hidden by default) -->
      <div id="dash-search-bar" class="hidden" style="padding:12px 20px 0;background:var(--primary)">
        <div class="search-bar" style="margin-bottom:0">
          <span class="search-icon">🔍</span>
          <input type="text" id="dash-search-input" placeholder="Search customer by name or phone..." autocomplete="off">
        </div>
      </div>
      <div id="dash-search-results" class="hidden" style="padding:12px 20px;background:var(--surface);
           border-bottom:1px solid var(--border-light);max-height:220px;overflow-y:auto"></div>

      <div class="page-content">

        <!-- Hero Banner -->
        <div class="dashboard-hero">
          <h2>Good ${greeting}! 👋</h2>
          <p>Here's your business overview</p>
          <div class="hero-date">📅 ${Utils.formatDate(Utils.today())}</div>
        </div>

        <!-- Add Customer CTA -->
        <button class="cta-add-btn" id="dash-add-customer">
          <div class="cta-icon">➕</div>
          <div class="cta-text">
            <strong>Add New Customer</strong>
            <span>Save measurements & start an order</span>
          </div>
          <span style="font-size:1.2rem;opacity:.7">›</span>
        </button>

        <!-- Stats Grid -->
        <div class="section-title">📊 Today's Overview</div>
        <div class="stats-grid">
          <div class="stat-card">
            <span class="stat-icon">📅</span>
            <div class="stat-value">${stats.todaysOrders}</div>
            <div class="stat-label">Today's Orders</div>
          </div>
          <div class="stat-card accent-blue">
            <span class="stat-icon">👥</span>
            <div class="stat-value">${stats.totalCustomers}</div>
            <div class="stat-label">Total Customers</div>
          </div>
          <div class="stat-card accent-green">
            <span class="stat-icon">🧵</span>
            <div class="stat-value">${stats.inProgress}</div>
            <div class="stat-label">In Progress</div>
          </div>
          <div class="stat-card accent-green">
            <span class="stat-icon">✅</span>
            <div class="stat-value">${stats.completed}</div>
            <div class="stat-label">Completed</div>
          </div>
          <div class="stat-card accent-red">
            <span class="stat-icon">💰</span>
            <div class="stat-value" style="font-size:1rem">${stats.pendingPayments}</div>
            <div class="stat-label">Pending Payments</div>
          </div>
          <div class="stat-card accent-amber">
            <span class="stat-icon">🚚</span>
            <div class="stat-value">${stats.todayDeliveries}</div>
            <div class="stat-label">Today's Deliveries</div>
          </div>
        </div>

        <!-- Today's Deliveries Alert -->
        ${stats.todayDeliveryList.length > 0 ? `
        <div class="section-title">🚚 Due for Delivery Today</div>
        <div id="delivery-alerts">
          ${renderDeliveryAlerts(stats.todayDeliveryList)}
        </div>` : ''}

        <!-- Recent Orders -->
        <div class="section-title" style="display:flex;justify-content:space-between;align-items:center">
          <span>📋 Recent Orders</span>
          <button class="btn btn-ghost btn-sm" id="dash-view-all-orders">View all →</button>
        </div>
        <div id="recent-orders-list">
          ${renderRecentOrders()}
        </div>

      </div>`;

    // Events
    document.getElementById('dash-add-customer').addEventListener('click', () => Modals.openAddCustomer());
    document.getElementById('dash-settings-btn').addEventListener('click', () => App.navigate('settings'));
    document.getElementById('dash-view-all-orders').addEventListener('click', () => App.navigate('orders'));

    // Search toggle
    const searchBar     = document.getElementById('dash-search-bar');
    const searchResults = document.getElementById('dash-search-results');
    const searchInput   = document.getElementById('dash-search-input');
    document.getElementById('dash-search-toggle').addEventListener('click', () => {
      searchBar.classList.toggle('hidden');
      if (!searchBar.classList.contains('hidden')) {
        searchInput.focus();
      } else {
        searchResults.classList.add('hidden');
        searchResults.innerHTML = '';
        searchInput.value = '';
      }
    });
    searchInput.addEventListener('input', () => {
      const q = searchInput.value.trim();
      if (q.length < 1) { searchResults.classList.add('hidden'); return; }
      const customers = DB.searchCustomers(q);
      searchResults.classList.remove('hidden');
      if (!customers.length) {
        searchResults.innerHTML = '<div style="color:var(--text-4);font-size:.85rem;padding:8px">No customers found</div>';
        return;
      }
      searchResults.innerHTML = customers.slice(0, 6).map(c => `
        <div class="customer-card" style="margin-bottom:8px" onclick="Modals.openProfile('${c.id}')">
          <div class="customer-avatar">${Utils.initials(c.name)}</div>
          <div class="customer-info">
            <div class="customer-name">${Utils.esc(c.name)}</div>
            <div class="customer-phone">📞 ${Utils.esc(c.phone)}</div>
          </div>
        </div>`).join('');
    });

    // Delivery alert clicks
    document.querySelectorAll('.delivery-alert[data-order-id]').forEach(el => {
      el.addEventListener('click', () => {
        const orderId = el.dataset.orderId;
        Modals.openReceiptForOrder(orderId);
      });
    });
  }

  function renderDeliveryAlerts(orders) {
    return orders.map(o => {
      const customer = DB.getCustomerById(o.customerId);
      return `
        <div class="delivery-alert" data-order-id="${o.id}">
          <span class="delivery-alert-icon">📦</span>
          <div class="delivery-alert-body">
            <div class="delivery-alert-name">${Utils.esc(customer?.name || 'Unknown')}</div>
            <div class="delivery-alert-dress">${Utils.esc(o.dressDescription)}</div>
          </div>
          <span style="font-size:.72rem;color:var(--partial);font-weight:700">Today!</span>
        </div>`;
    }).join('');
  }

  function renderRecentOrders() {
    const orders = DB.getOrders().slice(0, 5);
    if (!orders.length) return `
      <div class="empty-state" style="padding:32px 16px">
        <span class="empty-icon" style="font-size:2.5rem">📋</span>
        <h3>No orders yet</h3>
        <p>Add a customer and create your first order</p>
      </div>`;

    return orders.map(o => {
      const customer = DB.getCustomerById(o.customerId);
      const balance  = Utils.balanceDue(o);
      return `
        <div class="order-card" onclick="Modals.openReceiptForOrder('${o.id}')">
          <div class="order-card-header">
            <div>
              <div class="order-dress-title">🧵 ${Utils.esc(o.dressDescription)}</div>
              <div class="order-customer-name">${Utils.esc(customer?.name || '—')}</div>
            </div>
            <div style="display:flex;flex-direction:column;align-items:flex-end;gap:4px">
              ${Utils.orderStatusBadgeHTML(o.status)}
              ${Utils.paymentBadgeHTML(o.paymentStatus)}
            </div>
          </div>
          <div class="order-card-footer">
            <div>
              <div class="order-amount">${Utils.currency(o.totalAmount)}</div>
              ${balance > 0 ? `<div style="font-size:.72rem;color:var(--unpaid)">Due: ${Utils.currency(balance)}</div>` : ''}
            </div>
            <div class="order-delivery">
              📅 ${Utils.formatDate(o.deliveryDate)}
            </div>
          </div>
        </div>`;
    }).join('');
  }

  function getGreeting() {
    const h = new Date().getHours();
    if (h < 12) return 'Morning';
    if (h < 17) return 'Afternoon';
    return 'Evening';
  }

  return { render };
})();
