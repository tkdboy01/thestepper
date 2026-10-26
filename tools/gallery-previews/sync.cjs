// Storage gallery/ 원본 ↔ 미리보기 WebP 맞추기 (설명: docs/gallery-previews.md)
//   node sync.cjs <서비스 계정 키 .json 경로>           → 할 일만 보고(아무것도 안 바꿈)
//   node sync.cjs <서비스 계정 키 .json 경로> --apply   → 없거나 낡은 미리보기 생성, 원본이 없어진 미리보기 삭제
// 원본(gallery/ 바로 아래 파일)은 읽기만 하고 절대 바꾸지 않는다.
const path = require('path');
const admin = require('firebase-admin');
const sharp = require('sharp');

const BUCKET = 'thestepper-c9bfb.firebasestorage.app';
const SRC = 'gallery/';
const PREVIEW = 'gallery/_preview/';
// 목록용(thumb): 긴 변 720px — 1440px 화면 4열 칸(약 276px)·휴대폰 2열 칸을 고해상도 화면에서도 채움
// 크게 보기용(view): 긴 변 1920px
const SIZES = { thumb: { edge: 720, quality: 72 }, view: { edge: 1920, quality: 80 } };
const previewName = (kind, srcName) => `${PREVIEW}${kind}/${srcName.slice(SRC.length)}.webp`;

const [keyPath, flag] = process.argv.slice(2);
if (!keyPath) { console.error('사용법: node sync.cjs <서비스 계정 키 .json> [--apply]'); process.exit(1); }
const APPLY = flag === '--apply';
admin.initializeApp({ credential: admin.credential.cert(path.resolve(keyPath)), storageBucket: BUCKET });
const bucket = admin.storage().bucket();

(async () => {
  // 원본: gallery/ 바로 아래 이미지 파일만 (콘솔이 만든 0바이트 폴더 표시 객체·하위 폴더 제외)
  const [top] = await bucket.getFiles({ prefix: SRC, delimiter: '/' });
  const originals = top.filter(f => f.name !== SRC && Number(f.metadata.size) > 0 && /^image\//.test(f.metadata.contentType || ''));
  const [prev] = await bucket.getFiles({ prefix: PREVIEW });
  const prevMap = new Map(prev.map(f => [f.name, f]));
  const wanted = new Set();
  let made = 0, kept = 0, removed = 0, srcBytes = 0, outBytes = { thumb: 0, view: 0 };

  console.log(`원본 ${originals.length}장, 기존 미리보기 ${prev.length}개 ${APPLY ? '(적용)' : '(보고만 — 바꾸려면 --apply)'}`);
  for (const o of originals) {
    const gen = String(o.metadata.generation);
    const todo = [];
    for (const kind of Object.keys(SIZES)) {
      const name = previewName(kind, o.name);
      wanted.add(name);
      const p = prevMap.get(name);
      if (p && p.metadata.metadata && p.metadata.metadata.sourceGeneration === gen) { kept++; outBytes[kind] += Number(p.metadata.size); }
      else todo.push(kind);
    }
    if (!todo.length) continue;
    console.log(`  생성 ${todo.join('·')}: ${o.name}`);
    if (!APPLY) { made += todo.length; continue; }
    const [buf] = await o.download();
    srcBytes += buf.length;
    for (const kind of todo) {
      const { edge, quality } = SIZES[kind];
      const out = await sharp(buf).rotate()   // EXIF 방향대로 세운 뒤 줄임
        .resize({ width: edge, height: edge, fit: 'inside', withoutEnlargement: true })
        .webp({ quality }).toBuffer();
      await bucket.file(previewName(kind, o.name)).save(out, {
        resumable: false, contentType: 'image/webp',
        metadata: {
          cacheControl: 'public, max-age=31536000',
          metadata: { source: o.name, sourceGeneration: gen, kind, edge: String(edge) }
        }
      });
      outBytes[kind] += out.length; made++;
    }
  }
  // 원본이 지워진 미리보기 정리
  for (const p of prev) {
    if (wanted.has(p.name)) continue;
    console.log(`  삭제(원본 없음): ${p.name}`);
    if (APPLY) await p.delete();
    removed++;
  }
  console.log(`결과: 생성 ${made} · 그대로 ${kept} · 삭제 ${removed}` +
    (APPLY ? ` · 미리보기 합계 thumb ${Math.round(outBytes.thumb / 1024)}KB, view ${Math.round(outBytes.view / 1024)}KB` : ''));
  process.exit(0);
})().catch(e => { console.error('오류', e.message); process.exit(1); });
