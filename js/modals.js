/* ============================================================
   modals.js – All Modal Dialogs
   - Add/Edit Customer
   - Add/Edit Order
   - Receipt
   - Customer Profile (full-page modal)
   ============================================================ */

'use strict';

const Modals = (() => {

  /* ── Generic Modal helpers ──────────────────────────────── */
  function openOverlay(id) {
    const el = document.getElementById(id);
    if (el) requestAnimationFrame(() => el.classList.add('open'));
  }
  function closeOverlay(id) {
    const el = document.getElementById(id);
    if (el) el.classList.remove('open');
  }
  function bindClose(overlayId, ...btnIds) {
    const overlay = document.getElementById(overlayId);
    if (!overlay) return;
    overlay.addEventListener('click', e => { if (e.target === overlay) closeOverlay(overlayId); });
    btnIds.forEach(id => {
      const btn = document.getElementById(id);
      if (btn) btn.addEventListener('click', () => closeOverlay(overlayId));
    });
  }

  /* ════════════════════════════════════════════════════════════
     CUSTOMER MODAL (Add / Edit)
     ════════════════════════════════════════════════════════════ */

  function initCustomerModal() {
    const html = `
    <div class="modal-overlay" id="modal-customer">
      <div class="modal-sheet">
        <div class="modal-handle"></div>
        <div class="modal-header">
          <h2 class="modal-title" id="modal-customer-title">Add Customer</h2>
          <button class="modal-close" id="modal-customer-close">✕</button>
        </div>
        <div class="modal-body">
          <form id="form-customer" novalidate>
            <input type="hidden" id="customer-edit-id">

            <div class="section-title">👤 Personal Info</div>

            <div class="form-group">
              <label class="form-label" for="c-name">Full Name <span class="required">*</span></label>
              <input class="form-control" id="c-name" type="text" placeholder="e.g. Fatima Khan" autocomplete="off">
            </div>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label" for="c-phone">Phone <span class="required">*</span></label>
                <input class="form-control" id="c-phone" type="tel" placeholder="03xx-xxxxxxx">
              </div>
              <div class="form-group">
                <label class="form-label" for="c-address">Address</label>
                <input class="form-control" id="c-address" type="text" placeholder="Optional">
              </div>
            </div>

            <!-- Gender Selector -->
            <div class="section-title" style="margin-top:4px">⚧ Category</div>
            <div class="gender-selector">
              <button type="button" class="gender-sel-btn active" data-gender="gents" id="sel-gents">
                👔 Gents
              </button>
              <button type="button" class="gender-sel-btn" data-gender="ladies" id="sel-ladies">
                👗 Ladies
              </button>
            </div>
            <input type="hidden" id="c-gender" value="gents">

            <!-- Measurements (dynamic) -->
            <div class="section-title" style="margin-top:12px">📏 Measurements (inches)</div>
            <div id="measurements-container"></div>

          </form>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" id="modal-customer-cancel">Cancel</button>
          <button class="btn btn-primary" id="modal-customer-save">💾 Save Customer</button>
        </div>
      </div>
    </div>`;
    document.body.insertAdjacentHTML('beforeend', html);
    bindClose('modal-customer', 'modal-customer-close', 'modal-customer-cancel');
    document.getElementById('modal-customer-save').addEventListener('click', saveCustomer);

    // Gender selector buttons
    document.querySelectorAll('.gender-sel-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.gender-sel-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById('c-gender').value = btn.dataset.gender;
        renderMeasurementFields(btn.dataset.gender);
      });
    });

    // Initial render
    renderMeasurementFields('gents');
  }

  function renderMeasurementFields(gender) {
    const lang = I18n.getLang();
    const ur = lang === 'ur';
    const container = document.getElementById('measurements-container');
    if (!container) return;

    // Save existing values before re-render
    const existingVals = {};
    container.querySelectorAll('input, select, textarea').forEach(el => {
      if (el.id) existingVals[el.id] = el.value;
    });

    if (gender === 'gents') {
      container.innerHTML = `
        <div class="measurement-section">
          <div class="measurement-grid">
            <div class="measurement-field">
              <label for="m-length">${ur ? 'لمبائی (قمیض)' : 'Length (Kameez)'}</label>
              <input id="m-length" type="number" step="0.5" placeholder="30" value="${existingVals['m-length']||''}">
            </div>
            <div class="measurement-field">
              <label for="m-shoulder">${ur ? 'تیرا (کندھا)' : 'Shoulder (Tera)'}</label>
              <input id="m-shoulder" type="number" step="0.5" placeholder="15" value="${existingVals['m-shoulder']||''}">
            </div>
            <div class="measurement-field">
              <label for="m-chest">${ur ? 'چھاتی' : 'Chest (Chhati)'}</label>
              <input id="m-chest" type="number" step="0.5" placeholder="38" value="${existingVals['m-chest']||''}">
            </div>
            <div class="measurement-field">
              <label for="m-waist">${ur ? 'کمر' : 'Waist (Kamar)'}</label>
              <input id="m-waist" type="number" step="0.5" placeholder="34" value="${existingVals['m-waist']||''}">
            </div>
            <div class="measurement-field">
              <label for="m-arm">${ur ? 'بازو' : 'Arm/Sleeve (Bazo)'}</label>
              <input id="m-arm" type="number" step="0.5" placeholder="24" value="${existingVals['m-arm']||''}">
            </div>
            <div class="measurement-field">
              <label for="m-neck">${ur ? 'گلا / کالر' : 'Neck/Collar (Gala)'}</label>
              <input id="m-neck" type="number" step="0.5" placeholder="14" value="${existingVals['m-neck']||''}">
            </div>
            <div class="measurement-field">
              <label for="m-shalwar-length">${ur ? 'شلوار لمبائی' : 'Shalwar Length'}</label>
              <input id="m-shalwar-length" type="number" step="0.5" placeholder="40" value="${existingVals['m-shalwar-length']||''}">
            </div>
            <div class="measurement-field">
              <label for="m-shalwar-ankle">${ur ? 'پانچہ' : 'Ankle (Poncha)'}</label>
              <input id="m-shalwar-ankle" type="number" step="0.5" placeholder="8" value="${existingVals['m-shalwar-ankle']||''}">
            </div>
          </div>

          <div class="section-title" style="margin-top:16px;margin-bottom:8px">✂️ ${ur ? 'اضافی پسند' : 'Style Preferences (Optional)'}</div>
          <div class="measurement-grid">
            <div class="measurement-field">
              <label for="m-collar-type">${ur ? 'کالر کا انداز' : 'Collar Type'}</label>
              <select id="m-collar-type">
                <option value="">${ur ? 'منتخب کریں' : 'Select...'}</option>
                <option value="collar" ${existingVals['m-collar-type']==='collar'?'selected':''}>Collar</option>
                <option value="ban" ${existingVals['m-collar-type']==='ban'?'selected':''}>Ban</option>
                <option value="half_ban" ${existingVals['m-collar-type']==='half_ban'?'selected':''}>Half Ban</option>
              </select>
            </div>
            <div class="measurement-field">
              <label for="m-cuff-style">${ur ? 'کف کا انداز' : 'Cuff Style'}</label>
              <select id="m-cuff-style">
                <option value="">${ur ? 'منتخب کریں' : 'Select...'}</option>
                <option value="cuff" ${existingVals['m-cuff-style']==='cuff'?'selected':''}>Cuff</option>
                <option value="open_bazo" ${existingVals['m-cuff-style']==='open_bazo'?'selected':''}>Open Bazo</option>
              </select>
            </div>
            <div class="measurement-field">
              <label for="m-pocket-style">${ur ? 'جیب کا انداز' : 'Pocket Style'}</label>
              <select id="m-pocket-style">
                <option value="">${ur ? 'منتخب کریں' : 'Select...'}</option>
                <option value="front" ${existingVals['m-pocket-style']==='front'?'selected':''}>Front Pocket</option>
                <option value="side" ${existingVals['m-pocket-style']==='side'?'selected':''}>Side Pockets</option>
                <option value="shalwar" ${existingVals['m-pocket-style']==='shalwar'?'selected':''}>Shalwar Pocket</option>
              </select>
            </div>
            <div class="measurement-field">
              <label for="m-fit-gents">${ur ? 'فٹنگ' : 'Fit'}</label>
              <select id="m-fit-gents">
                <option value="">${ur ? 'منتخب کریں' : 'Select...'}</option>
                <option value="slim" ${existingVals['m-fit-gents']==='slim'?'selected':''}>Slim Fit</option>
                <option value="regular" ${existingVals['m-fit-gents']==='regular'?'selected':''}>Regular</option>
                <option value="loose" ${existingVals['m-fit-gents']==='loose'?'selected':''}>Loose</option>
              </select>
            </div>
            <div class="measurement-field">
              <label for="m-shalwar-cut">${ur ? 'شلوار کٹ' : 'Shalwar Cut'}</label>
              <select id="m-shalwar-cut">
                <option value="">${ur ? 'منتخب کریں' : 'Select...'}</option>
                <option value="straight" ${existingVals['m-shalwar-cut']==='straight'?'selected':''}>Straight</option>
                <option value="patiala" ${existingVals['m-shalwar-cut']==='patiala'?'selected':''}>Patiala</option>
              </select>
            </div>
          </div>

          <div class="form-group" style="margin-top:12px;margin-bottom:0">
            <label class="form-label" for="m-notes">${ur ? 'اضافی نوٹ' : 'Measurement Notes'}</label>
            <textarea class="form-control" id="m-notes" rows="2" placeholder="${ur ? 'خصوصی نوٹ...' : 'Any special notes...'}">${existingVals['m-notes']||''}</textarea>
          </div>
        </div>`;
    } else {
      // Ladies
      container.innerHTML = `
        <div class="measurement-section">
          <div class="measurement-grid">
            <div class="measurement-field">
              <label for="m-length">${ur ? 'لمبائی (قمیض)' : 'Length (Kameez)'}</label>
              <input id="m-length" type="number" step="0.5" placeholder="44" value="${existingVals['m-length']||''}">
            </div>
            <div class="measurement-field">
              <label for="m-shoulder">${ur ? 'تیرا (کندھا)' : 'Shoulder (Tera)'}</label>
              <input id="m-shoulder" type="number" step="0.5" placeholder="13" value="${existingVals['m-shoulder']||''}">
            </div>
            <div class="measurement-field">
              <label for="m-chest">${ur ? 'سینہ / بسٹ' : 'Bust (Chhati)'}</label>
              <input id="m-chest" type="number" step="0.5" placeholder="36" value="${existingVals['m-chest']||''}">
            </div>
            <div class="measurement-field">
              <label for="m-waist">${ur ? 'کمر' : 'Waist (Kamar)'}</label>
              <input id="m-waist" type="number" step="0.5" placeholder="30" value="${existingVals['m-waist']||''}">
            </div>
            <div class="measurement-field">
              <label for="m-hips">${ur ? 'ہپ' : 'Hips (Hip)'}</label>
              <input id="m-hips" type="number" step="0.5" placeholder="38" value="${existingVals['m-hips']||''}">
            </div>
            <div class="measurement-field">
              <label for="m-arm">${ur ? 'بازو' : 'Arm/Sleeve (Bazo)'}</label>
              <input id="m-arm" type="number" step="0.5" placeholder="22" value="${existingVals['m-arm']||''}">
            </div>
            <div class="measurement-field">
              <label for="m-armhole">${ur ? 'مونڈھا' : 'Armhole (Monda)'}</label>
              <input id="m-armhole" type="number" step="0.5" placeholder="14" value="${existingVals['m-armhole']||''}">
            </div>
            <div class="measurement-field">
              <label for="m-shalwar-length">${ur ? 'شلوار / ٹراؤزر لمبائی' : 'Shalwar/Trouser Length'}</label>
              <input id="m-shalwar-length" type="number" step="0.5" placeholder="38" value="${existingVals['m-shalwar-length']||''}">
            </div>
            <div class="measurement-field">
              <label for="m-shalwar-ankle">${ur ? 'پانچہ' : 'Ankle (Poncha)'}</label>
              <input id="m-shalwar-ankle" type="number" step="0.5" placeholder="10" value="${existingVals['m-shalwar-ankle']||''}">
            </div>
          </div>

          <div class="section-title" style="margin-top:16px;margin-bottom:8px">✂️ ${ur ? 'اضافی پسند' : 'Style Preferences (Optional)'}</div>
          <div class="measurement-grid">
            <div class="measurement-field">
              <label for="m-neckline">${ur ? 'گلے کا ڈیزائن' : 'Neckline Design'}</label>
              <select id="m-neckline">
                <option value="">${ur ? 'منتخب کریں' : 'Select...'}</option>
                <option value="v_neck" ${existingVals['m-neckline']==='v_neck'?'selected':''}>V-Neck</option>
                <option value="round" ${existingVals['m-neckline']==='round'?'selected':''}>Round (Gol)</option>
                <option value="boat" ${existingVals['m-neckline']==='boat'?'selected':''}>Boat Neck</option>
                <option value="collar" ${existingVals['m-neckline']==='collar'?'selected':''}>Collar</option>
                <option value="square" ${existingVals['m-neckline']==='square'?'selected':''}>Square</option>
              </select>
            </div>
            <div class="measurement-field">
              <label for="m-sleeve-style">${ur ? 'بازو کا انداز' : 'Sleeve Style'}</label>
              <select id="m-sleeve-style">
                <option value="">${ur ? 'منتخب کریں' : 'Select...'}</option>
                <option value="full" ${existingVals['m-sleeve-style']==='full'?'selected':''}>Full</option>
                <option value="3_4" ${existingVals['m-sleeve-style']==='3_4'?'selected':''}>3/4</option>
                <option value="bell" ${existingVals['m-sleeve-style']==='bell'?'selected':''}>Bell</option>
                <option value="sleeveless" ${existingVals['m-sleeve-style']==='sleeveless'?'selected':''}>Sleeveless</option>
                <option value="puff" ${existingVals['m-sleeve-style']==='puff'?'selected':''}>Puff</option>
              </select>
            </div>
            <div class="measurement-field">
              <label for="m-bottom-style">${ur ? 'شلوار / ٹراؤزر کا انداز' : 'Bottom Style'}</label>
              <select id="m-bottom-style">
                <option value="">${ur ? 'منتخب کریں' : 'Select...'}</option>
                <option value="shalwar" ${existingVals['m-bottom-style']==='shalwar'?'selected':''}>Shalwar</option>
                <option value="trouser" ${existingVals['m-bottom-style']==='trouser'?'selected':''}>Trouser</option>
                <option value="capri" ${existingVals['m-bottom-style']==='capri'?'selected':''}>Capri</option>
                <option value="plazo" ${existingVals['m-bottom-style']==='plazo'?'selected':''}>Plazo</option>
              </select>
            </div>
            <div class="measurement-field">
              <label for="m-fit-ladies">${ur ? 'فٹنگ' : 'Fit'}</label>
              <select id="m-fit-ladies">
                <option value="">${ur ? 'منتخب کریں' : 'Select...'}</option>
                <option value="fitted" ${existingVals['m-fit-ladies']==='fitted'?'selected':''}>Fitted</option>
                <option value="a_line" ${existingVals['m-fit-ladies']==='a_line'?'selected':''}>A-line</option>
                <option value="loose" ${existingVals['m-fit-ladies']==='loose'?'selected':''}>Loose</option>
              </select>
            </div>
            <div class="measurement-field">
              <label for="m-piping-lace">${ur ? 'پائپنگ / لیس' : 'Piping/Lace'}</label>
              <select id="m-piping-lace">
                <option value="">${ur ? 'منتخب کریں' : 'Select...'}</option>
                <option value="yes" ${existingVals['m-piping-lace']==='yes'?'selected':''}>Yes</option>
                <option value="no" ${existingVals['m-piping-lace']==='no'?'selected':''}>No</option>
              </select>
            </div>
          </div>

          <div class="form-group" style="margin-top:12px;margin-bottom:0">
            <label class="form-label" for="m-notes">${ur ? 'اضافی نوٹ' : 'Measurement Notes'}</label>
            <textarea class="form-control" id="m-notes" rows="2" placeholder="${ur ? 'خصوصی نوٹ...' : 'Any special notes...'}">${existingVals['m-notes']||''}</textarea>
          </div>
        </div>`;
    }
  }

  function openAddCustomer(prefill = {}) {
    const lang = I18n.getLang();
    document.getElementById('modal-customer-title').textContent =
      lang === 'ur' ? 'نیا گاہک شامل کریں' : 'Add New Customer';
    document.getElementById('customer-edit-id').value = '';
    document.getElementById('c-gender').value = 'gents';
    document.querySelectorAll('.gender-sel-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.gender === 'gents');
    });
    renderMeasurementFields('gents');
    clearCustomerForm();
    if (prefill.name)  document.getElementById('c-name').value  = prefill.name;
    if (prefill.phone) document.getElementById('c-phone').value = prefill.phone;
    openOverlay('modal-customer');
  }

  function openEditCustomer(customerId) {
    const customer = DB.getCustomerById(customerId);
    if (!customer) return;
    const lang   = I18n.getLang();
    const gender = customer.gender || 'gents';
    document.getElementById('modal-customer-title').textContent =
      lang === 'ur' ? 'گاہک ترمیم کریں' : 'Edit Customer';
    document.getElementById('customer-edit-id').value = customer.id;
    document.getElementById('c-name').value    = customer.name    || '';
    document.getElementById('c-phone').value   = customer.phone   || '';
    document.getElementById('c-address').value = customer.address || '';
    document.getElementById('c-gender').value  = gender;

    // Set gender selector active state
    document.querySelectorAll('.gender-sel-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.gender === gender);
    });
    // Render correct measurement fields
    renderMeasurementFields(gender);

    // Fill measurement values after fields are rendered
    const m = customer.measurements || {};
    const fillField = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.value = val || '';
    };
    // Shared fields
    fillField('m-length',        m.length);
    fillField('m-shoulder',      m.shoulder);
    fillField('m-chest',         m.chest);
    fillField('m-waist',         m.waist);
    fillField('m-arm',           m.arm);
    fillField('m-shalwar-length',m.shalwar_length);
    fillField('m-shalwar-ankle', m.shalwar_ankle);
    fillField('m-notes',         m.notes);
    if (gender === 'gents') {
      fillField('m-neck',         m.neck);
      fillField('m-collar-type',  m.collar_type);
      fillField('m-cuff-style',   m.cuff_style);
      fillField('m-pocket-style', m.pocket_style);
      fillField('m-fit-gents',    m.fit_gents);
      fillField('m-shalwar-cut',  m.shalwar_cut);
    } else {
      fillField('m-hips',         m.hips);
      fillField('m-armhole',      m.armhole);
      fillField('m-neckline',     m.neckline);
      fillField('m-sleeve-style', m.sleeve_style);
      fillField('m-bottom-style', m.bottom_style);
      fillField('m-fit-ladies',   m.fit_ladies);
      fillField('m-piping-lace',  m.piping_lace);
    }
    openOverlay('modal-customer');
  }

  function clearCustomerForm() {
    ['c-name','c-phone','c-address'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = '';
    });
    // Measurement fields are dynamic, clear whatever is rendered
    document.querySelectorAll('#measurements-container input, #measurements-container textarea').forEach(el => el.value = '');
  }

  function saveCustomer() {
    const lang  = I18n.getLang();
    const name  = document.getElementById('c-name').value.trim();
    const phone = document.getElementById('c-phone').value.trim();
    const gender = document.getElementById('c-gender').value || 'gents';

    if (!name)  { Utils.toast(lang === 'ur' ? 'نام ضروری ہے' : 'Name is required',  'error'); return; }
    if (!phone) { Utils.toast(lang === 'ur' ? 'فون ضروری ہے' : 'Phone is required', 'error'); return; }

    const getVal  = id => { const el = document.getElementById(id); return el ? el.value.trim() : ''; };
    const getSel  = id => { const el = document.getElementById(id); return el ? el.value : ''; };

    const measurements = {
      // Shared
      length:        getVal('m-length'),
      shoulder:      getVal('m-shoulder'),
      chest:         getVal('m-chest'),
      waist:         getVal('m-waist'),
      arm:           getVal('m-arm'),
      shalwar_length:getVal('m-shalwar-length'),
      shalwar_ankle: getVal('m-shalwar-ankle'),
      notes:         getVal('m-notes'),
    };
    if (gender === 'gents') {
      measurements.neck         = getVal('m-neck');
      measurements.collar_type  = getSel('m-collar-type');
      measurements.cuff_style   = getSel('m-cuff-style');
      measurements.pocket_style = getSel('m-pocket-style');
      measurements.fit_gents    = getSel('m-fit-gents');
      measurements.shalwar_cut  = getSel('m-shalwar-cut');
    } else {
      measurements.hips         = getVal('m-hips');
      measurements.armhole      = getVal('m-armhole');
      measurements.neckline     = getSel('m-neckline');
      measurements.sleeve_style = getSel('m-sleeve-style');
      measurements.bottom_style = getSel('m-bottom-style');
      measurements.fit_ladies   = getSel('m-fit-ladies');
      measurements.piping_lace  = getSel('m-piping-lace');
    }

    const data = { name, phone, gender, address: document.getElementById('c-address').value.trim(), measurements };
    const editId = document.getElementById('customer-edit-id').value;
    if (editId) {
      DB.updateCustomer(editId, data);
      Utils.toast(lang === 'ur' ? '✅ گاہک اپ ڈیٹ ہو گیا!' : '✅ Customer updated!', 'success');
    } else {
      DB.addCustomer(data);
      Utils.toast(lang === 'ur' ? '✅ گاہک شامل ہو گیا!' : '✅ Customer added!', 'success');
    }
    closeOverlay('modal-customer');
    App.refreshCurrentPage();
  }

  /* ════════════════════════════════════════════════════════════
     ORDER MODAL (Add / Edit)
     ════════════════════════════════════════════════════════════ */

  function initOrderModal() {
    const html = `
    <div class="modal-overlay" id="modal-order">
      <div class="modal-sheet">
        <div class="modal-handle"></div>
        <div class="modal-header">
          <h2 class="modal-title" id="modal-order-title">New Order</h2>
          <button class="modal-close" id="modal-order-close">✕</button>
        </div>
        <div class="modal-body">
          <form id="form-order" novalidate>
            <input type="hidden" id="order-edit-id">
            <input type="hidden" id="order-customer-id">

            <div class="form-group">
              <label class="form-label">Customer</label>
              <div id="order-customer-display" style="
                background:var(--surface-2);border-radius:var(--r-md);
                padding:10px 14px;font-size:.9rem;color:var(--text);
                font-weight:500;border:1.5px solid var(--border);">—</div>
            </div>

            <div class="form-group">
              <label class="form-label" for="o-dress">Dress Description <span class="required">*</span></label>
              <textarea class="form-control" id="o-dress" rows="2" placeholder="e.g. Embroidered lawn suit, 3-piece..."></textarea>
            </div>

            <div class="form-group">
              <label class="form-label" for="o-instructions">Special Stitching Instructions</label>
              <textarea class="form-control" id="o-instructions" rows="2" placeholder="e.g. Boat neck, puff sleeves, fitted waist..."></textarea>
            </div>

            <div class="section-title" style="margin-top:0">💰 Payment Details</div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label" for="o-total">Total Amount (Rs.) <span class="required">*</span></label>
                <input class="form-control" id="o-total" type="number" min="0" placeholder="0">
              </div>
              <div class="form-group">
                <label class="form-label" for="o-paid">Amount Paid (Rs.)</label>
                <input class="form-control" id="o-paid" type="number" min="0" placeholder="0">
              </div>
            </div>
            <div class="form-group">
              <label class="form-label" for="o-prev-balance">Previous Balance (Rs.)</label>
              <input class="form-control" id="o-prev-balance" type="number" min="0" placeholder="0">
              <div class="form-hint">Any outstanding amount from past orders</div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label" for="o-delivery">Delivery Date</label>
                <input class="form-control" id="o-delivery" type="date">
              </div>
              <div class="form-group">
                <label class="form-label" for="o-status">Order Status</label>
                <select class="form-control" id="o-status">
                  <option value="pending">⏳ Pending</option>
                  <option value="in-progress">🧵 In Progress</option>
                  <option value="ready">🔵 Ready</option>
                  <option value="delivered">📦 Delivered</option>
                  <option value="completed">✅ Completed</option>
                </select>
              </div>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" id="modal-order-cancel">Cancel</button>
          <button class="btn btn-primary" id="modal-order-save">💾 Save Order</button>
        </div>
      </div>
    </div>`;
    document.body.insertAdjacentHTML('beforeend', html);
    bindClose('modal-order', 'modal-order-close', 'modal-order-cancel');
    document.getElementById('modal-order-save').addEventListener('click', saveOrder);
  }

  function openAddOrder(customerId) {
    const customer = DB.getCustomerById(customerId);
    if (!customer) { Utils.toast('Customer not found', 'error'); return; }
    document.getElementById('modal-order-title').textContent = 'New Order';
    document.getElementById('order-edit-id').value    = '';
    document.getElementById('order-customer-id').value = customerId;
    document.getElementById('order-customer-display').textContent = `${customer.name} · ${customer.phone}`;
    clearOrderForm();
    openOverlay('modal-order');
  }

  function openEditOrder(orderId) {
    const order    = DB.getOrderById(orderId);
    if (!order) return;
    const customer = DB.getCustomerById(order.customerId);
    document.getElementById('modal-order-title').textContent = 'Edit Order';
    document.getElementById('order-edit-id').value     = order.id;
    document.getElementById('order-customer-id').value = order.customerId;
    document.getElementById('order-customer-display').textContent = customer
      ? `${customer.name} · ${customer.phone}` : 'Unknown Customer';
    document.getElementById('o-dress').value         = order.dressDescription    || '';
    document.getElementById('o-instructions').value  = order.specialInstructions || '';
    document.getElementById('o-total').value          = order.totalAmount         || '';
    document.getElementById('o-paid').value           = order.amountPaid          || '';
    document.getElementById('o-prev-balance').value   = order.previousBalance     || '';
    document.getElementById('o-delivery').value       = order.deliveryDate        || '';
    document.getElementById('o-status').value         = order.status              || 'pending';
    openOverlay('modal-order');
  }

  function clearOrderForm() {
    ['o-dress','o-instructions','o-total','o-paid','o-prev-balance','o-delivery']
      .forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
    document.getElementById('o-status').value = 'pending';
  }

  function saveOrder() {
    const dress = document.getElementById('o-dress').value.trim();
    const total = document.getElementById('o-total').value;
    if (!dress) { Utils.toast('Dress description is required', 'error'); return; }
    if (!total) { Utils.toast('Total amount is required', 'error'); return; }

    const data = {
      customerId:          document.getElementById('order-customer-id').value,
      dressDescription:    dress,
      specialInstructions: document.getElementById('o-instructions').value.trim(),
      totalAmount:         parseFloat(total) || 0,
      amountPaid:          parseFloat(document.getElementById('o-paid').value) || 0,
      previousBalance:     parseFloat(document.getElementById('o-prev-balance').value) || 0,
      deliveryDate:        document.getElementById('o-delivery').value,
      status:              document.getElementById('o-status').value,
    };
    const editId = document.getElementById('order-edit-id').value;
    if (editId) {
      DB.updateOrder(editId, data);
      Utils.toast('Order updated!', 'success');
    } else {
      DB.addOrder(data);
      Utils.toast('Order added!', 'success');
    }
    closeOverlay('modal-order');
    App.refreshCurrentPage();
  }

  /* ════════════════════════════════════════════════════════════
     RECEIPT MODAL
     ════════════════════════════════════════════════════════════ */

  function initReceiptModal() {
    const html = `
    <div class="modal-overlay" id="modal-receipt">
      <div class="modal-sheet">
        <div class="modal-handle"></div>
        <div class="modal-header">
          <h2 class="modal-title">🧾 Receipt</h2>
          <button class="modal-close" id="modal-receipt-close">✕</button>
        </div>
        <div class="modal-body" id="modal-receipt-body"></div>
        <div class="modal-footer">
          <button class="btn btn-secondary" id="modal-receipt-print">🖨️ Print</button>
          <button class="btn btn-primary" id="modal-receipt-pdf">📄 Download PDF</button>
        </div>
      </div>
    </div>`;
    document.body.insertAdjacentHTML('beforeend', html);
    bindClose('modal-receipt', 'modal-receipt-close');
    document.getElementById('modal-receipt-print').addEventListener('click', () => window.print());
    document.getElementById('modal-receipt-pdf').addEventListener('click', downloadReceiptPDF);
  }

  function openReceipt(orderId) {
    const order    = DB.getOrderById(orderId);
    if (!order) return;
    const customer = DB.getCustomerById(order.customerId);
    const settings = DB.getSettings();
    const balance  = Utils.balanceDue(order);
    const pStatus  = order.paymentStatus;
    const body     = document.getElementById('modal-receipt-body');

    body.innerHTML = `
      <div class="receipt-paper" id="receipt-content">
        <div class="receipt-header">
          <h3>${Utils.esc(settings.shopName)}</h3>
          <p>${Utils.esc(settings.address || '')}</p>
          ${settings.phone ? `<p>📞 ${Utils.esc(settings.phone)}</p>` : ''}
        </div>
        <div class="receipt-body">
          <div style="display:flex;justify-content:space-between;margin-bottom:4px">
            <span style="font-size:.75rem;color:var(--text-3)">Receipt Date</span>
            <span style="font-size:.8rem;font-weight:600">${Utils.formatDate(Utils.today())}</span>
          </div>
          <div style="display:flex;justify-content:space-between;margin-bottom:12px">
            <span style="font-size:.75rem;color:var(--text-3)">Order ID</span>
            <span style="font-size:.72rem;color:var(--text-3)">#${order.id.slice(-8).toUpperCase()}</span>
          </div>

          <hr class="receipt-divider">

          <div class="receipt-row">
            <span class="label">Customer</span>
            <span class="value">${Utils.esc(customer?.name || '—')}</span>
          </div>
          <div class="receipt-row">
            <span class="label">Phone</span>
            <span class="value">${Utils.esc(customer?.phone || '—')}</span>
          </div>
          <div class="receipt-row">
            <span class="label">Dress</span>
            <span class="value" style="max-width:55%;text-align:right">${Utils.esc(order.dressDescription)}</span>
          </div>
          ${order.specialInstructions ? `
          <div class="receipt-row">
            <span class="label">Instructions</span>
            <span class="value" style="max-width:55%;text-align:right;font-size:.78rem">${Utils.esc(order.specialInstructions)}</span>
          </div>` : ''}
          <div class="receipt-row">
            <span class="label">Delivery Date</span>
            <span class="value">${Utils.formatDate(order.deliveryDate)}</span>
          </div>

          <hr class="receipt-divider">

          <div class="receipt-row">
            <span class="label">Total Amount</span>
            <span class="value">${Utils.currency(order.totalAmount)}</span>
          </div>
          ${order.previousBalance > 0 ? `
          <div class="receipt-row">
            <span class="label" style="color:var(--unpaid)">Previous Balance</span>
            <span class="value" style="color:var(--unpaid)">${Utils.currency(order.previousBalance)}</span>
          </div>` : ''}
          <div class="receipt-row">
            <span class="label">Amount Paid</span>
            <span class="value" style="color:var(--paid)">− ${Utils.currency(order.amountPaid)}</span>
          </div>

          <div class="receipt-total">
            <span class="label">Balance Due</span>
            <span class="value">${Utils.currency(balance)}</span>
          </div>

          <div style="margin-top:12px;text-align:center">
            ${Utils.paymentBadgeHTML(pStatus)}
          </div>
        </div>
        <div class="receipt-footer">${Utils.esc(settings.thankYouMsg || 'Thank you for your business!')}</div>
      </div>`;

    openOverlay('modal-receipt');
  }

  function downloadReceiptPDF() {
    if (typeof jspdf === 'undefined' && typeof window.jspdf === 'undefined') {
      Utils.toast('PDF library loading... please try again', 'warning');
      return;
    }
    const { jsPDF } = window.jspdf;
    const order    = DB.getOrderById(document.getElementById('order-edit-id')?.value || _currentReceiptOrderId);
    // Fallback: just print
    window.print();
  }

  let _currentReceiptOrderId = null;
  function openReceiptForOrder(orderId) {
    _currentReceiptOrderId = orderId;
    openReceipt(orderId);
  }

  /* ════════════════════════════════════════════════════════════
     CUSTOMER PROFILE (Full-screen modal)
     ════════════════════════════════════════════════════════════ */

  function initProfileModal() {
    const html = `
    <div class="modal-overlay" id="modal-profile" style="align-items:stretch">
      <div class="modal-sheet" style="max-height:100dvh;border-radius:0">
        <div id="modal-profile-content"></div>
      </div>
    </div>`;
    document.body.insertAdjacentHTML('beforeend', html);
    document.getElementById('modal-profile').addEventListener('click', e => {
      if (e.target.id === 'modal-profile') closeOverlay('modal-profile');
    });
  }

  function openProfile(customerId) {
    renderProfile(customerId);
    openOverlay('modal-profile');
  }

  function renderProfile(customerId) {
    const customer = DB.getCustomerById(customerId);
    if (!customer) return;
    const orders  = DB.getOrdersByCustomer(customerId);
    const m       = customer.measurements || {};
    const content = document.getElementById('modal-profile-content');

    const activeOrder = orders.find(o => !['completed','delivered'].includes(o.status));
    const pStatus = activeOrder ? Utils.paymentStatus(activeOrder) : null;

    content.innerHTML = `
      <!-- Back Bar -->
      <div style="display:flex;align-items:center;gap:12px;padding:14px 16px;
                  background:var(--primary);color:#fff;position:sticky;top:0;z-index:10">
        <button onclick="document.getElementById('modal-profile').classList.remove('open')"
          style="background:rgba(255,255,255,.2);border:none;color:#fff;border-radius:50%;
                 width:34px;height:34px;display:flex;align-items:center;justify-content:center;
                 cursor:pointer;font-size:1.1rem">←</button>
        <div>
          <div style="font-weight:700;font-size:.95rem">${Utils.esc(customer.name)}</div>
          <div style="font-size:.72rem;opacity:.8">Customer Profile</div>
        </div>
        <div style="margin-left:auto;display:flex;gap:8px">
          <button class="profile-action-btn" onclick="Modals.editCustomerFromProfile('${customer.id}')">✏️ Edit</button>
          <button class="profile-action-btn" onclick="Modals.addOrderFromProfile('${customer.id}')">➕ Order</button>
        </div>
      </div>

      <!-- Profile Header -->
      <div class="profile-header">
        <div class="profile-avatar">${Utils.initials(customer.name)}</div>
        <div class="profile-name">${Utils.esc(customer.name)}</div>
        <div class="profile-phone">📞 ${Utils.esc(customer.phone)}</div>
        ${customer.address ? `<div style="font-size:.78rem;opacity:.8;margin-top:4px">📍 ${Utils.esc(customer.address)}</div>` : ''}
        ${pStatus ? Utils.paymentBadgeHTML(pStatus) : ''}
      </div>

      <!-- Tabs -->
      <div class="profile-tabs">
        <button class="profile-tab-btn active" data-tab="tab-measurements">📏 Measurements</button>
        <button class="profile-tab-btn" data-tab="tab-orders">📋 Orders (${orders.length})</button>
      </div>

      <!-- Measurements Tab -->
      <div id="tab-measurements" class="profile-tab-panel active" style="padding:16px">
        ${(() => {
          const gender = customer.gender || 'gents';
          const t = (en, ur2) => lang === 'ur' ? ur2 : en;
          const row = (label, val) => val ? `
            <div class="info-row" style="background:var(--surface);border-radius:var(--r-md);
                 margin-bottom:8px;border:1px solid var(--border-light);padding:10px 14px">
              <span style="font-size:.78rem;color:var(--text-3);width:110px;flex-shrink:0">${label}</span>
              <span style="font-weight:600;font-size:.9rem">${Utils.esc(String(val))}&quot;</span>
            </div>` : '';
          const rowTxt = (label, val) => val ? `
            <div class="info-row" style="background:var(--surface-2);border-radius:var(--r-md);
                 margin-bottom:8px;border:1px solid var(--border-light);padding:10px 14px">
              <span style="font-size:.78rem;color:var(--text-3);width:110px;flex-shrink:0">${label}</span>
              <span style="font-weight:600;font-size:.88rem;color:var(--primary)">${Utils.esc(String(val))}</span>
            </div>` : '';

          let html = '';
          // Shared measurements
          html += row(t('Length','لمبائی'),    m.length);
          html += row(t('Shoulder','کندھا'),   m.shoulder);
          html += row(t('Chest','چھاتی'),      m.chest);
          html += row(t('Waist','کمر'),        m.waist);
          html += row(t('Arm/Sleeve','بازو'),  m.arm);
          html += row(t('Shalwar Len.','شلوار'),m.shalwar_length);
          html += row(t('Ankle','پانچہ'),      m.shalwar_ankle);

          if (gender === 'gents') {
            html += row(t('Neck','گلا'),         m.neck);
            html += rowTxt(t('Collar','کالر'),   m.collar_type);
            html += rowTxt(t('Cuff','کف'),       m.cuff_style);
            html += rowTxt(t('Pocket','جیب'),    m.pocket_style);
            html += rowTxt(t('Fit','فٹنگ'),      m.fit_gents);
            html += rowTxt(t('Shalwar Cut','شلوار کٹ'), m.shalwar_cut);
          } else {
            html += row(t('Hips','ہپ'),          m.hips);
            html += row(t('Armhole','مونڈھا'),   m.armhole);
            html += rowTxt(t('Neckline','گلا'),  m.neckline);
            html += rowTxt(t('Sleeve','بازو'),   m.sleeve_style);
            html += rowTxt(t('Bottom','شلوار'),  m.bottom_style);
            html += rowTxt(t('Fit','فٹنگ'),      m.fit_ladies);
            html += rowTxt(t('Piping','پائپنگ'), m.piping_lace);
          }
          if (!html) html = `<div style="color:var(--text-4);font-size:.85rem;padding:8px">${lang==='ur'?'ابھی کوئی پیمائش نہیں':'No measurements recorded yet.'}</div>`;
          return html;
        })()}
        ${m.notes ? `
          <div style="background:var(--accent-light);border-radius:var(--r-md);padding:12px;margin-top:8px;border:1px solid var(--primary-light)">
            <div style="font-size:.72rem;font-weight:700;color:var(--primary);text-transform:uppercase;letter-spacing:.06em;margin-bottom:4px">${lang==='ur'?'نوٹ':'Notes'}</div>
            <div style="font-size:.85rem;color:var(--text)">${Utils.esc(m.notes)}</div>
          </div>` : ''}
      </div>

      <!-- Orders Tab -->
      <div id="tab-orders" class="profile-tab-panel" style="padding:16px">
        ${orders.length === 0 ? `
          <div class="empty-state" style="padding:40px 20px">
            <span class="empty-icon">🧵</span>
            <h3>No orders yet</h3>
            <p>Add a new order for this customer</p>
            <button class="btn btn-primary mt-4" onclick="Modals.addOrderFromProfile('${customer.id}')">➕ Add Order</button>
          </div>` :
          orders.map(o => orderHistoryCard(o, customer)).join('')}
      </div>
    `;

    // Tab switching
    content.querySelectorAll('.profile-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        content.querySelectorAll('.profile-tab-btn').forEach(b => b.classList.remove('active'));
        content.querySelectorAll('.profile-tab-panel').forEach(p => p.classList.remove('active'));
        btn.classList.add('active');
        content.querySelector(`#${btn.dataset.tab}`).classList.add('active');
      });
    });
  }

  function orderHistoryCard(order, customer) {
    const balance = Utils.balanceDue(order);
    return `
      <div class="order-card" style="margin-bottom:12px">
        <div class="order-card-header">
          <div>
            <div class="order-dress-title">🧵 ${Utils.esc(order.dressDescription)}</div>
            <div class="order-customer-name">${Utils.formatDate(order.createdAt)}</div>
          </div>
          <div style="display:flex;flex-direction:column;align-items:flex-end;gap:4px">
            ${Utils.orderStatusBadgeHTML(order.status)}
            ${Utils.paymentBadgeHTML(order.paymentStatus)}
          </div>
        </div>
        ${order.specialInstructions ? `
          <div style="background:var(--surface-2);border-radius:var(--r-sm);padding:8px 10px;
                      font-size:.78rem;color:var(--text-3);margin-bottom:10px">
            ✂️ ${Utils.esc(order.specialInstructions)}
          </div>` : ''}
        <div class="order-card-footer">
          <div>
            <div class="order-amount">${Utils.currency(order.totalAmount)}</div>
            ${balance > 0 ? `<div style="font-size:.72rem;color:var(--unpaid)">Balance: ${Utils.currency(balance)}</div>` : ''}
          </div>
          <div style="display:flex;gap:6px;flex-wrap:wrap;justify-content:flex-end">
            <button class="btn btn-secondary btn-sm" onclick="Modals.openReceiptForOrder('${order.id}')">🧾</button>
            <button class="btn btn-ghost btn-sm" onclick="Modals.openEditOrder('${order.id}')">✏️</button>
            <button class="btn btn-danger btn-sm" onclick="Pages.deleteOrder('${order.id}','${order.customerId}')">🗑️</button>
          </div>
        </div>
        ${order.deliveryDate ? `
          <div class="order-delivery" style="margin-top:8px;padding-top:8px;border-top:1px solid var(--border-light)">
            📅 ${Utils.formatDate(order.deliveryDate)}
            <span style="color:${Utils.isPast(order.deliveryDate) && !['delivered','completed'].includes(order.status) ? 'var(--unpaid)' : 'var(--text-3)'}">
              · ${Utils.formatDeliveryStatus(order.deliveryDate)}
            </span>
          </div>` : ''}
      </div>`;
  }

  function editCustomerFromProfile(customerId) {
    closeOverlay('modal-profile');
    setTimeout(() => openEditCustomer(customerId), 200);
  }

  function addOrderFromProfile(customerId) {
    closeOverlay('modal-profile');
    setTimeout(() => openAddOrder(customerId), 200);
  }

  /* ── Init All Modals ────────────────────────────────────── */
  function init() {
    initCustomerModal();
    initOrderModal();
    initReceiptModal();
    initProfileModal();
  }

  /* ── Public ─────────────────────────────────────────────── */
  return {
    init,
    openAddCustomer, openEditCustomer,
    openAddOrder, openEditOrder,
    openReceiptForOrder,
    openProfile,
    renderProfile,
    editCustomerFromProfile, addOrderFromProfile,
    closeOverlay,
  };
})();
