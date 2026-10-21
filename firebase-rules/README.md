# Firebase 보안 규칙 관리 절차

## 기준 파일은 루트 2개뿐

| 대상 | 기준 파일 | firebase.json 연결 |
|---|---|---|
| Firestore | `/firestore.rules` | `"firestore": { "rules": "firestore.rules" }` |
| Storage | `/storage.rules` | `"storage": { "rules": "storage.rules" }` |

- 이 폴더(`firebase-rules/`)에는 편집용 규칙 사본을 두지 않는다. 예전 사본(`firebase-rules/firestore.rules`, `firebase-rules/storage.rules`)은 실제 배포본과 달라 혼란을 일으켜서 삭제했다.
- `firebase-rules/deployed/` 는 **배포 스냅샷(기록용)** 이다. 수정하지 않는다.

| 스냅샷 | Firestore ruleset | Storage ruleset |
|---|---|---|
| `deployed/2026-10-16-before/` (이번 배포 직전) | `8800f8e2-3648-41fd-b781-ef7fe5d10236` (2026-08-13 생성) | `cac0c3d0-1c8d-4256-a265-b13cd5e18a66` (2026-07-20 생성) |
| `deployed/2026-10-16-after/` (이번 배포 직후) | `4487afb1-46b0-4892-8a68-43f7f8762183` (2026-10-16 09:01:34 GMT) | `09599645-7914-4ee3-9a31-367dc9cb6050` (2026-10-16 09:01:32 GMT) |
| `deployed/2026-10-19-after/` (규칙 강화 1~6단계 후, Firestore 만 — 직전 상태는 2026-10-16-after 와 같음) | `c9cbaad0-67ab-4d78-8612-d48e03c20ed9` (2026-10-19 12:00:29 GMT) | (변경 없음) |
| `deployed/2026-10-21-after/` (Storage 보강 — SOS 교차 규칙 · isAdmin email_verified. 직전 상태는 2026-10-19-after / 2026-10-16-after 와 같음) | `7911bd9f-0e38-4926-83f2-1ada48e3a3f8` (2026-10-21 08:21:29 GMT) | `aeb5ebb8-f4b0-4034-aef1-bf5066150d3f` (2026-10-21 08:21:25 GMT) |

## 권한 원칙

- **규칙 배포는 소유자 계정 CLI로 한다.** (`firebase login` 이 tkdboykms0007@gmail.com 인 PC에서 실행)
- **서비스 계정에는 규칙·Storage 관리 권한을 주지 않는다** (서버 API 키의 권한 최소화). thestepper-api 서비스 계정은 배포본 *조회*(Admin SDK `securityRules()` 읽기)에만 쓴다. 2026-10-16 확인 결과 이 계정으로는 Storage 규칙 배포가 403(`firebasestorage.defaultBucket.get`)으로 실패하며, 그 상태를 유지한다.

## 배포 절차 (반드시 이 순서)

### 배포 전 확인

1. **로그인 계정 확인** — `firebase login:list` 결과가 `tkdboykms0007@gmail.com` 인지 확인한다. 다르면 멈춘다.
2. **배포본 재취득 후 diff** — Admin SDK `securityRules().getFirestoreRuleset()` / `getStorageRuleset('thestepper-c9bfb.firebasestorage.app')` 로 현재 배포된 원문을 가져와 가장 최근 `deployed/*-after/` 스냅샷과 비교한다. 다르면(콘솔에서 누군가 바꿨으면) **멈추고** 그 변경을 루트 파일에 먼저 반영할지 결정한다. 콘솔 화면 복사·붙여넣기는 쓰지 않는다.
3. **에뮬레이터 테스트 통과** — `tests/rules/` 에서 `npm install` 후 `npm test` 를 실행해 전부 통과하는지 확인한다.
   - Java 21 필요 (Temurin 21 JDK 사용).
   - Windows에서 Firestore 에뮬레이터가 `SocketException: Invalid argument: connect` 로 죽으면 짧은 영문 경로를 지정한다:
     `JAVA_TOOL_OPTIONS=-Djdk.net.unixdomain.tmpdir=C:\jtmp` (폴더를 먼저 만든다)

### 배포

4. `firebase deploy --only firestore:rules,storage --project thestepper-c9bfb` (루트 2개 파일 전체 교체)
   - **실제 터미널(TTY)에서 실행한다** — 앱의 Terminal 패널이나 직접 연 PowerShell. 아래 「Storage 교차 규칙과 IAM」 참고.

### Storage 교차 규칙과 IAM 역할

- `storage.rules` 가 `firestore.get()` / `firestore.exists()` 를 쓰면(현재 `sos_videos/`), Firebase Storage 서비스 에이전트
  `service-787224576231@gcp-sa-firebasestorage.iam.gserviceaccount.com` 에 **`roles/firebaserules.firestoreServiceAgent`** 역할이 있어야 한다.
  없으면 규칙은 배포되지만 운영에서 해당 경로 업로드가 모두 `storage/unauthorized` 가 된다. 에뮬레이터 테스트는 IAM 을 검사하지 않아 통과한다.
- 이 역할은 **2026-10-21 부여됨** (프로젝트 IAM etag `BwZbqOLYoJ4=` → `BwZeVW7QYYo=`). 이후 배포에서는 다시 부여할 필요가 없다.
- `firebase deploy` 는 **실제 터미널(TTY)에서 실행될 때만** 역할을 확인·부여한다. TTY 가 없는 셸(자동화 도구, CI 등)에서는 CLI 가
  스스로 non-interactive 가 되어 `--force` 를 붙여도 이 단계를 건너뛰고 경고도 없다
  (firebase-tools `lib/rulesDeploy.js` `checkStorageRulesIamPermissions()` 의 `if (this.options.nonInteractive) return;`).
  `--non-interactive` 를 명시한 경우도 같다. TTY 에서 `--force` 면 질문 없이 부여하고 `storage: updated service account for cross-service rules...` 를 출력한다.
- 역할이 있는지는 배포 전에 Cloud Resource Manager `projects/thestepper-c9bfb:getIamPolicy` 로 확인한다(서비스 계정 토큰으로 읽기 가능).
- **역할 부여 직후 약 1분간 반영 지연**이 있다. 2026-10-21 배포 직후 첫 업로드는 `storage/unauthorized`, 1분 뒤 재시도는 성공했다.
  배포 후 스모크 테스트는 실패해도 바로 롤백하지 말고 1분 간격으로 몇 번 재시도한 뒤 판단한다.

### 배포 후 확인

5. **배포본 재취득 후 diff** — 2번 방법으로 다시 가져와 루트 파일과 완전히 같은지 diff 한다. 새 ruleset 이름·생성시각과 원문을 `deployed/<날짜>-after/` 에 저장하고, 직전 스냅샷은 `deployed/<날짜>-before/` 로 남긴다.
6. **운영 확인** (비로그인 REST 호출로 충분) — 공개 읽기 컬렉션(schedules, locations)과 공개 이미지(logos/, gallery/ 등)가 200으로 열리고, 막아야 할 컬렉션(inquiries 등)이 403인지 확인한다.
7. **Storage 규칙을 바꿨으면 SOS 업로드 스모크** — 회원 계정으로 SOS 문서 생성 → 같은 문서 ID 경로 영상 업로드 → admin.html 재생 확인 → 테스트 데이터 삭제. (기록: `docs/storage-rules-2026-10-21.md`)

## 원칙

- 규칙은 부분 수정하지 않고 루트 파일 **전체 교체**로만 배포한다.
- 콘솔에서 직접 규칙을 고치지 않는다. 고쳤다면 즉시 루트 파일에 같은 내용을 커밋한다.
- 서비스 계정 키 파일·키 값은 커밋하거나 출력하지 않는다.
