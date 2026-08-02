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

  function applyAuthTranslations() {
    if (!window.I18n) return;
    const el = (id) => document.getElementById(id);
    const setText = (id, key) => { if (el(id)) el(id).textContent = I18n.t(key); };

    setText('auth-tagline', 'appTagline');
    setText('tab-login', 'loginTab');
    setText('tab-register', 'registerTab');
    setText('lbl-email', 'emailLabel');
    setText('lbl-email2', 'emailLabel');
    setText('lbl-password', 'passwordLabel');
    setText('lbl-password2', 'passwordLabel');
    setText('lbl-shopname', 'shopNameLabel');
    setText('lbl-phone', 'phoneLabel');
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
    // Tab switching
    document.querySelectorAll('.auth-tab').forEach(tab => {
      tab.addEventListener('click', (e) => {
        document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active', 'hidden'));
        document.querySelectorAll('.auth-form').forEach(f => f.classList.add('hidden'));
        
        e.target.classList.add('active');
        document.getElementById(`form-${e.target.dataset.target}`).classList.remove('hidden');
        document.getElementById(`form-${e.target.dataset.target}`).classList.add('active');
      });
    });

    // Login Form
    document.getElementById('form-login').addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = document.getElementById('btn-login');
      btn.textContent = 'Logging in...';
      btn.disabled = true;

      const email = document.getElementById('login-email').value.trim();
      const password = document.getElementById('login-password').value;

      const { error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        Utils.toast(error.message, 'error');
        btn.textContent = 'Login';
        btn.disabled = false;
      } else {
        // App handles redirect via onAuthStateChange
        btn.textContent = 'Login';
        btn.disabled = false;
        Utils.toast('Welcome back!', 'success');
      }
    });

    // Register Form
    document.getElementById('form-register').addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = document.getElementById('btn-register');
      btn.textContent = 'Creating account...';
      btn.disabled = true;

      const shopName = document.getElementById('reg-shop').value.trim();
      const phone = document.getElementById('reg-phone').value.trim();
      const email = document.getElementById('reg-email').value.trim();
      const password = document.getElementById('reg-password').value;

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { shop_name: shopName, phone: phone }
        }
      });
      
      btn.textContent = 'Create Account';
      btn.disabled = false;

      if (error) {
        Utils.toast(error.message, 'error');
      } else {
        if (data.session) {
          Utils.toast('Account created successfully!', 'success');
        } else {
          Utils.toast('Check your email to verify your account.', 'info');
        }
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
      // Only overwrite local settings if cloud has data
      DB.saveSettings({
        shopName: data.shop_name || localSettings.shopName,
        ownerName: data.owner_name || localSettings.ownerName,
        phone: data.phone || localSettings.phone,
        address: data.address || localSettings.address,
        thankYouMsg: data.thank_you_msg || localSettings.thankYouMsg
      });
      if (window.App) App.refreshCurrentPage();
    }
  }

  async function logout() {
    await supabase.auth.signOut();
  }

  return { init, logout, getUser: () => currentUser, applyAuthTranslations };
})();
