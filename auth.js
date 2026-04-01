// ══════════════════════════════════════════
// SUPABASE AUTH — BeautyMaster Ops
// ══════════════════════════════════════════

const SUPABASE_URL      = 'https://rnzwuimzxydmhsdizyug.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_8vghQGAW4hfR7x3KV9qj6Q_kUq4MTTc'; // Publishable key (구 anon key)

// ── Client init ─────────────────────────────
const { createClient } = supabase; // from CDN (window.supabase)
const sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ── Page detection ───────────────────────────
const IS_LOGIN_PAGE = window.location.pathname.endsWith('login.html');

// ── Init ─────────────────────────────────────
async function initAuth() {
  const { data: { session } } = await sb.auth.getSession();

  if (IS_LOGIN_PAGE) {
    // 이미 로그인된 상태면 대시보드로
    if (session) {
      window.location.replace('index.html');
      return;
    }
  } else {
    // 대시보드 페이지 — 세션 없으면 로그인 페이지로
    if (!session) {
      window.location.replace('login.html');
      return;
    }
    showDashboard(session.user);
  }

  // 인증 상태 변화 감지
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
let authMode = 'login';
function toggleAuthMode() {
  authMode = authMode === 'login' ? 'signup' : 'login';
  const isLogin = authMode === 'login';

  document.getElementById('auth-title').textContent       = isLogin ? '로그인'  : '회원가입';
  document.getElementById('auth-submit-btn').textContent  = isLogin ? '로그인'  : '회원가입';
  document.getElementById('auth-submit-btn').onclick      = isLogin ? handleSignIn : handleSignUp;
  document.getElementById('auth-toggle-text').textContent = isLogin ? '계정이 없으신가요?' : '이미 계정이 있으신가요?';
  document.getElementById('auth-toggle-link').textContent = isLogin ? '회원가입' : '로그인';
  document.getElementById('auth-password').autocomplete   = isLogin ? 'current-password' : 'new-password';
  clearMsg();
}

// ── Enter key ─────────────────────────────────
function onAuthKeydown(e) {
  if (e.key === 'Enter') authMode === 'login' ? handleSignIn() : handleSignUp();
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

// ── Boot ──────────────────────────────────────
document.addEventListener('DOMContentLoaded', initAuth);
