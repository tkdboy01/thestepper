# 메인(index.html) 자리표시 상자 — 숨김 처리와 다시 켜는 법 (2026-10-28)

리뉴얼 메인에 실제 내용이 들어갈 자리로 만들어 둔 상자 2개가 방문자에게 "준비 중" 글자로 보이고 있어 숨겼다.
상자와 스타일은 지우지 않고 그대로 두었으므로, 실제 지도·캡처가 준비되면 아래 순서로 다시 켠다.

| 상자 | 섹션 | HTML | 스타일 |
|---|---|---|---|
| AI 코치 대화 화면 캡처 | 기록 03 — AI 코치 (`#ai`) | `<div class="ix-ai-shot" … hidden>` | `css/stepper-a-index.css` `.ix-ai-shot` |
| 회원 도장 지도 | 기록 06 — 회원 도장 (`#dojang`) | `<div class="ix-map" … hidden>` | `css/stepper-a-index.css` `.ix-map` |

## 숨긴 방법

- 상자에 `hidden` 속성 → 화면·스크린리더 모두에서 빠진다(`.ix-ai-shot[hidden], .ix-map[hidden] { display: none; }`).
- 상자가 있던 섹션의 바깥 칸(`.sa-wrap ix-ai`, `.sa-wrap ix-dojang`)에 `ix-solo` 클래스 → 원래 2칸(글 | 상자)이던 배치를
  한 칸(최대 760px)으로 바꿔 오른쪽이 비어 보이지 않게 한다. 960px 이하는 원래도 한 칸이라 변화 없음.

## 다시 켜는 법

1. 내용 넣기
   - AI 캡처: `.ix-ai-shot` 안의 글자("AI 코치 대화 화면 캡처 예정")를 `<img src="images/renewal/…" alt="AI 코치 대화 화면">` 로 바꾼다.
     이미지는 `images/` 아래에 두면 배포 허용 목록(`.vercelignore` 의 `!/images`)에 이미 들어 있다.
     `role="img"`·`aria-label` 은 `<img>` 로 바꾸면 지운다(이미지 자체의 alt 를 쓴다).
   - 지도: `.ix-map` 안의 글자를 지도 요소로 바꾼다.
2. 그 상자의 `hidden` 속성을 지운다.
3. 같은 섹션 바깥 칸의 `ix-solo` 클래스를 지운다 → 2칸 배치로 돌아간다.
   (상자 하나만 켜면 그 섹션의 `ix-solo` 만 지운다.)
4. 375 / 768 / 1024 / 1440px 에서 배치와 가로 넘침을 확인한다.
