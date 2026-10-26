/* ══════════════════════════════════════════════════════════════════
   THE STEPPER 리뉴얼 A안 — 공통 메뉴(헤더)·하단 정보(푸터)

   사용법 (빌드 도구 없음):
     <div id="site-header"></div>  ... 본문 ...  <div id="site-footer"></div>
     <script src="js/stepper-layout.js"></script>      ← 본문 끝, 동기 로드
     <script src="admin-nav.js" defer></script>          ← 관리자 전용 링크 표시

   - 메뉴 7개는 아래 MENU 한 곳에서만 관리한다.
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
    var overlayItems = MENU.map(function (m) {
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
      return '<li><a href="' + esc(l.href) + '"' + (isCurrent(l.href) ? ' aria-current="page"' : '') + '>' + esc(l.label) + '</a></li>';
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

  function render() {
    var h = document.getElementById('site-header');
    var f = document.getElementById('site-footer');
    if (h) { h.innerHTML = headerHTML(); bindOverlay(h); }
    if (f) { f.innerHTML = footerHTML(); }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', render);
  } else {
    render();
  }
})();
