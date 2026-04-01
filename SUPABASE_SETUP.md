# Supabase 인증 설정 가이드

## 1. Supabase 프로젝트 생성

1. [https://supabase.com](https://supabase.com) 접속 → 로그인 → **New Project** 클릭
2. 프로젝트 이름, 비밀번호, 리전(Northeast Asia — 도쿄 권장) 설정 후 생성

## 2. API 키 확인

프로젝트 생성 후 **Settings → API** 메뉴에서:

| 항목 | 위치 |
|------|------|
| `Project URL` | `https://xxxx.supabase.co` 형태 |
| `anon` (public key) | `eyJ...` 로 시작하는 긴 문자열 |

## 3. auth.js 에 키 입력

`auth.js` 파일 상단의 두 줄을 수정하세요:

```javascript
const SUPABASE_URL      = 'https://xxxxxxxxxxxx.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
```

## 4. 이메일 인증 설정 (선택)

- **Authentication → Providers → Email** 에서 **Confirm email** 비활성화 시 이메일 인증 없이 바로 로그인 가능
- 프로덕션 환경에서는 이메일 인증을 활성화하는 것을 권장

## 5. Allowed Redirect URLs (배포 시)

- **Authentication → URL Configuration** 에서 Site URL 및 Redirect URLs 설정 필요
- 로컬 개발: `http://localhost` 또는 `http://127.0.0.1:5500` 등 추가

## 동작 방식

```
페이지 로드
  └─ getSession() 호출
       ├─ 세션 있음 → 대시보드 표시 + 사이드바 이메일 업데이트
       └─ 세션 없음 → 로그인 오버레이 표시

로그인 성공
  └─ onAuthStateChange 이벤트 발생 → 오버레이 숨김 → 대시보드 표시

로그아웃
  └─ signOut() 호출 → onAuthStateChange 이벤트 발생 → 오버레이 재표시
```
