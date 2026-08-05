/* ============================================================
   customers.js – Customers List Page (Ladies & Gents sections)
   ============================================================ */

'use strict';

const Customers = (() => {

  let _searchQuery  = '';
  let _activeFilter = 'all'; // 'all' | 'gents' | 'ladies'

  function render() {
    const lang = I18n.getLang();
    const page = document.getElementById('page-customers');
    page.innerHTML = `
      <div class="app-bar">
        <div>
          <h1>👥 ${I18n.t('customersTitle')}</h1>
          <div class="subtitle" id="customers-subtitle">...</div>
        </div>
        <div class="app-bar-actions">
          <button class="icon-btn" id="customers-add-btn" title="${lang === 'ur' ? 'گاہک شامل کریں' : 'Add Customer'}">➕</button>
        </div>
      </div>

      <div class="page-content">
        <div class="search-bar">
          <span class="search-icon">🔍</span>
          <input type="text" id="customers-search"
            placeholder="${I18n.t('searchPlaceholder')}"
            autocomplete="off" value="${Utils.esc(_searchQuery)}">
        </div>

        <!-- Gender Filter Tabs -->
        <div class="gender-filter-tabs">
          <button class="gender-tab ${_activeFilter === 'all'    ? 'active' : ''}" data-filter="all">
            👥 ${lang === 'ur' ? 'سب' : 'All'}
          </button>
          <button class="gender-tab ${_activeFilter === 'gents'  ? 'active' : ''}" data-filter="gents">
            👔 ${lang === 'ur' ? 'مرد' : 'Gents'}
          </button>
          <button class="gender-tab ${_activeFilter === 'ladies' ? 'active' : ''}" data-filter="ladies">
            👗 ${lang === 'ur' ? 'خواتین' : 'Ladies'}
          </button>
        </div>

        <div id="customers-list"></div>
      </div>`;

    document.getElementById('customers-add-btn').addEventListener('click', () => Modals.openAddCustomer());
    document.getElementById('customers-search').addEventListener('input', e => {
      _searchQuery = e.target.value;
      renderList();
    });
    document.querySelectorAll('.gender-tab').forEach(btn => {
      btn.addEventListener('click', () => {
        _activeFilter = btn.dataset.filter;
        document.querySelectorAll('.gender-tab').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        renderList();
      });
    });
    renderList();
  }

  function renderList() {
    const lang      = I18n.getLang();
    const all       = DB.searchCustomers(_searchQuery);
    const customers = _activeFilter === 'all'
      ? all
      : all.filter(c => (c.gender || 'gents') === _activeFilter);

    const subtitle = document.getElementById('customers-subtitle');
    const list     = document.getElementById('customers-list');

    if (subtitle) {
      const total  = DB.getCustomers().length;
      const gents  = DB.getCustomers().filter(c => (c.gender || 'gents') === 'gents').length;
      const ladies = DB.getCustomers().filter(c => c.gender === 'ladies').length;
      subtitle.textContent = lang === 'ur'
        ? `کل ${total} · مرد ${gents} · خواتین ${ladies}`
        : `Total ${total} · Gents ${gents} · Ladies ${ladies}`;
    }

    if (!customers.length) {
      const emptyMsg = _searchQuery
        ? (lang === 'ur' ? 'کوئی نتیجہ نہیں ملا' : 'No results found')
        : (lang === 'ur' ? 'ابھی کوئی گاہک نہیں' : 'No customers yet');
      const emptyDesc = _searchQuery
        ? (lang === 'ur' ? 'دوسرا نام یا فون نمبر آزمائیں' : 'Try a different name or phone')
        : (lang === 'ur' ? '➕ بٹن دبا کر پہلا گاہک شامل کریں' : 'Tap ➕ to add your first customer');
      list.innerHTML = `
        <div class="empty-state">
          <span class="empty-icon">${_activeFilter === 'ladies' ? '👗' : _activeFilter === 'gents' ? '👔' : '👥'}</span>
          <h3>${emptyMsg}</h3>
          <p>${emptyDesc}</p>
          ${!_searchQuery ? `<button class="btn btn-primary mt-4" onclick="Modals.openAddCustomer()">➕ ${I18n.t('addCustomer')}</button>` : ''}
        </div>`;
      return;
    }

    list.innerHTML = customers.map(c => {
      const orders  = DB.getOrdersByCustomer(c.id);
      const active  = orders.find(o => !['completed','delivered'].includes(o.status));
      const balance = active ? Utils.balanceDue(active) : 0;
      const gender  = c.gender || 'gents';
      const genderIcon = gender === 'ladies' ? '👗' : '👔';
      const genderLabel = gender === 'ladies'
        ? (lang === 'ur' ? 'خواتین' : 'Ladies')
        : (lang === 'ur' ? 'مرد'    : 'Gents');

      return `
        <div class="customer-card" onclick="Modals.openProfile('${c.id}')">
          <div class="customer-avatar" style="background:${gender === 'ladies' ? 'linear-gradient(135deg,#F472B6,#EC4899)' : 'linear-gradient(135deg,var(--primary),var(--primary-light))'}">
            ${Utils.initials(c.name)}
          </div>
          <div class="customer-info">
            <div class="customer-name">${Utils.esc(c.name)}</div>
            <div class="customer-phone">📞 ${Utils.esc(c.phone)}</div>
            <div style="font-size:.7rem;color:var(--text-4);margin-top:2px">
              ${genderIcon} ${genderLabel}
              ${c.address ? ` · 📍 ${Utils.esc(c.address)}` : ''}
            </div>
          </div>
          <div class="customer-meta">
            <span style="font-size:.72rem;color:var(--text-4)">${orders.length} ${lang === 'ur' ? 'آرڈر' : (orders.length !== 1 ? 'orders' : 'order')}</span>
            ${active ? Utils.paymentBadgeHTML(Utils.paymentStatus(active)) : ''}
            ${balance > 0 ? `<span style="font-size:.72rem;color:var(--unpaid);font-weight:600">${Utils.currency(balance)}</span>` : ''}
          </div>
        </div>`;
    }).join('');
  }

  return { render, renderList };
})();
