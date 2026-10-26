# 갤러리 미리보기 이미지 (2026-10-26)

gallery.html 은 Storage `gallery/` 원본(장당 2~5MB, 5712×4284 등)을 직접 보여 주지 않고,
원본마다 만든 **미리보기 WebP 2개**를 쓴다. 원본은 그대로 보관한다.

## 저장 위치·이름 규칙

원본 1장 = 미리보기 2개. 이름은 **원본 파일 이름 뒤에 `.webp`** 를 붙인다.

| 용도 | 경로 | 크기 | 품질 |
|---|---|---|---|
| 원본(손대지 않음) | `gallery/<파일명>` | 그대로 | — |
| 목록(사진 칸) | `gallery/_preview/thumb/<파일명>.webp` | 긴 변 720px | WebP 72 |
| 크게 보기 | `gallery/_preview/view/<파일명>.webp` | 긴 변 1920px | WebP 80 |

예) `gallery/KakaoTalk_20260517_233952385_01.jpg`
→ `gallery/_preview/thumb/KakaoTalk_20260517_233952385_01.jpg.webp`
→ `gallery/_preview/view/KakaoTalk_20260517_233952385_01.jpg.webp`

- 원본보다 작으면 키우지 않는다. 사진의 EXIF 방향대로 세운 뒤 줄인다.
- `_preview/` 는 `gallery/` 안의 하위 폴더라 storage.rules 의 `gallery/**` 규칙(누구나 읽기, 관리자만 쓰기)을 그대로 따른다. 규칙 변경 없음.
- gallery.html 의 `listAll('gallery/')` 는 바로 아래 파일만 사진으로 세므로 미리보기 폴더는 사진 목록에 섞이지 않는다.

## 원본과의 연결 기록

미리보기 파일마다 Storage 사용자 메타데이터로 원본을 적어 둔다.

| 메타데이터 | 뜻 |
|---|---|
| `source` | 원본 경로 (`gallery/<파일명>`) |
| `sourceGeneration` | 만들 때의 원본 generation(파일 버전 번호). 원본을 같은 이름으로 바꿔 올리면 달라진다 |
| `kind` | `thumb` 또는 `view` |
| `edge` | 긴 변 픽셀 |

gallery.html 은 주소 끝에 원본 generation(`&v=`)을 붙여, 원본이 바뀌면 브라우저 캐시도 새로 받는다.

## 원본을 추가·교체·삭제할 때 (유소년 사진 결정 포함)

원본을 Firebase 콘솔에서 올리거나 지우거나 바꾼 뒤, **반드시 아래 도구로 미리보기를 맞춘다.**

```
cd tools/gallery-previews
npm install            # 처음 한 번
node sync.cjs <서비스 계정 키 .json 경로>            # 할 일만 보고 (아무것도 안 바꿈)
node sync.cjs <서비스 계정 키 .json 경로> --apply    # 실제로 맞춤
```

도구가 하는 일:
- 미리보기가 없거나 `sourceGeneration` 이 원본과 다르면(교체) → 새로 만든다.
- 원본이 없어진 미리보기 → 지운다. **원본을 지우면 미리보기도 이 도구로 꼭 지울 것** — 남겨 두면 지운 사진이 미리보기 주소로 계속 공개된다.
- 원본(`gallery/` 바로 아래 파일)은 읽기만 하고 바꾸지 않는다.

도구를 아직 돌리지 않았을 때: 새 원본은 목록에 바로 나오고, 미리보기가 없으니 원본으로 대신 보여 준다(느리지만 깨지지 않음).
원본만 지운 경우 갤러리 목록에서는 바로 빠지지만, 위에 적은 대로 미리보기 파일은 남아 있다.

## 만든 기록

- 2026-10-26: 원본 32장 → 미리보기 64개 생성 (thumb 합계 약 1.3MB, view 합계 약 6.8MB).
