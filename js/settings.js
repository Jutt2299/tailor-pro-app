/* ============================================================
   settings.js – Settings Page (i18n-aware)
   ============================================================ */

'use strict';

const Settings = (() => {

  function render() {
    const settings = DB.getSettings();
    const stats    = DB.getStats();
    const page     = document.getElementById('page-settings');
    const lang     = I18n.getLang();

    page.innerHTML = `
      <div class="app-bar">
        <div>
          <h1>⚙️ ${I18n.t('settingsTitle')}</h1>
          <div class="subtitle">${I18n.t('settingsSubtitle')}</div>
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
          <div style="font-size:.75rem;opacity:.8">${stats.totalCustomers} ${I18n.t('navCustomers')} · ${DB.getOrders().length} ${I18n.t('navOrders')}</div>
        </div>

        <!-- Shop Info -->
        <div class="settings-group">
          <div class="settings-group-title">${I18n.t('shopInfo')}</div>
          <div class="form-group" style="padding:12px 16px 0">
            <label class="form-label" for="s-shop-name">${I18n.t('shopNameLabel')}</label>
            <input class="form-control" id="s-shop-name" type="text" value="${Utils.esc(settings.shopName)}" placeholder="${I18n.t('shopNamePlaceholder')}">
          </div>
          <div class="form-group" style="padding:0 16px">
            <label class="form-label" for="s-owner">${lang === 'ur' ? 'مالک کا نام' : 'Owner Name'}</label>
            <input class="form-control" id="s-owner" type="text" value="${Utils.esc(settings.ownerName || '')}" placeholder="${lang === 'ur' ? 'آپ کا نام' : 'Your name'}">
          </div>
          <div class="form-row" style="padding:0 16px">
            <div class="form-group">
              <label class="form-label" for="s-phone">${lang === 'ur' ? 'فون' : 'Phone'}</label>
              <input class="form-control" id="s-phone" type="tel" value="${Utils.esc(settings.phone || '')}" placeholder="03xx-xxxxxxx">
            </div>
            <div class="form-group">
              <label class="form-label" for="s-address">${lang === 'ur' ? 'پتہ' : 'Address'}</label>
              <input class="form-control" id="s-address" type="text" value="${Utils.esc(settings.address || '')}" placeholder="${lang === 'ur' ? 'دکان کا پتہ' : 'Shop address'}">
            </div>
          </div>
          <div class="form-group" style="padding:0 16px 12px">
            <label class="form-label" for="s-thank-you">${lang === 'ur' ? 'رسید پیغام' : 'Receipt Thank-You Message'}</label>
            <input class="form-control" id="s-thank-you" type="text" value="${Utils.esc(settings.thankYouMsg || '')}" placeholder="${lang === 'ur' ? 'شکریہ!' : 'Thank you for your business!'}">
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
              <button class="lang-btn ${lang === 'en' ? 'active' : ''}" data-lang="en">
                🇬🇧 English
              </button>
              <button class="lang-btn ${lang === 'ur' ? 'active' : ''}" data-lang="ur">
                🇵🇰 اردو
              </button>
            </div>
          </div>
        </div>

        <!-- Data Management -->
        <div class="settings-group">
          <div class="settings-group-title">${I18n.t('dataManagement')}</div>
          <div class="settings-item" id="settings-export">
            <div class="settings-item-icon" style="background:var(--accent-light)">📤</div>
            <div class="settings-item-body">
              <div class="settings-item-label">${I18n.t('exportBackup')}</div>
              <div class="settings-item-desc">${I18n.t('exportDesc')}</div>
            </div>
            <span class="settings-item-arrow">›</span>
          </div>
          <div class="settings-item" id="settings-import">
            <div class="settings-item-icon" style="background:#EDE9FE">📥</div>
            <div class="settings-item-body">
              <div class="settings-item-label">${I18n.t('importBackup')}</div>
              <div class="settings-item-desc">${I18n.t('importDesc')}</div>
            </div>
            <span class="settings-item-arrow">›</span>
          </div>
          <input type="file" id="settings-file-input" accept=".json" class="hidden">
        </div>

        <!-- App Info -->
        <div class="settings-group">
          <div class="settings-group-title">${I18n.t('appInfo')}</div>
          <div class="settings-item" style="cursor:default">
            <div class="settings-item-icon" style="background:var(--accent-light)">✂️</div>
            <div class="settings-item-body">
              <div class="settings-item-label">Tailor Pro</div>
              <div class="settings-item-desc">Version 1.0</div>
            </div>
          </div>
          <div class="settings-item" style="cursor:default">
            <div class="settings-item-icon" style="background:#F0FDF4">🔒</div>
            <div class="settings-item-body">
              <div class="settings-item-label">${I18n.t('privacy')}</div>
              <div class="settings-item-desc">${I18n.t('privacyDesc')}</div>
            </div>
          </div>
        </div>

        <!-- Danger Zone -->
        <div class="settings-group">
          <div class="settings-group-title">${I18n.t('dangerZone')}</div>
          <div class="settings-item danger" id="settings-clear">
            <div class="settings-item-icon">🗑️</div>
            <div class="settings-item-body">
              <div class="settings-item-label">${I18n.t('clearLocalData')}</div>
              <div class="settings-item-desc">${I18n.t('clearLocalDesc')}</div>
            </div>
            <span class="settings-item-arrow">›</span>
          </div>
          <div class="settings-item danger" id="settings-logout">
            <div class="settings-item-icon">🚪</div>
            <div class="settings-item-body">
              <div class="settings-item-label">${I18n.t('logout')}</div>
              <div class="settings-item-desc">${I18n.t('logoutDesc')}</div>
            </div>
            <span class="settings-item-arrow">›</span>
          </div>
        </div>

        <div style="text-align:center;padding:24px 0;color:var(--text-4);font-size:.75rem">
          ${lang === 'ur' ? 'ہر جگہ کے درزیوں کے لیے ❤️ سے بنایا گیا' : 'Made with ❤️ for tailors everywhere'}
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
    document.getElementById('settings-logout').addEventListener('click', async () => {
      const lang = I18n.getLang();
      const ok = await Utils.confirm({
        icon: '🚨',
        title: lang === 'ur' ? 'لاگ آؤٹ' : 'Logout',
        message: lang === 'ur' ? 'کیا آپ واقعی لاگ آؤٹ کرنا چاہتے ہیں؟' : 'Are you sure you want to logout?',
        confirmText: lang === 'ur' ? 'لاگ آؤٹ' : 'Logout',
        danger: true,
      });
      if (!ok) return;
      if (window.Auth) await Auth.logout();
    });

    // Language switcher
    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const newLang = btn.dataset.lang;
        I18n.setLang(newLang);

        // Re-render ALL pages so translation applies everywhere
        render(); // Settings (current page)
        if (window.App) App.updateNavLabels();
        if (window.Auth) Auth.applyAuthTranslations && Auth.applyAuthTranslations();

        // Also re-render other pages if they are cached/rendered
        // (they will re-render next time user navigates to them via App.navigate)

        Utils.toast(newLang === 'ur' ? '✅ زبان تبدیل ہو گئی!' : '✅ Language changed to English!', 'success');
      });
    });
  }

  function saveShopSettings() {
    const shopName    = document.getElementById('s-shop-name').value.trim();
    const ownerName   = document.getElementById('s-owner').value.trim();
    const phone       = document.getElementById('s-phone').value.trim();
    const address     = document.getElementById('s-address').value.trim();
    const thankYouMsg = document.getElementById('s-thank-you').value.trim();
    if (!shopName) { Utils.toast(I18n.getLang() === 'ur' ? 'دکان کا نام ضروری ہے' : 'Shop name is required', 'error'); return; }
    DB.saveSettings({ shopName, ownerName, phone, address, thankYouMsg });
    document.getElementById('settings-shop-display').textContent = shopName;
    Utils.toast(I18n.getLang() === 'ur' ? '✅ ترتیبات محفوظ ہو گئیں!' : '✅ Settings saved!', 'success');
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
    Utils.toast(I18n.getLang() === 'ur' ? 'بیک اپ برآمد ہو گیا!' : 'Backup exported!', 'success');
  }

  async function importBackup(e) {
    const file = e.target.files[0];
    if (!file) return;
    const lang = I18n.getLang();
    const ok = await Utils.confirm({
      icon: '📥',
      title: lang === 'ur' ? 'بیک اپ درآمد کریں' : 'Import Backup',
      message: lang === 'ur'
        ? 'یہ موجودہ تمام ڈیٹا کو بیک اپ سے بدل دے گا۔ کیا آپ یقین رکھتے ہیں؟'
        : 'This will REPLACE all current data with the backup. Are you sure?',
      confirmText: lang === 'ur' ? 'درآمد کریں' : 'Import',
      danger: true,
    });
    if (!ok) { e.target.value = ''; return; }
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const json = JSON.parse(ev.target.result);
        DB.importData(json);
        Utils.toast(lang === 'ur' ? 'ڈیٹا کامیابی سے درآمد ہو گیا!' : 'Data imported successfully!', 'success');
        render();
        App.refreshCurrentPage();
      } catch {
        Utils.toast(lang === 'ur' ? 'غلط بیک اپ فائل' : 'Invalid backup file', 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  async function clearAllData() {
    const lang = I18n.getLang();
    const ok = await Utils.confirm({
      icon: '🗑️',
      title: lang === 'ur' ? 'تمام ڈیٹا صاف کریں' : 'Clear All Data',
      message: lang === 'ur'
        ? 'یہ تمام گاہکوں اور آرڈرز کو ہمیشہ کے لیے حذف کر دے گا۔ یہ واپس نہیں ہو سکتا!'
        : 'This will permanently delete ALL customers and orders. This cannot be undone!',
      confirmText: lang === 'ur' ? 'سب حذف کریں' : 'Delete All',
      danger: true,
    });
    if (ok) {
      DB.clearAllData();
      Utils.toast(lang === 'ur' ? 'تمام ڈیٹا صاف ہو گیا' : 'All data cleared', 'info');
      render();
      App.refreshCurrentPage();
    }
  }

  return { render };
})();
