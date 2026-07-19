/* ══════════════════════════════════════════════════════════════════
   관리자 전용 메뉴 표시 제어 (모든 페이지 공용)

   #navMotionLink 링크를 관리자에게만 노출한다.

   2단 구조:
     1) 즉시 판정 — localStorage 의 firebase:authUser:* 키를 "전부 훑어"
        관리자 이메일을 찾는다. SDK 로드를 기다리지 않아 깜빡임이 없다.
        (이전 버전은 키 이름을 통째로 하드코딩해 앱 이름/키가 조금만
         달라도 항상 실패했다. 그래서 접두사 스캔 방식으로 바꿨다.)
     2) 확정 판정 — Firebase Auth SDK 의 onAuthStateChanged 로 최종 확인.
        SDK 가 없는 페이지에는 compat SDK 를 동적으로 실어서 쓴다.
        이쪽 결과가 언제나 1)을 덮어쓴다.

   주의: 이건 "보이기/숨기기"일 뿐 접근 통제가 아니다.
   실제 차단은 motion.html 의 ADMIN_ONLY + requireAdmin 가드가
   Firebase Auth 로 수행한다. 이 파일을 우회해 링크를 띄워도
   페이지 내용과 기능은 열리지 않는다.

   전체 공개 전환 시: 각 페이지 <a id="navMotionLink"> 의
   style="display:none" 만 지우면 되고 이 파일은 그대로 둬도 무해하다.
   ══════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var ADMIN_EMAIL = 'tkdboykms0007@gmail.com';
  var SDK_VER     = '10.12.2';

  var FIREBASE_CONFIG = {
    apiKey: "AIzaSyBD96_snsYdbET2vzkF7MY8nMJlfHiAxi4",
    authDomain: "thestepper-c9bfb.firebaseapp.com",
    projectId: "thestepper-c9bfb",
    storageBucket: "thestepper-c9bfb.firebasestorage.app",
    messagingSenderId: "787224576231",
    appId: "1:787224576231:web:04d4003f42ecace9016242"
  };

  // ── 표시 토글 ────────────────────────────────────────────────
  function setVisible(show) {
    var el = document.getElementById('navMotionLink');
    if (el) el.style.display = show ? '' : 'none';
  }

  function whenReady(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  // ── 1단계: localStorage 힌트 (키 이름을 가정하지 않는다) ─────
  function hintFromStorage() {
    try {
      for (var i = 0; i < localStorage.length; i++) {
        var k = localStorage.key(i);
        if (!k || k.indexOf('firebase:authUser:') !== 0) continue;
        var raw = localStorage.getItem(k);
        if (!raw) continue;
        var u = JSON.parse(raw);
        if (u && u.email === ADMIN_EMAIL) return true;
      }
    } catch (e) { /* 접근 불가/파싱 실패는 조용히 무시 */ }
    return false;
  }

  // SDK 구독이 시작되면 localStorage 힌트는 더 이상 신뢰하지 않는다.
  // (Firebase 는 탭 간 인증 변화를 스스로 onAuthStateChanged 로 전파하므로
  //  힌트가 오래된 값으로 SDK 판정을 되돌리는 일을 막는다)
  var sdkReady = false;

  // ── 2단계: Firebase Auth 로 확정 ─────────────────────────────
  function subscribe() {
    try {
      var app = firebase.apps && firebase.apps.length
        ? firebase.app()
        : firebase.initializeApp(FIREBASE_CONFIG);

      firebase.auth(app).onAuthStateChanged(function (user) {
        sdkReady = true;
        setVisible(!!user && user.email === ADMIN_EMAIL);
      });
    } catch (e) {
      // SDK 문제 시 1단계 판정을 그대로 유지한다
    }
  }

  function loadScript(src) {
    return new Promise(function (resolve, reject) {
      var s = document.createElement('script');
      s.src = src;
      s.async = true;
      s.onload = resolve;
      s.onerror = reject;
      document.head.appendChild(s);
    });
  }

  function ensureAuthSdk() {
    // 이 페이지에 이미 compat auth 가 있으면 그대로 사용
    if (window.firebase && typeof window.firebase.auth === 'function') {
      subscribe();
      return;
    }
    var base = 'https://www.gstatic.com/firebasejs/' + SDK_VER + '/';
    var chain = (window.firebase && window.firebase.initializeApp)
      ? Promise.resolve()
      : loadScript(base + 'firebase-app-compat.js');

    chain
      .then(function () { return loadScript(base + 'firebase-auth-compat.js'); })
      .then(subscribe)
      .catch(function () { /* 네트워크 실패 시 1단계 판정 유지 */ });
  }

  // ── 실행 ──────────────────────────────────────────────────────
  whenReady(function () {
    setVisible(hintFromStorage());   // 즉시 반영
    ensureAuthSdk();                 // 곧 확정 반영
  });

  // 다른 탭에서 로그인/로그아웃한 경우.
  // SDK 가 이미 구독 중이면 그쪽이 알아서 전파하므로 힌트는 건너뛴다.
  window.addEventListener('storage', function () {
    if (sdkReady) return;
    setVisible(hintFromStorage());
  });
})();
