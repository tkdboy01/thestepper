/**
 * THE STEPPER 브랜드 QR 코드 생성기
 * 실행: node generate-qr.js
 * 출력: outputs/thestepper_qr.png (1200×1200 plain)
 *       outputs/thestepper_qr_branded.svg (인쇄용 브랜드 SVG)
 */

const qrcode = require(require('path').join(__dirname, 'outputs', 'node_modules', 'qrcode'));
const fs = require('fs');
const path = require('path');

const TARGET_URL = 'https://www.thestepper.co.kr/virtual.html?src=ulsan_qr';
const OUT_DIR = path.join(__dirname, 'outputs');

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

async function main() {
  // ── 1. 고해상도 PNG (1200×1200) ───────────────────────────────
  const pngPath = path.join(OUT_DIR, 'thestepper_qr.png');
  await qrcode.toFile(pngPath, TARGET_URL, {
    type: 'png',
    errorCorrectionLevel: 'H',  // 30% 손상 허용 (로고 삽입 여유)
    width: 1200,
    margin: 3,
    color: { dark: '#1d1d1f', light: '#ffffff' }
  });
  console.log('✅ PNG 생성:', pngPath);

  // ── 2. SVG 소스 추출 (viewBox + 패스 데이터) ──────────────────
  const innerSvg = await qrcode.toString(TARGET_URL, {
    type: 'svg',
    errorCorrectionLevel: 'H',
    margin: 3,
    color: { dark: '#1d1d1f', light: '#ffffff' }
  });

  // viewBox 파싱 (예: "0 0 41 41")
  const vbMatch = innerSvg.match(/viewBox="([^"]+)"/);
  const viewBox = vbMatch ? vbMatch[1] : '0 0 45 45';

  // path/rect 태그만 추출
  const innerContent = innerSvg
    .replace(/<svg[^>]*>/, '')
    .replace(/<\/svg>/, '')
    .trim();

  // ── 3. 브랜드 SVG 조립 (1000×1260 세로) ─────────────────────
  const QR_SIZE  = 820;   // QR 코드 크기 (px)
  const QR_X     = (1000 - QR_SIZE) / 2;   // 가로 중앙
  const QR_Y     = 195;   // 상단 여백

  const brandedSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1000" height="1260" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">

  <!-- 배경 -->
  <rect width="1000" height="1260" fill="#ffffff"/>

  <!-- 상단 빨간 바 -->
  <rect width="1000" height="14" fill="#C0392B"/>

  <!-- 브랜드명 THE STEPPER -->
  <text x="500" y="96" text-anchor="middle"
        font-family="'Arial Black', 'Impact', sans-serif"
        font-size="58" font-weight="900" fill="#C9A84C" letter-spacing="7">THE STEPPER</text>

  <!-- 부제 -->
  <text x="500" y="140" text-anchor="middle"
        font-family="'Arial', 'Noto Sans KR', sans-serif"
        font-size="22" fill="#6e6e73" letter-spacing="3">VR 버추얼 태권도 체험</text>

  <!-- 구분선 -->
  <rect x="60" y="162" width="880" height="1.5" fill="#e5e5e7"/>

  <!-- QR 코드 (중앙 임베드) -->
  <svg x="${QR_X}" y="${QR_Y}" width="${QR_SIZE}" height="${QR_SIZE}" viewBox="${viewBox}">
    ${innerContent}
  </svg>

  <!-- QR 코드 테두리 강조 -->
  <rect x="${QR_X - 4}" y="${QR_Y - 4}" width="${QR_SIZE + 8}" height="${QR_SIZE + 8}"
        fill="none" stroke="#C0392B" stroke-width="3" rx="8"/>

  <!-- 구분선 -->
  <rect x="60" y="${QR_Y + QR_SIZE + 22}" width="880" height="1.5" fill="#e5e5e7"/>

  <!-- 안내 텍스트 -->
  <text x="500" y="${QR_Y + QR_SIZE + 72}" text-anchor="middle"
        font-family="'Arial', 'Noto Sans KR', sans-serif"
        font-size="30" font-weight="700" fill="#1d1d1f">스캔하고 AI 겨루기 코치 무료 체험!</text>

  <!-- URL 텍스트 -->
  <text x="500" y="${QR_Y + QR_SIZE + 116}" text-anchor="middle"
        font-family="'Arial', monospace"
        font-size="18" fill="#6e6e73">www.thestepper.co.kr</text>

  <!-- 무료 뱃지 -->
  <rect x="340" y="${QR_Y + QR_SIZE + 140}" width="320" height="46" rx="23" fill="#C0392B"/>
  <text x="500" y="${QR_Y + QR_SIZE + 170}" text-anchor="middle"
        font-family="'Arial', 'Noto Sans KR', sans-serif"
        font-size="18" font-weight="700" fill="#ffffff" letter-spacing="1">🤖 AI 코치 하루 5회 영구 무료</text>

  <!-- 하단 빨간 바 -->
  <rect y="1246" width="1000" height="14" fill="#C0392B"/>

</svg>`;

  const svgPath = path.join(OUT_DIR, 'thestepper_qr_branded.svg');
  fs.writeFileSync(svgPath, brandedSvg, 'utf8');
  console.log('✅ 브랜드 SVG 생성:', svgPath);
  console.log('\n📌 인쇄 안내:');
  console.log('  - thestepper_qr.png : 1200×1200px 고해상도 PNG (직접 인쇄)');
  console.log('  - thestepper_qr_branded.svg : 브랜드 포함 벡터 (Illustrator/Inkscape에서 열거나 브라우저 → 파일 저장)');
  console.log('\n🔗 QR 코드 URL:', TARGET_URL);
}

main().catch(err => { console.error('[오류]', err.message); process.exit(1); });
