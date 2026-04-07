// ══════════════════════════════════════════
// SUPABASE AUTH — BeautyMaster Ops
// ══════════════════════════════════════════

const SUPABASE_URL      = 'https://rnzwuimzxydmhsdizyug.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_8vghQGAW4hfR7x3KV9qj6Q_kUq4MTTc'; // Publishable key

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
        showMsg('Invite link has expired or is invalid. Please request a new invite from your admin.', 'error');
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
    // Dashboard page — redirect to login if no session
    const { data: { session } } = await sb.auth.getSession();
    if (!session) {
      window.location.replace('login.html');
      return;
    }
    await showDashboard(session.user);
  }

  // Listen for auth state changes (invite flow returns early above)
  sb.auth.onAuthStateChange((_event, session) => {
    if (IS_LOGIN_PAGE) {
      if (session) window.location.replace('index.html');
    } else {
      if (!session) window.location.replace('login.html');
      else showDashboard(session.user);
    }
  });
}

// ── Dashboard: show after auth ─────────────
async function showDashboard(user) {
  document.body.classList.remove('auth-pending');
  const emailEl = document.getElementById('sb-user-email');
  if (emailEl) emailEl.textContent = user.email;

  // Show invite button only for admin users (checked against public.admins table)
  const inviteBtn = document.getElementById('invite-user-btn');
  if (inviteBtn) {
    const { data } = await sb.from('admins').select('email').eq('email', user.email).maybeSingle();
    if (data) inviteBtn.style.display = '';
  }
}

// ── Sign In ───────────────────────────────────
async function handleSignIn() {
  const email    = document.getElementById('auth-email').value.trim();
  const password = document.getElementById('auth-password').value;

  if (!email || !password) { showMsg('Please enter your email and password.', 'error'); return; }

  const btn = document.getElementById('auth-submit-btn');
  setLoading(btn, 'Signing in...');
  clearMsg();

  const { error } = await sb.auth.signInWithPassword({ email, password });

  if (error) {
    showMsg(toEnglish(error.message), 'error');
    resetBtn(btn, 'Sign In');
  }
  // On success onAuthStateChange redirects to index.html
}

// ── Sign Out ──────────────────────────────────
async function handleSignOut() {
  await sb.auth.signOut();
  // onAuthStateChange redirects to login.html
}

// ── Toggle login ↔ signup ─────────────────────
function toggleAuthMode() {
  showMsg('Account access is by invitation only. Please contact your admin.', 'error');
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

function toEnglish(msg) {
  if (msg.includes('Invalid login credentials')) return 'Incorrect email or password.';
  if (msg.includes('Email not confirmed'))       return 'Please verify your email before signing in.';
  if (msg.includes('User already registered'))   return 'An account with this email already exists.';
  if (msg.includes('Password should be'))        return 'Password must be at least 6 characters.';
  if (msg.includes('Unable to validate'))        return 'Authentication configuration error. Please contact your admin.';
  return 'Something went wrong. Please try again.';
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
    msgEl.textContent = 'Password must be at least 6 characters.';
    msgEl.className = 'auth-msg error';
    return;
  }

  btn.disabled    = true;
  btn.textContent = 'Saving...';
  msgEl.textContent = '';
  msgEl.className = 'auth-msg';

  const { error: pwError } = await sb.auth.updateUser({ password: pw });

  if (pwError) {
    msgEl.textContent = toEnglish(pwError.message);
    msgEl.className = 'auth-msg error';
    btn.disabled    = false;
    btn.textContent = 'Set Password';
    return;
  }

  // ── Invalidate the invitation token immediately (one-time use) ────────────
  // If the invitation is no longer valid (expired, already used, or missing),
  // revoke the session and block access.
  const { data: { session } } = await sb.auth.getSession();
  if (session) {
    try {
      const res = await fetch(`${SUPABASE_URL}/functions/v1/accept-invite`, {
        method: 'POST',
        headers: {
          'Content-Type':  'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
      });
      if (!res.ok) {
        const data = await res.json();
        // Revoke session — this invite was not valid
        await sb.auth.signOut();
        msgEl.textContent = data.error || '유효한 초대가 없습니다. 관리자에게 문의하세요.';
        msgEl.className = 'auth-msg error';
        btn.disabled    = false;
        btn.textContent = 'Set Password';
        return;
      }
    } catch (err) {
      console.error('[accept-invite] fetch failed:', err);
      // Non-blocking: network error should not prevent the user from proceeding
      // if they already have a valid session. Log and continue.
    }
  }

  msgEl.textContent = '비밀번호가 설정되었습니다. 대시보드로 이동합니다...';
  msgEl.className = 'auth-msg success';
  setTimeout(() => window.location.replace('index.html'), 1500);
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
    msgEl.textContent = 'Please enter an email address.';
    msgEl.className = 'invite-msg invite-error';
    return;
  }

  btn.disabled    = true;
  btn.textContent = 'Sending...';
  msgEl.textContent = '';
  msgEl.className = 'invite-msg';

  const { data: { session } } = await sb.auth.getSession();
  if (!session) {
    msgEl.textContent = 'Your session has expired. Please sign in again.';
    msgEl.className = 'invite-msg invite-error';
    btn.disabled    = false;
    btn.textContent = 'Send Invite';
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
      msgEl.textContent = data.error || 'Failed to send invite.';
      msgEl.className = 'invite-msg invite-error';
    } else {
      msgEl.textContent = `✓ Invite sent to ${email}.`;
      msgEl.className = 'invite-msg invite-success';
      emailInput.value = '';
    }
  } catch (err) {
    console.error('[invite-user] fetch failed:', err);
    msgEl.textContent = 'A network error occurred. Please try again.';
    msgEl.className = 'invite-msg invite-error';
  }

  btn.disabled    = false;
  btn.textContent = 'Send Invite';
}

// ── Boot ──────────────────────────────────────
document.addEventListener('DOMContentLoaded', initAuth);
