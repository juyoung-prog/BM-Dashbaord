// ══════════════════════════════════════════
// SUPABASE AUTH — BeautyMaster Ops
// ══════════════════════════════════════════

const SUPABASE_URL      = 'https://rnzwuimzxydmhsdizyug.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_8vghQGAW4hfR7x3KV9qj6Q_kUq4MTTc'; // Publishable key (구 anon key)

// ── Admin allowlist (UI gate) ─────────────────────────────────────────────
// Controls who sees the "Invite User" button.
// The real security check is enforced server-side in the Edge Function.
// To add an admin: append their email to this array and redeploy.
const ADMIN_EMAILS = [
  'juyoung@beautymaster.com',
];

// ── Page detection ───────────────────────────
const IS_LOGIN_PAGE = window.location.pathname.endsWith('login.html');

// ── Invite flow detection ─────────────────────────────────────────────────
// Must be captured synchronously here, BEFORE createClient() starts its async
// URL processing. supabase-js v2 clears the URL after exchanging tokens, so
// by the time getSession() resolves the params are already gone.
//
// Two flows to cover:
//   Implicit flow (older projects): login.html#access_token=...&type=invite
//   PKCE flow    (newer projects):  login.html?code=xxx&type=invite
const _inviteHashType  = new URLSearchParams(window.location.hash.slice(1)).get('type');
const _inviteQueryType = new URLSearchParams(window.location.search).get('type');
const IS_INVITE_FLOW   = IS_LOGIN_PAGE &&
  (_inviteHashType === 'invite' || _inviteQueryType === 'invite');

// ── Client init ─────────────────────────────
const { createClient } = supabase; // from CDN (window.supabase)
const sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ── Init ─────────────────────────────────────
async function initAuth() {
  if (IS_LOGIN_PAGE) {
    if (IS_INVITE_FLOW) {
      // getSession() exchanges the hash tokens for a real session.
      // We captured IS_INVITE_FLOW above before the hash was cleared.
      const { data: { session } } = await sb.auth.getSession();
      if (session) {
        showSetPasswordView();
      } else {
        showMsg('초대 링크가 만료되었거나 유효하지 않습니다. 관리자에게 다시 요청해주세요.', 'error');
      }
      // Return without registering onAuthStateChange — the password form owns
      // the flow from here. Without this return, onAuthStateChange would fire
      // with the newly created session and redirect to index.html immediately.
      return;
    }

    const { data: { session } } = await sb.auth.getSession();
    if (session) {
      window.location.replace('index.html');
      return;
    }
  } else {
    // 대시보드 페이지 — 세션 없으면 로그인 페이지로
    const { data: { session } } = await sb.auth.getSession();
    if (!session) {
      window.location.replace('login.html');
      return;
    }
    showDashboard(session.user);
  }

  // 인증 상태 변화 감지 (invite flow는 위에서 return하므로 여기 도달 안 함)
  sb.auth.onAuthStateChange((_event, session) => {
    if (IS_LOGIN_PAGE) {
      if (session) window.location.replace('index.html');
    } else {
      if (!session) window.location.replace('login.html');
      else showDashboard(session.user);
    }
  });
}

// ── Dashboard: 인증 완료 후 표시 ─────────────
function showDashboard(user) {
  document.body.classList.remove('auth-pending');
  const emailEl = document.getElementById('sb-user-email');
  if (emailEl) emailEl.textContent = user.email;

  // Show invite button only for admin users
  const inviteBtn = document.getElementById('invite-user-btn');
  if (inviteBtn && ADMIN_EMAILS.includes(user.email)) {
    inviteBtn.style.display = '';
  }
}

// ── Sign In ───────────────────────────────────
async function handleSignIn() {
  const email    = document.getElementById('auth-email').value.trim();
  const password = document.getElementById('auth-password').value;

  if (!email || !password) { showMsg('이메일과 비밀번호를 입력해주세요.', 'error'); return; }

  const btn = document.getElementById('auth-submit-btn');
  setLoading(btn, '로그인 중...');
  clearMsg();

  const { error } = await sb.auth.signInWithPassword({ email, password });

  if (error) {
    showMsg(toKorean(error.message), 'error');
    resetBtn(btn, '로그인');
  }
  // 성공 시 onAuthStateChange → index.html 리다이렉트
}

// ── Sign Up ───────────────────────────────────
async function handleSignUp() {
  const email    = document.getElementById('auth-email').value.trim();
  const password = document.getElementById('auth-password').value;

  if (!email || !password) { showMsg('이메일과 비밀번호를 입력해주세요.', 'error'); return; }
  if (password.length < 6)  { showMsg('비밀번호는 6자 이상이어야 합니다.', 'error'); return; }

  const btn = document.getElementById('auth-submit-btn');
  setLoading(btn, '가입 중...');
  clearMsg();

  const { error } = await sb.auth.signUp({ email, password });

  if (error) {
    showMsg(toKorean(error.message), 'error');
    resetBtn(btn, '회원가입');
  } else {
    showMsg('이메일을 확인하여 인증을 완료해주세요.', 'success');
    resetBtn(btn, '회원가입');
  }
}

// ── Sign Out ──────────────────────────────────
async function handleSignOut() {
  await sb.auth.signOut();
  // onAuthStateChange → login.html 리다이렉트
}

// ── Toggle login ↔ signup ─────────────────────
function toggleAuthMode() {
  showMsg('계정이 필요하면 관리자에게 요청하세요.', 'error');
}

// ── Enter key ─────────────────────────────────
function onAuthKeydown(e) {
  if (e.key === 'Enter') handleSignIn();
}

// ── UI helpers ────────────────────────────────
function showMsg(text, type) {
  const el = document.getElementById('auth-msg');
  if (!el) return;
  el.textContent = text;
  el.className = `auth-msg ${type}`;
}
function clearMsg() {
  const el = document.getElementById('auth-msg');
  if (el) { el.textContent = ''; el.className = 'auth-msg'; }
}
function setLoading(btn, text) { btn.disabled = true;  btn.textContent = text; }
function resetBtn(btn, text)   { btn.disabled = false; btn.textContent = text; }

function toKorean(msg) {
  if (msg.includes('Invalid login credentials')) return '이메일 또는 비밀번호가 올바르지 않습니다.';
  if (msg.includes('Email not confirmed'))       return '이메일 인증이 필요합니다. 메일함을 확인해주세요.';
  if (msg.includes('User already registered'))   return '이미 가입된 이메일입니다.';
  if (msg.includes('Password should be'))        return '비밀번호는 6자 이상이어야 합니다.';
  if (msg.includes('Unable to validate'))        return 'Supabase 설정을 확인해주세요 (URL / Key).';
  return msg;
}

// ── Invite acceptance: set password ──────────────────────────────────────
function showSetPasswordView() {
  document.getElementById('login-section').style.display = 'none';
  document.getElementById('set-password-section').style.display = '';
  // Clean the hash from the URL so it isn't re-processed on refresh
  if (window.history.replaceState) {
    window.history.replaceState(null, '', window.location.pathname);
  }
}

async function handleSetPassword() {
  const pw    = document.getElementById('set-pw-input').value;
  const msgEl = document.getElementById('set-pw-msg');
  const btn   = document.getElementById('set-pw-btn');

  if (!pw || pw.length < 6) {
    msgEl.textContent = '비밀번호는 6자 이상이어야 합니다.';
    msgEl.className = 'auth-msg error';
    return;
  }

  btn.disabled    = true;
  btn.textContent = '처리 중...';
  msgEl.textContent = '';
  msgEl.className = 'auth-msg';

  const { error } = await sb.auth.updateUser({ password: pw });

  if (error) {
    msgEl.textContent = toKorean(error.message);
    msgEl.className = 'auth-msg error';
    btn.disabled    = false;
    btn.textContent = '비밀번호 설정';
  } else {
    msgEl.textContent = '비밀번호가 설정되었습니다. 대시보드로 이동합니다...';
    msgEl.className = 'auth-msg success';
    setTimeout(() => window.location.replace('index.html'), 1500);
  }
}

// ── Invite User (admin only) ──────────────────────────────────────────────
function openInviteModal() {
  const modal = document.getElementById('invite-modal');
  if (!modal) return;
  modal.style.display = 'flex';
  document.getElementById('invite-email').value = '';
  const msgEl = document.getElementById('invite-msg');
  msgEl.textContent = '';
  msgEl.className = 'invite-msg';
}

function closeInviteModal() {
  const modal = document.getElementById('invite-modal');
  if (modal) modal.style.display = 'none';
}

async function sendInvite() {
  const emailInput = document.getElementById('invite-email');
  const msgEl      = document.getElementById('invite-msg');
  const btn        = document.getElementById('invite-send-btn');
  const email      = emailInput.value.trim();

  if (!email) {
    msgEl.textContent = '이메일을 입력해주세요.';
    msgEl.className = 'invite-msg invite-error';
    return;
  }

  btn.disabled    = true;
  btn.textContent = '전송 중...';
  msgEl.textContent = '';
  msgEl.className = 'invite-msg';

  const { data: { session } } = await sb.auth.getSession();
  if (!session) {
    msgEl.textContent = '세션이 만료되었습니다. 다시 로그인해주세요.';
    msgEl.className = 'invite-msg invite-error';
    btn.disabled    = false;
    btn.textContent = '초대 전송';
    return;
  }

  try {
    const res  = await fetch(`${SUPABASE_URL}/functions/v1/invite-user`, {
      method: 'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();

    if (!res.ok) {
      msgEl.textContent = data.error || '초대 전송에 실패했습니다.';
      msgEl.className = 'invite-msg invite-error';
    } else {
      msgEl.textContent = `✓ ${email} 으로 초대가 전송되었습니다.`;
      msgEl.className = 'invite-msg invite-success';
      emailInput.value = '';
    }
  } catch (err) {
    console.error('[invite-user] fetch failed:', err);
    msgEl.textContent = `네트워크 오류: ${err?.message ?? err}`;
    msgEl.className = 'invite-msg invite-error';
  }

  btn.disabled    = false;
  btn.textContent = '초대 전송';
}

// ── Boot ──────────────────────────────────────
document.addEventListener('DOMContentLoaded', initAuth);
