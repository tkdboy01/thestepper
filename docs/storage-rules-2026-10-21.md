# 2026-10-20 ~ 21 Storage 규칙 보강 배포 기록

규칙·클라이언트 변경 내용은 커밋 `6ce519b` (storage.rules, firestore.rules, motion-legacy.html, admin.html, tests/rules) 참고.
요약: SOS 영상은 `sos_videos/{uid}/{ai_interview 문서 ID}.mp4` 생성만 허용하고, Storage 규칙이 Firestore SOS 문서(본인·`sos`·`대기중`·`videoPath` 일치)를
교차 확인한다(`firestore.get/exists`). 덮어쓰기·삭제·목록 조회 금지. 공개 이미지 폴더 관리자 업로드는 image/* 10MB 미만, list 는 gallery/ 만. isAdmin() 에 email_verified.

- 최종 배포: Firestore `7911bd9f-0e38-4926-83f2-1ada48e3a3f8`, Storage `aeb5ebb8-f4b0-4034-aef1-bf5066150d3f` (2026-10-21 08:21 UTC)
- 스냅샷: `firebase-rules/deployed/2026-10-21-after/` (본문 = 루트 `firestore.rules`, `storage.rules`)
- 배포 직전 백업: `~/thestepper-backups/firestore-rules-20261020-1700.rules`, `storage-rules-20261020-1700.rules`
  (= 2026-10-19-after Firestore / 2026-10-16-after Storage 와 같은 내용)

## 핵심 교훈 — 교차 규칙은 IAM 역할이 필요하다

1. Storage 규칙이 `firestore.get/exists` 를 쓰면 Storage 서비스 에이전트
   `service-787224576231@gcp-sa-firebasestorage.iam.gserviceaccount.com` 에 `roles/firebaserules.firestoreServiceAgent` 가 있어야 한다.
   없으면 배포는 성공하지만 운영 업로드가 전부 `storage/unauthorized`. 에뮬레이터 테스트로는 잡히지 않는다.
2. `firebase deploy` 는 **실제 터미널(TTY)에서만** 이 역할을 확인·부여한다. TTY 가 없으면 CLI 가 자동으로 non-interactive 가 되고,
   `--force` 를 붙여도 역할 단계를 경고 없이 건너뛴다 (firebase-tools `rulesDeploy.js` `checkStorageRulesIamPermissions()`).
3. 역할 부여 직후 **약 1분 반영 지연**이 있다. 배포 직후 업로드 실패 1회 → 1분 뒤 성공.

## 진행 경과

| 시각 (UTC) | 내용 | Firestore / Storage ruleset | 결과 |
|---|---|---|---|
| 10-20 06:30 | 1차 배포 (`--non-interactive`) | `df0e08a3` / `23935ff3` | 역할 부여 질문이 조용히 건너뛰어짐 → 운영 SOS 업로드 `storage/unauthorized` |
| 10-20 06:33 | 백업으로 롤백 | `8bdbd5db` / `b7475719` | 운영 SOS 정상 확인 |
| 10-20 (오후) | 콘솔에서 역할 부여 시도 | — | getIamPolicy 에 반영되지 않음 (etag `BwZbqOLYoJ4=` 그대로) |
| 10-20 08:01 | 2차 배포 (`--force`, TTY 없는 셸) | `118499d0` / `69dd7570` | 역할 단계 건너뜀, IAM 변화 없음 → 스모크 없이 즉시 롤백 |
| 10-20 08:01:58 | 백업으로 롤백 | `b3eb50ae` / `e3377365` | 운영 SOS 정상 확인 |
| 10-21 08:21 | 3차 배포 (`--force`, 앱 Terminal 패널 = TTY) | **`7911bd9f` / `aeb5ebb8`** | CLI 출력 `storage: updated service account for cross-service rules...`, 역할 부여 확인(etag `BwZeVW7QYYo=`) |

## 운영 확인 (2026-10-21)

- 소유자 계정 스모크: 첫 업로드 `storage/unauthorized`(반영 지연) → 1분 뒤 성공. 재생 주소 200.
  거부 확인 — 남의 문서 ID(내 폴더·그 회원 폴더), 같은 경로 덮어쓰기, 문서 없는 ID.
  admin.html SOS 목록 표시·재생·이전/다음 버튼 정상. 테스트 데이터 삭제.
- 비관리자 회원 경로: Admin SDK 로 임시 회원(이메일/비밀번호, email_verified=true) 생성 → 운영 motion-legacy.html **화면 조작**으로
  장 선택 → 영상 파일 선택 → 분석(31프레임, 하체 visibility 0.437 → SOS 팝업) → SOS 요청 → "전송 완료".
  - 로그인은 커스텀 토큰(비밀번호를 화면에 입력하지 않음). AI 피드백 요청(coach API)만 가짜 응답으로 바꿔 운영 AI 호출·aiUsage 기록을 막았다.
  - 문서 1건 생성, `videoPath = sos_videos/{uid}/{문서 ID}.mp4`, 파일 존재(video/mp4) — 문서·파일 ID 일치.
  - 같은 회원으로: 남의 문서 ID 경로 업로드(두 경로) 거부, 덮어쓰기 거부, `sos_videos/` 전체·본인 폴더·다른 회원 폴더 목록 조회 거부,
    다른 회원 파일 읽기(메타·다운로드 URL) 거부, 본인 파일 읽기는 허용.
  - admin.html(관리자): 그 건이 SOS 카드 첫 항목으로 보이고 영상 재생(2.0초, readyState 4), 콘솔 에러 0.
  - 정리: 테스트 SOS 문서·영상·다른 회원용 테스트 문서·파일·users 문서·Auth 계정 삭제, 남은 것 0건 확인.

## 추가 변경 — SOS 이메일 인증 요구 (2026-10-21 09:12 UTC, 커밋 `ababbfb`)

- (기존) 이메일 인증은 요구하지 않음 (미인증 이메일 가입 회원 5명 존재).
- (변경) SOS 문서 생성(firestore.rules)과 영상 업로드(storage.rules) 모두 `request.auth.token.email_verified == true` — 미인증이면 403.
  motion-legacy.html 이 이미 미인증 회원을 ai.html 로 돌려보내므로 화면 정책과 일치시킨 것. 문서·영상이 같은 조건이라 문서만 남는 일이 없다.
- motion-legacy.html: 전송 전 토큰의 인증 여부 확인(인증 전 값이면 토큰을 한 번 새로 받음), 미인증이거나 규칙 403 이면
  AI 코치 미인증 403 과 같은 문구 "이메일 인증 후 이용 가능합니다. 받은 편지함을 확인해주세요." 를 띄운다.
- 순서: 클라이언트(Vercel) 먼저 반영 확인 → 규칙 배포(Terminal 패널). ruleset Firestore `be070b5c`, Storage `093fc575`. 배포 전 백업 `~/thestepper-backups/*-20261021-1812.rules`.
- 규칙 테스트 311개 통과. 운영 확인(임시 회원 2명, 끝나고 전부 삭제·0건 확인):
  - 인증 회원: motion-legacy 화면에서 SOS 접수 성공, 문서·파일 ID 일치, 콘솔 에러 0
  - 미인증 회원: SOS 문서 생성 거부(permission-denied), 본인 SOS 문서 경로 업로드 거부(storage/unauthorized), motion-legacy 진입 시 ai.html 로 이동
  - 토큰만 미인증 값인 경우(화면 흉내): 위 안내 문구 표시, 문서 생성 없음

## 롤백 방법

`firebase-rules/deployed/2026-10-19-after/firestore.rules` 와 `2026-10-16-after/storage.rules` 본문(헤더 아래)
또는 백업 파일로 루트 파일을 바꿔 `firebase deploy --only firestore:rules,storage --project thestepper-c9bfb` → 배포본 diff.
단 클라이언트(`6ce519b` 의 motion-legacy.html)는 문서를 먼저 만들고 `videoUrl: ''` 로 저장하므로, 규칙만 되돌려도 업로드는 동작한다
(10-20 롤백 두 번 모두 운영 SOS 정상 확인).
