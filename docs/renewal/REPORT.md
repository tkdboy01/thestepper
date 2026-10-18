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
