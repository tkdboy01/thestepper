// 관리자 알림 공용 모듈 (2026-10-22)
// ⚠ 같은 파일이 두 곳에 있다 — 사이트 저장소 functions/notify.js(Cloud Functions 접수 알림)와
//    API 저장소 api/_notify.js(Vercel Cron 반복 알림). 고칠 때는 둘 다 똑같이 고친다.
//
// 대상 요청 3종류
//   inquiry — inquiries            (board.html 1:1 문의, status 'pending' → 'answered')
//   coaching — ai_coaching         (코칭 피드백 요청, '대기중' → '검토대기' → '답변완료')
//   sos     — ai_interview(trackType 'sos')  ('대기중' → '답변완료')
//   form    — form_submissions         (구글 폼 세미나 신청·회원 도장 가입 문의, '접수' → '처리완료', 2026-10-23)
//             api/form-notify.js 가 저장 직후 바로 알린다. 신청자 이름·도장명 등은 알림에 넣되 연락처·주소는 넣지 않는다.
//
// 알림 상태는 각 요청 문서에 Admin SDK 로만 남긴다(회원 화면·규칙과 무관한 필드).
//   notifyCount     보낸 알림 횟수(접수 알림 = 1)
//   firstNotifiedAt / lastNotifiedAt
//   adminReadAt     관리자가 admin.html 에서 본문을 연 시각(manage-member mark-request-read)
//   answeredAt      답변 시각(옛 문서엔 없을 수 있다 — 그때는 status 로 판단)
//
// 채널: 텔레그램(1순위) + 이메일(Trigger Email 확장의 mail 컬렉션). 한 채널이 실패해도 다른 채널은 보낸다.
// 알림 본문에는 회원 이메일·전화번호를 넣지 않는다 — 닉네임만, 본문 미리보기에서도 이메일·전화번호 모양은 가린다.

const { FieldValue } = require('firebase-admin/firestore');

const ADMIN_MAIL_TO = 'tkdboykms0007@gmail.com';
const SITE_BASE = 'https://thestepper.co.kr';
const PREVIEW_MAX = 200;

const KINDS = {
  inquiry: { collection: 'inquiries', label: '💬 1:1 문의', tab: 'inquiries' },
  coaching: { collection: 'ai_coaching', label: '🎯 코칭 피드백 요청', tab: 'coaching' },
  sos: { collection: 'ai_interview', label: '🆘 SOS 동작 분석 요청', tab: 'coaching' },
  form: { collection: 'form_submissions', label: '📝 구글 폼 접수', tab: 'forms' }
};

// 폼 접수는 문서에 저장된 폼 이름(세미나 신청 / 회원 도장 가입 문의)으로 표시한다
function labelOf(kind, d) {
  if (kind === 'form' && d && d.formLabel) return `${d.formIcon || '📝'} ${d.formLabel}`;
  return KINDS[kind].label;
}

const COACHING_OPEN = ['대기중', '검토대기'];

// 아직 답변하지 않은 요청인가 — answeredAt 이 있으면 답변 완료, 없으면(옛 문서) status 로 판단
function isOpen(kind, d) {
  if (!d || d.answeredAt) return false;
  if (kind === 'inquiry') return d.status === 'pending';
  if (kind === 'coaching') return COACHING_OPEN.includes(d.status);
  if (kind === 'sos') return d.trackType === 'sos' && d.status === '대기중';
  if (kind === 'form') return d.status === '접수';
  return false;
}

function toMillis(t) {
  if (!t) return null;
  if (typeof t.toMillis === 'function') return t.toMillis();
  if (t instanceof Date) return t.getTime();
  if (typeof t === 'number') return t;
  if (typeof t._seconds === 'number') return t._seconds * 1000;
  return null;
}

// KST 시각 정보 — Date.now() 대신 테스트에서 시각을 넣을 수 있게 nowMs 를 받는다
function kstParts(ms) {
  const k = new Date(ms + 9 * 3600 * 1000);
  return {
    hour: k.getUTCHours(),
    date: k.toISOString().slice(0, 10),
    text: `${k.toISOString().slice(0, 10)} ${String(k.getUTCHours()).padStart(2, '0')}:${String(k.getUTCMinutes()).padStart(2, '0')}`
  };
}

// 회원이 본문에 적은 이메일·전화번호는 알림에 그대로 싣지 않는다
function maskPii(s) {
  return String(s || '')
    .replace(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g, '[이메일]')
    .replace(/(\+?82[-\s.]?)?0?1[016789][-\s.]?\d{3,4}[-\s.]?\d{4}/g, '[전화번호]')
    .replace(/\b0\d{1,2}[-\s.]\d{3,4}[-\s.]\d{4}\b/g, '[전화번호]');
}

function preview(kind, d) {
  let raw = '';
  if (kind === 'inquiry') raw = `${d.title || ''}\n${d.content || ''}`;
  else if (kind === 'coaching') raw = d.question || '';
  else if (kind === 'sos') raw = `[${d.chapter || ''}] ${d.question || ''}`;
  else if (kind === 'form') {
    // 연락처·도장 주소·희망 날짜 2·3순위는 admin.html 상세에서만
    const f = d.fields || {};
    if (d.formKind === 'seminar') raw = `소속 단체: ${f.org || '-'}
희망 날짜 1순위: ${f.date1 || '-'}`;
    else raw = `도장명: ${f.dojangName || '-'}
문의: ${f.message || ''}`;
  }
  const t = maskPii(raw.trim());
  return t.length > PREVIEW_MAX ? t.slice(0, PREVIEW_MAX) + '…' : t;
}

function adminLink(kind, id) {
  return `${SITE_BASE}/admin.html?tab=${KINDS[kind].tab}&kind=${kind}&id=${encodeURIComponent(id)}`;
}

function uidOf(kind, d) {
  return kind === 'inquiry' ? d.uid : d.userId;
}

// 닉네임 — users/{uid}.nickname, 없으면 문의에 적힌 닉네임, 그래도 없으면 '회원'. 이메일·본명은 쓰지 않는다.
async function nicknameOf(db, kind, d) {
  const uid = uidOf(kind, d);
  if (uid) {
    try {
      const u = await db.collection('users').doc(uid).get();
      const n = u.exists && u.data().nickname;
      if (n) return maskPii(String(n).slice(0, 40));
    } catch (_) {}
  }
  if (kind === 'inquiry' && d.nickname) return maskPii(String(d.nickname).slice(0, 40));
  if (kind === 'form') return maskPii(String((d.fields && d.fields.name) || '(이름 없음)').slice(0, 40));
  return '회원';
}

function elapsedHours(d, nowMs) {
  const c = toMillis(d.createdAt);
  return c == null ? null : Math.max(0, Math.floor((nowMs - c) / 3600000));
}

// 한 건짜리 알림 문구
//   opts.reminder = { count, hours } 이면 "N번째 알림, 접수 후 N시간 경과"
async function formatItem(db, kind, id, d, nowMs, opts = {}) {
  const nick = await nicknameOf(db, kind, d);
  const created = toMillis(d.createdAt);
  const lines = [];
  if (opts.reminder) {
    lines.push(`🔔 ${opts.reminder.count}번째 알림, 접수 후 ${opts.reminder.hours}시간 경과`);
  }
  lines.push(`${labelOf(kind, d)}${opts.reminder ? ' (아직 확인 안 함)' : ' 새로 접수'}`);
  lines.push(`${kind === 'form' ? '신청자' : '닉네임'}: ${nick}`);
  lines.push(`접수: ${created == null ? '-' : kstParts(created).text} (KST)`);
  const p = preview(kind, d);
  if (p) lines.push('', p);
  lines.push('', `열기: ${adminLink(kind, id)}`);
  return lines.join('\n');
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

// 채널 발송 — 텔레그램·이메일을 따로 시도하고 결과만 돌려준다(절대 throw 하지 않음)
//   cfg = { db, token, chatId, telegramBase?, mailTo?, log? }
async function sendAll(cfg, subject, text) {
  const log = cfg.log || console;
  const base = cfg.telegramBase || 'https://api.telegram.org';
  const out = { telegram: false, email: false, errors: [] };

  const tg = (async () => {
    if (!cfg.token || !cfg.chatId) throw new Error('텔레그램 설정 없음');
    // 텔레그램 한 메시지 최대 4096자
    const body = text.length > 4000 ? text.slice(0, 4000) + '\n…(생략)' : text;
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 10000);
    try {
      const r = await fetch(`${base}/bot${cfg.token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: cfg.chatId, text: body, disable_web_page_preview: true }),
        signal: ctrl.signal
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok || !j.ok) throw new Error(`텔레그램 응답 ${r.status} ${j.description || ''}`.trim());
    } finally { clearTimeout(timer); }
  })();

  const mail = (async () => {
    await cfg.db.collection('mail').add({
      to: cfg.mailTo || ADMIN_MAIL_TO,
      message: {
        subject: `[THE STEPPER 알림] ${subject}`,
        text,
        html: `<div style="font-family:sans-serif;white-space:pre-wrap;line-height:1.6">${escapeHtml(text)
          .replace(/(https:\/\/thestepper\.co\.kr\/admin\.html[^\s<]*)/g, '<a href="$1">$1</a>')}</div>`
      },
      createdAt: FieldValue.serverTimestamp(),
      source: 'admin-notify'
    });
  })();

  const [a, b] = await Promise.allSettled([tg, mail]);
  // 토큰이 오류 문구에 섞여 로그로 나가지 않게 가린다
  const clean = e => String((e && e.message) || e).split(cfg.token || '\u0000').join('***');
  if (a.status === 'fulfilled') out.telegram = true; else { out.errors.push('telegram: ' + clean(a.reason)); log.error('[notify] 텔레그램 실패:', clean(a.reason)); }
  if (b.status === 'fulfilled') out.email = true; else { out.errors.push('email: ' + clean(b.reason)); log.error('[notify] 이메일 실패:', clean(b.reason)); }
  return out;
}

module.exports = {
  ADMIN_MAIL_TO, SITE_BASE, KINDS, COACHING_OPEN, labelOf,
  isOpen, toMillis, kstParts, maskPii, preview, adminLink, uidOf, nicknameOf, elapsedHours,
  formatItem, sendAll, escapeHtml
};
