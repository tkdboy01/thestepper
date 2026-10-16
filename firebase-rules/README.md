# Firebase 보안 규칙 관리 절차

## 기준 파일은 루트 2개뿐

| 대상 | 기준 파일 | firebase.json 연결 |
|---|---|---|
| Firestore | `/firestore.rules` | `"firestore": { "rules": "firestore.rules" }` |
| Storage | `/storage.rules` | `"storage": { "rules": "storage.rules" }` |

- 이 폴더(`firebase-rules/`)에는 규칙 사본을 두지 않는다. 예전 사본(`firebase-rules/firestore.rules`, `firebase-rules/storage.rules`)은 실제 배포본과 달라 혼란을 일으켜서 삭제했다.
- `firebase-rules/deployed/` 는 **2026-10-16 배포 스냅샷(기록용)** 이다. 수정하지 않는다.
  - Firestore ruleset `8800f8e2-3648-41fd-b781-ef7fe5d10236` (2026-08-13 생성)
  - Storage ruleset `cac0c3d0-1c8d-4256-a265-b13cd5e18a66` (2026-07-20 생성)

## 배포 절차 (반드시 이 순서)

1. **배포본 가져오기** — Admin SDK `securityRules().getFirestoreRuleset()` / `getStorageRuleset('thestepper-c9bfb.firebasestorage.app')` 로 현재 배포된 원문을 가져온다. 콘솔 화면 복사·붙여넣기는 쓰지 않는다.
2. **diff 확인** — 가져온 원문을 직전 스냅샷(또는 마지막 배포 커밋의 루트 파일)과 비교한다. 콘솔에서 누군가 바꾼 흔적이 있으면 **멈추고** 그 변경을 루트 파일에 먼저 반영할지 결정한다.
3. **에뮬레이터 테스트** — `tests/rules/` 에서 `npm install` 후 `npm test` 를 실행해 전부 통과하는지 확인한다.
   - Java 21 필요 (Temurin 21 JDK 사용).
   - Windows에서 Firestore 에뮬레이터가 `SocketException: Invalid argument: connect` 로 죽으면 짧은 영문 경로를 지정한다:
     `JAVA_TOOL_OPTIONS=-Djdk.net.unixdomain.tmpdir=C:\jtmp` (폴더를 먼저 만든다)
4. **배포** — `firebase deploy --only firestore:rules,storage` (루트 2개 파일 전체 교체).
5. **배포 후 확인** — 1번 방법으로 다시 가져와 루트 파일과 완전히 같은지 diff 한다.

## 원칙

- 규칙은 부분 수정하지 않고 루트 파일 **전체 교체**로만 배포한다.
- 콘솔에서 직접 규칙을 고치지 않는다. 고쳤다면 즉시 루트 파일에 같은 내용을 커밋한다.
- 서비스 계정 키 파일·키 값은 커밋하거나 출력하지 않는다.
