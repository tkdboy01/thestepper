/* ══════════════════════════════════════════════════════════════════
   THE STEPPER 15단계 42장 커리큘럼 — 단일 출처 (single source of truth)

   출처: index.html(리뉴얼 전, main 00d2447) 커리큘럼 아코디언 원문.
   레포에 curriculum.html 은 없다. 아코디언의 단계 이름과 "제N장 - 제목"
   목록을 스크립트로 그대로 옮겼다(요약·축약·수정 없음).
   대조 결과는 docs/renewal/curriculum-check.md 참고.
   ══════════════════════════════════════════════════════════════════ */
(function (root) {
  'use strict';
  var CURRICULUM = [
    { stage: 1, name: "제자리 기본 자세 & 원스텝", chapters: [
      { number: 1, title: "제자리 기본 자세" },
      { number: 2, title: "전진 원스텝, 후진 원스텝" },
      { number: 3, title: "돌려차기" },
      { number: 4, title: "전진하며 뒷발 돌려차기" },
      { number: 5, title: "연계: 전진 원스텝 후 돌려차기 공격, 후진 원스텝 후 돌려차기 받아차기" }
    ] },
    { stage: 2, name: "붙여차기 & 앞발 기술", chapters: [
      { number: 6, title: "붙여차기" },
      { number: 7, title: "앞발 돌려차기" },
      { number: 8, title: "후진 원스텝 후 앞발 돌려차기" },
      { number: 9, title: "연계: 전진 원스텝 후 붙여차기" },
      { number: 10, title: "전진 투스텝, 후진 투스텝" }
    ] },
    { stage: 3, name: "나래차기 & 내려찍기", chapters: [
      { number: 11, title: "나래차기" },
      { number: 12, title: "내려찍기" },
      { number: 13, title: "사이드 스텝" },
      { number: 14, title: "연계: 전진/후진 원스텝·투스텝 & 나래차기·내려찍기" }
    ] },
    { stage: 4, name: "뒷차기 & 뒤후려차기", chapters: [
      { number: 15, title: "뒷차기" },
      { number: 16, title: "뒤후려차기" },
      { number: 17, title: "연계: 전진 원스텝 후 공격 뒤차기" }
    ] },
    { stage: 5, name: "런닝 발차기 & 거리 조절", chapters: [
      { number: 18, title: "런닝 발차기" },
      { number: 19, title: "상대의 사이드 스텝에 반응해 방향 전환" },
      { number: 20, title: "전/후진 짧은 스텝 긴 스텝 연결" },
      { number: 21, title: "상대와 거리 유지하기" }
    ] },
    { stage: 6, name: "주먹 기술 & 커버링", chapters: [
      { number: 22, title: "앞 주먹 치기, 뒷 주먹 치기" },
      { number: 23, title: "팔 커버링" },
      { number: 24, title: "팔 커버 하면서 뒷 주먹 치기" },
      { number: 25, title: "연계: 커버 & 주먹 후 발차기" }
    ] },
    { stage: 7, name: "돌개차기 & 스텝 연계", chapters: [
      { number: 26, title: "돌개차기, 뒷발 주고 돌려차기, 앞발 주고 돌려차기" },
      { number: 27, title: "연계: 스텝과 발차기의 연결" }
    ] },
    { stage: 8, name: "점프 뒤차기 & 자율 스텝", chapters: [
      { number: 28, title: "점프 뒤차기, 커트 발차기, 커트 밟고 점프 뒤차기" },
      { number: 29, title: "자율 스텝 연계 훈련" }
    ] },
    { stage: 9, name: "첫 번째 공격 타이밍", chapters: [
      { number: 30, title: "첫 번째 공격 타이밍" },
      { number: 31, title: "공격 들어오는 상대에 제자리에서 받아차기 (상대방이 발을 차는 순간 / 들어오는 순간)" }
    ] },
    { stage: 10, name: "붙었을 때 안전 자세", chapters: [
      { number: 32, title: "상대와 붙었을 때 안전 자세" },
      { number: 33, title: "상대와 붙어서 감아차기 / 안들어찍기 / 바깥들어찍기" }
    ] },
    { stage: 11, name: "반격 타이밍 훈련", chapters: [
      { number: 34, title: "나의 첫 번째 공격 후 상대방이 받아차기 하는 순간 반응" },
      { number: 35, title: "상대방의 두 번째 공격까지 예상하고 반격 준비" }
    ] },
    { stage: 12, name: "발차기 거리 조절", chapters: [
      { number: 36, title: "짧게 차는 발차기와 길게 차는 발차기의 사용법" },
      { number: 37, title: "연계: 짧게 차는 발차기와 길게 차는 발차기의 연결 동작을 몸에 익히기" },
      { number: 38, title: "사각백 자율 겨루기" }
    ] },
    { stage: 13, name: "배쪽 마무리 훈련", chapters: [
      { number: 39, title: "상대의 배쪽으로 발차기를 마무리하기 훈련" },
      { number: 40, title: "거리 두고 약속 겨루기를 하며 배쪽으로 발차기를 마무리하기 훈련" }
    ] },
    { stage: 14, name: "공방 겨루기", chapters: [
      { number: 41, title: "공/방 겨루기 (정해진 동작들로만 겨루기)" }
    ] },
    { stage: 15, name: "스텝 겨루기", chapters: [
      { number: 42, title: "스텝 겨루기" }
    ] }
  ];
  root.STEPPER_CURRICULUM = CURRICULUM;
})(window);
