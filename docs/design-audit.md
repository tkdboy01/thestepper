# THE STEPPER 디자인 현황 진단 (Design Audit)

- 작성일: 2026-10-16
- 기준 코드: `main` 브랜치 `5e9aeae` (HTML 파일 미수정 상태에서 측정)
- 원칙: 코드에서 확인된 것만 기록. 화면을 렌더링해 본 결과가 아니라 소스 정적 분석 결과다. 값의 "역할" 묶음(예: 보조 텍스트 회색)은 해당 값이 쓰인 CSS 속성·클래스명 기준으로 분류했다.
- 이 작업에서 수정한 파일 없음. 산출물은 이 문서 하나.

## 0. 진단 범위

| 구분 | 파일 | 비고 |
|---|---|---|
| **서비스 페이지 (진단 대상 15개)** | `index.html` `ai.html` `board.html` `center.html` `contact.html` `gallery.html` `locations.html` `schedule.html` `staff.html` `virtual.html` `quiz.html` `admin.html` `voice.html` `motion.html` `motion-legacy.html` | 2~8번 집계는 이 15개 기준 |
| 공용 JS | `admin-nav.js` | 스타일 값 없음(색상값 0건). 관리자 메뉴 표시 토글 |
| 비페이지 JS | `generate-qr.js` | Node 실행용 QR 생성 스크립트. 어떤 HTML도 불러오지 않음 |
| 초안/백업 HTML (집계 제외, 5번 사실정보만 대조) | `thestepper_homepage (1).html`, `새 폴더/index.html` | 어느 페이지에서도 링크되지 않음. 단 `firebase.json`의 hosting `public: "."` + ignore 목록에 HTML이 없어 배포 대상에 포함됨 |
| 제외 | `THE STEPPER - 태권도 겨루기 클럽_files/*.html`, `www-player.css` | 브라우저 "페이지 저장"으로 생긴 YouTube 플레이어 파일 |

- 외부 `.css` 파일: **0개**. 모든 스타일이 각 HTML의 `<style>` 블록과 `style=""` 속성에 인라인으로 들어 있다.
- 추출 방식: Node 스크립트로 15개 HTML 전 줄을 스캔(CSS·HTML 속성·JS 문자열 모두 포함). JS로 동적 생성되는 마크업 안의 값도 포함된다.

---

## 1. 페이지 목록과 불러오는 리소스

| 페이지 | `<title>` | 공개 여부(코드상) | 웹폰트 (Google Fonts) | 외부 JS / 라이브러리 | 로컬 JS | 인라인 `<style>` / `<script>` | 기타 외부 리소스 |
|---|---|---|---|---|---|---|---|
| index.html | THE STEPPER - 태권도 겨루기 클럽 | 공개 (robots index) | Noto Sans KR 300·400·500·700·900, Bebas Neue (`:28`) / Black Han Sans `@import` (`:65`) **※ 블록 중간이라 무효** | Firebase **10.12.2** 모듈형: app, firestore, storage (`:1013`, `:1083`) | admin-nav.js | 2 / 8 | YouTube iframe 3개 (`:510`, `:771`, `:772`), Firebase Storage 이미지 |
| ai.html | AI 겨루기 코치 - THE STEPPER | 공개 | Noto Sans KR 300~900, Bebas Neue (`:25`) | Firebase 10.12.2 compat: app, auth, firestore (`:590-592`) | admin-nav.js | 1 / 1 | — |
| board.html | 1:1 문의 - THE STEPPER | 공개 | Noto Sans KR 300~900, Bebas Neue (`:26`) | Firebase 10.12.2 compat: app, auth, firestore (`:289-291`) | admin-nav.js | 1 / 1 | — |
| center.html | THE STEPPER - 성인부 & 입시센터 | 공개 (robots/OG 메타 없음) | **없음** (`font-family:'Noto Sans KR'` 지정만 있음, `:11`) | 없음 | 없음 | 1 / 1 | favicon = Storage logo.png |
| contact.html | 회원 가입 &amp; 세미나 문의 - THE STEPPER | 공개 (robots index) | Noto Sans KR 300~900, Bebas Neue (`:29`) / Black Han Sans `@import` (`:78`) **무효** | 없음 | admin-nav.js | 1 / 2 | Google Forms iframe 2개 (`:368`, `:376`) |
| gallery.html | 활동 갤러리 - THE STEPPER | 공개 (메타 없음, 어떤 페이지도 링크 안 함) | Black Han Sans, Noto Sans KR 300~900, Bebas Neue (`:12`, 유효) | Firebase **12.13.0** 모듈형: app, storage (`:378-379`) | **없음** | 2 / 3 | — |
| locations.html | 전국 회원 도장 - THE STEPPER | 공개 (robots index) | Noto Sans KR 300~900, Bebas Neue (`:28`) | Firebase 10.12.2 모듈형: app, firestore (`:295-296`) | admin-nav.js | 1 / 2 | — |
| schedule.html | 세미나 일정 - THE STEPPER | 공개 (robots index) | Noto Sans KR 300~900, Bebas Neue (`:29`) / Black Han Sans `@import` (`:77`) **무효** | Firebase 10.12.2 모듈형: app, firestore (`:465-466`) | admin-nav.js | 1 / 4 | — |
| staff.html | 스텝 소개 - THE STEPPER | 공개 (robots index) | Noto Sans KR 300~900, Bebas Neue (`:29`, `:77` 중복 — `:77`은 무효) | 없음 | admin-nav.js | 1 / 2 | — |
| virtual.html | VR 버추얼 태권도 - THE STEPPER | 공개 | Noto Sans KR 300~900, Bebas Neue (`:24`) | Firebase 10.12.2 compat: app, **analytics** (`:872-873`) | admin-nav.js | 1 / 1 | — |
| quiz.html | OX 겨루기 퀴즈 — THE STEPPER | 공개 (index 메뉴에서만 링크) | **Jua**, Noto Sans KR 400·600·700·800·900 (`:10`) | Firebase 10.12.2 모듈형: app, firestore (`:303-304`) | 없음 | 1 / 1 | — |
| admin.html | 관리자 — THE STEPPER | 관리자 (robots noindex) | Noto Sans KR **400·500·600·700**, Bebas Neue (`:10`) | Firebase 10.12.2 모듈형: app, auth, firestore, storage (`:926-929`) | admin-nav.js | 1 / 1 | — |
| voice.html | 음성 답변 \| THE STEPPER ADMIN | 관리자 전용 (noindex) | **없음** (`:35`에 Noto Sans KR 지정만) | Firebase 10.12.2 compat: app, auth, firestore (`:357-359`) | 없음 | 1 / 1 | `voice-manifest.json` (PWA), apple-touch-icon |
| motion.html | 동작 분석 \| THE STEPPER | 관리자 전용 (noindex) | **없음** (게이트 `:25`에 Noto Sans KR 지정, 본문 `:31`은 `monospace`) | Firebase 10.12.2 compat: app, auth, firestore, storage (`:349-352`) | 없음 | 1 / 2 | — |
| motion-legacy.html | 동작 분석 (베타) - THE STEPPER | 보관본 (noindex) | Noto Sans KR 300~900, Bebas Neue — **`<link>` 방식** (`:41`, 유일) | Firebase 10.12.2 compat: app, auth, firestore, storage (`:422-425`), **jsPDF 2.5.1** (cdnjs, `:427`), **MediaPipe Pose** (jsdelivr, `:429`) | 없음 | 1 / 1 | — |

관찰된 사실:
- 폰트 로딩 방식 2종: `<style>` 안 `@import` (11개 페이지) / `<link rel="stylesheet">` (motion-legacy만).
- CSS 규칙상 `@import`는 스타일시트 맨 앞에서만 유효하다. `index.html:65`, `contact.html:78`, `schedule.html:77`, `staff.html:77`의 `@import`는 같은 `<style>` 블록 안에서 일반 규칙 뒤에 있어 무시된다. 그 결과 **Black Han Sans를 실제로 불러오는 페이지는 gallery.html 하나**인데, 이 폰트를 지정한 곳은 `index.html:107`, `contact.html:112`, `schedule.html:111`, `gallery.html:46` 네 곳이다.
- 웹폰트를 아예 불러오지 않는 페이지: center, voice, motion.
- Firebase를 쓰는 12개 페이지 중 SDK 버전 2종: 10.12.2 (11개 페이지), 12.13.0 (gallery.html). 로딩 방식도 compat(`<script src>`) 6개 / 모듈형(`import`) 6개로 나뉜다. Firebase를 쓰지 않는 페이지: center, contact, staff.

---

## 2. 디자인 값 전수 추출

### 2-0. 요약

| 항목 | 고유값 수 | 총 사용 횟수 |
|---|---|---|
| hex 색상 | 221 | 1,700 |
| rgb/rgba | 136 | 527 |
| hsl | 0 | 0 |
| CSS 변수 정의 (이름:값 조합) | 36 | 144 |
| CSS 변수 사용 `var(--x)` | 17종 | 676 |
| font-family | 11 | 240 |
| font-weight | 7 | 404 |
| font-size | 62 | 970 |
| border-radius | 30 | 457 |
| box-shadow | 46 | 95 |
| text-shadow | 14 | 16 |
| gradient (linear/radial) | 58 | 117 |
| backdrop-filter | 2 | 17 |

인라인 `style=""` 속성 개수: admin 391, index 38, ai 39, contact 24, locations 16, motion 15, voice 14, board 13, schedule 12, motion-legacy 19, virtual 7, gallery 6, staff 5, quiz 1, center 0.
`!important`: index.html 29개 (전부 `:342` "화이트 배경 가독성 전면 보정" 블록 이후), 다른 페이지 0개.

### 2-1. CSS 변수 — 같은 이름, 다른 값 (가장 큰 불일치)

페이지별 `:root` 정의 (같은 파일에 두 번 정의된 경우 나중 값이 적용됨):

| 페이지 | 정의 위치 | --red | --gold | --yellow | --black | --white | --gray | --dark | 기타 |
|---|---|---|---|---|---|---|---|---|---|
| index | `:29`, `:66` (동일 중복) | #C8102E | — | **#C9A84C** | **#FFFFFF** | **#0D1B2E** | #EDF0F5 | #F2F4F7 | |
| ai | `:26` | #C0392B | #C9A84C | — | #0a0a0a | #fff | #f5f5f7 | — | --border #e5e5e7, --text #1d1d1f, --text2 #6e6e73, --card #ffffff |
| board | `:27` | #C0392B | #C9A84C | — | #0a0a0a | #fff | #f5f5f7 | — | ai와 동일 |
| contact | `:30`, `:79` (동일 중복) | #C0392B | #C9A84C | — | #0a0a0a | #fff | #f5f5f7 | #f5f5f7 | ai와 동일 + --dark |
| schedule | `:30`, `:78` (동일 중복) | #C0392B | #C9A84C | — | #0a0a0a | #fff | #f5f5f7 | #f5f5f7 | contact와 동일 |
| locations | `:29` → **`:72`에서 재정의** | #C0392B → **#C8102E** | #C9A84C | #FFE000 | #0a0a0a | #fff | #f5f5f7 → **#1a1a1a** | #f5f5f7 | 적용값: --red #C8102E, --gray #1a1a1a |
| staff | `:30` → **`:78`에서 재정의** | #C0392B → **#C8102E** | #C9A84C | #FFE000 | #0a0a0a | #fff | #f5f5f7 → **#1a1a1a** | #f5f5f7 | locations와 동일 패턴 |
| gallery | `:13` | #C8102E | — | #FFE000 | #0a0a0a | #fff | #1a1a1a | #111 | 본문 배경 var(--black) → **다크 페이지** |
| virtual | `:26-35` | #C0392B | #C9A84C | — | #0a0a0a | #fff | #f5f5f7 | — | ai와 동일 |
| motion-legacy | `:43` | #C0392B | #C9A84C | — | — | — | #f5f5f7 | — | --border, --text, --text2 |
| admin | `:11` | #C8102E | #C9A84C | — | — | — | — | — | --bg #ffffff, --surface #f5f5f7, --border #e5e5e7, --text #1d1d1f, --sub #6e6e73 |
| voice | `:32` | #C8102E | #C9A84C | — | — | — | — | — | **다크**: --bg #0f1115, --surface #181b22, --border #2a2e38, --text #f2f2f4, --sub #9a9fac |
| quiz | `:12-17` | **#FF4757** | **#FFC93C** | — | — | — | — | — | --red-deep #C8102E, --blue #3B82F6, --blue-deep #1E56D9, --purple #9B5DE5, --green #22C55E, --ink #2B2140, --sub #6B6284 |
| center, motion | — | (변수 없음, 하드코딩) | | | | | | | center는 #C0392B 7회, motion은 #C00 20회 하드코딩 |

정리:
- **--red 적용값**: #C8102E (admin, gallery, index, locations, staff, voice) / #C0392B (ai, board, contact, schedule, virtual, motion-legacy) / #FF4757 (quiz).
- **이름과 값의 의미가 반대**: index.html의 `--black: #FFFFFF`, `--white: #0D1B2E`. `--dark`는 4개 페이지에서 밝은 회색 #f5f5f7.
- **--gray 3종**: #f5f5f7(밝음) / #1a1a1a(어두움) / #EDF0F5.
- **--yellow 2종**: index는 금색 #C9A84C, gallery·locations·staff는 형광 노랑 #FFE000. 다른 페이지는 같은 금색을 `--gold`로 부른다.
- **정의되지 않은 변수 사용 4곳**:
  - `index.html:448` `color:var(--gold)` — index에는 --gold 없음 (현재 메뉴 "홈" 강조색).
  - `contact.html:146` `linear-gradient(90deg,var(--red),var(--yellow))`, `contact.html:353` `color:var(--yellow)` — contact에는 --yellow 없음.
  - `schedule.html:145` `linear-gradient(90deg,var(--red),var(--yellow))` — schedule에는 --yellow 없음.
- `contact.html:353`의 페이지 제목 h1은 `color:var(--white)` = #fff인데 contact의 body 배경은 #ffffff (`:33`). 상단 배경은 `rgba(200,16,46,0.15)` → transparent 방사형 그라데이션.

<details><summary>CSS 변수 정의·사용 전체 표 펼치기</summary>

#### CSS 변수 정의 (이름: 값) — 고유값 36개 / 총 144회

| 값 | 횟수 | 사용 파일(파일별 횟수) |
|---|---|---|
| `--gold: #C9A84C` | 12 | contact(2), schedule(2), admin(1), ai(1), board(1), locations(1), motion-legacy(1), staff(1), virtual(1), voice(1) |
| `--black: #0a0a0a` | 12 | contact(2), locations(2), schedule(2), staff(2), ai(1), board(1), gallery(1), virtual(1) |
| `--white: #fff` | 12 | contact(2), locations(2), schedule(2), staff(2), ai(1), board(1), gallery(1), virtual(1) |
| `--border: #e5e5e7` | 11 | contact(2), schedule(2), admin(1), ai(1), board(1), locations(1), motion-legacy(1), staff(1), virtual(1) |
| `--text: #1d1d1f` | 11 | contact(2), schedule(2), admin(1), ai(1), board(1), locations(1), motion-legacy(1), staff(1), virtual(1) |
| `--red: #C0392B` | 10 | contact(2), schedule(2), ai(1), board(1), locations(1), motion-legacy(1), staff(1), virtual(1) |
| `--gray: #f5f5f7` | 10 | contact(2), schedule(2), ai(1), board(1), locations(1), motion-legacy(1), staff(1), virtual(1) |
| `--text2: #6e6e73` | 10 | contact(2), schedule(2), ai(1), board(1), locations(1), motion-legacy(1), staff(1), virtual(1) |
| `--card: #ffffff` | 9 | contact(2), schedule(2), ai(1), board(1), locations(1), staff(1), virtual(1) |
| `--red: #C8102E` | 7 | index(2), admin(1), gallery(1), locations(1), staff(1), voice(1) |
| `--dark: #f5f5f7` | 6 | contact(2), schedule(2), locations(1), staff(1) |
| `--yellow: #FFE000` | 3 | gallery(1), locations(1), staff(1) |
| `--gray: #1a1a1a` | 3 | gallery(1), locations(1), staff(1) |
| `--yellow: #C9A84C` | 2 | index(2) |
| `--black: #FFFFFF` | 2 | index(2) |
| `--dark: #F2F4F7` | 2 | index(2) |
| `--gray: #EDF0F5` | 2 | index(2) |
| `--white: #0D1B2E` | 2 | index(2) |
| `--bg: #ffffff` | 1 | admin(1) |
| `--surface: #f5f5f7` | 1 | admin(1) |
| `--sub: #6e6e73` | 1 | admin(1) |
| `--dark: #111` | 1 | gallery(1) |
| `--red: #FF4757` | 1 | quiz(1) |
| `--red-deep: #C8102E` | 1 | quiz(1) |
| `--blue: #3B82F6` | 1 | quiz(1) |
| `--blue-deep: #1E56D9` | 1 | quiz(1) |
| `--gold: #FFC93C` | 1 | quiz(1) |
| `--purple: #9B5DE5` | 1 | quiz(1) |
| `--green: #22C55E` | 1 | quiz(1) |
| `--ink: #2B2140` | 1 | quiz(1) |
| `--sub: #6B6284` | 1 | quiz(1) |
| `--bg: #0f1115` | 1 | voice(1) |
| `--surface: #181b22` | 1 | voice(1) |
| `--border: #2a2e38` | 1 | voice(1) |
| `--text: #f2f2f4` | 1 | voice(1) |
| `--sub: #9a9fac` | 1 | voice(1) |

#### CSS 변수 사용 var(--x) — 고유값 17개 / 총 676회

| 값 | 횟수 | 사용 파일(파일별 횟수) |
|---|---|---|
| `--red` | 267 | index(51), admin(35), contact(31), gallery(28), schedule(26), ai(22), motion-legacy(15), virtual(15), locations(13), staff(13), board(9), voice(8), quiz(1) |
| `--gold` | 136 | contact(22), schedule(22), virtual(16), staff(14), ai(13), locations(11), motion-legacy(11), voice(11), board(9), admin(3), quiz(3), index(1) |
| `--yellow` | 48 | gallery(22), index(19), locations(3), contact(2), schedule(1), staff(1) |
| `--border` | 47 | admin(19), voice(11), motion-legacy(8), ai(3), board(3), virtual(3) |
| `--sub` | 35 | admin(16), voice(16), quiz(3) |
| `--white` | 32 | index(15), gallery(14), contact(2), ai(1) |
| `--black` | 26 | index(13), gallery(11), contact(1), schedule(1) |
| `--text` | 21 | motion-legacy(9), admin(8), voice(4) |
| `--surface` | 16 | voice(9), admin(7) |
| `--text2` | 13 | motion-legacy(13) |
| `--dark` | 12 | contact(3), gallery(3), index(3), schedule(3) |
| `--purple` | 6 | quiz(6) |
| `--gray` | 5 | motion-legacy(3), gallery(1), index(1) |
| `--ink` | 5 | quiz(5) |
| `--blue-deep` | 3 | quiz(3) |
| `--bg` | 2 | admin(1), voice(1) |
| `--red-deep` | 2 | quiz(2) |

</details>

### 2-2. 같은 역할인데 값이 다른 색 (코드 사용처 기준 분류)

| 역할 | 사용 중인 값 (총 사용 횟수 · 주요 파일) |
|---|---|
| 브랜드 레드 | `#C8102E` 33회 (admin 22, ai, gallery, index, locations, quiz, staff, voice) + 변수 · `#C0392B` 28회 (center 7, motion-legacy 4, contact 3, schedule 3 …) + 변수 · `#FF4757` (quiz --red) · `#C00` 20회 (motion 전부) · `#CC0000` 4회 (contact, gallery, index, schedule) |
| 레드 hover/어두운 레드 | `#A0301F` 16회 (ai, board, virtual, motion-legacy, contact, locations, schedule, staff) · `#A50D24` 4회 (admin, contact, gallery, schedule) · `#A00D24` 1 (index) · `#9B0C22` 1 (quiz) · `#8B0000` 1 (index) · `#8E1F14` 2 |
| 레드 투명 변형 | `rgba(200,16,46,α)` 94회 α 14종 · `rgba(192,57,43,α)` 52회 α 19종 — 두 레드가 각각 다른 투명도 체계로 쓰임 |
| 금색 포인트 | `#C9A84C` 52회 (12개 파일) + `rgba(201,168,76,α)` 57회 α 17종 · `#A58030` 2 (admin) · `#8B6914` 2 (index) · `#FFC93C` (quiz --gold) |
| 노랑 | `#FFE000` 3회 (gallery·locations·staff --yellow) + `rgba(255,224,0,α)` 24회 (contact, gallery, schedule, index) · `rgba(255,220,0,α)` 3회 (locations) |
| 카카오 노랑 | `#FEE500` 13회 · `#F5DC00` 1 (virtual) · `rgba(254,229,0,α)` 2 |
| 본문 텍스트 (밝은 배경) | `#1D1D1F` 162회 · `#1A1A1A` 31 · `#333` 30 · `#222` 22 · `#3D3D3F` 21 · `#111` 7 · `#0D1B2E` 40 (index 전용 네이비) |
| 보조 텍스트 | `#6E6E73` 129회 (--text2/--sub) · `#888` 60 (admin 49) · `#666` 23 (gallery 10, motion 8) · `#555` 22 (admin 11) · `#AAA` 15 (admin 14) · `#8E8E93` 4 (ai) · `#86868B` 2 (motion) · `#777` 2 · `#999` 2 · index 전용 `#1E3048` 24, `#95A5B5` 7, `#253A50` 5, `#3A5070` 3 |
| 테두리 | `#E5E5E7` 77회 (--border) · `#D2D2D7` 13 · `#CCC` 8 · `#DDD` 3 · `#EEE` 3 · `#E0E0E0` 1 · `#E0E0E2` 1 · `#E5E5E5` 1 · index 전용 `#D8E0EA` 12, `#DDE3EA` 9, `#B0B8C4` 7, `#C5CDD8` 7 |
| 밝은 표면/카드 배경 | `#F5F5F7` 54회 (--gray/--dark/--surface) · `#F0F0F0` 11 (admin) · `#F7F7F9` 9 · `#FAFAFA` 7 · `#F5F5F5` 3 · `#F0F0F2` 3 · index 전용 `#EDF0F5` 8, `#E8EDF3` 8, `#F5F7FA` 4, `#F2F4F7` 3 |
| 흰색 표기 | `#FFF` 154회 · `#FFFFFF` 71회 · `rgba(255,255,255,α)` 128회 α 28종 |
| 어두운 배경 | `#0A0A0A` 13 (--black) · `#111` 7 · `#0D0D0D` 7 · `#1A1A1A` (gallery 등 --gray) · `#1E1E1E` 17 · `#0F1115` (voice --bg) · `rgba(10,10,10,0.97)` 15 · `rgba(12,12,12,0.98)` 3 |
| 성공(녹색) | `#0A7A34` 10 (admin) · `#1A7F37` 4 · `#2E7D32` 4 · `#34A853` 4 · `#34C759` 3 · `#060` 7 (motion) · `#22C55E` 1 (quiz) · `#0E8A3E` 1 · `#14532D` 3 |
| 정보(파랑) | `#0055B3` 15 (admin) · `#0071E3` 3 · `#4285F4` 3 · `#2563EB` 1 · `#3B82F6` 1 · `#1E56D9` 1 · `#1E3A8A` 2 · `#0047A3` 1 |
| 경고(주황/갈색) | `#8A5B00` 10 (admin) · `#C05800` 6 · `#B07600` 5 · `#FF9500` 4 · `#C9660A` 2 · `#B45309` 1 · `#7A5200` 1 |
| 오류(텍스트) | `#C00` 20 (motion) · `#FF4444` 4 · `#FF3B3B` 2 (voice) · `#C8102E` (admin 배지) |

#### 무채색(회색 계열) 전체 스케일 — 밝기순 (R·G·B 차이 ≤4)

| 밝기 구간 | 값(횟수) | 고유값 수 | 합계 |
|---|---|---|---|
| L 245–255 (흰색·표면) | `#FFF`(154) · `#FFFFFF`(71) · `#FAFAFA`(7) · `#F7F7F9`(9) · `#F5F5F7`(54) · `#F5F5F5`(3) | 6 | 298 |
| L 220–244 (연한 표면·테두리) | `#F2F2F4`(1) · `#F0F0F0`(11) · `#F0F0F2`(3) · `#EEE`(3) · `#E5E5E7`(77) · `#E5E5E5`(1) · `#E0E0E2`(1) · `#E0E0E0`(1) · `#DDD`(3) | 9 | 101 |
| L 180–219 (테두리·비활성) | `#D4D4D4`(2) · `#CCC`(8) | 2 | 10 |
| L 120–179 (보조 텍스트) | `#ABABAB`(1) · `#AAA`(15) · `#999`(2) · `#888`(60) | 4 | 78 |
| L 70–119 (보조 텍스트 진함) | `#777`(2) · `#666`(23) · `#555`(22) | 3 | 47 |
| L 30–69 (본문 텍스트) | `#444`(9) · `#3D3D3F`(21) · `#3A3A3A`(1) · `#333`(30) · `#2A2A2A`(16) · `#252525`(1) · `#222`(22) · `#1E1E1E`(17) | 8 | 117 |
| L 0–29 (가장 어두운 배경·텍스트) | `#1D1D1F`(162) · `#1A1A1A`(31) · `#161616`(1) · `#111`(7) · `#0D0D0D`(7) · `#0A0A0A`(13) · `#000`(4) | 7 | 225 |

#### rgb/rgba — 기본색별 알파 변형 (같은 색을 투명도만 바꿔 쓴 경우)

| 기본 RGB | hex 환산 | 알파값(횟수) | 합계 | 사용 파일 |
|---|---|---|---|---|
| 255,255,255 | `#FFFFFF` | 0.08(24), 0.97(14), 0.06(12), 0.03(9), 0.45(8), 0.5(6), 0.2(6), 0.55(5), 0.4(5), 0.05(5), 0.02(5), 0.25(4), 0.7(3), 0.99(2), 0.15(2), 0.07(2), 0.35(2), 0.3(2), 0.04(2), 0.78(2), 0.8(1), 0.12(1), 0.10(1), 0.22(1), 0.85(1), 0.72(1), 0.1(1), 0.62(1) | 128 | admin(47), contact(10), schedule(10), staff(10), virtual(10), index(8), ai(8), locations(6), center(5), quiz(4), board(4), motion-legacy(4), gallery(2) |
| 0,0,0 | `#000000` | 0.5(23), 0.08(20), 0.3(10), 0.6(8), 0.7(7), 0.95(6), 0.12(4), 0.4(4), 0.28(3), 0.25(3), 0.45(2), 0.06(2), 0.1(2), 0.2(2), 0.04(2), 0.88(1), 0.55(1), 0.15(1) | 101 | index(22), contact(11), schedule(11), gallery(11), ai(10), staff(6), virtual(6), quiz(6), motion-legacy(5), admin(4), locations(4), center(3), board(2) |
| 200,16,46 | `#C8102E` | 0.2(18), 0.15(17), 0.4(13), 0.1(11), 0.3(10), 0.08(8), 0.04(6), 0.12(2), 0.06(2), 0.25(2), 0.18(2), 0.05(1), 0.6(1), 0.35(1) | 94 | index(22), gallery(18), contact(15), schedule(14), staff(8), locations(8), admin(7), voice(1), quiz(1) |
| 201,168,76 | `#C9A84C` | 0.12(12), 0.4(6), 0.1(6), 0.08(5), 0.3(4), 0.15(4), 0.6(4), 0.5(3), 0.2(3), 0.35(2), 0.04(2), 0.75(1), 0.07(1), 0.10(1), 0.28(1), 0.85(1), 0.06(1) | 57 | admin(12), virtual(11), board(10), voice(5), ai(5), index(5), motion-legacy(5), contact(1), locations(1), schedule(1), staff(1) |
| 192,57,43 | `#C0392B` | 0.5(10), 0.3(6), 0.4(5), 0.2(5), 0.15(4), 0.1(3), 0.08(3), 0.02(2), 0.12(2), 0.35(2), 0.04(2), 0.6(1), 0.07(1), 0.8(1), 0.05(1), 0.03(1), 0.06(1), 0.32(1), 0.45(1) | 52 | virtual(18), ai(12), motion-legacy(9), board(7), admin(5), center(1) |
| 255,224,0 | `#FFE000` | 0.3(6), 0.2(4), 0.05(4), 0.15(4), 0.08(3), 0.1(3) | 24 | contact(7), gallery(7), schedule(7), index(3) |
| 10,10,10 | `#0A0A0A` | 0.97(15) | 15 | ai(2), contact(2), gallery(2), schedule(2), staff(2), board(1), center(1), locations(1), motion-legacy(1), virtual(1) |
| 255,0,0 | `#FF0000` | 0.1(4), 0.3(4), 0.2(4) | 12 | contact(3), gallery(3), index(3), schedule(3) |
| 0,51,160 | `#0033A0` | 0.12(4), 0.1(4) | 8 | contact(2), gallery(2), index(2), schedule(2) |
| 46,204,113 | `#2ECC71` | 0.6(2), 0.1(2) | 4 | admin(2), voice(2) |
| 0,71,163 | `#0047A3` | 0.08(2), 0.07(2) | 4 | virtual(4) |
| 12,12,12 | `#0C0C0C` | 0.98(3) | 3 | gallery(2), index(1) |
| 13,27,46 | `#0D1B2E` | 0.06(2), 0.04(1) | 3 | index(3) |
| 255,220,0 | `#FFDC00` | 0.08(1), 0.25(1), 0.18(1) | 3 | locations(3) |
| 255,59,59 | `#FF3B3B` | 0(2), 0.55(1) | 3 | voice(3) |
| 255,149,0 | `#FF9500` | 0.12(1), 0.45(1) | 2 | ai(2) |
| 107,63,160 | `#6B3FA0` | 0.35(1), 0.3(1) | 2 | quiz(2) |
| 254,229,0 | `#FEE500` | 0.2(1), 0.3(1) | 2 | virtual(2) |
| 52,199,89 | `#34C759` | 0.3(1) | 1 | admin(1) |
| 0,113,227 | `#0071E3` | 0.2(1) | 1 | admin(1) |
| 10,122,52 | `#0A7A34` | 0.25(1) | 1 | admin(1) |
| 138,91,0 | `#8A5B00` | 0.25(1) | 1 | admin(1) |
| 0,85,179 | `#0055B3` | 0.25(1) | 1 | admin(1) |
| 0,220,80 | `#00DC50` | 0.85(1) | 1 | motion(1) |
| 255,50,50 | `#FF3232` | 0.9(1) | 1 | motion(1) |
| 60,20,90 | `#3C145A` | 0.25(1) | 1 | quiz(1) |
| 155,93,229 | `#9B5DE5` | 0.15(1) | 1 | quiz(1) |
| 30,86,217 | `#1E56D9` | 0.35(1) | 1 | quiz(1) |

### 2-3. hex 전체 목록

<details><summary>펼치기 — 221개</summary>

#### hex 색상 — 고유값 221개 / 총 1700회

| 값 | 횟수 | 사용 파일(파일별 횟수) |
|---|---|---|
| `#1D1D1F` | 162 | ai(29), contact(24), schedule(23), board(21), locations(14), virtual(14), staff(13), motion-legacy(11), admin(9), center(3), motion(1) |
| `#FFF` | 154 | admin(39), index(20), ai(16), motion-legacy(15), contact(11), quiz(10), gallery(9), schedule(8), locations(7), board(5), voice(5), motion(4), staff(3), virtual(2) |
| `#6E6E73` | 129 | ai(25), contact(21), schedule(20), board(15), locations(13), motion-legacy(13), virtual(12), staff(9), admin(1) |
| `#E5E5E7` | 77 | admin(18), ai(16), contact(12), board(10), schedule(9), locations(6), motion-legacy(2), staff(2), virtual(2) |
| `#FFFFFF` | 71 | contact(15), schedule(15), virtual(12), board(7), staff(7), ai(4), locations(4), center(3), index(3), admin(1) |
| `#888` | 60 | admin(49), ai(3), gallery(3), contact(2), motion(2), index(1) |
| `#F5F5F7` | 54 | contact(10), ai(9), board(8), schedule(7), virtual(7), locations(6), staff(4), admin(2), motion-legacy(1) |
| `#C9A84C` | 52 | index(12), admin(8), ai(4), center(4), contact(4), schedule(4), board(3), locations(3), motion-legacy(3), staff(3), virtual(3), voice(1) |
| `#0D1B2E` | 40 | index(40) |
| `#C8102E` | 33 | admin(22), ai(3), index(2), voice(2), gallery(1), locations(1), quiz(1), staff(1) |
| `#1A1A1A` | 31 | gallery(9), contact(8), staff(6), schedule(4), locations(2), ai(1), board(1) |
| `#333` | 30 | admin(8), gallery(7), schedule(5), ai(4), motion(3), contact(1), motion-legacy(1), virtual(1) |
| `#C0392B` | 28 | center(7), motion-legacy(4), contact(3), schedule(3), ai(2), board(2), locations(2), staff(2), virtual(2), admin(1) |
| `#1E3048` | 24 | index(24) |
| `#666` | 23 | gallery(10), motion(8), admin(2), contact(1), locations(1), virtual(1) |
| `#555` | 22 | admin(11), gallery(4), ai(2), locations(2), motion(2), index(1) |
| `#222` | 22 | gallery(8), contact(4), schedule(4), motion(2), ai(1), board(1), locations(1), staff(1) |
| `#3D3D3F` | 21 | board(5), contact(4), schedule(4), ai(3), locations(3), staff(2) |
| `#C00` | 20 | motion(20) |
| `#1E1E1E` | 17 | contact(4), gallery(4), schedule(4), motion(2), ai(1), locations(1), staff(1) |
| `#A0301F` | 16 | board(4), ai(3), virtual(3), motion-legacy(2), contact(1), locations(1), schedule(1), staff(1) |
| `#2A2A2A` | 16 | gallery(7), staff(3), contact(2), locations(2), schedule(2) |
| `#0055B3` | 15 | admin(15) |
| `#AAA` | 15 | admin(14), gallery(1) |
| `#FF0000` | 14 | contact(3), gallery(3), index(3), schedule(3), locations(1), staff(1) |
| `#0A0A0A` | 13 | contact(2), locations(2), schedule(2), staff(2), ai(1), board(1), gallery(1), motion-legacy(1), virtual(1) |
| `#D2D2D7` | 13 | ai(3), board(3), motion-legacy(2), contact(1), locations(1), schedule(1), staff(1), virtual(1) |
| `#FEE500` | 13 | contact(3), gallery(2), index(2), schedule(2), center(1), locations(1), staff(1), virtual(1) |
| `#D8E0EA` | 12 | index(12) |
| `#F0F0F0` | 11 | admin(11) |
| `#F09433` | 11 | contact(3), gallery(2), index(2), schedule(2), locations(1), staff(1) |
| `#DC2743` | 11 | contact(3), gallery(2), index(2), schedule(2), locations(1), staff(1) |
| `#BC1888` | 11 | contact(3), gallery(2), index(2), schedule(2), locations(1), staff(1) |
| `#0A7A34` | 10 | admin(10) |
| `#8A5B00` | 10 | admin(10) |
| `#E6683C` | 10 | contact(2), gallery(2), index(2), schedule(2), locations(1), staff(1) |
| `#CC2366` | 10 | contact(2), gallery(2), index(2), schedule(2), locations(1), staff(1) |
| `#F7F7F9` | 9 | admin(7), ai(2) |
| `#444` | 9 | gallery(4), ai(2), motion(2), motion-legacy(1) |
| `#DDE3EA` | 9 | index(9) |
| `#F0F4FF` | 8 | admin(8) |
| `#E8F7EC` | 8 | admin(8) |
| `#FFF7E6` | 8 | admin(8) |
| `#CCC` | 8 | motion(6), gallery(2) |
| `#EDF0F5` | 8 | index(8) |
| `#E8EDF3` | 8 | index(8) |
| `#FAFAFA` | 7 | admin(6), motion(1) |
| `#0D0D0D` | 7 | virtual(2), ai(1), contact(1), gallery(1), schedule(1), staff(1) |
| `#3C1E1E` | 7 | contact(2), gallery(1), index(1), locations(1), schedule(1), staff(1) |
| `#111` | 7 | gallery(3), index(3), virtual(1) |
| `#95A5B5` | 7 | index(7) |
| `#B0B8C4` | 7 | index(7) |
| `#C5CDD8` | 7 | index(7) |
| `#060` | 7 | motion(7) |
| `#C05800` | 6 | admin(5), ai(1) |
| `#B07600` | 5 | admin(5) |
| `#FDEAEA` | 5 | admin(5) |
| `#253A50` | 5 | index(5) |
| `#A50D24` | 4 | admin(1), contact(1), gallery(1), schedule(1) |
| `#2E7D32` | 4 | admin(3), ai(1) |
| `#34A853` | 4 | admin(2), ai(1), motion-legacy(1) |
| `#FF7070` | 4 | admin(4) |
| `#000` | 4 | center(2), admin(1), motion(1) |
| `#1A7F37` | 4 | admin(4) |
| `#FF9500` | 4 | admin(4) |
| `#FFFAFA` | 4 | admin(4) |
| `#8E8E93` | 4 | ai(4) |
| `#CC0000` | 4 | contact(1), gallery(1), index(1), schedule(1) |
| `#FF4444` | 4 | contact(1), gallery(1), index(1), schedule(1) |
| `#F5F7FA` | 4 | index(4) |
| `#C0CDD8` | 4 | index(4) |
| `#6B3FA0` | 4 | quiz(4) |
| `#4285F4` | 3 | admin(2), ai(1) |
| `#FBBC05` | 3 | admin(2), ai(1) |
| `#EA4335` | 3 | admin(2), ai(1) |
| `#14532D` | 3 | motion(2), admin(1) |
| `#86EFAC` | 3 | motion(2), admin(1) |
| `#6FE39A` | 3 | admin(2), voice(1) |
| `#F0FFF4` | 3 | admin(3) |
| `#34C759` | 3 | admin(3) |
| `#0071E3` | 3 | admin(3) |
| `#F0F6FF` | 3 | admin(3) |
| `#FFF9F0` | 3 | admin(3) |
| `#FFF3E0` | 3 | admin(2), ai(1) |
| `#F5F5F5` | 3 | admin(2), motion(1) |
| `#F0F0F2` | 3 | motion-legacy(2), ai(1) |
| `#FFE000` | 3 | gallery(1), locations(1), staff(1) |
| `#F2F4F7` | 3 | index(3) |
| `#3A5070` | 3 | index(3) |
| `#EEE` | 3 | motion-legacy(2), quiz(1) |
| `#DDD` | 3 | motion(3) |
| `#F0F8FF` | 3 | motion(3) |
| `#A58030` | 2 | admin(2) |
| `#FFBE00` | 2 | admin(1), ai(1) |
| `#FF9999` | 2 | admin(2) |
| `#8E1F14` | 2 | admin(1), motion-legacy(1) |
| `#999` | 2 | admin(1), schedule(1) |
| `#FFF5F5` | 2 | admin(2) |
| `#E77` | 2 | ai(1), board(1) |
| `#FFF0EE` | 2 | ai(1), board(1) |
| `#8B6914` | 2 | index(2) |
| `#B8C5D0` | 2 | index(2) |
| `#86868B` | 2 | motion(2) |
| `#D4D4D4` | 2 | motion(2) |
| `#7EE787` | 2 | motion(1), voice(1) |
| `#92400E` | 2 | motion(2) |
| `#1E3A8A` | 2 | motion(2) |
| `#F0FDF4` | 2 | motion(2) |
| `#EFF6FF` | 2 | motion(2) |
| `#777` | 2 | motion(2) |
| `#FFC93C` | 2 | quiz(2) |
| `#C9660A` | 2 | quiz(2) |
| `#EEF3FF` | 2 | virtual(2) |
| `#FF3B3B` | 2 | voice(2) |
| `#E8EFF8` | 1 | admin(1) |
| `#FFF8E1` | 1 | admin(1) |
| `#FFE082` | 1 | admin(1) |
| `#7D5C00` | 1 | admin(1) |
| `#B87A00` | 1 | admin(1) |
| `#166534` | 1 | admin(1) |
| `#1A1A2E` | 1 | admin(1) |
| `#16213E` | 1 | admin(1) |
| `#2E1A1A` | 1 | admin(1) |
| `#3E1616` | 1 | admin(1) |
| `#FFF8F8` | 1 | admin(1) |
| `#E8F9EE` | 1 | admin(1) |
| `#FFFDE7` | 1 | admin(1) |
| `#F3E8DC` | 1 | admin(1) |
| `#8A5A1E` | 1 | admin(1) |
| `#E6F0FF` | 1 | admin(1) |
| `#E0E0E2` | 1 | ai(1) |
| `#161616` | 1 | ai(1) |
| `#252525` | 1 | ai(1) |
| `#3A3A3A` | 1 | ai(1) |
| `#1A0505` | 1 | ai(1) |
| `#2D0A0A` | 1 | ai(1) |
| `#C77` | 1 | ai(1) |
| `#2A0A0A` | 1 | ai(1) |
| `#E8F5E9` | 1 | ai(1) |
| `#7A4800` | 1 | ai(1) |
| `#E08070` | 1 | board(1) |
| `#2A3A50` | 1 | index(1) |
| `#A00D24` | 1 | index(1) |
| `#2A3A4A` | 1 | index(1) |
| `#8B0000` | 1 | index(1) |
| `#5A6A7A` | 1 | index(1) |
| `#C8D4E0` | 1 | index(1) |
| `#1A0A12` | 1 | index(1) |
| `#2A3D55` | 1 | index(1) |
| `#1E1E14` | 1 | locations(1) |
| `#E0E0E0` | 1 | motion-legacy(1) |
| `#FFF3CD` | 1 | motion-legacy(1) |
| `#B0D0F0` | 1 | motion(1) |
| `#0D1117` | 1 | motion(1) |
| `#FFFBE6` | 1 | motion(1) |
| `#F0E0A0` | 1 | motion(1) |
| `#6B5A1A` | 1 | motion(1) |
| `#6B7280` | 1 | motion(1) |
| `#BFDBFE` | 1 | motion(1) |
| `#1E40AF` | 1 | motion(1) |
| `#1E3A5F` | 1 | motion(1) |
| `#64748B` | 1 | motion(1) |
| `#FFFBEB` | 1 | motion(1) |
| `#FCD34D` | 1 | motion(1) |
| `#78350F` | 1 | motion(1) |
| `#FEF2F2` | 1 | motion(1) |
| `#FCA5A5` | 1 | motion(1) |
| `#7F1D1D` | 1 | motion(1) |
| `#FFF7ED` | 1 | motion(1) |
| `#FED7AA` | 1 | motion(1) |
| `#9A3412` | 1 | motion(1) |
| `#B45309` | 1 | motion(1) |
| `#FFEDD5` | 1 | motion(1) |
| `#E5E5E5` | 1 | motion(1) |
| `#2563EB` | 1 | motion(1) |
| `#FFF0F0` | 1 | motion(1) |
| `#FF4757` | 1 | quiz(1) |
| `#3B82F6` | 1 | quiz(1) |
| `#1E56D9` | 1 | quiz(1) |
| `#9B5DE5` | 1 | quiz(1) |
| `#22C55E` | 1 | quiz(1) |
| `#2B2140` | 1 | quiz(1) |
| `#6B6284` | 1 | quiz(1) |
| `#7C3AED` | 1 | quiz(1) |
| `#A855F7` | 1 | quiz(1) |
| `#EC4899` | 1 | quiz(1) |
| `#FB923C` | 1 | quiz(1) |
| `#7A5200` | 1 | quiz(1) |
| `#4FC3F7` | 1 | quiz(1) |
| `#1741A6` | 1 | quiz(1) |
| `#FF8A80` | 1 | quiz(1) |
| `#9B0C22` | 1 | quiz(1) |
| `#E9F9EE` | 1 | quiz(1) |
| `#7BD79A` | 1 | quiz(1) |
| `#FFF3E8` | 1 | quiz(1) |
| `#FFC98A` | 1 | quiz(1) |
| `#0E8A3E` | 1 | quiz(1) |
| `#B96A00` | 1 | quiz(1) |
| `#FFF6DA` | 1 | quiz(1) |
| `#FFE3EE` | 1 | quiz(1) |
| `#FF8A3D` | 1 | quiz(1) |
| `#F0F0F8` | 1 | virtual(1) |
| `#7A8A9A` | 1 | virtual(1) |
| `#0D1218` | 1 | virtual(1) |
| `#0A0D12` | 1 | virtual(1) |
| `#100D16` | 1 | virtual(1) |
| `#0047A3` | 1 | virtual(1) |
| `#F7F9FF` | 1 | virtual(1) |
| `#ABABAB` | 1 | virtual(1) |
| `#3A1D1D` | 1 | virtual(1) |
| `#F5DC00` | 1 | virtual(1) |
| `#0F1115` | 1 | voice(1) |
| `#181B22` | 1 | voice(1) |
| `#2A2E38` | 1 | voice(1) |
| `#F2F2F4` | 1 | voice(1) |
| `#9A9FAC` | 1 | voice(1) |
| `#3A3F4B` | 1 | voice(1) |
| `#2A1F1F` | 1 | voice(1) |
| `#5A2C2C` | 1 | voice(1) |
| `#FFB4B4` | 1 | voice(1) |
| `#FF8080` | 1 | voice(1) |

</details>

### 2-4. rgb/rgba 원값 전체 목록

<details><summary>펼치기 — 136개</summary>

#### rgb/rgba 원값 — 고유값 136개 / 총 527회

| 값 | 횟수 | 사용 파일(파일별 횟수) |
|---|---|---|
| `rgba(255,255,255,0.08)` | 24 | contact(4), schedule(4), staff(4), admin(2), ai(2), board(2), locations(2), motion-legacy(2), virtual(2) |
| `rgba(0,0,0,0.5)` | 23 | contact(4), schedule(4), staff(3), center(2), gallery(2), index(2), locations(2), admin(1), ai(1), board(1), motion-legacy(1) |
| `rgba(0,0,0,0.08)` | 20 | contact(4), schedule(4), staff(3), locations(2), virtual(2), admin(1), ai(1), board(1), center(1), index(1) |
| `rgba(200,16,46,0.2)` | 18 | index(5), gallery(4), contact(3), schedule(3), staff(2), admin(1) |
| `rgba(200,16,46,0.15)` | 17 | contact(4), gallery(4), index(3), schedule(3), locations(2), staff(1) |
| `rgba(10,10,10,0.97)` | 15 | ai(2), contact(2), gallery(2), schedule(2), staff(2), board(1), center(1), locations(1), motion-legacy(1), virtual(1) |
| `rgba(255,255,255,0.97)` | 14 | contact(2), index(2), schedule(2), staff(2), ai(1), board(1), center(1), locations(1), motion-legacy(1), virtual(1) |
| `rgba(200,16,46,0.4)` | 13 | contact(3), gallery(3), index(3), schedule(3), voice(1) |
| `rgba(201,168,76,0.12)` | 12 | board(3), index(2), ai(1), contact(1), locations(1), motion-legacy(1), schedule(1), staff(1), virtual(1) |
| `rgba(255,255,255,0.06)` | 12 | ai(2), contact(2), schedule(2), staff(2), board(1), locations(1), motion-legacy(1), virtual(1) |
| `rgba(200,16,46,0.1)` | 11 | contact(2), gallery(2), index(2), locations(2), schedule(2), admin(1) |
| `rgba(200,16,46,0.3)` | 10 | admin(2), index(2), locations(2), contact(1), gallery(1), schedule(1), staff(1) |
| `rgba(0,0,0,0.3)` | 10 | index(5), admin(1), ai(1), contact(1), gallery(1), schedule(1) |
| `rgba(192,57,43,0.5)` | 10 | ai(4), board(2), motion-legacy(2), admin(1), virtual(1) |
| `rgba(255,255,255,0.03)` | 9 | contact(2), gallery(2), index(2), schedule(2), ai(1) |
| `rgba(255,255,255,0.45)` | 8 | admin(8) |
| `rgba(0,0,0,0.6)` | 8 | ai(2), gallery(2), index(2), motion-legacy(1), virtual(1) |
| `rgba(200,16,46,0.08)` | 8 | gallery(3), staff(2), contact(1), index(1), schedule(1) |
| `rgba(0,0,0,0.7)` | 7 | gallery(2), index(2), ai(1), contact(1), schedule(1) |
| `rgba(200,16,46,0.04)` | 6 | admin(2), contact(1), gallery(1), index(1), schedule(1) |
| `rgba(255,255,255,0.5)` | 6 | admin(6) |
| `rgba(201,168,76,0.4)` | 6 | admin(3), board(1), virtual(1), voice(1) |
| `rgba(201,168,76,0.1)` | 6 | admin(3), virtual(2), voice(1) |
| `rgba(255,255,255,0.2)` | 6 | admin(4), center(2) |
| `rgba(192,57,43,0.3)` | 6 | ai(3), board(1), motion-legacy(1), virtual(1) |
| `rgba(255,224,0,0.3)` | 6 | contact(2), gallery(2), schedule(2) |
| `rgba(0,0,0,0.95)` | 6 | gallery(2), index(2), contact(1), schedule(1) |
| `rgba(255,255,255,0.55)` | 5 | admin(5) |
| `rgba(255,255,255,0.4)` | 5 | admin(3), center(1), quiz(1) |
| `rgba(255,255,255,0.05)` | 5 | admin(4), index(1) |
| `rgba(192,57,43,0.4)` | 5 | board(2), admin(1), ai(1), virtual(1) |
| `rgba(192,57,43,0.2)` | 5 | virtual(3), admin(1), motion-legacy(1) |
| `rgba(255,255,255,0.02)` | 5 | locations(2), staff(2), ai(1) |
| `rgba(201,168,76,0.08)` | 5 | virtual(2), ai(1), board(1), motion-legacy(1) |
| `rgba(0,0,0,0.12)` | 4 | admin(1), ai(1), index(1), virtual(1) |
| `rgba(201,168,76,0.3)` | 4 | virtual(2), admin(1), board(1) |
| `rgba(201,168,76,0.15)` | 4 | voice(2), admin(1), board(1) |
| `rgba(201,168,76,0.6)` | 4 | admin(2), ai(1), voice(1) |
| `rgba(255,255,255,0.25)` | 4 | admin(3), quiz(1) |
| `rgba(192,57,43,0.15)` | 4 | virtual(2), ai(1), board(1) |
| `rgba(0,51,160,0.12)` | 4 | contact(1), gallery(1), index(1), schedule(1) |
| `rgba(255,224,0,0.2)` | 4 | contact(1), gallery(1), index(1), schedule(1) |
| `rgba(0,51,160,0.1)` | 4 | contact(1), gallery(1), index(1), schedule(1) |
| `rgba(255,224,0,0.05)` | 4 | contact(1), gallery(1), index(1), schedule(1) |
| `rgba(255,224,0,0.15)` | 4 | contact(1), gallery(1), index(1), schedule(1) |
| `rgba(255,0,0,0.1)` | 4 | contact(1), gallery(1), index(1), schedule(1) |
| `rgba(255,0,0,0.3)` | 4 | contact(1), gallery(1), index(1), schedule(1) |
| `rgba(255,0,0,0.2)` | 4 | contact(1), gallery(1), index(1), schedule(1) |
| `rgba(0,0,0,0.4)` | 4 | gallery(2), index(2) |
| `rgba(201,168,76,0.5)` | 3 | index(2), admin(1) |
| `rgba(255,255,255,0.7)` | 3 | admin(3) |
| `rgba(192,57,43,0.1)` | 3 | admin(1), ai(1), board(1) |
| `rgba(192,57,43,0.08)` | 3 | virtual(2), ai(1) |
| `rgba(0,0,0,0.28)` | 3 | ai(2), motion-legacy(1) |
| `rgba(201,168,76,0.2)` | 3 | virtual(2), ai(1) |
| `rgba(255,224,0,0.08)` | 3 | contact(1), gallery(1), schedule(1) |
| `rgba(255,224,0,0.1)` | 3 | contact(1), gallery(1), schedule(1) |
| `rgba(12,12,12,0.98)` | 3 | gallery(2), index(1) |
| `rgba(0,0,0,0.25)` | 3 | quiz(2), index(1) |
| `rgba(200,16,46,0.12)` | 2 | admin(1), staff(1) |
| `rgba(255,255,255,0.99)` | 2 | admin(1), index(1) |
| `rgba(255,255,255,0.15)` | 2 | admin(2) |
| `rgba(255,255,255,0.07)` | 2 | admin(2) |
| `rgba(255,255,255,0.35)` | 2 | admin(1), quiz(1) |
| `rgba(46,204,113,0.6)` | 2 | admin(1), voice(1) |
| `rgba(46,204,113,0.1)` | 2 | admin(1), voice(1) |
| `rgba(255,255,255,0.3)` | 2 | admin(1), center(1) |
| `rgba(255,255,255,0.04)` | 2 | ai(1), virtual(1) |
| `rgba(0,0,0,0.45)` | 2 | ai(1), index(1) |
| `rgba(201,168,76,0.35)` | 2 | board(2) |
| `rgba(201,168,76,0.04)` | 2 | board(1), motion-legacy(1) |
| `rgba(200,16,46,0.06)` | 2 | index(2) |
| `rgba(0,0,0,0.06)` | 2 | index(2) |
| `rgba(13,27,46,0.06)` | 2 | index(2) |
| `rgba(200,16,46,0.25)` | 2 | index(1), locations(1) |
| `rgba(0,0,0,0.1)` | 2 | index(1), quiz(1) |
| `rgba(200,16,46,0.18)` | 2 | locations(1), staff(1) |
| `rgba(192,57,43,0.02)` | 2 | motion-legacy(2) |
| `rgba(192,57,43,0.12)` | 2 | motion-legacy(1), virtual(1) |
| `rgba(0,0,0,0.2)` | 2 | quiz(2) |
| `rgba(0,0,0,0.04)` | 2 | virtual(2) |
| `rgba(255,255,255,0.78)` | 2 | virtual(2) |
| `rgba(192,57,43,0.35)` | 2 | virtual(2) |
| `rgba(0,71,163,0.08)` | 2 | virtual(2) |
| `rgba(0,71,163,0.07)` | 2 | virtual(2) |
| `rgba(192,57,43,0.04)` | 2 | virtual(2) |
| `rgba(255,59,59,0)` | 2 | voice(2) |
| `rgba(201,168,76,0.75)` | 1 | admin(1) |
| `rgba(255,255,255,0.8)` | 1 | admin(1) |
| `rgba(255,255,255,0.12)` | 1 | admin(1) |
| `rgba(192,57,43,0.6)` | 1 | admin(1) |
| `rgba(52,199,89,0.3)` | 1 | admin(1) |
| `rgba(0,113,227,0.2)` | 1 | admin(1) |
| `rgba(10,122,52,0.25)` | 1 | admin(1) |
| `rgba(138,91,0,0.25)` | 1 | admin(1) |
| `rgba(0,85,179,0.25)` | 1 | admin(1) |
| `rgba(192,57,43,0.07)` | 1 | ai(1) |
| `rgba(255,149,0,0.12)` | 1 | ai(1) |
| `rgba(255,149,0,0.45)` | 1 | ai(1) |
| `rgba(201,168,76,0.07)` | 1 | ai(1) |
| `rgba(192,57,43,0.8)` | 1 | center(1) |
| `rgba(201,168,76,0.10)` | 1 | index(1) |
| `rgba(200,16,46,0.05)` | 1 | index(1) |
| `rgba(13,27,46,0.04)` | 1 | index(1) |
| `rgba(200,16,46,0.6)` | 1 | index(1) |
| `rgba(255,255,255,0.10)` | 1 | index(1) |
| `rgba(255,255,255,0.22)` | 1 | index(1) |
| `rgba(255,220,0,0.08)` | 1 | locations(1) |
| `rgba(255,220,0,0.25)` | 1 | locations(1) |
| `rgba(255,220,0,0.18)` | 1 | locations(1) |
| `rgba(201,168,76,0.28)` | 1 | motion-legacy(1) |
| `rgba(0,0,0,0.88)` | 1 | motion-legacy(1) |
| `rgba(192,57,43,0.05)` | 1 | motion-legacy(1) |
| `rgba(192,57,43,0.03)` | 1 | motion-legacy(1) |
| `rgba(0,0,0,0.55)` | 1 | motion-legacy(1) |
| `rgba(201,168,76,0.85)` | 1 | motion-legacy(1) |
| `rgba(0,220,80,0.85)` | 1 | motion(1) |
| `rgba(255,50,50,0.9)` | 1 | motion(1) |
| `rgba(255,255,255,0.85)` | 1 | quiz(1) |
| `rgba(0,0,0,0.15)` | 1 | quiz(1) |
| `rgba(60,20,90,0.25)` | 1 | quiz(1) |
| `rgba(155,93,229,0.15)` | 1 | quiz(1) |
| `rgba(107,63,160,0.35)` | 1 | quiz(1) |
| `rgba(107,63,160,0.3)` | 1 | quiz(1) |
| `rgba(30,86,217,0.35)` | 1 | quiz(1) |
| `rgba(200,16,46,0.35)` | 1 | quiz(1) |
| `rgba(192,57,43,0.06)` | 1 | virtual(1) |
| `rgba(255,255,255,0.72)` | 1 | virtual(1) |
| `rgba(255,255,255,0.1)` | 1 | virtual(1) |
| `rgba(255,255,255,0.62)` | 1 | virtual(1) |
| `rgba(201,168,76,0.06)` | 1 | virtual(1) |
| `rgba(192,57,43,0.32)` | 1 | virtual(1) |
| `rgba(192,57,43,0.45)` | 1 | virtual(1) |
| `rgba(254,229,0,0.2)` | 1 | virtual(1) |
| `rgba(254,229,0,0.3)` | 1 | virtual(1) |
| `rgba(255,59,59,0.55)` | 1 | voice(1) |

</details>

### 2-5. 타이포그래피

관찰된 사실:
- 서체 패밀리 실사용: Bebas Neue 111회, Noto Sans KR 91회, Jua 10회(quiz), Black Han Sans 4회, monospace 8회(motion, admin, motion-legacy), Georgia 1회(`index.html:331`), `inherit` 15회.
- Bebas Neue가 지정된 요소에 한글 텍스트가 들어간다: `.section-title`(index·contact·schedule·locations·staff 등, 예: "왜 더스텝퍼인가"), `staff.html:110,127` `.card-name`(한글 이름), `.page-title`, contact·gallery의 인라인 h1 (`contact.html:353`, `gallery.html:309`). Bebas Neue(Google Fonts)는 라틴 문자 세트만 제공하므로 이 한글은 대체 서체로 표시된다.
- **불러온 굵기와 쓰는 굵기가 다름**: 10개 페이지(ai, board, contact, gallery, index, locations, schedule, staff, virtual, motion-legacy)는 Noto Sans KR 300·400·500·700·900만 불러오는데, CSS는 `600`을 95회, `800`을 36회 쓴다. admin은 400·500·600·700만 불러오고 `800`을 13회 쓴다. 굵기를 모두 맞게 불러오는 곳은 quiz뿐(400·600·700·800·900).
- 굵기 표기 혼용: 숫자(700 등)와 `bold` 6회(motion).
- font-size 단위 혼용: px 대부분, `rem` (motion 전부), `clamp()` (제목류), `em`.

#### font-family — 고유값 11개 / 총 240회

| 값 | 횟수 | 사용 파일(파일별 횟수) |
|---|---|---|
| `'Bebas Neue',sans-serif` | 105 | contact(20), index(19), gallery(18), schedule(17), locations(9), staff(9), admin(4), ai(4), board(3), motion-legacy(2) |
| `'Noto Sans KR',sans-serif` | 84 | admin(29), ai(15), board(11), motion-legacy(10), locations(5), contact(3), index(3), schedule(3), gallery(2), staff(2), quiz(1) |
| `inherit` | 15 | admin(8), voice(7) |
| `'Jua',sans-serif` | 10 | quiz(10) |
| `monospace` | 8 | motion(6), admin(1), motion-legacy(1) |
| `'Bebas Neue', sans-serif` | 6 | virtual(6) |
| `'Noto Sans KR', sans-serif` | 5 | virtual(4), center(1) |
| `'Black Han Sans',sans-serif` | 4 | contact(1), gallery(1), index(1), schedule(1) |
| `Georgia,serif` | 1 | index(1) |
| `'Noto Sans KR', -apple-system, sans-serif` | 1 | motion(1) |
| `'Noto Sans KR', -apple-system, BlinkMacSystemFont, sans-serif` | 1 | voice(1) |

#### font-weight — 고유값 7개 / 총 404회

| 값 | 횟수 | 사용 파일(파일별 횟수) |
|---|---|---|
| `700` | 243 | admin(66), index(30), contact(24), ai(19), schedule(18), gallery(17), motion-legacy(13), virtual(13), voice(10), board(9), locations(9), staff(9), quiz(3), center(2), motion(1) |
| `600` | 95 | admin(18), index(15), gallery(9), contact(8), schedule(8), board(7), motion-legacy(7), ai(6), staff(5), virtual(4), locations(3), quiz(3), center(1), voice(1) |
| `800` | 36 | admin(13), ai(4), index(3), motion-legacy(3), quiz(3), virtual(3), voice(2), board(1), contact(1), locations(1), schedule(1), staff(1) |
| `400` | 11 | admin(6), voice(2), locations(1), motion-legacy(1), virtual(1) |
| `500` | 7 | index(3), contact(1), gallery(1), schedule(1), voice(1) |
| `900` | 6 | virtual(4), index(1), motion-legacy(1) |
| `bold` | 6 | motion(6) |

#### font-size — 고유값 62개 / 총 970회

| 값 | 횟수 | 사용 파일(파일별 횟수) |
|---|---|---|
| `11px` | 186 | admin(77), ai(17), contact(13), locations(12), board(11), index(11), motion-legacy(10), schedule(9), staff(9), gallery(6), virtual(6), voice(5) |
| `13px` | 161 | admin(65), index(17), ai(12), contact(11), gallery(11), schedule(11), motion-legacy(7), board(6), locations(5), virtual(5), voice(5), staff(3), quiz(2), motion(1) |
| `12px` | 123 | admin(57), ai(11), index(8), motion-legacy(8), gallery(6), virtual(6), board(5), contact(5), schedule(5), locations(4), staff(4), voice(3), quiz(1) |
| `14px` | 114 | admin(19), schedule(15), contact(13), gallery(13), index(13), motion-legacy(11), ai(10), board(7), staff(5), locations(4), virtual(2), center(1), voice(1) |
| `10px` | 49 | admin(11), contact(5), gallery(5), index(5), schedule(5), virtual(5), ai(4), staff(3), board(2), locations(2), voice(2) |
| `16px` | 36 | ai(5), contact(5), index(5), gallery(4), schedule(4), voice(4), quiz(2), staff(2), admin(1), board(1), center(1), motion-legacy(1), virtual(1) |
| `20px` | 30 | virtual(5), admin(3), contact(3), gallery(3), index(3), schedule(3), ai(2), board(2), locations(2), motion-legacy(2), quiz(1), staff(1) |
| `15px` | 27 | virtual(6), contact(4), quiz(3), admin(2), ai(2), locations(2), motion-legacy(2), voice(2), board(1), gallery(1), index(1), schedule(1) |
| `22px` | 27 | contact(4), gallery(4), index(4), schedule(4), admin(3), center(3), locations(2), staff(2), virtual(1) |
| `32px` | 20 | index(5), gallery(4), contact(3), schedule(3), admin(1), center(1), locations(1), motion-legacy(1), virtual(1) |
| `0.85rem` | 20 | motion(20) |
| `18px` | 14 | admin(3), quiz(2), virtual(2), ai(1), board(1), contact(1), index(1), motion-legacy(1), staff(1), voice(1) |
| `28px` | 13 | contact(2), motion-legacy(2), quiz(2), virtual(2), ai(1), board(1), gallery(1), index(1), schedule(1) |
| `26px` | 12 | admin(4), contact(2), gallery(2), index(2), schedule(2) |
| `48px` | 11 | locations(4), gallery(2), index(2), contact(1), schedule(1), staff(1) |
| `clamp(36px,8vw,72px)` | 9 | contact(2), index(2), schedule(2), gallery(1), locations(1), staff(1) |
| `12.5px` | 8 | admin(4), voice(3), ai(1) |
| `44px` | 7 | ai(1), contact(1), gallery(1), index(1), motion(1), schedule(1), voice(1) |
| `0.8rem` | 7 | motion(7) |
| `30px` | 6 | staff(2), contact(1), gallery(1), index(1), schedule(1) |
| `9px` | 5 | admin(4), ai(1) |
| `17px` | 5 | ai(2), motion-legacy(1), motion(1), virtual(1) |
| `24px` | 5 | contact(1), gallery(1), index(1), quiz(1), schedule(1) |
| `52px` | 4 | ai(2), quiz(2) |
| `40px` | 4 | ai(1), board(1), staff(1), voice(1) |
| `clamp(60px,15vw,130px)` | 4 | contact(1), gallery(1), index(1), schedule(1) |
| `clamp(18px,4vw,38px)` | 4 | contact(1), gallery(1), index(1), schedule(1) |
| `clamp(13px,3vw,18px)` | 4 | contact(1), gallery(1), index(1), schedule(1) |
| `clamp(12px,3vw,15px)` | 4 | contact(1), gallery(1), index(1), schedule(1) |
| `clamp(44px,10vw,84px)` | 4 | contact(1), gallery(1), locations(1), staff(1) |
| `36px` | 4 | index(1), locations(1), motion-legacy(1), virtual(1) |
| `0.76rem` | 4 | motion(4) |
| `13.5px` | 3 | ai(1), virtual(1), voice(1) |
| `0.82rem` | 3 | motion(3) |
| `0.78rem` | 3 | motion(3) |
| `0.83rem` | 2 | motion(2) |
| `56px` | 2 | quiz(1), staff(1) |
| `11.5px` | 2 | voice(2) |
| `clamp(28px,6vw,46px)` | 1 | ai(1) |
| `42px` | 1 | motion-legacy(1) |
| `1.1rem` | 1 | motion(1) |
| `0.95rem` | 1 | motion(1) |
| `0.9rem` | 1 | motion(1) |
| `0.88rem` | 1 | motion(1) |
| `0.84rem` | 1 | motion(1) |
| `0.68rem` | 1 | motion(1) |
| `64px` | 1 | quiz(1) |
| `clamp(30px,8vw,42px)` | 1 | quiz(1) |
| `clamp(19px,5.2vw,24px)` | 1 | quiz(1) |
| `clamp(52px,14vw,80px)` | 1 | quiz(1) |
| `19px` | 1 | quiz(1) |
| `14.5px` | 1 | quiz(1) |
| `74px` | 1 | quiz(1) |
| `clamp(26px, 5vw, 52px)` | 1 | virtual(1) |
| `clamp(14px, 2.5vw, 20px)` | 1 | virtual(1) |
| `clamp(22px, 4vw, 42px)` | 1 | virtual(1) |
| `clamp(24px, 4vw, 42px)` | 1 | virtual(1) |
| `60px` | 1 | virtual(1) |
| `clamp(26px, 5.5vw, 44px)` | 1 | virtual(1) |
| `clamp(22px, 4vw, 40px)` | 1 | virtual(1) |
| `21px` | 1 | voice(1) |
| `34px` | 1 | voice(1) |

### 2-6. border-radius · box-shadow · text-shadow · gradient · backdrop-filter

관찰된 사실:
- border-radius 30종. 주력 값 3개(8px 85회, 10px 75회, 12px 57회) 외에 4·5·6·7·14·16·18·20·22·24·28·30·40·50px 등이 섞여 있다. `5px` 25회는 전부 admin.
- box-shadow 46종 중 36종이 1회 사용. 같은 용도로 보이는 것도 `0 8px 32px rgba(0,0,0,0.5)` / `0 8px 28px rgba(0,0,0,0.5)`처럼 수치만 조금 다르다.
- backdrop-filter(글래스 효과): `blur(10px)` 16회 — ai, board, contact, gallery, index, locations, motion-legacy, schedule, staff, virtual의 상단 nav·메뉴 / `blur(8px)` 1회 — `center.html:19`. 모두 반투명 흰 배경 `rgba(255,255,255,0.97)` 또는 `rgba(10,10,10,0.97)`과 함께 쓰인다. `-webkit-` 접두 버전은 0회.

#### border-radius — 고유값 30개 / 총 457회

| 값 | 횟수 | 사용 파일(파일별 횟수) |
|---|---|---|
| `8px` | 85 | admin(23), index(11), contact(10), gallery(10), board(8), schedule(8), ai(6), motion-legacy(4), locations(2), virtual(2), voice(1) |
| `10px` | 75 | admin(32), ai(8), motion-legacy(6), voice(6), board(4), locations(4), virtual(4), contact(2), gallery(2), index(2), quiz(2), schedule(2), staff(1) |
| `12px` | 57 | admin(8), gallery(7), index(7), motion-legacy(7), contact(6), schedule(6), ai(5), voice(4), virtual(3), locations(2), board(1), staff(1) |
| `50%` | 39 | ai(6), index(6), admin(4), center(3), motion-legacy(3), virtual(3), voice(3), contact(2), gallery(2), quiz(2), schedule(2), board(1), locations(1), staff(1) |
| `20px` | 33 | admin(5), ai(4), index(4), contact(3), gallery(3), quiz(3), schedule(3), virtual(3), voice(2), locations(1), motion-legacy(1), staff(1) |
| `4px` | 33 | motion(17), admin(5), center(2), contact(2), gallery(2), index(2), schedule(2), motion-legacy(1) |
| `5px` | 25 | admin(25) |
| `6px` | 20 | admin(7), board(3), motion-legacy(3), ai(2), locations(2), motion(1), staff(1), virtual(1) |
| `16px` | 19 | virtual(4), ai(2), contact(2), schedule(2), staff(2), admin(1), board(1), gallery(1), index(1), locations(1), motion-legacy(1), voice(1) |
| `0 0 10px 10px` | 16 | contact(2), gallery(2), index(2), schedule(2), staff(2), admin(1), ai(1), board(1), locations(1), motion-legacy(1), virtual(1) |
| `14px` | 13 | admin(4), motion-legacy(3), index(2), virtual(2), ai(1), voice(1) |
| `30px` | 7 | index(4), contact(1), gallery(1), schedule(1) |
| `50px` | 6 | quiz(2), contact(1), gallery(1), index(1), schedule(1) |
| `7px` | 5 | ai(2), board(2), admin(1) |
| `3px` | 4 | motion(3), ai(1) |
| `2px` | 2 | ai(1), virtual(1) |
| `18px` | 2 | ai(2) |
| `12px 12px 0 0` | 2 | contact(1), motion-legacy(1) |
| `0 0 16px 16px` | 2 | contact(2) |
| `28px` | 2 | quiz(2) |
| `0` | 1 | motion-legacy(1) |
| `4px 16px 16px 16px` | 1 | ai(1) |
| `16px 4px 16px 16px` | 1 | ai(1) |
| `20px 20px 0 0` | 1 | ai(1) |
| `10px 0 0 10px` | 1 | locations(1) |
| `0 0 12px 12px` | 1 | motion-legacy(1) |
| `40px` | 1 | quiz(1) |
| `22px` | 1 | quiz(1) |
| `24px` | 1 | virtual(1) |
| `999px` | 1 | voice(1) |

#### box-shadow — 고유값 46개 / 총 95회

| 값 | 횟수 | 사용 파일(파일별 횟수) |
|---|---|---|
| `0 2px 8px rgba(0,0,0,0.08)` | 11 | contact(2), schedule(2), staff(2), ai(1), board(1), center(1), locations(1), virtual(1) |
| `0 8px 32px rgba(0,0,0,0.5)` | 10 | contact(2), schedule(2), staff(2), ai(1), board(1), locations(1), motion-legacy(1) |
| `0 8px 28px rgba(0,0,0,0.5)` | 10 | contact(2), gallery(2), index(2), schedule(2), locations(1), staff(1) |
| `0 2px 12px rgba(0,0,0,0.08)` | 7 | contact(2), schedule(2), locations(1), staff(1), virtual(1) |
| `0 12px 40px rgba(200,16,46,0.2)` | 6 | gallery(2), index(2), contact(1), schedule(1) |
| `0 12px 32px rgba(0,0,0,0.6)` | 5 | gallery(2), index(2), virtual(1) |
| `0 4px 20px rgba(0,0,0,0.4)` | 4 | gallery(2), index(2) |
| `0 20px 60px rgba(0,0,0,0.6)` | 2 | ai(1), motion-legacy(1) |
| `0 16px 48px rgba(0,0,0,0.28)` | 2 | ai(2) |
| `none` | 2 | motion-legacy(1), quiz(1) |
| `0 4px 24px rgba(0,0,0,0.08)` | 1 | admin(1) |
| `0 2px 12px rgba(200,16,46,0.12)` | 1 | admin(1) |
| `0 8px 32px rgba(0,0,0,0.12)` | 1 | admin(1) |
| `0 20px 60px rgba(0,0,0,0.3)` | 1 | admin(1) |
| `0 1px 3px rgba(0,0,0,0.12)` | 1 | ai(1) |
| `inset 0 0 0 3px #0d0d0d` | 1 | ai(1) |
| `0 1px 4px rgba(0,0,0,0.3)` | 1 | ai(1) |
| `0 4px 16px rgba(0,0,0,0.5)` | 1 | center(1) |
| `0 6px 28px rgba(0,0,0,0.45), 0 0 0 3px rgba(255,255,255,0.05)` | 1 | index(1) |
| `0 4px 16px rgba(192,57,43,0.3)` | 1 | motion-legacy(1) |
| `0 24px 72px rgba(0,0,0,0.28)` | 1 | motion-legacy(1) |
| `0 4px 14px rgba(0,0,0,0.15)` | 1 | quiz(1) |
| `0 16px 40px rgba(60,20,90,0.25)` | 1 | quiz(1) |
| `0 10px 0 #6B3FA0, 0 16px 24px rgba(107,63,160,0.35)` | 1 | quiz(1) |
| `0 4px 0 #6B3FA0, 0 8px 16px rgba(107,63,160,0.3)` | 1 | quiz(1) |
| `inset 0 2px 4px rgba(0,0,0,0.1)` | 1 | quiz(1) |
| `0 8px 0 #1741A6, 0 14px 20px rgba(30,86,217,0.35)` | 1 | quiz(1) |
| `0 8px 0 #9B0C22, 0 14px 20px rgba(200,16,46,0.35)` | 1 | quiz(1) |
| `0 4px 0 rgba(0,0,0,0.2), 0 8px 14px rgba(0,0,0,0.25)` | 1 | quiz(1) |
| `0 7px 0 #6B3FA0` | 1 | quiz(1) |
| `0 3px 0 #6B3FA0` | 1 | quiz(1) |
| `0 8px 0 #C9660A` | 1 | quiz(1) |
| `0 4px 0 #C9660A` | 1 | quiz(1) |
| `0 8px 28px rgba(0,0,0,0.12)` | 1 | virtual(1) |
| `0 16px 40px rgba(201,168,76,0.06)` | 1 | virtual(1) |
| `0 8px 48px rgba(0,71,163,0.08), 0 0 0 1.5px rgba(0,71,163,0.07)` | 1 | virtual(1) |
| `0 6px 24px rgba(192,57,43,0.32)` | 1 | virtual(1) |
| `0 10px 32px rgba(192,57,43,0.45)` | 1 | virtual(1) |
| `0 4px 20px rgba(192,57,43,0.35)` | 1 | virtual(1) |
| `0 8px 30px rgba(192,57,43,0.5)` | 1 | virtual(1) |
| `0 4px 20px rgba(254,229,0,0.2)` | 1 | virtual(1) |
| `0 8px 30px rgba(254,229,0,0.3)` | 1 | virtual(1) |
| `0 4px 20px rgba(200,16,46,0.4)` | 1 | voice(1) |
| `0 0 0 0 rgba(255,59,59,0.55)` | 1 | voice(1) |
| `0 0 0 22px rgba(255,59,59,0)` | 1 | voice(1) |
| `0 0 0 0 rgba(255,59,59,0)` | 1 | voice(1) |

#### text-shadow — 고유값 14개 / 총 16회

| 값 | 횟수 | 사용 파일(파일별 횟수) |
|---|---|---|
| `0 1px 3px rgba(0,0,0,0.3)` | 3 | index(3) |
| `0 2px 8px rgba(0,0,0,0.12)` | 1 | index(1) |
| `0 2px 8px rgba(200,16,46,0.25)` | 1 | index(1) |
| `0 1px 4px rgba(200,16,46,0.2)` | 1 | index(1) |
| `none` | 1 | index(1) |
| `-1px -1px 0 #0D1B2E,1px -1px 0 #0D1B2E,-1px 1px 0 #0D1B2E,1px 1px 0 #0D1B2E,0 2px 10px rgba(0,0,0,0.25)` | 1 | index(1) |
| `0 1px 4px rgba(0,0,0,0.08)` | 1 | index(1) |
| `0 1px 4px rgba(0,0,0,0.3)` | 1 | index(1) |
| `0 1px 3px rgba(0,0,0,0.1)` | 1 | index(1) |
| `0 1px 2px rgba(0,0,0,0.06)` | 1 | index(1) |
| `-1px -1px 0 #0D1B2E,1px -1px 0 #0D1B2E,-1px 1px 0 #0D1B2E,1px 1px 0 #0D1B2E` | 1 | index(1) |
| `0 2px 8px rgba(0,0,0,0.25)` | 1 | quiz(1) |
| `2px 2px 0 rgba(155,93,229,0.15)` | 1 | quiz(1) |
| `0 2px 6px rgba(0,0,0,0.2)` | 1 | quiz(1) |

#### gradient — 고유값 58개 / 총 117회

| 값 | 횟수 | 사용 파일(파일별 횟수) |
|---|---|---|
| `linear-gradient(90deg,transparent,#222,transparent)` | 13 | contact(4), gallery(4), schedule(4), staff(1) |
| `linear-gradient(45deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)` | 10 | contact(2), gallery(2), index(2), schedule(2), locations(1), staff(1) |
| `linear-gradient(to top,rgba(0,0,0,0.7),transparent)` | 6 | gallery(2), index(2), contact(1), schedule(1) |
| `linear-gradient(90deg,transparent,#D8E0EA,transparent)` | 6 | index(6) |
| `linear-gradient(90deg,var(--red),var(--yellow))` | 5 | contact(1), gallery(1), index(1), schedule(1), staff(1) |
| `radial-gradient(ellipse at 20% 50%,rgba(200,16,46,0.15) 0%,transparent 60%)` | 4 | contact(1), gallery(1), index(1), schedule(1) |
| `radial-gradient(ellipse at 80% 50%,rgba(0,51,160,0.12) 0%,transparent 60%)` | 4 | contact(1), gallery(1), index(1), schedule(1) |
| `linear-gradient(rgba(255,255,255,0.03) 1px,transparent 1px)` | 4 | contact(1), gallery(1), index(1), schedule(1) |
| `linear-gradient(90deg,rgba(255,255,255,0.03) 1px,transparent 1px)` | 4 | contact(1), gallery(1), index(1), schedule(1) |
| `linear-gradient(135deg,rgba(200,16,46,0.1),rgba(0,51,160,0.1))` | 4 | contact(1), gallery(1), index(1), schedule(1) |
| `radial-gradient(ellipse at 50% 0%,rgba(200,16,46,0.15),transparent 60%)` | 3 | contact(1), gallery(1), locations(1) |
| `linear-gradient(135deg,#C0392B,#8e1f14)` | 2 | admin(1), motion-legacy(1) |
| `linear-gradient(135deg,#f5f5f7,#fff0ee)` | 2 | ai(1), board(1) |
| `linear-gradient(180deg,#ffffff,#0d0d0d)` | 2 | contact(1), schedule(1) |
| `radial-gradient(ellipse at 50% 0%,rgba(200,16,46,0.18),transparent 60%)` | 2 | locations(1), staff(1) |
| `linear-gradient(rgba(255,255,255,0.02) 1px,transparent 1px)` | 2 | locations(1), staff(1) |
| `linear-gradient(90deg,rgba(255,255,255,0.02) 1px,transparent 1px)` | 2 | locations(1), staff(1) |
| `linear-gradient(135deg, var(--purple), var(--blue-deep))` | 2 | quiz(2) |
| `linear-gradient(135deg,#f5f5f7 0%,#e8eff8 100%)` | 1 | admin(1) |
| `linear-gradient(135deg,#14532d 0%,#166534 100%)` | 1 | admin(1) |
| `linear-gradient(135deg,#1a1a2e 0%,#16213e 100%)` | 1 | admin(1) |
| `linear-gradient(135deg,#C9A84C,#a58030)` | 1 | admin(1) |
| `linear-gradient(135deg,#2e1a1a 0%,#3e1616 100%)` | 1 | admin(1) |
| `linear-gradient(135deg,#1a0505,#2d0a0a)` | 1 | ai(1) |
| `linear-gradient(45deg,#f09433,#dc2743,#bc1888)` | 1 | contact(1) |
| `linear-gradient(180deg,var(--black),#0d0d0d)` | 1 | gallery(1) |
| `linear-gradient(180deg,var(--black),#F5F7FA)` | 1 | index(1) |
| `linear-gradient(180deg,#F2F4F7,#FFFFFF)` | 1 | index(1) |
| `linear-gradient(90deg,#F5F7FA,transparent)` | 1 | index(1) |
| `linear-gradient(270deg,#F5F7FA,transparent)` | 1 | index(1) |
| `linear-gradient(135deg,var(--red),#8b0000)` | 1 | index(1) |
| `linear-gradient(135deg,rgba(200,16,46,0.05) 0%,#F5F7FA 50%,rgba(13,27,46,0.04) 100%)` | 1 | index(1) |
| `linear-gradient(rgba(13,27,46,0.06) 1px,transparent 1px)` | 1 | index(1) |
| `linear-gradient(90deg,rgba(13,27,46,0.06) 1px,transparent 1px)` | 1 | index(1) |
| `linear-gradient(90deg,#222,transparent)` | 1 | locations(1) |
| `linear-gradient(90deg,var(--red),var(--gold))` | 1 | motion-legacy(1) |
| `radial-gradient(circle at 10% 8%, rgba(255,255,255,0.35), transparent 40%)` | 1 | quiz(1) |
| `radial-gradient(circle at 90% 85%, rgba(255,255,255,0.25), transparent 45%)` | 1 | quiz(1) |
| `linear-gradient(160deg, #7C3AED 0%, #A855F7 25%, #EC4899 50%, #FB923C 75%, #FFC93C 100%)` | 1 | quiz(1) |
| `linear-gradient(90deg, var(--gold), var(--red))` | 1 | quiz(1) |
| `linear-gradient(150deg,#4FC3F7,var(--blue-deep))` | 1 | quiz(1) |
| `linear-gradient(150deg,#FF8A80,var(--red-deep))` | 1 | quiz(1) |
| `linear-gradient(135deg,#FFF6DA,#FFE3EE)` | 1 | quiz(1) |
| `linear-gradient(135deg, var(--gold), #FF8A3D)` | 1 | quiz(1) |
| `linear-gradient(135deg,#1a1a1a,#0d0d0d)` | 1 | staff(1) |
| `linear-gradient(135deg, #f5f5f7 0%, #f0f0f8 50%, #f5f5f7 100%)` | 1 | virtual(1) |
| `linear-gradient(rgba(0,0,0,0.04) 1px, transparent 1px)` | 1 | virtual(1) |
| `linear-gradient(90deg, rgba(0,0,0,0.04) 1px, transparent 1px)` | 1 | virtual(1) |
| `radial-gradient(circle, rgba(192,57,43,0.06) 0%, transparent 70%)` | 1 | virtual(1) |
| `linear-gradient(135deg, var(--red), var(--gold))` | 1 | virtual(1) |
| `linear-gradient(to bottom, #6e6e73, transparent)` | 1 | virtual(1) |
| `linear-gradient(to right, var(--red), var(--gold))` | 1 | virtual(1) |
| `linear-gradient(135deg, #0d0d0d, #111)` | 1 | virtual(1) |
| `linear-gradient(135deg, #0d1218, #0a0d12)` | 1 | virtual(1) |
| `linear-gradient(135deg, #0d0d0d, #100d16)` | 1 | virtual(1) |
| `linear-gradient(160deg, #eef3ff 0%, #f5f5f7 55%, #eef3ff 100%)` | 1 | virtual(1) |
| `linear-gradient(rgba(192,57,43,0.04) 1px, transparent 1px)` | 1 | virtual(1) |
| `linear-gradient(90deg, rgba(192,57,43,0.04) 1px, transparent 1px)` | 1 | virtual(1) |

#### backdrop-filter — 고유값 2개 / 총 17회

| 값 | 횟수 | 사용 파일(파일별 횟수) |
|---|---|---|
| `blur(10px)` | 16 | ai(2), contact(2), gallery(2), index(2), schedule(2), staff(2), board(1), locations(1), motion-legacy(1), virtual(1) |
| `blur(8px)` | 1 | center(1) |

---

## 3. 이모지·특수기호 사용 위치와 역할

- 대상: 이모지(그림 문자) 전부 + 화살표(← → ▶ ◀ ▼ ▸ ↻ ↩ ↑ ⬇), 도형(★ ✦ ✕), 원문자(①~⑩), 기호(© ※ ℹ ·). 박스 선(─ ═)은 주석에만 나온다.
- HTML 엔티티로 넣은 기호 2곳: `center.html:155` `&#8249;`(‹, 이전 슬라이드 버튼), `center.html:182` `&#8250;`(›, 다음 슬라이드 버튼) — 둘 다 **버튼**. 아래 표 집계에는 포함하지 않았다.
- CSS `content:`로 넣은 기호: `index.html:314` `"·"`(커리큘럼 목록 불릿), `staff.html:138` `'·'`(경력 목록 불릿), `virtual.html:343` `'▸'`(모드 특징 불릿) — 장식. 그 밖에 `content:'-'`(contact:170, gallery:104, index:165, schedule:169)는 일반 문자.
- 인라인 SVG 아이콘: admin 2, ai 2, contact 3, gallery 3, index 4, locations 3, schedule 3, staff 3 (그 외 0).

### 3-1. 파일별 요약 (화면 노출 줄 기준, 1줄에 여러 기호면 1건)

| 파일 | 아이콘 | 버튼 | 대체이미지 | 장식 | 구두점 | 합계 | 주석 안(비노출) 줄 |
|---|---|---|---|---|---|---|---|
| admin.html | 35 | 21 | 1 | 7 | 2 | 66 | 66 |
| ai.html | 10 | 9 | 7 | 10 | 2 | 38 | 7 |
| board.html | 2 | 2 | 1 | 2 | 0 | 7 | 1 |
| center.html | 0 | 4 | 0 | 0 | 0 | 4 | 0 |
| contact.html | 7 | 4 | 0 | 1 | 0 | 12 | 1 |
| gallery.html | 3 | 3 | 3 | 1 | 0 | 10 | 0 |
| index.html | 22 | 6 | 11 | 29 | 1 | 69 | 2 |
| locations.html | 12 | 2 | 2 | 1 | 1 | 18 | 0 |
| motion-legacy.html | 4 | 3 | 0 | 2 | 0 | 9 | 71 |
| motion.html | 48 | 4 | 1 | 28 | 1 | 82 | 45 |
| quiz.html | 2 | 3 | 7 | 1 | 0 | 13 | 11 |
| schedule.html | 5 | 1 | 0 | 1 | 0 | 7 | 1 |
| staff.html | 10 | 1 | 0 | 2 | 2 | 15 | 1 |
| virtual.html | 19 | 2 | 0 | 4 | 10 | 35 | 19 |
| voice.html | 28 | 15 | 2 | 1 | 2 | 48 | 34 |
| **합계** | 207 | 80 | 35 | 90 | 21 | 433 | 259 |

### 3-2. 기호별 사용 빈도 (화면 노출 줄 기준)

| 기호 | 줄 수 | 사용 파일 |
|---|---|---|
| · | 78 | admin, ai, board, index, locations, motion-legacy, motion, staff, virtual, voice |
| ❌ | 36 | motion, voice |
| ✅ | 26 | admin, ai, locations, motion, voice |
| ▼ | 22 | index, motion-legacy, motion, staff |
| 🥋 | 20 | admin, ai, contact, index, locations, quiz, virtual |
| ⏳ | 19 | admin, ai, motion, voice |
| ← | 13 | ai, board, center, contact, locations, motion-legacy, schedule, staff, virtual |
| ▶ | 13 | contact, gallery, index, locations, motion, schedule, staff |
| ★ | 12 | index |
| ⚙ | 11 | admin, ai, board, contact, index, locations, motion-legacy, motion, schedule, staff, virtual |
| 🎙 | 10 | admin, ai, board, contact, index, locations, schedule, staff, virtual, voice |
| → | 10 | admin, index, motion, quiz, virtual |
| 💬 | 10 | admin, center, contact, gallery, index, locations, schedule, staff, virtual |
| © | 9 | ai, board, contact, gallery, index, locations, schedule, staff, virtual |
| ⚠ | 8 | admin, motion |
| 🤖 | 7 | admin, ai, index, motion, virtual |
| 📷 | 7 | contact, gallery, index, locations, schedule, staff |
| 🔄 | 6 | admin, motion, quiz |
| 📸 | 6 | gallery, index |
| 📋 | 4 | admin, contact, motion-legacy |
| 🧠 | 4 | admin, voice |
| ➕ | 4 | admin |
| 📍 | 4 | admin, locations |
| ⚠️ | 4 | admin |
| 📬 | 4 | ai |
| ✦ | 4 | ai, index |
| ✕ | 4 | center, gallery, index, motion-legacy |
| 💾 | 4 | motion, voice |
| ※ | 4 | motion |
| 🎮 | 3 | admin, index, virtual |
| 📩 | 3 | ai |
| 📞 | 3 | center, contact, virtual |
| 🗺 | 3 | locations |
| 📹 | 3 | motion-legacy, motion, virtual |
| ① | 3 | motion, voice |
| ② | 3 | motion, voice |
| 🏆 | 3 | quiz, virtual |
| 🎤 | 3 | voice |
| 🏠 | 2 | admin, quiz |
| 👥 | 2 | admin, index |
| 📝 | 2 | admin, voice |
| ✏️ | 2 | admin, voice |
| 📊 | 2 | admin, virtual |
| 🎯 | 2 | admin, virtual |
| 🎉 | 2 | admin, quiz |
| 📚 | 2 | admin, motion |
| 👨‍🏫 | 2 | ai |
| ◀ | 2 | gallery, index |
| 📄 | 2 | motion-legacy, motion |
| 🔒 | 2 | motion, voice |
| ③ | 2 | motion |
| ⭐ | 2 | quiz |
| 🥽 | 2 | virtual |
| 📅 | 1 | admin |
| ⚖️ | 1 | admin |
| ✔ | 1 | admin |
| 🪄 | 1 | admin |
| 📤 | 1 | admin |
| ✉️ | 1 | ai |
| 🔧 | 1 | ai |
| 👤 | 1 | ai |
| 📭 | 1 | board |
| 📌 | 1 | locations |
| ④ | 1 | motion |
| ↻ | 1 | motion |
| 🔐 | 1 | motion |
| ℹ | 1 | motion |
| ➖ | 1 | motion |
| ✨ | 1 | quiz |
| 🌟 | 1 | quiz |
| 😊 | 1 | quiz |
| 🥇 | 1 | quiz |
| 👏 | 1 | quiz |
| 💪 | 1 | quiz |
| ▸ | 1 | virtual |
| 🦵 | 1 | virtual |
| 🧱 | 1 | virtual |
| 🌐 | 1 | virtual |
| 📣 | 1 | virtual |
| 🏋️ | 1 | virtual |
| 📘 | 1 | voice |
| 🔀 | 1 | voice |
| ↩ | 1 | voice |
| 🛠 | 1 | voice |

### 3-3. 전체 위치 목록 (화면 노출 가능 줄 전부)

분류 기준: **아이콘**=텍스트·메뉴·메시지 앞에 붙어 의미를 표시 / **버튼**=`<button>`·버튼형 링크의 라벨 또는 단독 버튼 / **대체이미지**=사진·로고·일러스트 자리를 이모지가 대신함 / **장식**=별점·구분자·불릿·화살표 등 / **구두점**=문장 안 가운뎃점(·). JS 문자열 안의 기호도 화면에 출력되므로 포함했다.

<details><summary><b>admin.html</b> — 66줄</summary>

| 위치 | 기호 | 분류 | 맥락(태그 제거, 60자) |
|---|---|---|---|
| admin.html:172 | 🎙 | 아이콘(링크·메뉴 앞) | 🎙 음성 답변 |
| admin.html:175 | ⚙ | 아이콘(링크·메뉴 앞) | ⚙ ADMIN |
| admin.html:199 | · | 장식(구분자) | THE STEPPER · ADMIN |
| admin.html:207 | 📅 | 버튼 | 📅 세미나 일정 |
| admin.html:208 | 🏠 | 버튼 | 🏠 회원 도장 |
| admin.html:209 | 👥 | 버튼 | 👥 회원 목록 |
| admin.html:210 | 📋 | 버튼 | 📋 코칭 관리 |
| admin.html:211 | 🧠 | 버튼 | 🧠 코칭 지식 |
| admin.html:212 | 🎮 | 버튼 | 🎮 OX 퀴즈 관리 |
| admin.html:213 | 📝 | 버튼 | 📝 평가문제 관리 |
| admin.html:214 | ⚖️ | 버튼 | ⚖️ 품질 비교 |
| admin.html:220 | ➕ | 아이콘(텍스트 앞 접두) | ➕ 새 일정 추가 |
| admin.html:235 | · | 구두점(문장 내 가운뎃점) |  |
| admin.html:238 | · | 장식(구분자) | 상세 정보 (시간 · 장소) |
| admin.html:239 | · 📍 | 아이콘(텍스트 앞 접두) |  |
| admin.html:248 | 📋 | 아이콘(텍스트 앞 접두) | 📋 등록된 일정 ( 0 개) |
| admin.html:265 | ⚠️ | 아이콘(텍스트 앞 접두) | ⚠️ Firestore에 도장 데이터가 없습니다. 아래 버튼으로 기존 28개 도장 데이터를 한 번만 마이그레 |
| admin.html:270 | ➕ | 아이콘(텍스트 앞 접두) | ➕ 새 도장 추가 |
| admin.html:1080 | ✏️ | 아이콘(텍스트 앞 접두) | document.getElementById('schedFormTitle').textContent = '✏️  |
| admin.html:1096 | ➕ | 아이콘(텍스트 앞 접두) | document.getElementById('schedFormTitle').textContent = '➕ 새 |
| admin.html:1113 | ✅ | 아이콘(상태·메시지 접두) | showToast('일정이 수정되었습니다! ✅'); |
| admin.html:1118 | ✅ | 아이콘(상태·메시지 접두) | showToast('일정이 추가되었습니다! ✅'); |
| admin.html:1162 | 🥋 | 대체이미지 | (d.logoUrl ? ' ' : ' 🥋 ') + |
| admin.html:1208 | ✅ | 아이콘(상태·메시지 접두) | showToast('도장이 추가되었습니다! ✅'); |
| admin.html:1260 | ⚠️ | 아이콘(상태·메시지 접두) | if (!confirm('28개 도장 데이터를 Firestore에 추가합니다.\n\n⚠️ 이미 데이터가 있으 |
| admin.html:1268 | ✅ | 아이콘(상태·메시지 접두) | showToast('28개 도장 마이그레이션 완료! ✅', 'success'); |
| admin.html:1452 | ✔ | 아이콘(상태·메시지 접두) | ? ' ✔ ' |
| admin.html:1454 | ⚠ | 아이콘(상태·메시지 접두) | ? ' ⚠ ' |
| admin.html:1812 | · | 장식(구분자) | const text = parts.filter(Boolean).join(' · '); |
| admin.html:1861 | ✅ | 아이콘(상태·메시지 접두) | pendingList.innerHTML = ' 대기중인 질문이 없습니다. ✅ '; |
| admin.html:1872 | 📊 | 아이콘(상태·메시지 접두) | const hasVideo = d.videoData ? '📊 ' : ''; |
| admin.html:1925 | ✅ | 아이콘(상태·메시지 접두) | ' ✅ 답변완료 … ' + |
| admin.html:2021 | 🤖 | 버튼 | btn.disabled = true; btn.textContent = '🤖 AI 검토 중... (약 15초 |
| admin.html:2058 | 🤖 | 버튼 | btn.disabled = false; btn.textContent = '🤖 AI 검토 요청'; |
| admin.html:2084 | ✅ | 아이콘(상태·메시지 접두) | showToast('확정 완료! 수련생에게 답변이 전달되었습니다. ✅'); |
| admin.html:2090 | ✅ | 버튼 | btn.disabled = false; btn.textContent = '✅ 확정 및 전송'; |
| admin.html:2224 | · | 구두점(문장 내 가운뎃점) | '판정·출처·측정버전 정보가 없는 구 문서 …건이 있습니다. ' + |
| admin.html:2246 | ⚠ | 아이콘(배지) | chip('⚠ 재검토 필요', stats.needsReview, '#fdeaea', '#c8102e') + |
| admin.html:2266 | 🎯 | 아이콘(텍스트 앞 접두) | pilotEl.title = '관리자 화면의 "🎯 시범 운영 주제"에 주제를 등록하면 진행률이 표시됩니다. |
| admin.html:2291 | 🎉 | 아이콘(상태·메시지 접두) | : '전 장 커버 완료 🎉'; |
| admin.html:2292 | · | 아이콘(상태·메시지 접두) | el.innerHTML = ' 커리큘럼 커버리지(홈페이지 42장 기준): …/…장 커버됨 · …'; |
| admin.html:2321 | ⚠ | 아이콘(배지) | item.isNegativeExample ? ' ⚠ 오답 기록 ' : '', |
| admin.html:2322 | ⚠ → | 아이콘(배지) | item.needsReview ? ' ⚠ 재검토 필요 (v…→v…) ' : '', |
| admin.html:2331 | → | 장식(문장 내 화살표) | item.supersededBy ? '→ 새 버전으로 대체됨: …' : '', |
| admin.html:2332 | · | 장식(구분자) | ].filter(Boolean).join(' · '); |
| admin.html:2337 | 🔄 | 버튼 | ? ' 🔄 요약 재생성 ' |
| admin.html:2353 | · 🔄 | 버튼 | ? ' 🔄 보강자료 생성 ' |
| admin.html:2444 | 🔄 · | 아이콘(상태·메시지 접두) | showToast('🔄 평가문제·파생주제·상황태그 보강이 완료됐습니다.'); |
| admin.html:2446 | ⚠️ | 아이콘(상태·메시지 접두) | showToast('⚠️ 보강자료 일부 생성에 실패했습니다. 코칭 지식 카드의 재시도 버튼을 확인해주세요.' |
| admin.html:2452 | ⚠️ | 아이콘(상태·메시지 접두) | showToast('⚠️ 보강자료 생성 요청에 실패했습니다: ' + e.message, 'error'); |
| admin.html:2457 | 🔄 | 아이콘(상태·메시지 접두) | showToast('🔄 보강자료를 생성하는 중입니다...'); |
| admin.html:2601 | → | 장식(문장 내 화살표) | '…건 처리 → 문제 …개 생성 ' + |
| admin.html:2608 | 🪄 | 버튼 | btn.disabled = false; btn.textContent = '🪄 코칭 지식에서 문제 자동 생성 |
| admin.html:2649 | 💬 | 아이콘(텍스트 앞 접두) | 💬 … |
| admin.html:2794 | ✅ | 아이콘(텍스트 앞 접두) | ✅ 정답 판단 기준: … |
| admin.html:2915 | 🧠 | 아이콘(상태·메시지 접두) | showToast('인터뷰 완료! 초안이 생성됐습니다. 🧠 코칭 지식 탭에서 검토해주세요.'); |
| admin.html:3053 | ⏳ | 버튼 | btn.textContent = '⏳ 반영 중...'; |
| admin.html:3068 | ⏳ | 버튼 | btn.textContent = '⏳ 지식 초안 정리 중...'; |
| admin.html:3071 | 🧠 | 아이콘(상태·메시지 접두) | showToast('인터뷰 완료! 초안이 생성됐습니다. 🧠 코칭 지식 탭에서 검토해주세요.'); |
| admin.html:3085 | 📚 | 버튼 | btn.textContent = '📚 답변 제출'; |
| admin.html:3229 | ✅ | 버튼 | ✅ 확정 전송 |
| admin.html:3308 | ➕ | 버튼 | ➕ 시범 주제로 등록 |
| admin.html:3641 | · | 장식(구분자) | '총 ' + (m.totalFrames || '-') + '프레임 · 영상 ' + (m.videoDurati |
| admin.html:3676 | ⏳ | 버튼 | btn.textContent = '⏳ 발송 중...'; |
| admin.html:3687 | ✅ | 아이콘(상태·메시지 접두) | showToast('2차 피드백이 회원에게 발송됐습니다! ✅'); |
| admin.html:3693 | 📤 | 버튼 | btn.textContent = '📤 2차 프리미엄 피드백 발송'; |

</details>

<details><summary><b>ai.html</b> — 38줄</summary>

| 위치 | 기호 | 분류 | 맥락(태그 제거, 60자) |
|---|---|---|---|
| ai.html:233 | ← | 버튼 | ← 메인으로 |
| ai.html:252 | 📬 | 버튼(아이콘 단독) | 📬 |
| ai.html:277 | 🎙 | 아이콘(링크·메뉴 앞) | 🎙 음성 답변 |
| ai.html:280 | ⚙ | 아이콘(링크·메뉴 앞) | ⚙ ADMIN |
| ai.html:395 | 📩 | 대체이미지 | 📩 |
| ai.html:401 | 📩 | 아이콘(텍스트 앞 접두) | 📩 인증 메일이 보이지 않는다면 스팸함으로 이동되어 있을 수 있으니 스팸함을 꼭 확인해 주세요! |
| ai.html:414 | ✉️ | 대체이미지 | ✉️ |
| ai.html:424 | 📩 | 아이콘(텍스트 앞 접두) | 📩 인증 메일이 보이지 않는다면 스팸함으로 이동되어 있을 수 있으니 스팸함을 꼭 확인해 주세요! |
| ai.html:427 | · | 버튼 | 인증 완료 · 계속하기 |
| ai.html:443 | 🔧 | 대체이미지 | 🔧 |
| ai.html:510 | · | 장식(구분자) | 15단계 커리큘럼 기반 · 하루 5회 무료 이용 |
| ai.html:515 | 🥋 | 대체이미지 | 🥋 |
| ai.html:517 | · | 구두점(문장 내 가운뎃점) | 더스텝퍼 15단계 커리큘럼을 기반으로 태권도 겨루기 전술·기술 질문에 답변드립니다. 커리큘럼 범위 외 질문에 |
| ai.html:533 | ← | 버튼 | ← 돌아가기 |
| ai.html:534 | 📬 | 아이콘(텍스트 앞 접두) | 📬 내 코칭 보관함 |
| ai.html:557 | 👨‍🏫 | 버튼 | 👨‍🏫 전문가 코치에게 직접 질문하기 (하루 2회) |
| ai.html:566 | 👨‍🏫 | 아이콘(텍스트 앞 접두) | 👨‍🏫 전문가 코치에게 직접 질문하기 |
| ai.html:567 | 📬 · | 아이콘(텍스트 앞 접두) | 관리자가 직접 검토 후 커리큘럼 기반 심화 코칭 답변을 드립니다. 답변은 보관함(📬)에서 확인하세요. ·  |
| ai.html:586 | © | 장식(저작권 표기) | © 2026 THE STEPPER. All rights reserved. | 대표: 김민성 | 010-430 |
| ai.html:607 | ← | 버튼 | navBack: '← 메인으로', |
| ai.html:639 | · | 버튼 | verifyBtn: '인증 완료 · 계속하기', |
| ai.html:642 | · | 장식(구분자) | chatHeaderDesc: '15단계 커리큘럼 기반 · 하루 5회 무료 이용', |
| ai.html:644 | · | 구두점(문장 내 가운뎃점) | welcomeDesc: '더스텝퍼 15단계 커리큘럼을 기반으로 태권도 겨루기 전술·기술 질문에 답변드립니다. |
| ai.html:682 | ← | 버튼 | navBack: '← Back to Main', |
| ai.html:714 | · | 버튼 | verifyBtn: 'Verified · Continue', |
| ai.html:717 | · | 장식(구분자) | chatHeaderDesc: '15-Level Kyorugi Curriculum · 5 Free Questi |
| ai.html:1268 | 🥋 | 대체이미지 | ' 🥋 ' + |
| ai.html:1332 | 🥋 👤 | 대체이미지 | ' ' + (role === 'ai' ? '🥋' : '👤') + ' ' + |
| ai.html:1347 | 🥋 | 대체이미지 | ' 🥋 ' + |
| ai.html:1521 | ✦ | 장식(라벨 접두) | hdr.textContent = '✦ 2차 프리미엄 피드백'; |
| ai.html:1537 | 🤖 | 아이콘(상태·메시지 접두) | statusEl.textContent = '🤖 프리미엄'; |
| ai.html:1551 | · | 장식(구분자) | meta.textContent = dateStr + ' · 전문 코치 2차 피드백'; |
| ai.html:1593 | ✅ ⏳ | 아이콘(상태·메시지 접두) | statusEl.textContent = d.status === '답변완료' ? '✅ 답변완료' : '⏳ 대 |
| ai.html:1607 | · | 장식(구분자) | meta.textContent = dateStr + (d.videoData ? ' · 영상 데이터 첨부됨'  |
| ai.html:1636 | ✦ | 장식(라벨 접두) | label.textContent = '✦ 전문가 코치 답변'; |
| ai.html:1657 | ✦ | 장식(라벨 접두) | label.textContent = '✦ 전문 코치 2차 프리미엄 피드백'; |
| ai.html:1694 | · | 장식(구분자) | preview.textContent = (vd.chapter ? vd.chapter.name + ' ' +  |
| ai.html:1754 | 📬 | 아이콘(상태·메시지 접두) | alert('질문이 접수되었습니다!\n전문가 코치 검토 후 답변이 전달됩니다.\nnav의 📬 버튼에서 답변 |

</details>

<details><summary><b>board.html</b> — 7줄</summary>

| 위치 | 기호 | 분류 | 맥락(태그 제거, 60자) |
|---|---|---|---|
| board.html:163 | ← | 버튼 | ← 메인으로 |
| board.html:201 | 🎙 | 아이콘(링크·메뉴 앞) | 🎙 음성 답변 |
| board.html:204 | ⚙ | 아이콘(링크·메뉴 앞) | ⚙ ADMIN |
| board.html:255 | ← | 버튼 | ← 목록 |
| board.html:285 | © | 장식(저작권 표기) | © 2026 THE STEPPER. All rights reserved. | 대표: 김민성 | 010-430 |
| board.html:360 | 📭 | 대체이미지 | ' 📭 아직 문의 내역이 없습니다. 궁금한 점을 문의해보세요. '; |
| board.html:493 | · | 장식(구분자) | document.getElementById('detailMeta').innerHTML = (authorStr |

</details>

<details><summary><b>center.html</b> — 4줄</summary>

| 위치 | 기호 | 분류 | 맥락(태그 제거, 60자) |
|---|---|---|---|
| center.html:128 | ← | 버튼 | ← 홈으로 |
| center.html:141 | ✕ | 버튼 | ✕ |
| center.html:207 | 📞 | 버튼(아이콘 단독) | 📞 |
| center.html:208 | 💬 | 버튼(아이콘 단독) | 💬 |

</details>

<details><summary><b>contact.html</b> — 12줄</summary>

| 위치 | 기호 | 분류 | 맥락(태그 제거, 60자) |
|---|---|---|---|
| contact.html:313 | ← | 버튼 | ← 메인으로 |
| contact.html:343 | 🎙 | 아이콘(링크·메뉴 앞) | 🎙 음성 답변 |
| contact.html:346 | ⚙ | 아이콘(링크·메뉴 앞) | ⚙ ADMIN |
| contact.html:360 | 📋 | 버튼 | 📋 세미나 신청 |
| contact.html:361 | 🥋 | 버튼 | 🥋 회원 가입 문의 |
| contact.html:362 | 📞 | 버튼 | 📞 연락처 안내 |
| contact.html:394 | 💬 | 아이콘(링크·메뉴 앞) | 💬 카카오톡 채널 바로가기 |
| contact.html:401 | 📷 | 아이콘(링크·메뉴 앞) | 📷 @the_stepper_kms |
| contact.html:416 | 📷 | 아이콘(링크·메뉴 앞) | 📷 Instagram |
| contact.html:417 | 💬 | 아이콘(링크·메뉴 앞) | 💬 카카오톡 |
| contact.html:418 | ▶ | 아이콘(링크·메뉴 앞) | ▶ YouTube |
| contact.html:421 | © | 장식(저작권 표기) | © 2026 THE STEPPER. All rights reserved. | 대표: 김민성 | 010-430 |

</details>

<details><summary><b>gallery.html</b> — 10줄</summary>

| 위치 | 기호 | 분류 | 맥락(태그 제거, 60자) |
|---|---|---|---|
| gallery.html:317 | 📸 | 대체이미지 | 📸 |
| gallery.html:325 | ✕ | 버튼 | ✕ |
| gallery.html:331 | 📷 | 아이콘(링크·메뉴 앞) | 📷 Instagram |
| gallery.html:332 | 💬 | 아이콘(링크·메뉴 앞) | 💬 카카오톡 |
| gallery.html:333 | ▶ | 아이콘(링크·메뉴 앞) | ▶ YouTube |
| gallery.html:336 | © | 장식(저작권 표기) | © 2026 THE STEPPER. All rights reserved. | 대표: 김민성 | 010-430 |
| gallery.html:406 | 📸 | 대체이미지 | grid.innerHTML = ' 📸 등록된 사진이 없습니다. '; |
| gallery.html:427 | 📸 | 대체이미지 | grid.innerHTML = ' 📸 사진을 불러올 수 없습니다. '; |
| gallery.html:465 | ◀ | 버튼 | prev.textContent = '◀'; |
| gallery.html:481 | ▶ | 버튼 | next.textContent = '▶'; |

</details>

<details><summary><b>index.html</b> — 69줄</summary>

| 위치 | 기호 | 분류 | 맥락(태그 제거, 60자) |
|---|---|---|---|
| index.html:314 | · | 장식(구분자) | .curriculum-list{list-style:none;padding:0;margin:0}.curricu |
| index.html:458 | 🎮 | 아이콘(링크·메뉴 앞) | 🎮 OX 겨루기 퀴즈 |
| index.html:463 | 🎙 | 아이콘(링크·메뉴 앞) | 🎙 음성 답변 |
| index.html:466 | ⚙ | 아이콘(링크·메뉴 앞) | ⚙ ADMIN |
| index.html:472 | · | 장식(구분자) | TAEKWONDO COMPETITION CLUB · SINCE 2021 · KOREA |
| index.html:478 | 👥 | 아이콘 | 👥 |
| index.html:480 | · | 장식(로딩 표시) | ··· |
| index.html:489 | 🥋 | 버튼 | 🥋 전국 회원 도장 보기 |
| index.html:490 | 🤖 | 버튼 | 🤖 AI 겨루기 코치 |
| index.html:530 | → | 버튼 | 더스텝퍼 스텝 &amp; 코치진 소개 → |
| index.html:558 | ▼ | 아이콘(펼침 표시) | ▼ |
| index.html:572 | ▼ | 아이콘(펼침 표시) | ▼ |
| index.html:586 | ▼ | 아이콘(펼침 표시) | ▼ |
| index.html:590 | · | 구두점(문장 내 가운뎃점) | 제11장 - 나래차기 제12장 - 내려찍기 제13장 - 사이드 스텝 제14장 - 연계: 전진/후진 원스텝·투 |
| index.html:600 | ▼ | 아이콘(펼침 표시) | ▼ |
| index.html:614 | ▼ | 아이콘(펼침 표시) | ▼ |
| index.html:628 | ▼ | 아이콘(펼침 표시) | ▼ |
| index.html:642 | ▼ | 아이콘(펼침 표시) | ▼ |
| index.html:656 | ▼ | 아이콘(펼침 표시) | ▼ |
| index.html:670 | ▼ | 아이콘(펼침 표시) | ▼ |
| index.html:684 | ▼ | 아이콘(펼침 표시) | ▼ |
| index.html:698 | ▼ | 아이콘(펼침 표시) | ▼ |
| index.html:712 | ▼ | 아이콘(펼침 표시) | ▼ |
| index.html:726 | ▼ | 아이콘(펼침 표시) | ▼ |
| index.html:740 | ▼ | 아이콘(펼침 표시) | ▼ |
| index.html:754 | ▼ | 아이콘(펼침 표시) | ▼ |
| index.html:802 | · | 장식(구분자) | 범태권도장 · 대구 |
| index.html:803 | ★ | 장식(별점) | ★★★★★ |
| index.html:813 | · | 장식(구분자) | 아이비태권도장 · 대구 |
| index.html:814 | ★ | 장식(별점) | ★★★★★ |
| index.html:821 | 🥋 | 대체이미지 | 🥋 |
| index.html:824 | · | 장식(구분자) | 진해감사랑리더십태권도장 · 창원 |
| index.html:825 | ★ | 장식(별점) | ★★★★★ |
| index.html:832 | 🥋 | 대체이미지 | 🥋 |
| index.html:835 | · | 장식(구분자) | 율하태권도장 · 김해 |
| index.html:836 | ★ | 장식(별점) | ★★★★★ |
| index.html:843 | 🥋 | 대체이미지 | 🥋 |
| index.html:846 | · | 장식(구분자) | 다원태권도 · 창원 |
| index.html:847 | ★ | 장식(별점) | ★★★★★ |
| index.html:854 | 🥋 | 대체이미지 | 🥋 |
| index.html:857 | · | 장식(구분자) | 해솔태권도장 · 울산 |
| index.html:858 | ★ | 장식(별점) | ★★★★★ |
| index.html:868 | · | 장식(구분자) | 범태권도장 · 대구 |
| index.html:869 | ★ | 장식(별점) | ★★★★★ |
| index.html:879 | · | 장식(구분자) | 아이비태권도장 · 대구 |
| index.html:880 | ★ | 장식(별점) | ★★★★★ |
| index.html:887 | 🥋 | 대체이미지 | 🥋 |
| index.html:890 | · | 장식(구분자) | 진해감사랑리더십태권도장 · 창원 |
| index.html:891 | ★ | 장식(별점) | ★★★★★ |
| index.html:898 | 🥋 | 대체이미지 | 🥋 |
| index.html:901 | · | 장식(구분자) | 율하태권도장 · 김해 |
| index.html:902 | ★ | 장식(별점) | ★★★★★ |
| index.html:909 | 🥋 | 대체이미지 | 🥋 |
| index.html:912 | · | 장식(구분자) | 다원태권도 · 창원 |
| index.html:913 | ★ | 장식(별점) | ★★★★★ |
| index.html:920 | 🥋 | 대체이미지 | 🥋 |
| index.html:923 | · | 장식(구분자) | 해솔태권도장 · 울산 |
| index.html:924 | ★ | 장식(별점) | ★★★★★ |
| index.html:931 | ✦ | 장식 | ✦ 더 많은 후기가 업데이트될 예정입니다 ✦ |
| index.html:942 | 📸 | 대체이미지 | 📸 |
| index.html:948 | ✕ | 버튼 | ✕ |
| index.html:953 | 📷 | 아이콘(링크·메뉴 앞) | 📷 Instagram |
| index.html:954 | 💬 | 아이콘(링크·메뉴 앞) | 💬 카카오톡 |
| index.html:955 | ▶ | 아이콘(링크·메뉴 앞) | ▶ YouTube |
| index.html:958 | © | 장식(저작권 표기) | © 2026 THE STEPPER. All rights reserved. | 대표: 김민성 | 010-430 |
| index.html:1103 | 📸 | 대체이미지 | grid.innerHTML=' 📸 등록된 사진이 없습니다. '; |
| index.html:1113 | 📸 | 대체이미지 | grid.innerHTML=' 📸 사진을 불러올 수 없습니다. '; |
| index.html:1137 | ◀ | 버튼 | prev.className='page-btn'+(current===1?' disabled':'');prev. |
| index.html:1147 | ▶ | 버튼 | next.className='page-btn'+(current===total?' disabled':'');n |

</details>

<details><summary><b>locations.html</b> — 18줄</summary>

| 위치 | 기호 | 분류 | 맥락(태그 제거, 60자) |
|---|---|---|---|
| locations.html:149 | ← | 버튼 | ← 메인으로 |
| locations.html:179 | 🎙 | 아이콘(링크·메뉴 앞) | 🎙 음성 답변 |
| locations.html:182 | ⚙ | 아이콘(링크·메뉴 앞) | ⚙ ADMIN |
| locations.html:191 | · | 구두점(문장 내 가운뎃점) | 7 광역시·도 |
| locations.html:214 | 📍 | 아이콘(빈 상태 안내) | 📍 도장을 선택하면 위치 정보가 표시됩니다. |
| locations.html:218 | 🗺 | 대체이미지 | 🗺 |
| locations.html:227 | 📷 | 아이콘(링크·메뉴 앞) | 📷 Instagram |
| locations.html:228 | 💬 | 아이콘(링크·메뉴 앞) | 💬 카카오톡 |
| locations.html:229 | ▶ | 아이콘(링크·메뉴 앞) | ▶ YouTube |
| locations.html:232 | © | 장식(저작권 표기) | © 2026 THE STEPPER. All rights reserved. | 대표: 김민성 | 010-430 |
| locations.html:273 | 🥋 | 아이콘(텍스트 앞 접두) | ' 🥋 ' + name + ' ' + |
| locations.html:274 | 📍 | 아이콘(텍스트 앞 접두) | ' 📍 ' + addr + ' '; |
| locations.html:278 | 🗺 · | 아이콘(버튼 내부) | ' 🗺 카카오맵에서 보기 핀 위치 확인 · 길찾기 ' + |
| locations.html:279 | 📌 | 아이콘(텍스트 앞 접두) | ' 📌 도장 주소 ' + addr + ' ' + |
| locations.html:289 | ✅ | 버튼 | if(btn){ btn.textContent = '✅ 복사됨!'; setTimeout(function(){  |
| locations.html:372 | 🥋 | 대체이미지 | html += ' 🥋 '; |
| locations.html:378 | 📍 | 아이콘 | html += ' 📍 … '; |
| locations.html:379 | 🗺 | 아이콘(링크·메뉴 앞) | html += ' 🗺 카카오맵에서 보기 '; |

</details>

<details><summary><b>motion-legacy.html</b> — 9줄</summary>

| 위치 | 기호 | 분류 | 맥락(태그 제거, 60자) |
|---|---|---|---|
| motion-legacy.html:201 | ← | 버튼 | ← 메인 |
| motion-legacy.html:237 | ⚙ | 아이콘(링크·메뉴 앞) | ⚙ ADMIN |
| motion-legacy.html:249 | · | 장식(구분자) | 베타 버전 · 정밀 심사가 아닌 참고용 자가진단 도구입니다. |
| motion-legacy.html:257 | 📋 | 아이콘 | 📋 |
| motion-legacy.html:263 | ▼ | 아이콘(펼침 표시) | ▼ |
| motion-legacy.html:278 | ✕ | 버튼 | ✕ |
| motion-legacy.html:298 | 📹 | 아이콘 | 📹 |
| motion-legacy.html:300 | · | 장식(구분자) | MP4 · MOV · AVI 지원 · 최대 200MB 갤러리/파일 앱에서 미리 촬영한 영상을 선택하세요 |
| motion-legacy.html:1300 | 📄 | 버튼 | btn.textContent = '📄 결과 PDF로 다운로드'; |

</details>

<details><summary><b>motion.html</b> — 82줄</summary>

| 위치 | 기호 | 분류 | 맥락(태그 제거, 60자) |
|---|---|---|---|
| motion.html:132 | 🔒 | 대체이미지 | 🔒 |
| motion.html:143 | ⚙ | 아이콘(텍스트 앞 접두) | ⚙ 동작 분석 (파이썬 분석 서버) — 관리자 전용 |
| motion.html:154 | ▼ | 아이콘(펼침 표시) | ▼ Firebase 초기화 디버그 |
| motion.html:225 | → | 장식(문장 내 화살표) | 2. 영상 업로드 → 분석 → AI 피드백 |
| motion.html:227 | 📹 | 아이콘(텍스트 앞 접두) | 📹 촬영 프로토콜 |
| motion.html:244 | 🔄 | 버튼 | 🔄 AI 피드백 재요청 |
| motion.html:250 | 💾 | 아이콘(텍스트 앞 접두) | 💾 데이터 저장 |
| motion.html:253 | ⏳ | 아이콘 | ⏳ |
| motion.html:259 | ⏳ | 아이콘 | ⏳ |
| motion.html:267 | ⏳ | 아이콘 | ⏳ |
| motion.html:277 | 📄 | 버튼 | 📄 PDF 리포트 다운로드 |
| motion.html:288 | · | 구두점(문장 내 가운뎃점) | 누적되어 이후 비슷한 기술·수치 상황에서 참고됩니다. |
| motion.html:294 | ① | 장식(번호 기호) | ① AI 1차 피드백 판정 필수 |
| motion.html:307 | ② | 장식(번호 기호) | ② 어느 부분이 왜 부정확한가 필수 |
| motion.html:313 | ③ | 장식(번호 기호) | ③ 지식 출처 필수 |
| motion.html:324 | ④ | 장식(번호 기호) | ④ 보완 지도 내용 필수 |
| motion.html:329 | 💾 | 버튼 | 💾 저장 &amp; AI 학습 |
| motion.html:330 | ↻ | 버튼 | ↻ 저장된 내용 불러오기 |
| motion.html:457 | 🔐 | 아이콘(상태·메시지 접두) | el.innerHTML = '🔐 로그인됨: ' + user.email + ' '; |
| motion.html:461 | ⚠ | 아이콘(상태·메시지 접두) | el.textContent = '⚠ 로그인 필요 — AI 코치 API는 인증이 필요합니다.'; |
| motion.html:545 | ✅ | 아이콘(상태·메시지 접두) | el.textContent = '✅ HTTP ' + res.status + '\n' + JSON.string |
| motion.html:547 | ❌ | 아이콘(상태·메시지 접두) | el.textContent = '❌ 연결 실패\nerror.name: ' + e.name + '\nerror |
| motion.html:582 | ① | 아이콘(상태·메시지 접두) | setStatus('① 분석 중... (첫 요청은 서버 웜업으로 30~60초 걸릴 수 있음)'); |
| motion.html:591 | ❌ | 아이콘(상태·메시지 접두) | setStatus('❌ 분석 서버 오류 (HTTP ' + res1.status + ')'); |
| motion.html:612 | ❌ | 아이콘(상태·메시지 접두) | setStatus('❌ 분석 서버 연결 실패: ' + e.message); |
| motion.html:618 | ② | 아이콘(상태·메시지 접두) | setStatus('② AI 피드백 생성 중... (최대 ' + (COACH_TIMEOUT_MS / 1000 |
| motion.html:622 | ③ → | 아이콘(상태·메시지 접두) | setStatus('③ 저장 중... (문서 → 관절 좌표 → 원본 영상)'); |
| motion.html:631 | ✅ | 아이콘(상태·메시지 접두) | setStatus('✅ 완료'); |
| motion.html:634 | ⚠ | 아이콘(상태·메시지 접두) | setStatus('⚠ 분석은 완료됐지만 AI 피드백에 실패했습니다. 재요청하거나 이대로 PDF를 받으세요. |
| motion.html:716 | ❌ | 아이콘(상태·메시지 접두) | if (!lastDocId) { el.textContent = '❌ 저장할 분석 문서가 없습니다. 먼저 분석 |
| motion.html:717 | ❌ | 아이콘(상태·메시지 접두) | if (!auth.currentUser) { el.textContent = '❌ 로그인이 필요합니다.'; e |
| motion.html:724 | ❌ | 아이콘(상태·메시지 접두) | if (!verdict) { el.textContent = '❌ AI 피드백 판정을 선택해주세요.'; el. |
| motion.html:725 | ❌ | 아이콘(상태·메시지 접두) | if (verdict !== 'accurate' && !vNote) { el.textContent = '❌  |
| motion.html:726 | ❌ | 아이콘(상태·메시지 접두) | if (!source) { el.textContent = '❌ 지식 출처를 선택해주세요.'; el.style |
| motion.html:727 | ❌ | 아이콘(상태·메시지 접두) | if (!note) { el.textContent = '❌ 보완 지도 내용을 입력해주세요.'; el.styl |
| motion.html:731 | ⏳ | 아이콘(상태·메시지 접두) | el.textContent = '⏳ 저장 및 AI 학습 처리 중...'; |
| motion.html:761 | ❌ | 아이콘(상태·메시지 접두) | el.textContent = '❌ 저장 실패 (HTTP ' + res.status + ')\n' + (da |
| motion.html:767 | ✅ | 아이콘(상태·메시지 접두) | el.textContent = '✅ 저장 완료 — movement_data/' + lastDocId + '  |
| motion.html:773 | ❌ | 아이콘(상태·메시지 접두) | el.textContent = '❌ 저장 요청 실패\nerror.name: ' + e.name + '\ner |
| motion.html:787 | ❌ | 아이콘(상태·메시지 접두) | if (!silent) { el.textContent = '❌ 불러올 분석 문서가 없습니다.'; el.sty |
| motion.html:791 | ⏳ | 아이콘(상태·메시지 접두) | if (!silent) { el.textContent = '⏳ 불러오는 중...'; el.style.colo |
| motion.html:796 | ❌ | 아이콘(상태·메시지 접두) | if (!silent) { el.textContent = '❌ 문서를 찾을 수 없습니다: ' + lastDo |
| motion.html:802 | ℹ | 아이콘(상태·메시지 접두) | if (!silent) { el.textContent = 'ℹ 아직 저장된 지도 내용이 없습니다.'; el. |
| motion.html:822 | ✅ | 아이콘(상태·메시지 접두) | if (!silent) { el.textContent = '✅ 저장된 지도 내용을 불러왔습니다.'; el.s |
| motion.html:825 | ❌ | 아이콘(상태·메시지 접두) | if (!silent) { el.textContent = '❌ 불러오기 실패: ' + e.message; e |
| motion.html:834 | 📚 | 아이콘(텍스트 앞 접두) | var lines = ['📚 학습 지식으로 저장된 내용', '']; |
| motion.html:862 | ✅ | 아이콘(상태·메시지 접두) | head = '✅ 기준선 정상 — 촬영 프로토콜대로 잡혔습니다'; |
| motion.html:868 | ⚠ | 아이콘(상태·메시지 접두) | head = '⚠ 기준선을 자동 탐색으로 잡았습니다 — 재촬영 권장'; |
| motion.html:874 | ❌ | 아이콘(상태·메시지 접두) | head = '❌ 기준선 없음 — 다시 촬영해주세요'; |
| motion.html:916 | ▶ | 장식(텍스트 리포트 서식) | lines.push('▶ 무릎 각도'); |
| motion.html:926 | · | 장식(텍스트 리포트 서식) | if (parts.length) lines.push('· ' + label + ' 무릎: ' + parts. |
| motion.html:931 | · | 장식(텍스트 리포트 서식) | if (o) lines.push('· ' + label + ' 무릎 최대: ' + o); |
| motion.html:946 | · | 장식(텍스트 리포트 서식) | rl.push('· 몸통 비틀림(어깨 대비 골반): ' + twv + '°' |
| motion.html:948 | · | 장식(텍스트 리포트 서식) | + (DIR[tw.direction] ? ' · ' + DIR[tw.direction] : '')); |
| motion.html:951 | · | 장식(텍스트 리포트 서식) | rl.push('· 골반 절대 회전: ' + ywv + '°' |
| motion.html:953 | · | 장식(텍스트 리포트 서식) | + (DIR[yw.direction] ? ' · ' + DIR[yw.direction] + ' 방향' : ' |
| motion.html:957 | ▶ | 장식(텍스트 리포트 서식) | lines.push('▶ 회전'); |
| motion.html:959 | ※ | 장식(텍스트 리포트 서식) | lines.push(' ※ 몸통 비틀림은 골반 절대 회전이 아니라 어깨 대비 상대값입니다.'); |
| motion.html:960 | ※ | 장식(텍스트 리포트 서식) | lines.push(' ※ 골반 절대 회전은 단안 카메라 깊이 추정 기반이라 절대값보다 상대 비교용입니다.' |
| motion.html:964 | ▶ | 장식(텍스트 리포트 서식) | lines.push('▶ 회전'); |
| motion.html:965 | · | 장식(텍스트 리포트 서식) | lines.push('· 골반 회전(구 산식): ' + ma.hip_rot.angle + '°'); |
| motion.html:973 | ▶ | 장식(텍스트 리포트 서식) | lines.push('▶ 붙여차기 동시성 (제6장 핵심 지표)'); |
| motion.html:975 | · | 장식(텍스트 리포트 서식) | lines.push('· 뒷발 착지와 앞발 타격의 시간차: ' + ss.delta_sec + '초' |
| motion.html:977 | ※ | 장식(텍스트 리포트 서식) | lines.push(' ※ 0에 가까울수록 좋습니다.'); |
| motion.html:979 | · | 장식(텍스트 리포트 서식) | lines.push('· 측정 실패 — 뒷발이 바닥에서 떨어진 구간을 찾지 못했습니다.'); |
| motion.html:980 | ※ | 장식(텍스트 리포트 서식) | lines.push(' ※ 이 값이 없다는 이유로 동작을 지적하지 마세요.'); |
| motion.html:1028 | ▶ | 장식(텍스트 리포트 서식) | '▶ 신체 프로필\n' + |
| motion.html:1029 | · | 장식(텍스트 리포트 서식) | '· 이름: ' + profile.name + ' / 나이: ' + profile.age + '세 / 성별: |
| motion.html:1030 | · | 장식(텍스트 리포트 서식) | '· 키: ' + profile.height + 'cm / 몸무게: ' + profile.weight + ' |
| motion.html:1047 | 🤖 | 아이콘(상태·메시지 접두) | showFeedback('🤖 AI 코치 피드백\n\n' + coachData.reply, true); |
| motion.html:1097 | ⏳ | 아이콘(상태·메시지 접두) | showFeedback('⏳ AI 피드백 재요청 중... (최대 ' + (COACH_TIMEOUT_MS /  |
| motion.html:1107 | 💾 | 아이콘(상태·메시지 접두) | saveEl.textContent = '💾 저장 완료 — 문서 ID: ' + lastDocId + ' (피 |
| motion.html:1110 | ⚠ | 아이콘(상태·메시지 접두) | saveEl.textContent = '⚠ 피드백 갱신 실패: ' + e.message; |
| motion.html:1117 | ✅ | 아이콘(상태·메시지 접두) | setStatus('✅ 완료'); |
| motion.html:1145 | ⏳ | 아이콘(상태·메시지 접두) | el.textContent = '⏳ PDF 생성 중... (10~20초 걸릴 수 있음)'; |
| motion.html:1189 | ❌ | 아이콘(상태·메시지 접두) | el.textContent = '❌ PDF 생성 실패 (HTTP ' + res.status + ')\n' + |
| motion.html:1213 | ✅ | 아이콘(상태·메시지 접두) | el.textContent = '✅ 다운로드 완료 — ' + filename; |
| motion.html:1217 | ❌ | 아이콘(상태·메시지 접두) | el.textContent = '❌ PDF 요청 실패\nerror.name: ' + e.name + '\ne |
| motion.html:1230 | ⏳ ✅ ❌ ➖ | 아이콘(상태·메시지 접두) | var icon = { wait: '⏳', run: '⏳', ok: '✅', fail: '❌', skip:  |
| motion.html:1412 | · | 장식(구분자) | landmarksData.length + '프레임 · ' + fmtBytes(res.bytes) + |
| motion.html:1413 | → | 장식(문장 내 화살표) | (built.compressed ? ' (원본 ' + fmtBytes(built.rawBytes) + ' → |
| motion.html:1463 | · | 장식(구분자) | stepSet('step-video', 'ok', path + ' · ' + fmtBytes(res.byte |

</details>

<details><summary><b>quiz.html</b> — 13줄</summary>

| 위치 | 기호 | 분류 | 맥락(태그 제거, 60자) |
|---|---|---|---|
| quiz.html:230 | 🏠 | 버튼 | 🏠 홈으로 |
| quiz.html:246 | 🥋 | 대체이미지 | 🥋 |
| quiz.html:254 | 🥋 ⭐ | 대체이미지 | 🥋⭐ |
| quiz.html:283 | → | 버튼 | 다음 문제 → |
| quiz.html:290 | 🏆 | 대체이미지 | 🏆 |
| quiz.html:297 | 🔄 | 버튼 | 🔄 다시 도전하기 |
| quiz.html:390 | ⭐ ✨ 🌟 | 장식(애니메이션 파티클) | const glyphs = ['⭐', '✨', '🌟']; |
| quiz.html:483 | 🎉 😊 | 아이콘(텍스트 앞 접두) | $('fbHead').textContent = correct ? '🎉 정답이에요!' : '😊 아쉬워요,  |
| quiz.html:494 | → | 아이콘(텍스트 앞 접두) | $('btnNext').textContent = (currentIndex + 1 = sessionQuesti |
| quiz.html:515 | 🏆 | 대체이미지 | emoji = '🏆'; title = '최고예요! 겨루기 박사님이시네요!'; |
| quiz.html:518 | 🥇 | 대체이미지 | emoji = '🥇'; title = '참 잘했어요!'; |
| quiz.html:521 | 👏 | 대체이미지 | emoji = '👏'; title = '잘하고 있어요!'; |
| quiz.html:524 | 💪 | 대체이미지 | emoji = '💪'; title = '괜찮아요, 다시 도전해봐요!'; |

</details>

<details><summary><b>schedule.html</b> — 7줄</summary>

| 위치 | 기호 | 분류 | 맥락(태그 제거, 60자) |
|---|---|---|---|
| schedule.html:302 | ← | 버튼 | ← 메인으로 |
| schedule.html:332 | 🎙 | 아이콘(링크·메뉴 앞) | 🎙 음성 답변 |
| schedule.html:335 | ⚙ | 아이콘(링크·메뉴 앞) | ⚙ ADMIN |
| schedule.html:362 | 📷 | 아이콘(링크·메뉴 앞) | 📷 Instagram |
| schedule.html:363 | 💬 | 아이콘(링크·메뉴 앞) | 💬 카카오톡 |
| schedule.html:364 | ▶ | 아이콘(링크·메뉴 앞) | ▶ YouTube |
| schedule.html:367 | © | 장식(저작권 표기) | © 2026 THE STEPPER. All rights reserved. | 대표: 김민성 | 010-430 |

</details>

<details><summary><b>staff.html</b> — 15줄</summary>

| 위치 | 기호 | 분류 | 맥락(태그 제거, 60자) |
|---|---|---|---|
| staff.html:138 | · | 장식(CSS 불릿) | .staff-card.featured .card-profile li::before,.staff-card:no |
| staff.html:157 | ← | 버튼 | ← 메인으로 |
| staff.html:187 | 🎙 | 아이콘(링크·메뉴 앞) | 🎙 음성 답변 |
| staff.html:190 | ⚙ | 아이콘(링크·메뉴 앞) | ⚙ ADMIN |
| staff.html:207 | · | 구두점(문장 내 가운뎃점) | 태권도 겨루기 선수 출신. 전자 센서 호구 도입 이후 단절된 인파이터 전술과 강한 기술을 체계적으로 기록·보 |
| staff.html:223 | ▼ | 아이콘(펼침 표시) | 경력 보기 ▼ |
| staff.html:236 | ▼ | 아이콘(펼침 표시) | 경력 보기 ▼ |
| staff.html:249 | ▼ | 아이콘(펼침 표시) | 경력 보기 ▼ |
| staff.html:262 | ▼ | 아이콘(펼침 표시) | 경력 보기 ▼ |
| staff.html:273 | · | 구두점(문장 내 가운뎃점) | 더스텝퍼의 온·오프라인 홍보 및 SNS 채널 운영을 담당한다. 태권도 겨루기 문화의 대중화를 위한 콘텐츠를  |
| staff.html:275 | ▼ | 아이콘(펼침 표시) | 경력 보기 ▼ |
| staff.html:286 | 📷 | 아이콘(링크·메뉴 앞) | 📷 Instagram |
| staff.html:287 | 💬 | 아이콘(링크·메뉴 앞) | 💬 카카오톡 |
| staff.html:288 | ▶ | 아이콘(링크·메뉴 앞) | ▶ YouTube |
| staff.html:291 | © | 장식(저작권 표기) | © 2026 THE STEPPER. All rights reserved. | 대표: 김민성 | 010-430 |

</details>

<details><summary><b>virtual.html</b> — 35줄</summary>

| 위치 | 기호 | 분류 | 맥락(태그 제거, 60자) |
|---|---|---|---|
| virtual.html:343 | ▸ | 장식(CSS 불릿) | .mode-feature::before { content: '▸'; color: var(--red); fon |
| virtual.html:555 | ← | 버튼 | ← 메인으로 |
| virtual.html:586 | 🎙 | 아이콘(링크·메뉴 앞) | 🎙 음성 답변 |
| virtual.html:589 | ⚙ | 아이콘(링크·메뉴 앞) | ⚙ ADMIN |
| virtual.html:599 | · | 장식(구분자) | THE STEPPER · VR TAEKWONDO SYSTEM |
| virtual.html:625 | 🎯 | 아이콘(텍스트 앞 접두) | 🎯 행사장에서 체험하신 분들을 위한 특별 안내 |
| virtual.html:634 | 🤖 | 아이콘 | 🤖 |
| virtual.html:641 | 📹 | 아이콘 | 📹 |
| virtual.html:644 | · | 구두점(문장 내 가운뎃점) | 영상 업로드 시 AI가 발차기 자세·타이밍을 분석해 피드백 |
| virtual.html:648 | 🥋 | 아이콘 | 🥋 |
| virtual.html:656 | → | 버튼 | 지금 무료로 가입하기 → |
| virtual.html:657 | · | 장식(구분자) | 가입비 없음 · AI 코치 하루 5회 영구 무료 |
| virtual.html:670 | 🥽 | 아이콘(텍스트 앞 접두) | 🥽 가상현실(VR)이란? |
| virtual.html:674 | · | 구두점(문장 내 가운뎃점) | 게임이나 영화를 넘어서 스포츠·교육·재활·훈련 분야에서도 활발하게 활용되고 있으며, 태권도 역시 VR을 통해 |
| virtual.html:688 | 🥽 | 아이콘 | 🥽 |
| virtual.html:695 | 🎮 | 아이콘 | 🎮 |
| virtual.html:698 | · | 구두점(문장 내 가운뎃점) | 손의 위치·방향·속도를 정밀하게 추적합니다. 주먹 지르기, 막기, 잡기 동작을 가상 공간에서 그대로 구현합니 |
| virtual.html:702 | 🦵 | 아이콘 | 🦵 |
| virtual.html:705 | · | 구두점(문장 내 가운뎃점) | 발목에 부착하는 전용 트래커가 발차기 동작을 실시간으로 인식합니다. 돌려차기·앞차기·옆차기 등 모든 태권도  |
| virtual.html:727 | 🧱 | 아이콘 | 🧱 |
| virtual.html:741 | 🤖 | 아이콘 | 🤖 |
| virtual.html:749 | · | 구두점(문장 내 가운뎃점) | 반응속도·공격 타이밍 분석 리포트 |
| virtual.html:755 | 🌐 | 아이콘 | 🌐 |
| virtual.html:759 | · | 구두점(문장 내 가운뎃점) | 인터넷만 있으면 거리·시간 제약 없이 전 세계 태권도인과 VR 겨루기 대전을 펼칠 수 있습니다. |
| virtual.html:769 | 🏆 | 아이콘 | 🏆 |
| virtual.html:773 | · | 구두점(문장 내 가운뎃점) | AI가 수련자의 품새 동작을 분석하여 각도·속도·균형까지 정밀하게 평가합니다. 객관적인 지표로 실력을 확인하 |
| virtual.html:794 | · | 구두점(문장 내 가운뎃점) | 기존 수련 방식에 VR이 더해지면 마케팅·교육·심사 전반이 업그레이드됩니다. |
| virtual.html:799 | 📣 | 아이콘 | 📣 |
| virtual.html:812 | 🏋️ | 아이콘 | 🏋️ |
| virtual.html:815 | · | 구두점(문장 내 가운뎃점) | 품새·겨루기·반응훈련·자세교정까지 — VR이 기존 수련 커리큘럼의 폭을 넓혀줍니다. 수련생 흥미와 집중도가  |
| virtual.html:825 | 📊 | 아이콘 | 📊 |
| virtual.html:850 | · | 구두점(문장 내 가운뎃점) | 도입 상담부터 설치·운영 교육까지 전 과정을 함께합니다. |
| virtual.html:855 | 📞 | 아이콘(버튼 내부) | 📞 |
| virtual.html:859 | 💬 | 아이콘(버튼 내부) | 💬 |
| virtual.html:868 | © | 장식(저작권 표기) | © 2026 THE STEPPER. All rights reserved. | 대표: 김민성 | 010-430 |

</details>

<details><summary><b>voice.html</b> — 48줄</summary>

| 위치 | 기호 | 분류 | 맥락(태그 제거, 60자) |
|---|---|---|---|
| voice.html:181 | 🔒 | 대체이미지 | 🔒 |
| voice.html:193 | 🎙 | 아이콘(텍스트 앞 접두) | 🎙 음성 답변 ADMIN |
| voice.html:198 | ① | 버튼 | ① 질문 답변 |
| voice.html:199 | ② · | 버튼 | ② 지식 입력·교정 |
| voice.html:214 | ✅ | 대체이미지 | ✅ |
| voice.html:235 | 🧠 | 버튼 | 🧠 전술 판단 경험 지식 |
| voice.html:236 | 📘 | 버튼 | 📘 커리큘럼 원문 |
| voice.html:243 | 🎤 | 버튼 | 🎤 |
| voice.html:254 | ✏️ | 버튼 | ✏️ 오타 확인하기 |
| voice.html:256 | 🔀 | 버튼 | 🔀 다른 질문으로 |
| voice.html:268 | · | 구두점(문장 내 가운뎃점) | AI가 오타·맞춤법만 정리했습니다. 확인하거나 직접 수정하세요. |
| voice.html:271 | ✅ | 버튼 | ✅ 확인하고 다음 |
| voice.html:272 | ↩ | 버튼 | ↩ 다시 답변하기 |
| voice.html:278 | · | 구두점(문장 내 가운뎃점) | 인터뷰가 끝났습니다. 생성된 지식 초안을 확인·수정 후 승인하세요. |
| voice.html:296 | ✅ | 버튼 | ✅ 승인 |
| voice.html:307 | 📝 | 버튼 | 📝 신규 지식 입력 |
| voice.html:308 | 🛠 | 버튼 | 🛠 AI 답변 교정 |
| voice.html:313 | · | 장식(구분자) | AI 코치가 낸 답변 (선택 · 참고용, 검색에는 쓰이지 않음) |
| voice.html:315 | 🎤 | 버튼 | 🎤 |
| voice.html:327 | 🎤 | 버튼 | 🎤 |
| voice.html:348 | 💾 | 버튼 | 💾 저장 |
| voice.html:543 | ❌ | 아이콘(상태·메시지 접두) | setStatus('❌ 지식 초안 생성 재시도에 실패했습니다: ' + e.message, 'error'); |
| voice.html:561 | ❌ | 아이콘(상태·메시지 접두) | setStatus('❌ 질문을 불러오지 못했습니다: ' + e.message, 'error'); |
| voice.html:711 | ❌ | 아이콘(상태·메시지 접두) | setStatusEl(activeField.statusId, '❌ 음성 인식 오류: ' + event.err |
| voice.html:756 | ❌ | 아이콘(상태·메시지 접두) | if (!currentQuestionId) { setStatus('❌ 질문이 없습니다.', 'error'); |
| voice.html:757 | ⏳ | 아이콘(상태·메시지 접두) | setStatus('⏳ 인터뷰를 시작합니다...', ''); |
| voice.html:767 | ❌ | 아이콘(상태·메시지 접두) | setStatus('❌ 시작 실패: ' + e.message, 'error'); |
| voice.html:775 | ❌ | 아이콘(상태·메시지 접두) | if (!text) { setStatus('❌ 답변 내용을 입력해주세요.', 'error'); return; |
| voice.html:779 | ⏳ · | 아이콘(상태·메시지 접두) | setStatus('⏳ 오타·맞춤법 정리 중...', ''); |
| voice.html:786 | ❌ | 아이콘(상태·메시지 접두) | setStatus('❌ 정리 실패: ' + e.message, 'error'); |
| voice.html:806 | ❌ | 아이콘(상태·메시지 접두) | if (!text) { setStatus('❌ 답변 내용이 비어 있습니다.', 'error'); return |
| voice.html:810 | ⏳ | 아이콘(상태·메시지 접두) | setStatus('⏳ 답변 반영 중...', ''); |
| voice.html:827 | ❌ | 아이콘(상태·메시지 접두) | setStatus('❌ 처리 실패: ' + e.message, 'error'); |
| voice.html:836 | ⏳ | 아이콘(상태·메시지 접두) | setStatus('⏳ 지식 초안을 정리하는 중입니다... (최대 1분 정도 걸릴 수 있어요)', ''); |
| voice.html:872 | ⏳ | 아이콘(상태·메시지 접두) | setStatus('⏳ 질문을 준비 중...', ''); |
| voice.html:882 | ❌ | 아이콘(상태·메시지 접두) | setStatus('❌ 실패: ' + e.message, 'error'); |
| voice.html:892 | ❌ | 아이콘(상태·메시지 접두) | if (!currentDraftId) { setStatus('❌ 승인할 초안이 없습니다.', 'error') |
| voice.html:895 | ❌ | 아이콘(상태·메시지 접두) | if (!ruleContext) { setStatus('❌ 규칙 체계를 선택해주세요.', 'error');  |
| voice.html:901 | ⏳ | 아이콘(상태·메시지 접두) | setStatus('⏳ 승인 처리 중...', ''); |
| voice.html:930 | ✅ | 아이콘(상태·메시지 접두) | setStatus('✅ 승인 완료! AI 코치가 바로 참조합니다. 다음 질문을 불러옵니다.', 'ok'); |
| voice.html:936 | ❌ | 아이콘(상태·메시지 접두) | setStatus('❌ 승인 실패: ' + e.message, 'error'); |
| voice.html:961 | ❌ | 아이콘(상태·메시지 접두) | if (!auth.currentUser) { setKStatus('❌ 로그인이 필요합니다.', 'error' |
| voice.html:970 | ❌ | 아이콘(상태·메시지 접두) | if (!summary) { setKStatus('❌ 기술명/상황 요약을 입력해주세요.', 'error'); |
| voice.html:971 | ❌ | 아이콘(상태·메시지 접두) | if (!content) { setKStatus('❌ 지식 내용을 입력해주세요.', 'error'); ret |
| voice.html:972 | ❌ | 아이콘(상태·메시지 접두) | if (!ruleContext) { setKStatus('❌ 규칙 체계를 선택해주세요.', 'error'); |
| voice.html:976 | ⏳ | 아이콘(상태·메시지 접두) | setKStatus('⏳ 저장 중...', ''); |
| voice.html:995 | ✅ | 아이콘(상태·메시지 접두) | setKStatus('✅ 저장되었습니다. AI 코치가 바로 참조합니다.', 'ok'); |
| voice.html:1001 | ❌ | 아이콘(상태·메시지 접두) | setKStatus('❌ 저장 실패: ' + e.message, 'error'); |

</details>

### 3-4. 주석 안에만 있는 기호 (화면 비노출 — HTML/CSS/JS 주석)

| 파일 | 줄번호(기호) |
|---|---|
| admin.html | 308(📋), 315(👥), 336(⚠️), 351(·), 356(✕), 428(·), 432(🎥), 435(→), 437(→), 446(🤖), 468(🧠), 469(📘), 477(📚), 478(🔀), 487(· 🧠), 489(✅ 🧠 ·), 495(✨), 502(🆘), 515(◀), 518(▶), 560(📤), 571(💡), 583(🎯), 600(📋), 606(⏳), 612(🔍 ·), 619(📝), 620(✕), 633(🤖), 640(🔍), 641(✕), 664(✅), 665(✏️), 679(🎙), 688(·), 690(📚 · 🧠), 697(🧠), 724(·), 774(↻), 775(⬇), 776(⬇), 778(·), 786(🎮), 788(·), 799(🪄), 804(·), 820(↻), 829(📝), 833(·), 852(↻), 861(⚖️), 865(·), 884(·), 900(·), 1122(→), 1628(─), 1629(─), 1815(·), 1819(·), 2096(·), 2097(·), 2156(·), 2434(🔄), 2859(→), 3042(→), 3258(·) |
| ai.html | 48(─), 176(─), 181(─), 201(─), 206(─), 1512(─), 1574(─) |
| board.html | 51(─) |
| contact.html | 44(─) |
| index.html | 368(─), 1419(→) |
| motion-legacy.html | 6(═), 9(→), 12(·), 13(·), 18(·), 20(·), 21(═), 321(📊), 334(📐), 356(📊), 366(🤖), 373(📄), 374(👨‍🏫), 387(🆘), 407(✅), 432(─), 451(─), 460(─), 492(─), 554(─), 568(─), 595(✅), 603(─), 612(✅), 636(─), 647(→), 661(─), 672(⏳), 735(📊), 754(·), 762(─), 807(─), 824(─), 836(─), 840(─), 855(·), 856(·), 857(·), 863(─), 879(─), 913(─), 945(─), 946(·), 961(→), 969(─), 982(─), 987(⏳), 1014(⏳), 1030(⏳), 1058(─), 1060(→), 1066(⏳), 1068(─), 1081(─), 1102(─), 1108(↑), 1112(─), 1131(─), 1144(①), 1160(②), 1187(═), 1190(①), 1195(②), 1202(③), 1212(④), 1217(⑤), 1234(⑥), 1243(⑦), 1274(⑧), 1286(⑨), 1296(⑩) |
| motion.html | 7(═), 20(═), 145(─), 166(─), 223(─), 248(→), 282(─), 292(①), 311(③), 322(④), 337(─), 355(─), 382(─), 400(─), 406(─), 442(─), 444(─), 491(─), 533(─), 538(─), 551(─), 581(─), 617(─), 621(─), 625(─), 643(─), 677(─), 846(─), 902(─), 987(─), 1075(─), 1083(─), 1125(─), 1134(─), 1224(─), 1225(─), 1257(─), 1275(─), 1301(─), 1329(·), 1362(·), 1368(─), 1424(─), 1474(─), 1489(─) |
| quiz.html | 72(─), 82(─), 107(─), 117(─), 160(─), 187(─), 199(─), 341(─), 385(─), 406(─), 436(─) |
| schedule.html | 44(─) |
| staff.html | 44(─) |
| virtual.html | 47(─), 72(─), 100(─), 206(─), 230(─), 286(─), 353(─), 384(─), 470(─), 525(─), 533(─), 592(─), 622(─), 661(─), 714(─), 785(─), 840(─), 882(─), 896(─) |
| voice.html | 7(═), 10(①), 16(② ·), 22(═), 39(─), 48(─), 56(─ ① ② ·), 63(─), 70(─), 90(─), 104(─), 111(─), 116(─), 150(─), 276(→ ·), 304(·), 362(─), 376(─), 395(🔄), 435(─ ① ② ·), 445(─), 478(─), 495(─), 608(─), 636(─), 693(→), 740(─), 753(─), 771(─ →), 797(─ →), 847(─), 886(─ →), 905(·), 941(─ ·) |

---

## 4. 반복 레이아웃 패턴

### 4-1. "영문 소제목 + 한글 제목 + 설명문" 반복

| 위치 | 영문 소제목 | 한글 제목 | 설명문 | 마크업 |
|---|---|---|---|---|
| index.html:506-508 | OUR STORY | 우리는 왜 이 길을 선택했는가 | 전통 태권도가 사라지고 있다… | `.section-tag` / `h2.section-title` / `p.section-desc` |
| index.html:522-524 | ABOUT THE STEPPER | 왜 더스텝퍼인가 | 전자 센서 호구 도입 이후… | 동일 |
| index.html:548-550 | CURRICULUM | 1~15단계 커리큘럼 | 각 단계를 눌러서 세부 내용을 확인하십시오. | 동일 |
| index.html:767-769 | YOUTUBE | 세미나 현장 영상 | 실제 세미나 현장을 직접 확인하십시오. | 동일 |
| index.html:785-791 | REVIEWS | 회원 도장 후기 | 더스텝퍼와 함께하는 전국 회원 도장 관장님들의 이야기입니다. | 동일 + "6개의 후기" 배지(`:787-790`) |
| index.html:936-938 | GALLERY | 활동 갤러리 | 더스텝퍼의 세미나 및 활동 현장을 담았습니다. | 동일 |
| gallery.html:308-310 | GALLERY | 활동 갤러리 | 더스텝퍼의 세미나 및 활동 현장을 담았습니다. (index와 같은 문장) | `.section-tag` + 인라인 스타일 h1/p |
| contact.html:352-354 | CONTACT | 회원 가입 & 세미나 문의 | 세미나 신청 및 회원 도장 문의를 접수해 드립니다. | `.section-tag` + 인라인 스타일 h1/p |
| locations.html:186-188 | LOCATIONS | 전국 회원 도장 | 도장명을 클릭하면 위치 정보를 확인할 수 있습니다. | `.section-tag` / `h1.section-title` / 인라인 p |
| schedule.html:340-342 | SCHEDULE | 세미나 일정 | 더스텝퍼 전국 세미나 일정입니다. | `.section-tag` / `h2.section-title` / `p.section-desc` |
| staff.html:195-197 | OUR TEAM | 스텝 & 코치진 소개 | 더스텝퍼와 함께하는 사범 및 운영진을 소개합니다… | `.section-tag` / `h1.page-title` / `p.page-desc` |
| virtual.html:664-665 | What is VR? | VR, 그게 뭔가요? | (설명문 없음, `.gold-line`) | `.section-label` / `h2.section-title` |
| virtual.html:717-720 | VR Modes | 4가지 VR 모드 | 수준과 목적에 맞는 다양한 모드로… | `.section-label` / `h2.section-title` / `p.section-desc` |
| virtual.html:788-789 | For Dojang | 도장 도입 효과 | (설명문 없음, `.gold-line`) | `.section-label` / `h2.section-title` |
| virtual.html:844-845 | Contact Us | 더스텝퍼와 함께 VR 버추얼 태권도를 시작하세요 | — | `.section-label` / `h2.cta-title` |

변형 패턴:
- 히어로 배지형: `index.html:472` "TAEKWONDO COMPETITION CLUB · SINCE 2021 · KOREA" + h1 "THE STEPPER" + 슬로건 "Move Fast, Kick Harder." / `virtual.html:599` "THE STEPPER · VR TAEKWONDO SYSTEM" + h1 + `.hero-sub`.
- 카드형: `staff.html` 6장 카드 모두 `.card-title-en`(CEO / General Manager×3 / Education Deputy / PR Manager) + `.card-name`(한글 이름) + `.card-title-kr` + `.card-desc` (`:204-273`).
- 영문 표기 방식 2종: 대문자(`.section-tag`, letter-spacing 4px — index·contact·gallery·locations·schedule·staff) / 첫 글자만 대문자(`.section-label` — virtual).
- 같은 클래스 정의 반복: `.section-tag/.section-title/.section-desc`가 index에서 3번(`:60-63`, `:120-123`, `:363-366`), contact·schedule에서 2번씩(`:72-75`, `:125-128` 등) 정의된다. 페이지마다 `.section-desc` 색이 다르다(#1E3048 / #6e6e73 / #666).

### 4-2. 숫자 카운터 애니메이션

| 위치 | 내용 | 동작 |
|---|---|---|
| index.html:492-496 (마크업), :988-1010 (JS) | `.stat-num[data-target]` 4개: 회원수 81, 단계 커리큘럼 15, 창단 연도 2021, 종주국 KOR(data-target=0 → 애니메이션 제외) | IntersectionObserver(threshold 0.5) → 2초 ease-out-cubic으로 0→목표값 |
| index.html:476-481 (마크업), :1012-1068 (JS) | 누적 방문자 `#visitorCount` (초기 표시 "···") | Firestore `stats/visitors` 증가 후 (목표-50)→목표값 1.5초 |
| schedule.html:392-414 | index와 같은 `animateCounter` 코드 | **대상 요소 없음** — schedule.html에 `.stat-num[data-target]` 마크업이 없다 |
| contact.html:120, :231-235 / gallery.html:54, :165-169 / schedule.html:119, :230-234 / locations.html:81 | `.stat-num`, `.visitor-counter*` CSS | **CSS만 있고 해당 마크업 없음** (locations는 `.stat-num` 정의만 있고 실제 숫자는 `:190-191` 인라인 스타일) |
| locations.html:190 | 회원 도장 수 `#statCount` 초기값 28 | 애니메이션 없음. 데이터 로드 후 `:386-387`에서 개수로 교체 |
| admin.html:700-715 | 코칭 지식 카운터 4개 | 애니메이션 없음 (textContent 대입) |

### 4-3. 01/02/03 번호 카드

| 위치 | 내용 |
|---|---|
| index.html:526-528 | `.about-point` 3개, `.point-num` 01 사명감으로 만든 교육 / 02 기술과 스텝의 통합 교육 / 03 전국 지도자 네트워크 |
| virtual.html:726, 740, 754, 768 | `.mode-num` 01~04 — VR 모드 카드 4장 (🧱 🤖 🌐 🏆 아이콘과 함께) |
| locations.html:375 | `.dojang-num` — `String(order).padStart(2,'0')`로 01~28 자동 번호 |
| index.html:555 등 15곳 | 커리큘럼 아코디언 `.stage-badge` "01단계"~"15단계" (`.accordion-item` 15개) |
| motion-legacy.html:283, 312, 363 | `.step-label` STEP 1 / STEP 2 / STEP 3 |
| motion.html:294, 307, 313, 324 / voice.html:198-199 | 원문자 ①~④ 필드 라벨 / ①② 탭 버튼 |

### 4-4. 별점 후기 슬라이드

| 위치 | 내용 |
|---|---|
| index.html:783-932 | `section#reviews`. `.review-track`에 카드 12장 = 6장(`:795-860`) + 무한 루프용 동일 6장 복제(`:861-926`) |
| index.html:325-328 | CSS `@keyframes scroll-left` 30초 무한 가로 스크롤, hover 시 정지 |
| index.html:1221-1288 | 드래그 스크롤 JS |
| 별점 | `.review-stars` "★★★★★" 12곳 (`:803, 814, 825, 836, 847, 858, 869, 880, 891, 902, 913, 924`) — 모든 후기가 5점 고정 텍스트 |
| 아바타 | 범태권도장·아이비태권도장은 로고 이미지, 나머지 4곳(진해감사랑리더십·율하·다원·해솔)은 🥋 (`:821, 832, 843, 854` + 복제본 `:887, 898, 909, 920`) |
| 후기 끝 문구 | `:931` "✦ 더 많은 후기가 업데이트될 예정입니다 ✦" |
| 스타일 덮어쓰기 | `.review-card` 기본 `background:#111`(`:329`) → `:418`에서 `#0D1B2E !important`로 덮어씀. `.review-stars` 색 var(--yellow)(`:338`) → `#C9A84C !important`(`:422`) |

---

## 5. 하드코딩된 사실 정보 대조

### 5-1. 도장 수·회원 수 등 숫자

| 값 | 위치 | 문맥 |
|---|---|---|
| **36** | index.html:528 | "36개 회원 도장과 함께…" (01/02/03 카드 03) |
| 36 | thestepper_homepage (1).html:221 / 새 폴더/index.html:282, 316, 425 | 초안: "전국 가맹점" 카운터 data-target=36, "36개 가맹…" |
| **28** | locations.html:190 | 회원 도장 수 초기 표시값 |
| 28 | locations.html:315-342 | `FALLBACK` 배열 항목 28개 (Firestore 비었거나 오류 시 사용) |
| 28 | admin.html:265, 1260, 1268 | "기존 28개 도장 데이터" 마이그레이션 안내·확인창·토스트 |
| 28 | admin.html:1229-1256 | 마이그레이션 원본 배열 28개 |
| **81** | index.html:493 | 히어로 카운터 "회원수" data-target=81 |
| **7** | locations.html:191 | "광역시·도" 하드코딩 |
| (대조) | locations.html `FALLBACK`의 region 값 | 8종: 대구, 부산, 울산, 경남 창원, 경남 김해, 경남 기타, 충북 청주, 경기도 → 시·도 단위로는 대구·부산·울산·경남·충북·경기 6곳 |
| 6 | index.html:788 | "6개의 후기" — 실제 고유 후기 카드 6장과 일치 |
| 15 | index.html:494, ai.html:510 등 | "15단계 커리큘럼" — 아코디언 15개와 일치 |

→ **불일치**: 공개 페이지에서 회원 도장 수가 36(index 본문) / 28(locations) / 81(index "회원수")로 서로 다르다. 지역 수는 하드코딩 7, 데이터 기준 6(시·도) 또는 8(region 라벨).

### 5-2. 전화번호·연락 채널

| 값 | 위치 | 비고 |
|---|---|---|
| 010-4304-7768 | ai:586, board:285, contact:388, contact:421, gallery:336, index:958, locations:232, schedule:367, staff:291, virtual:854(tel:), 856, 868 | 공개 페이지 표기 통일 |
| `tel:01043047768` | center.html:207 | 같은 번호, 하이픈 없는 형식, 화면 텍스트 없이 📞 버튼만 |
| 010-4304-7768 | thestepper_homepage (1).html:394, 401, 432 / 새 폴더/index.html:441, 442, 536 | 초안 |
| **010-6278-5079** | — | **전 파일 검색 결과 0건** (HTML·JS·JSON) |
| 카카오 오픈채팅 `open.kakao.com/o/gFVIg0Dh` | contact:392, 417, 427 / gallery:332, 342 / index:954, 969 / locations:228, 238 / schedule:363, 373 / staff:287, 297 / virtual:858 | |
| 카카오 오픈채팅 `open.kakao.com/o/sMYrP0Ai` | **center.html:208** | 다른 페이지와 **다른 링크** |
| YouTube | 12곳은 `@%ED%83%9C…`(인코딩), `index.html:774`만 `@태권민국`(한글) | 같은 채널, 표기만 다름 |

### 5-3. 대표자명

| 값 | 위치 |
|---|---|
| "대표: 김민성" (푸터) | ai:586, board:285, contact:421, gallery:336, index:958, locations:232, schedule:367, staff:291, virtual:868 |
| "김민성 대표" | contact.html:387 (연락처 탭) |
| CEO / 김민성 / 대표 | staff.html:204-206 |
| 후기 본문 "김민성 대표님" | index.html:841, 907 |

→ 이름 표기 불일치 없음. 푸터가 없는 페이지: center, quiz, admin, voice, motion, motion-legacy.

### 5-4. 창단 연도·저작권 연도

| 값 | 위치 |
|---|---|
| SINCE 2021 | index.html:472 (초안 2개 파일에도 동일) |
| 창단 연도 2021 (카운터) | index.html:495 |
| "더스텝퍼를 창단했다" (연도 없음) | staff.html:207 |
| © 2026 | 푸터 9곳 (ai, board, contact, gallery, index, locations, schedule, staff, virtual) |

→ 연도 불일치 없음.

### 5-5. `<title>`과 og:title

| 페이지 | `<title>` | og:title / twitter:title | 일치 여부 |
|---|---|---|---|
| index | THE STEPPER - 태권도 겨루기 클럽 | THE STEPPER \| 태권도 겨루기 **전문 브랜드** | **불일치** (클럽 ↔ 전문 브랜드) |
| ai | AI 겨루기 코치 - THE STEPPER | AI 겨루기 코치 \| THE STEPPER | 문구 일치, 구분자 다름 |
| board | 1:1 문의 - THE STEPPER | 1:1 문의 \| THE STEPPER | 문구 일치 |
| contact | **회원 가입 & 세미나 문의** - THE STEPPER | **세미나 신청 & 문의** \| THE STEPPER | **불일치** |
| locations | 전국 회원 도장 - THE STEPPER | 전국 회원 도장 \| THE STEPPER | 일치 |
| schedule | 세미나 일정 - THE STEPPER | 세미나 일정 \| THE STEPPER | 일치 |
| staff | **스텝 소개** - THE STEPPER | **지도자 소개** \| THE STEPPER | **불일치** |
| virtual | VR 버추얼 태권도 - THE STEPPER | VR 버추얼 태권도 \| THE STEPPER | 일치 |
| motion-legacy | 동작 분석 **(베타)** - THE STEPPER | 동작 분석 **AI** \| THE STEPPER (og:url은 motion.html) | **불일치** |
| center | THE STEPPER - 성인부 & 입시센터 | 없음 | — |
| gallery | 활동 갤러리 - THE STEPPER | 없음 | — |
| quiz | OX 겨루기 퀴즈 — THE STEPPER | 없음 | — |
| admin | 관리자 — THE STEPPER | 없음 | — |
| motion | 동작 분석 \| THE STEPPER | 없음 | — |
| voice | 음성 답변 \| THE STEPPER ADMIN | 없음 | — |

- `<title>` 형식 4종: "페이지 - THE STEPPER"(9), "페이지 \| THE STEPPER"(motion, voice), "페이지 — THE STEPPER"(quiz, admin), "THE STEPPER - 페이지"(index, center).
- 같은 대상을 부르는 이름이 여러 개: staff 페이지 = "스텝 소개"(title·메뉴) / "지도자 소개"(og) / "지도자"(center 메뉴) / "스텝 & 코치진 소개"(h1) / "OUR TEAM". 회원 도장 = "회원 도장" / "가맹 도장"(center:146, gallery:300). 문의 = "회원 가입 문의" / "가맹 문의"(gallery:302) / "문의"(center:150).
- `meta description`이 같은 문장("더스텝퍼 - 대한민국 표준 태권도 겨루기 전술 시스템. 15단계 커리큘럼과 전국 세미나.")으로 index:9, contact:10, locations:9, schedule:10, staff:10에 반복된다.

---

## 6. 공개 메뉴에 admin.html 링크가 보이는 페이지

`⚙ ADMIN` 링크는 `class="admin-only-nav"`가 **없어서** admin-nav.js의 숨김 처리 대상이 아니다. 모든 방문자에게 보인다(`opacity:0.45`, 11px).

| 페이지 | 위치 | 비고 |
|---|---|---|
| index.html | :466 | |
| ai.html | :280 | |
| board.html | :204 | |
| contact.html | :346 | |
| locations.html | :182 | |
| schedule.html | :335 | |
| staff.html | :190 | |
| virtual.html | :589 | |
| motion-legacy.html | :237 | 보관본(noindex)이지만 URL 접근 시 노출 |
| (참고) admin.html | :175 | 관리자 페이지 자체 메뉴, `opacity:0.8` + 금색 |
| (참고) voice.html | :185 | 비관리자에게 보이는 접근 거부 화면의 "관리자 로그인으로 이동" 링크 |

노출되지 않는 페이지: center, gallery, quiz, motion(게이트 링크는 index.html).
반면 `동작 분석`(motion.html)과 `🎙 음성 답변`(voice.html) 메뉴는 `admin-only-nav` + `style="display:none"`으로 숨겨져 있다 — 단 **motion-legacy.html:234는 "동작 분석 (베타)" → motion.html 링크가 숨김 없이 노출**된다.

---

## 7. 사진·이미지 사용 현황

### 7-1. 실제 이미지 파일이 쓰이는 위치

| 종류 | 파일 (Storage 경로 또는 로컬) | 사용 위치 | 개수 |
|---|---|---|---|
| 지도자 프로필 사진 | `staff/김민성_대표`, `송지훈_본부장`, `한승용_본부장`, `최성화_본부장`, `배준성_교육차장`, `홍찬의_홍보부장` (.webp + .png) | staff.html:202, 216, 229, 242, 255, 268 | 6명 × 2포맷 = 12 URL |
| 성인부·입시센터 포스터 | `center/center_01~06.png` (PC), `center_01~06_m.jpg` (모바일) | center.html:158-179 슬라이드, :186-191 썸네일(PC 이미지 재사용) | 12개 파일, `<img>` 18개 |
| 회원 도장 로고 (Storage) | `logos/*.jpg|png|gif` 20종 | locations.html:315-342 `FALLBACK`, admin.html:1229-1256 마이그레이션 데이터 | 20개 파일 (28개 도장 중 20곳만 logoUrl 있음) |
| 회원 도장 로고 (후기 아바타) | `logos/범태권도장.png`, `logos/아이비태권도장.png` | index.html:799, 810 (+복제 865, 876) | 2개 파일, `<img>` 4개 |
| 회원 도장 로고 (로컬 파일) | `THE STEPPER 가맹점 마크/*.jpg|png|gif` | index.html:1344-1367 `marks` 배열 → 버블 애니메이션 | 21개 파일 (레포에 있음) |
| 브랜드 로고 | `assets/logo.png` 15곳, `assets/logo.webp` 10곳 | 각 페이지 nav 로고, index 히어로(:473), favicon(center:8, voice:28-29) | 2개 파일 |
| OG 공유 이미지 | `assets/og_image.png` | 9개 페이지 og:image + twitter:image | 1개 파일, 18곳 |
| 촬영 가이드 이미지 | `guide/motion_guide3.webp`, `.png` | motion-legacy.html:267-269 | 1장 2포맷 |
| 활동 갤러리 (동적) | Storage `gallery/` 폴더 전체 `listAll` | index.html:1101 (페이지당 8장), gallery.html:402-403 | 코드로는 개수 확정 불가 (Storage 내용에 따름) |
| 회원 도장 로고 (동적) | Firestore `locations` 문서의 `logoUrl` | locations.html:370, admin.html:1162 | 데이터에 따름 |
| 영상 (이미지 아님) | YouTube iframe | index.html:510, 771, 772 | 3개 |

- Firebase Storage URL 등장 횟수: locations 24, center 20, admin 20, staff 16, index 10, motion-legacy 6, ai·board·contact·schedule·virtual 각 4, voice 2, gallery 1, motion·quiz 0.
- 같은 도장의 로고가 두 곳에 따로 저장되어 쓰인다: Storage `logos/`(locations·admin·index 후기) / 레포 로컬 `THE STEPPER 가맹점 마크/`(index 버블). 로컬 폴더에는 `한국체대건강한태권도.jpg`가 있지만 locations `FALLBACK`의 한국체대건강한태권도(order 25)는 `logoUrl:''`.

### 7-2. 사진 대신 로고·이모지·텍스트로 채운 영역

| 위치 | 영역 | 채운 것 |
|---|---|---|
| index.html:469-497 | 메인 히어로 | 로고 이미지(:473) + 텍스트 + CSS 배경(`.hero-bg`, `.hero-grid`). 사진 없음 |
| index.html:821, 832, 843, 854 (+887, 898, 909, 920) | 후기 아바타 4곳 | 🥋 이모지. 이 중 **해솔태권도장은 Storage 로고(`logos/해솔태권도.jpg`, locations.html:320)가 있는데도 🥋** |
| index.html:526-528 | 소개 01/02/03 카드 | 번호 + 텍스트만 |
| index.html:942, 1103, 1113 / gallery.html:317, 406, 427 | 갤러리 빈 상태·오류 | 📸 + 안내 문구 |
| locations.html:372 | 로고 없는 도장 카드 (`FALLBACK` 기준 8곳: 현대유성, 다원, 진해감사랑리더십, 율하, 용인대청룡, 장유경희대, 동아대태권스쿨, 한국체대건강한) | 🥋 (`.dojang-logo-empty`) |
| locations.html:217-219 | 지도 영역 | 🗺 + 텍스트 placeholder (지도 임베드 없음, 카카오맵 외부 링크 `:278, 379`) |
| admin.html:1162 | 도장 목록 로고 없음 | 🥋 (`.loc-logo-empty`) |
| ai.html:515, 1268 | 채팅 환영 화면 | 🥋 (`.welcome-icon`) |
| ai.html:1332, 1347 | 채팅 말풍선 아바타 | 🥋(AI) / 👤(사용자) |
| ai.html:395, 414, 443 | 인증·안내 모달 일러스트 | 📩 52px, ✉️ 44px, 🔧 40px |
| board.html:360 | 문의 내역 없음 | 📭 |
| virtual.html 전체 | VR 소개 페이지 | `<img>`는 nav 로고 1개뿐. 혜택(:634-648), 장비 스펙(:688-702), 모드 4종(:727-769), 도입 효과(:799-825)를 모두 이모지 아이콘(🤖 📹 🥋 🥽 🎮 🦵 🧱 🌐 🏆 📣 🏋️ 📊)으로 채움. "EXCLUSIVE PARTNER"(:679)도 텍스트 배지 |
| quiz.html:246, 254, 290, 515-524 | 시작·결과 화면 | 🥋 🥋⭐ 🏆 🥇 👏 💪 |
| motion.html:132 / voice.html:181 | 접근 거부 화면 | 🔒 |
| voice.html:214 | 대기 질문 없음 | ✅ |
| schedule.html, contact.html, board.html | 본문 | nav 로고 외 이미지 없음 (contact는 Google Forms iframe) |

---

## 8. 내비게이션 메뉴 비교

### 8-1. 햄버거 메뉴 항목 (`#navMenu` / center는 `#menuOverlay`)

기준 = ai, board, contact, locations, schedule, staff, virtual (7개 페이지 완전히 동일한 15개 항목).

| # | 항목 → 링크 | 기준 7페이지 | index | admin | motion-legacy | center | gallery |
|---|---|---|---|---|---|---|---|
| 1 | 홈 → index.html | ● | ● (현재, var(--gold) 미정의) | ● | ● | ● | ● |
| 2 | 브랜드 스토리 → index.html#about | ● | ● | ● | ● | — | ● |
| 3 | 커리큘럼 → index.html#curriculum | ● | ● | ● | ● | — | ● |
| 4 | 세미나 일정 → schedule.html | ● | ● | ● | ● | ● | ● |
| 5 | 스텝 소개 → staff.html | ● | ● | ● | ● | "지도자" | ● |
| 6 | 회원 도장 → locations.html | ● | ● | ● | ● | "가맹 도장" | "가맹 도장" |
| 7 | 회원 도장 후기 → index.html#reviews | ● | ● (`#reviews`) | ● | ● | — | — |
| 8 | 활동 갤러리 → index.html#gallery | ● | ● | ● | ● | — | ● → **gallery.html** |
| 9 | 회원 가입 문의 → contact.html | ● | ● | ● | ● | "문의" | "가맹 문의" |
| 10 | AI 겨루기 코치 → ai.html | ● | ● | ● | ● | "AI 코치" | — |
| 11 | 🎮 OX 겨루기 퀴즈 → quiz.html | — | **●** (:458, 유일) | — | — | — | — |
| 12 | 동작 분석 → motion.html | 숨김 | 숨김 | 숨김 | **노출** "동작 분석 (베타)" | — | — |
| 13 | 🎙 음성 답변 → voice.html | 숨김 | 숨김 | 숨김 | **없음** | — | — |
| 14 | 1:1 문의 → board.html | ● | ● | ● | ● | — | — |
| 15 | VR 버추얼 태권도 → virtual.html | ● | ● | ● | ● | — | — |
| 16 | ⚙ ADMIN → admin.html | ● | ● | ● (금색, opacity .8) | ● | — | — |
| — | 성인부 & 입시센터 → center.html | — | — | — | — | ● (현재) | — |
| — | 성인 겨루기반 → center.html#adult | — | — | — | — | ● **앵커 대상 id 없음** | — |
| — | 대학 입시반 → center.html#entrance | — | — | — | — | ● **앵커 대상 id 없음** | — |
| | 항목 수 | 15 | 16 | 15 | 14 | 9 | 8 |

- 메뉴 없는 페이지: quiz(`🏠 홈으로` 링크만, :230), motion·voice(관리자 게이트).
- 메뉴 UI 형식 2종: 우측 드롭다운 `.nav-menu`(대부분) / 전체화면 오버레이 `.menu-overlay` + ✕ 닫기(center).
- 현재 페이지 강조 방식: 인라인 `style="color:var(--gold);font-weight:800"`(ai, board, contact, index, locations, motion-legacy, schedule, staff, virtual) / admin은 `⚙ ADMIN` 항목에 같은 방식 + opacity .8 / `class="active-menu"`(center) / 없음(gallery).
- gallery.html로 들어오는 링크는 gallery 자신의 메뉴(:301)뿐이다. 다른 페이지 메뉴는 모두 index.html#gallery를 가리킨다.
- quiz.html로 들어오는 링크는 index 메뉴(:458)뿐이다.

### 8-2. 상단 바 요소

| 요소 | 있는 페이지 | 차이 |
|---|---|---|
| 빠른 링크 3개 `.nav-quick` (성인&입시 / VR 태권도 / AI 코치) | ai, board, center, contact, index, locations, motion-legacy, schedule, staff, virtual | gallery, admin, quiz, motion, voice에는 없음 |
| 뒤로가기 `.nav-back` | "← 메인으로": ai, board, contact, locations, schedule, staff, virtual / "← 홈으로": center / "← 메인": motion-legacy | index, gallery에는 없음 |
| 로고 | 대부분 Storage logo.png(+webp) `<picture>` | center는 `<img>` + 텍스트 "THE STEPPER"(:125-126), admin은 텍스트만(:154) |
| 보관함 버튼 📬 | ai.html:251-253 | ai 전용 |

### 8-3. 푸터

| 페이지 | SNS 링크 (Instagram / 카카오톡 / YouTube) | 저작권·대표·전화 줄 |
|---|---|---|
| contact, gallery, index, locations, schedule, staff | ● | ● |
| ai, board, virtual | — | ● |
| center, quiz, admin, motion, motion-legacy, voice | 푸터 없음 | — |

---

## 9. 공통 디자인 토큰으로 통합할 때 정리해야 할 항목 (우선순위 순)

위 1~8의 코드 확인 결과만 근거로 정리했다.

### P1. 값이 서로 모순되거나 깨진 것 (토큰을 만들기 전에 먼저 결정해야 함)

1. **브랜드 레드 하나로 결정** — `--red`가 #C8102E(6개 페이지)와 #C0392B(6개 페이지)로 갈리고, center는 #C0392B 하드코딩, motion은 #C00, quiz는 #FF4757. 레드 투명 변형도 rgba(200,16,46,α) 94회 / rgba(192,57,43,α) 52회로 두 갈래. hover용 어두운 레드도 6종(#A0301F, #A50D24, #A00D24, #9B0C22, #8B0000, #8E1F14). (2-1, 2-2)
2. **의미가 뒤집힌 변수 이름 정리** — index의 `--black:#FFFFFF`, `--white:#0D1B2E`; 4개 페이지의 `--dark:#f5f5f7`(밝은 색); `--gray` 3종(#f5f5f7 / #1a1a1a / #EDF0F5); 금색을 `--gold`(10개 페이지)와 `--yellow`(index)로 다르게 부르고, `--yellow`는 다른 3개 페이지에서 #FFE000. (2-1)
3. **정의되지 않은 변수 4곳** — index.html:448 `--gold`, contact.html:146·353 `--yellow`, schedule.html:145 `--yellow`. (2-1)
4. **같은 파일 안의 `:root` 이중 정의** — locations(:29→:72), staff(:30→:78)는 뒤 정의가 --red·--gray를 덮어씀. index·contact·schedule은 동일 내용을 두 번 정의. (2-1)
5. **contact.html:353 제목 색** — `var(--white)`=#fff가 흰 배경(#ffffff) 위에 지정됨. (2-1)

### P2. 폰트

6. **웹폰트 로딩 방식 하나로 통일** — 무효인 중간 `@import` 4곳(index:65, contact:78, schedule:77, staff:77) 때문에 Black Han Sans는 gallery에서만 실제로 불러옴. center·voice·motion은 웹폰트 미로딩. motion-legacy만 `<link>` 방식. (1)
7. **굵기 목록 맞추기** — 600(95회)·800(36회)을 쓰지만 공개 페이지는 300·400·500·700·900만 불러옴. admin은 800 미로딩. (2-5)
8. **한글 제목용 서체 결정** — Bebas Neue(라틴 전용)가 한글 제목·이름(.section-title, .page-title, staff .card-name, contact·gallery h1)에 지정됨. (2-5)
9. **타입 스케일** — font-size 62종, px·rem·clamp·em 혼용. (2-5)

### P3. 색 스케일

10. **회색 단계 축소** — 본문 텍스트 7종(#1D1D1F 162회 외 #1A1A1A, #333, #222, #3D3D3F, #111, #0D1B2E), 보조 텍스트 12종 이상(#6E6E73 129회, #888 60회, #666, #555, #AAA …), 테두리 8종 이상(#E5E5E7 77회 외), 밝은 표면 6종 이상(#F5F5F7 54회 외), #FFF/#FFFFFF 표기 혼용. (2-2, 무채색 스케일 표)
11. **index 전용 네이비 팔레트 처리** — #0D1B2E(40), #1E3048(24), #253A50, #D8E0EA, #DDE3EA, #EDF0F5, #95A5B5 등이 index에서만 쓰이고, `:342` 이후 `!important` 29개로 기존 스타일을 덮어쓰는 구조. (2-0, 2-2, 4-4)
12. **상태색 정의** — 성공 9종, 정보 8종, 경고 7종, 오류 4종이 페이지마다 다름(주로 admin·motion·voice·quiz). (2-2)
13. **테마 범위 결정** — 밝은 배경(대부분) / 다크 gallery(#0a0a0a 배경) / 다크 voice(#0f1115) / quiz 전용 팔레트(--ink, --purple 등)가 공존. (2-1)
14. **투명도 단계** — 흰색 rgba 알파 28종, 검정 18종, #C8102E 14종, #C0392B 19종, #C9A84C 17종. (2-2 rgba 표)

### P4. 모양(형태) 토큰

15. **border-radius** 30종 → 8/10/12px 주력값 중심으로 축소 필요(4·5·6·7·14·16·18·20·22·24·28·30·40·50px 등 산재, 5px 25회는 admin 전용). (2-6)
16. **box-shadow** 46종 중 36종이 1회 사용. gradient 58종 중 40종이 1회 사용. (2-6)
17. **글래스 효과** — nav의 `backdrop-filter: blur(10px)` + `rgba(255,255,255,0.97)` 조합 16곳, center만 `blur(8px)`. `-webkit-` 접두 없음. (2-6)
18. **gradient** 58종 (인스타그램 그라데이션·히어로 방사형 등 페이지마다 다시 작성). (2-6)

### P5. 컴포넌트·구조 (토큰을 적용할 단위)

19. **인라인 CSS의 반복 복사본 정리** — 외부 CSS 0개. `.section-tag/.section-title/.section-desc`가 페이지마다 다시 정의되고(index 3회), contact·gallery·schedule·locations에는 쓰지 않는 `.stat-num`·`.visitor-counter` CSS가, schedule에는 대상 없는 카운터 JS가 남아 있음. admin은 `style=""` 속성 391개. (2-0, 4-1, 4-2)
20. **내비게이션 단일화** — 메뉴 변형 5종(기준 15개 / index 16개 / motion-legacy 14개 / center 9개 / gallery 8개), 용어 혼용(회원↔가맹, 스텝 소개↔지도자, 회원 가입 문의↔가맹 문의↔문의), 현재 페이지 강조 방식 3종(인라인 금색 / active-menu 클래스 / 없음), 뒤로가기 문구 3종, center 메뉴의 대상 없는 앵커 2개(#adult, #entrance). (8)
21. **⚙ ADMIN 링크 노출 정리** — 공개 9개 페이지 메뉴에 숨김 클래스 없이 노출. motion-legacy는 관리자 전용 motion.html 링크도 노출. (6)
22. **아이콘 체계** — 화면에 나오는 이모지·기호 433줄(아이콘 207, 버튼 80, 대체이미지 35, 장식 90, 구두점 21), 인라인 SVG는 8개 페이지에 2~4개씩. 이모지가 사진·로고 자리를 대신하는 곳 35건. (3, 7-2)
23. **사실 정보 단일 소스화** — 회원 도장 수 36 / 28 / 81, 지역 수 7 vs 데이터 6(시·도), 카카오 링크 2종(center만 다름), `<title>` 형식 4종, title↔og:title 불일치 4건(index, contact, staff, motion-legacy), 공통 meta description 5곳 반복. (5)
24. **이미지 자산 경로 일원화** — 도장 로고가 Storage `logos/`(20종)와 레포 로컬 폴더(21종) 두 곳에 있고, 로고가 있는 해솔태권도장 후기도 🥋로 표시됨. (7)
