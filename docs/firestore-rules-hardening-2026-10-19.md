# 2026-10-19 Firestore 규칙 강화 기록

운영 Firestore 보안 규칙을 6단계로 나눠 강화했다. 각 단계는 에뮬레이터 테스트 → 배포 전 운영 규칙 확인(직전 단계와 같은지) → `firebase deploy --only firestore:rules` → 배포 후 운영 규칙이 레포 `firestore.rules` 와 같은지 확인 → 운영 화면 확인(읽기 전용) 순서로 진행했다. 운영 데이터는 수정하지 않았다.

- 작업 전 백업: `~/thestepper-backups/firestore-rules-20261019-2003.rules` (= ruleset `4487afb1`, `firebase-rules/deployed/2026-10-16-after/` 와 본문 동일)
- 최종 배포본 스냅샷: `firebase-rules/deployed/2026-10-19-after/firestore.rules` (ruleset `c9cbaad0`)
- 규칙 테스트: `tests/rules/` — `npm test` 199개 전부 통과 (작업 전 112개)

## 단계별 변경

| 단계 | 대상 | 변경 | ruleset | 배포 시각(KST) | 커밋 |
|---|---|---|---|---|---|
| 1 | `coaching_knowledge` | 읽기·쓰기 관리자만 (브라우저 직접 읽기 코드 없음, AI 코치는 Admin SDK) | `65cb54db` | 20:06:59 | `073db21` |
| 2 | `stats/visitors`, `stats/*`, `visitors` | 방문자 집계: 누구나 읽기, 생성은 `{count:1}` 만, 수정은 `count` 정확히 +1 만, 삭제 금지. 다른 stats 문서·옛 visitors 컬렉션은 관리자만 | `34d1eff2` | 20:14:21 | `6261218` |
| 3 | `ai_interview` | 회원 생성은 motion-legacy SOS 요청 형식만(14개 필드 정확히, 본인 uid, `status '대기중'`, `trackType 'sos'`, `adminAnswer ''`, 서버 시각). 하위 컬렉션은 관리자만 | `c839d2d0` | 20:19:19 | `92e00e3` |
| 4 | 전문가 질문 | 아래 「4단계」 참고. 규칙: `ai_coaching` 회원 생성 금지(본인 읽기·읽음 표시 유지), `expertUsage` 회원 쓰기 금지(본인 읽기 유지) | `a2ec5d88` | 20:52:14 | API `7ab3d9d`, ai.html `dcb2594`, 규칙 `e820564` |
| 6 | `users` | 회원이 바꾸는 필드만 검사: `emailVerified: true` 는 토큰 `email_verified == true` 일 때만(false 는 허용), 서버 전용 필드(`completedByAdmin`, `createdByAdmin`, `updatedAt`, `profileReminderSentAt`, `profileReminderCount`) 쓰기 금지, `email` 은 토큰 이메일과 같을 때만(대소문자 무시), `createdAt` 은 생성 시 서버 시각만·수정 시 변경 금지(생성 후 5분 안 가입 재시도는 허용) | `c9cbaad0` | 21:00:29 | `59cd15d` |

5단계는 조사만 했다(6단계의 근거).

## 4단계 — 전문가 질문 접수를 서버로 이전

- 예전: `ai.html submitExpertQuestion()` 이 브라우저에서 `expertUsage/{uid}` 를 읽어 하루 2회를 확인하고 `ai_coaching` 에 직접 문서를 만들었다. 회원이 브라우저에서 제한을 건너뛸 수 있었다.
- 지금: thestepper-api `manage-member.js` 에 `action: "submit-expert-question"` 추가.
  - `manage-member` 를 고른 이유: 이미 회원 ID 토큰을 검증하고 "회원 본인이 부를 수 있는 action"(`complete-profile`) 구조가 있으며, `expertUsage` 정리(회원 삭제)도 이 함수가 한다. 새 함수를 만들지 않아 Vercel 함수 수(11개)는 그대로다.
  - 처리: ID 토큰 검증 → 관리자 이메일이면 제한 없음(`expertUsage` 기록 안 함) → 아니면 Admin SDK 트랜잭션 안에서 `expertUsage/{uid}`(`{date: KST 'YYYY-MM-DD', count}`) 확인, 오늘 2회 이상이면 429, 아니면 `ai_coaching` 생성 + 횟수 증가를 같은 트랜잭션으로.
  - `ai_coaching` 문서는 예전 브라우저 생성본과 같은 9개 필드(`userId, question, videoData, status '대기중', masterFeedback '', finalAiResponse '', viewed false, createdAt, updatedAt` — 시각은 서버 시각).
  - 입력 검사: 질문 빈 값·공백만 거절, 500자 상한(화면 제한과 같음), `videoData` 는 객체 또는 null, JSON 50,000자 상한. 저장 uid 는 토큰 uid 만 쓴다(본문 uid 무시).
- `ai.html`: 제출을 이 API 호출로 바꾸고 `expertUsage`·`ai_coaching` 직접 쓰기 제거. 429 이면 예전 안내 문구 그대로. 남은 횟수는 `expertUsage` 본인 읽기로 계속 표시(관리자는 "무제한").
- 배포 순서: (a) API → 엔드포인트 11개 인증 없는 응답 배포 전과 동일 확인 → (b) ai.html → 운영 콘솔 에러 0 → (c) 규칙.
- 동작 변화: 관리자는 예전엔 하루 2회로 막혔으나 이제 제한 없음(작업 지시대로).

## 테스트 요약

- 규칙(에뮬레이터, `tests/rules`): 비로그인·회원 본인·타인·관리자, admin.html 의 모든 직접 Firestore 작업 회귀 포함 199개 통과.
- 4단계 로컬 통합(에뮬레이터 Firestore·Auth + 로컬 API, LLM 가짜): 회원 1·2회 허용/3회째 429, 오늘 이미 쓴 횟수 이어 세기, 지난 날짜 → 0부터, KST 자정 경계(23:59:59.999 는 같은 날, 00:00:00 에 초기화), 동시 3건 → 정확히 2건(동시 5건도 2건), 관리자 무제한, 토큰 없음·깨진 토큰·다른 프로젝트 위조·만료 401, 빈 질문·501자·잘못된 videoData 400(거절은 횟수 차감 없음), 필드 비교 9개 동일, ai.html 실제 화면 3회 흐름, admin.html 목록 표시·상세·🤖 AI 검토 요청(가짜 AI)까지 — 규칙 변경 전·후 모두 통과.
- 6단계 로컬 통합: 실제 가입 화면(대소문자 섞인 이메일) 가입 성공·11개 필드 저장, 인증 후 로그인 merge, "인증 완료 확인" 버튼 흐름, complete-profile(본인·관리자)·force-verify·create-profile(Admin SDK) 정상.

## 롤백 방법

- **규칙**: 되돌릴 단계의 직전 커밋 규칙으로 루트 파일을 바꿔 배포한다.
  `git show <커밋>:firestore.rules > firestore.rules` → `firebase deploy --only firestore:rules --project thestepper-c9bfb` → 배포본 재취득 후 diff.
  작업 전 상태 전체 복구는 백업 파일(`~/thestepper-backups/firestore-rules-20261019-2003.rules`) 또는 `073db21^` 의 `firestore.rules`.
  (Firebase 콘솔 규칙 기록에서도 이전 ruleset 으로 되돌릴 수 있지만, 그 경우 루트 파일을 같은 내용으로 즉시 커밋한다.)
- **4단계 주의 — 순서**: ai.html 을 예전으로 되돌리려면 **먼저 규칙을 `c839d2d0`(3단계) 상태로** 되돌린 뒤 ai.html(`git revert dcb2594`)을 배포한다. 예전 ai.html 은 브라우저에서 직접 쓰므로 4단계 규칙에서는 질문 접수가 실패한다.
- **API**: Vercel 대시보드 thestepper-api → Deployments 에서 `cd9d586` 배포를 Promote(Instant Rollback), 또는 `git revert 7ab3d9d` 후 push. 새 ai.html 은 이 action 이 필요하므로 API 만 되돌리면 전문가 질문 접수가 실패한다 — ai.html·규칙도 함께 되돌린다.

## 남은 과제

- `users`: 회원이 쓰는 나머지 필드(name, nickname, role, level 등)와 새 필드 추가는 제한하지 않았다(생성 시 필수 필드 강제는 로그인 merge 를 깨뜨려 제외). 필요하면 허용 필드 목록 방식 검토.
- `users.emailVerified` 필드는 표시용이다. 서버(AI 코치 `coach.js`)는 ID 토큰 `email_verified` 로 판단하고, admin.html 회원 목록도 Auth 상태(manage-member audit)를 쓴다 — 서버 수정 불필요.
- 전문가 질문 한도 초과 시 브라우저 콘솔에 네트워크 로그(429) 1줄이 남는다(브라우저 기본 동작, 화면 안내는 정상).
- 로컬 에뮬레이터에서 로그인 직후 프로필 읽기가 캐시로 처리돼 "프로필 보완" 창이 뜨는 경우를 봤다(기존 코드, 에뮬레이터 연결 특성으로 보임). 운영에서 같은 증상 문의가 있으면 `ai.html onLoggedIn()` 의 merge 저장 직후 읽기 순서를 확인.
- Storage 규칙(`sos_videos/` 등)은 이번 범위 밖 — 변경 없음.
- 규칙 배포본 조회용 임시 스크립트는 작업 후 삭제했다. 다음 배포 때는 README 의 방법(Admin SDK `securityRules()`)으로 다시 만든다.
