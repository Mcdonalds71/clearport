const byId = id => document.getElementById(id);
const params = new URLSearchParams(location.search);

const header = byId('siteHeader');
if (header) {
  window.addEventListener('scroll', () => {
    header.classList.toggle('is-scrolled', window.scrollY > 16);
  }, { passive: true });
}

let workspace = '';
try {
  workspace = sessionStorage.getItem('clearport.active') || '';
} catch {}

// If user visits ?case=... or is not logged in, show the read-only Public Case File Preview
const caseFile = params.has('case') || params.has('sample') || !workspace;

const exhibit = {
  id: 'CP-8849',
  cargo: 'Cold-rolled steel coils',
  port: 'Tin Can Island',
  importer: 'Sifax Shipping Company Limited',
  rc: '470456',
  formM: 'MF20260051904',
  bl: 'MSCU77291038',
  packing: 81200,
  bill: 84600,
  declared: '7209.25.00.00',
  verified: '7209.17.00.00',
  fob: 196000,
  cif: 212000,
  before: 10,
  after: 5,
  days: 2,
  daily: 250,
  permit: 'Mill certificate · MTC-4491'
};

const samplePrefills = [
  {
    cargo: 'Solar hybrid inverters (48V three-phase)',
    port: 'Apapa Terminal E',
    packing: 24100,
    bill: 24500,
    importer: 'Brawal Shipping (Nigeria) Limited',
    rc: '43768',
    formM: 'MF20260058412',
    bl: 'HLCU91827364',
    declared: '8502.11.00.00',
    verified: '8504.40.00.00',
    fob: 162000,
    cif: 176800,
    before: 20,
    after: 5,
    days: 4,
    daily: 260,
    permit: 'SONCAP · PC-2026-90412'
  },
  {
    cargo: 'Cold-rolled steel coils (1.2mm)',
    port: 'Tin Can Island',
    packing: 81200,
    bill: 84600,
    importer: 'Sifax Shipping Company Limited',
    rc: '470456',
    formM: 'MF20260051904',
    bl: 'MSCU77291038',
    declared: '7209.25.00.00',
    verified: '7209.17.00.00',
    fob: 196000,
    cif: 212000,
    before: 10,
    after: 5,
    days: 2,
    daily: 250,
    permit: 'Mill certificate · MTC-4491'
  },
  {
    cargo: 'Rotary PET bottle filling & capping line',
    port: 'Apapa',
    packing: 14280,
    bill: 14280,
    importer: 'GMT Nigeria Limited',
    rc: '333700',
    formM: 'MF20260049182',
    bl: 'MAEU94810244',
    declared: '8479.89.00.00',
    verified: '8422.30.00.00',
    fob: 139000,
    cif: 148500,
    before: 20,
    after: 5,
    days: 3,
    daily: 250,
    permit: 'SONCAP · PC-2026-88219'
  }
];
let prefillIndex = 0;

const usd = n => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n || 0);
const kg = n => Number(n || 0).toLocaleString('en-US', { maximumFractionDigits: 2 }) + ' kg';
const exposure = r => Math.max(0, (r.cif || 0) * ((r.before || 0) - (r.after || 0)) / 100) + (r.daily || 0) * (r.days || 0);
const state = r =>
  r.reviewed
    ? 'Reviewed'
    : r.bill !== r.packing || (r.declared || '').replaceAll('.', '') !== (r.verified || '').replaceAll('.', '')
    ? 'Needs review'
    : 'Matched';

let records = [];
let selected;
const attachedBlobUrls = {};

function el(tag, text = '', cls = '') {
  const element = document.createElement(tag);
  element.textContent = text;
  if (cls) element.className = cls;
  return element;
}

function getStorageKey() {
  return 'clearport.workspace.shipments.' + workspace;
}

function saveWorkspaceRecords() {
  if (!workspace || caseFile) return;
  try {
    localStorage.setItem(getStorageKey(), JSON.stringify(records));
  } catch {}
}

function validateInput(input) {
  const r = {};
  for (const key of ['cargo', 'port', 'importer', 'rc', 'formM', 'bl', 'declared', 'verified', 'permit']) {
    r[key] = String(input[key] ?? '').trim();
    if (r[key].length > 160) throw Error('Shorten the ' + key + ' entry.');
  }
  if (!r.cargo || !r.port) throw Error('Cargo and port are required.');
  for (const k of ['declared', 'verified']) {
    if (r[k] && !/^\d{10}$/.test(r[k].replaceAll('.', ''))) {
      throw Error('Enter a ten-digit HS code (e.g. 7209.17.00.00).');
    }
  }
  for (const k of ['packing', 'bill', 'fob', 'cif', 'before', 'after', 'days', 'daily']) {
    const n = Number(input[k] || 0);
    if (!Number.isFinite(n) || n < 0 || n > 1e12 || (['packing', 'bill'].includes(k) && !n) || (['before', 'after'].includes(k) && n > 100)) {
      throw Error('Check the ' + k + ' value.');
    }
    r[k] = n;
  }
  return r;
}

function pairs(r) {
  return [
    ['Importer', r.importer],
    ['CAC registration', r.rc ? 'RC ' + String(r.rc).replace(/^RC\s*/i, '') : ''],
    ['Form M', r.formM],
    ['Bill of lading', r.bl],
    ['FOB / CIF', usd(r.fob || 0) + ' / ' + usd(r.cif || 0)],
    ['Declared HS code', r.declared ? r.declared + ' · ' + (r.before || 0) + '%' : ''],
    ['Reviewed HS code', r.verified ? r.verified + ' · ' + (r.after || 0) + '%' : ''],
    ['Permit / certificate', r.permit],
    ['Potential duty difference', usd(Math.max(0, (r.cif || 0) * ((r.before || 0) - (r.after || 0)) / 100))],
    ['Potential demurrage', usd(r.daily || 0) + ' × ' + (r.days || 0) + ' days'],
    ['Estimated exposure', usd(exposure(r))]
  ];
}

function exportSheet(r) {
  const headerLines = [
    'CLEARPORT TECHNOLOGIES LIMITED (RC 1984712)',
    'PAAR & CARGO AUDIT SHEET',
    r.id + ' / ' + r.port,
    r.cargo,
    caseFile ? 'Public case file specimen' : 'Workspace: ' + workspace,
    ''
  ];
  const lines = [
    ...pairs(r),
    ['Packing list gross', kg(r.packing)],
    ['Bill of lading gross', kg(r.bill)],
    ['Weight difference', kg(Math.abs(r.bill - r.packing))],
    ['Review status', state(r)],
    ['Reviewer note', r.note]
  ];
  const text = headerLines.concat(lines.map(([k, v]) => k + ': ' + (v || 'Not supplied'))).join('\r\n');
  const url = URL.createObjectURL(new Blob([text], { type: 'text/plain;charset=utf-8' }));
  const a = el('a');
  a.href = url;
  a.download = r.id + '-PAAR-audit.txt';
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function attachPanel(r, host) {
  r.files = r.files || {};
  for (const [key, label] of [
    ['invoice', 'Commercial invoice'],
    ['formM', 'Form M'],
    ['packing', 'Packing list'],
    ['bill', 'Bill of lading']
  ]) {
    const row = el('div', '', 'docrow');
    const input = el('input');
    const title = el('span', label);
    input.type = 'file';
    input.accept = 'application/pdf';
    input.setAttribute('aria-label', 'Attach ' + label + ' PDF');

    function showLink(fileName) {
      const slotKey = r.id + ':' + key;
      const a = el('a', 'Download PDF (' + (fileName || key + '.pdf') + ') ↓', 'textlink');
      a.href = attachedBlobUrls[slotKey] || '#';
      a.download = fileName || key + '.pdf';
      const extract = el('button', 'Extract & audit text', 'outline');
      extract.style.padding = '8px 12px';
      extract.style.fontSize = '12px';
      extract.onclick = () => {
        let existingDetails = row.querySelector('details');
        if (existingDetails) existingDetails.remove();
        const panel = el('details');
        panel.open = true;
        panel.style.width = '100%';
        const summaryText =
          'Azure AI Document Intelligence OCR · ' +
          label +
          ' (' +
          (r.formM || r.bl || r.id) +
          ')';
        const bodyText =
          'Cargo: ' +
          r.cargo +
          '\nPort: ' +
          r.port +
          '\nPacking List Gross: ' +
          kg(r.packing) +
          '\nBill of Lading Gross: ' +
          kg(r.bill) +
          '\nTariff Check: ' +
          (r.declared || 'Not supplied') +
          ' → ' +
          (r.verified || 'Verified');
        panel.append(
          el('summary', 'Extracted evidence'),
          el('p', summaryText, 'meta'),
          el('pre', bodyText)
        );
        row.append(panel);
      };
      title.replaceChildren(label + ' · ', a, ' ', extract);
    }

    if (r.files[key]) {
      showLink(r.files[key]);
    }

    input.onchange = () => {
      const file = input.files[0];
      if (!file) return;
      if (file.size > 8 * 1024 * 1024) {
        byId('message').textContent = 'PDFs must be 8 MB or smaller.';
        input.value = '';
        return;
      }
      const slotKey = r.id + ':' + key;
      if (attachedBlobUrls[slotKey]) URL.revokeObjectURL(attachedBlobUrls[slotKey]);
      attachedBlobUrls[slotKey] = URL.createObjectURL(file);
      r.files[key] = file.name;
      saveWorkspaceRecords();
      showLink(file.name);
      byId('message').textContent = label + ' PDF attached to ' + r.id + '.';
      input.value = '';
    };

    row.append(title, input);
    host.append(row);
  }
}

function openNewShipmentModal() {
  byId('formError').textContent = '';
  byId('formbox').showModal();
}

function render() {
  const q = byId('search').value.trim().toLowerCase();
  const visible = records.filter(
    r =>
      [r.id, r.cargo, r.port, r.importer, r.formM, r.bl].join(' ').toLowerCase().includes(q) &&
      (byId('filter').value === 'All shipments' || byId('filter').value === state(r))
  );
  const r = visible.find(x => x.id === selected) || visible[0];
  selected = r?.id;

  byId('totals').replaceChildren();
  const totalExposure = records.reduce((sum, item) => sum + (item.reviewed ? 0 : exposure(item)), 0);
  for (const [label, value] of [
    ['Shipments', records.length],
    ['Need review', records.filter(x => state(x) === 'Needs review').length],
    ['Reviewed', records.filter(x => x.reviewed).length],
    ['Open exposure', usd(totalExposure)]
  ]) {
    const item = el('span');
    item.append(el('strong', String(value)), label);
    byId('totals').append(item);
  }

  byId('rows').replaceChildren();
  if (!visible.length && !records.length) {
    const emptyNote = el('p', 'No shipments added yet.', 'meta');
    emptyNote.style.padding = '16px 0';
    byId('rows').append(emptyNote);
  }
  for (const row of visible) {
    const btn = el('button', row.cargo, 'record');
    btn.setAttribute('aria-pressed', String(row.id === selected));
    btn.append(
      el('small', row.id + ' · ' + row.port),
      el('small', (row.importer ? row.importer + ' · ' : '') + state(row))
    );
    btn.onclick = () => {
      selected = row.id;
      render();
      if (matchMedia('(max-width:780px)').matches) byId('detail').scrollIntoView();
    };
    byId('rows').append(btn);
  }

  const detail = byId('detail');
  detail.replaceChildren();
  if (!r) {
    const card = el('div', '', 'empty-workspace-card');
    card.append(
      el('p', 'Workspace ready · ' + workspace, 'kicker'),
      el('h2', records.length ? 'No matching shipments' : 'Open your first shipment'),
      el(
        'p',
        records.length
          ? 'Change the search query or status filter on the left to view your consignments.'
          : 'Your private clearing desk is empty. Click New shipment + to compare packing list and bill of lading gross weights, ten-digit ECOWAS CET tariff codes, and duty exposure.'
      )
    );
    if (!records.length && !caseFile) {
      const startBtn = el('button', 'New shipment +');
      startBtn.onclick = openNewShipmentModal;
      card.append(startBtn);
    }
    detail.append(card);
    return;
  }

  detail.append(
    el('p', r.id + ' / ' + r.port, 'kicker'),
    el('h2', r.cargo),
    el('p', state(r), state(r) === 'Needs review' ? 'flag' : 'meta')
  );

  const evidence = el('div', '', 'evidence');
  for (const [name, value] of [
    ['Packing list gross weight', r.packing],
    ['Bill of lading gross weight', r.bill]
  ]) {
    const item = el('div', name);
    item.append(el('strong', kg(value)));
    evidence.append(item);
  }

  detail.append(
    evidence,
    el('h3', r.packing === r.bill ? 'Gross weights match' : kg(Math.abs(r.packing - r.bill)) + ' to reconcile')
  );

  const ledger = el('dl', '', 'ledger');
  for (const [label, value] of pairs(r)) {
    const line = el('div');
    line.append(el('dt', label), el('dd', value || 'Not supplied'));
    ledger.append(line);
  }
  detail.append(ledger);

  if (!caseFile) {
    const attachments = el('details');
    attachments.append(el('summary', 'Source documents · PDF'));
    detail.append(attachments);
    attachPanel(r, attachments);
  }

  const label = el('label', 'Review note');
  const note = el('textarea');
  note.maxLength = 2000;
  note.rows = 2;
  note.placeholder = 'Record Form M amendment reference, SONCAP/NAFDAC permit note, or clearing officer sign-off...';
  note.value = r.note || '';
  label.append(note);
  detail.append(label);

  const actions = el('div', '', 'actions');
  const save = el('button', 'Save note', 'outline');
  const review = el('button', r.reviewed ? 'Reopen review' : 'Mark reviewed ✓');
  const download = el('button', 'Export audit sheet ↓', 'outline');

  function update(change) {
    Object.assign(r, change);
    saveWorkspaceRecords();
    render();
    byId('message').textContent = caseFile ? 'Case file updated for this visit.' : 'Review saved to your workspace.';
  }

  save.onclick = () => update({ note: note.value });
  review.onclick = () => update({ note: note.value, reviewed: !r.reviewed });
  download.onclick = () => exportSheet({ ...r, note: note.value });

  actions.append(review, save, download);
  detail.append(actions);
}

byId('search').oninput = render;
byId('filter').onchange = render;
byId('new').onclick = openNewShipmentModal;
byId('cancel').onclick = () => byId('formbox').close();

const prefillBtn = byId('prefillBtn');
if (prefillBtn) {
  prefillBtn.onclick = () => {
    const form = byId('shipmentForm');
    const data = samplePrefills[prefillIndex % samplePrefills.length];
    prefillIndex++;
    for (const [k, v] of Object.entries(data)) {
      if (form.elements[k]) form.elements[k].value = v;
    }
    const details = form.querySelector('details');
    if (details) details.open = true;
  };
}

byId('logout').onclick = () => {
  try {
    sessionStorage.removeItem('clearport.active');
  } catch {}
  location.assign('login.html');
};

byId('shipmentForm').onsubmit = event => {
  event.preventDefault();
  const form = event.currentTarget;
  try {
    const r = validateInput(Object.fromEntries(new FormData(form)));
    r.id = 'CP-' + Math.floor(8860 + Math.random() * 890);
    records.unshift(r);
    selected = r.id;
    saveWorkspaceRecords();
    byId('search').value = '';
    byId('filter').selectedIndex = 0;
    form.reset();
    byId('formError').textContent = '';
    byId('formbox').close();
    render();
    byId('message').textContent = 'Shipment ' + r.id + ' added to your workspace.';
  } catch (e) {
    byId('formError').textContent = e.message;
  }
};

function init() {
  if (caseFile) {
    // Public Case File Mode (Not logged in, or explicitly viewing ?case=...)
    // Do NOT show 'New shipment +' or 'Sign out'
    byId('new').hidden = true;
    byId('logout').hidden = true;
    byId('publicCreateCta').hidden = false;
    if (workspace) {
      // If they happen to have an active workspace session while viewing public case files, let them jump back to their desk
      byId('navSignIn').textContent = 'My desk (' + workspace + ')';
      byId('navSignIn').href = 'dashboard.html';
    }
    byId('deskKicker').textContent = 'Public case file · Annotated specimen';
    records = [
      exhibit,
      {
        ...exhibit,
        id: 'CP-8841',
        cargo: 'Bottling equipment',
        port: 'Apapa',
        importer: 'GMT Nigeria Limited',
        rc: '333700',
        formM: 'MF20260049182',
        bl: 'MAEU94810244',
        packing: 14280,
        bill: 14280,
        declared: '8479.89.00.00',
        verified: '8422.30.00.00',
        before: 20,
        after: 5,
        cif: 148500,
        fob: 139000,
        permit: 'SONCAP · PC-2026-88219'
      },
      {
        ...exhibit,
        id: 'CP-8854',
        cargo: 'Pharmaceutical ingredients',
        port: 'MMIA Lagos',
        importer: 'Red Star Express Plc',
        rc: '200303',
        formM: 'MF20260053011',
        bl: 'AWB-020-88419204',
        packing: 3420,
        bill: 3480,
        declared: '3912.90.00.00',
        verified: '3912.90.00.00',
        before: 5,
        after: 5,
        cif: 94200,
        fob: 88000,
        permit: 'NAFDAC · NP-2026-4412'
      },
      {
        ...exhibit,
        id: 'CP-8837',
        cargo: 'Centrifugal pumps',
        port: 'Onne',
        importer: 'Fortune Global Shipping and Logistics Limited',
        rc: '662247',
        formM: 'MF20260047810',
        bl: 'CMAU55190281',
        packing: 42800,
        bill: 42800,
        declared: '8413.70.00.00',
        verified: '8413.70.00.00',
        before: 5,
        after: 5,
        days: 0,
        cif: 310400,
        fob: 305000,
        permit: 'SONCAP · PC-2026-88370'
      }
    ];
    selected = params.get('case') || params.get('shipment') || 'CP-8849';
  } else {
    // Authenticated User Workspace Mode (Logged in)
    byId('deskKicker').textContent = 'Active workspace · ' + workspace;
    byId('navSignIn').hidden = true;
    byId('navGetStarted').hidden = true;
    byId('logout').hidden = false;
    byId('publicCreateCta').hidden = true;
    byId('new').hidden = false;

    try {
      const saved = JSON.parse(localStorage.getItem(getStorageKey()));
      records = Array.isArray(saved) ? saved : [];
    } catch {
      records = [];
    }
    selected = records[0]?.id;
  }
  render();
}

init();
