# 리뉴얼 시공 1차 보고서 — 공통 파일 + index.html A안

- 브랜치: `renewal-a` (기준 `origin/main` `00d2447`). main 병합 안 함.
- 작업일: 2026-10-19

## 0단계 조사 결과

### 0-1. 기존 index.html 에서 추출한 것

**유튜브 영상** (제목은 YouTube oEmbed 로 조회)

| 영상 ID | 기존 위치 | 기존 iframe title | YouTube 제목 | 새 배치 |
|---|---|---|---|---|
| `z5Z5YlxJmbA` | 철학 영상 섹션 "우리는 왜 이 길을 선택했는가" | THE STEPPER 철학 | "전통 태권도가 지구상에서 사라지고 있다" "Traditional Taekwondo is disappearing from Earth." | 큰 영상 |
| `aMHA2mKyh8E` | 유튜브 섹션 "세미나 현장 영상" | 세미나1 | 상대방이 제자리에서 반격 준비중이다? 그럼 이거지!!! | 작은 영상 1 |
| `hnRq2J1XRuA` | 유튜브 섹션 "세미나 현장 영상" | 세미나2 | THE STEPPER  10월 겨루기 교육 | 작은 영상 2 |

**회원 도장 후기** — 기존 index.html 에는 3개가 아니라 **6개**가 있다(무한 슬라이드용으로 같은 6개를 한 번 더 복제). 6개 모두 원문 그대로 옮겼다.

| 관장 | 도장 · 지역 | 원문 |
|---|---|---|
| 이정안 관장 | 범태권도장 · 대구 | 15단계 커리큘럼이 정말 체계적입니다. 아이들이 단계별로 성장하는 게 눈에 보여요. 더스텝퍼 가입 후 도장 수강생이 눈에 띄게 늘었습니다. |
| 서정민 관장 | 아이비태권도장 · 대구 | 세미나 내용이 현장에서 바로 쓸 수 있는 실전 전술 위주라 너무 좋습니다. 지도자로서 많이 배우고 있어요. |
| 조금호 관장 | 진해감사랑리더십태권도장 · 창원 | 더스텝퍼와 함께하면서 겨루기 교육의 방향이 완전히 바뀌었습니다. 체계적인 커리큘럼 덕분에 지도가 훨씬 쉬워졌어요. |
| 임경민 관장 | 율하태권도장 · 김해 | 전국 세미나를 통해 다른 지역 관장님들과 네트워크가 생겨서 너무 좋습니다. 정보 공유도 활발하고요. |
| 박우정 관장 | 다원태권도 · 창원 | 김민성 대표님의 겨루기 철학이 담긴 커리큘럼입니다. 단순 기술이 아닌 전술적 사고를 키워주는 교육이에요. |
| 선창우 관장 | 해솔태권도장 · 울산 | 처음엔 반신반의했는데 세미나 두 번 참가하고 완전히 팬이 됐습니다. 지도자로서 성장하는 느낌이 확실해요. |

**외부 링크**

| 항목 | 주소 | 비고 |
|---|---|---|
| 유튜브 채널 | `https://www.youtube.com/@%ED%83%9C%EA%B6%8C%EB%AF%BC%EA%B5%AD` (태권민국) | |
| 인스타그램 | `https://www.instagram.com/the_stepper_kms` | |
| 카카오톡 | `https://open.kakao.com/o/gFVIg0Dh` | index·contact 등 14곳. center.html 만 `sMYrP0Ai` 로 다름 — 푸터에는 다수 쪽을 사용 |
| 1:1 문의 | `board.html` | |
| (참고) 대한버추얼스포츠협회 | `https://koreavsa.com/` | 기존 플로팅 버튼. 새 구성에 없음 |

**기존 헤더의 기능성 링크**
- 로그인/로그아웃: 기존 index.html 헤더에는 **없음** (ai.html·board.html 에만 있음).
- 관리자 전용 링크 2개: `동작 분석`(motion.html), `🎙 음성 답변`(voice.html). `class="admin-only-nav"` + `display:none`, `admin-nav.js` 가 관리자 이메일로 로그인했을 때만 보이게 함 → **새 헤더에 같은 방식 그대로 옮김** (데스크톱 메뉴·모바일 전체 메뉴 양쪽, `admin-nav.js` 계속 로드).
- 햄버거 메뉴 열기/닫기(`toggleMenu`), 상단 빠른 링크 3개(성인&입시→center.html, VR 태권도→virtual.html, AI 코치→ai.html).

**숫자 카운터 애니메이션 (모두 제거)**
- 기존 `index.html:492-496` 히어로 `.stat-num[data-target]`(회원수 81 / 15 / 2021 / KOR) + `:988-1010` `animateCounter`.
- 기존 `index.html:476-481` 누적 방문자 + `:1012-1068` Firestore `stats/visitors` 증가 후 `animateCount`.

### 0-2. 전화번호 검색 (레포 전체, 이번에는 index.html 외 수정 안 함)

- **010-6278-5079: 0건** (HTML·JS·JSON·MD 전체). 이 번호는 레포 어디에도 없다.
- 010-4304-7768 (`tel:01043047768` 형식 포함):
  ai.html:585 · board.html:284 · center.html:207(`tel:01043047768`) · contact.html:387, 420 · gallery.html:336 · locations.html:231 · schedule.html:366 · staff.html:290 · virtual.html:853(`tel:`), 855, 867 · thestepper_homepage (1).html:394, 401, 432 · 새 폴더/index.html:441, 442, 536 · docs/design-audit.md(보고서 본문) · 기존 index.html:957 (리뉴얼 후 푸터 `tel:010-4304-7768`)

### 0-3. 사진 자산과 추천

레포에 `images` 폴더는 없었다. 레포 안 사진(교본 페이지 이미지·로고 폴더 제외, 열어서 내용 확인):

| 파일 | 가로×세로 | git | 내용 |
|---|---|---|---|
| 홈페이지 사진/Gemini_Generated_Image_*.png (5장) | 2110×2048 | 미추적 | AI 생성 VR 일러스트(발차기·복싱·축구·테니스·양궁) — 실사 아님 |
| 더 스텝퍼 하계훈련/KakaoTalk_20260701_130741834_01.jpg | 4000×3000 | 미추적 | 지도자와 수련생들이 서 있는 장면(세로 구도) |
| 더 스텝퍼 하계훈련/KakaoTalk_20260701_131422504.jpg | 4000×2252 | 미추적 | 빨간 THE STEPPER 셔츠 지도자가 **왼쪽 앞**에 서서 유소년 단체 훈련을 지도 |
| 더 스텝퍼 하계훈련/Gemini_Generated_Image_vvxg….png | 2048×2048 | 미추적 | 하계 캠프 포스터(문구 포함) |
| 입시 센터/11.jpg | 4000×3000 | 미추적 | 미트 잡은 두 사람 + 앞에 앉은 사람(세로 구도) |
| 입시 센터/KakaoTalk_20260629_011656709.jpg | 1080×609 | 추적 | 세미나장, 지도자와 미트 든 선수 두 명이 **가운데~오른쪽**에서 가까이 붙음. 영상 캡처라 모서리에 로고 워터마크 |
| 입시 센터/KakaoTalk_20260629_011656709_01.jpg | 1080×608 | 추적 | 세미나 참가자들(영상 캡처) |
| 입시 센터/KakaoTalk_20260629_011656709_02.jpg | 1024×565 | 추적 | 빨간 셔츠 지도자가 **왼쪽**에서 시범, 참가자들은 오른쪽 |
| 입시 센터/KakaoTalk_20260629_011656709_03.jpg | 1080×833 | 추적 | 지도자가 가운데~오른쪽에서 시범 |
| 입시 센터/KakaoTalk_20260629_011656709_04.jpg | 1080×810 | 추적 | 단체 기념사진 |
| 입시 센터/KakaoTalk_20260629_144253916.png / _144314427.jpg | 871×1229 / 736×737 | 추적 | 수련 계획표 / 타 도장 로고 |
| THE STEPPER 스텝 사진/*.png, 입시 센터/송지훈 감독.jpg, 유성희 지도 관장.jpg, 김민성 대표.png | 1024~3744 | 일부 추적 | 지도자 단독 프로필(흰 배경) |
| 11111.png, motion_guide3*.png, AI 코치 프로그램/1~6.png | — | 미추적 | 동작 분석 촬영 가이드 화면 |

`입시 센터/앱 비밀번호.png` 는 파일명상 민감 정보로 보여 **열지 않았다**. 레포 폴더에 있으니 확인 후 삭제를 권한다(커밋 여부: 미추적).

**첫 화면 후보 (선수 두 명이 붙는 장면, 인물 오른쪽)** — 정확히 "두 선수가 붙는" 실사는 없음

1. **(적용)** `입시 센터/KakaoTalk_20260629_011656709.jpg` — 두 사람이 오른쪽에서 가까이 붙음. 단 1080px 영상 캡처라 데스크톱에서 흐릿함. 위쪽 80px(워터마크)를 잘라 `images/renewal/hero.jpg`(1080×528)로 저장.
2. `입시 센터/11.jpg` — 고해상도(4000×3000)지만 세로 구도·인물 가운데.
3. `더 스텝퍼 하계훈련/KakaoTalk_20260701_130741834_01.jpg` — 고해상도, 인물 오른쪽이지만 붙는 장면 아님.

**세미나 후보 (시범 장면, 인물 왼쪽)**

1. **(적용)** `더 스텝퍼 하계훈련/KakaoTalk_20260701_131422504.jpg` — 지도자 왼쪽, 고해상도. 가로 2000px 로 줄여 `images/renewal/seminar.jpg`(2000×1126, 228KB). **유소년 얼굴이 보이므로 게시 동의 확인 필요.**
2. `입시 센터/KakaoTalk_20260629_011656709_02.jpg` — 지도자 왼쪽 시범, 1024px.
3. `입시 센터/KakaoTalk_20260629_011656709_03.jpg` — 시범 장면이나 인물이 가운데~오른쪽.

**사진 교체 방법**: `images/renewal/hero.jpg`(가로형, 인물 오른쪽) / `images/renewal/seminar.jpg`(가로형, 인물 왼쪽)를 **같은 파일명으로 덮어쓰고 커밋**하면 된다. 권장 크기 가로 2400px 이상, JPEG 300KB 내외. 다른 비율이어도 `object-fit: cover` 로 채워진다(index.html 의 `width`/`height` 속성은 비율 힌트일 뿐이라 그대로 둬도 무방).

### 0-4. 회원 도장 컬렉션

- 컬렉션: **`locations`** (admin.html:1149 조회, :1207 추가, :1220 삭제)
- 필드: `name`, `owner`, `address`, `region`, `logoUrl`, `storagePath`, `order`, `createdAt`
- **지역 필드: `region`** — 값은 admin.html:286-294 선택지 8종: 대구 / 부산 / 울산 / 경남 창원 / 경남 김해 / 경남 기타 / 충북 청주 / 경기도
- 레포 `firestore.rules`(= 2026-10-16 배포본): `match /locations/{doc=**} { allow read: if true; ... }` → **로그인 없이 읽기 가능**. 실제 비로그인 REST 조회로도 확인(문서 28개).
- 세미나: 컬렉션 **`schedules`**(필드 `date`, `title`, `detail`, `type`, `createdAt`, `updatedAt`), 규칙 `allow read: if true` → 읽기 가능. 문서 26개, **오늘(2026-10-19) 이후 일정 0개**. 같은 날짜에 일정이 2건씩 등록된 경우가 11쌍(그중 9쌍은 제목까지 동일) 보인다(데이터 정리 필요, 이번에 수정 안 함).
- 규칙 변경 필요 없음.

### 0-5. 메뉴 7개 연결 대상

| 메뉴 | 연결 | 근거 |
|---|---|---|
| 영상 | `index.html#video` | 영상 전용 페이지 없음 |
| 브랜드 | `index.html#why` | 기존 "브랜드 스토리"가 index.html#about(왜 더스텝퍼인가)였고, 같은 내용이 새 #why 섹션 |
| 커리큘럼 | `index.html#curriculum` | **curriculum.html 이 레포에 없음** |
| AI 코치 | `ai.html` | |
| 세미나 | `schedule.html` | 세미나 일정 페이지 |
| 회원 도장 | `locations.html` | |
| 문의 | `contact.html` | 회원 가입 & 세미나 문의 |
| (버튼) 세미나 신청 | `contact.html` | contact.html 첫 탭이 "세미나 신청"(구글 폼) |

index.html 안에서는 `#video` 처럼 같은 문서 앵커로 바꿔 새로고침 없이 이동한다.

## 만든 파일 / 수정한 파일

| 구분 | 파일 | 내용 |
|---|---|---|
| 신규 | `css/stepper-a.css` | 공통 토큰·글꼴·라벨·제목·버튼 3종·구분선·헤더/메뉴/푸터 |
| 신규 | `css/stepper-a-index.css` | index.html 전용 섹션 스타일 |
| 신규 | `js/stepper-layout.js` | 공통 메뉴·하단 정보 컴포넌트 |
| 신규 | `js/curriculum-data.js` | 15단계 42장 단일 출처 |
| 신규 | `js/stepper-index.js` | 영상 지연 로드·커리큘럼·Firestore 공개 읽기 |
| 신규 | `images/renewal/hero.jpg`, `seminar.jpg` | 0-3 추천 1순위 가공본 |
| 신규 | `docs/renewal/*.png`, `curriculum-check.md`, `REPORT.md` | 검증 결과 |
| 수정 | `index.html` | head 메타 26줄 보존, 본문 전면 교체 |

기존 공통 CSS 파일은 원래 없다(모든 페이지가 인라인 `<style>`). 다른 HTML·Firebase 설정·firestore.rules·api 코드는 손대지 않았다.

## 커밋 목록 (`origin/main..renewal-a`)

- `591d14c` 리뉴얼 A안 공통 파일: 디자인 토큰 CSS·공통 메뉴/하단 정보·커리큘럼 데이터
- `b851751` stepper-a.css: 한글 어절 단위 줄바꿈(keep-all), Mono 글꼴의 한글 대체 서체 지정
- `b0a4668` index.html 을 리뉴얼 A안으로 교체
- `0623237` docs/renewal: 검증 스크린샷과 커리큘럼 42장 대조표
- (이 보고서 커밋)

## 기존 index.html 에서 이번 구성에 없어 삭제한 기능

1. 누적 방문자 카운터 — Firestore `stats/visitors` 를 방문마다 +1 하던 기능. **삭제했으므로 방문자 집계가 멈춘다.**
2. 히어로 숫자 카운터(회원수 81 · 15 · 2021 · KOR) — 카운트업 금지 지시
3. 상단 빠른 링크 "성인&입시"(center.html), "VR 태권도"(virtual.html)
4. 햄버거 메뉴 항목 중 새 7개에 없는 것: 홈, 스텝 소개(staff.html), 회원 도장 후기, 활동 갤러리, **🎮 OX 겨루기 퀴즈(quiz.html)**, VR 버추얼 태권도(virtual.html). 1:1 문의는 푸터로 이동
5. "더스텝퍼 스텝 & 코치진 소개 →" 버튼(staff.html)
6. 활동 갤러리 섹션 — Storage `gallery/` 사진 목록, 8장 단위 페이지 넘김, 확대 보기
7. 회원 도장 로고 버블 애니메이션(레포 `THE STEPPER 가맹점 마크/` 로고 21개)
8. 화면 오른쪽 아래 플로팅 버튼 4개(대한버추얼스포츠협회 koreavsa.com, 유튜브, 카카오톡, 인스타그램) — 유튜브·카카오톡·인스타그램은 푸터로
9. 후기 무한 가로 슬라이드·드래그·별점·도장 로고 아바타·"6개의 후기" 배지·"✦ 더 많은 후기가 업데이트될 예정입니다 ✦"
10. 히어로 대형 로고, 슬로건 "Move Fast, Kick Harder.", 배지 "TAEKWONDO COMPETITION CLUB · SINCE 2021 · KOREA", 히어로 버튼 4개
11. 교육 철학 카드 — 지시 문구로 교체되며 원문 마지막 문장 "이것이 더스텝퍼 교육의 핵심 원칙입니다."는 빠짐
12. 대상 없는 `switchTab` 함수

→ 새 index.html 에서 **더 이상 들어갈 길이 없는 페이지: staff.html, virtual.html, center.html, quiz.html** (gallery.html 은 원래부터 연결 없음).

## 자리표시로 남은 항목과 필요한 자료

| 항목 | 현재 | 필요한 것 |
|---|---|---|
| AI 코치 대화 화면 | "AI 코치 대화 화면 캡처 예정" 상자 | 실제 ai.html 대화 화면 캡처(PNG, 세로형 가능). 레포의 1~6.png 등은 동작 분석 가이드라 쓰지 않음 |
| 회원 도장 지도 | 테두리 상자 자리표시 | 다음 단계 구현 |
| "커리큘럼 전체 보기" 링크 | **넣지 않음** | curriculum.html 이 없어 링크하면 404. 페이지를 만들지, 다른 곳으로 보낼지 결정 필요 |
| 첫 화면 사진 | 1080px 영상 캡처(흐릿함) | 두 선수가 붙는 고해상도 가로 사진(인물 오른쪽, 2400px 이상) |
| 세미나 사진 | 유소년 얼굴 노출 | 게시 동의 확인 또는 다른 사진 |
| 010-6278-5079 | 레포에 없음 | 어디에 써야 하는 번호인지 확인 |

## 지시와 다르게 처리했거나 판단이 들어간 부분

- **회원 도장 수**: 지시대로 처음 29를 넣고 조회 성공 시 교체 → 실제 Firestore 문서 수가 **28**이라 화면에는 **28곳**이 표시된다. 조회 실패 시 대체 문구는 지시대로 "전국 29곳…". 29가 맞다면 관리자 페이지에서 도장 1곳을 추가해야 한다.
- **시·도 묶음**: `region` 첫 단어로 묶고 "경기도"는 "경기"로 표기 → 경남 20 / 대구 2 / 부산 2 / 울산 2 / 경기 1 / 충북 1.
- **후기 6개**: 지시는 "3개"였으나 기존 원문이 6개라 모두 넣었다(3열 × 2줄). 3개로 줄일 경우 어느 3개를 남길지 알려주면 된다.
- **h2 크기**: 시안 값이 지시문에 없어 `clamp(30px, 4.4vw, 60px)` 로 정했다.
- **첫 화면 제목 줄바꿈**: 104px 글자로는 "사라지기 전에,"가 620px 안에 들어가지 않는다. 글자 중간이 끊기지 않도록 어절 단위 줄바꿈(`word-break: keep-all`)을 적용해 1440px 에서 "사라지기 / 전에, / 기록한다." 3줄로 보인다(390px 에서는 의도대로 2줄).
- **Mono 라벨의 한글**: IBM Plex Mono 에는 한글이 없어 한글 부분은 IBM Plex Sans KR 로 표시되게 글꼴 순서를 지정했다.
- **영상 캡션**: 큰 영상은 "우리는 왜 이 길을 선택했는가", 작은 영상은 "세미나 현장 — {YouTube 제목}".
- **세미나 일정 기준**: `date` 가 오늘 이후인 문서(type 값과 무관), 날짜순 3개.
- **카카오톡 상담 링크**: `gFVIg0Dh`(다수 페이지) 사용. center.html 의 `sMYrP0Ai` 와 어느 쪽이 맞는지 확인 필요.

## 검증 결과

모든 항목은 Playwright(Chromium)로 로컬 정적 서버에 대해 실제로 실행했다.

### 1. 세 폭 전체 스크린샷 / 가로 스크롤

| 폭 | 파일 | scrollWidth / clientWidth | 가로 스크롤 |
|---|---|---|---|
| 1440 | `docs/renewal/index-1440.png` | 1440 / 1440 | 없음 |
| 768 | `docs/renewal/index-768.png` | 768 / 768 | 없음 |
| 390 | `docs/renewal/index-390.png` | 390 / 390 | 없음 |

### 2. 390px 상호작용 (실제 클릭)

- 메뉴: "메뉴" 버튼 표시·데스크톱 메뉴 숨김 ✔ / 열면 `aria-expanded="true"`, 전체 화면 표시, 본문 스크롤 잠금, 닫기 버튼으로 포커스 이동 ✔ / Esc 로 닫힘 + 메뉴 버튼으로 포커스 복귀 ✔ / 닫기 버튼으로 닫힘 ✔ / 항목("커리큘럼") 클릭으로 닫힘 + 스크롤 잠금 해제 ✔ — `index-390-menu-open.png`
- 커리큘럼: 01단계 열림(`aria-expanded="true"`, 부호 −, 장 5개 표시) ✔ / 02단계를 누르면 01단계가 닫힘(한 번에 하나) ✔ / 다시 누르면 닫힘 ✔ / `aria-controls="stage-1-panel"` ✔ — `index-390-curriculum-open.png`
- 영상: 클릭 전 iframe 0개 → 클릭 후 1개, `src=https://www.youtube-nocookie.com/embed/z5Z5YlxJmbA?autoplay=1&rel=0` ✔ — `index-390-video-playing.png`

### 3. 브라우저 콘솔 에러

- 최종 실행: **console.error 0건, pageerror 0건, 요청 실패 0건** (1440·768·390 세 폭).
- 첫 실행에서 요청 실패 1건이 있었다(콘솔 에러 아님): `requestfailed: https://yt3.ggpht.com/8qOFSxr4YJOZEuOU7QgbGLNiLSnxlQefWJoProZEacVGDB7IlNNyAe9dkXXr4DmNv40PH8qlRg=s88-c-k-c0x00ffffff-no-rj net::ERR_ABORTED` — 재생시킨 YouTube iframe 안의 채널 아이콘 요청이 테스트가 페이지를 닫으면서 중단된 것.

### 4. 다른 페이지 리뉴얼 전후 비교 (1440×900 첫 화면, origin/main 스냅샷 대 renewal-a)

| 페이지 | HTTP 전/후 | 다른 픽셀 |
|---|---|---|
| ai.html | 200 / 200 | 0 |
| curriculum.html | **404 / 404** | — (파일 없음) |
| center.html | 200 / 200 | 0 |
| gallery.html | 200 / 200 | 0 |
| admin.html | 200 / 200 | 0 |

이 파일들은 `git diff origin/main renewal-a` 에도 변경이 없다.

### 5. 커리큘럼 대조 / 도장 수

- 42장 원문 대조표: `docs/renewal/curriculum-check.md` — 단계 15개·장 42개, **원문 대비 불일치 0건**. (참고: thestepper-api 의 `_curriculumChapters.js` 사본은 31장·37장 제목을 줄여 적어 원문과 다름 — 이번 범위 밖)
- 도장 수 조회: **성공**, 표시값 **28** (수치 칸과 "기록 01" 03번 항목 두 곳). 시·도 목록 표시 성공.
- 세미나 조회: 성공, 다가오는 일정 0개 → "예정된 세미나는 곧 공지됩니다".
- 글꼴 로드 확인: IBM Plex Mono 500·600, IBM Plex Sans KR 400·500·700, Noto Serif KR 600·900.

### 대비 (WCAG, 본문 4.5:1 이상)

| 조합 | 대비 |
|---|---|
| 본문 #111111 / #F2F1EC | 16.70 |
| 보조 #55534E / #F2F1EC · #E9E7E0 | 6.79 · 6.21 |
| 빨강 라벨 #9C0A0D / #F2F1EC · #E9E7E0 | 7.54 · 6.89 |
| 빨강 버튼 흰 글자 | 8.53 |
| 검정 버튼 #F2F1EC / #111111 | 16.70 |
| 어두운 섹션 #A8A59D · #E0697A / #111111 | 7.67 · 5.82 |
| 푸터 #C9C6BE / #111111 | 11.06 |
| AI 상자 #005AAB · #0B2A4A / #E4ECF5 | 5.77 · 12.20 |

세미나 섹션은 사진이 녹아드는 끝부분이 제목 아래로 약하게 겹친다(1440px).

### 6. 미리보기

- `renewal-a` 푸시 완료. Vercel 미리보기 배포 2개 모두 성공:
  - https://thestepper-lg505b6om-tkdboykms0007-5463s-projects.vercel.app (프로젝트 thestepper)
  - https://thestepper-7mwx-8oqnf920p-tkdboykms0007-5463s-projects.vercel.app (프로젝트 thestepper-7mwx)
- 두 주소 모두 비로그인 요청은 302(Vercel 로그인으로 이동) — 미리보기 보호가 켜져 있어 Vercel 계정으로 로그인해야 열린다.
- main 병합 안 함.

---

## 보완 1차 (2026-10-19)

커밋: `64e47b0` index 방문자 집계·세미나 규칙·제목 2줄 / `10a56e0` h1 크기 / `5caa56f` 하단 보조 링크 / `8a0fbf9` .gitignore / `8292eed` 도장 명단·스크린샷 / (이 보고서 커밋)

### 1. 방문자 집계 복구

- 출처: 리뉴얼 전 index.html(`591d14c~1`) `:1011-1066` `updateVisitor()`.
- 옮긴 로직(`js/stepper-index.js`): 문서 **`stats/visitors`** 를 `getDoc` → 없으면 `setDoc({count: 1})`, 있으면 `updateDoc({count: increment(1)})`. **증가 조건: index.html 을 열 때마다 1회. 중복 방지 장치 없음** — 둘 다 기존과 동일.
- 뺀 것: 기존 코드의 "증가 후 다시 읽어 숫자 애니메이션 표시"(화면 표시용 재조회 1회)와 `#visitorCount` 요소 검사. 기존 코드는 `#visitorCount` 가 없으면 집계도 하지 않았는데(`if(!el) return;`), 새 코드는 표시 요소 없이 항상 집계한다.
- SDK: 기존과 같은 `firebasejs/10.12.2/firebase-firestore.js`. (1차에서 쓰던 firestore-lite 는 요청 방식이 달라 이번에 기존과 같은 SDK 로 통일)
- **이 값을 읽는 곳**: 레포 전체 검색 결과 **없음**. `stats/visitors` 를 쓰는 코드는 리뉴얼 전 index.html(표시 겸 증가)과 `새 폴더/index.html`(초안)뿐이고, admin.html 은 `:1305` 주석 안의 옛 규칙 예시(`/visitors/`)에만 등장한다. thestepper-api 에도 없다. 즉 리뉴얼 후에는 이 숫자를 화면에서 보는 곳이 없다(Firestore 콘솔에서만 확인 가능).
- 규칙: `stats/{doc=**}` 는 `allow read, write: if true` (배포본) — 변경 불필요.

**검증 (실제 실행)** — Playwright 로 Firestore 요청을 가로채, 쓰기 내용이 담긴 Write 채널 요청은 전부 abort(서버 미도달), 읽기·핸드셰이크만 통과시켰다.

| | 리뉴얼 전 index.html | 리뉴얼 후 index.html |
|---|---|---|
| `stats/visitors` 읽기 (Listen 채널 addTarget) | 있음 | 있음 |
| 차단한 쓰기 요청 수 (SDK 재시도 포함) | 2 | 2 |
| 쓰기 요청 대상 | `POST https://firestore.googleapis.com/google.firestore.v1.Firestore/Write/channel` | 같음 |

쓰기 요청 본문(디코딩) — 전후 동일:

```
{"writes":[{"update":{"name":"projects/thestepper-c9bfb/databases/(default)/documents/stats/visitors"},
 "updateMask":{"fieldPaths":[]},
 "updateTransforms":[{"fieldPath":"count","increment":{"integerValue":"1"}}],
 "currentDocument":{"exists":true}}]}
```

- 실서버 오염 확인: 테스트 전 `stats/visitors` = **2311** (updateTime 2026-10-18T18:07:04Z) → 모든 테스트 후에도 **2311**, updateTime 동일.
- 참고: 지금 운영 중인 main 의 index.html 은 리뉴얼 전 버전이라 집계가 계속되고 있다(마지막 증가 2026-10-18).

### 2. 첫 화면 제목 2줄 고정

- 글자 크기 `clamp(40px, 6.4vw, 92px)` (`.sa-h1`, 공통 CSS).
- 선택: **제목만 620px 열 제한에서 벗어나게**(`@media (min-width:1024px){ white-space:nowrap; width:max-content }`), 열 폭은 그대로.
- 이유: 열 전체를 넓히면 본문 문단도 사진 쪽으로 같이 밀린다. 측정해 보니 92px 에서도 "사라지기 전에," 줄이 571px 로 620px 안에 들어가, 제목 오른쪽 끝의 사진 불투명도(0.39)가 본문 오른쪽 끝(0.48)보다 낮다 — 열을 넓히지 않는 쪽이 겹침이 적다. nowrap 은 글꼴 로딩 차이 등으로 폭이 늘어도 3줄로 넘어가지 않게 하는 보장 장치다.

| 폭 | 줄 수 (getClientRects) | 높이÷줄간격 | 글자 크기 | h1 가로 범위 | 사진 시작 | h1 끝 사진 불투명도 | 본문 끝 불투명도 |
|---|---|---|---|---|---|---|---|
| 1024 | **2** | 2 | 65.5px | 24→431 | 369 | 0.17 | 0.76 |
| 1280 | **2** | 2 | 81.9px | 64→573 | 461 | 0.25 | 0.50 |
| 1440 | **2** | 2 | 92.0px | 144→715 | 518 | 0.39 | 0.48 |
| 1920 | **2** | 2 | 92.0px | 384→955 | 691 | 0.39 | 0.46 |
| 390 | **2** | 2 | 40.0px | 24→366 | 0 (사진은 위쪽 320px) | — | — |

스크린샷: `docs/renewal/hero-1024.png`, `hero-1280.png`, `hero-1440.png`, `hero-1920.png`, 전체 `index-1440/768/390.png` 재저장.

### 3. 하단 정보 보조 링크 줄

외부 채널 줄 아래에 구분선을 두고 보조 링크 줄을 추가했다. 메뉴 7개는 그대로(검증: `["영상","브랜드","커리큘럼","AI 코치","세미나","회원 도장","문의"]`).

| 링크 | 이름 | 출처 |
|---|---|---|
| staff.html | 스텝 소개 | `<title>스텝 소개 - THE STEPPER` (기존 index 메뉴도 같은 이름) |
| center.html | 성인부 & 입시센터 | `<title>THE STEPPER - 성인부 & 입시센터` (기존 index 빠른 링크는 "성인&입시") |
| gallery.html | 활동 갤러리 | `<title>활동 갤러리 - THE STEPPER` (기존 index 메뉴도 같은 이름) |
| quiz.html | OX 겨루기 퀴즈 | `<title>OX 겨루기 퀴즈 — THE STEPPER` (기존 index 메뉴 "🎮 OX 겨루기 퀴즈"에서 이모지만 없음) |
| virtual.html | VR 버추얼 태권도 | `<title>VR 버추얼 태권도 - THE STEPPER` (기존 index 메뉴도 같은 이름) |

- 대한버추얼스포츠협회: virtual.html 에는 koreavsa.com 링크가 **없다** → 외부 채널 줄에 "대한버추얼스포츠협회 → https://koreavsa.com/" 추가(이름은 기존 플로팅 버튼 `title="대한버추얼스포츠협회"`, 주소 그대로).
- 검증: 1440px 렌더링에서 외부 채널 5개·보조 링크 5개 href 확인, `docs/renewal/footer-1440.png`.

### 4. 앱 비밀번호 파일 점검 (파일은 열지 않음)

- `git log --all -- "입시 센터/앱 비밀번호.png"`: **결과 없음 — 어떤 커밋에도 포함된 적 없음**(원격 푸시도 없음).
- `git log --all --name-only` 전체에서 파일명에 비밀번호·password·secret·credential·.env·adminsdk 가 들어간 파일: `extensions/firestore-send-email.env` 1개(커밋 `7f48b3d`, origin/main 에 푸시됨). 값은 출력하지 않고 종류만 확인: `SMTP_PASSWORD` 는 **Secret Manager 참조**(`projects/…/secrets/…`), `SMTP_CONNECTION_URI` 에는 `사용자:비밀번호@` 형태가 없음 → **저장소에 비밀번호 원문 없음**. 이력 수정은 하지 않았다.
- `입시 센터/` 폴더의 과거 커밋 파일 목록에도 비밀번호 관련 파일 없음.
- `.gitignore` 에 `입시 센터/앱 비밀번호.png` 추가, `git check-ignore` 로 적용 확인.

### 5. 회원 도장 명단

`docs/renewal/dojang-list.md` — Firestore `locations` 28개, region 가나다순 → order 순, 등록일(createdAt, KST). 28개 모두 등록일이 2026-07-06(마이그레이션 일괄 등록으로 보임). region 별: 경기도 1 / 경남 기타 4 / 경남 김해 8 / 경남 창원 8 / 대구 2 / 부산 2 / 울산 2 / 충북 청주 1. 코드 수정 없음.

### 6. 후기 6개 유지

변경 없음(3열 × 2줄).

### 7. 세미나 일정 표시 규칙

- 오늘 날짜: `Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul' })` 로 한국 시간 `YYYY-MM-DD`.
- `date >= 오늘` 이 1건 이상 → 가까운 순 최대 3개. 0건 → Mono 빨강 라벨 "지난 세미나" + 옆에 보조 문장 "예정된 세미나는 곧 공지됩니다" + 가장 최근 지난 일정 3개(최신순).

**검증** — 실데이터는 건드리지 않고 Playwright `page.clock.setFixedTime()` 으로 브라우저 시계만 바꿈.

| 경우 | KST 오늘 | 라벨 | 표시된 목록 |
|---|---|---|---|
| 현재 (실제 날짜) | 2026-10-19 | 지난 세미나 + 보조 문장 | 2026.08.08 하계 훈련 캠프 / 07.21 대구 정기 세미나 / 07.04 유소년 합동훈련 |
| 미래로 (2027-06-01) | 2027-06-01 | 지난 세미나 + 보조 문장 | 위와 같음 |
| 과거로 (2026-05-01) | 2026-05-01 | 없음(다가오는 일정) | 05.16 주니어 합동훈련 / **05.16 주니어 합동훈련** / 05.19 대구광역시 정기 세미나 |
| 경계: UTC 08-08 15:30 | 2026-08-09 | 지난 세미나 | 08.08 / 07.21 / 07.04 — UTC 기준이었다면 08-08 이 "다가오는 일정"이 됐을 시각 |
| 경계: UTC 08-07 15:30 | 2026-08-08 | 없음(다가오는 일정) | 08.08 하계 훈련 캠프 1건 |

- 과거 날짜 경우에 같은 일정이 두 번 보이는 것은 Firestore `schedules` 에 **같은 날짜·제목 문서가 중복 등록**돼 있기 때문이다(9쌍은 날짜·제목 동일, 2쌍은 같은 날짜에 제목만 조금 다름 — "범태권도장"/"범 태권도장", "MOU 체결"/"(태권도 사범회) MOU 체결"). 표시 코드에서 중복을 걸러내지는 않았다 — 데이터 정리 또는 화면 중복 제거 중 어느 쪽으로 할지 결정 필요.
- 1440px 에서 일정 목록 일부가 세미나 사진이 녹아드는 끝부분 위에 놓인다(`docs/renewal/seminar-1440-past.png`).

### 공통 검증

| 항목 | 결과 |
|---|---|
| 가로 스크롤 1440 / 768 / 390 | 없음 / 없음 / 없음 (scrollWidth = clientWidth) |
| 콘솔 에러 | **페이지 자체 0건.** 측정 중 `Failed to load resource: net::ERR_FAILED` 12건이 찍혔는데, 위치를 확인한 결과 전부 테스트가 일부러 abort 한 방문자 집계 Write 채널 요청(`…/Firestore/Write/channel?VER=8…`)이었다. 차단 없이 돌리면 실데이터가 증가하므로 차단 상태로만 측정했다 |
| 다른 HTML 페이지 15개 전후 비교 (1440×900) | admin, ai, board, center, contact, gallery, locations, motion-legacy, motion, quiz, schedule, staff, thestepper_homepage (1), voice: **0픽셀**. virtual.html: 347픽셀 → 같은 파일을 두 번 찍어도 222픽셀이 달라지는 무한 CSS 애니메이션(gridPulse·glowPulse·float·blink) 때문. 애니메이션을 멈추고 다시 비교하면 **0픽셀**. 파일도 `git diff origin/main` 변경 없음 |

---

## 보완 2차 (2026-10-19) — 조사·보고

Firestore 실데이터 수정·삭제 없음. admin.html·index.html 수정 없음. 조회는 모두 비로그인 공개 읽기(REST)로 했다.

### 1. 세미나 중복 11쌍

상세 표(쌍별 문서 ID·모든 필드·생성/수정 시각·찾는 단서): **`docs/renewal/seminar-duplicates.md`**

**분류 결과**
- 지시 기준으로는 **11쌍 모두 C**다. 모든 쌍에서 `detail` 문자열이 다르고, 한쪽에만 `createdAt` 필드가 있다. A(모든 필드 같음)·B(생성 시각만 다름)는 0쌍.
- 하지만 C 안에서도 "별개 세미나"는 하나도 없다. 날짜·장소·행사가 같은 **같은 행사가 표기만 다르게 두 번 등록**된 것이다. 그래서 C를 둘로 나눠 적었다.
  - **C-형식 9쌍**: 사실은 같고 표기만 다름("10시~12시" vs "10:00~12:00", 구분자 "|" vs "·📍", 주소의 시·도 유무, 제목 띄어쓰기). → 지울 문서를 제안했다. 지시는 A·B에만 제안하라고 했지만, 실질적으로 중복이라 참고용으로 넣었다.
  - **C-충돌 2쌍**: 시간이 서로 다르다. 어느 쪽이 맞는지 코드·데이터로는 판단할 수 없다.
    - 2026-05-19: "오후 10시 30분~12시 30분" vs "오전 10:30~12:30"
    - 2026-03-18: "오후 10시~12시" vs "오전 10:00~12:00"
    - → 대표님 확인 필요.
- 생성 간격: 11쌍 모두 약 **3,916,765초(약 45일)**. 한쪽은 2026-05-19 17:00:40 KST, 다른 쪽은 2026-07-04 01:00:04~05 KST에 생성됐다.

**남길 문서 제안 (C-형식 9쌍)** — 기준: 내용(주소)이 더 완전한 쪽, 같으면 먼저 생성된 쪽.
- 2차 등록본(주소에 시·도 포함)을 남기는 쌍 — 6쌍: 04-29, 02-28, 02-09, 01-30, 01-29, 01-28
- 내용이 같아 먼저 생성된 1차를 남기는 쌍 — 3쌍: 05-31, 05-16, 04-06
- 참고: 1차 등록본의 `detail`에는 📍 이모지가 들어 있다. 리뉴얼 index 세미나 목록은 `detail`을 그대로 보여 준다. 그래서 1차본이 "최근 지난 3건"에 들면 📍가 화면에 나온다(현재 표시되는 08.08·07.21·07.04는 해당 없음).
- 관리자 페이지 세미나 탭에서는 같은 날짜·제목이 두 줄로 보인다. 설명이 **"·📍"로 이어지면 1차본**, **"|"로 이어지면 2차본**이다. 문서별 설명 첫머리는 seminar-duplicates.md에 적었다.

**현재 운영 사이트 영향**: www.thestepper.co.kr/schedule.html의 "지난 일정" 탭을 실제로 열어 확인했다. 예를 들어 "대구광역시 정기 세미나", "주니어 친선 경기"가 각각 2번씩 표시된다.

**원인 조사**

(1) 저장 버튼 두 번 누르기 — **원인 아님**
- admin.html `submitSchedule()`(:1102-1127)은 입력 검사 직후, 첫 `await` 전에 `btn.disabled = true`(:1109)를 건다. `finally`(:1126)에서 해제한다.
- 비활성 버튼은 클릭 이벤트가 나지 않으므로 빠른 두 번 클릭은 한 번만 저장된다.
- 입력칸이 `<form>` 안에 있지 않아 Enter 키로 저장되는 경로도 없다.

(2) 수정이 새 문서를 만드는 경우 — **이번 중복의 원인 아님**
- 수정 모드에서는 `updateDoc(doc(db,'schedules', editingSchedId), …)`(:1112)로 기존 문서를 고친다.
- 다만 `editingSchedId`는 메모리 변수다. 수정 버튼을 누른 뒤 페이지를 새로고침하거나 다른 탭에서 다시 열고 같은 내용을 "일정 추가"로 저장하면 새 문서가 생긴다. 이것은 사용자 조작에 따른 가능성이다.
- 결정적으로, 관리자 폼으로 추가하면 항상 `createdAt` 필드가 생긴다(:1117). 그런데 07-04 등록분 11건에는 `createdAt`이 없다. 따라서 이 11건은 관리자 폼으로 만든 문서가 아니다.

(3) 데이터 일괄 등록 스크립트 — **확인된 원인 (2회 실행)**

| 회차 | 생성 시각 (서버, KST) | 등록 도구 | 근거 |
|---|---|---|---|
| 1차 | 2026-05-19 17:00:40 (11건이 0.4초 안에) | `seed_schedules.html` — 브라우저에서 열면 바로 `addDoc`으로 11건을 넣는 페이지 | 레포 이력: 24b7f48(16:47 추가) → 6fbd739(16:48 삭제) → 2ef0501(17:01 재추가) → 4d7e3b5(17:02 삭제). 11개 항목의 `detail` 문구("·📍" 형식)와 `createdAt` 필드가 1차 문서와 일치. 페이지 안내 문구 "완료! … 이 페이지를 GitHub에서 삭제하세요!" |
| 2차 | 2026-07-04 01:00:04~05 (11건이 0.5초 안에) | 이전 Claude Code 세션의 `seed_schedules.js` (Admin SDK, `col.add(s)`) | 그 세션 scratchpad에 파일이 남아 있음(수정 시각 2026-07-04 00:56 KST). 11개 항목 문구("|" 형식)가 2차 문서와 글자까지 일치. Admin SDK라 `createdAt` 없음. `.claude/settings.local.json`에 `node seed_schedules.js`, `node add_schedules.js`, `node fix_type.js` 실행 허용 기록 |

- 두 스크립트 모두 "이미 있는지 확인" 없이 `add`만 한다. 그래서 같은 목록을 두 번 넣었다. 레포 이력상 2차 직후 커밋이 "schedule.html 디버그 패널 추가: Firebase 연결 상태 및 에러 화면 표시"(e57d7ad, 01:14 KST), "type 필드 대신 date 기준 자동 분류로 변경"(aefc6fb, 01:31 KST)이다. 그래서 일정 페이지가 비어 보이는 표시 문제 때문에 데이터가 없는 줄 알고 다시 넣은 것으로 **추정**된다(추정이며 확인된 사실은 아님).
- 1차 문서 3건(05-31, 05-19, 05-16)의 마지막 수정 시각이 2026-07-04 01:30:46 KST다. 이 3건은 1차 등록 당시 미래 일정이라 "예정"이었을 것이다. `fix_type.js`가 `type`을 "past"로 고친 시점과 맞물리는 것으로 보인다(`fix_type.js` 파일은 남아 있지 않아 내용 확인 불가).
- 그 밖에 2026-07-04 09:51 KST에 생성된 2건(06-23, 07-04 일정)과 12:49 KST의 1건(08-08)도 `createdAt`이 없다. 관리자 폼이 아닌 스크립트(`add_schedules.js`로 추정)로 들어간 것으로 보이지만, 날짜가 겹치지 않아 중복은 아니다.

**수정 방안 (이번에는 적용 안 함)**
- 데이터: 위 제안대로 관리자 페이지에서 9건을 삭제하고, C-충돌 2쌍은 실제 시간을 확인해 1건씩 남긴다.
- 일괄 등록 스크립트를 다시 쓸 경우: ① 같은 `date`+`title` 문서가 있으면 건너뛰거나 ② 문서 ID를 `date`+제목 기반으로 정해 `set`으로 넣는다(여러 번 실행해도 결과가 같게). 관리자 폼과 같은 `createdAt` 필드도 넣는다.
- admin.html `submitSchedule()`: 추가 전에 같은 날짜·제목 일정이 이미 있으면 확인 창을 띄운다(이미 불러 둔 `schedData`로 검사 가능, 추가 읽기 없음).
- 화면 쪽 중복 제거(index·schedule.html)는 데이터를 정리하면 필요 없다.

### 2. 커밋 안 된 기존 변경 3개 (되돌리거나 커밋하지 않음)

**(1) `.firebaserc`**

```diff
 {
   "projects": {
     "default": "thestepper-c9bfb"
+  },
+  "targets": {},
+  "etags": {
+    "thestepper-c9bfb": {
+      "extensionInstances": {
+        "firestore-send-email": "b128996f…648892"
+      }
+    }
   }
-}
+}
```

- 판단: **기본 배포 대상은 그대로 `thestepper-c9bfb`** — `projects.default`는 바뀌지 않았다.
- 추가된 것은 Firebase CLI가 확장 프로그램(Trigger Email, 커밋 `7f48b3d`에서 설치)을 배포할 때 자동으로 기록하는 `etags`(콘솔 쪽 변경 감지용)와 빈 `targets`다. 파일 끝 줄바꿈이 없어진 것 외에 다른 변화는 없다.
- 2026-10-16 규칙 배포 때도 이 상태 그대로 `--project thestepper-c9bfb`로 배포했다.

**(2) AI 코치 폴더 서브모듈 포인터** (`더 스텝퍼 AI 코치 프로그램`, 별도 레포 thestepper-api)
- thestepper 레포에 기록된 커밋: `bb2778712cb4c19eacf899c464f5feb98f7e5535`
- 로컬 폴더의 현재 커밋: `5db6461affbc781d447ae8ffea18bd8552e41ecf` (= Vercel API 운영 배포본, 보안 점검 때 확인)
- 그 사이 서브모듈 커밋 (오래된 순):
  - `54ea099` [임시/실험] 체크리스트 재설계안(V2) 검증용 testChecklistV2 모드 추가
  - `6508857` Revert "[임시/실험] 체크리스트 재설계안(V2) 검증용 testChecklistV2 모드 추가"
  - `cb6ec3c` [임시/실험] V3 체크리스트 재설계안(premise-rejection 처리 추가) 검증용 모드
  - `5db6461` Revert "[임시/실험] V3 체크리스트 재설계안(premise-rejection 처리 추가) 검증용 모드"
- 실험 2건을 각각 되돌린 커밋들이라 최종 코드 차이는 실험 추가·제거의 상쇄분이다.
- 참고: thestepper 레포에 `.gitmodules`가 없다. 그래서 이 항목은 주소 없는 gitlink로만 기록돼 있다. 사이트(thestepper 레포 배포)는 이 폴더를 쓰지 않는다.

**(3) 삭제된 이미지**: `입시 센터/새로형 이미지1/center_04_m_2.jpg` (299,297바이트, 커밋 `7b3dab0` 2026-07-01 "로컬 작업 파일 동기화"로 추가)
- 레포 전체 검색에서 `center_04_m_2`를 참조하는 HTML/CSS/JS는 **없음**.
- center.html:171은 Firebase Storage의 `center/center_04_m.jpg`를 쓰고, 그 URL은 200으로 정상 응답한다.
- 같은 로컬 폴더에는 이름이 다른 `center_04_m.jpg`(미추적)가 새로 있다. 이름을 바꾼 것으로 보인다.
- 판단: 이 삭제를 나중에 커밋해도 **실서버에 깨지는 이미지는 생기지 않는다.** 지금 그 경로(`/입시 센터/새로형 이미지1/center_04_m_2.jpg`)는 main에 파일이 있어 200으로 열리지만, 어떤 페이지도 링크하지 않는다.

---

## 보완 3차 (2026-10-19) — 세미나 중복 정리 + 재발 방지

운영 Firestore 를 바꾼 작업은 **schedules 9건 삭제** 하나뿐이다. 순서: 백업 → 백업 검증 → 드라이런 → 삭제 → 검증.

### 1. 전체 백업

- 경로: `C:\Users\Vivobook Pro 16X\thestepper-backups\schedules-20261019-1503.json` (레포 밖, 커밋 안 함)
- 내용: 문서 ID, 모든 필드, createTime/updateTime (Admin SDK)
- 문서 수: 백업 26건 = Firestore `get()` 26건 = 서버 집계 `count()` 26건, 고유 ID 26개 → 일치

### 2. 9건 삭제 (시간 충돌 2쌍 2026-05-19·2026-03-18 은 보류)

삭제 스크립트는 지울 ID 9개와 남길 짝 ID 를 상단 상수로 고정하고 **ID 로만** 지웠다(날짜·제목 검색 없음). 상수는 seminar-duplicates.md 의 제안과 대조해 일치를 확인했다. 기본 실행은 드라이런이며, 한 항목이라도 어긋나면 종료 코드 2 로 멈추게 했다.

**드라이런** — 시작 시 문서 수 26건(예상과 일치), 9건 모두 "통과"

| # | 지울 ID | 날짜 | 제목 | detail 앞부분 | 남길 짝 ID | 짝 제목 | 확인 |
|---|---|---|---|---|---|---|---|
| 1 | iSP1yWj1AyaC7IWkuBdc | 2026-05-31 | THE STEPPER × 고수회 MOU 체결 | 경기도 수원 &#124; 더스텝퍼와 고수회(태권도 사범회)… | 96QowfxdFvPtXfXKrVqf | THE STEPPER × 고수회(태권도 사범회) MOU 체결 | 통과 |
| 2 | q8M1Kn65iefnhF0i7CzL | 2026-05-16 | THE STEPPER 주니어 합동훈련 | 오전 10시~12시 전술 훈련 / 오후 2시~4시… | xjtrU5mC0A6LJG44gfDG | THE STEPPER 주니어 합동훈련 | 통과 |
| 3 | BEohEaYTR6daUfK0otpf | 2026-04-29 | THE STEPPER 충북 청주 정기 세미나 | 오전 10:00~12:00 · 📍 경희대 명품꿈나… | G4Vs1p2rya7cT22Td49p | THE STEPPER 충북 청주 정기 세미나 | 통과 |
| 4 | ZLE9G7tMwGK2nMWxJuIu | 2026-04-06 | THE STEPPER 부산·경남 지역 정기 세미나 | 오후 11시~1시 &#124; 태백 태권도 &#124; 경남 김해시… | GhBX7qOHE2MA1hbSLebf | THE STEPPER 부산·경남 지역 정기 세미나 | 통과 |
| 5 | VA6mkMldbOLeDJMVeOao | 2026-02-28 | THE STEPPER 범태권도장 성인반 특강 | 오후 8:30~9:30 · 📍 대구 범태권도장 ·… | 5oq7cTwWj6Qh3AcI0t5y | THE STEPPER 범 태권도장 성인반 특강 | 통과 |
| 6 | GHR4F0RONGOCHUtHSw34 | 2026-02-09 | THE STEPPER 부산·경남 지역 정기 세미나 | 밤 11:00~1:00 · 📍 품 태권도장(진영점… | W2zT6UANYZU5Q894Ti3W | THE STEPPER 부산·경남 지역 정기 세미나 | 통과 |
| 7 | X0gDCtz0AraA1YVQpDv8 | 2026-01-30 | THE STEPPER 대구 지역 정기 세미나 | 오전 10:00~12:00 · 📍 대구 범태권도장… | LR8hsvmT00LLtkxy8kti | THE STEPPER 대구 지역 정기 세미나 | 통과 |
| 8 | etovbpGz3DSkuwwEiCLK | 2026-01-29 | THE STEPPER 주니어 친선 경기 | 오후 1:30~4:00 · 📍 박종우 태권도장(화… | hnrN0PBF9rhcCW75GF7C | THE STEPPER 주니어 친선 경기 | 통과 |
| 9 | kk5xu8VEomB4xO48h5Fm | 2026-01-28 | THE STEPPER 충북 청주 정기 세미나 | 오전 10:00~12:00 · 📍 경희대 명품꿈나… | qYvkO0F4nh4Mf5gaI9wX | THE STEPPER 충북 청주 정기 세미나 | 통과 |

(짝 날짜는 9건 모두 지울 문서와 같은 날짜로 확인)

**삭제**: `--apply` 로 batch 1회, 9건 삭제 완료.

**삭제 후 검증 (Admin SDK)**
- (1) 전체 문서 수 **17** = 백업 26 − 9 → 일치 (`get()`·`count()` 모두 17)
- (2) 같은 날짜·제목(공백 무시)으로 겹치는 쌍: **정확히 2쌍** — 2026-03-18(`6g2rwUoN3hK7e4Wp2XJe`/`RnQ5fq7EePB71yAYCksa`), 2026-05-19(`TbzYMG48vR75Mz7tjLNN`/`idkhPlGcl9I2ULPjmJFo`). 날짜만 기준으로 봐도 같은 2쌍뿐.
- (3) 남긴 짝 9건: 9/9 존재, 필드와 updateTime 이 백업과 **완전히 같음**(9/9). 지운 9건은 0건 남음. 지우지 않은 17건 모두 updateTime 이 백업과 같음(다른 문서는 건드리지 않음).

**화면 확인 (Playwright)**
- 운영 www.thestepper.co.kr/schedule.html "지난 일정" 탭: 두 번 나오는 일정은 5월 19일·3월 18일(보류 2쌍)뿐. 다른 날짜는 모두 1번씩. 스크린샷 `docs/renewal/schedule-past-after-dedupe.png`.
- 리뉴얼 index "지난 세미나" 3건: 2026.08.08 하계 훈련 캠프 / 07.21 대구 정기 세미나 / 07.04 유소년 합동훈련 — 중복 없음. 스크린샷 `docs/renewal/seminar-1440-after-dedupe.png`.
  - 미리보기 주소는 Vercel 로그인 화면으로 넘어가 자동화로 열 수 없었다. 그래서 같은 renewal-a 코드를 로컬에서 운영 Firestore 데이터로 띄워 확인했다(방문자 집계 쓰기는 차단).

### 3. 일괄 등록 스크립트 격리

- 디스크 전체 검색(Temp, OneDrive, Desktop, Downloads, Documents, ~/.claude): `seed_schedules.js` **1개만 존재** — 이전 Claude Code 세션 `0fdd5c80` scratchpad.
- `add_schedules.js`·`fix_type.js` 는 **어디에도 없음**(이미 지워진 상태).
- 이동: `C:\Users\Vivobook Pro 16X\thestepper-backups\retired-scripts\seed_schedules.js`
  - 맨 위에 "⛔ 실행 금지 — 2026-07-04 세미나 중복 등록의 원인. 중복 확인 없이 추가만 함" 주석과 원래 위치를 추가했다.
  - 본문은 원본과 바이트 비교로 같음을 확인한 뒤 원래 위치에서 제거했다.
- 레포 이력의 seed_schedules.html 은 그대로 둠.

### 4. 관리자 폼 중복 경고 — 브랜치 `fix-schedule-dup` (main 기준), 커밋 `ffa39bf`

- admin.html `submitSchedule()` 의 **새로 추가** 경로에만 적용했다. 저장 직전에 같은 날짜 문서를 `where('date','==',date)` 로 다시 읽어, 제목이 공백·띄어쓰기를 무시하고 같으면 확인 창을 띄운다: "같은 날짜·제목의 일정이 이미 있습니다: [제목, 시간]. 그래도 추가하시겠습니까?"
  - 취소하면 저장하지 않고 "추가를 취소했습니다." 토스트를 띄운다.
  - 조회가 실패하면 화면에 불러 둔 목록(`schedData`)으로 검사한다.
  - "시간" 자리에는 `detail` 을 그대로 넣었다(시간·장소가 detail 에 함께 있다).
- 수정(`updateDoc`) 경로와 버튼 비활성화(처리 중 잠금)는 그대로다.
- **검증**: Playwright 가 Firebase SDK 4개(app·auth·firestore·storage)를 가짜 모듈로 바꿔 admin.html 을 로컬에서 실행했다. 가짜 데이터 2건을 넣고, Google 쪽 요청은 모두 차단했다(운영 Firestore 접근 0).

| 경우 | 입력 | 확인 창 | 저장 |
|---|---|---|---|
| (a)(b) 중복 + 취소 | 2026-11-20, "  THE STEPPER 대구  정기세미나 " (띄어쓰기만 다름) | 표시: "…[THE STEPPER 대구 정기 세미나, 오전 10:00~12:00 · 대구 범태권도장]. 그래도 추가하시겠습니까?" | 0건 |
| (c) 중복 + 확인 | 2026-11-20, "THE STEPPER 대구 정기 세미나" | 표시 | 1건 |
| (d) 날짜만 같고 제목 다름 | 2026-12-05, "THE STEPPER 울산 세미나" | 없음 | 1건 |
| (e) 수정 경로 | 기존 문서를 같은 날짜·제목으로 편집 | 없음 | update 1건 |

  - 모든 경우 처리 후 저장 버튼 다시 활성화. 페이지 오류 0건.
- 미리보기: https://thestepper-knkwamlkg-tkdboykms0007-5463s-projects.vercel.app · https://thestepper-7mwx-by7fb2f99-tkdboykms0007-5463s-projects.vercel.app (Vercel 로그인 필요). main 병합 안 함.

### 5. 리뉴얼 메인 세미나 목록 detail 표시 — renewal-a, 커밋 `aedc560`

- index 세미나 목록은 `detail` 을 **화면에 표시한다**(제목 아래 회색 글씨). 그래서 표시 단계에서만 정리한다(`cleanDetail()`):
  - 이모지 제거
  - "|" 와 앞뒤 공백이 있는 "·" 를 " · " 로 통일
  - "부산·경남"처럼 붙여 쓴 가운뎃점과 "/" 는 유지
  - Firestore 데이터는 수정하지 않았다.
- 검증:
  - 백업 26건 전부에 적용 → 이모지 0건, "|" 0건 남음.
  - 페이지에서 실제 날짜(지난 3건)와 2026-05-20 KST 주입 날짜(📍가 든 05-31 문서가 표시되는 경우)로 확인 → 화면 detail 에 이모지·"|" 없음. 가로 스크롤 없음(1440·390). 콘솔 에러 0 — 페이지당 `ERR_FAILED` 2건은 테스트가 막은 방문자 집계 쓰기.
  - 스크린샷 `docs/renewal/seminar-1440-detail-clean.png`.

### 6. 커밋 안 된 기존 변경 정리 — 브랜치 `chore-cleanup` (main 기준), 커밋 `d0505a9`

- "chore: Firebase CLI 기록 반영 및 미사용 이미지 삭제" — `git diff --cached` 로 `.firebaserc`(M)·`입시 센터/새로형 이미지1/center_04_m_2.jpg`(D) 2개만 포함됨을 확인했다. AI 코치 폴더 서브모듈 포인터는 넣지 않았다(작업 트리에 그대로 남음).
- 푸시만 함. 미리보기: https://thestepper-kok1y5ss7-tkdboykms0007-5463s-projects.vercel.app · https://thestepper-7mwx-xxf8eylue-tkdboykms0007-5463s-projects.vercel.app
- 참고: 이 두 변경은 이제 chore-cleanup 커밋에만 있다. main 기준 브랜치로 체크아웃하면 작업 트리의 `.firebaserc` 는 main 내용으로, 삭제했던 이미지는 다시 파일로 보인다(되돌린 것이 아니라 브랜치 차이).
