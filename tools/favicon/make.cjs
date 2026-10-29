// 사이트 아이콘(favicon 등) 만들기 — node tools/favicon/make.cjs <A|B|C>
// 원본: "THE STEPPER 가맹점 마크/THE STEPPER 메인 로고.png" (590px, 배경 투명). 원본은 읽기만 한다.
//   A 로고 전체 · B 안쪽 파란 팔각형(바깥 노란·빨간 띠 제외) · C TSP 마크만(파란 정사각 바탕)
// 만드는 파일(저장소 맨 위): favicon.ico(16·32·48), favicon-32x32.png, apple-touch-icon.png(180), icon-192.png, icon-512.png
// 후보를 바꿀 때는 이 도구만 다시 돌리면 된다(파일 이름이 같아 html 은 그대로). sharp 는 tools/gallery-previews 의 것을 쓴다.
const path = require('path'), fs = require('fs');
const ROOT = path.resolve(__dirname, '..', '..');
const sharp = require(path.join(ROOT, 'tools', 'gallery-previews', 'node_modules', 'sharp'));
const SRC = path.join(ROOT, 'THE STEPPER 가맹점 마크', 'THE STEPPER 메인 로고.png');
const BLUE = { r: 0, g: 90, b: 171, alpha: 1 };   // 로고 안쪽 파란색(원본에서 뽑은 값)
const KIND = (process.argv[2] || '').toUpperCase();

const octagon = (n) => { const c = Math.round(n * 0.2929); return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${n}" height="${n}"><polygon points="${c},0 ${n - c},0 ${n},${c} ${n},${n - c} ${n - c},${n} ${c},${n} 0,${n - c} 0,${c}" fill="#fff"/></svg>`); };

async function master(kind) {   // 512px 정사각 원본
  if (kind === 'A') return sharp(SRC).trim().resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer();
  if (kind === 'B') {
    const sq = await sharp(SRC).extract({ left: 84, top: 84, width: 422, height: 422 }).resize(512, 512).png().toBuffer();
    return sharp({ create: { width: 512, height: 512, channels: 4, background: BLUE } }).composite([{ input: sq }, { input: octagon(512), blend: 'dest-in' }]).png().toBuffer();
  }
  if (kind === 'C') {
    const mark = await sharp(SRC).extract({ left: 212, top: 355, width: 166, height: 150 }).resize(380, 344, { fit: 'contain', background: BLUE }).png().toBuffer();
    return sharp({ create: { width: 512, height: 512, channels: 4, background: BLUE } }).composite([{ input: mark, left: 66, top: 84 }]).png().toBuffer();
  }
  throw new Error('후보는 A·B·C 중 하나');
}

// ICO = 머리 6바이트 + 이미지 목록(16바이트씩) + PNG 데이터들 (요즘 브라우저는 ICO 안의 PNG 를 읽는다)
function ico(pngs) {
  const head = Buffer.alloc(6); head.writeUInt16LE(0, 0); head.writeUInt16LE(1, 2); head.writeUInt16LE(pngs.length, 4);
  const dir = []; let offset = 6 + 16 * pngs.length;
  for (const { size, buf } of pngs) {
    const e = Buffer.alloc(16); e.writeUInt8(size >= 256 ? 0 : size, 0); e.writeUInt8(size >= 256 ? 0 : size, 1); e.writeUInt8(0, 2); e.writeUInt8(0, 3);
    e.writeUInt16LE(1, 4); e.writeUInt16LE(32, 6); e.writeUInt32LE(buf.length, 8); e.writeUInt32LE(offset, 12); offset += buf.length; dir.push(e);
  }
  return Buffer.concat([head, ...dir, ...pngs.map(p => p.buf)]);
}

(async () => {
  const m = await master(KIND);
  const png = (n) => sharp(m).resize(n, n).png({ compressionLevel: 9 }).toBuffer();
  fs.writeFileSync(path.join(ROOT, 'favicon.ico'), ico([{ size: 16, buf: await png(16) }, { size: 32, buf: await png(32) }, { size: 48, buf: await png(48) }]));
  fs.writeFileSync(path.join(ROOT, 'favicon-32x32.png'), await png(32));
  // 아이폰 홈 화면 아이콘은 투명 부분이 검게 보일 수 있어 바탕을 채운다(A·B 는 바깥 투명)
  fs.writeFileSync(path.join(ROOT, 'apple-touch-icon.png'), await sharp(m).resize(180, 180).flatten({ background: KIND === 'A' ? '#F2F1EC' : '#005AAB' }).png().toBuffer());
  fs.writeFileSync(path.join(ROOT, 'icon-192.png'), await png(192));
  fs.writeFileSync(path.join(ROOT, 'icon-512.png'), await png(512));
  console.log(`후보 ${KIND} 로 favicon.ico · favicon-32x32.png · apple-touch-icon.png · icon-192.png · icon-512.png 를 만들었습니다`);
})().catch(e => { console.error('오류', e.message); process.exit(1); });
