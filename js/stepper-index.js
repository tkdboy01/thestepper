/* THE STEPPER 리뉴얼 A안 — index.html 동작
   1) 유튜브: 썸네일 + 재생 버튼 → 누르면 그 자리에서 youtube-nocookie iframe
   2) 15단계 커리큘럼: js/curriculum-data.js 로 목록을 그리고 한 번에 하나만 펼침
   3) 방문자 집계: stats/visitors 의 count +1 (같은 브라우저는 한국 날짜 기준 하루 1회)
         첫 화면 버튼 아래 "누적 방문자 N명" 에 표시
   4) Firestore 공개 읽기(로그인 없음):
        locations → 회원 도장 수 [N] 와 시·도별 목록
        schedules → 다가오는 세미나 최대 3개, 없으면 가장 최근 지난 세미나 3개
      실패하면 페이지에 미리 넣어 둔 기본값(29곳 / 안내 문구)을 그대로 둔다. */

// ── 1. 유튜브 지연 로드 ────────────────────────────────────────
document.querySelectorAll('.ix-video__btn[data-yt]').forEach(function (btn) {
  btn.addEventListener('click', function () {
    var id = btn.getAttribute('data-yt');
    var iframe = document.createElement('iframe');
    iframe.src = 'https://www.youtube-nocookie.com/embed/' + encodeURIComponent(id) + '?autoplay=1&rel=0';
    iframe.title = btn.getAttribute('data-title') || 'YouTube 영상';
    iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
    iframe.allowFullscreen = true;
    iframe.referrerPolicy = 'strict-origin-when-cross-origin';
    btn.replaceWith(iframe);
    iframe.focus();
  });
});

// ── 2. 커리큘럼 ────────────────────────────────────────────────
(function renderCurriculum() {
  var list = document.getElementById('curriculum-list');
  var data = window.STEPPER_CURRICULUM;
  if (!list || !Array.isArray(data)) return;

  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }

  data.forEach(function (stage) {
    var first = stage.chapters[0].number;
    var last = stage.chapters[stage.chapters.length - 1].number;
    var range = first === last ? '제' + first + '장' : '제' + first + '–' + last + '장';
    var btnId = 'stage-' + stage.stage + '-btn';
    var panelId = 'stage-' + stage.stage + '-panel';

    var li = el('li', 'ix-stage');
    var h3 = el('h3');
    var btn = el('button', 'ix-stage__btn');
    btn.type = 'button';
    btn.id = btnId;
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-controls', panelId);
    btn.appendChild(el('span', 'ix-stage__no', pad(stage.stage) + '단계'));
    btn.appendChild(el('span', 'ix-stage__name', stage.name));
    btn.appendChild(el('span', 'ix-stage__range', range));
    var sign = el('span', 'ix-stage__sign', '+');
    sign.setAttribute('aria-hidden', 'true');
    btn.appendChild(sign);
    h3.appendChild(btn);

    var panel = el('div', 'ix-stage__panel');
    panel.id = panelId;
    panel.setAttribute('role', 'region');
    panel.setAttribute('aria-labelledby', btnId);
    panel.hidden = true;
    var ol = el('ol');
    stage.chapters.forEach(function (c) {
      var item = el('li');
      item.appendChild(el('span', 'ix-chap__no', '제' + c.number + '장'));
      item.appendChild(el('span', 'ix-chap__title', c.title));
      ol.appendChild(item);
    });
    panel.appendChild(ol);

    li.appendChild(h3);
    li.appendChild(panel);
    list.appendChild(li);
  });

  // 한 번에 하나만 열림
  list.addEventListener('click', function (e) {
    var btn = e.target.closest('.ix-stage__btn');
    if (!btn) return;
    var willOpen = btn.getAttribute('aria-expanded') !== 'true';
    list.querySelectorAll('.ix-stage__btn').forEach(function (b) {
      var open = willOpen && b === btn;
      b.setAttribute('aria-expanded', open ? 'true' : 'false');
      b.querySelector('.ix-stage__sign').textContent = open ? '−' : '+';
      document.getElementById(b.getAttribute('aria-controls')).hidden = !open;
    });
  });
})();

// ── 3. Firestore 공개 읽기 ─────────────────────────────────────
var FIREBASE_CONFIG = {
  apiKey: 'AIzaSyBD96_snsYdbET2vzkF7MY8nMJlfHiAxi4',
  authDomain: 'thestepper-c9bfb.firebaseapp.com',
  projectId: 'thestepper-c9bfb',
  storageBucket: 'thestepper-c9bfb.firebasestorage.app',
  messagingSenderId: '787224576231',
  appId: '1:787224576231:web:04d4003f42ecace9016242'
};


// "경남 창원" → "경남", "경기도" → "경기", "충북 청주" → "충북"
function sidoOf(region) {
  var first = String(region || '').trim().split(/\s+/)[0] || '기타';
  if (first.length === 3 && first.charAt(2) === '도') first = first.slice(0, 2);
  return first;
}

// 오늘 날짜(한국 시간) "YYYY-MM-DD" — schedules.date 와 같은 형식
function todayISO() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
}

// 세미나 detail 화면 표시용 정리 (Firestore 데이터는 그대로 둔다)
//  - 이모지 제거(예: "📍")
//  - 구분자 "|" 와 앞뒤에 공백이 있는 "·" 를 " · " 하나로 통일
//    ("부산·경남"처럼 붙어 쓴 가운뎃점과 "/" 는 그대로)
function cleanDetail(s) {
  return String(s || '')
    .replace(/[\p{Extended_Pictographic}️‍]/gu, '')
    .replace(/\s*[|｜]\s*/g, ' · ')
    .replace(/\s+·\s+/g, ' · ')
    .replace(/(?:\s·\s){2,}/g, ' · ')
    .replace(/^\s*·\s*|\s*·\s*$/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

function scheduleList(items) {
  var list = document.createElement('ul');
  list.className = 'ix-schedule';
  items.forEach(function (x) {
    var li = document.createElement('li');
    var date = document.createElement('span'); date.className = 'ix-schedule__date'; date.textContent = x.date.replace(/-/g, '.');
    var title = document.createElement('span'); title.className = 'ix-schedule__title'; title.textContent = x.title || '';
    if (x.detail) { var det = document.createElement('span'); det.className = 'ix-schedule__detail'; det.textContent = cleanDetail(x.detail); title.appendChild(det); }
    li.appendChild(date); li.appendChild(title); list.appendChild(li);
  });
  return list;
}

(async function loadFirestore() {
  var fs, db;
  try {
    var appMod = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js');
    // 리뉴얼 전 index.html 과 같은 SDK(10.12.2, firebase-firestore.js)
    fs = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js');
    var app = appMod.getApps().length ? appMod.getApps()[0] : appMod.initializeApp(FIREBASE_CONFIG);
    db = fs.getFirestore(app);
  } catch (e) {
    return; // SDK 로드 실패 — 기본값 유지
  }

  // ── 방문자 집계·표시 ── 문서 stats/visitors 의 count (리뉴얼 전 값을 그대로 이어 씀).
  //    없으면 { count: 1 } 생성, 있으면 count 를 increment(1) — firestore.rules 가 +1 만 허용한다.
  //    같은 브라우저는 한국 날짜 기준 하루 1회만 센다(2026-10-28): localStorage 'stepper_visit_day' 에
  //    센 날짜를 적어 두고, 같은 날 다시 열면 읽어서 표시만 한다. 저장소를 못 쓰는 브라우저(사생활 보호 모드 등)는
  //    예전처럼 열 때마다 센다.
  //    점검·크롤 도구는 아래 updateDoc 한 줄을 바꿔치기해 증가를 막는다 — 이 줄 문구를 바꾸면 도구도 같이 고칠 것.
  //    첫 화면의 [data-visitor-count] 에 숫자를 넣는다(실패하면 '···' 그대로).
  (async function updateVisitor() {
    var VISIT_KEY = 'stepper_visit_day';
    var today = todayISO();
    var countedToday = false;
    try { countedToday = localStorage.getItem(VISIT_KEY) === today; } catch (e) { /* 저장소 사용 불가 */ }
    try {
      var ref = fs.doc(db, 'stats', 'visitors');
      var snap = await fs.getDoc(ref);
      var n = snap.exists() ? (Number(snap.data().count) || 0) : 0;
      if (!countedToday) {
        if (!snap.exists()) {
          await fs.setDoc(ref, { count: 1 });
        } else {
          await fs.updateDoc(ref, { count: fs.increment(1) });
        }
        n += 1;
        try { localStorage.setItem(VISIT_KEY, today); } catch (e) { /* 저장소 사용 불가 */ }
      }
      document.querySelectorAll('[data-visitor-count]').forEach(function (e) { e.textContent = n.toLocaleString('ko-KR'); });
    } catch (e) {
      console.log('카운터 오류:', e);
    }
  })();

  // ── 회원 도장 ──
  try {
    var snap = await fs.getDocs(fs.collection(db, 'locations'));
    var n = snap.size;
    if (n > 0) {
      document.querySelectorAll('[data-dojang-count]').forEach(function (e) { e.textContent = String(n); });
      var counts = {};
      snap.forEach(function (d) { var s = sidoOf(d.data().region); counts[s] = (counts[s] || 0) + 1; });
      var rows = Object.keys(counts).map(function (k) { return [k, counts[k]]; })
        .sort(function (a, b) { return b[1] - a[1] || a[0].localeCompare(b[0], 'ko'); });
      var ul = document.createElement('ul');
      ul.className = 'ix-regions';
      ul.setAttribute('aria-label', '시·도별 회원 도장 수');
      rows.forEach(function (r) {
        var li = document.createElement('li');
        var name = document.createElement('span'); name.textContent = r[0];
        var cnt = document.createElement('span'); cnt.className = 'ix-regions__count'; cnt.textContent = r[1] + '곳';
        li.appendChild(name); li.appendChild(cnt); ul.appendChild(li);
      });
      var holder = document.getElementById('dojang-regions');
      if (holder) holder.replaceChildren(ul);
    }
  } catch (e) { /* 권한 없음·네트워크 오류 — 29곳 / 안내 문구 유지 */ }

  // ── 세미나 일정 ──
  //    오늘(한국 시간) 이후 일정이 있으면 가까운 순 최대 3개.
  //    없으면 "지난 세미나" 라벨 + 안내 문장 + 가장 최근 지난 일정 3개(최신순).
  try {
    var ss = await fs.getDocs(fs.collection(db, 'schedules'));
    var today = todayISO();
    var upcoming = [], past = [];
    ss.forEach(function (d) {
      var x = d.data();
      if (!x.date) return;
      (x.date >= today ? upcoming : past).push(x);
    });
    upcoming.sort(function (a, b) { return a.date < b.date ? -1 : a.date > b.date ? 1 : 0; });
    past.sort(function (a, b) { return a.date < b.date ? 1 : a.date > b.date ? -1 : 0; });
    var box = document.getElementById('seminar-schedule');
    if (!box) return;
    if (upcoming.length) {
      box.replaceChildren(scheduleList(upcoming.slice(0, 3)));
    } else if (past.length) {
      var head = document.createElement('p');
      head.className = 'ix-schedule__head';
      var label = document.createElement('span'); label.className = 'ix-schedule__label'; label.textContent = '지난 세미나';
      var note = document.createElement('span'); note.className = 'ix-schedule__note'; note.textContent = '예정된 세미나는 곧 공지됩니다';
      head.appendChild(label); head.appendChild(note);
      box.replaceChildren(head, scheduleList(past.slice(0, 3)));
    }
  } catch (e) { /* 기본 안내 문구 유지 */ }
})();
