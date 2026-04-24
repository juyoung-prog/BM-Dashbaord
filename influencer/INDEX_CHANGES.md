# index.html 需要做的 3 個小改動

## 改動 1 — 在 `<head>` 加入 CSS
找到這行：
```html
<link rel="stylesheet" href="style2.css">
```
在它**後面**加上：
```html
<link rel="stylesheet" href="influencer.css">
```

---

## 改動 2 — 在 sidebar 加入導覽項目
找到這段（Store Locator 那個 sb-item 的結尾）：
```html
    <div class="sb-item" onclick="navTo('locator',this)">
      ...
      Store Locator
    </div>
    <div class="sb-section-label">System</div>
```
在 `<div class="sb-section-label">System</div>` **前面**加入：
```html
    <div class="sb-item" onclick="navTo('influencers',this)">
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>
      Influencers
    </div>
```

---

## 改動 3 — 加入新 page div + script
找到這段（locator page 的結尾 `</div>`，接著是 settings page）：
```html
    </div><!-- /locator page closing -->

    <!-- ══ PAGE: SETTINGS ══ -->
```
在這兩行**中間**插入：
```html
    <!-- ══ PAGE: INFLUENCERS ══ -->
    <div id="page-influencers" class="page">
      <div class="page-header">
        <div class="ph-title-group">
          <div class="ph-eyebrow">Marketing</div>
          <div class="ph-title">Influencer Hub</div>
          <div class="ph-subtitle">Manage partnerships across all 15 BeautyMaster locations</div>
        </div>
        <div id="inf-page-actions" style="display:flex;gap:8px;align-items:center"></div>
      </div>
      <div class="inf-tab-bar">
        <button class="inf-tab active" onclick="infSetTab('influencers',this)" id="inf-tab-influencers">Influencers</button>
        <button class="inf-tab" onclick="infSetTab('videos',this)" id="inf-tab-videos">Video Tracker</button>
        <button class="inf-tab" onclick="infSetTab('credits',this)" id="inf-tab-credits">Store Credits</button>
      </div>
      <div id="inf-panel-influencers"></div>
      <div id="inf-panel-videos" style="display:none"></div>
      <div id="inf-panel-credits" style="display:none"></div>
    </div>
```

그리고 `</body>` 바로 앞에 script 추가:
```html
<script src="influencer.js"></script>
```
(이미 `<script src="script2.js"></script>` 있는 줄 아래에 넣으면 됨)

---

## 完成！
把 `influencer.css` 和 `influencer.js` 放進 Codespace 同一個資料夾，然後完成以上 3 個改動，就大功告成了。
