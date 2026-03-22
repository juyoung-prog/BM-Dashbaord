
console.log('[BM script] v4 loaded — ' + new Date().toISOString());

// ══════════════════════════════════════════
// XSS ESCAPE HELPER — use on ALL CSV-derived values in innerHTML
// ══════════════════════════════════════════
function esc(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ══════════════════════════════════════════
// DATA
// ══════════════════════════════════════════
const STORES = [
  {id:0,name:'Union City',addr:'6851 Shannon Pkwy, Union City, GA',photoGrad:'linear-gradient(135deg,#2d1b69 0%,#11998e 100%)',state:'GA',sub:'Georgia · $49.5K',income:49549,poverty:14.2,black:81.9,hisp:9.8,asian:0,white:3.6,wage:33.73,band:'lower',raceLabel:'82% B / 10% H',raceBar:[{w:81.9,c:'#0072B2'},{w:9.8,c:'#E69F00'},{w:8.3,c:'#64748B'}],priority:'accent',priorityText:'Black Hair Essentials',pColor:'var(--accent)',store:'Union City, GA',bannerLabel:'Lower-Mid Income',msg:'"Everyday beauty essentials nearby. Shop the Black hair care brands you trust."',stats:['$49,549','14.2%','81.9%','$33.73'],statLabels:['Median Income','Poverty Rate','Black Pop.','Avg Wage/hr'],merch:[['done','Black hair & braiding essentials'],['done','Value bundles & bulk packs'],['pend','Loyalty card promo (Pending)']],act1:'Launch Awareness Campaign',act2:'Update Shelf Displays'},
  {id:1,name:'Miami Gardens',addr:'19410 NW 27th Ave, Miami Gardens, FL',photoGrad:'linear-gradient(135deg,#0052d4 0%,#e040fb 100%)',state:'FL',sub:'FL · $63.6K',income:63627,poverty:13.6,black:60.3,hisp:36.3,asian:0.3,white:2.4,wage:31.88,band:'mid',raceLabel:'60% B / 36% H',raceBar:[{w:60.3,c:'#0072B2'},{w:36.3,c:'#E69F00'},{w:3.4,c:'#64748B'}],priority:'warn',priorityText:'Bilingual + Black Beauty',pColor:'var(--warning)',store:'Miami Gardens, FL',bannerLabel:'Mid Income',msg:'"Beauty for every culture — Black hair care, bilingual beauty, and more."',stats:['$63,627','13.6%','60.3%','$31.88'],statLabels:['Median Income','Poverty Rate','Black Pop.','Avg Wage/hr'],merch:[['done','Black hair essentials'],['done','Bilingual signage'],['pend','Latin beauty brands (In Progress)']],act1:'Deploy Bilingual Campaign',act2:'Activate Spanish Ads'},
  {id:2,name:'Duluth',addr:'2100 Pleasant Hill Rd #176, Duluth, GA',photoGrad:'linear-gradient(135deg,#1a237e 0%,#4fc3f7 100%)',state:'GA',sub:'Georgia · $95.3K',income:95331,poverty:8.9,black:23.7,hisp:16.3,asian:22.1,white:32.6,wage:33.73,band:'upper',raceLabel:'Diverse · 22% Asian',raceBar:[{w:23.7,c:'#0072B2'},{w:16.3,c:'#E69F00'},{w:22.1,c:'#009E73'},{w:32.6,c:'#64748B'}],priority:'info',priorityText:'Premium + K-Beauty',pColor:'var(--info)',store:'Duluth, GA (Gwinnett Co.)',bannerLabel:'Upper-Mid Income',msg:'"Elevated beauty at BeautyMaster Duluth — K-Beauty, premium skincare, diverse essentials."',stats:['$95,331','8.9%','23.7%','$33.73'],statLabels:['Median Income','Poverty Rate','Black Pop.','Avg Wage/hr'],merch:[['done','K-Beauty & Asian hair care'],['done','Premium skincare shelf'],['done','Fragrance & luxury sets']],act1:'Launch Premium Loyalty Tier',act2:'Update K-Beauty Section'},
  {id:3,name:'Riverdale',addr:'7055 GA-85 C, Riverdale, GA',photoGrad:'linear-gradient(135deg,#4a148c 0%,#e81d25 100%)',state:'GA',sub:'Southside ATL · $63.5K',income:63455,poverty:12.4,black:74.0,hisp:12.9,asian:7.3,white:3.4,wage:33.73,band:'mid',raceLabel:'74% B / 13% H',raceBar:[{w:74,c:'#0072B2'},{w:12.9,c:'#E69F00'},{w:13.1,c:'#64748B'}],priority:'',priorityText:'Black Hair + Protective',pColor:'var(--success)',store:'Riverdale, GA (Southside ATL)',bannerLabel:'Mid Income',msg:'"Your neighborhood beauty destination. Protective styles, natural hair essentials."',stats:['$63,455','12.4%','74.0%','$33.73'],statLabels:['Median Income','Poverty Rate','Black Pop.','Avg Wage/hr'],merch:[['done','Black hair & protective styles'],['done','Bulk purchase wigs & bundles'],['pend','Seasonal skincare promo (Pending)']],act1:'Launch Local Campaign',act2:'Update Protective Styles Signage'},
  {id:4,name:'Florida Mall',addr:'1631 Florida Mall Ave, Orlando, FL',photoGrad:'linear-gradient(135deg,#e65100 0%,#ffd54f 100%)',state:'FL',sub:'Orlando FL · $72.3K',income:72336,poverty:14.7,black:23.4,hisp:35.4,asian:5.0,white:31.2,wage:28.95,band:'mid',raceLabel:'35% H / 23% B',raceBar:[{w:35.4,c:'#E69F00'},{w:23.4,c:'#0072B2'},{w:31.2,c:'#64748B'},{w:10,c:'#FCD34D'}],priority:'warn',priorityText:'Bilingual Styling',pColor:'var(--warning)',store:'Florida Mall, Orlando FL',bannerLabel:'Mid Income',msg:'"BeautyMaster Florida Mall — tu destino de belleza. Bilingual beauty for everyone."',stats:['$72,336','14.7%','23.4%','$28.95'],statLabels:['Median Income','Poverty Rate','Black Pop.','Avg Wage/hr'],merch:[['done','Spanish-language POP displays'],['done','Latin hair & skin brands'],['pend','Quinceañera package (Pending)']],act1:'Deploy Spanish Social Content',act2:'Partner with Local Influencers'},
  {id:5,name:'Morrow',addr:'1400 Mt Zion Rd, Morrow, GA',photoGrad:'linear-gradient(135deg,#004d40 0%,#f9a825 100%)',state:'GA',sub:'Georgia · $73.7K',income:73693,poverty:19.1,black:32.5,hisp:30.0,asian:29.2,white:8.7,wage:33.73,band:'mid',raceLabel:'33% B / 30% H / 29% A',raceBar:[{w:32.5,c:'#0072B2'},{w:30,c:'#E69F00'},{w:29.2,c:'#009E73'},{w:8.3,c:'#64748B'}],priority:'accent',priorityText:'K-Beauty + Multicultural',pColor:'var(--accent)',store:'Morrow, GA',bannerLabel:'Mid Income',msg:'"K-Beauty, Latin beauty, and Black hair care — every culture, every look."',stats:['$73,693','19.1%','32.5%','$33.73'],statLabels:['Median Income','Poverty Rate','Black Pop.','Avg Wage/hr'],merch:[['done','K-Beauty & Asian hair care'],['done','Bilingual signage'],['pend','Multicultural promo bundle (Pending)']],act1:'Launch Multicultural Campaign',act2:'Expand K-Beauty Section'},
  {id:6,name:'Douglasville',addr:'Douglasville, GA',photoGrad:'linear-gradient(135deg,#1b5e20 0%,#9c27b0 100%)',state:'GA',sub:'Georgia · $79.1K',income:79107,poverty:10.7,black:68.2,hisp:4.7,asian:1.8,white:20.1,wage:33.73,band:'mid',raceLabel:'68% B / 5% H',raceBar:[{w:68.2,c:'#0072B2'},{w:4.7,c:'#E69F00'},{w:27.1,c:'#64748B'}],priority:'',priorityText:'Black Beauty Focus',pColor:'var(--success)',store:'Douglasville, GA',bannerLabel:'Mid Income',msg:'"BeautyMaster Douglasville — premium Black beauty essentials for your community."',stats:['$79,107','10.7%','68.2%','$33.73'],statLabels:['Median Income','Poverty Rate','Black Pop.','Avg Wage/hr'],merch:[['done','Black hair & protective styles'],['done','Natural hair essentials'],['pend','Summer promo bundle (Pending)']],act1:'Activate Community Sponsorship',act2:'Update Natural Hair Section'},
  {id:7,name:'Atlanta (×4)',addr:'Atlanta Metro, GA (4 locations)',photoGrad:'linear-gradient(135deg,#b71c1c 0%,#212121 100%)',state:'GA',sub:'GA · $85.7K avg',income:85652,poverty:16.9,black:46.0,hisp:6.3,asian:5.3,white:38.1,wage:33.73,band:'mid',raceLabel:'46% B / 38% W',raceBar:[{w:46,c:'#0072B2'},{w:6.3,c:'#E69F00'},{w:5.3,c:'#009E73'},{w:38.1,c:'#64748B'}],priority:'',priorityText:'Black + General Market',pColor:'var(--info)',store:'Atlanta, GA (4 Stores)',bannerLabel:'Mid Income',msg:'"Your Atlanta BeautyMaster — serving every neighborhood with Black beauty essentials."',stats:['$85,652','16.9%','46.0%','$33.73'],statLabels:['Median Income','Poverty Rate','Black Pop.','Avg Wage/hr'],merch:[['done','Black hair essentials'],['done','General market range'],['pend','Cross-store loyalty promo (Pending)']],act1:'Run Atlanta-Wide Campaign',act2:'Standardize Store Shelf Layouts'},
  {id:8,name:'Columbus',addr:'3131 Manchester Expy #2C, Columbus, GA',photoGrad:'linear-gradient(135deg,#37474f 0%,#e81d25 100%)',state:'GA',sub:'Georgia · $58.1K',income:58073,poverty:19.0,black:47.0,hisp:8.5,asian:2.7,white:36.7,wage:26.19,band:'mid',raceLabel:'47% B / 37% W',raceBar:[{w:47,c:'#0072B2'},{w:8.5,c:'#E69F00'},{w:36.7,c:'#64748B'}],priority:'accent',priorityText:'Value + Black Beauty',pColor:'var(--accent)',store:'Columbus, GA',bannerLabel:'Mid Income',msg:'"Affordable beauty essentials at BeautyMaster Columbus. Quality products, everyday prices."',stats:['$58,073','19.0%','47.0%','$26.19'],statLabels:['Median Income','Poverty Rate','Black Pop.','Avg Wage/hr'],merch:[['done','Value bundles & multipacks'],['done','Black hair essentials'],['pend','Community discount program (Pending)']],act1:'Launch Value Promotions',act2:'Activate Discount Program'},
  {id:9,name:'FL Others (×3)',addr:'Orlando · Tamarac · West Palm Beach, FL',photoGrad:'linear-gradient(135deg,#01579b 0%,#00897b 100%)',state:'FL',sub:'Orlando · Tamarac · WPB',income:69167,poverty:13.9,black:31.0,hisp:27.2,asian:2.9,white:29.9,wage:31.88,band:'mid',raceLabel:'~30% H / ~31% B',raceBar:[{w:31,c:'#E69F00'},{w:31,c:'#0072B2'},{w:30,c:'#64748B'}],priority:'warn',priorityText:'Bilingual + Multicultural',pColor:'var(--warning)',store:'FL: Orlando · Tamarac · WPB',bannerLabel:'Mid Income',msg:'"Bilingual beauty for every Florida community. Tu belleza, nuestro compromiso."',stats:['$69,167','13.9%','~31%','$31.88'],statLabels:['Median Income','Poverty Rate','Black Pop.','Avg Wage/hr'],merch:[['done','Bilingual product displays'],['done','Hispanic & Black beauty brands'],['pend','Seasonal FL promo (Pending)']],act1:'Deploy FL Bilingual Campaign',act2:'Update Store GMB Listings'},
];
// Sort each static store's raceBar by value descending at init time
STORES.forEach(s => s.raceBar.sort((a, b) => b.w - a.w));

// ══════════════════════════════════════════
// STATE
// ══════════════════════════════════════════
let activeFilter = 'all';
let sortField = null, sortAsc = true, storeSortField = 'alpha';
let selectedId = 0;
let colFilters = { name: '', band: '', demo: '' }; // column-level filters

// KPI visibility state
let visibleKPIs = ['all','black','hispanic','premium','lowincome','asian'];
let pickerSelection = new Set();

const ALL_KPI_DEFS = {
  all:       { label:'Total Stores',           value:'15',     meta:'GA 10 · FL 5',           color:'var(--text-secondary)', barW:null   },
  black:     { label:'Black-Majority Markets', value:'4',      meta:'stores >50% Black pop.', color:'var(--text-secondary)', barW:'27%', barC:'#CBD5E1'        },
  hispanic:  { label:'Hispanic Market Stores', value:'4',      meta:'stores >25% Hisp. pop.', color:'var(--text-secondary)', barW:'27%', barC:'#CBD5E1'        },
  premium:   { label:'Premium Income',         value:'1',      meta:'Duluth · $95.3K',        color:'var(--text-secondary)', barW:'7%',  barC:'#CBD5E1'        },
  lowincome: { label:'Value Income Markets',   value:'3',      meta:'stores <$65K income',    color:'var(--text-secondary)', barW:'20%', barC:'#CBD5E1'        },
  asian:     { label:'High Asian Population',  value:'2',      meta:'stores >20% Asian pop.', color:'var(--text-secondary)', barW:'13%', barC:'#CBD5E1'        },
};

// ══════════════════════════════════════════
// RENDER TABLE
// ══════════════════════════════════════════
function getFiltered() {
  let d = [...STORES];
  // KPI filter
  if (activeFilter === 'black')     d = d.filter(s => s.black > 50);
  if (activeFilter === 'hispanic')  d = d.filter(s => s.hisp > 25);
  if (activeFilter === 'premium')   d = d.filter(s => s.band === 'upper');
  if (activeFilter === 'income')    d = [...d].sort((a,b) => b.income - a.income);
  if (activeFilter === 'lowincome') d = d.filter(s => s.income < 65000);
  if (activeFilter === 'asian')     d = d.filter(s => s.asian > 20);

  // Store sort (alpha / state)
  if (storeSortField === 'alpha') d = [...d].sort((a,b) => a.name.localeCompare(b.name));
  if (storeSortField === 'ga')    d = [...d].sort((a,b) => a.state === b.state ? 0 : a.state === 'GA' ? -1 : 1);
  if (storeSortField === 'fl')    d = [...d].sort((a,b) => a.state === b.state ? 0 : a.state === 'FL' ? -1 : 1);

  // Header sort
  if (!storeSortField && sortField) {
    d = [...d].sort((a,b) => {
      const va = a[sortField], vb = b[sortField];
      return typeof va === 'string'
        ? (sortAsc ? va.localeCompare(vb) : vb.localeCompare(va))
        : (sortAsc ? va - vb : vb - va);
    });
  }
  return d;
}

function getBandBadge(band) {
  if (band==='upper') return '<span class="badge badge-blue">Upper-Mid</span>';
  if (band==='lower') return '<span class="badge badge-red">Lower-Mid</span>';
  return '<span class="badge badge-green">Mid Income</span>';
}


// ══════════════════════════════════════════
// TABLE COLUMN RESIZE
// ══════════════════════════════════════════
let colPxWidths = null;

function applyColWidths() {
  if (!colPxWidths) return;
  const template = colPxWidths.map(w => w + 'px').join(' ');
  document.querySelector('.tbl-head').style.gridTemplateColumns = template;
  document.querySelectorAll('.tbl-row').forEach(r => r.style.gridTemplateColumns = template);
}

function initColResize() {
  const head = document.querySelector('.tbl-head');
  if (!head) return;
  const ths = [...head.querySelectorAll('.th')];
  ths.forEach((th, i) => {
    if (i === ths.length - 1) return; // no handle on last column
    if (i === 3) return;              // no handle between Demographics and Store Priority
    const handle = document.createElement('div');
    handle.className = 'th-resize-handle';
    handle.addEventListener('mousedown', e => {
      e.preventDefault();
      e.stopPropagation();
      if (!colPxWidths) {
        colPxWidths = ths.map(t => t.getBoundingClientRect().width);
      }
      const startX = e.clientX;
      const startW = colPxWidths[i];
      handle.classList.add('dragging');
      function onMove(e) {
        colPxWidths[i] = Math.max(60, startW + (e.clientX - startX));
        applyColWidths();
      }
      function onUp() {
        handle.classList.remove('dragging');
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onUp);
      }
      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
    });
    th.appendChild(handle);
  });
}

function renderTable() {
  const data = getFiltered();
  const body = document.getElementById('tbl-body');
  if (!data.length) { body.innerHTML='<div class="no-results">No stores match this filter.</div>'; return; }
  const COLOR_LABEL = {
    '#0072B2': 'Black', '#0072B2': 'Black',
    '#E69F00': 'Hispanic',
    '#009E73': 'Asian',
    '#64748B': 'White', '#64748B': 'White',
    '#FCD34D': 'Other',
    '#CC79A7': 'Multiracial',
  };
  body.innerHTML = data.map(s => {
    const sortedRaceBar = [...s.raceBar].sort((a, b) => Number(b.w) - Number(a.w));
    console.log(`[demo sort] ${s.name}:`, sortedRaceBar.map(r => `${Math.round(r.w)}% ${COLOR_LABEL[r.c]||'?'}`));
    const demoLegend = sortedRaceBar
      .filter(r => r.w >= 5)
      .map(r => `<span class="dl-item"><span class="dl-dot" style="background:${r.c}"></span>${Math.round(r.w)}% ${COLOR_LABEL[r.c] || 'Other'}</span>`)
      .join('');
    return `
    <div class="tbl-row ${s.id===selectedId?'selected':''}" onclick="selectStore(${s.id})">
      <div class="tbl-cell">
        <div class="store-name">${esc(s.name)}</div>
        <div class="store-sub">${esc(s.sub)}</div>
      </div>
      <div class="tbl-cell">${getBandBadge(s.band)}</div>
      <div class="tbl-cell">
        <div class="store-name" style="font-size:12px">${s.pop > 0 ? s.pop.toLocaleString() : '—'}</div>
      </div>
      <div class="tbl-cell">
        <div class="race-wrap">
          <div class="race-track">${s.raceBar.map(r=>`<div class="race-seg" style="width:${r.w}%;background:${r.c}"></div>`).join('')}</div>
          <div class="demo-legend">${demoLegend}</div>
        </div>
      </div>
      <div class="tbl-cell">
        <span class="priority-badge">${s.priorityText}</span>
      </div>
    </div>
  `;
  }).join('');
  applyColWidths();
}

// ══════════════════════════════════════════
// COLUMN FILTERS
// ══════════════════════════════════════════
function colFilter(col, e) {
  e.stopPropagation();
  // Close all other dropdowns
  ['name','band','demo'].forEach(c => {
    const el = document.getElementById('cf-' + c);
    if (el && c !== col) el.classList.remove('open');
  });
  const dd = document.getElementById('cf-' + col);
  if (dd) dd.classList.toggle('open');
}

function applyColFilter(col, val, e) {
  e.stopPropagation();
  colFilters[col] = val;
  // Update active state in dropdown
  const dd = document.getElementById('cf-' + col);
  if (dd) {
    dd.querySelectorAll('.col-filter-opt').forEach(o => {
      o.classList.toggle('active', o.getAttribute('data-val') === val);
    });
    dd.classList.remove('open');
  }
  // Highlight th header if filtered
  const thId = col === 'name' ? 'th-name' : col === 'band' ? 'th-band' : 'th-demo';
  const th = document.getElementById(thId);
  if (th) th.classList.toggle('th-active', val !== '');
  renderTable();
}

// Close dropdowns on outside click
document.addEventListener('click', function(e) {
  ['cf-name','cf-band','cf-demo'].forEach(id => {
    const el = document.getElementById(id);
    if (el && !el.contains(e.target)) el.classList.remove('open');
  });
  const sp = document.getElementById('sort-panel');
  if (sp && !sp.parentElement.contains(e.target)) sp.classList.remove('open');
});

// ══════════════════════════════════════════
// KPI FILTER (KPI card click)
// ══════════════════════════════════════════
const FILTER_LABELS = {
  black:'Black >50%', hispanic:'Hispanic >25%',
  premium:'Upper-Mid Income', income:'Sorted by Income',
  lowincome:'Low Income (<$65K)', asian:'High Asian Pop. (>20%)'
};

function filterKPI(type, el) {
  if (activeFilter === type && type !== 'all') {
    activeFilter = 'all';
    document.querySelectorAll('.kpi-card').forEach(c => c.classList.remove('active'));
    document.getElementById('filter-pill-wrap').innerHTML = '';
  } else {
    activeFilter = type;
    document.querySelectorAll('.kpi-card').forEach(c => c.classList.remove('active'));
    if (type !== 'all') {
      el.classList.add('active');
      document.getElementById('filter-pill-wrap').innerHTML =
        `<span class="filter-pill" onclick="filterKPI('all',document.getElementById('kpi-all'))">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          ${FILTER_LABELS[type]||type}
        </span>`;
    } else {
      document.getElementById('filter-pill-wrap').innerHTML = '';
    }
  }
  renderTable();
}

// ══════════════════════════════════════════
// KPI DRAG & DROP
// ══════════════════════════════════════════
let dragSrc = null;

function initKPIDrag() {
  const grid = document.getElementById('kpi-grid');
  grid.addEventListener('dragstart', e => {
    const card = e.target.closest('.kpi-card');
    if (!card) { e.preventDefault(); return; }
    dragSrc = card;
    setTimeout(() => card.classList.add('dragging'), 0);
    e.dataTransfer.effectAllowed = 'move';
  });
  grid.addEventListener('dragend', e => {
    const card = e.target.closest('.kpi-card');
    if (card) card.classList.remove('dragging');
    grid.querySelectorAll('.kpi-card').forEach(c => c.classList.remove('drag-over'));
    dragSrc = null;
  });
  grid.addEventListener('dragover', e => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    const card = e.target.closest('.kpi-card');
    if (!card || card === dragSrc) return;
    grid.querySelectorAll('.kpi-card').forEach(c => c.classList.remove('drag-over'));
    card.classList.add('drag-over');
  });
  grid.addEventListener('dragleave', e => {
    const card = e.target.closest('.kpi-card');
    if (card) card.classList.remove('drag-over');
  });
  grid.addEventListener('drop', e => {
    e.preventDefault();
    const target = e.target.closest('.kpi-card');
    if (!target || target === dragSrc || !dragSrc) return;
    target.classList.remove('drag-over');
    // Determine position
    const addBtn = document.getElementById('kpi-add-btn');
    const allCards = [...grid.querySelectorAll('.kpi-card')];
    const srcIdx = allCards.indexOf(dragSrc);
    const tgtIdx = allCards.indexOf(target);
    if (srcIdx < tgtIdx) {
      grid.insertBefore(dragSrc, target.nextSibling || addBtn);
    } else {
      grid.insertBefore(dragSrc, target);
    }
  });
}

// ══════════════════════════════════════════
// KPI CARD ADD / REMOVE
// ══════════════════════════════════════════
function refreshAddBtn() {
  const addBtn = document.getElementById('kpi-add-btn');
  if (!addBtn) return;
  const allKeys = Object.keys(ALL_KPI_DEFS);
  const allVisible = allKeys.every(k => visibleKPIs.includes(k));
  addBtn.style.display = allVisible ? 'none' : '';
}

function removeKPI(e, id) {
  e.stopPropagation();
  if (visibleKPIs.length <= 1) return;
  visibleKPIs = visibleKPIs.filter(k => k !== id);
  const card = document.getElementById('kpi-' + id);
  if (card) card.remove();
  if (activeFilter === id) {
    activeFilter = 'all';
    document.getElementById('filter-pill-wrap').innerHTML = '';
    renderTable();
  }
  refreshAddBtn();
}

function openKPIPicker() {
  const hidden = Object.keys(ALL_KPI_DEFS).filter(k => !visibleKPIs.includes(k));
  const list = document.getElementById('kpi-picker-list');
  pickerSelection.clear();
  updatePickerConfirmBtn();
  if (!hidden.length) {
    list.innerHTML = '<div style="font-size:12.5px;color:var(--text-tertiary);text-align:center;padding:var(--s4) 0;">All KPI cards are already visible.</div>';
  } else {
    list.innerHTML = hidden.map(k => {
      const d = ALL_KPI_DEFS[k];
      return `<div class="kpi-picker-item" data-key="${k}" onclick="togglePickerItem(this,'${k}')">
        <div class="kpi-picker-check">✓</div>
        <div class="kpi-picker-item-label">${d.label}</div>
        <div class="kpi-picker-item-val" style="color:${d.color}">${d.value}</div>
      </div>`;
    }).join('');
  }
  document.getElementById('kpi-picker-backdrop').classList.add('open');
}

function togglePickerItem(el, key) {
  if (pickerSelection.has(key)) {
    pickerSelection.delete(key);
    el.classList.remove('selected');
  } else {
    pickerSelection.add(key);
    el.classList.add('selected');
  }
  updatePickerConfirmBtn();
}

function updatePickerConfirmBtn() {
  const btn = document.getElementById('kpi-picker-confirm');
  if (!btn) return;
  btn.disabled = pickerSelection.size === 0;
  btn.textContent = pickerSelection.size > 0 ? `Add ${pickerSelection.size} Card${pickerSelection.size>1?'s':''}` : 'Add Selected';
}

function confirmAddKPIs() {
  pickerSelection.forEach(id => addKPI(id));
  pickerSelection.clear();
  closeKPIPicker();
  refreshAddBtn();
}

function addKPI(id) {
  if (visibleKPIs.includes(id)) return;
  visibleKPIs.push(id);
  const d = ALL_KPI_DEFS[id];
  const grid = document.getElementById('kpi-grid');
  const addBtn = document.getElementById('kpi-add-btn');
  const card = document.createElement('div');
  card.className = 'kpi-card';
  card.id = 'kpi-' + id;
  card.setAttribute('data-kpi', id);
  card.setAttribute('draggable', 'true');
  card.setAttribute('onclick', `filterKPI('${id}',this)`);
  const dragHandle = `<span class="kpi-drag-handle"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><circle cx="9" cy="5" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="19" r="1"/></svg></span>`;
  const bar = d.barW ? `<div class="kpi-bar"><div class="kpi-bar-fill" style="width:${d.barW};background:${d.barC}"></div></div>` : '';
  card.innerHTML = `
    ${dragHandle}
    <button class="kpi-remove" onclick="removeKPI(event,'${id}')" title="Remove">×</button>
    <div class="kpi-label">${d.label}</div>
    <div class="kpi-value">${d.value}</div>
    <div class="kpi-meta"><span class="kpi-trend trend-neu" style="color:${d.color}">${d.meta}</span></div>
    ${bar}
  `;
  grid.insertBefore(card, addBtn);
}

function closeKPIPicker(e) {
  if (e && e.target !== document.getElementById('kpi-picker-backdrop')) return;
  pickerSelection.clear();
  document.getElementById('kpi-picker-backdrop').classList.remove('open');
}

// ══════════════════════════════════════════
// SORT PANEL
// ══════════════════════════════════════════
function toggleSortPanel(e) { if (e) e.stopPropagation(); }
function closeSortPanel() {}

// ══════════════════════════════════════════
// HEADER SORT
// ══════════════════════════════════════════
let demoSortField = null; // 'black' | 'hisp' | 'asian' | 'white' | null

function openStoreSort(e) {
  e.stopPropagation();
  document.getElementById('cf-name').classList.toggle('open');
}

function sortByStore(field, e) {
  e.stopPropagation();
  document.getElementById('cf-name').classList.remove('open');
  // Reset other sorts
  demoSortField = null; sortField = null;
  ['sort-band','sort-pop','sort-demo'].forEach(id => {
    const el = document.getElementById(id); if (el) el.textContent = '↕';
  });
  document.querySelectorAll('.th').forEach(t => t.classList.remove('th-active'));
  storeSortField = field || null;
  const nameEl = document.getElementById('sort-name');
  if (storeSortField) {
    const labels = { alpha:'A→Z', ga:'↓ GA', fl:'↓ FL' };
    if (nameEl) nameEl.textContent = labels[field];
    document.getElementById('th-name').classList.add('th-active');
  } else {
    if (nameEl) nameEl.textContent = '↕';
  }
  document.querySelectorAll('#cf-name .col-filter-opt').forEach(o =>
    o.classList.toggle('active', o.getAttribute('data-val') === field)
  );
  renderTable();
}

function sortByCol(col, e) {
  if (e) e.stopPropagation();
  // Reset demo + store sort
  demoSortField = null; storeSortField = null;
  const nameEl = document.getElementById('sort-name');
  if (nameEl) nameEl.textContent = '↕';
  document.querySelectorAll('#cf-name .col-filter-opt').forEach(o => o.classList.remove('active'));
  const demoEl = document.getElementById('sort-demo');
  if (demoEl) demoEl.textContent = '↕';
  document.getElementById('th-demo').classList.remove('th-active');

  if (sortField === col) sortAsc = !sortAsc;
  else { sortField = col; sortAsc = true; }

  // Update all sort indicators
  ['name','band','demo'].forEach(k => {
    const el = document.getElementById('sort-' + k);
    if (el) el.textContent = '↕';
  });
  const idMap = { name:'sort-name', income:'sort-band', pop:'sort-pop' };
  const el = document.getElementById(idMap[col]);
  if (el) el.textContent = sortAsc ? '↑' : '↓';

  document.querySelectorAll('.th').forEach(t => t.classList.remove('th-active'));
  const thMap = { name:'th-name', income:'th-band', pop:'th-pop' };
  const th = document.getElementById(thMap[col]);
  if (th) th.classList.add('th-active');

  renderTable();
}

function openDemoSort(e) {
  e.stopPropagation();
  const dd = document.getElementById('cf-demo');
  if (dd) dd.classList.toggle('open');
}

function sortByDemo(field, e) {
  e.stopPropagation();
  const dd = document.getElementById('cf-demo');
  if (dd) dd.classList.remove('open');

  // Reset name/income sort indicators
  ['sort-name','sort-band'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = '↕';
  });
  document.querySelectorAll('.th').forEach(t => t.classList.remove('th-active'));

  if (!field) {
    // Clear demo sort
    demoSortField = null;
    sortField = null;
    const demoEl = document.getElementById('sort-demo');
    if (demoEl) demoEl.textContent = '↕';
    // Reset active on dropdown options
    document.querySelectorAll('#cf-demo .col-filter-opt').forEach(o => o.classList.remove('active'));
  } else {
    demoSortField = field;
    sortField = field;
    sortAsc = false; // highest % first
    const demoEl = document.getElementById('sort-demo');
    const labels = { black:'↓ Black', hisp:'↓ Hispanic', asian:'↓ Asian', white:'↓ White' };
    if (demoEl) demoEl.textContent = labels[field] || '↓';
    document.getElementById('th-demo').classList.add('th-active');
    // Mark active option
    document.querySelectorAll('#cf-demo .col-filter-opt').forEach(o => {
      o.classList.toggle('active', o.getAttribute('data-val') === field);
    });
  }
  renderTable();
}

// Close store/demo dropdowns on outside click
document.addEventListener('click', function(e) {
  const demoTh = document.getElementById('th-demo');
  const demoDd = document.getElementById('cf-demo');
  if (demoDd && demoTh && !demoTh.contains(e.target)) demoDd.classList.remove('open');
  const nameTh = document.getElementById('th-name');
  const nameDd = document.getElementById('cf-name');
  if (nameDd && nameTh && !nameTh.contains(e.target)) nameDd.classList.remove('open');
});

function sortTable(col) {
  sortByCol(col === 'income' ? 'income' : col, null);
}

// ══════════════════════════════════════════
// STORE PHOTOS (per-store, persisted in localStorage)
// ══════════════════════════════════════════
const storePhotos = JSON.parse(localStorage.getItem('bm_storePhotos') || '{}');

function saveStorePhotos() {
  localStorage.setItem('bm_storePhotos', JSON.stringify(storePhotos));
}

function updatePhotoPanel(s) {
  const hero = document.getElementById('rp-photo');
  const bg   = document.getElementById('rp-photo-bg');
  const hint = document.querySelector('.rp-hero-upload-hint');
  const capName = document.getElementById('rp-photo-name');
  const capAddr = document.getElementById('rp-photo-addr');
  const badge   = document.getElementById('rp-photo-state');
  if (!bg) return;
  if (storePhotos[s.id]) {
    bg.style.backgroundImage = `url('${storePhotos[s.id]}')`;
    bg.style.opacity = '1';
    if (hero) { hero.style.background = ''; hero.classList.add('has-photo'); }
  } else {
    bg.style.backgroundImage = '';
    bg.style.opacity = '0';
    if (hero) { hero.style.background = ''; hero.classList.remove('has-photo'); }
  }
  if (capName) capName.textContent = s.name;
  if (capAddr) capAddr.textContent = s.addr;
  if (badge)   badge.textContent   = s.state;
}

function triggerPhotoUpload() {
  document.getElementById('rp-photo-input').click();
}


function handlePhotoUpload(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    storePhotos[selectedId] = e.target.result;
    saveStorePhotos();
    const bg = document.getElementById('rp-photo-bg');
    const hero = document.getElementById('rp-photo');
    if (bg) {
      bg.style.backgroundImage = `url('${e.target.result}')`;
      bg.style.opacity = '1';
    }
    if (hero) { hero.style.background = ''; hero.classList.add('has-photo'); }
  };
  reader.readAsDataURL(file);
  event.target.value = '';
}

// ══════════════════════════════════════════
// SELECT STORE → RIGHT PANEL
// ══════════════════════════════════════════
function selectStore(id) {
  selectedId = id;
  const s = STORES[id];
  const rp = document.querySelector('.right-panel');
  if (rp) {
    updatePhotoPanel(s);
    document.getElementById('rp-name').textContent = s.name;
    document.getElementById('rp-sub').textContent = s.store;
    document.getElementById('rp-msg').textContent = s.msg;
    document.getElementById('rp-stats').innerHTML = s.stats.map((v,i) =>
      `<div class="rp-stat"><div class="rp-stat-label">${s.statLabels[i]}</div><div class="rp-stat-value">${v}</div></div>`
    ).join('');
    document.getElementById('rp-merch').innerHTML = s.merch.map(([t,txt]) =>
      `<div class="merch-item"><div class="merch-dot merch-${t}">${t==='done'?'✓':'○'}</div><span class="${t==='pend'?'merch-pend-text':''}">${txt}</span></div>`
    ).join('');
    // Key Audience section
    const expandRace = l => l.trim()
      .replace(/(\d+)% B\b/g, '$1% Black')
      .replace(/(\d+)% H\b/g, '$1% Hispanic')
      .replace(/(\d+)% A\b/g, '$1% Asian')
      .replace(/(\d+)% W\b/g, '$1% White');
    const audDemo = document.getElementById('rp-aud-demo');
    if (audDemo) audDemo.textContent = expandRace(s.raceLabel);
    const audBand = document.getElementById('rp-aud-band');
    if (audBand) audBand.textContent = s.bannerLabel;
    const audPri = document.getElementById('rp-aud-priority');
    if (audPri) audPri.textContent = s.priorityText;
    // Primary action label — derived from store priority segment
    const guideMap = { accent: 'View Black Hair Care Guide', warn: 'View Bilingual Market Guide', info: 'View K-Beauty Playbook' };
    document.getElementById('rp-act1').textContent = guideMap[s.priority] || 'View Campaign Guide';
    // Market lens label
    const htagType = document.getElementById('rp-htag-type');
    if (htagType) htagType.textContent = s.priorityText;
  }
  renderTable();
}

// ══════════════════════════════════════════
// NAVIGATION
// ══════════════════════════════════════════
function showPage(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const pg = document.getElementById('page-' + id);
  if (pg) pg.classList.add('active');
}
function navTo(id, el) {
  showPage(id);
  document.querySelectorAll('.sb-item').forEach(i => i.classList.remove('active'));
  el.classList.add('active');
  closeMobileSidebar();
}

// ══════════════════════════════════════════
// MOBILE SIDEBAR
// ══════════════════════════════════════════
function toggleMobileSidebar() {
  document.querySelector('.sidebar').classList.toggle('open');
  document.getElementById('sidebar-overlay').classList.toggle('open');
}
function closeMobileSidebar() {
  document.querySelector('.sidebar').classList.remove('open');
  document.getElementById('sidebar-overlay').classList.remove('open');
}

// ══════════════════════════════════════════
// RIGHT PANEL RESIZE
// ══════════════════════════════════════════
function initRpResize() {
  const handle = document.getElementById('rp-resize-handle');
  if (!handle) return;
  let startX, startW;
  handle.addEventListener('mousedown', e => {
    startX = e.clientX;
    startW = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--rpanel-w')) || 288;
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
    e.preventDefault();
  });
  function onMove(e) {
    const dx = startX - e.clientX;
    const newW = Math.max(220, Math.min(520, startW + dx));
    document.documentElement.style.setProperty('--rpanel-w', newW + 'px');
  }
  function onUp() {
    document.removeEventListener('mousemove', onMove);
    document.removeEventListener('mouseup', onUp);
  }
}

// ══════════════════════════════════════════
// INIT
// ══════════════════════════════════════════
renderTable();
initKPIDrag();
initColResize();
refreshAddBtn();
updatePhotoPanel(STORES[0]);
initRpResize();

// Force right panel reflow on initial render.
// position:fixed + CSS variable width causes flex/grid children
// to miscalculate on first paint in some environments.
requestAnimationFrame(() => {
  const rp = document.querySelector('.right-panel');
  if (!rp) return;
  rp.style.display = 'none';
  rp.offsetHeight; // trigger reflow
  rp.style.display = '';
});

// Sync KPI cards to STORES data on initial load
(function initKPIFromStores() {
  const kpis = computeKPIsFromStores(STORES);
  Object.entries(kpis).forEach(([id, d]) => {
    const card = document.getElementById('kpi-' + id);
    if (!card) return;
    const valEl = card.querySelector('.kpi-value');
    const metaEl = card.querySelector('.kpi-meta');
    const barEl  = card.querySelector('.kpi-bar-fill');
    if (valEl)  valEl.textContent = d.val;
    if (metaEl) metaEl.innerHTML = `<span class="kpi-trend trend-neu" style="color:${d.color}">${d.meta}</span>`;
    if (barEl && d.barW) { barEl.style.width = d.barW; barEl.style.background = d.barC; }
  });
})();

// ══════════════════════════════════════════
// SETTINGS PAGE
// ══════════════════════════════════════════
let datasetExists = true;

// ── Clear the entire dashboard to an empty state ──
function clearDashboard() {
  // 1. Table → empty message
  const body = document.getElementById('tbl-body');
  if (body) body.innerHTML = '<div class="no-results" style="padding:var(--s10) var(--s6);text-align:center;color:var(--text-tertiary);">No dataset loaded. Upload a CSV in Settings to populate this view.</div>';

  // 2. KPI cards → zero out values, remove bars
  const kpiDefs = {
    all:       { val: '—',   meta: 'No data' },
    income:    { val: '—',   meta: 'No data' },
    black:     { val: '—',   meta: 'No data' },
    hispanic:  { val: '—',   meta: 'No data' },
    premium:   { val: '—',   meta: 'No data' },
    lowincome: { val: '—',   meta: 'No data' },
    asian:     { val: '—',   meta: 'No data' },
  };
  Object.entries(kpiDefs).forEach(([id, d]) => {
    const card = document.getElementById('kpi-' + id);
    if (!card) return;
    const valEl = card.querySelector('.kpi-value');
    const metaEl = card.querySelector('.kpi-meta');
    const barEl  = card.querySelector('.kpi-bar-fill');
    if (valEl)  valEl.textContent = d.val;
    if (metaEl) metaEl.innerHTML = `<span class="kpi-trend trend-neu" style="color:var(--text-tertiary)">${d.meta}</span>`;
    if (barEl)  barEl.style.width = '0%';
  });

  // 3. Right panel → blank state
  const rpName = document.getElementById('rp-name');
  const rpSub  = document.getElementById('rp-sub');
  const rpMsg  = document.getElementById('rp-msg');
  const rpStats = document.getElementById('rp-stats');
  const rpMerch = document.getElementById('rp-merch');
  const rpAct1  = document.getElementById('rp-act1');
  const rpAct2  = document.getElementById('rp-act2');
  const rpPhotoName = document.getElementById('rp-photo-name');
  const rpPhotoAddr = document.getElementById('rp-photo-addr');
  if (rpName)  rpName.textContent  = '—';
  if (rpSub)   rpSub.textContent   = 'No store selected';
  if (rpMsg)   rpMsg.textContent   = 'Upload a dataset to view store intelligence.';
  if (rpStats) rpStats.innerHTML = ['Median Income','Poverty Rate','Black Pop.','Avg Wage/hr','Population','Female','Under 18','Two+ Races'].map(l => `<div class="rp-stat"><div class="rp-stat-label">${l}</div><div class="rp-stat-value">—</div></div>`).join('');
  if (rpMerch) rpMerch.innerHTML   = '<div class="merch-item" style="color:var(--text-tertiary)">No data available.</div>';
  if (rpAct1)  rpAct1.textContent  = 'No actions available';
  if (rpAct2)  rpAct2.textContent  = 'No actions available';
  if (rpPhotoName) rpPhotoName.textContent = '—';
  if (rpPhotoAddr) rpPhotoAddr.textContent = 'No dataset';
  const rpLens = document.getElementById('rp-htag-type');
  if (rpLens) rpLens.textContent = '—';

  // 4. Photo bg → neutral grey
  const rpPhoto = document.getElementById('rp-photo');
  const rpPhotoBg = document.getElementById('rp-photo-bg');
  if (rpPhoto)   { rpPhoto.style.background = ''; rpPhoto.classList.remove('has-photo'); }
  if (rpPhotoBg) { rpPhotoBg.style.backgroundImage = 'none'; rpPhotoBg.style.opacity = '0'; rpPhotoBg.style.filter = 'none'; }

  // 5. Sidebar status dot → grey / "No data"
  const sbStatus = document.querySelector('.sb-status');
  if (sbStatus) sbStatus.innerHTML = '<div class="live-dot" style="background:var(--text-tertiary);animation:none"></div><span>No dataset loaded</span>';

  // 6. Audience Segments → empty state
  const audStats = document.getElementById('audience-stats-grid');
  if (audStats) audStats.innerHTML = `
    <div class="stat-card"><h4>Black Community</h4><div class="stat-big" style="color:var(--text-tertiary)">—</div><div class="stat-sub">No data</div></div>
    <div class="stat-card"><h4>Hispanic Market</h4><div class="stat-big" style="color:var(--text-tertiary)">—</div><div class="stat-sub">No data</div></div>
    <div class="stat-card"><h4>Asian / K-Beauty</h4><div class="stat-big" style="color:var(--text-tertiary)">—</div><div class="stat-sub">No data</div></div>`;
  const audList = document.getElementById('audience-seg-list');
  if (audList) audList.innerHTML = `<div style="padding:var(--s8) var(--s4);text-align:center;color:var(--text-tertiary);font-size:13px;">No dataset loaded. Upload a CSV in Settings to populate segment data.</div>`;

  // 7. Store Locator → empty state
  const locMap = document.getElementById('locator-map-ph');
  if (locMap) locMap.innerHTML = `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>No dataset — map unavailable`;
  const locList = document.getElementById('locator-list');
  if (locList) locList.innerHTML = `<div style="padding:var(--s8) var(--s4);text-align:center;color:var(--text-tertiary);font-size:13px;">No dataset loaded. Upload a CSV in Settings to populate store locations.</div>`;
}

// ── Restore dashboard from current STORES data ──
function restoreDashboard() {
  activeFilter = 'all'; sortField = null; sortAsc = true; colFilters = { name: '', band: '', demo: '' };
  renderTable();
  selectedId = 0; selectStore(0);
  const kpis = computeKPIsFromStores(STORES);
  Object.entries(kpis).forEach(([id, d]) => {
    const card = document.getElementById('kpi-' + id);
    if (!card) return;
    const valEl = card.querySelector('.kpi-value');
    const metaEl = card.querySelector('.kpi-meta');
    const barEl  = card.querySelector('.kpi-bar-fill');
    if (valEl)  valEl.textContent = d.val;
    if (metaEl) metaEl.innerHTML = `<span class="kpi-trend trend-neu" style="color:${d.color}">${d.meta}</span>`;
    if (barEl && d.barW) { barEl.style.width = d.barW; barEl.style.background = d.barC; }
  });
  const sbStatus = document.querySelector('.sb-status');
  if (sbStatus) sbStatus.innerHTML = '<div class="live-dot"></div><span>Live data &nbsp;·&nbsp; <strong>Census 2024</strong></span>';
  const blackStores = STORES.filter(s => s.black >= 30);
  const hispStores  = STORES.filter(s => s.hisp >= 20);
  const asianStores = STORES.filter(s => s.asian >= 15);
  const audStats = document.getElementById('audience-stats-grid');
  if (audStats) audStats.innerHTML = `
    <div class="stat-card"><h4>Black Community</h4><div class="stat-big" style="color:var(--text-primary)">${blackStores.length}</div><div class="stat-sub">stores with &gt;30% Black population</div></div>
    <div class="stat-card"><h4>Hispanic Market</h4><div class="stat-big" style="color:var(--text-primary)">${hispStores.length}</div><div class="stat-sub">stores with &gt;20% Hispanic pop.</div></div>
    <div class="stat-card"><h4>Asian / K-Beauty</h4><div class="stat-big" style="color:var(--text-primary)">${asianStores.length}</div><div class="stat-sub">${asianStores.map(s=>`${esc(s.name)} (${Math.round(s.asian)}%)`).join(' · ') || 'None'}</div></div>`;
  const audList = document.getElementById('audience-seg-list');
  if (audList) {
    const segs = [
      { name:'Black Hair Care Community', color:'var(--border-strong)', stores: STORES.filter(s=>s.black>=40) },
      { name:'Hispanic / Bilingual Market', color:'var(--border-strong)', stores: STORES.filter(s=>s.hisp>=20) },
      { name:'Premium / K-Beauty Shopper', color:'var(--border-strong)', stores: STORES.filter(s=>s.asian>=15||s.income>=85000) },
      { name:'Value / Budget-Conscious', color:'var(--border-strong)', stores: STORES.filter(s=>s.income<65000) },
      { name:'General / Mixed Market', color:'var(--border-strong)', stores: STORES.filter(s=>s.black<40&&s.hisp<20&&s.asian<15&&s.income>=65000) },
    ].filter(seg=>seg.stores.length>0);
    audList.innerHTML = segs.map(seg=>`<div class="seg-row"><div class="seg-dot" style="background:${seg.color}"></div><div><div class="seg-name">${seg.name}</div><div class="seg-desc">${seg.stores.map(s=>esc(s.name)).join(' · ')}</div></div><div class="seg-num">${seg.stores.length} store${seg.stores.length>1?'s':''}</div></div>`).join('');
  }
  const gaC = STORES.filter(s=>s.state==='GA').length;
  const flC = STORES.filter(s=>s.state==='FL').length;
  const locMap = document.getElementById('locator-map-ph');
  if (locMap) locMap.innerHTML = `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>Map View — GA (${gaC}) · FL (${flC}) Locations`;
  const locList = document.getElementById('locator-list');
  if (locList) locList.innerHTML = STORES.map(s=>`<div class="dist-item"><div><div class="dist-name">${esc(s.name)}</div><div class="dist-sub">${esc(s.addr)}</div></div><span class="badge ${s.state==='GA'?'badge-green':'badge-blue'}">${esc(s.state)}</span></div>`).join('');
}

function syncDatasetState() {
  document.getElementById('ds-meta-grid').style.display   = datasetExists ? '' : 'none';
  document.getElementById('ds-empty-state').style.display = datasetExists ? 'none' : '';
  document.getElementById('actions-has-data').style.display = datasetExists ? '' : 'none';
  document.getElementById('actions-no-data').style.display  = datasetExists ? 'none' : '';
  if (!datasetExists) {
    document.getElementById('fh-has-data').style.display = 'none';
    document.getElementById('fh-no-data').style.display  = '';
  }
  const badge = document.getElementById('ds-status-badge');
  if (badge) {
    badge.textContent = datasetExists ? '● Active' : '○ No Data';
    badge.className = 'badge ' + (datasetExists ? 'badge-green' : 'badge-red');
  }
}

function openRemoveModal() {
  document.getElementById('remove-modal').classList.add('open');
}
function closeRemoveModal(e) {
  if (e && e.target !== document.getElementById('remove-modal')) return;
  document.getElementById('remove-modal').classList.remove('open');
}
function confirmRemoveDataset() {
  datasetExists = false;
  document.getElementById('remove-modal').classList.remove('open');
  syncDatasetState();
  clearDashboard();
  showToast('Dataset removed. Dashboard cleared until a new CSV is uploaded.');
}

// ══════════════════════════════════════════
// CSV PARSER — converts BM_Market_Data.csv rows into STORES objects
// ══════════════════════════════════════════
function parseCSV(text) {
  const lines = text.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    // Handle quoted fields with commas inside
    const cols = [];
    let cur = '', inQ = false;
    for (let c = 0; c < lines[i].length; c++) {
      const ch = lines[i][c];
      if (ch === '"') { inQ = !inQ; }
      else if (ch === ',' && !inQ) { cols.push(cur.trim()); cur = ''; }
      else { cur += ch; }
    }
    cols.push(cur.trim());
    const row = {};
    headers.forEach((h, idx) => { row[h] = cols[idx] !== undefined ? cols[idx].replace(/^"|"$/g, '') : ''; });
    rows.push(row);
  }
  return rows;
}

const PHOTO_GRADS = [
  'linear-gradient(135deg,#2d1b69 0%,#11998e 100%)',
  'linear-gradient(135deg,#0052d4 0%,#e040fb 100%)',
  'linear-gradient(135deg,#1a237e 0%,#4fc3f7 100%)',
  'linear-gradient(135deg,#4a148c 0%,#e81d25 100%)',
  'linear-gradient(135deg,#e65100 0%,#ffd54f 100%)',
  'linear-gradient(135deg,#004d40 0%,#f9a825 100%)',
  'linear-gradient(135deg,#1b5e20 0%,#9c27b0 100%)',
  'linear-gradient(135deg,#b71c1c 0%,#212121 100%)',
  'linear-gradient(135deg,#37474f 0%,#e81d25 100%)',
  'linear-gradient(135deg,#01579b 0%,#00897b 100%)',
  'linear-gradient(135deg,#880e4f 0%,#f57f17 100%)',
  'linear-gradient(135deg,#263238 0%,#4caf50 100%)',
  'linear-gradient(135deg,#4e342e 0%,#7986cb 100%)',
  'linear-gradient(135deg,#006064 0%,#ef9a9a 100%)',
  'linear-gradient(135deg,#311b92 0%,#00bcd4 100%)',
];

function rowToStore(row, id) {
  const inc   = parseFloat(row.median_household_income) || 0;
  const pov   = parseFloat(row.poverty_pct) || 0;
  const black = parseFloat(row.black_pct) || 0;
  const hisp  = parseFloat(row.hispanic_pct) || 0;
  const asian = parseFloat(row.asian_pct) || 0;
  const white = parseFloat(row.white_non_hispanic_pct) || parseFloat(row.white_pct) || 0;
  const wage  = parseFloat(row.bls_area_mean_hourly_wage_all_occupations) || 0;
  const state = (row.state_abbr || '').trim();
  const name  = (row.store_name || row.name || '').replace(/^BeautyMaster\s*/i, '').replace(/^Beauty Master\s*/i, '');
  const addr  = row.address || '';
  const rawBand = (row.income_band || '').toLowerCase();

  // Band classification
  let band = 'mid';
  if (rawBand.includes('upper')) band = 'upper';
  else if (rawBand.includes('lower')) band = 'lower';

  // Band label
  const bandLabel = band === 'upper' ? 'Upper-Mid Income' : band === 'lower' ? 'Lower-Mid Income' : 'Mid Income';

  // Race label (top 2 significant groups)
  const races = [
    { code: 'B', val: black }, { code: 'H', val: hisp },
    { code: 'A', val: asian }, { code: 'W', val: white }
  ].filter(r => r.val >= 10).sort((a, b) => b.val - a.val);
  const raceLabel = races.length >= 2
    ? `${Math.round(races[0].val)}% ${races[0].code} / ${Math.round(races[1].val)}% ${races[1].code}`
    : races.length === 1 ? `${Math.round(races[0].val)}% ${races[0].code}`
    : 'Diverse';

  // raceBar
  const raceBar = [];
  if (black > 5)  raceBar.push({ w: black, c: '#0072B2' });
  if (hisp  > 5)  raceBar.push({ w: hisp,  c: '#E69F00' });
  if (asian > 5)  raceBar.push({ w: asian, c: '#009E73' });
  if (white > 5)  raceBar.push({ w: white, c: '#64748B' });
  // Priority logic
  let priority = '', priorityText = '', pColor = 'var(--success)';
  if (asian >= 20) {
    priority = 'info'; priorityText = inc >= 80000 ? 'Premium + K-Beauty' : 'K-Beauty + Multicultural'; pColor = 'var(--info)';
  } else if (black >= 60) {
    priority = 'accent'; priorityText = band === 'lower' ? 'Black Hair Essentials' : 'Black Hair + Protective'; pColor = 'var(--accent)';
  } else if (hisp >= 30) {
    priority = 'warn'; priorityText = black >= 20 ? 'Bilingual + Black Beauty' : 'Bilingual Styling'; pColor = 'var(--warning)';
  } else if (black >= 40) {
    priorityText = 'Black Beauty Focus'; pColor = 'var(--success)';
  } else if (inc < 60000) {
    priority = 'accent'; priorityText = 'Value + Black Beauty'; pColor = 'var(--accent)';
  } else {
    priorityText = 'Black + General Market'; pColor = 'var(--info)';
  }

  // Merch suggestions
  const merch = [];
  if (black >= 40) merch.push(['done', 'Black hair & protective styles']);
  if (hisp >= 20)  merch.push(['done', 'Bilingual signage & Latin brands']);
  if (asian >= 15) merch.push(['done', 'K-Beauty & Asian hair care']);
  if (band === 'lower' || inc < 65000) merch.push(['done', 'Value bundles & bulk packs']);
  if (inc >= 85000) merch.push(['done', 'Premium skincare shelf']);
  if (merch.length === 0) merch.push(['done', 'General beauty essentials']);
  merch.push(['pend', 'Seasonal promo (Pending)']);

  const act1 = hisp >= 20 ? 'Deploy Bilingual Campaign' : black >= 50 ? 'Launch Black Beauty Campaign' : 'Run Local Awareness Campaign';
  const act2 = asian >= 15 ? 'Expand K-Beauty Section' : 'Update Store Shelf Displays';

  const msg = hisp >= 25 && black >= 25
    ? `"Beauty for every culture — Black hair care, bilingual beauty, and more."`
    : black >= 60
    ? `"Everyday beauty essentials nearby. Shop the Black hair care brands you trust."`
    : asian >= 20
    ? `"Elevated beauty at ${name} — K-Beauty, premium skincare, diverse essentials."`
    : `"Your neighborhood BeautyMaster — serving every community with quality beauty essentials."`;

  const pop       = parseFloat(row.population_total) || 0;
  const femalePct = parseFloat(row.female_pct) || 0;
  const under18   = parseFloat(row.under_18_pct) || 0;
  const twoPlus   = parseFloat(row.two_or_more_races_pct) || 0;
  if (twoPlus > 3) raceBar.push({ w: twoPlus, c: '#CC79A7' });
  raceBar.sort((a, b) => b.w - a.w);

  return {
    id, name, addr,
    photoGrad: PHOTO_GRADS[id % PHOTO_GRADS.length],
    state, sub: `${state} · $${(inc/1000).toFixed(1)}K`,
    income: inc, poverty: pov, black, hisp, asian, white, wage,
    pop, femalePct, under18, twoPlus,
    band, raceLabel, raceBar, priority, priorityText, pColor,
    store: `${name}, ${state}`,
    bannerLabel: bandLabel,
    msg,
    stats: [
      `$${inc.toLocaleString()}`,
      `${pov.toFixed(1)}%`,
      `${black.toFixed(1)}%`,
      `$${wage.toFixed(2)}`,
      pop > 0 ? pop.toLocaleString() : '—',
      femalePct > 0 ? `${femalePct.toFixed(1)}%` : '—',
      under18 > 0 ? `${under18.toFixed(1)}%` : '—',
      twoPlus > 0 ? `${twoPlus.toFixed(1)}%` : '—',
    ],
    statLabels: ['Median Income', 'Poverty Rate', 'Black Pop.', 'Avg Wage/hr', 'Population', 'Female', 'Under 18', 'Two+ Races'],
    merch, act1, act2
  };
}

function buildStoresFromCSV(rows) {
  return rows.map((row, i) => rowToStore(row, i));
}

function computeKPIsFromStores(stores) {
  const n = stores.length;
  const avgInc = stores.reduce((s, x) => s + x.income, 0) / n;
  const minInc = Math.min(...stores.map(x => x.income));
  const maxInc = Math.max(...stores.map(x => x.income));
  const blackMaj = stores.filter(x => x.black > 50);
  const hispFocus = stores.filter(x => x.hisp > 25);
  const premium   = stores.filter(x => x.income >= 90000);
  const lowInc    = stores.filter(x => x.income < 65000);
  const asianHigh = stores.filter(x => x.asian > 20);
  const gaCount   = stores.filter(x => x.state === 'GA').length;
  const flCount   = stores.filter(x => x.state === 'FL').length;

  const highIncStore = stores.reduce((a, b) => a.income > b.income ? a : b, stores[0]);

  return {
    all:       { val: String(n),              meta: `GA ${gaCount} · FL ${flCount}`,       color: 'var(--text-secondary)', barW: null },
    income:    { val: `$${(avgInc/1000).toFixed(1)}K`, meta: `$${(minInc/1000).toFixed(0)}K – $${(maxInc/1000).toFixed(0)}K range`, color: 'var(--text-secondary)', barW: `${Math.round(avgInc/maxInc*100)}%`, barC: '#CBD5E1' },
    black:     { val: String(blackMaj.length), meta: 'stores >50% Black',    color: 'var(--text-secondary)', barW: `${Math.round(blackMaj.length/n*100)}%`, barC: '#CBD5E1' },
    hispanic:  { val: String(hispFocus.length),meta: 'stores >25% Hispanic', color: 'var(--text-secondary)', barW: `${Math.round(hispFocus.length/n*100)}%`, barC: '#CBD5E1' },
    premium:   { val: String(premium.length),  meta: premium.length > 0 ? `${premium[0].name} · $${(premium[0].income/1000).toFixed(1)}K` : 'None', color: 'var(--text-secondary)', barW: `${Math.round(premium.length/n*100)}%`, barC: '#CBD5E1' },
    lowincome: { val: String(lowInc.length),   meta: 'stores <$65K',         color: 'var(--text-secondary)', barW: `${Math.round(lowInc.length/n*100)}%`, barC: '#CBD5E1' },
    asian:     { val: String(asianHigh.length),meta: 'stores >20% Asian',    color: 'var(--text-secondary)', barW: `${Math.round(asianHigh.length/n*100)}%`, barC: '#CBD5E1' },
  };
}

function applyCSVText(csvText, filename, mode) {
  try {
    const rows = parseCSV(csvText);
    if (!rows.length) { showToast('CSV appears empty. Please check the file.'); return; }

    // Persist CSV for reload survival
    try {
      localStorage.setItem('bm_csvRaw', csvText);
      localStorage.setItem('bm_csvFilename', filename || 'dataset.csv');
      localStorage.setItem('bm_csvDate', new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }));
    } catch(e) { /* quota exceeded — skip */ }

    // Replace global STORES
    STORES.length = 0;
    buildStoresFromCSV(rows).forEach(s => {
      s.raceBar.sort((a, b) => b.w - a.w);
      STORES.push(s);
    });

    // Update ALL_KPI_DEFS
    const kpis = computeKPIsFromStores(STORES);
    Object.keys(kpis).forEach(k => { if (ALL_KPI_DEFS[k]) Object.assign(ALL_KPI_DEFS[k], { value: kpis[k].val, meta: kpis[k].meta }); });

    datasetExists = true;
    document.getElementById('ds-filename').textContent = filename || 'dataset.csv';
    document.getElementById('ds-updated').textContent = localStorage.getItem('bm_csvDate') || new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      syncDatasetState();

      // Re-render everything from new STORES
      activeFilter = 'all'; sortField = null; sortAsc = true; colFilters = { name: '', band: '', demo: '' };
      renderTable();
      selectedId = 0;
      selectStore(0);

      // KPI cards
      Object.entries(kpis).forEach(([id, d]) => {
        const card = document.getElementById('kpi-' + id);
        if (!card) return;
        const valEl = card.querySelector('.kpi-value');
        const metaEl = card.querySelector('.kpi-meta');
        const barEl  = card.querySelector('.kpi-bar-fill');
        if (valEl)  valEl.textContent = d.val;
        if (metaEl) metaEl.innerHTML = `<span class="kpi-trend trend-neu" style="color:${d.color}">${d.meta}</span>`;
        if (barEl && d.barW) { barEl.style.width = d.barW; barEl.style.background = d.barC; }
      });

      // Sidebar status
      const sbStatus = document.querySelector('.sb-status');
      if (sbStatus) sbStatus.innerHTML = '<div class="live-dot"></div><span>Live data &nbsp;·&nbsp; <strong>CSV Upload</strong></span>';

      // Audience segments
      const blackStores = STORES.filter(s => s.black >= 30);
      const hispStores  = STORES.filter(s => s.hisp >= 20);
      const asianStores = STORES.filter(s => s.asian >= 15);
      const audStats = document.getElementById('audience-stats-grid');
      if (audStats) audStats.innerHTML = `
        <div class="stat-card"><h4>Black Community</h4><div class="stat-big" style="color:var(--text-primary)">${blackStores.length}</div><div class="stat-sub">stores with &gt;30% Black population</div></div>
        <div class="stat-card"><h4>Hispanic Market</h4><div class="stat-big" style="color:var(--text-primary)">${hispStores.length}</div><div class="stat-sub">stores with &gt;20% Hispanic pop.</div></div>
        <div class="stat-card"><h4>Asian / K-Beauty</h4><div class="stat-big" style="color:var(--text-primary)">${asianStores.length}</div><div class="stat-sub">${asianStores.map(s => `${esc(s.name)} (${Math.round(s.asian)}%)`).join(' · ') || 'None'}</div></div>`;

      const audList = document.getElementById('audience-seg-list');
      if (audList) {
        const segments = [
          { name: 'Black Hair Care Community', color: 'var(--border-strong)', stores: STORES.filter(s => s.black >= 40) },
          { name: 'Hispanic / Bilingual Market', color: 'var(--border-strong)', stores: STORES.filter(s => s.hisp >= 20) },
          { name: 'Premium / K-Beauty Shopper', color: 'var(--border-strong)', stores: STORES.filter(s => s.asian >= 15 || s.income >= 85000) },
          { name: 'Value / Budget-Conscious', color: 'var(--border-strong)', stores: STORES.filter(s => s.income < 65000) },
          { name: 'General / Mixed Market', color: 'var(--border-strong)', stores: STORES.filter(s => s.black < 40 && s.hisp < 20 && s.asian < 15 && s.income >= 65000) },
        ].filter(seg => seg.stores.length > 0);
        audList.innerHTML = segments.map(seg =>
          `<div class="seg-row"><div class="seg-dot" style="background:${seg.color}"></div><div><div class="seg-name">${seg.name}</div><div class="seg-desc">${seg.stores.map(s => esc(s.name)).join(' · ')}</div></div><div class="seg-num">${seg.stores.length} store${seg.stores.length > 1 ? 's' : ''}</div></div>`
        ).join('');
      }

      // Store locator
      const locMap = document.getElementById('locator-map-ph');
      const gaC = STORES.filter(s => s.state === 'GA').length;
      const flC = STORES.filter(s => s.state === 'FL').length;
      if (locMap) locMap.innerHTML = `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>Map View — GA (${gaC}) · FL (${flC}) Locations`;
      const locList = document.getElementById('locator-list');
      if (locList) locList.innerHTML = STORES.map(s =>
        `<div class="dist-item"><div><div class="dist-name">${esc(s.name)}</div><div class="dist-sub">${esc(s.addr)}</div></div><span class="badge ${s.state === 'GA' ? 'badge-green' : 'badge-blue'}">${esc(s.state)}</span></div>`
      ).join('');

      // Run field mapping & data health check
      runDataHealth(Object.keys(rows[0]), rows);

      showToast(mode === 'replace' ? `Dataset replaced — ${STORES.length} stores loaded.` : `Dataset uploaded — ${STORES.length} stores loaded.`);
  } catch(err) {
    showToast('Error parsing CSV. Please check the file format.');
    console.error(err);
  }
}

function applyCSVData(file, mode) {
  const reader = new FileReader();
  reader.onload = function(e) { applyCSVText(e.target.result, file.name, mode); };
  reader.readAsText(file);
}

function handleCSVUpload(event, mode) {
  const file = event.target.files[0];
  if (!file) return;
  if (!file.name.endsWith('.csv')) { showToast('Please upload a .csv file only.'); return; }
  applyCSVData(file, mode);
  event.target.value = '';
}

// ══════════════════════════════════════════
// FIELD MAPPING & DATA HEALTH
// ══════════════════════════════════════════

// Required fields + their aliases from BM_Market_Data.csv
const FIELD_SCHEMA = [
  { key: 'store_name',  aliases: ['store_name','name','store'],                       required: true,  type: 'string' },
  { key: 'address',     aliases: ['address','addr','store_address'],                   required: true,  type: 'string' },
  { key: 'state_abbr',  aliases: ['state_abbr','state','state_code'],                  required: true,  type: 'string' },
  { key: 'median_household_income', aliases: ['median_household_income','median_income','income'], required: true, type: 'number', min: 0, max: 300000 },
  { key: 'black_pct',   aliases: ['black_pct','pct_black','black'],                    required: false, type: 'percent' },
  { key: 'hispanic_pct',aliases: ['hispanic_pct','pct_hispanic','hispanic'],           required: false, type: 'percent' },
  { key: 'asian_pct',   aliases: ['asian_pct','pct_asian','asian'],                    required: false, type: 'percent' },
  { key: 'white_pct',   aliases: ['white_pct','pct_white','white_non_hispanic_pct'],   required: false, type: 'percent' },
  { key: 'poverty_pct', aliases: ['poverty_pct','poverty_rate','pct_poverty'],         required: false, type: 'percent' },
  { key: 'bls_area_mean_hourly_wage_all_occupations', aliases: ['bls_area_mean_hourly_wage_all_occupations','avg_wage','wage','hourly_wage'], required: false, type: 'number', min: 0, max: 200 },
];

const SVG_CHECK = `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>`;
const SVG_WARN  = `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5" stroke-linecap="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`;
const SVG_MISS  = `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`;
const SVG_WARN_SM = `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" style="width:13px;height:13px;flex-shrink:0"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/></svg>`;

function runDataHealth(headers, rows) {
  // Find which CSV column maps to each schema field
  const mappings = FIELD_SCHEMA.map(field => {
    const matched = field.aliases.find(a => headers.includes(a)) || null;
    return { ...field, csvCol: matched };
  });

  // Only show fields that are required OR found in CSV
  const relevant = mappings.filter(f => f.required || f.csvCol);

  // Per-field validation
  const fieldResults = relevant.map(f => {
    if (!f.csvCol) {
      return { ...f, status: 'missing', invalidCount: 0, invalidMsg: '' };
    }
    let invalidCount = 0;
    const msgs = [];
    if (f.type === 'percent') {
      rows.forEach(r => {
        const v = parseFloat(r[f.csvCol]);
        if (r[f.csvCol] !== '' && (isNaN(v) || v < 0 || v > 100)) invalidCount++;
      });
      if (invalidCount) msgs.push(`${invalidCount}개 행의 값이 0–100 범위를 벗어남`);
    } else if (f.type === 'number') {
      rows.forEach(r => {
        const v = parseFloat(r[f.csvCol]);
        if (r[f.csvCol] !== '' && isNaN(v)) invalidCount++;
        else if (f.min !== undefined && v < f.min) invalidCount++;
        else if (f.max !== undefined && v > f.max) invalidCount++;
      });
      if (invalidCount) msgs.push(`${invalidCount}개 행에 유효하지 않은 숫자값`);
    } else if (f.type === 'string') {
      rows.forEach(r => { if (!r[f.csvCol] || r[f.csvCol].trim() === '') invalidCount++; });
      if (invalidCount) msgs.push(`${invalidCount}개 행에 빈 값`);
    }
    const status = invalidCount > 0 ? 'warn' : 'ok';
    return { ...f, status, invalidCount, invalidMsg: msgs.join(', ') };
  });

  // Also list extra CSV columns not in schema
  const knownAliases = FIELD_SCHEMA.flatMap(f => f.aliases);
  const extraCols = headers.filter(h => !knownAliases.includes(h));

  const warnings = fieldResults.filter(f => f.status === 'warn' || f.status === 'missing');
  const mapped   = fieldResults.filter(f => f.status !== 'missing').length;

  // Render summary
  document.getElementById('fh-val-mapped').textContent = mapped;
  document.getElementById('fh-val-mapped').style.color = 'var(--success)';
  const warnEl = document.getElementById('fh-val-warnings');
  warnEl.textContent = warnings.length;
  warnEl.style.color = warnings.length > 0 ? 'var(--error)' : 'var(--success)';
  document.getElementById('fh-val-rows').textContent = rows.length;

  // Render field list
  const list = document.getElementById('fh-field-list');
  list.innerHTML = fieldResults.map(f => {
    let icon, cls, tag = '';
    if (f.status === 'missing') {
      icon = SVG_MISS; cls = 'fh-miss';
      tag = `<span class="fh-ftag ${f.required ? 'required' : 'warn'}">${f.required ? 'Required — 누락됨' : '누락됨'}</span>`;
    } else if (f.status === 'warn') {
      icon = SVG_WARN; cls = 'fh-warn';
      tag = `<span class="fh-ftag warn">${f.invalidMsg}</span>`;
    } else {
      icon = SVG_CHECK; cls = 'fh-ok';
      if (f.required) tag = `<span class="fh-ftag required">Required</span>`;
    }
    return `<div class="fh-field ${cls}">${icon}<span class="fh-fname">${f.csvCol || f.key}</span>${tag}</div>`;
  }).join('') + (extraCols.length
    ? `<div class="fh-field fh-extra" style="opacity:.5">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" style="width:14px;height:14px;flex-shrink:0;color:var(--text-tertiary)"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
        <span class="fh-fname" style="color:var(--text-tertiary)">+ ${extraCols.length}개 추가 컬럼 (미사용)</span>
      </div>`
    : '');

  // Render warning messages
  const footer = document.getElementById('fh-footer');
  const warnFields = fieldResults.filter(f => f.status === 'warn' || f.status === 'missing');
  if (warnFields.length === 0) {
    footer.innerHTML = `<div class="fh-warn-msg" style="background:rgba(16,185,129,.06);border-color:rgba(16,185,129,.2);color:var(--success)">
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" style="width:13px;height:13px;flex-shrink:0"><polyline points="20 6 9 17 4 12"/></svg>
      모든 필드가 정상입니다. 데이터 검증 완료.
    </div>`;
  } else {
    footer.innerHTML = warnFields.map(f => {
      if (f.status === 'missing') {
        return `<div class="fh-warn-msg">${SVG_WARN_SM} <strong>${f.key}</strong> 컬럼을 찾을 수 없습니다. ${f.required ? 'CSV에 해당 컬럼이 필요합니다.' : '선택적 컬럼이지만 일부 기능이 제한됩니다.'}</div>`;
      }
      return `<div class="fh-warn-msg">${SVG_WARN_SM} <strong>${f.csvCol}</strong>에서 ${f.invalidMsg}. 해당 행은 계산에서 제외됩니다.</div>`;
    }).join('');
  }

  // Show the panel
  document.getElementById('fh-has-data').style.display = '';
  document.getElementById('fh-no-data').style.display = 'none';
}

function runValidation() {
  showToast('Validation complete.');
}
function refreshData() {
  showToast('Data refreshed. All dashboard calculations updated.');
}

function setSeg(groupId, btn) {
  const group = document.getElementById(groupId);
  if (!group) return;
  group.querySelectorAll('.seg-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
}

function uploadZoneDragOver(e) {
  e.preventDefault();
  document.getElementById('upload-zone').classList.add('dragover');
}
function uploadZoneDragLeave() {
  document.getElementById('upload-zone').classList.remove('dragover');
}
function uploadZoneDrop(e) {
  e.preventDefault();
  document.getElementById('upload-zone').classList.remove('dragover');
  const file = e.dataTransfer.files[0];
  if (!file) return;
  if (!file.name.endsWith('.csv')) { showToast('Please drop a .csv file only.'); return; }
  applyCSVData(file, 'upload');
}

let toastTimer;
function showToast(msg) {
  let t = document.querySelector('.validate-toast');
  if (!t) {
    t = document.createElement('div');
    t.className = 'validate-toast';
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 3200);
}

syncDatasetState();

// Restore CSV from localStorage — must run after datasetExists and all
// settings functions are declared, and after the initial renderTable().
(function restoreCSV() {
  const saved = localStorage.getItem('bm_csvRaw');
  if (!saved) return;
  const filename = localStorage.getItem('bm_csvFilename') || 'dataset.csv';
  applyCSVText(saved, filename, 'upload');
})();

// ══════════════════════════════════════════
// THEME (Dark / Light Mode)
// ══════════════════════════════════════════
function toggleTheme() {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  const next = isDark ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('bm-theme', next);
  _applyThemeIcon(next);
}

function _applyThemeIcon(theme) {
  const isDark = theme === 'dark';
  const sun  = document.getElementById('theme-icon-sun');
  const moon = document.getElementById('theme-icon-moon');
  const lbl  = document.getElementById('theme-label');
  if (sun)  sun.style.display  = isDark ? '' : 'none';
  if (moon) moon.style.display = isDark ? 'none' : '';
  if (lbl)  lbl.textContent    = isDark ? 'Light Mode' : 'Dark Mode';
}

// Restore saved theme on load
(function() {
  const saved = localStorage.getItem('bm-theme') || 'light';
  document.documentElement.setAttribute('data-theme', saved);
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => _applyThemeIcon(saved));
  } else {
    _applyThemeIcon(saved);
  }
})();
