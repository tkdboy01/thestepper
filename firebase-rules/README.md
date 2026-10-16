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

### 배포 후 확인

5. **배포본 재취득 후 diff** — 2번 방법으로 다시 가져와 루트 파일과 완전히 같은지 diff 한다. 새 ruleset 이름·생성시각과 원문을 `deployed/<날짜>-after/` 에 저장하고, 직전 스냅샷은 `deployed/<날짜>-before/` 로 남긴다.
6. **운영 확인** (비로그인 REST 호출로 충분) — 공개 읽기 컬렉션(schedules, locations)과 공개 이미지(logos/, gallery/ 등)가 200으로 열리고, 막아야 할 컬렉션(inquiries 등)이 403인지 확인한다.

## 원칙

- 규칙은 부분 수정하지 않고 루트 파일 **전체 교체**로만 배포한다.
- 콘솔에서 직접 규칙을 고치지 않는다. 고쳤다면 즉시 루트 파일에 같은 내용을 커밋한다.
- 서비스 계정 키 파일·키 값은 커밋하거나 출력하지 않는다.
