// ══════════════════════════════════════════
// SUPABASE AUTH — BeautyMaster Ops
// ══════════════════════════════════════════
// 1. Supabase 프로젝트를 생성하세요: https://supabase.com
// 2. 아래 값을 프로젝트 Settings > API 에서 복사해 주세요
// ══════════════════════════════════════════

const SUPABASE_URL      = 'https://rnzwuimzxydmhsdizyug.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_8vghQGAW4hfR7x3KV9qj6Q_kUq4MTTc'; // Publishable key (구 anon key)

// ── Client init ─────────────────────────────
const { createClient } = supabase; // from CDN (window.supabase)
const sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ── Auth mode state ──────────────────────────
let authMode = 'login'; // 'login' | 'signup'

// ── Show / hide app ──────────────────────────
function showApp(user) {
  document.getElementById('auth-overlay').style.display = 'none';
  document.body.classList.remove('auth-pending');
  const emailEl = document.getElementById('sb-user-email');
  if (emailEl) emailEl.textContent = user.email;
}

function showAuthOverlay() {
  document.getElementById('auth-overlay').style.display = 'flex';
  document.body.classList.add('auth-pending');
}

// ── Init ─────────────────────────────────────
async function initAuth() {
  // Check existing session
  const { data: { session } } = await sb.auth.getSession();
  if (session) {
    showApp(session.user);
  } else {
    showAuthOverlay();
  }

  // Listen for auth changes
  sb.auth.onAuthStateChange((_event, session) => {
    if (session) {
      showApp(session.user);
    } else {
      showAuthOverlay();
    }
  });
}

// ── Sign In ───────────────────────────────────
async function handleSignIn() {
  const email    = document.getElementById('auth-email').value.trim();
  const password = document.getElementById('auth-password').value;
  const errorEl  = document.getElementById('auth-error');
  const btn      = document.getElementById('auth-submit-btn');

  if (!email || !password) {
    setAuthError('이메일과 비밀번호를 입력해주세요.');
    return;
  }

  setAuthLoading(btn, '로그인 중...');
  errorEl.textContent = '';
  errorEl.className = 'auth-error';

  const { error } = await sb.auth.signInWithPassword({ email, password });

  if (error) {
    setAuthError(getKoreanError(error.message));
    resetAuthBtn(btn, '로그인');
  }
  // on success, onAuthStateChange fires → showApp()
}

// ── Sign Up ───────────────────────────────────
async function handleSignUp() {
  const email    = document.getElementById('auth-email').value.trim();
  const password = document.getElementById('auth-password').value;
  const errorEl  = document.getElementById('auth-error');
  const btn      = document.getElementById('auth-submit-btn');

  if (!email || !password) {
    setAuthError('이메일과 비밀번호를 입력해주세요.');
    return;
  }
  if (password.length < 6) {
    setAuthError('비밀번호는 6자 이상이어야 합니다.');
    return;
  }

  setAuthLoading(btn, '가입 중...');
  errorEl.textContent = '';
  errorEl.className = 'auth-error';

  const { error } = await sb.auth.signUp({ email, password });

  if (error) {
    setAuthError(getKoreanError(error.message));
    resetAuthBtn(btn, '회원가입');
  } else {
    errorEl.className = 'auth-error auth-success-msg';
    errorEl.textContent = '이메일을 확인하여 인증을 완료해주세요.';
    resetAuthBtn(btn, '회원가입');
  }
}

// ── Sign Out ──────────────────────────────────
async function handleSignOut() {
  await sb.auth.signOut();
}

// ── Toggle login ↔ signup ─────────────────────
function toggleAuthMode() {
  authMode = authMode === 'login' ? 'signup' : 'login';
  const isLogin = authMode === 'login';

  document.getElementById('auth-title').textContent       = isLogin ? '로그인' : '회원가입';
  document.getElementById('auth-submit-btn').textContent  = isLogin ? '로그인' : '회원가입';
  document.getElementById('auth-submit-btn').onclick      = isLogin ? handleSignIn : handleSignUp;
  document.getElementById('auth-toggle-text').textContent = isLogin ? '계정이 없으신가요?' : '이미 계정이 있으신가요?';
  document.getElementById('auth-toggle-link').textContent = isLogin ? '회원가입' : '로그인';
  document.getElementById('auth-password').autocomplete   = isLogin ? 'current-password' : 'new-password';

  const errorEl = document.getElementById('auth-error');
  errorEl.textContent = '';
  errorEl.className = 'auth-error';
}

// ── Helpers ───────────────────────────────────
function setAuthLoading(btn, text) {
  btn.disabled = true;
  btn.textContent = text;
}

function resetAuthBtn(btn, text) {
  btn.disabled = false;
  btn.textContent = text;
}

function setAuthError(msg) {
  const el = document.getElementById('auth-error');
  el.className = 'auth-error auth-error-visible';
  el.textContent = msg;
}

function getKoreanError(msg) {
  if (msg.includes('Invalid login credentials')) return '이메일 또는 비밀번호가 올바르지 않습니다.';
  if (msg.includes('Email not confirmed'))       return '이메일 인증이 필요합니다. 메일함을 확인해주세요.';
  if (msg.includes('User already registered'))   return '이미 가입된 이메일입니다.';
  if (msg.includes('Password should be'))        return '비밀번호는 6자 이상이어야 합니다.';
  if (msg.includes('Unable to validate'))        return 'Supabase 설정을 확인해주세요 (URL / Anon Key).';
  return msg;
}

// ── Enter key submit ──────────────────────────
function onAuthKeydown(e) {
  if (e.key === 'Enter') {
    authMode === 'login' ? handleSignIn() : handleSignUp();
  }
}

// ── Boot ──────────────────────────────────────
document.addEventListener('DOMContentLoaded', initAuth);
