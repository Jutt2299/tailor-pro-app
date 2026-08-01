/* ============================================================
   utils.js – Helper Functions
   ============================================================ */

'use strict';

const Utils = (() => {

  /* ── UUID ────────────────────────────────────────────────── */
  function uuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      const r = Math.random() * 16 | 0;
      return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
  }

  /* ── Date Helpers ────────────────────────────────────────── */
  function today() {
    return new Date().toISOString().split('T')[0];
  }

  function formatDate(iso) {
    if (!iso) return '—';
    const d = new Date(iso + (iso.length === 10 ? 'T00:00:00' : ''));
    return d.toLocaleDateString('en-PK', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  function formatDateShort(iso) {
    if (!iso) return '—';
    const d = new Date(iso + (iso.length === 10 ? 'T00:00:00' : ''));
    return d.toLocaleDateString('en-PK', { day: '2-digit', month: 'short' });
  }

  function isToday(iso) {
    return iso && iso.substring(0, 10) === today();
  }

  function isPast(iso) {
    if (!iso) return false;
    return iso.substring(0, 10) < today();
  }

  function daysFromNow(iso) {
    if (!iso) return null;
    const now  = new Date(today());
    const then = new Date(iso.substring(0, 10));
    return Math.round((then - now) / (1000 * 60 * 60 * 24));
  }

  function formatDeliveryStatus(iso) {
    if (!iso) return '';
    const days = daysFromNow(iso);
    if (days < 0)  return `${Math.abs(days)}d overdue`;
    if (days === 0) return 'Due today!';
    if (days === 1) return 'Due tomorrow';
    return `In ${days} days`;
  }

  function nowISO() {
    return new Date().toISOString();
  }

  /* ── Currency ────────────────────────────────────────────── */
  function currency(amount) {
    const n = parseFloat(amount) || 0;
    return 'Rs. ' + n.toLocaleString('en-PK');
  }

  /* ── Initials ────────────────────────────────────────────── */
  function initials(name) {
    if (!name) return '?';
    return name.trim().split(/\s+/).slice(0, 2)
      .map(w => w[0].toUpperCase()).join('');
  }

  /* ── Payment Status ─────────────────────────────────────── */
  function paymentStatus(order) {
    const total  = parseFloat(order.totalAmount)    || 0;
    const paid   = parseFloat(order.amountPaid)     || 0;
    const prev   = parseFloat(order.previousBalance)|| 0;
    const owed   = total + prev - paid;
    if (owed <= 0)       return 'paid';
    if (paid > 0)        return 'partial';
    return 'unpaid';
  }

  function balanceDue(order) {
    const total = parseFloat(order.totalAmount)     || 0;
    const paid  = parseFloat(order.amountPaid)      || 0;
    const prev  = parseFloat(order.previousBalance) || 0;
    return Math.max(0, total + prev - paid);
  }

  function paymentBadgeHTML(status) {
    const map = {
      paid:    ['badge-paid',    '💚', 'Paid'],
      partial: ['badge-partial', '🟡', 'Partial'],
      unpaid:  ['badge-unpaid',  '🔴', 'Unpaid'],
    };
    const [cls, icon, label] = map[status] || map.unpaid;
    return `<span class="badge ${cls}">${icon} ${label}</span>`;
  }

  function orderStatusBadgeHTML(status) {
    const map = {
      pending:    ['badge-pending',    '⏳', 'Pending'],
      'in-progress': ['badge-progress','🧵', 'In Progress'],
      ready:      ['badge-ready',      '🔵', 'Ready'],
      delivered:  ['badge-delivered',  '📦', 'Delivered'],
      completed:  ['badge-completed',  '✅', 'Completed'],
    };
    const [cls, icon, label] = map[status] || map.pending;
    return `<span class="badge ${cls}">${icon} ${label}</span>`;
  }

  /* ── Sanitize HTML ──────────────────────────────────────── */
  function esc(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  /* ── Toast ──────────────────────────────────────────────── */
  let toastContainer = null;
  function toast(msg, type = 'info', duration = 3000) {
    if (!toastContainer) {
      toastContainer = document.createElement('div');
      toastContainer.className = 'toast-container';
      document.body.appendChild(toastContainer);
    }
    const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
    const el = document.createElement('div');
    el.className = `toast ${type}`;
    el.innerHTML = `<span>${icons[type] || 'ℹ️'}</span><span>${esc(msg)}</span>`;
    toastContainer.appendChild(el);
    setTimeout(() => {
      el.classList.add('out');
      el.addEventListener('animationend', () => el.remove(), { once: true });
    }, duration);
  }

  /* ── Confirm Dialog ─────────────────────────────────────── */
  function confirm({ icon = '⚠️', title, message, confirmText = 'Confirm', cancelText = 'Cancel', danger = false }) {
    return new Promise(resolve => {
      let overlay = document.getElementById('confirm-dialog');
      if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'confirm-dialog';
        overlay.className = 'confirm-dialog';
        overlay.innerHTML = `
          <div class="confirm-box">
            <span class="confirm-icon" id="confirm-icon"></span>
            <div class="confirm-title" id="confirm-title"></div>
            <div class="confirm-message" id="confirm-message"></div>
            <div class="confirm-actions">
              <button class="btn btn-secondary" id="confirm-cancel"></button>
              <button class="btn btn-primary" id="confirm-ok"></button>
            </div>
          </div>`;
        document.body.appendChild(overlay);
      }
      overlay.querySelector('#confirm-icon').textContent = icon;
      overlay.querySelector('#confirm-title').textContent = title;
      overlay.querySelector('#confirm-message').textContent = message;
      const okBtn = overlay.querySelector('#confirm-ok');
      const cancelBtn = overlay.querySelector('#confirm-cancel');
      okBtn.textContent = confirmText;
      cancelBtn.textContent = cancelText;
      okBtn.className = `btn ${danger ? 'btn-danger' : 'btn-primary'}`;

      const close = (result) => {
        overlay.classList.remove('open');
        resolve(result);
      };
      okBtn.onclick = () => close(true);
      cancelBtn.onclick = () => close(false);
      overlay.onclick = (e) => { if (e.target === overlay) close(false); };
      requestAnimationFrame(() => overlay.classList.add('open'));
    });
  }

  /* ── Export ─────────────────────────────────────────────── */
  return { uuid, today, formatDate, formatDateShort, isToday, isPast,
           daysFromNow, formatDeliveryStatus, nowISO,
           currency, initials, paymentStatus, balanceDue,
           paymentBadgeHTML, orderStatusBadgeHTML, esc, toast, confirm };
})();
