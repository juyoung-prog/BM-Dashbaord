// ═══════════════════════════════════════════════════════════
//  INFLUENCER HUB — BeautyMaster Ops  |  influencer.js
//  Drop alongside script2.js · requires: STORES global array
// ═══════════════════════════════════════════════════════════

// ── Storage keys ──
const _IK  = 'bm_infs_v3';
const _CRK = 'bm_cred_v3';
const _SDK = 'bm_vids_v3';

let BM_INFS=[], BM_CREDITS=[], BM_VIDEOS=[];
let _infTab='influencers', _infDrawerId=null, _infStorePanelOpen=true;
let _infF={ q:'',store:'',ctype:'',plat:'',eth:'',tier:'',fmin:'',fmax:'',status:'' };
let _vidF={ q:'',plat:'',store:'',collab:'' };
let _credF={ inf:'',store:'',status:'' };
let _infDupIgnoreAll=false;
const _INF_DEFAULT_TAGS=['Hair','Wig','Hair Extensions','Protective Style','Haircare','K-Beauty','J-Beauty','Skincare','Makeup','Fashion','Lifestyle','GRWM','Product Review','Store Visit','Family','Comedy','General Merchandise'];
let _infTagSel=[], _infTagExtra=[];

// ── Palette for avatars ──
const _AVC=[
  {bg:'#EEEDFE',tx:'#534AB7'},{bg:'#E1F5EE',tx:'#0F6E56'},
  {bg:'#FAECE7',tx:'#993C1D'},{bg:'#E6F1FB',tx:'#185FA5'},
  {bg:'#EAF3DE',tx:'#3B6D11'},{bg:'#FAEEDA',tx:'#854F0B'},
  {bg:'#FCEBEB',tx:'#A32D2D'}
];
const _ETH_LBL={
  'Asian':'Asian',
  'Black':'Black or African American',
  'Hispanic':'Hispanic or Latino',
  'White':'White',
  'Native American':'Native American or Indigenous',
  'Pacific Islander':'Native Hawaiian or Other Pacific Islander',
  'Middle Eastern':'Middle Eastern or North African',
  'Mixed':'Mixed / Multiracial',
  'Other':'Other',
  'Prefer not to say':'Prefer not to say',
  // legacy values — kept so old records render gracefully
  'South Asian':'South Asian'
};

// ══════════════════════════════════════
// DATA
// ══════════════════════════════════════
function _loadInf(){
  try{
    BM_INFS=JSON.parse(localStorage.getItem(_IK)||'[]');
    BM_CREDITS=JSON.parse(localStorage.getItem(_CRK)||'[]');
    BM_VIDEOS=JSON.parse(localStorage.getItem(_SDK)||'[]');
    if(!BM_INFS.length) _initSample();
  }catch(e){BM_INFS=[];BM_CREDITS=[];BM_VIDEOS=[];}
}
function _saveInf(){
  try{
    localStorage.setItem(_IK,JSON.stringify(BM_INFS));
    localStorage.setItem(_CRK,JSON.stringify(BM_CREDITS));
    localStorage.setItem(_SDK,JSON.stringify(BM_VIDEOS));
  }catch(e){}
}

function _initSample(){
  const t=Date.now();
  BM_INFS=[
    {id:t+1,name:'Emma Chen',igHandle:'@emmachen.beauty',igUrl:'https://instagram.com/emmachen.beauty',ttHandle:'@emmachen',ttUrl:'https://tiktok.com/@emmachen',ytUrl:'',email:'emma@emmachen.co',photoUrl:'',photoData:'',ethnicity:'Asian',category:'Beauty',status:'Active',followers:1200000,eng:5.8,fee:8500,loc:'Duluth, GA',platforms:['IG','TT'],storeIds:[4,9],campaignTypes:['K-beauty','General Store'],notes:'Top K-beauty performer. Very responsive.'},
    {id:t+2,name:'Marcus Lee',igHandle:'@marcuslifestyle',igUrl:'https://instagram.com/marcuslifestyle',ttHandle:'@marcuslee.bm',ttUrl:'',ytUrl:'',email:'marcus@mlee.com',photoUrl:'',photoData:'',ethnicity:'Black',category:'Lifestyle',status:'Active',followers:67000,eng:8.2,fee:1800,loc:'Savannah, GA',platforms:['IG','TT'],storeIds:[14,12],campaignTypes:['General Store','Event'],notes:'High-engagement micro influencer for Black hair community.'},
    {id:t+3,name:'Sofia Rodriguez',igHandle:'@sofiabeautyfl',igUrl:'https://instagram.com/sofiabeautyfl',ttHandle:'@sofia.beauty',ttUrl:'https://tiktok.com/@sofia.beauty',ytUrl:'https://youtube.com/@sofiabeautyfl',email:'sofia@sofiabeauty.com',photoUrl:'',photoData:'',ethnicity:'Hispanic',category:'Beauty',status:'Active',followers:450000,eng:6.1,fee:4500,loc:'Miami Gardens, FL',platforms:['IG','TT','YT'],storeIds:[8,13],campaignTypes:['K-beauty','General Store','Event'],notes:'Bilingual Spanish/English. Perfect for FL Hispanic campaigns.'},
    {id:t+4,name:'Aisha Johnson',igHandle:'@aishajohnson',igUrl:'https://instagram.com/aishajohnson',ttHandle:'',ttUrl:'',ytUrl:'',email:'aisha@ajstyle.com',photoUrl:'',photoData:'',ethnicity:'Black',category:'Hair',status:'Prospect',followers:28500,eng:9.4,fee:900,loc:'Columbus, GA',platforms:['IG'],storeIds:[2],campaignTypes:['General Store'],notes:'Strong Black hair care nano influencer.'},
    {id:t+5,name:'Jake Rivera',igHandle:'@jakerivera.life',igUrl:'https://instagram.com/jakerivera.life',ttHandle:'@jakerivera',ttUrl:'',ytUrl:'',email:'jake@jakerivera.com',photoUrl:'',photoData:'',ethnicity:'Hispanic',category:'Lifestyle',status:'Inactive',followers:234000,eng:3.9,fee:3200,loc:'Orlando, FL',platforms:['IG','TT'],storeIds:[5,11],campaignTypes:['Event','General Store'],notes:'On hold — contract renewal pending.'}
  ];
  BM_CREDITS=[
    {id:t+20,infId:t+2,infName:'Marcus Lee',storeId:14,storeCode:'GA-UC',serial:'SC-2025-0001',amount:800,issued:'2025-04-05',expiry:'2025-10-05',status:'Unused'},
    {id:t+21,infId:t+4,infName:'Aisha Johnson',storeId:2,storeCode:'GA-COL',serial:'SC-2025-0002',amount:450,issued:'2025-03-15',expiry:'2025-09-15',status:'Unused'},
    {id:t+22,infId:t+1,infName:'Emma Chen',storeId:4,storeCode:'GA-DUL',serial:'SC-2024-0089',amount:2000,issued:'2024-12-01',expiry:'2025-06-01',status:'Used'}
  ];
  BM_VIDEOS=[
    {id:t+30,infId:t+1,infName:'Emma Chen',title:'Spring K-beauty Skincare Routine',platform:'Instagram Reel',campaignName:'Spring K-beauty Launch',storeId:4,storeName:'Duluth',collab:'Paid',fee:8500,shoot:'2025-03-10',pub:'2025-03-15',url:'https://instagram.com',views:284000,likes:18400,comments:942,notes:'Best performing reel this quarter.'},
    {id:t+31,infId:t+3,infName:'Sofia Rodriguez',title:'Miami Summer Beauty Haul',platform:'TikTok',campaignName:'Summer FL Campaign',storeId:8,storeName:'Miami Gardens',collab:'Paid',fee:4500,shoot:'2025-04-01',pub:'2025-04-05',url:'',views:521000,likes:41200,comments:2100,notes:'Viral on first day.'},
    {id:t+32,infId:t+2,infName:'Marcus Lee',title:'Savannah Store Tour',platform:'Instagram Reel',campaignName:'',storeId:12,storeName:'Riverdale',collab:'Store Credit',fee:800,shoot:'2025-04-10',pub:'2025-04-12',url:'',views:38000,likes:4200,comments:310,notes:''}
  ];
  _saveInf();
}

// ══════════════════════════════════════
// HELPERS
// ══════════════════════════════════════
function _ini(n){return(n||'?').split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2)}
function _aviSt(name){const c=_AVC[(name.charCodeAt(0)||0)%_AVC.length];return`background:${c.bg};color:${c.tx}`}
function _fmtN(n){if(!n)return'0';if(n>=1e6)return(n/1e6).toFixed(1)+'M';if(n>=1000)return(n/1000).toFixed(0)+'K';return String(n)}
function _tier(f){if(f<10000)return'Nano';if(f<100000)return'Micro';if(f<1000000)return'Macro';return'Mega'}
function _tierChip(f){const t=_tier(f);return`<span class="tier-chip tier-${t}">${t}</span>`}
function _ethChip(e){if(!e)return'';return`<span class="eth-chip eth-${e.replace(/\s+/g,'-')}">${_ETH_LBL[e]||e}</span>`}
function _ctChip(t){const m={'K-beauty':'kbeauty','General Store':'general','Event':'event'};return`<span class="ct-chip ct-${m[t]||'general'}">${t}</span>`}
function _storeChip(storeId){const st=typeof STORES!=='undefined'&&STORES.find(s=>s.id===storeId);if(!st)return'';return`<span class="inf-store-chip inf-chip-${st.state}">${st.name}</span>`}
function _score(inf){return Math.min(Math.round(Math.min((inf.eng||0)*8,40)+Math.min(Math.log10(Math.max(inf.followers||1,1))*8,35)+(inf.platforms||[]).length*5+(inf.status==='Active'?20:inf.status==='Prospect'?10:0)),100)}
function _photoSrc(inf){return inf.photoUrl||inf.photoData||''}
function _aviEl(inf,sz){
  const src=_photoSrc(inf);
  const s=sz==='lg'?72:sz==='md'?40:28;
  const fs=sz==='lg'?24:sz==='md'?14:10;
  const st=_aviSt(inf.name);
  if(src)return`<img src="${src}" style="width:${s}px;height:${s}px;border-radius:50%;object-fit:cover;flex-shrink:0;border:1px solid var(--border-default)" onerror="this.style.display='none';this.nextSibling.style.display='flex'"><div class="inf-av" style="${st};width:${s}px;height:${s}px;font-size:${fs}px;display:none">${_ini(inf.name)}</div>`;
  return`<div class="inf-av" style="${st};width:${s}px;height:${s}px;font-size:${fs}px">${_ini(inf.name)}</div>`;
}
function _sBadge(s){const m={Active:'badge-green',Prospect:'badge-blue',Inactive:'badge-red'};return`<span class="badge ${m[s]||'badge-red'}" style="font-size:10px">${s}</span>`}
function _fmtD(d){if(!d)return'—';try{return new Date(d+'T00:00:00').toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}catch(e){return d}}
function _esc(v){return String(v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')}

// ══════════════════════════════════════
// PAGE RENDER
// ══════════════════════════════════════
function renderInfluencerPage(){
  _renderInfPanel();
  _renderVidPanel();
  _renderCredPanel();
  _renderPageActions();
}

function _renderPageActions(){
  const el=document.getElementById('inf-page-actions');
  if(!el)return;
  el.innerHTML=`<button class="inf-side-pill" id="inf-side-pill" onclick="infToggleSidePanel()">${_infStorePanelOpen?'Hide Store Info ›':'Store Info ‹'}</button>`;
}

// ── Tab switching ──
function infSetTab(tab, el){
  _infTab=tab;
  ['influencers','videos','credits'].forEach(t=>{
    const btn=document.getElementById('inf-tab-'+t);
    const panel=document.getElementById('inf-panel-'+t);
    if(btn)btn.classList.toggle('active',t===tab);
    if(panel)panel.style.display=t===tab?'':'none';
  });
  if(tab==='influencers')_renderInfPanel();
  if(tab==='videos')_renderVidPanel();
  if(tab==='credits')_renderCredPanel();
}

// ══════════════════════════════════════
// INFLUENCER PANEL
// ══════════════════════════════════════
function _renderInfPanel(){
  const panel=document.getElementById('inf-panel-influencers');
  if(!panel)return;
  panel.innerHTML=`
    <div class="inf-split">
      <div class="inf-split-main">
        <div class="inf-fbar" id="inf-fbar"></div>
        <div class="inf-stats-strip" id="inf-stat-strip"></div>
        <div class="card">
          <div class="card-header">
            <div class="card-title" id="inf-count-lbl">All Influencers</div>
            <button class="inf-btn-p" onclick="openAddInf()">+ Add Influencer</button>
          </div>
          <div class="inf-tbl-scroll">
            <div class="inf-tbl-head">
              <div class="inf-th"></div>
              <div class="inf-th">Influencer</div>
              <div class="inf-th">Ethnicity</div>
              <div class="inf-th">Tier</div>
              <div class="inf-th">Stores</div>
              <div class="inf-th">Campaign Types</div>
              <div class="inf-th">Followers</div>
              <div class="inf-th">Status</div>
              <div class="inf-th"></div>
            </div>
            <div id="inf-tbl-body"></div>
          </div>
        </div>
      </div>
      <div class="inf-split-side${_infStorePanelOpen?'':' collapsed'}" id="inf-split-side">
        <div class="inf-side-head">
          <span class="inf-side-head-title">Store Information</span>
          <button class="inf-side-close-btn" onclick="infToggleSidePanel()" title="Collapse">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        </div>
        <div class="inf-side-body" id="inf-side-body">${_renderStorePanelContent()}</div>
      </div>
    </div>`;
  _renderInfFilters();
  _renderInfStats();
  _renderInfTable();
}

function infToggleSidePanel(){
  _infStorePanelOpen=!_infStorePanelOpen;
  const side=document.getElementById('inf-split-side');
  const pill=document.getElementById('inf-side-pill');
  if(side)side.classList.toggle('collapsed',!_infStorePanelOpen);
  if(pill)pill.textContent=_infStorePanelOpen?'Hide Store Info ›':'Store Info ‹';
  _syncFab();
}

function _syncFab(){
  const fab=document.getElementById('inf-store-fab');
  if(fab)fab.classList.toggle('visible',!_infStorePanelOpen);
}

function _renderStorePanelContent(){
  try{
    const stores=typeof STORES!=='undefined'?STORES:[];
    const byStore=stores.map(s=>({
      id:s.id, name:s.name, state:s.state,
      infCount:BM_INFS.filter(i=>(i.storeIds||[]).includes(s.id)).length,
    })).sort((a,b)=>b.infCount-a.infCount);
    const withInfs=byStore.filter(s=>s.infCount>0);
    const gaStoreIds=stores.filter(s=>s.state==='GA').map(s=>s.id);
    const flStoreIds=stores.filter(s=>s.state==='FL').map(s=>s.id);
    const gaInfs=BM_INFS.filter(i=>i.status==='Active'&&(i.storeIds||[]).some(id=>gaStoreIds.includes(id))).length;
    const flInfs=BM_INFS.filter(i=>i.status==='Active'&&(i.storeIds||[]).some(id=>flStoreIds.includes(id))).length;
    return`
      <div class="inf-side-stat-row">
        <div class="inf-side-stat"><div class="inf-side-stat-val">${BM_INFS.length}</div><div class="inf-side-stat-lbl">Total</div></div>
        <div class="inf-side-stat"><div class="inf-side-stat-val">${BM_INFS.filter(i=>i.status==='Active').length}</div><div class="inf-side-stat-lbl">Active</div></div>
        <div class="inf-side-stat"><div class="inf-side-stat-val">${BM_CREDITS.filter(c=>c.status==='Unused').length}</div><div class="inf-side-stat-lbl">Credits</div></div>
      </div>
      <div class="inf-side-divider"></div>
      <div class="inf-side-region-row">
        <div class="inf-side-region"><span class="inf-store-chip inf-chip-GA" style="font-size:9px;padding:1px 6px">GA</span><span class="inf-side-region-val">${gaInfs} active</span></div>
        <div class="inf-side-region"><span class="inf-store-chip inf-chip-FL" style="font-size:9px;padding:1px 6px">FL</span><span class="inf-side-region-val">${flInfs} active</span></div>
      </div>
      <div class="inf-side-divider"></div>
      <div class="inf-side-section-lbl">By Store</div>
      ${withInfs.length?withInfs.map(s=>`
        <div class="inf-side-store-row">
          <span class="inf-store-chip inf-chip-${s.state}" style="font-size:9px;padding:1px 5px;flex-shrink:0">${s.state}</span>
          <span class="inf-side-store-name">${s.name}</span>
          <span class="inf-side-store-count">${s.infCount}</span>
        </div>`).join(''):`<div style="font-size:12px;color:var(--text-tertiary);padding:6px 0">No store assignments yet</div>`}
      ${stores.length&&withInfs.length<stores.length?`<div class="inf-side-note">${stores.length-withInfs.length} store${stores.length-withInfs.length!==1?'s':''} without influencers</div>`:''}
    `;
  }catch(e){
    return`<div style="font-size:11px;color:var(--text-tertiary);padding:8px 0">Store data unavailable</div>`;
  }
}

function _renderInfFilters(){
  const el=document.getElementById('inf-fbar');
  if(!el)return;
  const storeOpts=(typeof STORES!=='undefined'?STORES:[]).map(s=>`<option value="${s.id}" ${_infF.store==s.id?'selected':''}>${s.name} (${s.state})</option>`).join('');
  el.innerHTML=`
    <div class="inf-fg"><label>Search</label><input style="width:140px" placeholder="Name or handle…" value="${_esc(_infF.q)}" oninput="_infF.q=this.value;_renderInfStats();_renderInfTable()"></div>
    <div class="inf-fg"><label>Store</label><select onchange="_infF.store=this.value;_renderInfStats();_renderInfTable()"><option value="">All Stores</option>${storeOpts}</select></div>
    <div class="inf-fg"><label>Campaign Type</label><select onchange="_infF.ctype=this.value;_renderInfStats();_renderInfTable()">
      <option value="">All Types</option>
      <option value="K-beauty" ${_infF.ctype==='K-beauty'?'selected':''}>K-beauty</option>
      <option value="General Store" ${_infF.ctype==='General Store'?'selected':''}>General Store</option>
      <option value="Event" ${_infF.ctype==='Event'?'selected':''}>Event</option>
    </select></div>
    <div class="inf-fg"><label>Platform</label><select onchange="_infF.plat=this.value;_renderInfStats();_renderInfTable()">
      <option value="">All</option>
      <option value="IG" ${_infF.plat==='IG'?'selected':''}>Instagram</option>
      <option value="TT" ${_infF.plat==='TT'?'selected':''}>TikTok</option>
      <option value="YT" ${_infF.plat==='YT'?'selected':''}>YouTube</option>
    </select></div>
    <div class="inf-fg"><label>Ethnicity</label><select onchange="_infF.eth=this.value;_renderInfStats();_renderInfTable()">
      <option value="">All</option>
      <option value="Asian" ${_infF.eth==='Asian'?'selected':''}>Asian</option>
      <option value="Black" ${_infF.eth==='Black'?'selected':''}>Black or African American</option>
      <option value="Hispanic" ${_infF.eth==='Hispanic'?'selected':''}>Hispanic or Latino</option>
      <option value="White" ${_infF.eth==='White'?'selected':''}>White</option>
      <option value="Native American" ${_infF.eth==='Native American'?'selected':''}>Native American or Indigenous</option>
      <option value="Pacific Islander" ${_infF.eth==='Pacific Islander'?'selected':''}>Native Hawaiian or Other Pacific Islander</option>
      <option value="Middle Eastern" ${_infF.eth==='Middle Eastern'?'selected':''}>Middle Eastern or North African</option>
      <option value="Mixed" ${_infF.eth==='Mixed'?'selected':''}>Mixed / Multiracial</option>
      <option value="Other" ${_infF.eth==='Other'?'selected':''}>Other</option>
      <option value="Prefer not to say" ${_infF.eth==='Prefer not to say'?'selected':''}>Prefer not to say</option>
    </select></div>
    <div class="inf-fg"><label>Tier</label><select onchange="_infF.tier=this.value;_renderInfStats();_renderInfTable()">
      <option value="">All Tiers</option>
      <option value="Nano" ${_infF.tier==='Nano'?'selected':''}>Nano &lt;10K</option>
      <option value="Micro" ${_infF.tier==='Micro'?'selected':''}>Micro 10K–100K</option>
      <option value="Macro" ${_infF.tier==='Macro'?'selected':''}>Macro 100K–1M</option>
      <option value="Mega" ${_infF.tier==='Mega'?'selected':''}>Mega 1M+</option>
    </select></div>
    <div class="inf-fg"><label>Follower Range</label>
      <div class="inf-range-row">
        <input class="inf-ri" placeholder="Min" type="number" value="${_infF.fmin}" oninput="_infF.fmin=this.value;_renderInfStats();_renderInfTable()">
        <span style="font-size:11px;color:var(--text-tertiary)">–</span>
        <input class="inf-ri" placeholder="Max" type="number" value="${_infF.fmax}" oninput="_infF.fmax=this.value;_renderInfStats();_renderInfTable()">
      </div>
    </div>
    <div class="inf-fg"><label>Status</label><select onchange="_infF.status=this.value;_renderInfStats();_renderInfTable()">
      <option value="">All</option>
      <option value="Active" ${_infF.status==='Active'?'selected':''}>Active</option>
      <option value="Prospect" ${_infF.status==='Prospect'?'selected':''}>Prospect</option>
      <option value="Inactive" ${_infF.status==='Inactive'?'selected':''}>Inactive</option>
    </select></div>
    <div class="inf-fg" style="align-self:flex-end"><button class="inf-btn-g" onclick="_infF={q:'',store:'',ctype:'',plat:'',eth:'',tier:'',fmin:'',fmax:'',status:''};_renderInfPanel()">Clear</button></div>`;
}

function _getFilteredInfs(){
  let d=[...BM_INFS];
  const q=(_infF.q||'').toLowerCase();
  if(q)d=d.filter(i=>i.name.toLowerCase().includes(q)||(i.igHandle||'').toLowerCase().includes(q)||(i.ttHandle||'').toLowerCase().includes(q));
  if(_infF.store)d=d.filter(i=>(i.storeIds||[]).includes(parseInt(_infF.store)));
  if(_infF.ctype)d=d.filter(i=>(i.campaignTypes||[]).includes(_infF.ctype));
  if(_infF.plat)d=d.filter(i=>(i.platforms||[]).includes(_infF.plat));
  if(_infF.eth)d=d.filter(i=>i.ethnicity===_infF.eth);
  if(_infF.tier)d=d.filter(i=>_tier(i.followers)===_infF.tier);
  if(_infF.status)d=d.filter(i=>i.status===_infF.status);
  if(_infF.fmin)d=d.filter(i=>i.followers>=(parseInt(_infF.fmin)||0));
  if(_infF.fmax)d=d.filter(i=>i.followers<=(parseInt(_infF.fmax)||Infinity));
  return d.sort((a,b)=>_score(b)-_score(a));
}

function _renderInfStats(){
  const el=document.getElementById('inf-stat-strip');
  if(!el)return;
  const d=_getFilteredInfs();
  const active=d.filter(i=>i.status==='Active').length;
  const totalF=d.reduce((a,b)=>a+(b.followers||0),0);
  const unusedCr=BM_CREDITS.filter(c=>c.status==='Unused').length;
  el.innerHTML=`
    <div class="inf-sc"><div class="inf-sl">Influencers</div><div class="inf-sv">${d.length}</div><div class="inf-ss">${active} active</div></div>
    <div class="inf-sc"><div class="inf-sl">Total Reach</div><div class="inf-sv">${_fmtN(totalF)}</div><div class="inf-ss">Combined followers</div></div>
    <div class="inf-sc"><div class="inf-sl">Active Credits</div><div class="inf-sv">${unusedCr}</div><div class="inf-ss">Unused store credits</div></div>`;
}

function _renderInfTable(){
  const d=_getFilteredInfs();
  const el=document.getElementById('inf-tbl-body');
  const lbl=document.getElementById('inf-count-lbl');
  if(!el)return;
  if(lbl)lbl.textContent=`${d.length} Influencer${d.length!==1?'s':''}`;
  if(!d.length){el.innerHTML=`<div class="inf-empty"><div class="inf-empty-icon">👤</div>No influencers match your filters</div>`;return;}
  el.innerHTML=d.map(inf=>{
    const storeChips=(inf.storeIds||[]).map(id=>_storeChip(id)).join('');
    const ctChips=(inf.campaignTypes||[]).map(t=>_ctChip(t)).join('');
    return`<div class="inf-tbl-row" onclick="openInfDrawer(${inf.id})">
      <div class="inf-td">${_aviEl(inf)}</div>
      <div class="inf-td"><div class="inf-name-cell">
        <div class="inf-name-info">
          <strong>${_esc(inf.name)}</strong>
          <span>${_esc([inf.igHandle,inf.ttHandle].filter(Boolean).join(' · ')||inf.email||'')}</span>
        </div>
      </div></div>
      <div class="inf-td">${_ethChip(inf.ethnicity)}</div>
      <div class="inf-td">${_tierChip(inf.followers)}</div>
      <div class="inf-td"><div style="display:flex;flex-wrap:wrap;gap:2px">${storeChips||'<span style="color:var(--text-tertiary);font-size:11px">—</span>'}</div></div>
      <div class="inf-td"><div style="display:flex;flex-wrap:wrap">${ctChips||'<span style="color:var(--text-tertiary);font-size:11px">—</span>'}</div></div>
      <div class="inf-td" style="font-family:var(--font-mono)">${_fmtN(inf.followers)}</div>
      <div class="inf-td">${_sBadge(inf.status)}</div>
      <div class="inf-td" style="display:flex;align-items:center;gap:8px">
        <div class="inf-row-actions" onclick="event.stopPropagation()">
          <button class="inf-btn-xs" onclick="openEditInf(${inf.id})">Edit</button>
          <button class="inf-btn-xs inf-btn-del" onclick="deleteInf(${inf.id})">✕</button>
        </div>
      </div>
    </div>`;
  }).join('');
}

// ══════════════════════════════════════
// PROFILE DRAWER
// ══════════════════════════════════════
function openInfDrawer(id){
  const inf=BM_INFS.find(i=>i.id===id);
  if(!inf)return;
  _infDrawerId=id;
  // Collapse the side panel first, let it animate, then open the drawer
  const side=document.getElementById('inf-split-side');
  const pill=document.getElementById('inf-side-pill');
  if(side&&!side.classList.contains('collapsed')){
    side.style.display='';
    side.classList.add('collapsed');
    _infStorePanelOpen=false;
    if(pill)pill.textContent='Store Info ‹';
    _syncFab();
  }
  const credits=BM_CREDITS.filter(c=>c.infId===id);
  const videos=BM_VIDEOS.filter(v=>v.infId===id).sort((a,b)=>(b.views||0)-(a.views||0));
  const editBtn=document.getElementById('inf-drw-edit-btn');
  if(editBtn)editBtn.onclick=()=>{closeInfDrawer();openEditInf(id)};
  const score=_score(inf);
  const storeChips=(inf.storeIds||[]).map(id=>_storeChip(id)).filter(Boolean);
  const _drwUrls=(inf.links&&inf.links.length?inf.links:[inf.igUrl,inf.ttUrl,inf.ytUrl]).filter(Boolean);
  const socialLinks=_drwUrls.map(url=>{
    if(url.includes('instagram.com'))return`<a href="${url}" target="_blank" class="inf-sl-link sl-ig">📸 Instagram</a>`;
    if(url.includes('tiktok.com'))return`<a href="${url}" target="_blank" class="inf-sl-link sl-tt">🎵 TikTok</a>`;
    if(url.includes('youtube.com'))return`<a href="${url}" target="_blank" class="inf-sl-link sl-yt">▶ YouTube</a>`;
    return`<a href="${url}" target="_blank" class="inf-sl-link" style="background:var(--bg-subtle);color:var(--text-secondary)">🔗 Link</a>`;
  }).join('');
  document.getElementById('inf-drw-body').innerHTML=`
    <div class="inf-prof-hero">
      ${_aviEl(inf,'lg')}
      <div style="flex:1">
        <div class="inf-prof-name">${_esc(inf.name)}</div>
        <div class="inf-prof-handle">${_esc(inf.igHandle||inf.ttHandle||'No handle set')}</div>
        <div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:6px">${_ethChip(inf.ethnicity)} ${_tierChip(inf.followers)} ${_sBadge(inf.status)}</div>
        <div>${socialLinks||'<span style="font-size:11px;color:var(--text-tertiary)">No social links</span>'}</div>
      </div>
    </div>

    <div class="inf-dsec">
      <div class="inf-dsec-head">Basic Info</div>
      <div class="inf-info-grid">
        <div class="inf-info-item"><div class="inf-info-lbl">Category</div><div class="inf-info-val">${inf.category||'—'}</div></div>
        <div class="inf-info-item"><div class="inf-info-lbl">Location</div><div class="inf-info-val">${inf.loc||'—'}</div></div>
        <div class="inf-info-item"><div class="inf-info-lbl">Followers</div><div class="inf-info-val" style="font-family:var(--font-mono)">${_fmtN(inf.followers)}</div></div>
        <div class="inf-info-item"><div class="inf-info-lbl">Engagement</div><div class="inf-info-val" style="font-family:var(--font-mono)">${(inf.eng||0).toFixed(1)}%</div></div>
        <div class="inf-info-item"><div class="inf-info-lbl">Fee / Post</div><div class="inf-info-val" style="font-family:var(--font-mono)">$${(inf.fee||0).toLocaleString()}</div></div>
        <div class="inf-info-item"><div class="inf-info-lbl">Email</div><div class="inf-info-val" style="font-size:11px">${inf.email||'—'}</div></div>
      </div>
    </div>

    <div class="inf-dsec">
      <div class="inf-dsec-head">Platforms & Campaign Types</div>
      <div style="display:flex;gap:4px;flex-wrap:wrap;margin-bottom:7px">
        ${(inf.platforms||[]).map(p=>`<span class="badge badge-green" style="font-size:10px">${p}</span>`).join('')||'<span style="color:var(--text-tertiary);font-size:11px">None set</span>'}
      </div>
      <div style="display:flex;flex-wrap:wrap">${(inf.campaignTypes||[]).map(t=>_ctChip(t)).join('')||'<span style="color:var(--text-tertiary);font-size:11px">None set</span>'}</div>
    </div>

    <div class="inf-dsec">
      <div class="inf-dsec-head">Assigned Stores
        <div style="display:flex;flex-wrap:wrap;gap:3px">${storeChips.length?storeChips.join(''):'<span style="color:var(--text-tertiary);font-size:11px;font-weight:400">None</span>'}</div>
      </div>
    </div>

    <div class="inf-dsec">
      <div class="inf-dsec-head">Store Credits (${credits.length}) <button class="inf-btn-xs" onclick="event.stopPropagation();openAddCreditFor(${inf.id})">+ Issue</button></div>
      ${credits.length?credits.map(c=>`<div class="inf-cred-row">
        <span class="inf-cred-serial">${_esc(c.serial)}</span>
        <span style="flex:1">${c.storeId?_storeChip(c.storeId):''}<div style="font-size:10px;color:var(--text-tertiary)">Issued ${c.issued||'—'} · Exp ${c.expiry||'—'}</div></span>
        <span style="font-family:var(--font-mono);font-weight:600">$${(c.amount||0).toLocaleString()}</span>
        <span class="${c.status==='Unused'?'cred-unused':'cred-used'}">${c.status}</span>
        <button class="inf-btn-xs" onclick="event.stopPropagation();toggleCreditStatus(${c.id});openInfDrawer(${inf.id})">${c.status==='Unused'?'Mark Used':'Undo'}</button>
        <button class="inf-btn-xs inf-btn-del" onclick="event.stopPropagation();deleteCredit(${c.id},${inf.id})">✕</button>
      </div>`).join(''):'<div style="font-size:12px;color:var(--text-tertiary);padding:8px 0">No credits issued</div>'}
    </div>

    ${videos.length?`<div class="inf-dsec">
      <div class="inf-dsec-head">Videos (${videos.length})</div>
      ${videos.map(v=>`<div class="inf-vid-mini">
        <div class="inf-vid-mini-title">${_esc(v.title)}</div>
        <span class="badge badge-green" style="font-size:10px">${v.platform}</span>
        <span class="inf-vid-mini-views">${_fmtN(v.views)} views</span>
      </div>`).join('')}
    </div>`:''}

    ${inf.notes?`<div class="inf-dsec"><div class="inf-dsec-head">Notes</div><div style="font-size:12px;color:var(--text-secondary);line-height:1.6">${_esc(inf.notes)}</div></div>`:''}
  `;
  // Delay matches the .inf-split-side collapse transition (280ms)
  setTimeout(function(){
    document.getElementById('inf-drw-overlay').classList.add('open');
    document.getElementById('inf-drw').classList.add('open');
  },300);
}
function closeInfDrawer(){
  document.getElementById('inf-drw-overlay').classList.remove('open');
  document.getElementById('inf-drw').classList.remove('open');
  _infDrawerId=null;
  const side=document.getElementById('inf-split-side');
  const pill=document.getElementById('inf-side-pill');
  if(side){
    side.style.display='';
    side.classList.remove('collapsed');
    _infStorePanelOpen=true;
    if(pill)pill.textContent='Hide Store Info ›';
    _syncFab();
  }
}

// ══════════════════════════════════════
// VIDEO TRACKER PANEL
// ══════════════════════════════════════
function _renderVidPanel(){
  const panel=document.getElementById('inf-panel-videos');
  if(!panel)return;
  let vids=[...BM_VIDEOS];
  const q=(_vidF.q||'').toLowerCase();
  if(q)vids=vids.filter(v=>v.title.toLowerCase().includes(q)||(v.infName||'').toLowerCase().includes(q));
  if(_vidF.plat)vids=vids.filter(v=>v.platform===_vidF.plat);
  if(_vidF.store)vids=vids.filter(v=>v.storeId===parseInt(_vidF.store));
  if(_vidF.collab)vids=vids.filter(v=>v.collab===_vidF.collab);
  vids.sort((a,b)=>(b.views||0)-(a.views||0));
  const tv=vids.reduce((a,v)=>a+(v.views||0),0);
  const tl=vids.reduce((a,v)=>a+(v.likes||0),0);
  const storeOpts=(typeof STORES!=='undefined'?STORES:[]).map(s=>`<option value="${s.id}" ${_vidF.store==s.id?'selected':''}>${s.name}</option>`).join('');
  panel.innerHTML=`
    <div class="inf-fbar">
      <div class="inf-fg"><label>Search</label><input style="width:140px" placeholder="Title or influencer…" value="${_esc(_vidF.q)}" oninput="_vidF.q=this.value;_renderVidPanel()"></div>
      <div class="inf-fg"><label>Platform</label><select onchange="_vidF.plat=this.value;_renderVidPanel()">
        <option value="">All</option>
        <option value="Instagram Reel" ${_vidF.plat==='Instagram Reel'?'selected':''}>Instagram Reel</option>
        <option value="TikTok" ${_vidF.plat==='TikTok'?'selected':''}>TikTok</option>
        <option value="YouTube" ${_vidF.plat==='YouTube'?'selected':''}>YouTube</option>
        <option value="YouTube Short" ${_vidF.plat==='YouTube Short'?'selected':''}>YouTube Short</option>
      </select></div>
      <div class="inf-fg"><label>Store</label><select onchange="_vidF.store=this.value;_renderVidPanel()"><option value="">All Stores</option>${storeOpts}</select></div>
      <div class="inf-fg"><label>Collab Type</label><select onchange="_vidF.collab=this.value;_renderVidPanel()">
        <option value="">All</option>
        <option value="Paid" ${_vidF.collab==='Paid'?'selected':''}>Paid</option>
        <option value="Store Credit" ${_vidF.collab==='Store Credit'?'selected':''}>Store Credit</option>
      </select></div>
      <div class="inf-fg" style="align-self:flex-end"><button class="inf-btn-g" onclick="_vidF={q:'',plat:'',store:'',collab:''};_renderVidPanel()">Clear</button></div>
    </div>
    <div class="inf-stats-strip" style="margin-bottom:14px">
      <div class="inf-sc"><div class="inf-sl">Videos</div><div class="inf-sv">${vids.length}</div></div>
      <div class="inf-sc"><div class="inf-sl">Total Views</div><div class="inf-sv">${_fmtN(tv)}</div></div>
      <div class="inf-sc"><div class="inf-sl">Total Likes</div><div class="inf-sv">${_fmtN(tl)}</div></div>
      <div class="inf-sc"><div class="inf-sl">Avg Like Rate</div><div class="inf-sv">${vids.length&&tv?(tl/tv*100).toFixed(1)+'%':'—'}</div></div>
    </div>
    <div style="display:flex;justify-content:flex-end;margin-bottom:12px">
      <button class="inf-btn-p" onclick="openAddVideo()">+ Add Video</button>
    </div>
    ${vids.length?vids.map(v=>{
      const inf=BM_INFS.find(i=>i.id===v.infId);
      const er=v.views?(v.likes/v.views*100).toFixed(1)+'%':'—';
      return`<div class="inf-vid-card">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px">
          <div>
            <div style="font-size:13px;font-weight:600;margin-bottom:3px">${_esc(v.title)}</div>
            <div style="font-size:11px;color:var(--text-secondary);display:flex;align-items:center;gap:6px;flex-wrap:wrap">
              ${inf?_aviEl(inf):''}
              <span style="font-weight:500">${_esc(v.infName)}</span> · ${v.platform}
              ${v.campaignName?`· <span class="badge badge-blue" style="font-size:10px">${_esc(v.campaignName)}</span>`:''}
              ${v.storeId?`· ${_storeChip(v.storeId)}`:''}
            </div>
            <div style="display:flex;gap:5px;margin-top:6px;flex-wrap:wrap;align-items:center">
              <span class="${v.collab==='Paid'?'collab-paid':'collab-credit'}">${v.collab==='Paid'?'💰':'🏪'} ${v.collab} · $${(v.fee||0).toLocaleString()}</span>
              ${v.pub?`<span style="font-size:10px;color:var(--text-tertiary)">📅 ${v.pub}</span>`:''}
              ${v.shoot?`<span style="font-size:10px;color:var(--text-tertiary)">📸 Shot ${v.shoot}</span>`:''}
              ${v.url?`<a href="${v.url}" target="_blank" style="font-size:10px;color:var(--info)">→ View</a>`:''}
            </div>
            ${v.notes?`<div style="font-size:11px;color:var(--text-tertiary);margin-top:5px">${_esc(v.notes)}</div>`:''}
          </div>
          <div style="display:flex;gap:4px;flex-shrink:0">
            <button class="inf-btn-xs" onclick="openEditVideo(${v.id})">Edit</button>
            <button class="inf-btn-xs inf-btn-del" onclick="deleteVideo(${v.id})">✕</button>
          </div>
        </div>
        <div class="inf-vid-metrics">
          <div class="inf-vm"><div class="inf-vm-val">${_fmtN(v.views)}</div><div class="inf-vm-lbl">Views</div></div>
          <div class="inf-vm"><div class="inf-vm-val">${_fmtN(v.likes)}</div><div class="inf-vm-lbl">Likes</div></div>
          <div class="inf-vm"><div class="inf-vm-val">${_fmtN(v.comments)}</div><div class="inf-vm-lbl">Comments</div></div>
          <div class="inf-vm"><div class="inf-vm-val">${er}</div><div class="inf-vm-lbl">Like Rate</div></div>
        </div>
      </div>`;
    }).join(''):`<div class="inf-empty"><div class="inf-empty-icon">🎬</div>No videos yet. Add your first video to start tracking performance.</div>`}`;
}

// ══════════════════════════════════════
// STORE CREDITS PANEL
// ══════════════════════════════════════
function _renderCredPanel(){
  const panel=document.getElementById('inf-panel-credits');
  if(!panel)return;
  let creds=[...BM_CREDITS];
  if(_credF.inf)creds=creds.filter(c=>c.infId===parseInt(_credF.inf));
  if(_credF.store)creds=creds.filter(c=>c.storeId===parseInt(_credF.store));
  if(_credF.status)creds=creds.filter(c=>c.status===_credF.status);
  creds.sort((a,b)=>new Date(b.issued||0)-new Date(a.issued||0));
  const totalVal=creds.reduce((a,c)=>a+(c.amount||0),0);
  const unusedVal=creds.filter(c=>c.status==='Unused').reduce((a,c)=>a+(c.amount||0),0);
  const infOpts=BM_INFS.map(i=>`<option value="${i.id}" ${_credF.inf==i.id?'selected':''}>${i.name}</option>`).join('');
  const storeOpts=(typeof STORES!=='undefined'?STORES:[]).map(s=>`<option value="${s.id}" ${_credF.store==s.id?'selected':''}>${s.name}</option>`).join('');
  panel.innerHTML=`
    <div class="inf-fbar">
      <div class="inf-fg"><label>Influencer</label><select onchange="_credF.inf=this.value;_renderCredPanel()"><option value="">All</option>${infOpts}</select></div>
      <div class="inf-fg"><label>Store</label><select onchange="_credF.store=this.value;_renderCredPanel()"><option value="">All Stores</option>${storeOpts}</select></div>
      <div class="inf-fg"><label>Status</label><select onchange="_credF.status=this.value;_renderCredPanel()">
        <option value="">All</option>
        <option value="Unused" ${_credF.status==='Unused'?'selected':''}>Unused</option>
        <option value="Used" ${_credF.status==='Used'?'selected':''}>Used</option>
      </select></div>
      <div class="inf-fg" style="align-self:flex-end"><button class="inf-btn-g" onclick="_credF={inf:'',store:'',status:''};_renderCredPanel()">Clear</button></div>
    </div>
    <div class="inf-stats-strip" style="margin-bottom:14px">
      <div class="inf-sc"><div class="inf-sl">Total Credits</div><div class="inf-sv">${creds.length}</div></div>
      <div class="inf-sc"><div class="inf-sl">Unused</div><div class="inf-sv">${creds.filter(c=>c.status==='Unused').length}</div></div>
      <div class="inf-sc"><div class="inf-sl">Total Value</div><div class="inf-sv">$${totalVal.toLocaleString()}</div></div>
      <div class="inf-sc"><div class="inf-sl">Unused Value</div><div class="inf-sv">$${unusedVal.toLocaleString()}</div></div>
    </div>
    <div style="display:flex;justify-content:flex-end;margin-bottom:12px">
      <button class="inf-btn-p" onclick="openAddCredit()">+ Issue Credit</button>
    </div>
    <div class="card">
      <table class="inf-cred-tbl">
        <thead><tr><th>Serial #</th><th>Influencer</th><th>Store</th><th>Amount</th><th>Issued</th><th>Expires</th><th>Status</th><th></th></tr></thead>
        <tbody>${creds.length?creds.map(c=>`<tr>
          <td style="font-family:var(--font-mono);font-size:11px;font-weight:600">${_esc(c.serial)}</td>
          <td style="font-weight:500">${_esc(c.infName)}</td>
          <td>${c.storeId?_storeChip(c.storeId):'—'}</td>
          <td style="font-family:var(--font-mono);font-weight:600">$${(c.amount||0).toLocaleString()}</td>
          <td style="font-size:11px;color:var(--text-secondary)">${c.issued||'—'}</td>
          <td style="font-size:11px;color:var(--text-secondary)">${c.expiry||'—'}</td>
          <td><span class="${c.status==='Unused'?'cred-unused':'cred-used'}">${c.status}</span></td>
          <td style="white-space:nowrap">
            <button class="inf-btn-xs" onclick="toggleCreditStatus(${c.id})">${c.status==='Unused'?'Mark Used':'Undo'}</button>
            <button class="inf-btn-xs inf-btn-del" onclick="deleteCreditGlobal(${c.id})" style="margin-left:3px">✕</button>
          </td>
        </tr>`).join(''):`<tr><td colspan="8" style="text-align:center;padding:28px;color:var(--text-tertiary)">No credits found</td></tr>`}</tbody>
      </table>
    </div>`;
}

// ══════════════════════════════════════
// INFLUENCER CRUD
// ══════════════════════════════════════
function openAddInf(){
  _infDupIgnoreAll=false;
  _populateInfModal(null);
  document.getElementById('inf-mo-inf-title').textContent='Add Influencer';
  document.getElementById('inf-mo-inf-editid').value='';
  document.getElementById('inf-mo-inf').classList.add('open');
  _attachDupListeners();
}
function openEditInf(id){
  const inf=BM_INFS.find(i=>i.id===id);
  if(!inf)return;
  _infDupIgnoreAll=false;
  _populateInfModal(inf);
  document.getElementById('inf-mo-inf-title').textContent='Edit Influencer';
  document.getElementById('inf-mo-inf-editid').value=id;
  document.getElementById('inf-mo-inf').classList.add('open');
  _attachDupListeners();
}
function _attachDupListeners(){
  // Handle field — direct listener (replaces onblur HTML attribute)
  const handleEl=document.getElementById('inf-mo-handle');
  if(handleEl){
    handleEl.removeEventListener('blur',_onHandleBlur);
    handleEl.addEventListener('blur',_onHandleBlur);
  }
  // Links list — event delegation so dynamically-added rows are always covered
  const linksList=document.getElementById('inf-mo-links-list');
  if(linksList){
    linksList.removeEventListener('blur',_onLinksBlur,true);
    linksList.addEventListener('blur',_onLinksBlur,true);
  }
}
function _onHandleBlur(e){
  if(_infDupIgnoreAll)return;
  const skipId=parseInt(document.getElementById('inf-mo-inf-editid')?.value)||null;
  _infDupWarn(e.target,_findDupInf('handle',e.target.value,skipId));
}
function _onLinksBlur(e){
  if(!e.target.classList.contains('inf-link-input'))return;
  if(_infDupIgnoreAll)return;
  const skipId=parseInt(document.getElementById('inf-mo-inf-editid')?.value)||null;
  _infDupWarn(e.target,_findDupInf('url',e.target.value,skipId));
}
function _populateInfModal(inf){
  const m=document.getElementById('inf-mo-inf');
  if(!m)return;
  // Store rows grouped by state
  const _allStores=typeof STORES!=='undefined'?STORES:[];
  const storeHTML=['FL','GA'].map(state=>{
    const group=_allStores.filter(st=>st.state===state);
    if(!group.length)return'';
    const items=group.map(st=>`<label class="inf-ck-store"><input type="checkbox" value="${st.id}" name="inf-mo-store" ${inf&&(inf.storeIds||[]).includes(st.id)?'checked':''}> ${st.name}</label>`).join('');
    return`<div class="inf-store-group"><div class="inf-store-group-lbl">${state} Stores</div><div class="inf-store-inline">${items}</div></div>`;
  }).join('');
  // Reset photo
  const prev=document.getElementById('inf-mo-photo-prev');
  const icon=document.getElementById('inf-mo-photo-icon');
  if(prev){prev.style.display='none';prev.src='';}
  if(icon)icon.style.display='block';
  const pdEl=document.getElementById('inf-mo-photo-data');
  const puEl=document.getElementById('inf-mo-photo-url');
  if(pdEl)pdEl.value='';
  if(puEl)puEl.value=inf?.photoUrl||'';
  if(inf&&(inf.photoUrl||inf.photoData)){
    const src=inf.photoUrl||inf.photoData;
    if(prev){prev.src=src;prev.style.display='block';}
    if(icon)icon.style.display='none';
    if(pdEl)pdEl.value=inf.photoData||'';
  }
  // Basic fields
  const fv=(id,v)=>{const el=document.getElementById(id);if(el)el.value=v||''};
  fv('inf-mo-name',inf?.name);
  fv('inf-mo-handle',inf?.igHandle||inf?.ttHandle);
  fv('inf-mo-followers',inf?.followers);
  const fsel=(id,v)=>{const el=document.getElementById(id);if(el)el.value=v||''};
  fsel('inf-mo-eth',inf?.ethnicity);
  fsel('inf-mo-status',inf?.status||'Prospect');
  // Platforms
  document.querySelectorAll('[name="inf-mo-plat"]').forEach(c=>c.checked=inf?(inf.platforms||[]).includes(c.value):false);
  // Links: prefer inf.links array, fall back to legacy igUrl/ttUrl/ytUrl fields
  const links=inf?.links?.length?inf.links:[inf?.igUrl,inf?.ttUrl,inf?.ytUrl].filter(Boolean);
  const list=document.getElementById('inf-mo-links-list');
  if(list){
    list.innerHTML='';
    const firstRow=document.createElement('div');
    firstRow.className='inf-link-row';
    firstRow.innerHTML=`<input class="inf-link-input" type="url" placeholder="https://instagram.com/… *" value="${_esc(links[0]||'')}">`;
    list.appendChild(firstRow);
    links.slice(1).forEach(url=>infAddLinkRow(url));
  }
  // Stores
  const sl=document.getElementById('inf-mo-store-list');
  if(sl)sl.innerHTML=storeHTML;
  // Tags
  infTagPickerInit(inf?.campaignTypes||[]);
  // Notes
  const notesEl=document.getElementById('inf-mo-notes');
  if(notesEl)notesEl.value=inf?.notes||'';
}
function infAddLinkRow(value){
  const list=document.getElementById('inf-mo-links-list');
  if(!list)return;
  const row=document.createElement('div');
  row.className='inf-link-row';
  row.innerHTML=`<input class="inf-link-input" type="url" placeholder="https://…" value="${_esc(value||'')}"><button type="button" class="inf-link-remove" onclick="this.closest('.inf-link-row').remove()" title="Remove">✕</button>`;
  list.appendChild(row);
}
// ── Tag picker ──
function infTagFieldClick(e){
  e.stopPropagation();
  document.getElementById('inf-tag-dropdown')?.classList.add('open');
  document.getElementById('inf-tag-search')?.focus();
}
function infTagPickerFilter(q){
  document.getElementById('inf-tag-dropdown')?.classList.add('open');
  _infTagRenderList(q);
}
function infTagPickerKeydown(e){
  const si=e.target;
  if(e.key==='Enter'){
    e.preventDefault();
    const q=si.value.trim();if(!q)return;
    const all=[..._INF_DEFAULT_TAGS,..._infTagExtra];
    const match=all.find(t=>t.toLowerCase()===q.toLowerCase());
    if(match)infTagSelect(match);else infTagCreateNew(q);
    si.value='';_infTagRenderList('');
  }else if(e.key==='Escape'){
    infTagPickerClose();
  }else if(e.key==='Backspace'&&!si.value&&_infTagSel.length){
    _infTagSel.pop();_infTagRenderChips();_infTagRenderList('');
  }
}
function infTagSelect(tag){
  const i=_infTagSel.indexOf(tag);
  if(i===-1)_infTagSel.push(tag);else _infTagSel.splice(i,1);
  _infTagRenderChips();
  _infTagRenderList(document.getElementById('inf-tag-search')?.value||'');
}
function infTagOptClick(el){infTagSelect(el.dataset.tag);}
function infTagAddOptClick(el){
  infTagCreateNew(el.dataset.tag);
  const si=document.getElementById('inf-tag-search');
  if(si)si.value='';
  _infTagRenderList('');
}
function infTagRemoveBtn(btn){
  _infTagSel=_infTagSel.filter(t=>t!==btn.dataset.tag);
  _infTagRenderChips();
}
function infTagCreateNew(tag){
  const t=tag.trim();if(!t)return;
  const all=[..._INF_DEFAULT_TAGS,..._infTagExtra];
  if(!all.find(x=>x.toLowerCase()===t.toLowerCase()))_infTagExtra.push(t);
  if(!_infTagSel.find(x=>x.toLowerCase()===t.toLowerCase()))_infTagSel.push(t);
  _infTagRenderChips();_infTagRenderList('');
}
function infTagPickerClose(){
  document.getElementById('inf-tag-dropdown')?.classList.remove('open');
}
function infTagPickerInit(selected){
  _infTagSel=[...(selected||[])];
  _infTagSel.forEach(t=>{
    const all=[..._INF_DEFAULT_TAGS,..._infTagExtra];
    if(!all.find(x=>x.toLowerCase()===t.toLowerCase()))_infTagExtra.push(t);
  });
  _infTagRenderChips();_infTagRenderList('');
  document.getElementById('inf-tag-dropdown')?.classList.remove('open');
  const si=document.getElementById('inf-tag-search');
  if(si)si.value='';
}
function _infTagRenderChips(){
  const el=document.getElementById('inf-tag-chips');
  if(!el)return;
  el.innerHTML=_infTagSel.map(t=>`<span class="inf-tag-chip-sel">${_esc(t)}<button type="button" class="inf-tag-chip-sel-rm" data-tag="${_esc(t)}" onclick="infTagRemoveBtn(this)" tabindex="-1">×</button></span>`).join('');
}
function _infTagRenderList(q){
  const el=document.getElementById('inf-tag-list');if(!el)return;
  const ql=q.toLowerCase();
  const all=[..._INF_DEFAULT_TAGS,..._infTagExtra];
  const filtered=ql?all.filter(t=>t.toLowerCase().includes(ql)):all;
  const exactMatch=all.find(t=>t.toLowerCase()===ql);
  let html=filtered.map(t=>{
    const sel=_infTagSel.includes(t);
    return`<div class="inf-tag-opt${sel?' selected':''}" data-tag="${_esc(t)}" onclick="infTagOptClick(this)">${_esc(t)}${sel?'<span class="inf-tag-opt-check">✓</span>':''}</div>`;
  }).join('');
  if(q&&!exactMatch)html+=`<div class="inf-tag-opt inf-tag-opt-add" data-tag="${_esc(q)}" onclick="infTagAddOptClick(this)">+ Add "<strong>${_esc(q)}</strong>"</div>`;
  el.innerHTML=html||`<div style="padding:8px;font-size:11px;color:var(--text-tertiary)">No tags found</div>`;
}
function saveInf(){
  const name=document.getElementById('inf-mo-name')?.value.trim();
  if(!name){alert('Name is required');return;}
  const links=[...document.querySelectorAll('#inf-mo-links-list .inf-link-input')]
    .map(i=>i.value.trim()).filter(Boolean);
  if(!links.length){alert('At least one link is required');return;}
  if(!_infDupIgnoreAll){
    const skipId=parseInt(document.getElementById('inf-mo-inf-editid')?.value)||null;
    let dupFound=false;
    const handleEl=document.getElementById('inf-mo-handle');
    const handleDup=_findDupInf('handle',handleEl?.value||'',skipId);
    if(handleDup){_infDupWarn(handleEl,handleDup);dupFound=true;}
    document.querySelectorAll('#inf-mo-links-list .inf-link-input').forEach(el=>{
      const dup=_findDupInf('url',el.value,skipId);
      if(dup){_infDupWarn(el,dup);dupFound=true;}
    });
    if(dupFound)return;
  }
  const platforms=[...document.querySelectorAll('[name="inf-mo-plat"]:checked')].map(c=>c.value);
  const storeIds=[...document.querySelectorAll('[name="inf-mo-store"]:checked')].map(c=>parseInt(c.value));
  const photoUrl=document.getElementById('inf-mo-photo-url')?.value.trim()||'';
  const photoData=photoUrl?'':(document.getElementById('inf-mo-photo-data')?.value||'');
  const v=id=>document.getElementById(id)?.value||'';
  const inf={
    name,
    igHandle:v('inf-mo-handle'), ttHandle:'',
    // Populate legacy URL fields from links for backward compat (drawer, table, etc.)
    igUrl:links[0]||'', ttUrl:links[1]||'', ytUrl:links[2]||'',
    links,
    email:'', loc:'',
    ethnicity:v('inf-mo-eth'), category:'Beauty', status:v('inf-mo-status')||'Prospect',
    followers:parseInt(v('inf-mo-followers'))||0, eng:0, fee:0,
    notes:document.getElementById('inf-mo-notes')?.value.trim()||'',
    platforms:platforms.length?platforms:['IG'], storeIds, campaignTypes:[..._infTagSel],
    photoUrl, photoData
  };
  const eid=document.getElementById('inf-mo-inf-editid')?.value;
  if(eid){const idx=BM_INFS.findIndex(i=>i.id==eid);inf.id=parseInt(eid);BM_INFS[idx]=inf;}
  else{inf.id=Date.now();BM_INFS.push(inf);}
  _saveInf();
  document.getElementById('inf-mo-inf').classList.remove('open');
  _renderInfPanel();
}
function deleteInf(id){
  if(!confirm('Remove this influencer? Their visits, credits and videos will remain.'))return;
  BM_INFS=BM_INFS.filter(i=>i.id!==id);_saveInf();_renderInfPanel();
}

// ── Duplicate detection ──
function _normHandle(s){return(s||'').trim().toLowerCase().replace(/^@+/,'');}
function _normUrl(s){
  return(s||'').trim().toLowerCase()
    .replace(/^https?:\/\//,'').replace(/^www\./,'').replace(/\/+$/,'');
}
function _findDupInf(type,val,skipId){
  const norm=type==='handle'?_normHandle(val):_normUrl(val);
  if(!norm)return null;
  return BM_INFS.find(inf=>{
    if(skipId&&inf.id===skipId)return false;
    if(type==='handle')
      return[inf.igHandle,inf.ttHandle].some(h=>h&&_normHandle(h)===norm);
    return[...(inf.links||[]),inf.igUrl,inf.ttUrl,inf.ytUrl]
      .filter(Boolean).some(u=>_normUrl(u)===norm);
  })||null;
}
function _infDupWarn(inputEl,inf){
  const container=inputEl.closest('.inf-link-row,.inf-fg2');
  if(!container)return;
  container.querySelectorAll('.inf-dup-warn').forEach(w=>w.remove());
  inputEl.classList.remove('inf-dup-field');
  if(!inf)return;
  inputEl.classList.add('inf-dup-field');
  const warn=document.createElement('div');
  warn.className='inf-dup-warn';
  warn.innerHTML=`⚠ Already in <strong>${_esc(inf.name)}</strong>`+
    `<span class="inf-dup-acts">`+
    `<button type="button" class="inf-dup-btn-mod" data-id="${inf.id}" onclick="infDupModify(this.dataset.id)">Modify Existing</button>`+
    `<button type="button" class="inf-dup-btn-ign" onclick="infDupIgnoreBtn()">Add Anyway</button>`+
    `</span>`;
  container.appendChild(warn);
}
function _infClearAllDupWarns(){
  document.querySelectorAll('#inf-mo-inf .inf-dup-warn').forEach(w=>w.remove());
  document.querySelectorAll('#inf-mo-inf .inf-dup-field').forEach(f=>f.classList.remove('inf-dup-field'));
}
function infDupModify(id){
  document.getElementById('inf-mo-inf').classList.remove('open');
  openEditInf(parseInt(id));
}
function infDupIgnoreBtn(){
  _infDupIgnoreAll=true;
  _infClearAllDupWarns();
}

// Photo handling
function infPhotoUpload(e){
  const f=e.target.files[0];if(!f)return;
  const r=new FileReader();
  r.onload=ev=>{
    document.getElementById('inf-mo-photo-data').value=ev.target.result;
    const prev=document.getElementById('inf-mo-photo-prev');
    if(prev){prev.src=ev.target.result;prev.style.display='block';}
    const icon=document.getElementById('inf-mo-photo-icon');if(icon)icon.style.display='none';
  };r.readAsDataURL(f);e.target.value='';
}
function infPhotoUrlChange(){
  const url=document.getElementById('inf-mo-photo-url')?.value.trim();
  const prev=document.getElementById('inf-mo-photo-prev');
  const icon=document.getElementById('inf-mo-photo-icon');
  const txt=document.getElementById('inf-mo-photo-txt');
  if(url&&prev){prev.src=url;prev.style.display='block';if(icon)icon.style.display='none';if(txt)txt.textContent='Or upload';}
  else if(prev){prev.style.display='none';prev.src='';if(icon)icon.style.display='block';if(txt)txt.textContent='Upload photo';}
}

// ══════════════════════════════════════
// CREDIT CRUD
// ══════════════════════════════════════
function openAddCredit(){_openCreditModal(null,null);}
function openAddCreditFor(infId){_openCreditModal(infId,null);}
function _openCreditModal(infId,cred){
  const infOpts=BM_INFS.map(i=>`<option value="${i.id}" ${infId===i.id?'selected':''}>${i.name}</option>`).join('');
  const storeOpts=`<option value="">— select —</option>`+(typeof STORES!=='undefined'?STORES:[]).map(s=>`<option value="${s.id}">${s.name} (${s.state})</option>`).join('');
  document.getElementById('inf-mo-cred-inf').innerHTML=infOpts;
  document.getElementById('inf-mo-cred-store').innerHTML=storeOpts;
  document.getElementById('inf-mo-cred-editid').value=cred?cred.id:'';
  document.getElementById('inf-mo-cred-title').textContent=cred?'Edit Credit':'Issue Store Credit';
  document.getElementById('inf-mo-cred-serial').value=cred?cred.serial:'';
  document.getElementById('inf-mo-cred-amount').value=cred?cred.amount:'';
  document.getElementById('inf-mo-cred-issued').value=cred?cred.issued:new Date().toISOString().split('T')[0];
  document.getElementById('inf-mo-cred-expiry').value=cred?cred.expiry:'';
  document.getElementById('inf-mo-cred-status').value=cred?cred.status:'Unused';
  if(infId)document.getElementById('inf-mo-cred-inf').value=infId;
  if(cred&&cred.storeId)document.getElementById('inf-mo-cred-store').value=cred.storeId;
  document.getElementById('inf-mo-cred').classList.add('open');
}
function saveCredit(){
  const serial=document.getElementById('inf-mo-cred-serial')?.value.trim();
  if(!serial){alert('Serial number is required');return;}
  const infId=parseInt(document.getElementById('inf-mo-cred-inf')?.value);
  const inf=BM_INFS.find(i=>i.id===infId);
  const storeId=parseInt(document.getElementById('inf-mo-cred-store')?.value)||null;
  const st=storeId&&typeof STORES!=='undefined'?STORES.find(s=>s.id===storeId):null;
  const cr={
    infId,infName:inf?inf.name:'Unknown',storeId,storeCode:st?st.name:'',
    serial,amount:parseInt(document.getElementById('inf-mo-cred-amount')?.value)||0,
    issued:document.getElementById('inf-mo-cred-issued')?.value||'',
    expiry:document.getElementById('inf-mo-cred-expiry')?.value||'',
    status:document.getElementById('inf-mo-cred-status')?.value||'Unused'
  };
  const eid=document.getElementById('inf-mo-cred-editid')?.value;
  if(eid){const idx=BM_CREDITS.findIndex(c=>c.id==eid);cr.id=parseInt(eid);BM_CREDITS[idx]=cr;}
  else{cr.id=Date.now();BM_CREDITS.push(cr);}
  _saveInf();
  document.getElementById('inf-mo-cred').classList.remove('open');
  if(_infDrawerId)openInfDrawer(_infDrawerId);
  else _renderCredPanel();
}
function toggleCreditStatus(id){const c=BM_CREDITS.find(x=>x.id===id);if(c){c.status=c.status==='Unused'?'Used':'Unused';_saveInf();_renderCredPanel();}}
function deleteCredit(id,infId){BM_CREDITS=BM_CREDITS.filter(c=>c.id!==id);_saveInf();if(infId)openInfDrawer(infId);}
function deleteCreditGlobal(id){if(!confirm('Delete this credit?'))return;BM_CREDITS=BM_CREDITS.filter(c=>c.id!==id);_saveInf();_renderCredPanel();}

// ══════════════════════════════════════
// VIDEO CRUD
// ══════════════════════════════════════
function openAddVideo(){_openVideoModal(null,null);}
function openEditVideo(id){_openVideoModal(null,BM_VIDEOS.find(v=>v.id===id));}
function _openVideoModal(infId,vid){
  const infOpts=BM_INFS.map(i=>`<option value="${i.id}" ${infId===i.id||(vid&&vid.infId===i.id)?'selected':''}>${i.name}</option>`).join('');
  const storeOpts=`<option value="">— none —</option>`+(typeof STORES!=='undefined'?STORES:[]).map(s=>`<option value="${s.id}" ${vid&&vid.storeId===s.id?'selected':''}>${s.name}</option>`).join('');
  document.getElementById('inf-mo-vid-inf').innerHTML=infOpts;
  document.getElementById('inf-mo-vid-store').innerHTML=storeOpts;
  document.getElementById('inf-mo-vid-editid').value=vid?vid.id:'';
  document.getElementById('inf-mo-vid-title-field').textContent=vid?'Edit Video':'Add Video Record';
  const fv=(id,v)=>{const el=document.getElementById(id);if(el)el.value=v||''};
  fv('inf-mo-vid-title',vid?.title);fv('inf-mo-vid-camp',vid?.campaignName);
  fv('inf-mo-vid-shoot',vid?.shoot);fv('inf-mo-vid-pub',vid?.pub);fv('inf-mo-vid-url',vid?.url);
  fv('inf-mo-vid-views',vid?.views||0);fv('inf-mo-vid-likes',vid?.likes||0);fv('inf-mo-vid-comments',vid?.comments||0);
  fv('inf-mo-vid-fee',vid?.fee||0);fv('inf-mo-vid-notes',vid?.notes);
  const fsel=(id,v)=>{const el=document.getElementById(id);if(el)el.value=v||''};
  fsel('inf-mo-vid-plat',vid?.platform||'Instagram Reel');
  fsel('inf-mo-vid-collab',vid?.collab||'Paid');
  document.getElementById('inf-mo-vid').classList.add('open');
}
function saveVideo(){
  const title=document.getElementById('inf-mo-vid-title')?.value.trim();
  if(!title){alert('Title required');return;}
  const infId=parseInt(document.getElementById('inf-mo-vid-inf')?.value);
  const inf=BM_INFS.find(i=>i.id===infId);
  const storeId=parseInt(document.getElementById('inf-mo-vid-store')?.value)||null;
  const st=storeId&&typeof STORES!=='undefined'?STORES.find(s=>s.id===storeId):null;
  const v=id=>document.getElementById(id)?.value||'';
  const vid={
    infId,infName:inf?inf.name:'Unknown',storeId,storeName:st?st.name:'',
    title,platform:v('inf-mo-vid-plat'),campaignName:v('inf-mo-vid-camp'),
    collab:v('inf-mo-vid-collab'),fee:parseInt(v('inf-mo-vid-fee'))||0,
    shoot:v('inf-mo-vid-shoot'),pub:v('inf-mo-vid-pub'),url:v('inf-mo-vid-url'),
    views:parseInt(v('inf-mo-vid-views'))||0,likes:parseInt(v('inf-mo-vid-likes'))||0,
    comments:parseInt(v('inf-mo-vid-comments'))||0,notes:v('inf-mo-vid-notes')
  };
  const eid=document.getElementById('inf-mo-vid-editid')?.value;
  if(eid){const idx=BM_VIDEOS.findIndex(x=>x.id==eid);vid.id=parseInt(eid);BM_VIDEOS[idx]=vid;}
  else{vid.id=Date.now();BM_VIDEOS.push(vid);}
  _saveInf();
  document.getElementById('inf-mo-vid').classList.remove('open');
  _renderVidPanel();
}
function deleteVideo(id){if(!confirm('Delete video record?'))return;BM_VIDEOS=BM_VIDEOS.filter(v=>v.id!==id);_saveInf();_renderVidPanel();}

// ══════════════════════════════════════
// INJECT HTML (modals + drawer)
// ══════════════════════════════════════
function _injectInfHTML(){
  const div=document.createElement('div');
  div.id='inf-injected';
  div.innerHTML=`
  <!-- Store Info floating reopen button -->
  <button class="inf-store-fab" id="inf-store-fab" onclick="infToggleSidePanel()">
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
    Store Info
  </button>

  <!-- Drawer overlay -->
  <div class="inf-drw-overlay" id="inf-drw-overlay" onclick="closeInfDrawer()"></div>
  <div class="inf-drw" id="inf-drw">
    <div class="inf-drw-head">
      <span class="inf-drw-head-title">Influencer Profile</span>
      <div style="display:flex;gap:6px">
        <button class="inf-btn-g" id="inf-drw-edit-btn">Edit</button>
        <button class="inf-btn-g" onclick="closeInfDrawer()">✕</button>
      </div>
    </div>
    <div class="inf-drw-body" id="inf-drw-body"></div>
  </div>

  <!-- Add/Edit Influencer -->
  <div class="inf-mo" id="inf-mo-inf" onclick="if(event.target===this)this.classList.remove('open')">
  <div class="inf-md" style="max-width:520px">
    <h2 id="inf-mo-inf-title">Add Influencer</h2>
    <input type="hidden" id="inf-mo-inf-editid">
    <input type="hidden" id="inf-mo-photo-data">
    <input type="hidden" id="inf-mo-photo-url">

    <!-- ── Section 1: Basic Info ── -->
    <div class="inf-form-section">
      <div class="inf-form-sec-lbl">Basic Info</div>

      <!-- Photo + Name / Handle -->
      <div style="display:flex;gap:14px;align-items:flex-start;margin-bottom:14px">
        <div style="display:flex;flex-direction:column;align-items:center;gap:12px;width:96px;flex-shrink:0">
          <div class="inf-photo-zone inf-photo-zone-sm" onclick="document.getElementById('inf-photo-file').click()">
            <input type="file" id="inf-photo-file" accept="image/*" style="display:none" onchange="infPhotoUpload(event)">
            <img id="inf-mo-photo-prev" class="inf-photo-preview">
            <span id="inf-mo-photo-icon" class="inf-photo-icon" style="font-size:24px">📷</span>
          </div>
          <button type="button" class="inf-btn-xs" style="width:100%;text-align:center" onclick="document.getElementById('inf-photo-file').click()">Edit</button>
        </div>
        <div style="flex:1;display:flex;flex-direction:column;gap:8px">
          <div class="inf-fg2" style="margin:0"><label>Full Name *</label><input id="inf-mo-name" placeholder="Sarah Kim"></div>
          <div class="inf-fg2" style="margin:0"><label>Social Handle</label><input id="inf-mo-handle" placeholder="@username"></div>
        </div>
      </div>

      <!-- Platforms -->
      <div class="inf-fg2" style="margin-bottom:12px">
        <label>Platforms</label>
        <div class="inf-plat-group">
          <label class="inf-plat-chip"><input type="checkbox" value="IG" name="inf-mo-plat">Instagram</label>
          <label class="inf-plat-chip"><input type="checkbox" value="TT" name="inf-mo-plat">TikTok</label>
          <label class="inf-plat-chip"><input type="checkbox" value="YT" name="inf-mo-plat">YouTube</label>
        </div>
      </div>

      <!-- Followers / Ethnicity / Status -->
      <div class="inf-fr3" style="gap:8px">
        <div class="inf-fg2" style="margin:0"><label>Followers</label><input id="inf-mo-followers" type="number" placeholder="50000" style="min-width:0"></div>
        <div class="inf-fg2" style="margin:0"><label>Ethnicity</label>
          <select id="inf-mo-eth" style="min-width:0">
            <option value="">— select —</option>
            <option value="Asian">Asian</option>
            <option value="Black">Black or African American</option>
            <option value="Hispanic">Hispanic or Latino</option>
            <option value="White">White</option>
            <option value="Native American">Native American or Indigenous</option>
            <option value="Pacific Islander">Native Hawaiian or Other Pacific Islander</option>
            <option value="Middle Eastern">Middle Eastern or North African</option>
            <option value="Mixed">Mixed / Multiracial</option>
            <option value="Other">Other</option>
            <option value="Prefer not to say">Prefer not to say</option>
          </select>
        </div>
        <div class="inf-fg2" style="margin:0"><label>Status</label>
          <select id="inf-mo-status" style="min-width:0">
            <option value="Prospect">Prospect</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      </div>
    </div>

    <!-- ── Section 2: Links ── -->
    <div class="inf-form-section">
      <div class="inf-form-sec-lbl">Links</div>
      <div id="inf-mo-links-list"></div>
      <button type="button" class="inf-add-link-btn" onclick="infAddLinkRow()">+ Add link</button>
    </div>

    <!-- ── Section 3: Content Tags ── -->
    <div class="inf-form-section">
      <div class="inf-form-sec-lbl">Content Tags</div>
      <div class="inf-tag-picker" id="inf-tag-picker">
        <div class="inf-tag-field" id="inf-tag-field" onclick="infTagFieldClick(event)">
          <div class="inf-tag-chips" id="inf-tag-chips"></div>
          <input class="inf-tag-search" id="inf-tag-search" placeholder="Search or add tag…" oninput="infTagPickerFilter(this.value)" onkeydown="infTagPickerKeydown(event)" onclick="event.stopPropagation()" autocomplete="off">
        </div>
        <div class="inf-tag-dropdown" id="inf-tag-dropdown">
          <div class="inf-tag-list" id="inf-tag-list"></div>
        </div>
      </div>
    </div>

    <!-- ── Section 4: Assigned Stores ── -->
    <div class="inf-form-section">
      <div class="inf-form-sec-lbl">Assigned Stores <span style="font-weight:400;text-transform:none;letter-spacing:0;font-size:10px;color:var(--text-tertiary)">(multi-select OK)</span></div>
      <div id="inf-mo-store-list"></div>
    </div>

    <!-- ── Notes ── -->
    <div class="inf-fg2" style="margin-bottom:0">
      <label>Notes</label>
      <textarea id="inf-mo-notes" placeholder="Notes about this influencer…" rows="2"></textarea>
    </div>

    <div class="inf-mact">
      <button class="inf-btn-g" onclick="document.getElementById('inf-mo-inf').classList.remove('open')">Cancel</button>
      <button class="inf-btn-p" onclick="saveInf()">Save</button>
    </div>
  </div></div>

  <!-- Issue Credit -->
  <div class="inf-mo" id="inf-mo-cred" onclick="if(event.target===this)this.classList.remove('open')">
  <div class="inf-md" style="max-width:460px">
    <h2 id="inf-mo-cred-title">Issue Store Credit</h2>
    <input type="hidden" id="inf-mo-cred-editid">
    <div class="inf-fr">
      <div class="inf-fg2"><label>Influencer</label><select id="inf-mo-cred-inf"></select></div>
      <div class="inf-fg2"><label>Store</label><select id="inf-mo-cred-store"></select></div>
    </div>
    <div class="inf-fr">
      <div class="inf-fg2"><label>Serial Number *</label><input id="inf-mo-cred-serial" placeholder="SC-2025-0001" style="font-family:var(--font-mono)"></div>
      <div class="inf-fg2"><label>Amount (USD)</label><input id="inf-mo-cred-amount" type="number" placeholder="500"></div>
    </div>
    <div class="inf-fr">
      <div class="inf-fg2"><label>Issue Date</label><input id="inf-mo-cred-issued" type="date"></div>
      <div class="inf-fg2"><label>Expiry Date</label><input id="inf-mo-cred-expiry" type="date"></div>
    </div>
    <div class="inf-fg2"><label>Status</label><select id="inf-mo-cred-status"><option value="Unused">Unused</option><option value="Used">Used</option></select></div>
    <div class="inf-mact">
      <button class="inf-btn-g" onclick="document.getElementById('inf-mo-cred').classList.remove('open')">Cancel</button>
      <button class="inf-btn-p" onclick="saveCredit()">Save Credit</button>
    </div>
  </div></div>

  <!-- Add/Edit Video -->
  <div class="inf-mo" id="inf-mo-vid" onclick="if(event.target===this)this.classList.remove('open')">
  <div class="inf-md" style="max-width:520px">
    <h2 id="inf-mo-vid-title-field">Add Video Record</h2>
    <input type="hidden" id="inf-mo-vid-editid">
    <div class="inf-fg2"><label>Title *</label><input id="inf-mo-vid-title" placeholder="Spring K-beauty Routine"></div>
    <div class="inf-fr">
      <div class="inf-fg2"><label>Influencer</label><select id="inf-mo-vid-inf"></select></div>
      <div class="inf-fg2"><label>Platform</label><select id="inf-mo-vid-plat">
        <option>Instagram Reel</option><option>TikTok</option><option>YouTube</option><option>YouTube Short</option>
      </select></div>
    </div>
    <div class="inf-fr">
      <div class="inf-fg2"><label>Campaign Name</label><input id="inf-mo-vid-camp" placeholder="(optional)"></div>
      <div class="inf-fg2"><label>Store</label><select id="inf-mo-vid-store"></select></div>
    </div>
    <div class="inf-fr">
      <div class="inf-fg2"><label>Collab Type</label><select id="inf-mo-vid-collab"><option value="Paid">Paid</option><option value="Store Credit">Store Credit</option></select></div>
      <div class="inf-fg2"><label>Fee / Credit Value (USD)</label><input id="inf-mo-vid-fee" type="number" placeholder="0"></div>
    </div>
    <div class="inf-fr">
      <div class="inf-fg2"><label>Shoot Date</label><input id="inf-mo-vid-shoot" type="date"></div>
      <div class="inf-fg2"><label>Publish Date</label><input id="inf-mo-vid-pub" type="date"></div>
    </div>
    <div class="inf-fg2"><label>Video URL</label><input id="inf-mo-vid-url" type="url" placeholder="https://…"></div>
    <div style="font-size:11px;font-weight:500;color:var(--text-secondary);margin-bottom:6px">Traffic Data</div>
    <div class="inf-fr3">
      <div class="inf-fg2"><label>Views</label><input id="inf-mo-vid-views" type="number" placeholder="0"></div>
      <div class="inf-fg2"><label>Likes</label><input id="inf-mo-vid-likes" type="number" placeholder="0"></div>
      <div class="inf-fg2"><label>Comments</label><input id="inf-mo-vid-comments" type="number" placeholder="0"></div>
    </div>
    <div class="inf-fg2"><label>Notes</label><textarea id="inf-mo-vid-notes" style="min-height:45px"></textarea></div>
    <div class="inf-mact">
      <button class="inf-btn-g" onclick="document.getElementById('inf-mo-vid').classList.remove('open')">Cancel</button>
      <button class="inf-btn-p" onclick="saveVideo()">Save Video</button>
    </div>
  </div></div>`;
  document.body.appendChild(div);
  document.addEventListener('click',function(e){
    if(!e.target.closest('#inf-tag-picker'))infTagPickerClose();
  });
}

// ══════════════════════════════════════
// HOOK INTO navTo
// ══════════════════════════════════════
(function(){
  const _orig=typeof navTo==='function'?navTo:null;
  window.navTo=function(id,el){
    if(_orig)_orig(id,el);
    if(id==='influencers'){
      renderInfluencerPage();
    } else {
      // Hide FAB when leaving the Influencers page
      const fab=document.getElementById('inf-store-fab');
      if(fab)fab.classList.remove('visible');
    }
  };
})();

// ══════════════════════════════════════
// INIT
// ══════════════════════════════════════
document.addEventListener('DOMContentLoaded',function(){
  _loadInf();
  _injectInfHTML();
});
