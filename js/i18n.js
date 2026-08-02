/* ============================================================
   i18n.js – Internationalization (English + Urdu)
   ============================================================ */

'use strict';

const I18n = (() => {

  const translations = {
    en: {
      // Auth
      appTagline: 'Login or create a free account',
      loginTab: 'Login',
      registerTab: 'Register',
      emailLabel: 'Email',
      passwordLabel: 'Password',
      loginBtn: 'Login',
      loggingIn: 'Logging in...',
      shopNameLabel: 'Shop Name',
      shopNamePlaceholder: 'My Tailor Shop',
      phoneLabel: 'Phone Number',
      registerBtn: 'Create Account',
      creatingAccount: 'Creating account...',
      installApp: '📲 Install App',
      // Nav
      navHome: 'Home',
      navCustomers: 'Customers',
      navOrders: 'Orders',
      navPayments: 'Payments',
      navSettings: 'Settings',
      // Dashboard
      dashTitle: 'Dashboard',
      dashSubtitle: "Today's Overview",
      dashTotalCustomers: 'Total Customers',
      dashTodayOrders: "Today's Orders",
      dashInProgress: 'In Progress',
      dashDeliveries: "Today's Deliveries",
      // Customers
      customersTitle: 'Customers',
      searchPlaceholder: 'Search by name or phone...',
      addCustomer: '+ Add Customer',
      noCustomers: 'No customers yet',
      // Orders
      ordersTitle: 'Orders',
      addOrder: '+ Add Order',
      noOrders: 'No orders yet',
      // Payments
      paymentsTitle: 'Payments',
      // Settings
      settingsTitle: 'Settings',
      settingsSubtitle: 'App Configuration',
      shopInfo: '🏪 Shop Information',
      language: '🌐 Language',
      languageSelect: 'App Language',
      english: 'English',
      urdu: 'اردو (Urdu)',
      dataManagement: '💾 Data Management',
      exportBackup: 'Export Backup',
      exportDesc: 'Save all data as JSON file',
      importBackup: 'Import Backup',
      importDesc: 'Restore data from JSON file',
      appInfo: 'ℹ️ App Info',
      privacy: 'Privacy',
      privacyDesc: 'Your data is synced securely to the cloud.',
      dangerZone: '⚠️ Danger Zone',
      clearLocalData: 'Clear Local Data',
      clearLocalDesc: 'Clear data from this device only',
      logout: 'Logout',
      logoutDesc: 'Sign out of your Tailor account',
      saveSettings: '💾 Save Settings',
      // Status
      paid: 'Paid',
      partial: 'Partial',
      unpaid: 'Unpaid',
      pending: 'Pending',
      inProgress: 'In Progress',
      ready: 'Ready',
      delivered: 'Delivered',
      completed: 'Completed',
      // Install
      installTitle: '📲 Install Tailor Pro',
      installDesc: 'Install this app on your phone for quick access, even offline!',
      installNow: 'Install Now',
      installLater: 'Later',
    },

    ur: {
      // Auth
      appTagline: 'لاگ ان کریں یا مفت اکاؤنٹ بنائیں',
      loginTab: 'لاگ ان',
      registerTab: 'رجسٹر',
      emailLabel: 'ای میل',
      passwordLabel: 'پاس ورڈ',
      loginBtn: 'لاگ ان',
      loggingIn: 'لاگ ان ہو رہا ہے...',
      shopNameLabel: 'دکان کا نام',
      shopNamePlaceholder: 'میری درزی کی دکان',
      phoneLabel: 'فون نمبر',
      registerBtn: 'اکاؤنٹ بنائیں',
      creatingAccount: 'اکاؤنٹ بن رہا ہے...',
      installApp: '📲 ایپ انسٹال کریں',
      // Nav
      navHome: 'ہوم',
      navCustomers: 'گاہک',
      navOrders: 'آرڈر',
      navPayments: 'ادائیگی',
      navSettings: 'ترتیبات',
      // Dashboard
      dashTitle: 'ڈیش بورڈ',
      dashSubtitle: 'آج کا جائزہ',
      dashTotalCustomers: 'کل گاہک',
      dashTodayOrders: 'آج کے آرڈر',
      dashInProgress: 'جاری',
      dashDeliveries: 'آج کی ڈیلیوری',
      // Customers
      customersTitle: 'گاہک',
      searchPlaceholder: 'نام یا فون سے تلاش کریں...',
      addCustomer: '+ گاہک شامل کریں',
      noCustomers: 'ابھی کوئی گاہک نہیں',
      // Orders
      ordersTitle: 'آرڈر',
      addOrder: '+ آرڈر شامل کریں',
      noOrders: 'ابھی کوئی آرڈر نہیں',
      // Payments
      paymentsTitle: 'ادائیگیاں',
      // Settings
      settingsTitle: 'ترتیبات',
      settingsSubtitle: 'ایپ کی ترتیب',
      shopInfo: '🏪 دکان کی معلومات',
      language: '🌐 زبان',
      languageSelect: 'ایپ کی زبان',
      english: 'English',
      urdu: 'اردو (Urdu)',
      dataManagement: '💾 ڈیٹا مینجمنٹ',
      exportBackup: 'بیک اپ برآمد کریں',
      exportDesc: 'سارا ڈیٹا JSON فائل میں محفوظ کریں',
      importBackup: 'بیک اپ درآمد کریں',
      importDesc: 'JSON فائل سے ڈیٹا بحال کریں',
      appInfo: 'ℹ️ ایپ کی معلومات',
      privacy: 'رازداری',
      privacyDesc: 'آپ کا ڈیٹا محفوظ طریقے سے کلاؤڈ میں محفوظ ہوتا ہے۔',
      dangerZone: '⚠️ خطرناک حصہ',
      clearLocalData: 'مقامی ڈیٹا صاف کریں',
      clearLocalDesc: 'صرف اس آلے سے ڈیٹا صاف کریں',
      logout: 'لاگ آؤٹ',
      logoutDesc: 'اپنے درزی اکاؤنٹ سے باہر نکلیں',
      saveSettings: '💾 ترتیبات محفوظ کریں',
      // Status
      paid: 'ادا شدہ',
      partial: 'جزوی',
      unpaid: 'واجب الادا',
      pending: 'زیر التواء',
      inProgress: 'جاری',
      ready: 'تیار',
      delivered: 'پہنچا دیا',
      completed: 'مکمل',
      // Install
      installTitle: '📲 ٹیلر پرو انسٹال کریں',
      installDesc: 'تیز رسائی کے لیے یہ ایپ اپنے فون پر انسٹال کریں، بغیر انٹرنیٹ کے بھی!',
      installNow: 'ابھی انسٹال کریں',
      installLater: 'بعد میں',
    }
  };

  let currentLang = localStorage.getItem('tailor_lang') || 'en';

  function t(key) {
    return (translations[currentLang] || translations.en)[key] || translations.en[key] || key;
  }

  function setLang(lang) {
    currentLang = lang;
    localStorage.setItem('tailor_lang', lang);
    // Set RTL direction for Urdu
    document.documentElement.setAttribute('dir', lang === 'ur' ? 'rtl' : 'ltr');
    document.documentElement.setAttribute('lang', lang);
  }

  function getLang() { return currentLang; }

  // Apply RTL on load if needed
  setLang(currentLang);

  return { t, setLang, getLang };
})();
