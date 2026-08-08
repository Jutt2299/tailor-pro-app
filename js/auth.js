/* ============================================================
   auth.js – Supabase Authentication (Clean Rewrite)
   ============================================================ */

'use strict';

const Auth = (() => {
  const supabase = Config.supabase;
  let currentUser = null;

  // ── Define switchTab IMMEDIATELY so onclick="" in HTML works instantly ──
  window.switchTab = function(target) {
    document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
    const tab = document.getElementById('tab-' + target);
    if (tab) tab.classList.add('active');

    document.querySelectorAll('.auth-form').forEach(f => {
      f.classList.remove('active');
      f.style.display = 'none';
    });
    // Support both: form-login/form-register AND login-form-new/register-form-new
    const form = document.getElementById('form-' + target) ||
                 document.getElementById(target + '-form-new');
    if (form) {
      form.classList.add('active');
      form.style.display = 'block';
    }
  };

  /* ── Public init ──────────────────────────────────────────── */
  function init() {
    applyAuthTranslations();
    _setupTabSwitching();
    _setupForms();

    // ── OFFLINE-FIRST: Check local token immediately ──────────
    // If user was previously logged in, show app instantly
    // even without internet connection
    const offlineUser = _getOfflineUser();
    if (offlineUser) {
      currentUser = offlineUser;
      _showApp();
    }

    // ── ONLINE: Connect to Supabase if available ──────────────
    if (!supabase) {
      console.warn('[Auth] Supabase not available (offline mode)');
      if (!offlineUser) _showAuth(); // No local session → show login
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      _handleSession(session);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      _handleSession(session);
    });
  }

  /* ── Offline User Check ───────────────────────────────────── */
  function _getOfflineUser() {
    try {
      // Supabase stores session in localStorage with this key pattern
      const keys = Object.keys(localStorage).filter(k =>
        k.includes('supabase') && k.includes('auth')
      );
      for (const key of keys) {
        const data = JSON.parse(localStorage.getItem(key) || '{}');
        const session = data.access_token ? data : (data.currentSession || null);
        if (session && session.user && session.access_token) {
          // Check token expiry
          const exp = session.expires_at || 0;
          const nowSec = Math.floor(Date.now() / 1000);
          if (exp > nowSec || exp === 0) {
            return session.user;
          }
        }
      }
    } catch(e) {}
    return null;
  }

  /* ── Show/Hide Screens ────────────────────────────────────── */
  function _showApp() {
    document.getElementById('auth-screen')?.classList.add('hidden');
    document.getElementById('app')?.classList.remove('hidden');
    if (window.Sync) Sync.init();
    _fetchProfile();
  }

  function _showAuth() {
    document.getElementById('auth-screen')?.classList.remove('hidden');
    document.getElementById('app')?.classList.add('hidden');
  }

  /* ── Tab Switching ────────────────────────────────────────── */
  function _setupTabSwitching() {
    // Global function so onclick="" in HTML can also call it
    window.switchTab = function(target) {
      document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
      const tab = document.getElementById('tab-' + target);
      if (tab) tab.classList.add('active');

      document.querySelectorAll('.auth-form').forEach(f => {
        f.classList.remove('active');
        f.style.display = 'none';
      });
      // Support both: form-login/form-register AND login-form-new/register-form-new
      const form = document.getElementById('form-' + target) ||
                   document.getElementById(target + '-form-new');
      if (form) {
        form.classList.add('active');
        form.style.display = 'block';
      }
    };

    // Also bind click events
    document.querySelectorAll('.auth-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        window.switchTab(tab.dataset.target);
      });
    });
  }

  /* ── Form Setup ───────────────────────────────────────────── */
  /* ── Form Setup ───────────────────────────────────────────── */
  function _setupForms() {
    // Note: Form submit listeners are now handled inline in index.html
    // This avoids double execution and dependency loading issues
    window.handleLogin    = _doLogin;
    window.handleRegister = _doRegister;
  }

  /* ── Session Handler ──────────────────────────────────────── */
  function _handleSession(session) {
    if (session && session.user) {
      currentUser = session.user;
      _showApp();
    } else {
      // Only hide app if we DON'T have an offline user
      // (offline user already showing the app)
      if (!_getOfflineUser()) {
        currentUser = null;
        _showAuth();
      }
    }
  }

  /* ── Login ────────────────────────────────────────────────── */
  async function _doLogin() {
    if (!supabase) {
      alert('Connection Error: Supabase not loaded. Please refresh the page.');
      return;
    }

    const btn      = document.getElementById('btn-login');
    const origText = btn ? btn.textContent : 'Login';

    if (btn) { btn.textContent = 'Logging in...'; btn.disabled = true; }

    try {
      const phone    = (document.getElementById('login-phone')?.value || '').trim();
      const password = document.getElementById('login-password')?.value || '';

      if (!phone || !password) {
        _showToast('Phone number aur password daalein.', 'error');
        return;
      }

      // Step 1: Look up email by phone
      const { data: lookup, error: lookupErr } = await supabase
        .from('phone_lookup')
        .select('email')
        .eq('phone', phone)
        .single();

      if (lookupErr || !lookup) {
        alert('❌ Phone not registered in our system!\n\nYeh phone number phone_lookup table mein nahi mila.\nPehle Register karein.');
        setTimeout(() => {
          window.switchTab('register');
          const regPhone = document.getElementById('reg-phone');
          if (regPhone) regPhone.value = phone;
        }, 500);
        return;
      }

      // Step 2: Sign in
      const { error } = await supabase.auth.signInWithPassword({
        email: lookup.email,
        password
      });

      if (error) {
        alert('❌ Login Failed: ' + error.message);
      }
      // success handled by onAuthStateChange
    } catch (err) {
      console.error('[Auth] Login crash:', err);
      alert('Login Error: ' + err.message);
    } finally {
      if (btn) { btn.textContent = origText; btn.disabled = false; }
    }
  }

  /* ── Register ─────────────────────────────────────────────── */
  async function _doRegister() {
    if (!supabase) {
      alert('Connection Error: Supabase not loaded. Please refresh the page.');
      return;
    }

    const btn      = document.getElementById('btn-register');
    const origText = btn ? btn.textContent : 'Create Account';

    if (btn) { btn.textContent = 'Creating account...'; btn.disabled = true; }

    try {
      const shopName = (document.getElementById('reg-shop')?.value || '').trim();
      const phone    = (document.getElementById('reg-phone')?.value || '').trim();
      const email    = (document.getElementById('reg-email')?.value || '').trim();
      const password = document.getElementById('reg-password')?.value || '';

      if (!shopName || !phone || !email || !password) {
        _showToast('Sab fields bhaarna zaruri hain.', 'error');
        return;
      }

      // Step 1: Check if phone already registered
      const { data: existing, error: checkErr } = await supabase
        .from('phone_lookup')
        .select('phone')
        .eq('phone', phone)
        .maybeSingle();

      if (checkErr) {
        alert('❌ DB Error checking phone:\n' + JSON.stringify(checkErr));
        return;
      }

      if (existing) {
        alert('❌ Yeh phone number pehle se registered hai.\nDosra phone number use karein.');
        return;
      }

      // Step 2: Create account
      alert('📡 Step 2: Supabase signUp call kar raha hoon...');
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { shop_name: shopName, phone } }
      });

      if (error) {
        alert('❌ SignUp Error:\n' + error.message + '\n\nCode: ' + error.status);
        return;
      }

      alert('✅ SignUp SUCCESS!\nUser: ' + (data.user?.email || 'unknown') + '\nSession: ' + (data.session ? 'YES' : 'NO - email confirm required'));

      // Step 3: Save phone → email mapping
      const { error: insertErr } = await supabase
        .from('phone_lookup')
        .insert({ phone, email });

      if (insertErr) {
        alert('⚠️ phone_lookup insert error:\n' + JSON.stringify(insertErr));
      } else {
        alert('✅ Phone saved to phone_lookup!');
      }

      if (data.session) {
        _showToast('Account successfully ban gaya! 🎉', 'success');
        // onAuthStateChange will handle the redirect automatically
      } else {
        _showToast('Account ban gaya! Ab login karein.', 'info');
        // Switch to login and pre-fill phone
        setTimeout(() => {
          window.switchTab('login');
          const loginPhone = document.getElementById('login-phone');
          if (loginPhone) loginPhone.value = phone;
        }, 1500);
      }
    } catch (err) {
      console.error('[Auth] Register crash:', err);
      alert('Registration CRASH: ' + err.message);
    } finally {
      if (btn) { btn.textContent = origText; btn.disabled = false; }
    }
  }

  /* ── Toast helper ─────────────────────────────────────────── */
  function _showToast(msg, type) {
    if (window.Utils && Utils.toast) {
      Utils.toast(msg, type);
    } else {
      alert(msg);
    }
  }

  /* ── i18n Translations ────────────────────────────────────── */
  function applyAuthTranslations() {
    if (!window.I18n) return;
    const setText = (id, key) => {
      const el = document.getElementById(id);
      if (el) el.textContent = I18n.t(key);
    };
    setText('auth-tagline',       'appTagline');
    setText('tab-login',          'loginTab');
    setText('tab-register',       'registerTab');
    setText('lbl-login-phone',    'phoneLabel');
    setText('lbl-password',       'passwordLabel');
    setText('lbl-password2',      'passwordLabel');
    setText('lbl-shopname',       'shopNameLabel');
    setText('lbl-reg-phone',      'phoneLabel');
    setText('lbl-email2',         'emailLabel');
    setText('btn-login',          'loginBtn');
    setText('btn-register',       'registerBtn');
    setText('install-banner-text','installDesc');
    setText('install-fab-text',   'installApp');
    const shopInput = document.getElementById('reg-shop');
    if (shopInput) shopInput.placeholder = I18n.t('shopNamePlaceholder');
  }

  /* ── Profile Sync ─────────────────────────────────────────── */
  async function _fetchProfile() {
    if (!currentUser || !supabase) {
      if (window.App) App.refreshCurrentPage();
      return;
    }
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .single();

      if (data && !error) {
        const local = DB.getSettings();
        DB.saveSettings({
          shopName:    data.shop_name     || local.shopName,
          ownerName:   data.owner_name    || local.ownerName,
          phone:       data.phone         || local.phone,
          address:     data.address       || local.address,
          thankYouMsg: data.thank_you_msg || local.thankYouMsg
        });
      }
    } catch (err) {
      console.warn('[Auth] fetchProfile error:', err);
    } finally {
      // ALWAYS refresh the UI after auth check completes
      // This fixes the "blank home page until tab switched" glitch
      if (window.App) App.refreshCurrentPage();
    }
  }

  /* ── Logout ───────────────────────────────────────────────── */
  async function logout() {
    try {
      if (supabase) await supabase.auth.signOut();
    } catch(e) {}
    
    // Collect keys first, then remove to avoid index shifting bugs
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('sb-') && key.endsWith('-auth-token')) {
        keysToRemove.push(key);
      }
    }
    
    keysToRemove.forEach(k => localStorage.removeItem(k));
    localStorage.removeItem('offline_user');
    
    window.location.reload();
  }

  return { init, logout, getUser: () => currentUser, applyAuthTranslations };
})();
