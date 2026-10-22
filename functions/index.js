// 관리자 접수 알림 — Firestore 문서가 새로 생기면 바로 텔레그램·이메일로 알린다 (2026-10-22)
//   inquiries/{id}      1:1 문의(board.html 이 브라우저에서 직접 만든다)
//   ai_coaching/{id}    코칭 피드백 요청(API manage-member submit-expert-question)
//   ai_interview/{id}   trackType 'sos' 만(API manage-member submit-sos)
// 저장 경로가 어디든 문서가 생기기만 하면 알림이 간다. 알림이 실패해도 저장은 이미 끝난 뒤라 영향이 없다.
// 반복 알림(2시간마다·09시 요약)은 API 저장소의 api/cron-reminders.js(Vercel Cron)가 한다.
const { onDocumentCreated } = require('firebase-functions/v2/firestore');
const { setGlobalOptions } = require('firebase-functions/v2');
const { defineSecret } = require('firebase-functions/params');
const admin = require('firebase-admin');
const { Timestamp } = require('firebase-admin/firestore');
const N = require('./notify');

admin.initializeApp();
const db = admin.firestore();

// Firestore(default) 가 asia-northeast3 — 트리거도 같은 리전
setGlobalOptions({ region: 'asia-northeast3', maxInstances: 3, memory: '256MiB', timeoutSeconds: 60 });

const TELEGRAM_BOT_TOKEN = defineSecret('TELEGRAM_BOT_TOKEN');
const TELEGRAM_ADMIN_CHAT_ID = defineSecret('TELEGRAM_ADMIN_CHAT_ID');

// 1:1 문의는 회원 브라우저가 바로 쓰므로 같은 회원이 1시간에 3건을 넘기면 하나씩 알리지 않고
// "몰아 쓰기" 알림 한 번만 보낸다. 넘친 문의도 반복 알림(2시간 뒤)에는 묶어서 들어간다.
const FLOOD_WINDOW_MS = 3600 * 1000;
const FLOOD_MAX = 3;

async function notifyNew(kind, event) {
  const snap = event.data;
  if (!snap) return;
  const id = event.params.id;
  const d = snap.data() || {};
  if (kind === 'sos' && d.trackType !== 'sos') return;
  if (!N.isOpen(kind, d)) return;

  const ref = snap.ref;
  const nowMs = Date.now();
  const nowTs = Timestamp.fromMillis(nowMs);
  const uid = N.uidOf(kind, d) || '';

  let claim;
  try {
    // 같은 이벤트가 두 번 와도(재전달) 한 번만 보낸다 — notifyCount 가 있으면 이미 보낸 것
    claim = await db.runTransaction(async (tx) => {
      const cur = await tx.get(ref);
      if (!cur.exists || (cur.data().notifyCount || 0) > 0) return null;
      let suppressed = false, floodCount = 0;
      if (kind === 'inquiry' && uid) {
        const tRef = db.collection('adminNotifyState').doc('throttle_' + uid);
        const t = await tx.get(tRef);
        const td = t.exists ? t.data() : {};
        const start = N.toMillis(td.windowStart);
        const inWindow = start != null && nowMs - start < FLOOD_WINDOW_MS;
        floodCount = (inWindow ? (td.count || 0) : 0) + 1;
        suppressed = floodCount > FLOOD_MAX;
        tx.set(tRef, { windowStart: inWindow ? td.windowStart : nowTs, count: floodCount, updatedAt: nowTs });
      }
      tx.update(ref, {
        notifyCount: 1, firstNotifiedAt: nowTs, lastNotifiedAt: nowTs,
        ...(suppressed ? { notifySuppressed: true } : {})
      });
      return { suppressed, floodCount };
    });
  } catch (e) {
    console.error(`[notify] ${kind}/${id} 알림 기록 실패:`, e.message);
    return;
  }
  if (!claim) return;

  const cfg = { db, token: TELEGRAM_BOT_TOKEN.value(), chatId: TELEGRAM_ADMIN_CHAT_ID.value(), telegramBase: process.env.TELEGRAM_API_BASE };
  try {
    let subject, text;
    if (claim.suppressed) {
      // 넘친 첫 건(4번째)에서만 한 번 알리고 그 뒤로는 조용히 쌓는다
      if (claim.floodCount !== FLOOD_MAX + 1) return;
      const nick = await N.nicknameOf(db, kind, d);
      subject = '1:1 문의 몰아 쓰기 감지';
      text = `⚠️ 1:1 문의 몰아 쓰기 감지\n닉네임: ${nick}\n1시간 안에 ${claim.floodCount}건 이상 접수 — 이후 건은 하나씩 알리지 않고 반복 알림에 묶어서 보냅니다.\n\n열기: ${N.SITE_BASE}/admin.html?tab=inquiries`;
    } else {
      subject = `${N.KINDS[kind].label} 새로 접수`;
      text = await N.formatItem(db, kind, id, d, nowMs);
    }
    const r = await N.sendAll(cfg, subject, text);
    await ref.update({ notifyLastResult: { telegram: r.telegram, email: r.email, at: nowTs } }).catch(() => {});
    console.log(`[notify] ${kind}/${id} 접수 알림 telegram=${r.telegram} email=${r.email}`);
  } catch (e) {
    console.error(`[notify] ${kind}/${id} 발송 오류:`, e.message);
  }
}

const opts = (document) => ({ document, secrets: [TELEGRAM_BOT_TOKEN, TELEGRAM_ADMIN_CHAT_ID], retry: false });
exports.notifyNewInquiry = onDocumentCreated(opts('inquiries/{id}'), e => notifyNew('inquiry', e));
exports.notifyNewCoaching = onDocumentCreated(opts('ai_coaching/{id}'), e => notifyNew('coaching', e));
exports.notifyNewSos = onDocumentCreated(opts('ai_interview/{id}'), e => notifyNew('sos', e));
