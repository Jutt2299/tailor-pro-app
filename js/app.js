/* ============================================================
   app.js – Router and App Initialization
   ============================================================ */

'use strict';

const App = (() => {
  let _currentPage = 'home';

  function init() {
    // Initialize Modals
    Modals.init();

    // Navigation Click Handlers
    document.querySelectorAll('.bottom-nav .nav-item').forEach(nav => {
      nav.addEventListener('click', (e) => {
        const page = e.currentTarget.dataset.page;
        navigate(page);
      });
    });

    // Load initial page
    navigate('home');
  }

  function navigate(page) {
    if (page === _currentPage && document.getElementById(`page-${page}`).classList.contains('active')) {
       return; // Already on this page
    }
    _currentPage = page;

    // Update Nav UI
    document.querySelectorAll('.bottom-nav .nav-item').forEach(nav => {
      nav.classList.toggle('active', nav.dataset.page === page);
    });

    // Update Pages UI
    document.querySelectorAll('.page').forEach(el => {
      el.classList.remove('active');
    });
    document.getElementById(`page-${page}`).classList.add('active');

    // Render logic per page
    switch (page) {
      case 'home':      Dashboard.render(); break;
      case 'customers': Customers.render(); break;
      case 'orders':    Orders.render(); break;
      case 'payments':  Payments.render(); break;
      case 'settings':  Settings.render(); break;
    }
    window.scrollTo(0, 0);
  }

  function refreshCurrentPage() {
    navigate(_currentPage);
    // Force re-render if it was already active
    switch (_currentPage) {
      case 'home':      Dashboard.render(); break;
      case 'customers': Customers.render(); break;
      case 'orders':    Orders.render(); break;
      case 'payments':  Payments.render(); break;
      case 'settings':  Settings.render(); break;
    }
  }

  return { init, navigate, refreshCurrentPage };
})();

// Boot the app
document.addEventListener('DOMContentLoaded', () => {
  App.init();
  if (window.Auth) Auth.init();
});
