/* ============================================================
   sync.js – Offline-First Synchronization Engine
   ============================================================ */

'use strict';

const Sync = (() => {
  const supabase = Config.supabase;
  let isSyncing = false;

  function init() {
    window.addEventListener('online', syncAll);
    // Also try to sync right away when initialized
    if (navigator.onLine) {
      syncAll();
    }
  }

  async function syncAll() {
    if (isSyncing || !navigator.onLine) return;
    const user = Auth.getUser();
    if (!user) return;

    isSyncing = true;
    try {
      await pushChanges('customers');
      await pushChanges('orders');
      
      await pullChanges('customers');
      await pullChanges('orders');
      
      // Update UI if we are on a page that needs refreshing
      if (window.App) App.refreshCurrentPage();
    } catch (e) {
      console.error('Sync failed:', e);
    } finally {
      isSyncing = false;
    }
  }

  async function pushChanges(table) {
    const user = Auth.getUser();
    const localData = DB._read(table === 'customers' ? 'tailor_customers' : 'tailor_orders');
    
    // Find records that need pushing
    const pending = localData.filter(r => r.sync_status && r.sync_status !== 'synced');
    
    for (const record of pending) {
      try {
        if (record.sync_status === 'pending_insert' || record.sync_status === 'pending_update') {
          // Prepare payload for Supabase
          const payload = { ...record };
          delete payload.sync_status;
          
          if (table === 'customers') {
            payload.tailor_id = user.id;
          } else if (table === 'orders') {
            payload.tailor_id = user.id;
          }

          const { error } = await supabase.from(table).upsert(payload);
          if (!error) {
            DB._markSynced(table, record.id);
          }
        } else if (record.sync_status === 'pending_delete') {
          const { error } = await supabase.from(table).delete().eq('id', record.id);
          if (!error) {
            DB._hardDelete(table, record.id);
          }
        }
      } catch (err) {
        console.error(`Error pushing ${table} record ${record.id}:`, err);
      }
    }
  }

  async function pullChanges(table) {
    const user = Auth.getUser();
    const storageKey = table === 'customers' ? 'tailor_customers' : 'tailor_orders';
    const localData = DB._read(storageKey);
    
    // Find the latest updated_at in local data to fetch only new changes
    let lastSynced = '1970-01-01T00:00:00.000Z';
    localData.forEach(r => {
      if (r.updated_at && r.updated_at > lastSynced) {
        lastSynced = r.updated_at;
      }
    });

    const { data, error } = await supabase
      .from(table)
      .select('*')
      .gt('updated_at', lastSynced)
      .eq('tailor_id', user.id);

    if (error || !data || data.length === 0) return;

    // Merge changes into local storage
    let updatedLocalData = [...localData];
    
    data.forEach(remoteRecord => {
      remoteRecord.sync_status = 'synced'; // Mark as synced locally
      
      const idx = updatedLocalData.findIndex(r => r.id === remoteRecord.id);
      if (idx >= 0) {
        // Only overwrite if remote is newer, or if we don't have pending local changes
        if (updatedLocalData[idx].sync_status === 'synced') {
           updatedLocalData[idx] = remoteRecord;
        }
      } else {
        updatedLocalData.push(remoteRecord);
      }
    });

    // Remove any hard-deleted records
    updatedLocalData = updatedLocalData.filter(r => !r.is_deleted);
    
    DB._write(storageKey, updatedLocalData);
  }

  // Trigger sync manually (e.g. after a local save)
  function trigger() {
    if (navigator.onLine) {
      setTimeout(syncAll, 1000); // slight debounce
    }
  }

  return { init, trigger };
})();
