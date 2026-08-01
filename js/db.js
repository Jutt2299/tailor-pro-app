/* ============================================================
   db.js – localStorage CRUD Layer
   Keys: tailor_customers, tailor_orders, tailor_settings
   ============================================================ */

'use strict';

const DB = (() => {

  const KEYS = {
    customers: 'tailor_customers',
    orders:    'tailor_orders',
    settings:  'tailor_settings',
  };

  /* ── Raw I/O ─────────────────────────────────────────────── */
  function _read(key) {
    try {
      return JSON.parse(localStorage.getItem(key) || '[]');
    } catch { return []; }
  }
  function _readObj(key, defaults = {}) {
    try {
      return JSON.parse(localStorage.getItem(key) || JSON.stringify(defaults));
    } catch { return defaults; }
  }
  function _write(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
  }

  /* ════════════════════════════════════════════════════════════
     CUSTOMERS
     ════════════════════════════════════════════════════════════ */

  function getCustomers() {
    return _read(KEYS.customers);
  }

  function getCustomerById(id) {
    return getCustomers().find(c => c.id === id) || null;
  }

  function addCustomer(data) {
    const customers = getCustomers();
    const customer = {
      id: Utils.uuid(),
      name:    data.name.trim(),
      phone:   data.phone.trim(),
      address: (data.address || '').trim(),
      measurements: {
        chest:    data.measurements?.chest    || '',
        waist:    data.measurements?.waist    || '',
        hips:     data.measurements?.hips     || '',
        shoulder: data.measurements?.shoulder || '',
        sleeve:   data.measurements?.sleeve   || '',
        length:   data.measurements?.length   || '',
        neck:     data.measurements?.neck     || '',
        thigh:    data.measurements?.thigh    || '',
        notes:    data.measurements?.notes    || '',
      },
      createdAt: Utils.nowISO(),
      updatedAt: Utils.nowISO(),
    };
    customers.unshift(customer);
    _write(KEYS.customers, customers);
    return customer;
  }

  function updateCustomer(id, data) {
    const customers = getCustomers();
    const idx = customers.findIndex(c => c.id === id);
    if (idx === -1) return null;
    customers[idx] = {
      ...customers[idx],
      name:    data.name.trim(),
      phone:   data.phone.trim(),
      address: (data.address || '').trim(),
      measurements: {
        chest:    data.measurements?.chest    || '',
        waist:    data.measurements?.waist    || '',
        hips:     data.measurements?.hips     || '',
        shoulder: data.measurements?.shoulder || '',
        sleeve:   data.measurements?.sleeve   || '',
        length:   data.measurements?.length   || '',
        neck:     data.measurements?.neck     || '',
        thigh:    data.measurements?.thigh    || '',
        notes:    data.measurements?.notes    || '',
      },
      updatedAt: Utils.nowISO(),
    };
    _write(KEYS.customers, customers);
    return customers[idx];
  }

  function deleteCustomer(id) {
    // Also delete all orders for this customer
    const orders = getOrders().filter(o => o.customerId !== id);
    _write(KEYS.orders, orders);
    const customers = getCustomers().filter(c => c.id !== id);
    _write(KEYS.customers, customers);
    return true;
  }

  function searchCustomers(query) {
    if (!query) return getCustomers();
    const q = query.toLowerCase().trim();
    return getCustomers().filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.phone.includes(q)
    );
  }

  /* ════════════════════════════════════════════════════════════
     ORDERS
     ════════════════════════════════════════════════════════════ */

  function getOrders() {
    return _read(KEYS.orders);
  }

  function getOrderById(id) {
    return getOrders().find(o => o.id === id) || null;
  }

  function getOrdersByCustomer(customerId) {
    return getOrders().filter(o => o.customerId === customerId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  function addOrder(data) {
    const orders = getOrders();
    const order = {
      id:                  Utils.uuid(),
      customerId:          data.customerId,
      dressDescription:    (data.dressDescription || '').trim(),
      specialInstructions: (data.specialInstructions || '').trim(),
      totalAmount:         parseFloat(data.totalAmount)     || 0,
      amountPaid:          parseFloat(data.amountPaid)      || 0,
      previousBalance:     parseFloat(data.previousBalance) || 0,
      deliveryDate:        data.deliveryDate || '',
      status:              data.status || 'pending',
      paymentStatus:       _computePaymentStatus(data),
      createdAt:           Utils.nowISO(),
      updatedAt:           Utils.nowISO(),
    };
    orders.unshift(order);
    _write(KEYS.orders, orders);
    return order;
  }

  function updateOrder(id, data) {
    const orders = getOrders();
    const idx = orders.findIndex(o => o.id === id);
    if (idx === -1) return null;
    orders[idx] = {
      ...orders[idx],
      dressDescription:    (data.dressDescription || '').trim(),
      specialInstructions: (data.specialInstructions || '').trim(),
      totalAmount:         parseFloat(data.totalAmount)     || 0,
      amountPaid:          parseFloat(data.amountPaid)      || 0,
      previousBalance:     parseFloat(data.previousBalance) || 0,
      deliveryDate:        data.deliveryDate || '',
      status:              data.status || orders[idx].status,
      paymentStatus:       _computePaymentStatus(data),
      updatedAt:           Utils.nowISO(),
    };
    _write(KEYS.orders, orders);
    return orders[idx];
  }

  function updateOrderStatus(id, status) {
    const orders = getOrders();
    const idx = orders.findIndex(o => o.id === id);
    if (idx === -1) return null;
    orders[idx].status = status;
    orders[idx].updatedAt = Utils.nowISO();
    _write(KEYS.orders, orders);
    return orders[idx];
  }

  function updateOrderPayment(id, amountPaid) {
    const orders = getOrders();
    const idx = orders.findIndex(o => o.id === id);
    if (idx === -1) return null;
    orders[idx].amountPaid = parseFloat(amountPaid) || 0;
    orders[idx].paymentStatus = _computePaymentStatus(orders[idx]);
    orders[idx].updatedAt = Utils.nowISO();
    _write(KEYS.orders, orders);
    return orders[idx];
  }

  function deleteOrder(id) {
    const orders = getOrders().filter(o => o.id !== id);
    _write(KEYS.orders, orders);
    return true;
  }

  function _computePaymentStatus(data) {
    const total = parseFloat(data.totalAmount)     || 0;
    const paid  = parseFloat(data.amountPaid)      || 0;
    const prev  = parseFloat(data.previousBalance) || 0;
    const owed  = total + prev - paid;
    if (owed <= 0) return 'paid';
    if (paid > 0)  return 'partial';
    return 'unpaid';
  }

  /* ════════════════════════════════════════════════════════════
     STATS / AGGREGATES
     ════════════════════════════════════════════════════════════ */

  function getStats() {
    const customers = getCustomers();
    const orders    = getOrders();
    const todayStr  = Utils.today();

    const todaysOrders    = orders.filter(o => o.createdAt.startsWith(todayStr));
    const inProgress      = orders.filter(o => o.status === 'in-progress' || o.status === 'pending');
    const completed       = orders.filter(o => o.status === 'completed' || o.status === 'delivered');
    const todayDeliveries = orders.filter(o => o.deliveryDate === todayStr && !['completed','delivered'].includes(o.status));

    const pendingOrders   = orders.filter(o => o.paymentStatus !== 'paid' && !['completed'].includes(o.status));
    const totalPending    = pendingOrders.reduce((s, o) => s + Utils.balanceDue(o), 0);

    const totalRevenue    = orders.reduce((s, o) => s + (parseFloat(o.totalAmount) || 0), 0);
    const totalCollected  = orders.reduce((s, o) => s + (parseFloat(o.amountPaid)  || 0), 0);

    return {
      totalCustomers:    customers.length,
      todaysOrders:      todaysOrders.length,
      inProgress:        inProgress.length,
      completed:         completed.length,
      todayDeliveries:   todayDeliveries.length,
      pendingPayments:   Utils.currency(totalPending),
      todayDeliveryList: todayDeliveries,
      totalRevenue,
      totalCollected,
      totalPending,
    };
  }

  /* ════════════════════════════════════════════════════════════
     SETTINGS
     ════════════════════════════════════════════════════════════ */

  function getSettings() {
    return _readObj(KEYS.settings, {
      shopName:     'My Tailor Shop',
      ownerName:    '',
      phone:        '',
      address:      '',
      thankYouMsg:  'Thank you for your business!',
    });
  }

  function saveSettings(data) {
    _write(KEYS.settings, { ...getSettings(), ...data });
  }

  /* ════════════════════════════════════════════════════════════
     BACKUP / RESTORE
     ════════════════════════════════════════════════════════════ */

  function exportData() {
    return {
      version:    '1.0',
      exportedAt: Utils.nowISO(),
      customers:  getCustomers(),
      orders:     getOrders(),
      settings:   getSettings(),
    };
  }

  function importData(json) {
    if (!json.customers || !json.orders) throw new Error('Invalid backup file');
    _write(KEYS.customers, json.customers);
    _write(KEYS.orders,    json.orders);
    if (json.settings) _write(KEYS.settings, json.settings);
    return true;
  }

  function clearAllData() {
    _write(KEYS.customers, []);
    _write(KEYS.orders,    []);
    return true;
  }

  /* ── Public API ─────────────────────────────────────────── */
  return {
    // Customers
    getCustomers, getCustomerById, addCustomer, updateCustomer,
    deleteCustomer, searchCustomers,
    // Orders
    getOrders, getOrderById, getOrdersByCustomer, addOrder, updateOrder,
    updateOrderStatus, updateOrderPayment, deleteOrder,
    // Stats
    getStats,
    // Settings
    getSettings, saveSettings,
    // Backup
    exportData, importData, clearAllData,
  };
})();
