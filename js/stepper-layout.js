/* ══════════════════════════════════════════════════════════════════
   THE STEPPER 리뉴얼 A안 — 공통 메뉴(헤더)·하단 정보(푸터)

   사용법 (빌드 도구 없음):
     <div id="site-header"></div>  ... 본문 ...  <div id="site-footer"></div>
     <script src="js/stepper-layout.js"></script>      ← 본문 끝, 동기 로드
     <script src="admin-nav.js" defer></script>          ← 관리자 전용 링크 표시

   - 메뉴 7개는 아래 MENU 한 곳에서만 관리한다.
   - 떠 있는 채널 버튼(유튜브·카카오톡·인스타그램)도 여기서 그린다(renderFloating). 페이지에 따로 넣지 않는다.
   - 현재 페이지 메뉴(해시 없는 링크가 현재 파일과 같을 때)는 빨강 밑줄.
   - 관리자 전용 링크(동작 분석·음성 답변·ADMIN)는 기존 페이지와 같은 방식으로
     class="admin-only-nav" + display:none 으로 넣고, admin-nav.js 가
     관리자 로그인일 때만 보이게 한다(기존 index.html 동작 그대로).
   ══════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var LOGO_PNG  = 'https://firebasestorage.googleapis.com/v0/b/thestepper-c9bfb.firebasestorage.app/o/assets%2Flogo.png?alt=media';
  var LOGO_WEBP = 'https://firebasestorage.googleapis.com/v0/b/thestepper-c9bfb.firebasestorage.app/o/assets%2Flogo.webp?alt=media';

  // 메뉴 7개 — 연결 대상은 docs/renewal/REPORT.md 0단계 5번 표
  var MENU = [
    { label: '영상',     href: 'index.html#video' },
    { label: '브랜드',   href: 'index.html#why' },
    { label: '커리큘럼', href: 'index.html#curriculum' },
    { label: 'AI 코치',  href: 'ai.html' },
    { label: '세미나',   href: 'schedule.html' },
    { label: '회원 도장', href: 'locations.html' },
    { label: '신청·문의', href: 'contact.html' }
  ];
  var CTA = { label: '세미나 신청', href: 'contact.html#seminar' };

  // 전체 화면 메뉴(760px 이하 "메뉴" 버튼)에만 더하는 항목 — 가로 메뉴는 768px 에서 한 줄을 유지하려고
  // 7개로 두고, 세로 목록인 휴대폰 메뉴에만 넣는다(2026-10-28). after: 이 라벨 바로 뒤에 넣음
  var OVERLAY_EXTRA = [
    { label: '스텝 소개', href: 'staff.html', after: '브랜드' }
  ];

  // 관리자 전용 (기존 index.html 메뉴의 admin-only-nav 링크를 그대로 옮김)
  var ADMIN_LINKS = [
    { id: 'navMotionLink', label: '동작 분석', href: 'motion.html' },
    { id: 'navVoiceLink',  label: '음성 답변', href: 'voice.html' },
    // 관리자 페이지 — 기존 index.html 의 "⚙ ADMIN"(맨 아래). 리뉴얼은 이모지·기호를 쓰지 않아 "ADMIN"
    { id: 'navAdminLink',  label: 'ADMIN',    href: 'admin.html' }
  ];

  var CHANNELS = [
    { label: '유튜브 태권민국', href: 'https://www.youtube.com/@%ED%83%9C%EA%B6%8C%EB%AF%BC%EA%B5%AD', external: true },
    { label: '인스타그램',     href: 'https://www.instagram.com/the_stepper_kms', external: true },
    { label: '카카오톡 상담',   href: 'https://open.kakao.com/o/gFVIg0Dh', external: true },
    { label: '1:1 문의',       href: 'board.html', external: false },
    // 리뉴얼 전 index.html 플로팅 버튼(title="대한버추얼스포츠협회")의 주소 그대로
    { label: '대한버추얼스포츠협회', href: 'https://koreavsa.com/', external: true }
  ];

  // 보조 링크 — 메뉴 7개에 없는 기존 페이지. 이름은 각 페이지 <title> 에서 그대로 가져옴
  var SUB_LINKS = [
    { label: '스텝 소개',         href: 'staff.html' },
    // 리뉴얼 전 메뉴의 "회원 도장 후기" — 메인 후기 섹션(2026-10-28)
    { label: '회원 도장 후기',     href: 'index.html#reviews' },
    { label: '성인부 & 입시센터',  href: 'center.html' },
    { label: '활동 갤러리',       href: 'gallery.html' },
    { label: 'OX 겨루기 퀴즈',    href: 'quiz.html' },
    { label: 'VR 버추얼 태권도',   href: 'virtual.html' }
  ];

  function currentFile() {
    var f = location.pathname.split('/').pop();
    return f === '' ? 'index.html' : f;
  }
  var FILE = currentFile();
  var ON_INDEX = FILE === 'index.html';

  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  // index.html 안에서는 같은 문서 앵커로 바로 이동(새로고침 방지)
  function resolve(href) {
    if (ON_INDEX && href.indexOf('index.html#') === 0) return href.slice('index.html'.length);
    return href;
  }
  function isCurrent(href) {
    return href.indexOf('#') === -1 && href === FILE;
  }
  function logo(size) {
    return '<picture><source srcset="' + LOGO_WEBP + '" type="image/webp">' +
      '<img src="' + LOGO_PNG + '" alt="" width="' + size + '" height="' + size + '"></picture>';
  }
  function linkAttrs(item, cls) {
    return 'class="' + cls + '" href="' + esc(resolve(item.href)) + '"' +
      (isCurrent(item.href) ? ' aria-current="page"' : '');
  }
  function adminLinks(cls, idSuffix) {
    return ADMIN_LINKS.map(function (a) {
      return '<li><a ' + 'id="' + a.id + idSuffix + '" class="' + cls + ' admin-only-nav" href="' + a.href + '" style="display:none">' + esc(a.label) + '</a></li>';
    }).join('');
  }

  function headerHTML() {
    var items = MENU.map(function (m) {
      return '<li><a ' + linkAttrs(m, 'sa-nav__link') + '>' + esc(m.label) + '</a></li>';
    }).join('');
    var overlayMenu = MENU.slice();
    OVERLAY_EXTRA.forEach(function (x) {
      var i = overlayMenu.map(function (m) { return m.label; }).indexOf(x.after);
      overlayMenu.splice(i < 0 ? overlayMenu.length : i + 1, 0, x);
    });
    var overlayItems = overlayMenu.map(function (m) {
      return '<li><a ' + linkAttrs(m, 'sa-overlay__link') + '>' + esc(m.label) + '</a></li>';
    }).join('');
    return '' +
      '<a class="sa-skip" href="#main">본문 바로가기</a>' +
      '<header class="sa-header">' +
        '<div class="sa-header__inner">' +
          '<a class="sa-brand" href="' + (ON_INDEX ? '#top' : 'index.html') + '" aria-label="THE STEPPER 홈">' +
            logo(44) + '<span class="sa-brand__name">THE STEPPER</span></a>' +
          '<nav class="sa-nav" aria-label="주 메뉴"><ul class="sa-nav__list">' + items + adminLinks('sa-nav__link', '') + '</ul></nav>' +
          '<a class="sa-btn sa-btn--black sa-header__cta" href="' + CTA.href + '">' + CTA.label + '</a>' +
          '<button type="button" class="sa-btn sa-btn--line sa-menu-btn" aria-expanded="false" aria-controls="sa-overlay">메뉴</button>' +
        '</div>' +
      '</header>' +
      '<div class="sa-overlay" id="sa-overlay" role="dialog" aria-modal="true" aria-label="전체 메뉴" hidden>' +
        '<div class="sa-overlay__top">' +
          '<a class="sa-brand" href="' + (ON_INDEX ? '#top' : 'index.html') + '" aria-label="THE STEPPER 홈">' +
            logo(44) + '<span class="sa-brand__name">THE STEPPER</span></a>' +
          '<button type="button" class="sa-btn sa-btn--line sa-overlay__close">닫기</button>' +
        '</div>' +
        '<ul class="sa-overlay__list">' + overlayItems + adminLinks('sa-overlay__link', 'M') + '</ul>' +
        '<a class="sa-btn sa-btn--black" href="' + CTA.href + '">' + CTA.label + '</a>' +
      '</div>';
  }

  function footerHTML() {
    var links = CHANNELS.map(function (c) {
      return '<li><a href="' + esc(c.href) + '"' + (c.external ? ' target="_blank" rel="noopener"' : '') + '>' + esc(c.label) + '</a></li>';
    }).join('');
    var subs = SUB_LINKS.map(function (l) {
      return '<li><a href="' + esc(resolve(l.href)) + '"' + (isCurrent(l.href) ? ' aria-current="page"' : '') + '>' + esc(l.label) + '</a></li>';
    }).join('');
    return '' +
      '<footer class="sa-footer">' +
        '<div class="sa-wrap">' +
          '<div class="sa-footer__grid">' +
            '<div class="sa-footer__info">' +
              '<div class="sa-footer__brand">' + logo(56) + '<span>THE STEPPER</span></div>' +
              '<p>대표 김민성 · 본부 마산 남부터미널 맞은편</p>' +
              '<p>상담 <a href="tel:010-4304-7768">010-4304-7768</a></p>' +
            '</div>' +
            '<nav aria-label="외부 채널"><ul class="sa-footer__links">' + links + '</ul></nav>' +
          '</div>' +
          '<nav class="sa-footer__sub" aria-label="다른 페이지"><ul>' + subs + '</ul></nav>' +
          '<div class="sa-footer__copy">© 2026 THE STEPPER. All rights reserved.</div>' +
        '</div>' +
      '</footer>';
  }

  // ── 전체 화면 메뉴 열기/닫기 (aria-expanded, 포커스 이동, 스크롤 잠금, Esc) ──
  function bindOverlay(root) {
    var btn = root.querySelector('.sa-menu-btn');
    var overlay = root.querySelector('#sa-overlay');
    var closeBtn = overlay.querySelector('.sa-overlay__close');

    function focusables() {
      return Array.prototype.filter.call(
        overlay.querySelectorAll('a[href], button'),
        function (el) { return el.offsetParent !== null; }
      );
    }
    function open() {
      overlay.hidden = false;
      btn.setAttribute('aria-expanded', 'true');
      document.body.classList.add('sa-scroll-locked');
      closeBtn.focus();
      document.addEventListener('keydown', onKey);
    }
    function close(returnFocus) {
      overlay.hidden = true;
      btn.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('sa-scroll-locked');
      document.removeEventListener('keydown', onKey);
      if (returnFocus !== false) btn.focus();
    }
    function onKey(e) {
      if (e.key === 'Escape') { e.preventDefault(); close(); return; }
      if (e.key === 'Tab') {                       // 포커스를 메뉴 안에 가둔다
        var f = focusables(); if (!f.length) return;
        var first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    }
    btn.addEventListener('click', function () { overlay.hidden ? open() : close(); });
    closeBtn.addEventListener('click', function () { close(); });
    overlay.addEventListener('click', function (e) {
      if (e.target.closest && e.target.closest('a')) close(false);   // 항목 클릭 시 닫힘
    });
    // 넓은 화면으로 바뀌면 열린 메뉴를 정리
    window.addEventListener('resize', function () {
      if (!overlay.hidden && window.matchMedia('(min-width: 761px)').matches) close(false);
    });
  }

  // ── 떠 있는 채널 버튼(유튜브·카카오톡·인스타그램) — 2026-10-29 각 페이지에 복사돼 있던 것을 여기로 모음 ──
  // 이 스크립트를 불러오는 페이지에 모두 나온다(<body data-no-channels> 면 안 나옴). 관리자 페이지 등 이 스크립트를
  // 쓰지 않는 페이지에는 원래처럼 없다.
  //   PC(761px 이상): 기존과 같은 52px 동그란 버튼 3개를 오른쪽 아래에 세로로.
  //   모바일(760px 이하): 48px 버튼 1개로 접어 두고, 누르면 3개가 위로 펼쳐짐. 다시 누르기·바깥 누르기·Esc 로 접힘.
  //   메인(index.html) 모바일은 첫 화면(.ix-hero)이 보이는 동안 숨김 — 「회원 도장 가입 문의」·「누적 방문자」를 가리지 않게.
  // 모양(FLOAT_CSS)도 여기서 넣는다 — stepper-a.css 를 쓰지 않는 locations.html 에서도 같게 나오도록.
  var FLOAT_LINKS = '<a href="https://www.youtube.com/@%ED%83%9C%EA%B6%8C%EB%AF%BC%EA%B5%AD" target="_blank" class="float-btn float-youtube" title="유튜브"><svg width="22" height="22" viewBox="0 0 24 24" fill="white"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg></a><a href="https://open.kakao.com/o/gFVIg0Dh" target="_blank" class="float-btn float-kakao" title="카카오톡"><svg width="22" height="22" viewBox="0 0 24 24" fill="#3C1E1E"><path d="M12 3C6.477 3 2 6.477 2 10.5c0 2.674 1.58 5.025 3.978 6.418L5 21l4.773-2.487C10.468 18.833 11.224 19 12 19c5.523 0 10-3.477 10-7.5S17.523 3 12 3z"/></svg></a><a href="https://www.instagram.com/the_stepper_kms" target="_blank" class="float-btn float-insta" title="인스타그램"><svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg></a>';
  var FLOAT_TOGGLE_ICONS =
    '<svg class="sa-float__ico-open" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" aria-hidden="true"><path d="M4 4h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H10l-5 4v-4H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"/><circle cx="8" cy="11" r="1" fill="currentColor"/><circle cx="12" cy="11" r="1" fill="currentColor"/><circle cx="16" cy="11" r="1" fill="currentColor"/></svg>' +
    '<svg class="sa-float__ico-close" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>';
  var FLOAT_CSS = [
    // PC — 기존 stepper-a.css 와 같은 크기·색·위치. 헤더(1000)·전체 메뉴(1100)보다 아래 층이라 메뉴를 열면 가려진다
    '.floating-btns { position: fixed; bottom: 30px; right: 24px; display: flex; flex-direction: column; gap: 10px; z-index: 900; }',
    '.sa-float__list { display: flex; flex-direction: column; gap: 10px; }',
    '.float-btn { width: 52px; height: 52px; border-radius: 50%; display: flex; align-items: center; justify-content: center; text-decoration: none; box-shadow: 0 2px 12px rgba(0,0,0,0.08); transition: transform 0.2s, box-shadow 0.2s; }',
    '.float-btn:hover { transform: translateY(-3px) scale(1.08); box-shadow: 0 8px 28px rgba(0,0,0,0.25); }',
    '.float-kakao { background: #FEE500; }',
    '.float-insta { background: linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888); }',
    '.float-youtube { background: #FF0000; }',
    '.sa-float__toggle { display: none; }',
    // 모바일 — 접힌 버튼 1개, 펼치면 3개가 그 위로
    '@media (max-width: 760px) {',
    '  .floating-btns { bottom: calc(16px + env(safe-area-inset-bottom, 0px)); right: 16px; transition: opacity 0.2s, visibility 0.2s; }',
    '  .sa-float__list { position: absolute; right: 1px; bottom: calc(100% + 10px); transition: opacity 0.2s, transform 0.2s, visibility 0.2s; }',
    '  .floating-btns:not(.is-open) .sa-float__list { opacity: 0; visibility: hidden; transform: translateY(12px); }',
    '  .float-btn { width: 46px; height: 46px; }',
    '  .sa-float__toggle { display: flex; align-items: center; justify-content: center; width: 48px; height: 48px; padding: 0; border: 0; border-radius: 50%; background: #111; color: #fff; cursor: pointer; box-shadow: 0 2px 12px rgba(0,0,0,0.18); -webkit-tap-highlight-color: transparent; }',
    '  .sa-float__ico-close, .floating-btns.is-open .sa-float__ico-open { display: none; }',
    '  .floating-btns.is-open .sa-float__ico-close { display: block; }',
    '  .floating-btns.is-hero { opacity: 0; visibility: hidden; }',
    '}'
  ];

  function renderFloating() {
    if (document.body.hasAttribute('data-no-channels') || document.querySelector('.floating-btns')) return;
    var style = document.createElement('style');
    style.id = 'sa-float-style';
    style.textContent = FLOAT_CSS.join('\n');
    document.head.appendChild(style);

    var box = document.createElement('div');
    box.className = 'floating-btns';
    box.innerHTML = '<div class="sa-float__list" id="sa-float-list">' + FLOAT_LINKS + '</div>' +
      '<button type="button" class="sa-float__toggle" aria-expanded="false" aria-controls="sa-float-list" aria-label="채널 바로가기 열기">' + FLOAT_TOGGLE_ICONS + '</button>';
    document.body.appendChild(box);

    var btn = box.querySelector('.sa-float__toggle');
    function setOpen(open) {
      box.classList.toggle('is-open', open);
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      btn.setAttribute('aria-label', open ? '채널 바로가기 닫기' : '채널 바로가기 열기');
    }
    btn.addEventListener('click', function () { setOpen(!box.classList.contains('is-open')); });
    box.addEventListener('click', function (e) {                       // 채널을 누르면(새 창) 접어 둔다
      if (e.target.closest && e.target.closest('a')) setOpen(false);
    });
    document.addEventListener('click', function (e) {                  // 바깥을 누르면 접힘
      if (box.classList.contains('is-open') && !box.contains(e.target)) setOpen(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && box.classList.contains('is-open')) { setOpen(false); btn.focus(); }
    });

    // 메인 첫 화면이 보이는 동안은 숨김(모바일만 — .is-hero 는 760px 이하에서만 모양이 있음)
    var hero = ON_INDEX && document.querySelector('.ix-hero');
    if (hero && 'IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        var inView = entries[0].isIntersecting;
        box.classList.toggle('is-hero', inView);
        if (inView) setOpen(false);
      }).observe(hero);
    }
  }

  function render() {
    var h = document.getElementById('site-header');
    var f = document.getElementById('site-footer');
    if (h) { h.innerHTML = headerHTML(); bindOverlay(h); }
    if (f) { f.innerHTML = footerHTML(); }
    renderFloating();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', render);
  } else {
    render();
  }
})();
