/* ============================================================
   settings.js – Settings Page
   ============================================================ */

'use strict';

const Settings = (() => {

  function render() {
    const settings = DB.getSettings();
    const stats    = DB.getStats();
    const page     = document.getElementById('page-settings');

    page.innerHTML = `
      <div class="app-bar">
        <div>
          <h1>⚙️ Settings</h1>
          <div class="subtitle">App Configuration</div>
        </div>
      </div>

      <div class="page-content">

        <!-- Shop Profile Card -->
        <div style="background:linear-gradient(135deg,var(--primary),var(--primary-light));
                    border-radius:var(--r-xl);padding:var(--sp-5);color:#fff;
                    margin-bottom:var(--sp-5);box-shadow:var(--shadow-primary);text-align:center">
          <div style="width:60px;height:60px;border-radius:50%;background:rgba(255,255,255,.25);
                      margin:0 auto 12px;display:flex;align-items:center;justify-content:center;font-size:1.8rem">
            ✂️
          </div>
          <div style="font-size:1.1rem;font-weight:700;margin-bottom:4px" id="settings-shop-display">${Utils.esc(settings.shopName)}</div>
          <div style="font-size:.75rem;opacity:.8">${stats.totalCustomers} customers · ${DB.getOrders().length} orders</div>
        </div>

        <!-- Shop Info -->
        <div class="settings-group">
          <div class="settings-group-title">🏪 Shop Information</div>
          <div class="form-group" style="padding:12px 16px 0">
            <label class="form-label" for="s-shop-name">Shop Name</label>
            <input class="form-control" id="s-shop-name" type="text" value="${Utils.esc(settings.shopName)}" placeholder="My Tailor Shop">
          </div>
          <div class="form-group" style="padding:0 16px">
            <label class="form-label" for="s-owner">Owner Name</label>
            <input class="form-control" id="s-owner" type="text" value="${Utils.esc(settings.ownerName || '')}" placeholder="Your name">
          </div>
          <div class="form-row" style="padding:0 16px">
            <div class="form-group">
              <label class="form-label" for="s-phone">Phone</label>
              <input class="form-control" id="s-phone" type="tel" value="${Utils.esc(settings.phone || '')}" placeholder="03xx-xxxxxxx">
            </div>
            <div class="form-group">
              <label class="form-label" for="s-address">Address</label>
              <input class="form-control" id="s-address" type="text" value="${Utils.esc(settings.address || '')}" placeholder="Shop address">
            </div>
          </div>
          <div class="form-group" style="padding:0 16px 12px">
            <label class="form-label" for="s-thank-you">Receipt Thank-You Message</label>
            <input class="form-control" id="s-thank-you" type="text" value="${Utils.esc(settings.thankYouMsg || '')}" placeholder="Thank you for your business!">
          </div>
          <div style="padding:0 16px 16px">
            <button class="btn btn-primary btn-full" id="settings-save-btn">💾 ${I18n.t('saveSettings')}</button>
          </div>
        </div>

        <!-- Language Settings -->
        <div class="settings-group">
          <div class="settings-group-title">${I18n.t('language')}</div>
          <div style="padding:12px 16px 16px">
            <label class="form-label">${I18n.t('languageSelect')}</label>
            <div class="lang-toggle">
              <button class="lang-btn ${I18n.getLang() === 'en' ? 'active' : ''}" data-lang="en">
                🇬🇧 English
              </button>
              <button class="lang-btn ${I18n.getLang() === 'ur' ? 'active' : ''}" data-lang="ur">
                🇵🇰 اردو
              </button>
            </div>
          </div>
        </div>

        <!-- Data Management -->
        <div class="settings-group">
          <div class="settings-group-title">💾 Data Management</div>
          <div class="settings-item" id="settings-export">
            <div class="settings-item-icon" style="background:var(--accent-light)">📤</div>
            <div class="settings-item-body">
              <div class="settings-item-label">Export Backup</div>
              <div class="settings-item-desc">Save all data as JSON file</div>
            </div>
            <span class="settings-item-arrow">›</span>
          </div>
          <div class="settings-item" id="settings-import">
            <div class="settings-item-icon" style="background:#EDE9FE">📥</div>
            <div class="settings-item-body">
              <div class="settings-item-label">Import Backup</div>
              <div class="settings-item-desc">Restore data from JSON file</div>
            </div>
            <span class="settings-item-arrow">›</span>
          </div>
          <input type="file" id="settings-file-input" accept=".json" class="hidden">
        </div>

        <!-- App Info -->
        <div class="settings-group">
          <div class="settings-group-title">ℹ️ App Info</div>
          <div class="settings-item" style="cursor:default">
            <div class="settings-item-icon" style="background:var(--accent-light)">✂️</div>
            <div class="settings-item-body">
              <div class="settings-item-label">Tailor Pro</div>
              <div class="settings-item-desc">Version 1.0 · All data stored locally</div>
            </div>
          </div>
          <div class="settings-item" style="cursor:default">
            <div class="settings-item-icon" style="background:#F0FDF4">🔒</div>
            <div class="settings-item-body">
              <div class="settings-item-label">Privacy</div>
              <div class="settings-item-desc">No internet connection required. Your data never leaves this device.</div>
            </div>
          </div>
        </div>

        <!-- Danger Zone -->
        <div class="settings-group">
          <div class="settings-group-title">⚠️ Danger Zone</div>
          <div class="settings-item danger" id="settings-clear">
            <div class="settings-item-icon">🗑️</div>
            <div class="settings-item-body">
              <div class="settings-item-label">Clear Local Data</div>
              <div class="settings-item-desc">Clear data from this device only</div>
            </div>
            <span class="settings-item-arrow">›</span>
          </div>
          <div class="settings-item danger" id="settings-logout">
            <div class="settings-item-icon">🚪</div>
            <div class="settings-item-body">
              <div class="settings-item-label">Logout</div>
              <div class="settings-item-desc">Sign out of your Tailor account</div>
            </div>
            <span class="settings-item-arrow">›</span>
          </div>
        </div>

        <div style="text-align:center;padding:24px 0;color:var(--text-4);font-size:.75rem">
          Made with ❤️ for tailors everywhere
        </div>
      </div>`;

    // Events
    document.getElementById('settings-save-btn').addEventListener('click', saveShopSettings);
    document.getElementById('settings-export').addEventListener('click', exportBackup);
    document.getElementById('settings-import').addEventListener('click', () => {
      document.getElementById('settings-file-input').click();
    });
    document.getElementById('settings-file-input').addEventListener('change', importBackup);
    document.getElementById('settings-clear').addEventListener('click', clearAllData);
    document.getElementById('settings-logout').addEventListener('click', () => {
      if (window.Auth) Auth.logout();
    });

    // Language switcher
    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const lang = btn.dataset.lang;
        I18n.setLang(lang);
        // Re-render the settings page and update nav labels
        render();
        if (window.App) App.updateNavLabels();
        if (window.Auth) Auth.applyAuthTranslations && Auth.applyAuthTranslations();
        Utils.toast(lang === 'ur' ? 'زبان تبدیل ہو گئی!' : 'Language changed!', 'success');
      });
    });
  }

  function saveShopSettings() {
    const shopName   = document.getElementById('s-shop-name').value.trim();
    const ownerName  = document.getElementById('s-owner').value.trim();
    const phone      = document.getElementById('s-phone').value.trim();
    const address    = document.getElementById('s-address').value.trim();
    const thankYouMsg= document.getElementById('s-thank-you').value.trim();
    if (!shopName) { Utils.toast('Shop name is required', 'error'); return; }
    DB.saveSettings({ shopName, ownerName, phone, address, thankYouMsg });
    document.getElementById('settings-shop-display').textContent = shopName;
    Utils.toast('Settings saved!', 'success');
  }

  function exportBackup() {
    const data = DB.exportData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `tailor-backup-${Utils.today()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    Utils.toast('Backup exported!', 'success');
  }

  async function importBackup(e) {
    const file = e.target.files[0];
    if (!file) return;
    const ok = await Utils.confirm({
      icon: '📥', title: 'Import Backup',
      message: 'This will REPLACE all current data with the backup. Are you sure?',
      confirmText: 'Import', danger: true,
    });
    if (!ok) { e.target.value = ''; return; }
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const json = JSON.parse(ev.target.result);
        DB.importData(json);
        Utils.toast('Data imported successfully!', 'success');
        render();
        App.refreshCurrentPage();
      } catch {
        Utils.toast('Invalid backup file', 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  async function clearAllData() {
    const ok = await Utils.confirm({
      icon: '🗑️', title: 'Clear All Data',
      message: 'This will permanently delete ALL customers and orders. This cannot be undone!',
      confirmText: 'Delete All', danger: true,
    });
    if (ok) {
      DB.clearAllData();
      Utils.toast('All data cleared', 'info');
      render();
      App.refreshCurrentPage();
    }
  }

  return { render };
})();
