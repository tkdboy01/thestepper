/**
 * 구글 폼 → 관리자 알림 서버 전달 (THE STEPPER, 2026-10-23)
 *
 * 두 폼(세미나 신청 / 회원 도장 가입 문의)이 같은 코드를 쓴다. 폼 종류는 아래 FORM_KIND_BY_ID(폼 편집용 ID)로 구분.
 * 제출되면 응답 ID·제출 시각·전체 항목을 Vercel(api/form-notify)로 보내고, 서버가 Firestore 저장 + 텔레그램·이메일 알림.
 *
 * Script Properties(프로젝트 설정 → 스크립트 속성) — 코드에 넣지 않는다
 *   FORM_WEBHOOK_URL     https://thestepper-api.vercel.app/api/form-notify
 *   FORM_WEBHOOK_SECRET  Vercel 의 FORM_WEBHOOK_SECRET 과 같은 값
 *   CONSENT_ITEM_ID      (setup 이 자동 기록) 개인정보 수집·이용 동의 항목 ID
 *
 * 처음 한 번 setup() 을 실행한다 — 다시 실행해도 트리거·동의 항목이 중복 생기지 않는다.
 * 전달이 3번 모두 실패하면 관리자 메일로 "폼 알림 서버 전달 실패"를 보내 알림이 빠지지 않게 한다.
 */

var ADMIN_EMAIL = 'tkdboykms0007@gmail.com';

// 폼 편집용 ID(드라이브 파일 ID) → 종류. 2026-10-23 드라이브 조회(소유자 tkdboykms0007).
var FORM_KIND_BY_ID = {
  '1-e3Wk-u2SftcrNgC2IFTiKDYbH-m6CQOv5zjT4wtX5A': 'seminar',          // THE STEPPER 세미나 신청
  '157cvz3Eo0m5Iwo0BXfg9rduAj_9BGGdUQZmxaAKPL5E': 'dojang_inquiry'    // THE STEPPER 가맹 문의 신청서 → 회원 도장 가입 문의
};
// contact.html 에 삽입된 공개용 주소의 ID — setup 이 이 폼의 공개 주소와 같은지 확인하고, 다르면 아무것도 바꾸지 않고 멈춘다
var EXPECTED_PUBLIC_ID = {
  seminar: '1FAIpQLScPlDbKYTBfPS1uEqPDLHcH2nNl9F9iJs9pm83ZPis1Ab3hRg',
  dojang_inquiry: '1FAIpQLSfY7X686eifMm5sxTaR5kHqC7QfedE1aY6qHaDvcNSIj3F-Lw'
};

var FORM_CONFIG = {
  seminar: {
    label: '세미나 신청',
    title: null,   // 폼 제목은 바꾸지 않음
    consentHelp: [
      '수집 항목: 성함, 연락처, 소속 단체',
      '이용 목적: 세미나 신청 접수 및 일정 안내',
      '보유 기간: 처리 완료 후 1년',
      '동의를 거부할 수 있으나, 거부 시 신청 접수가 되지 않습니다.'
    ].join('\n')
  },
  dojang_inquiry: {
    label: '회원 도장 가입 문의',
    title: 'THE STEPPER 회원 도장 가입 문의',
    consentHelp: [
      '수집 항목: 성함, 연락처, 도장명, 도장 주소, 문의 내용',
      '이용 목적: 회원 도장 가입 상담',
      '보유 기간: 처리 완료 후 1년',
      '동의를 거부할 수 있으나, 거부 시 신청 접수가 되지 않습니다.'
    ].join('\n')
  }
};
var CONSENT_TITLE = '개인정보 수집·이용 동의';
var CONSENT_CHOICE = '위 내용에 동의합니다';

var RETRY_WAITS_MS = [0, 3000, 10000];   // 최대 3번

function formKind_(form) {
  var kind = FORM_KIND_BY_ID[form.getId()];
  if (!kind) throw new Error('이 폼(' + form.getId() + ')은 FORM_KIND_BY_ID 에 없습니다.');
  return kind;
}

function props_() { return PropertiesService.getScriptProperties(); }

// ── 제출 → 서버 전달 ─────────────────────────────────────────────
function onFormSubmit(e) {
  // 편집기에서 직접 실행하면 제출 이벤트(e.response)가 없다 — 아무것도 보내지 않는다
  // (예전엔 마지막 응답을 찾다가 응답이 0건이면 "전달 실패" 메일을 보냈다)
  if (!e || !e.response) { console.log('[폼 알림] 제출 이벤트 없이 실행됨(편집기에서 직접 실행) — 아무것도 보내지 않음. 점검은 inspect() 를 쓰세요.'); return; }
  var form = FormApp.getActiveForm();
  var response = e.response;
  var kind, payload;
  try {
    kind = formKind_(form);
    payload = buildPayload_(form, kind, response);
  } catch (err) {
    notifyFailure_(form, response, '응답 정리 실패: ' + err.message);
    return;
  }
  var p = props_();
  var url = p.getProperty('FORM_WEBHOOK_URL'), secret = p.getProperty('FORM_WEBHOOK_SECRET');
  if (!url || !secret) { notifyFailure_(form, response, '스크립트 속성 FORM_WEBHOOK_URL / FORM_WEBHOOK_SECRET 이 없습니다.'); return; }

  var lastError = '';
  for (var i = 0; i < RETRY_WAITS_MS.length; i++) {
    if (RETRY_WAITS_MS[i]) Utilities.sleep(RETRY_WAITS_MS[i]);
    try {
      var res = UrlFetchApp.fetch(url, {
        method: 'post',
        contentType: 'application/json',
        headers: { Authorization: 'Bearer ' + secret },
        payload: JSON.stringify(payload),
        muteHttpExceptions: true
      });
      var code = res.getResponseCode();
      if (code === 200) { console.log('[폼 알림] 전달 성공 ' + payload.responseId + ' ' + res.getContentText().slice(0, 200)); return; }
      lastError = 'HTTP ' + code + ' ' + res.getContentText().slice(0, 200);
      if (code === 400 || code === 401) break;   // 다시 보내도 같은 결과 — 바로 실패 메일
    } catch (err) {
      lastError = err.message;
    }
    console.warn('[폼 알림] 전달 실패 ' + (i + 1) + '회: ' + lastError);
  }
  notifyFailure_(form, response, lastError);
}

function buildPayload_(form, kind, response) {
  var consentId = props_().getProperty('CONSENT_ITEM_ID');
  var consent = null, items = [];
  response.getItemResponses().forEach(function (ir) {
    var item = ir.getItem();
    var id = String(item.getId());
    var v = ir.getResponse();
    if (id === consentId) {
      var picked = Array.isArray(v) ? v : [v];
      consent = picked.indexOf(CONSENT_CHOICE) >= 0;
      return;   // 동의 여부만 보낸다
    }
    if (Array.isArray(v)) v = v.map(function (x) { return Array.isArray(x) ? x.join(' / ') : String(x == null ? '' : x); });
    else v = v == null ? '' : String(v);
    items.push({ id: id, title: item.getTitle(), type: String(item.getType()), value: v });
  });
  return {
    formKind: kind,
    formId: form.getId(),
    responseId: response.getId(),
    submittedAt: response.getTimestamp().toISOString(),
    consent: consent,
    items: items
  };
}

// 3번 모두 실패 — 관리자에게 메일(연락처 등 응답 내용은 넣지 않는다. 폼 응답 탭에서 확인)
function notifyFailure_(form, response, reason) {
  try {
    var kind = FORM_KIND_BY_ID[form.getId()];
    var label = kind ? FORM_CONFIG[kind].label : form.getTitle();
    var when = response ? Utilities.formatDate(response.getTimestamp(), 'Asia/Seoul', 'yyyy-MM-dd HH:mm') : '-';
    MailApp.sendEmail({
      to: ADMIN_EMAIL,
      subject: '[THE STEPPER 알림] 폼 알림 서버 전달 실패 — ' + label,
      body: [
        label + ' 에 새 응답이 들어왔지만 알림 서버(Vercel)로 전달하지 못했습니다.',
        '접수: ' + when + ' (KST)',
        '응답 ID: ' + (response ? response.getId() : '-'),
        '실패 사유: ' + String(reason || '').slice(0, 300),
        '',
        '응답 내용은 폼 응답 탭에서 확인하세요: ' + form.getEditUrl().replace(/\/edit.*$/, '/edit#responses'),
        '이 응답은 admin.html "폼 접수" 목록에 없으니 직접 처리해야 합니다.'
      ].join('\n')
    });
  } catch (err) {
    console.error('[폼 알림] 실패 메일도 보내지 못함: ' + err.message);
  }
}

// ── 보유 기간 만료 응답 삭제 (매일 KST 05시 시간 트리거) ─────────────────
// 서버가 처리완료 후 365일 지난 응답을 "삭제 대기"로 표시해 둔다(cron 04시).
//   ① purge-list 로 이 폼의 삭제 대기 응답 ID 를 받는다
//   ② 그 응답만 폼에서 지운다. 폼에 이미 없는 ID 는 지운 것으로 본다
//   ③ 지운 ID 만 purge-done 으로 알린다 → 서버가 Firestore 문서 삭제
// 지우지 못한 ID 는 서버에 남아 다음 날 다시 시도. 같은 ID 가 3일 연속 실패하거나 서버 연결이 3일 연속 실패하면 메일.
// (응답 시트에 복사된 행은 지우지 않는다 — 시트 연결은 해제할 예정)
function purgeExpiredResponses() {
  var form = FormApp.getActiveForm();
  var kind = formKind_(form);
  var p = props_();
  var url = p.getProperty('FORM_WEBHOOK_URL'), secret = p.getProperty('FORM_WEBHOOK_SECRET');
  var fails = JSON.parse(p.getProperty('PURGE_FAILS') || '{}');
  var runFails = Number(p.getProperty('PURGE_RUN_FAILS') || '0');
  var call = function (body) {
    var res = UrlFetchApp.fetch(url, {
      method: 'post', contentType: 'application/json', muteHttpExceptions: true,
      headers: { Authorization: 'Bearer ' + secret }, payload: JSON.stringify(body)
    });
    if (res.getResponseCode() !== 200) throw new Error('HTTP ' + res.getResponseCode() + ' ' + res.getContentText().slice(0, 200));
    return JSON.parse(res.getContentText());
  };
  try {
    if (!url || !secret) throw new Error('스크립트 속성 FORM_WEBHOOK_URL / FORM_WEBHOOK_SECRET 이 없습니다.');
    var ids = call({ action: 'purge-list', formKind: kind }).responseIds || [];
    var done = [], failed = [];
    ids.forEach(function (id) {
      var exists = true;
      try { form.getResponse(id); } catch (err) { exists = false; }   // 이미 없음 = 지운 것으로 본다
      if (!exists) { done.push(id); return; }
      try { form.deleteResponse(id); done.push(id); }
      catch (err) { failed.push(id); console.warn('[응답 정리] 삭제 실패 ' + id + ': ' + err.message); }
    });
    var report = done.length ? call({ action: 'purge-done', formKind: kind, responseIds: done }) : { deleted: 0 };
    console.log('[응답 정리] 삭제 대기 ' + ids.length + '건 → 폼에서 삭제(또는 이미 없음) ' + done.length + '건, 실패 ' + failed.length + '건, 서버 문서 삭제 ' + report.deleted + '건');
    done.forEach(function (id) { delete fails[id]; });
    var alertIds = [];
    failed.forEach(function (id) { fails[id] = (fails[id] || 0) + 1; if (fails[id] === 3) alertIds.push(id); });
    Object.keys(fails).forEach(function (id) { if (ids.indexOf(id) < 0) delete fails[id]; });   // 서버 목록에서 빠진 것은 정리
    p.setProperty('PURGE_FAILS', JSON.stringify(fails));
    p.setProperty('PURGE_RUN_FAILS', '0');
    if (alertIds.length) purgeFailureMail_(form, '응답 ' + alertIds.length + '건을 3일 연속 지우지 못했습니다: ' + alertIds.join(', '));
  } catch (err) {
    runFails++;
    p.setProperty('PURGE_RUN_FAILS', String(runFails));
    console.error('[응답 정리] 실행 실패(' + runFails + '일째): ' + err.message);
    if (runFails === 3) purgeFailureMail_(form, '알림 서버 연결이 3일 연속 실패했습니다: ' + String(err.message).slice(0, 300));
  }
}

function purgeFailureMail_(form, reason) {
  try {
    var kind = FORM_KIND_BY_ID[form.getId()];
    var label = kind ? FORM_CONFIG[kind].label : form.getTitle();
    MailApp.sendEmail({
      to: ADMIN_EMAIL,
      subject: '[THE STEPPER 알림] 폼 응답 정리(보유 기간 만료) 실패 — ' + label,
      body: [
        label + ' 폼의 보유 기간 만료 응답을 지우는 작업이 실패하고 있습니다.',
        reason,
        '',
        '폼 응답 탭: ' + form.getEditUrl().replace(/\/edit.*$/, '/edit#responses'),
        '실행 기록: Apps Script 편집기 → 실행 기록(Executions)'
      ].join('\n')
    });
  } catch (err) {
    console.error('[응답 정리] 실패 메일도 보내지 못함: ' + err.message);
  }
}

// ── 읽기 전용 점검 — 아무것도 바꾸지 않는다(트리거·제목·항목·속성 그대로). 결과를 실행 로그로 출력 ──────
function inspect() {
  var form = FormApp.getActiveForm();
  var kind = FORM_KIND_BY_ID[form.getId()];
  var out = [];
  out.push('폼 제목: ' + form.getTitle());
  out.push('폼 편집용 ID: ' + form.getId() + ' → 종류: ' + (kind || '(모름)'));
  out.push('공개 주소: ' + form.getPublishedUrl());
  out.push('contact.html 의 폼과 같은가: ' + (kind && form.getPublishedUrl().indexOf(EXPECTED_PUBLIC_ID[kind]) >= 0 ? '예' : '아니오'));
  out.push('응답 받는 중: ' + (form.isAcceptingResponses() ? '예' : '아니오'));
  try {
    var destId = form.getDestinationId();
    out.push('응답 시트: ' + (destId ? '연결됨 (ID ' + destId + ')' : '연결 안 됨'));
  } catch (err) { out.push('응답 시트: 연결 안 됨'); }
  var rs = form.getResponses();
  out.push('기존 응답: ' + rs.length + '건' + (rs.length ? ' (' + Utilities.formatDate(rs[0].getTimestamp(), 'Asia/Seoul', 'yyyy-MM-dd') + ' ~ ' + Utilities.formatDate(rs[rs.length - 1].getTimestamp(), 'Asia/Seoul', 'yyyy-MM-dd') + ', KST)' : ''));
  var tr = ScriptApp.getProjectTriggers();
  out.push('이 프로젝트의 트리거: ' + (tr.length ? tr.map(function (t) { return t.getHandlerFunction() + '/' + t.getEventType(); }).join(', ') : '없음'));
  out.push('항목 ID:');
  form.getItems().forEach(function (it) { out.push('  ' + it.getId() + ' [' + it.getType() + '] ' + it.getTitle()); });
  var p = props_();
  var url = p.getProperty('FORM_WEBHOOK_URL'), secret = p.getProperty('FORM_WEBHOOK_SECRET');
  out.push('스크립트 속성: FORM_WEBHOOK_URL ' + (url ? '있음' : '없음') + ' / FORM_WEBHOOK_SECRET ' + (secret ? '있음' : '없음'));
  // 서버 연결·비밀값 일치 확인 — 읽기만 하는 purge-list 를 부른다(저장·알림 없음). 200 = Vercel 의 FORM_WEBHOOK_SECRET 과 같음
  if (url && secret && kind) {
    try {
      var res = UrlFetchApp.fetch(url, {
        method: 'post', contentType: 'application/json', muteHttpExceptions: true,
        headers: { Authorization: 'Bearer ' + secret }, payload: JSON.stringify({ action: 'purge-list', formKind: kind })
      });
      var code = res.getResponseCode();
      out.push('서버 연결 확인: HTTP ' + code + (code === 200 ? ' — 비밀값이 Vercel 과 같음 ✓' : code === 401 ? ' — 비밀값이 Vercel 과 다름 ✗ (공백·줄바꿈 포함 여부 확인)' : ' — 확인 필요'));
    } catch (err) { out.push('서버 연결 확인: 실패 — ' + err.message); }
  } else out.push('서버 연결 확인: 건너뜀(스크립트 속성 없음)');
  console.log(out.join('\n'));
}

// ── 처음 한 번 실행: 트리거 · 폼 제목 · 동의 항목 (다시 실행해도 중복 없음) ──────────
function setup() {
  var form = FormApp.getActiveForm();
  var log = [];
  var kind = FORM_KIND_BY_ID[form.getId()];
  log.push('폼 편집용 ID: ' + form.getId());
  log.push('폼 공개 주소: ' + form.getPublishedUrl());
  log.push('폼 종류: ' + (kind || '(FORM_KIND_BY_ID 에 없음 — 중단)'));
  if (!kind) { console.log(log.join('\n')); return; }
  if (form.getPublishedUrl().indexOf(EXPECTED_PUBLIC_ID[kind]) < 0) {
    log.push('✗ 공개 주소가 contact.html 의 폼(' + EXPECTED_PUBLIC_ID[kind] + ')과 다릅니다 — 아무것도 바꾸지 않고 중단');
    console.log(log.join('\n')); return;
  }
  log.push('✓ 공개 주소 = contact.html 의 폼과 같음');
  var cfg = FORM_CONFIG[kind];

  // 1) 응답 시트 연결 여부
  try {
    var destId = form.getDestinationId();
    log.push('응답 시트: ' + (destId ? '연결됨 (' + form.getDestinationType() + ', ID ' + destId + ')' : '연결 안 됨'));
  } catch (err) { log.push('응답 시트: 연결 안 됨'); }

  // 2) 트리거 — 이 프로젝트의 onFormSubmit 트리거가 이미 있으면 새로 만들지 않는다
  var triggers = ScriptApp.getProjectTriggers();
  log.push('기존 트리거 ' + triggers.length + '개: ' + triggers.map(function (t) { return t.getHandlerFunction() + '/' + t.getEventType(); }).join(', '));
  var has = triggers.some(function (t) { return t.getHandlerFunction() === 'onFormSubmit' && t.getEventType() === ScriptApp.EventType.ON_FORM_SUBMIT; });
  if (!has) { ScriptApp.newTrigger('onFormSubmit').forForm(form).onFormSubmit().create(); log.push('→ onFormSubmit 트리거 설치'); }
  else log.push('→ onFormSubmit 트리거 이미 있음(그대로)');
  var hasPurge = triggers.some(function (t) { return t.getHandlerFunction() === 'purgeExpiredResponses' && t.getEventType() === ScriptApp.EventType.CLOCK; });
  if (!hasPurge) {
    ScriptApp.newTrigger('purgeExpiredResponses').timeBased().everyDays(1).atHour(5).inTimezone('Asia/Seoul').create();
    log.push('→ 보유 기간 만료 응답 정리 트리거 설치(매일 KST 05시대)');
  } else log.push('→ 응답 정리 트리거 이미 있음(그대로)');

  // 3) 폼 제목(회원 도장 가입 문의만)
  if (cfg.title && form.getTitle() !== cfg.title) { log.push('→ 폼 제목 변경: "' + form.getTitle() + '" → "' + cfg.title + '"'); form.setTitle(cfg.title); }
  else log.push('→ 폼 제목 그대로: "' + form.getTitle() + '"');

  // 4) 개인정보 수집·이용 동의 — 기록된 ID 의 항목이 있거나 같은 제목의 체크박스가 있으면 새로 만들지 않는다
  var p = props_();
  var consentId = p.getProperty('CONSENT_ITEM_ID');
  var consentItem = null;
  if (consentId) { try { consentItem = form.getItemById(Number(consentId)); } catch (err) { consentItem = null; } }
  if (!consentItem) {
    form.getItems(FormApp.ItemType.CHECKBOX).forEach(function (it) { if (!consentItem && it.getTitle() === CONSENT_TITLE) consentItem = it; });
  }
  if (!consentItem) {
    consentItem = form.addCheckboxItem()
      .setTitle(CONSENT_TITLE)
      .setHelpText(cfg.consentHelp)
      .setChoiceValues([CONSENT_CHOICE])
      .setRequired(true);
    log.push('→ 동의 항목 추가 (마지막 항목, 필수)');
  } else log.push('→ 동의 항목 이미 있음(그대로)');
  p.setProperty('CONSENT_ITEM_ID', String(consentItem.getId()));

  // 5) 항목 ID 목록 — 서버 매핑(api/_formSchema.js)과 대조용
  log.push('항목 ID:');
  form.getItems().forEach(function (it) { log.push('  ' + it.getId() + ' [' + it.getType() + '] ' + it.getTitle()); });

  // 6) 스크립트 속성 확인(값은 출력하지 않음)
  log.push('스크립트 속성: FORM_WEBHOOK_URL ' + (p.getProperty('FORM_WEBHOOK_URL') ? '있음' : '없음') + ' / FORM_WEBHOOK_SECRET ' + (p.getProperty('FORM_WEBHOOK_SECRET') ? '있음' : '없음'));
  console.log(log.join('\n'));
}
