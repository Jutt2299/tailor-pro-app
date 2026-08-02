/* ============================================================
   db.js – localStorage CRUD Layer (with Offline-First Sync logic)
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

  /* ── Sync Helpers ───────────────────────────────────────── */
  function _markSynced(table, id) {
    const key = table === 'customers' ? KEYS.customers : KEYS.orders;
    const items = _read(key);
    const idx = items.findIndex(i => i.id === id);
    if (idx !== -1) {
      items[idx].sync_status = 'synced';
      _write(key, items);
    }
  }

  function _hardDelete(table, id) {
    const key = table === 'customers' ? KEYS.customers : KEYS.orders;
    const items = _read(key).filter(i => i.id !== id);
    _write(key, items);
  }

  function notifySync() {
    if (window.Sync) Sync.trigger();
  }

  /* ════════════════════════════════════════════════════════════
     CUSTOMERS
     ════════════════════════════════════════════════════════════ */

  function getCustomers() {
    return _read(KEYS.customers).filter(c => !c.is_deleted);
  }

  function getCustomerById(id) {
    return getCustomers().find(c => c.id === id) || null;
  }

  function addCustomer(data) {
    const customers = _read(KEYS.customers);
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
      is_deleted: false,
      created_at: Utils.nowISO(),
      updated_at: Utils.nowISO(),
      sync_status: 'pending_insert'
    };
    customers.unshift(customer);
    _write(KEYS.customers, customers);
    notifySync();
    return customer;
  }

  function updateCustomer(id, data) {
    const customers = _read(KEYS.customers);
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
      updated_at: Utils.nowISO(),
      sync_status: customers[idx].sync_status === 'pending_insert' ? 'pending_insert' : 'pending_update'
    };
    _write(KEYS.customers, customers);
    notifySync();
    return customers[idx];
  }

  function deleteCustomer(id) {
    const customers = _read(KEYS.customers);
    const idx = customers.findIndex(c => c.id === id);
    if (idx !== -1) {
      if (customers[idx].sync_status === 'pending_insert') {
        // Was never on server, just hard delete
        _hardDelete('customers', id);
      } else {
        customers[idx].is_deleted = true;
        customers[idx].sync_status = 'pending_delete';
        customers[idx].updated_at = Utils.nowISO();
        _write(KEYS.customers, customers);
      }
    }
    
    // Also soft-delete all orders for this customer
    const orders = _read(KEYS.orders);
    orders.forEach(o => {
      if (o.customer_id === id) {
        if (o.sync_status === 'pending_insert') {
           _hardDelete('orders', o.id);
        } else {
           o.is_deleted = true;
           o.sync_status = 'pending_delete';
           o.updated_at = Utils.nowISO();
        }
      }
    });
    _write(KEYS.orders, orders);
    notifySync();
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
    return _read(KEYS.orders).filter(o => !o.is_deleted);
  }

  function getOrderById(id) {
    return getOrders().find(o => o.id === id) || null;
  }

  function getOrdersByCustomer(customerId) {
    return getOrders().filter(o => o.customer_id === customerId)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }

  function addOrder(data) {
    const orders = _read(KEYS.orders);
    const order = {
      id:                  Utils.uuid(),
      customer_id:         data.customerId, // Using snake_case for Supabase compatibility
      dress_description:   (data.dressDescription || '').trim(),
      special_instructions:(data.specialInstructions || '').trim(),
      total_amount:        parseFloat(data.totalAmount)     || 0,
      amount_paid:         parseFloat(data.amountPaid)      || 0,
      previous_balance:    parseFloat(data.previousBalance) || 0,
      delivery_date:       data.deliveryDate || '',
      status:              data.status || 'pending',
      payment_status:      _computePaymentStatus(data),
      is_deleted:          false,
      created_at:          Utils.nowISO(),
      updated_at:          Utils.nowISO(),
      sync_status:         'pending_insert'
    };
    orders.unshift(order);
    _write(KEYS.orders, orders);
    notifySync();
    return order;
  }

  function updateOrder(id, data) {
    const orders = _read(KEYS.orders);
    const idx = orders.findIndex(o => o.id === id);
    if (idx === -1) return null;
    orders[idx] = {
      ...orders[idx],
      dress_description:   (data.dressDescription || '').trim(),
      special_instructions:(data.specialInstructions || '').trim(),
      total_amount:        parseFloat(data.totalAmount)     || 0,
      amount_paid:         parseFloat(data.amountPaid)      || 0,
      previous_balance:    parseFloat(data.previousBalance) || 0,
      delivery_date:       data.deliveryDate || '',
      status:              data.status || orders[idx].status,
      payment_status:      _computePaymentStatus(data),
      updated_at:          Utils.nowISO(),
      sync_status:         orders[idx].sync_status === 'pending_insert' ? 'pending_insert' : 'pending_update'
    };
    _write(KEYS.orders, orders);
    notifySync();
    return orders[idx];
  }

  function updateOrderStatus(id, status) {
    const orders = _read(KEYS.orders);
    const idx = orders.findIndex(o => o.id === id);
    if (idx === -1) return null;
    orders[idx].status = status;
    orders[idx].updated_at = Utils.nowISO();
    orders[idx].sync_status = orders[idx].sync_status === 'pending_insert' ? 'pending_insert' : 'pending_update';
    _write(KEYS.orders, orders);
    notifySync();
    return orders[idx];
  }

  function updateOrderPayment(id, amountPaid) {
    const orders = _read(KEYS.orders);
    const idx = orders.findIndex(o => o.id === id);
    if (idx === -1) return null;
    orders[idx].amount_paid = parseFloat(amountPaid) || 0;
    
    // Convert property names for compute function
    orders[idx].payment_status = _computePaymentStatus({
      totalAmount: orders[idx].total_amount,
      amountPaid: orders[idx].amount_paid,
      previousBalance: orders[idx].previous_balance
    });
    
    orders[idx].updated_at = Utils.nowISO();
    orders[idx].sync_status = orders[idx].sync_status === 'pending_insert' ? 'pending_insert' : 'pending_update';
    _write(KEYS.orders, orders);
    notifySync();
    return orders[idx];
  }

  function deleteOrder(id) {
    const orders = _read(KEYS.orders);
    const idx = orders.findIndex(o => o.id === id);
    if (idx !== -1) {
      if (orders[idx].sync_status === 'pending_insert') {
        _hardDelete('orders', id);
      } else {
        orders[idx].is_deleted = true;
        orders[idx].sync_status = 'pending_delete';
        orders[idx].updated_at = Utils.nowISO();
        _write(KEYS.orders, orders);
      }
    }
    notifySync();
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

    const todaysOrders    = orders.filter(o => o.created_at && o.created_at.startsWith(todayStr));
    const inProgress      = orders.filter(o => o.status === 'in-progress' || o.status === 'pending');
    const completed       = orders.filter(o => o.status === 'completed' || o.status === 'delivered');
    const todayDeliveries = orders.filter(o => o.delivery_date === todayStr && !['completed','delivered'].includes(o.status));

    const pendingOrders   = orders.filter(o => o.payment_status !== 'paid' && !['completed'].includes(o.status));
    const totalPending    = pendingOrders.reduce((s, o) => s + Utils.balanceDue(o), 0);

    const totalRevenue    = orders.reduce((s, o) => s + (parseFloat(o.total_amount) || 0), 0);
    const totalCollected  = orders.reduce((s, o) => s + (parseFloat(o.amount_paid)  || 0), 0);

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

  async function saveSettings(data) {
    _write(KEYS.settings, { ...getSettings(), ...data });
    
    // Sync settings to Supabase profiles table
    const user = Auth.getUser();
    if (user && navigator.onLine) {
      Config.supabase.from('profiles').upsert({
        id: user.id,
        shop_name: data.shopName,
        owner_name: data.ownerName,
        phone: data.phone,
        address: data.address,
        thank_you_msg: data.thankYouMsg,
        updated_at: Utils.nowISO()
      }).then(({error}) => {
         if(error) console.error("Failed to sync profile:", error);
      });
    }
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
    
    // Mark imported data as pending_insert so it syncs to cloud
    const customers = _read(KEYS.customers);
    customers.forEach(c => c.sync_status = 'pending_insert');
    _write(KEYS.customers, customers);
    
    const orders = _read(KEYS.orders);
    orders.forEach(o => o.sync_status = 'pending_insert');
    _write(KEYS.orders, orders);
    
    notifySync();
    return true;
  }

  function clearAllData() {
    _write(KEYS.customers, []);
    _write(KEYS.orders,    []);
    // Should we delete from cloud? Let's just clear local for now or warn user.
    return true;
  }

  /* ── Public API ─────────────────────────────────────────── */
  return {
    _read, _write, _markSynced, _hardDelete, // For Sync Engine
    
    getCustomers, getCustomerById, addCustomer, updateCustomer,
    deleteCustomer, searchCustomers,
    
    getOrders, getOrderById, getOrdersByCustomer, addOrder, updateOrder,
    updateOrderStatus, updateOrderPayment, deleteOrder,
    
    getStats,
    
    getSettings, saveSettings,
    
    exportData, importData, clearAllData,
  };
})();
