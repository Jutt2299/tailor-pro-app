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
    const form = document.getElementById('form-' + target);
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

    if (!supabase) {
      console.error('[Auth] Supabase not available');
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      _handleSession(session);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      _handleSession(session);
    });
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
      const form = document.getElementById('form-' + target);
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
    const authScreen = document.getElementById('auth-screen');
    const appScreen  = document.getElementById('app');

    if (session && session.user) {
      currentUser = session.user;
      if (authScreen) authScreen.classList.add('hidden');
      if (appScreen)  appScreen.classList.remove('hidden');
      if (window.Sync) Sync.init();
      _fetchProfile();
    } else {
      currentUser = null;
      if (authScreen) authScreen.classList.remove('hidden');
      if (appScreen)  appScreen.classList.add('hidden');
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
    if (!currentUser || !supabase) return;
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
        if (window.App) App.refreshCurrentPage();
      }
    } catch (err) {
      console.warn('[Auth] fetchProfile error:', err);
    }
  }

  /* ── Logout ───────────────────────────────────────────────── */
  async function logout() {
    if (supabase) await supabase.auth.signOut();
  }

  return { init, logout, getUser: () => currentUser, applyAuthTranslations };
})();
