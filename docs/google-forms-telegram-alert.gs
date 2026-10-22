/**
 * 구글 폼 응답 → 텔레그램 관리자 알림 (THE STEPPER, 2026-10-22)
 *
 * contact.html 의 두 폼(📋 세미나 신청 / 🥋 회원 가입 문의)에 똑같이 붙인다.
 * 폼 편집 화면 ⋮ → "스크립트 편집기"(Apps Script)에 이 파일 내용을 그대로 붙여 넣는다.
 *
 * 봇 토큰과 chat_id 는 코드에 넣지 않는다 — Apps Script 프로젝트 설정 → 스크립트 속성에
 *   TELEGRAM_BOT_TOKEN      (봇 토큰)
 *   TELEGRAM_ADMIN_CHAT_ID  (관리자 chat_id)
 * 두 개를 직접 추가한다.
 *
 * 알림 내용: 폼 이름, 접수 시각(KST), 주요 응답 항목(질문당 120자까지).
 * 전화번호·이메일 같은 개인정보는 넣지 않는다 — 질문 제목이 SKIP_TITLE 에 걸리면 통째로 빼고,
 * 다른 답 속에 섞인 전화번호·이메일 모양도 가린다. 전체 응답은 폼 "응답" 탭에서 본다.
 * 구글 폼은 답변 상태가 없으므로 반복 알림 대상이 아니다(접수 때 한 번만).
 */

// 이 단어가 질문 제목에 들어가면 알림에서 뺀다(개인정보)
var SKIP_TITLE = /전화|연락처|휴대폰|핸드폰|폰번호|이메일|메일|e-?mail|phone|주소|생년월일|주민/i;
var ANSWER_MAX = 120;
var ITEM_MAX = 8;

function maskPii_(s) {
  return String(s || '')
    .replace(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g, '[이메일]')
    .replace(/(\+?82[-\s.]?)?0?1[016789][-\s.]?\d{3,4}[-\s.]?\d{4}/g, '[전화번호]')
    .replace(/\b0\d{1,2}[-\s.]\d{3,4}[-\s.]\d{4}\b/g, '[전화번호]');
}

function buildMessage_(form, response) {
  var when = Utilities.formatDate(response.getTimestamp(), 'Asia/Seoul', 'yyyy-MM-dd HH:mm');
  var lines = ['📝 구글 폼 새 응답', '폼: ' + form.getTitle(), '접수: ' + when + ' (KST)', ''];
  var n = 0;
  response.getItemResponses().forEach(function (ir) {
    if (n >= ITEM_MAX) return;
    var title = ir.getItem().getTitle();
    if (SKIP_TITLE.test(title)) return;
    var a = ir.getResponse();
    if (Array.isArray(a)) a = a.join(', ');
    a = maskPii_(String(a == null ? '' : a)).trim();
    if (!a) return;
    if (a.length > ANSWER_MAX) a = a.slice(0, ANSWER_MAX) + '…';
    lines.push('· ' + title + ': ' + a);
    n++;
  });
  lines.push('', '전체 응답: ' + form.getEditUrl().replace(/\/edit.*$/, '/edit#responses'));
  return lines.join('\n');
}

function sendTelegram_(text) {
  var props = PropertiesService.getScriptProperties();
  var token = props.getProperty('TELEGRAM_BOT_TOKEN');
  var chatId = props.getProperty('TELEGRAM_ADMIN_CHAT_ID');
  if (!token || !chatId) throw new Error('스크립트 속성 TELEGRAM_BOT_TOKEN / TELEGRAM_ADMIN_CHAT_ID 를 먼저 넣으세요.');
  var res = UrlFetchApp.fetch('https://api.telegram.org/bot' + token + '/sendMessage', {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify({ chat_id: chatId, text: text, disable_web_page_preview: true }),
    muteHttpExceptions: true
  });
  if (res.getResponseCode() !== 200) {
    // 응답 본문에 토큰이 들어가지는 않지만 혹시 몰라 가린다
    throw new Error('텔레그램 응답 ' + res.getResponseCode() + ': ' + res.getContentText().split(token).join('***').slice(0, 200));
  }
}

/** 폼 제출 트리거가 부르는 함수 */
function onFormSubmit(e) {
  try {
    var form = FormApp.getActiveForm();
    var response = (e && e.response) ? e.response : form.getResponses().pop();
    sendTelegram_(buildMessage_(form, response));
  } catch (err) {
    console.error('[폼 알림 실패] ' + err.message);   // 실행 기록(Executions)에 남는다. 폼 제출은 영향 없음
  }
}

/** 한 번만 실행: 이 폼에 "제출 시" 트리거를 단다(이미 있으면 다시 만들지 않음) */
function installTrigger() {
  var form = FormApp.getActiveForm();
  var exists = ScriptApp.getProjectTriggers().some(function (t) { return t.getHandlerFunction() === 'onFormSubmit'; });
  if (!exists) ScriptApp.newTrigger('onFormSubmit').forForm(form).onFormSubmit().create();
  console.log(exists ? '이미 트리거가 있습니다.' : '트리거를 만들었습니다: ' + form.getTitle());
}

/** 시험 발송: 가장 최근 응답으로 알림 한 번 보내 보기(응답이 하나도 없으면 안내만) */
function testNotify() {
  var form = FormApp.getActiveForm();
  var rs = form.getResponses();
  if (!rs.length) { sendTelegram_('📝 구글 폼 알림 연결 시험 — ' + form.getTitle() + ' (아직 응답 없음)'); return; }
  sendTelegram_('[시험] ' + buildMessage_(form, rs[rs.length - 1]));
}
