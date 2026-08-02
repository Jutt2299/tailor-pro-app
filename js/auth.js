/* ============================================================
   auth.js – Supabase Authentication
   ============================================================ */

'use strict';

const Auth = (() => {
  const supabase = Config.supabase;
  let currentUser = null;

  function init() {
    applyAuthTranslations();

    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      handleSession(session);
    });

    // Listen for auth changes
    supabase.auth.onAuthStateChange((_event, session) => {
      handleSession(session);
    });

    bindUIEvents();
  }

  // Fallback global tab switcher
  window.switchTab = function(target) {
    document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
    const tab = document.getElementById(`tab-${target}`);
    if (tab) tab.classList.add('active');

    document.querySelectorAll('.auth-form').forEach(f => {
      f.classList.remove('active');
      f.style.display = 'none'; // Force hide inline
    });
    const targetForm = document.getElementById(`form-${target}`);
    if (targetForm) {
      targetForm.classList.add('active');
      targetForm.style.display = 'block'; // Force show inline
    }
  };

  function applyAuthTranslations() {
    if (!window.I18n) return;
    const el = (id) => document.getElementById(id);
    const setText = (id, key) => { if (el(id)) el(id).textContent = I18n.t(key); };

    setText('auth-tagline', 'appTagline');
    setText('tab-login', 'loginTab');
    setText('tab-register', 'registerTab');
    setText('lbl-login-phone', 'phoneLabel');
    setText('lbl-password', 'passwordLabel');
    setText('lbl-password2', 'passwordLabel');
    setText('lbl-shopname', 'shopNameLabel');
    setText('lbl-reg-phone', 'phoneLabel');
    setText('lbl-email2', 'emailLabel');
    setText('btn-login', 'loginBtn');
    setText('btn-register', 'registerBtn');
    setText('install-banner-text', 'installDesc');
    setText('install-fab-text', 'installApp');

    const shopInput = document.getElementById('reg-shop');
    if (shopInput) shopInput.placeholder = I18n.t('shopNamePlaceholder');
  }

  function handleSession(session) {
    const authScreen = document.getElementById('auth-screen');
    const appScreen = document.getElementById('app');
    
    if (session && session.user) {
      currentUser = session.user;
      authScreen.classList.add('hidden');
      appScreen.classList.remove('hidden');
      
      // Initialize Sync engine now that we have a user
      if (window.Sync) Sync.init();
      
      // Also fetch and update local profile settings if needed
      fetchProfile();
    } else {
      currentUser = null;
      authScreen.classList.remove('hidden');
      appScreen.classList.add('hidden');
    }
  }

  function bindUIEvents() {
    // Tab switching (keeps existing logic but uses switchTab to guarantee it works)
    document.querySelectorAll('.auth-tab').forEach(tab => {
      tab.addEventListener('click', (e) => {
        window.switchTab(e.currentTarget.dataset.target);
      });
    });

    // ── LOGIN FORM (Phone Number + Password) ──────────────────
    document.getElementById('form-login').addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = document.getElementById('btn-login');
      const loggingInText = window.I18n ? I18n.t('loggingIn') : 'Logging in...';
      const loginText = window.I18n ? I18n.t('loginBtn') : 'Login';

      btn.textContent = loggingInText;
      btn.disabled = true;

      const phone    = document.getElementById('login-phone').value.trim();
      const password = document.getElementById('login-password').value;

      // Step 1: Look up email by phone number
      const { data: lookupData, error: lookupError } = await supabase
        .from('phone_lookup')
        .select('email')
        .eq('phone', phone)
        .single();

      if (lookupError || !lookupData) {
        Utils.toast(
          window.I18n && I18n.getLang() === 'ur'
            ? 'یہ فون نمبر رجسٹرڈ نہیں — پہلے رجسٹر کریں'
            : '⚠️ Phone not registered — switching to Register form',
          'warning'
        );

        // Auto-switch to Register tab and pre-fill phone number
        setTimeout(() => {
          document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
          document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
          document.getElementById('tab-register').classList.add('active');
          document.getElementById('form-register').classList.add('active');
          // Pre-fill phone number so user doesn't have to type again
          const regPhone = document.getElementById('reg-phone');
          if (regPhone) regPhone.value = phone;
        }, 1000);

        btn.textContent = loginText;
        btn.disabled = false;
        return;
      }

      // Step 2: Login with found email + password
      const { error } = await supabase.auth.signInWithPassword({
        email: lookupData.email,
        password
      });
      
      btn.textContent = loginText;
      btn.disabled = false;

      if (error) {
        Utils.toast(
          window.I18n && I18n.getLang() === 'ur'
            ? 'پاس ورڈ غلط ہے۔ دوبارہ کوشش کریں۔'
            : 'Wrong password. Please try again.',
          'error'
        );
      }
      // Success is handled automatically by onAuthStateChange
    });

    // ── REGISTER FORM ─────────────────────────────────────────
    document.getElementById('form-register').addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = document.getElementById('btn-register');
      const creatingText = window.I18n ? I18n.t('creatingAccount') : 'Creating account...';
      const registerText = window.I18n ? I18n.t('registerBtn') : 'Create Account';

      btn.textContent = creatingText;
      btn.disabled = true;

      const shopName = document.getElementById('reg-shop').value.trim();
      const phone    = document.getElementById('reg-phone').value.trim();
      const email    = document.getElementById('reg-email').value.trim();
      const password = document.getElementById('reg-password').value;

      // Step 1: Check if phone already registered
      const { data: existingPhone } = await supabase
        .from('phone_lookup')
        .select('phone')
        .eq('phone', phone)
        .single();

      if (existingPhone) {
        Utils.toast(
          window.I18n && I18n.getLang() === 'ur'
            ? 'یہ فون نمبر پہلے سے رجسٹرڈ ہے۔'
            : 'This phone number is already registered.',
          'error'
        );
        btn.textContent = registerText;
        btn.disabled = false;
        return;
      }

      // Step 2: Create account in Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { shop_name: shopName, phone: phone }
        }
      });
      
      btn.textContent = registerText;
      btn.disabled = false;

      if (error) {
        Utils.toast(error.message, 'error');
        return;
      }

      // Step 3: Save phone → email mapping in phone_lookup table
      await supabase.from('phone_lookup').insert({ phone, email });

      if (data.session) {
        Utils.toast(
          window.I18n && I18n.getLang() === 'ur'
            ? 'اکاؤنٹ کامیابی سے بن گیا!'
            : 'Account created successfully!',
          'success'
        );
      } else {
        Utils.toast(
          window.I18n && I18n.getLang() === 'ur'
            ? 'ای میل چیک کریں اور اکاؤنٹ تصدیق کریں۔'
            : 'Check your email to verify your account.',
          'info'
        );
      }
    });
  }

  async function fetchProfile() {
    if (!currentUser) return;
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', currentUser.id)
      .single();
      
    if (data && !error) {
      const localSettings = DB.getSettings();
      DB.saveSettings({
        shopName:    data.shop_name    || localSettings.shopName,
        ownerName:   data.owner_name   || localSettings.ownerName,
        phone:       data.phone        || localSettings.phone,
        address:     data.address      || localSettings.address,
        thankYouMsg: data.thank_you_msg|| localSettings.thankYouMsg
      });
      if (window.App) App.refreshCurrentPage();
    }
  }

  async function logout() {
    await supabase.auth.signOut();
  }

  return { init, logout, getUser: () => currentUser, applyAuthTranslations };
})();
