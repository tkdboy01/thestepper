// 루트 firestore.rules / storage.rules 에뮬레이터 테스트.
// 실행: tests/rules 에서 `npm test` (Java 21 + firebase-tools 필요)
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { test, before, after, beforeEach, describe } from 'node:test';
import {
  initializeTestEnvironment, assertSucceeds, assertFails,
} from '@firebase/rules-unit-testing';
import {
  doc, getDoc, setDoc, addDoc, updateDoc, deleteDoc, collection, getDocs,
  query, where, orderBy, serverTimestamp, increment,
} from 'firebase/firestore';
import {
  ref, uploadBytes, uploadBytesResumable, getMetadata, listAll, deleteObject,
} from 'firebase/storage';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const ADMIN_EMAIL = 'tkdboykms0007@gmail.com';

let env;
const anon = () => env.unauthenticatedContext();
// 일반 회원 — 실제 회원 화면(ai.html·motion-legacy.html)은 이메일 인증 후에만 열리므로 인증된 토큰을 기본으로 한다
const alice = () => env.authenticatedContext('alice', { email: 'alice@example.com', email_verified: true });
const bob = () => env.authenticatedContext('bob', { email: 'bob@example.com', email_verified: true });
// 이메일 미인증 회원 — SOS 문서·영상은 거부돼야 한다 (2026-10-21)
const aliceUnverified = () => env.authenticatedContext('alice', { email: 'alice@example.com', email_verified: false });
const aliceNoClaim = () => env.authenticatedContext('alice', { email: 'alice@example.com' });
const admin = () => env.authenticatedContext('admin', { email: ADMIN_EMAIL, email_verified: true });
// 관리자 이메일이지만 미인증 토큰 — isAdmin() 이 email_verified 를 보므로 관리자가 아니다 (2026-10-20)
const fakeAdmin = () => env.authenticatedContext('evil', { email: ADMIN_EMAIL, email_verified: false });

// board.html submitInquiry() 가 저장하는 9개 필드와 동일한 형태
function inquiryPayload(overrides = {}) {
  return {
    title: '제목', content: '내용', uid: 'alice', email: 'alice@example.com',
    nickname: '앨리스', createdAt: serverTimestamp(), answer: '', answeredAt: null,
    status: 'pending', ...overrides,
  };
}
const bytes = (n) => new Uint8Array(n);
const MB = 1024 * 1024;

before(async () => {
  env = await initializeTestEnvironment({
    projectId: 'demo-thestepper',
    firestore: { rules: readFileSync(resolve(ROOT, 'firestore.rules'), 'utf8'), host: '127.0.0.1', port: 8080 },
    storage: { rules: readFileSync(resolve(ROOT, 'storage.rules'), 'utf8'), host: '127.0.0.1', port: 9199 },
  });
});
after(async () => { await env.cleanup(); });

beforeEach(async () => {
  await env.clearFirestore();
  await env.clearStorage();
  await env.withSecurityRulesDisabled(async (ctx) => {
    const db = ctx.firestore();
    await setDoc(doc(db, 'inquiries', 'q-alice'), { ...inquiryPayload(), createdAt: new Date() });
    await setDoc(doc(db, 'inquiries', 'q-bob'), { ...inquiryPayload({ uid: 'bob', email: 'bob@example.com' }), createdAt: new Date() });
    await setDoc(doc(db, 'schedules', 's1'), { title: '세미나' });
    await setDoc(doc(db, 'locations', 'l1'), { name: '도장' });
    await setDoc(doc(db, 'users', 'alice'), { nickname: '앨리스' });
    await setDoc(doc(db, 'quiz_questions', 'confirmed1'), { status: 'confirmed' });
    await setDoc(doc(db, 'quiz_questions', 'draft1'), { status: 'draft' });
    await setDoc(doc(db, 'ai_coaching', 'c-alice'), { userId: 'alice', viewed: false });
    await setDoc(doc(db, 'expertUsage', 'alice'), { date: '2026-10-19', count: 1 });
    await setDoc(doc(db, 'movement_data', 'm1'), { x: 1 });
    await setDoc(doc(db, 'coaching_knowledge', 'k1'), { status: 'confirmed', title: '지식' });
    await setDoc(doc(db, 'ai_interview', 'i1'), { trackType: 'sos', userId: 'alice', status: '대기중' });
    await setDoc(doc(db, 'voice_drafts', 'v1'), { status: 'draft' });
    await setDoc(doc(db, 'comparison_questions', 'cq1'), { question: 'q' });
    await setDoc(doc(db, 'aiUsage', 'alice'), { date: '2026-10-19', count: 1 });
    await setDoc(doc(db, 'stats', 'visitors'), { count: 100 });
    const st = ctx.storage();
    for (const p of ['assets', 'center', 'gallery', 'guide', 'logos', 'staff']) {
      await uploadBytes(ref(st, `${p}/seed.png`), bytes(10), { contentType: 'image/png' });
    }
    await uploadBytes(ref(st, 'sos_videos/alice/seed.mp4'), bytes(10), { contentType: 'video/mp4' });
    await uploadBytes(ref(st, 'movement_videos/m1.mp4'), bytes(10), { contentType: 'video/mp4' });
  });
});

// ───────────────────────── Firestore: inquiries ─────────────────────────
describe('inquiries', () => {
  test('비로그인 읽기 거부', () => assertFails(getDoc(doc(anon().firestore(), 'inquiries', 'q-alice'))));
  test('본인 읽기 허용', () => assertSucceeds(getDoc(doc(alice().firestore(), 'inquiries', 'q-alice'))));
  test('타인 읽기 거부', () => assertFails(getDoc(doc(bob().firestore(), 'inquiries', 'q-alice'))));
  test('관리자 전체 목록 쿼리 허용', () => assertSucceeds(getDocs(query(collection(admin().firestore(), 'inquiries'), orderBy('createdAt', 'desc')))));
  test('일반회원 where uid 쿼리 허용', () => assertSucceeds(getDocs(query(collection(alice().firestore(), 'inquiries'), where('uid', '==', 'alice')))));
  test('일반회원 전체 쿼리 거부', () => assertFails(getDocs(collection(alice().firestore(), 'inquiries'))));
  test('비로그인 전체 쿼리 거부', () => assertFails(getDocs(collection(anon().firestore(), 'inquiries'))));
  test('비로그인 생성 거부', () => assertFails(addDoc(collection(anon().firestore(), 'inquiries'), inquiryPayload())));
  test('타인 uid로 생성 거부', () => assertFails(addDoc(collection(alice().firestore(), 'inquiries'), inquiryPayload({ uid: 'bob' }))));
  test('가짜 email로 생성 거부', () => assertFails(addDoc(collection(alice().firestore(), 'inquiries'), inquiryPayload({ email: 'fake@example.com' }))));
  test('status 미리 채운 생성 거부', () => assertFails(addDoc(collection(alice().firestore(), 'inquiries'), inquiryPayload({ status: 'answered' }))));
  test('answer 미리 채운 생성 거부', () => assertFails(addDoc(collection(alice().firestore(), 'inquiries'), inquiryPayload({ answer: '셀프 답변' }))));
  test('answeredAt 미리 채운 생성 거부', () => assertFails(addDoc(collection(alice().firestore(), 'inquiries'), inquiryPayload({ answeredAt: new Date() }))));
  test('createdAt 임의 시각 생성 거부', () => assertFails(addDoc(collection(alice().firestore(), 'inquiries'), inquiryPayload({ createdAt: new Date('2020-01-01') }))));
  test('허용 외 필드 추가 생성 거부', () => assertFails(addDoc(collection(alice().firestore(), 'inquiries'), inquiryPayload({ phone: '010-0000-0000' }))));
  test('정상 생성 허용 (board.html 형태)', () => assertSucceeds(addDoc(collection(alice().firestore(), 'inquiries'), inquiryPayload())));
  test('작성자의 answer 수정 거부', () => assertFails(updateDoc(doc(alice().firestore(), 'inquiries', 'q-alice'), { answer: '셀프', status: 'answered' })));
  test('작성자의 title 수정 거부', () => assertFails(updateDoc(doc(alice().firestore(), 'inquiries', 'q-alice'), { title: '바꿈' })));
  test('관리자 답변 허용 (board.html submitAnswer 형태)', () => assertSucceeds(updateDoc(doc(admin().firestore(), 'inquiries', 'q-alice'), { answer: '답변', answeredAt: serverTimestamp(), status: 'answered' })));
  test('관리자도 답변 외 필드 수정 거부', () => assertFails(updateDoc(doc(admin().firestore(), 'inquiries', 'q-alice'), { email: 'x@example.com' })));
  test('작성자 삭제 거부', () => assertFails(deleteDoc(doc(alice().firestore(), 'inquiries', 'q-alice'))));
  test('관리자 삭제 허용', () => assertSucceeds(deleteDoc(doc(admin().firestore(), 'inquiries', 'q-alice'))));
});

// ───────────────────── Firestore: 기존 규칙 회귀 ─────────────────────
describe('Firestore 회귀 (배포본과 같은 동작)', () => {
  test('schedules 비로그인 읽기 허용', () => assertSucceeds(getDocs(collection(anon().firestore(), 'schedules'))));
  test('schedules 일반회원 쓰기 거부', () => assertFails(setDoc(doc(alice().firestore(), 'schedules', 's2'), { t: 1 })));
  test('schedules 관리자 쓰기 허용', () => assertSucceeds(setDoc(doc(admin().firestore(), 'schedules', 's2'), { t: 1 })));
  test('locations 비로그인 읽기 허용', () => assertSucceeds(getDocs(collection(anon().firestore(), 'locations'))));
  test('locations 일반회원 쓰기 거부', () => assertFails(setDoc(doc(alice().firestore(), 'locations', 'l2'), { t: 1 })));
  test('users 본인 읽기 허용', () => assertSucceeds(getDoc(doc(alice().firestore(), 'users', 'alice'))));
  test('users 본인 쓰기 허용', () => assertSucceeds(setDoc(doc(alice().firestore(), 'users', 'alice'), { nickname: 'a' })));
  test('users 타인 읽기 거부', () => assertFails(getDoc(doc(bob().firestore(), 'users', 'alice'))));
  test('users 관리자 읽기 허용', () => assertSucceeds(getDoc(doc(admin().firestore(), 'users', 'alice'))));
  test('ai_interview 일반회원 읽기 거부', () => assertFails(getDocs(collection(alice().firestore(), 'ai_interview'))));
  test('ai_interview 관리자 읽기 허용', () => assertSucceeds(getDocs(collection(admin().firestore(), 'ai_interview'))));
  test('ai_coaching 본인 읽기 허용', () => assertSucceeds(getDoc(doc(alice().firestore(), 'ai_coaching', 'c-alice'))));
  test('ai_coaching 본인 viewed 수정 허용', () => assertSucceeds(updateDoc(doc(alice().firestore(), 'ai_coaching', 'c-alice'), { viewed: true })));
  test('ai_coaching 관리자 전체 목록 허용', () => assertSucceeds(getDocs(collection(admin().firestore(), 'ai_coaching'))));
  test('coaching_knowledge 비로그인 읽기 거부', () => assertFails(getDocs(collection(anon().firestore(), 'coaching_knowledge'))));
  // 1단계(2026-10-19): 회원 읽기 차단, 관리자만
  test('coaching_knowledge 일반회원 목록 읽기 거부', () => assertFails(getDocs(collection(alice().firestore(), 'coaching_knowledge'))));
  test('coaching_knowledge 일반회원 단건 읽기 거부', () => assertFails(getDoc(doc(alice().firestore(), 'coaching_knowledge', 'k1'))));
  test('coaching_knowledge 일반회원 쓰기 거부', () => assertFails(setDoc(doc(alice().firestore(), 'coaching_knowledge', 'k2'), { status: 'draft' })));
  test('coaching_knowledge 관리자 읽기 허용', () => assertSucceeds(getDocs(collection(admin().firestore(), 'coaching_knowledge'))));
  test('coaching_knowledge 관리자 쓰기 허용', () => assertSucceeds(setDoc(doc(admin().firestore(), 'coaching_knowledge', 'k2'), { status: 'draft' })));
  test('quiz_questions confirmed 비로그인 읽기 허용', () => assertSucceeds(getDoc(doc(anon().firestore(), 'quiz_questions', 'confirmed1'))));
  test('quiz_questions draft 비로그인 읽기 거부', () => assertFails(getDoc(doc(anon().firestore(), 'quiz_questions', 'draft1'))));
  test('movement_data 일반회원 거부', () => assertFails(getDoc(doc(alice().firestore(), 'movement_data', 'm1'))));
  test('movement_data 관리자 허용', () => assertSucceeds(getDoc(doc(admin().firestore(), 'movement_data', 'm1'))));
  test('voice_drafts 일반회원 거부', () => assertFails(getDocs(collection(alice().firestore(), 'voice_drafts'))));
  test('voice_drafts 관리자 허용', () => assertSucceeds(getDocs(collection(admin().firestore(), 'voice_drafts'))));
  test('comparison_results 관리자 쓰기 허용', () => assertSucceeds(addDoc(collection(admin().firestore(), 'comparison_results'), { a: 1 })));
  test('user_messages 생성 거부', () => assertFails(addDoc(collection(alice().firestore(), 'user_messages'), { userId: 'alice' })));
});


// ───────────── 2단계: 방문자 집계 stats/visitors ─────────────
// index.html(리뉴얼 전)·js/stepper-index.js(리뉴얼) 의 updateVisitor() 와 같은 순서·값
async function visitorCounterCode(db) {
  const r = doc(db, 'stats', 'visitors');
  const snap = await getDoc(r);
  if (!snap.exists()) await setDoc(r, { count: 1 });
  else await updateDoc(r, { count: increment(1) });
}
async function visitorCount() {
  let v; await env.withSecurityRulesDisabled(async c => { v = (await getDoc(doc(c.firestore(), 'stats', 'visitors'))).data().count; });
  return v;
}
describe('2단계 stats/visitors', () => {
  const V = c => doc(c.firestore(), 'stats', 'visitors');
  const removeVisitors = () => env.withSecurityRulesDisabled(c => deleteDoc(V(c)));
  test('비로그인 읽기 허용', () => assertSucceeds(getDoc(V(anon()))));
  test('집계 코드(문서 있음 → increment 1) 비로그인 통과, 정확히 +1', async () => {
    await assertSucceeds(visitorCounterCode(anon().firestore()));
    if (await visitorCount() !== 101) throw new Error('count != 101');
  });
  test('집계 코드 일반회원 통과', () => assertSucceeds(visitorCounterCode(alice().firestore())));
  test('집계 코드(문서 없음 → count 1 생성) 통과', async () => {
    await removeVisitors();
    await assertSucceeds(visitorCounterCode(anon().firestore()));
    if (await visitorCount() !== 1) throw new Error('count != 1');
  });
  test('집계 코드 2번 연속 → 정확히 +2', async () => {
    await assertSucceeds(visitorCounterCode(anon().firestore()));
    await assertSucceeds(visitorCounterCode(anon().firestore()));
    if (await visitorCount() !== 102) throw new Error('count != 102');
  });
  test('집계 코드 동시 2건 → 정확히 +2', async () => {
    await Promise.all([visitorCounterCode(anon().firestore()), visitorCounterCode(alice().firestore())]);
    if (await visitorCount() !== 102) throw new Error('count != 102');
  });
  test('count 를 명시적으로 기존+1 로 수정 허용', () => assertSucceeds(updateDoc(V(anon()), { count: 101 })));
  test('increment(2) 거부', () => assertFails(updateDoc(V(anon()), { count: increment(2) })));
  test('임의 값(+2) 거부', () => assertFails(updateDoc(V(anon()), { count: 102 })));
  test('임의 값(감소) 거부', () => assertFails(updateDoc(V(anon()), { count: 0 })));
  test('setDoc 덮어쓰기(임의 값) 거부', () => assertFails(setDoc(V(anon()), { count: 999999 })));
  test('필드 추가 거부', () => assertFails(updateDoc(V(anon()), { count: increment(1), hacked: true })));
  test('삭제 거부 (비로그인)', () => assertFails(deleteDoc(V(anon()))));
  test('삭제 거부 (일반회원)', () => assertFails(deleteDoc(V(alice()))));
  test('문서 없을 때 count 5 로 생성 거부', async () => { await removeVisitors(); await assertFails(setDoc(V(anon()), { count: 5 })); });
  test('문서 없을 때 필드 추가 생성 거부', async () => { await removeVisitors(); await assertFails(setDoc(V(anon()), { count: 1, x: 1 })); });
  test('stats 다른 문서 비로그인 읽기·쓰기 거부', async () => {
    await assertFails(getDoc(doc(anon().firestore(), 'stats', 'other')));
    await assertFails(setDoc(doc(anon().firestore(), 'stats', 'other'), { a: 1 }));
  });
  test('stats 다른 문서 일반회원 읽기·쓰기 거부', async () => {
    await assertFails(getDoc(doc(alice().firestore(), 'stats', 'other')));
    await assertFails(setDoc(doc(alice().firestore(), 'stats', 'other'), { a: 1 }));
  });
  test('stats 다른 문서 관리자 허용', () => assertSucceeds(setDoc(doc(admin().firestore(), 'stats', 'other'), { a: 1 })));
  test('visitors 컬렉션 비로그인·회원 거부', async () => {
    await assertFails(getDocs(collection(anon().firestore(), 'visitors')));
    await assertFails(addDoc(collection(alice().firestore(), 'visitors'), { a: 1 }));
  });
  test('visitors 컬렉션 관리자 허용', () => assertSucceeds(addDoc(collection(admin().firestore(), 'visitors'), { a: 1 })));
});


// ───────────── 3단계: ai_interview 생성 = motion-legacy SOS 만 ─────────────
// motion-legacy.html submitSOS() 의 add() 와 같은 필드·값 (compat 의 FieldValue.serverTimestamp() 와 같은 의미)
function sosPayload(uid, overrides = {}) {
  return Object.assign({
    trackType: 'sos', userId: uid, userEmail: uid + '@example.com', userName: '홍길동',
    question: '[SOS] 1장 앞차기 동작 분석 추가 피드백 요청', chapter: '1장 앞차기',
    videoUrl: '', videoPath: '',
    measurements: { rightKnee: { value: 150, time: 1.2 }, leftKnee: { value: 140, time: 1.4 },
      hip: { value: 30, time: 1.3 }, totalFrames: 90, videoDuration: 3.0 },
    aiFeedback: '무릎을 더 펴세요', status: '대기중', adminAnswer: '',
    createdAt: serverTimestamp(), updatedAt: serverTimestamp(),
  }, overrides);
}
describe('3단계 ai_interview 생성', () => {
  const C = c => collection(c.firestore(), 'ai_interview');
  // 2026-10-21: SOS 문서는 서버(manage-member submit-sos, Admin SDK)만 만든다 — 회원 직접 생성은 형식이 맞아도 거부
  test('회원 직접 SOS 생성(예전 motion-legacy 코드, 영상 없음) 거부', () => assertFails(addDoc(C(alice()), sosPayload('alice'))));
  test('SOS 요청 이메일 미인증 토큰 거부', () => assertFails(addDoc(C(aliceUnverified()), sosPayload('alice'))));
  test('SOS 요청 email_verified 없는 토큰 거부', () => assertFails(addDoc(C(aliceNoClaim()), sosPayload('alice'))));
  test('SOS 요청(영상 경로) 이메일 미인증 토큰 거부', () => assertFails(setDoc(doc(aliceUnverified().firestore(), 'ai_interview', 'AbCdEfGhIjKlMnOpQr02'),
    sosPayload('alice', { videoPath: 'sos_videos/alice/AbCdEfGhIjKlMnOpQr02.mp4' }))));
  // 2026-10-20: 문서를 먼저 만들고 영상은 sos_videos/{uid}/{문서 ID}.mp4 로 올린다. videoUrl 은 비워 둔다.
  test('회원 직접 SOS 생성(영상 있음, 미리 만든 ID 경로) 거부', () => assertFails(setDoc(doc(alice().firestore(), 'ai_interview', 'AbCdEfGhIjKlMnOpQr01'),
    sosPayload('alice', { videoPath: 'sos_videos/alice/AbCdEfGhIjKlMnOpQr01.mp4' }))));
  test('SOS 요청 videoUrl 채우기 거부', () => assertFails(setDoc(doc(alice().firestore(), 'ai_interview', 'AbCdEfGhIjKlMnOpQr01'),
    sosPayload('alice', { videoUrl: 'https://x/y.mp4', videoPath: 'sos_videos/alice/AbCdEfGhIjKlMnOpQr01.mp4' }))));
  test('SOS 요청 videoPath 가 다른 문서 ID 면 거부', () => assertFails(setDoc(doc(alice().firestore(), 'ai_interview', 'AbCdEfGhIjKlMnOpQr01'),
    sosPayload('alice', { videoPath: 'sos_videos/alice/ZZZZZZZZZZZZZZZZZZZZ.mp4' }))));
  test('SOS 요청 videoPath 가 다른 uid 폴더면 거부', () => assertFails(setDoc(doc(alice().firestore(), 'ai_interview', 'AbCdEfGhIjKlMnOpQr01'),
    sosPayload('alice', { videoPath: 'sos_videos/bob/AbCdEfGhIjKlMnOpQr01.mp4' }))));
  test('SOS 요청 videoPath 옛 형식(임의 이름) 거부', () => assertFails(addDoc(C(alice()), sosPayload('alice', { videoPath: 'sos_videos/alice/abc.mp4' }))));
  test('미인증 관리자 이메일 토큰은 ai_interview 읽기 거부', () => assertFails(getDoc(doc(fakeAdmin().firestore(), 'ai_interview', 'i1'))));
  test('미인증 관리자 이메일 토큰은 schedules 쓰기 거부', () => assertFails(setDoc(doc(fakeAdmin().firestore(), 'schedules', 's2'), { title: 'x' })));
  test('미인증 관리자 이메일 토큰은 inquiries 전체 읽기 거부', () => assertFails(getDocs(collection(fakeAdmin().firestore(), 'inquiries'))));
  test('회원 직접 SOS 생성(미리 만든 문서 ID 로 set) 거부', () => assertFails(setDoc(doc(alice().firestore(), 'ai_interview', 'preid'), sosPayload('alice'))));
  test('비로그인 거부', () => assertFails(addDoc(C(anon()), sosPayload('alice'))));
  test('필드 추가 거부', () => assertFails(addDoc(C(alice()), sosPayload('alice', { extra: 1 }))));
  test('필드 누락 거부', async () => { const d = sosPayload('alice'); delete d.aiFeedback; await assertFails(addDoc(C(alice()), d)); });
  test('다른 uid 거부', () => assertFails(addDoc(C(alice()), sosPayload('bob'))));
  test('다른 status(답변완료) 거부', () => assertFails(addDoc(C(alice()), sosPayload('alice', { status: '답변완료' }))));
  test('다른 status(인터뷰중) 거부', () => assertFails(addDoc(C(alice()), sosPayload('alice', { status: '인터뷰중' }))));
  test('다른 trackType 거부', () => assertFails(addDoc(C(alice()), sosPayload('alice', { trackType: 'scenario' }))));
  test('adminAnswer 미리 채우기 거부', () => assertFails(addDoc(C(alice()), sosPayload('alice', { adminAnswer: '답변' }))));
  test('createdAt 임의 시각 거부', () => assertFails(addDoc(C(alice()), sosPayload('alice', { createdAt: new Date(0) }))));
  test('measurements 가 map 아니면 거부', () => assertFails(addDoc(C(alice()), sosPayload('alice', { measurements: 'x' }))));
  test('임의 문서(옛 규칙에선 허용) 거부', () => assertFails(addDoc(C(alice()), { q: 1 })));
  test('하위 컬렉션 생성 거부', () => assertFails(addDoc(collection(alice().firestore(), 'ai_interview', 'i1', 'sub'), sosPayload('alice'))));
  test('일반회원 본인 문서 수정 거부', () => assertFails(updateDoc(doc(alice().firestore(), 'ai_interview', 'i1'), { status: '답변완료' })));
  test('일반회원 본인 문서 삭제 거부', () => assertFails(deleteDoc(doc(alice().firestore(), 'ai_interview', 'i1'))));
  test('일반회원 본인 문서 읽기 거부(기존과 같음)', () => assertFails(getDoc(doc(alice().firestore(), 'ai_interview', 'i1'))));
  test('관리자 임의 필드 생성 허용', () => assertSucceeds(addDoc(C(admin()), { question: 'q', status: '인터뷰중', turns: [] })));
  test('관리자 SOS 형식 생성 허용', () => assertSucceeds(addDoc(C(admin()), sosPayload('alice'))));
  test('관리자 수정·삭제 허용', async () => {
    await assertSucceeds(updateDoc(doc(admin().firestore(), 'ai_interview', 'i1'), { adminAnswer: '답변', status: '답변완료' }));
    await assertSucceeds(deleteDoc(doc(admin().firestore(), 'ai_interview', 'i1')));
  });
});

// ───────────── SOS 하루 횟수 기록 sosUsage — 서버만 (2026-10-21) ─────────────
describe('sosUsage', () => {
  const U = c => doc(c.firestore(), 'sosUsage', 'alice');
  beforeEach(() => env.withSecurityRulesDisabled(c => setDoc(U(c), { date: '2026-10-21', count: 1 })));
  test('회원 본인 읽기 거부', () => assertFails(getDoc(U(alice()))));
  test('회원 본인 쓰기(횟수 되돌리기) 거부', () => assertFails(setDoc(U(alice()), { date: '2026-10-21', count: 0 })));
  test('회원 본인 삭제 거부', () => assertFails(deleteDoc(U(alice()))));
  test('회원 문서 없을 때 생성 거부', () => assertFails(setDoc(doc(bob().firestore(), 'sosUsage', 'bob'), { date: '2026-10-21', count: 0 })));
  test('다른 회원 읽기 거부', () => assertFails(getDoc(doc(bob().firestore(), 'sosUsage', 'alice'))));
  test('비로그인 읽기 거부', () => assertFails(getDoc(U(anon()))));
  test('관리자 브라우저 읽기·쓰기도 거부(서버 Admin SDK 만)', async () => {
    await assertFails(getDoc(U(admin())));
    await assertFails(setDoc(U(admin()), { date: '2026-10-21', count: 0 }));
  });
});


// ───────────── 4단계: 전문가 질문은 서버만 쓴다 ─────────────
describe('4단계 ai_coaching·expertUsage', () => {
  const oldAdd = c => addDoc(collection(c.firestore(), 'ai_coaching'), { userId: 'alice', question: 'q', videoData: null, status: '대기중',
    masterFeedback: '', finalAiResponse: '', viewed: false, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
  test('회원 ai_coaching 직접 생성(예전 ai.html 코드) 거부', () => assertFails(oldAdd(alice())));
  test('비로그인 ai_coaching 생성 거부', () => assertFails(addDoc(collection(anon().firestore(), 'ai_coaching'), { userId: 'x' })));
  test('회원 ai_coaching 본인 읽기 유지', () => assertSucceeds(getDoc(doc(alice().firestore(), 'ai_coaching', 'c-alice'))));
  test('회원 ai_coaching 본인 목록(받은함 where userId) 유지', () => assertSucceeds(getDocs(query(collection(alice().firestore(), 'ai_coaching'), where('userId', '==', 'alice')))));
  test('회원 ai_coaching 읽음 표시(viewed) 수정 유지', () => assertSucceeds(updateDoc(doc(alice().firestore(), 'ai_coaching', 'c-alice'), { viewed: true })));
  test('회원 ai_coaching 다른 필드 수정 거부', () => assertFails(updateDoc(doc(alice().firestore(), 'ai_coaching', 'c-alice'), { status: '답변완료' })));
  test('타인 ai_coaching 읽기 거부', () => assertFails(getDoc(doc(bob().firestore(), 'ai_coaching', 'c-alice'))));
  test('관리자 ai_coaching 읽기·수정 유지', async () => {
    await assertSucceeds(getDocs(collection(admin().firestore(), 'ai_coaching')));
    await assertSucceeds(updateDoc(doc(admin().firestore(), 'ai_coaching', 'c-alice'), { status: '검토대기' }));
  });
  test('회원 expertUsage 본인 읽기 유지', () => assertSucceeds(getDoc(doc(alice().firestore(), 'expertUsage', 'alice'))));
  test('회원 expertUsage 본인 쓰기(예전 ai.html set) 거부', () => assertFails(setDoc(doc(alice().firestore(), 'expertUsage', 'alice'), { date: '2026-10-19', count: 0 })));
  test('회원 expertUsage 본인 삭제 거부', () => assertFails(deleteDoc(doc(alice().firestore(), 'expertUsage', 'alice'))));
  test('회원 expertUsage 문서 없을 때 생성 거부', () => assertFails(setDoc(doc(bob().firestore(), 'expertUsage', 'bob'), { date: '2026-10-19', count: 0 })));
  test('타인 expertUsage 읽기 거부', () => assertFails(getDoc(doc(bob().firestore(), 'expertUsage', 'alice'))));
  test('비로그인 expertUsage 읽기 거부', () => assertFails(getDoc(doc(anon().firestore(), 'expertUsage', 'alice'))));
});


// ───────────── 6단계: users 일부 보호 ─────────────
// ai.html doRegister() 의 프로필 저장(재시도 포함)과 같은 코드
async function signupCode(db, uid, email) {
  const profileData = { name: '홍길동', nickname: '길동', region: '서울', role: '수련생', purpose: '취미', level: '초보',
    athleteTypes: [], gym: '비회원 도장', email, emailVerified: false, createdAt: serverTimestamp() };
  try { await setDoc(doc(db, 'users', uid), profileData); }
  catch (e) { await new Promise(r => setTimeout(r, 200)); await setDoc(doc(db, 'users', uid), profileData); }
}
// ai.html onLoggedIn() 의 로그인 시 동기화
const loginMerge = (db, uid) => setDoc(doc(db, 'users', uid), { emailVerified: true }, { merge: true });
const U = (uid, email, verified) => env.authenticatedContext(uid, { email, email_verified: verified });
const DAY_AGO = new Date(Date.now() - 86400e3);
async function seedOld() {
  await env.withSecurityRulesDisabled(c => setDoc(doc(c.firestore(), 'users', 'old'), {
    name: '기존', nickname: '기존회원', email: 'old@example.com', emailVerified: false, createdAt: DAY_AGO,
    completedByAdmin: true, updatedAt: DAY_AGO, profileReminderCount: 1 }));
}
async function usersDoc(uid) { let v; await env.withSecurityRulesDisabled(async c => { const s = await getDoc(doc(c.firestore(), 'users', uid)); v = s.exists() ? s.data() : null; }); return v; }
describe('6단계 users', () => {
  test('가입 코드(11개 필드, 미인증 토큰) 통과', async () => {
    await assertSucceeds(signupCode(U('new1', 'new1@example.com', false).firestore(), 'new1', 'new1@example.com'));
    const d = await usersDoc('new1'); if (Object.keys(d).length !== 11 || d.emailVerified !== false) throw new Error(JSON.stringify(d));
  });
  test('가입 코드 — 입력 이메일 대소문자 섞임(Auth 는 소문자) 통과', () =>
    assertSucceeds(signupCode(U('new2', 'mixed.case@example.com', false).firestore(), 'new2', 'Mixed.Case@Example.com')));
  test('가입 재시도 — 첫 저장이 반영된 뒤 같은 코드로 다시 저장(5분 안) 통과', async () => {
    const db = U('new3', 'new3@example.com', false).firestore();
    await assertSucceeds(signupCode(db, 'new3', 'new3@example.com'));
    await assertSucceeds(signupCode(db, 'new3', 'new3@example.com'));
  });
  test('로그인 merge — 인증된 토큰 · 문서 있음 통과', async () => { await seedOld(); await assertSucceeds(loginMerge(U('old', 'old@example.com', true).firestore(), 'old')); });
  test('로그인 merge — 인증된 토큰 · 문서 없음(생성) 통과', () => assertSucceeds(loginMerge(U('nodoc', 'nodoc@example.com', true).firestore(), 'nodoc')));
  test('로그인 merge — 미인증 토큰 · 문서 있음 거부', async () => { await seedOld(); await assertFails(loginMerge(U('old', 'old@example.com', false).firestore(), 'old')); });
  test('로그인 merge — 미인증 토큰 · 문서 없음 거부', () => assertFails(loginMerge(U('nodoc2', 'nodoc2@example.com', false).firestore(), 'nodoc2')));
  test('로그인 merge — 이미 true 인 문서는 바뀌는 값이 없어 미인증 토큰도 통과', async () => {
    await env.withSecurityRulesDisabled(c => setDoc(doc(c.firestore(), 'users', 'vt'), { nickname: 'v', emailVerified: true }));
    await assertSucceeds(loginMerge(U('vt', 'vt@example.com', false).firestore(), 'vt'));
  });
  test('emailVerified false 쓰기 허용', async () => { await seedOld(); await assertSucceeds(updateDoc(doc(U('old', 'old@example.com', false).firestore(), 'users', 'old'), { emailVerified: false })); });
  test('emailVerified 에 true/false 외 값 거부', async () => { await seedOld(); await assertFails(updateDoc(doc(U('old', 'old@example.com', true).firestore(), 'users', 'old'), { emailVerified: 'yes' })); });
  test('서버 전용 필드 있는 기존 문서 — 회원이 닉네임만 수정 통과', async () => { await seedOld(); await assertSucceeds(updateDoc(doc(U('old', 'old@example.com', false).firestore(), 'users', 'old'), { nickname: '새닉' })); });
  test('서버 전용 필드 있는 기존 문서 — 회원 merge 저장(닉네임) 통과', async () => { await seedOld(); await assertSucceeds(setDoc(doc(U('old', 'old@example.com', false).firestore(), 'users', 'old'), { nickname: '새닉' }, { merge: true })); });
  for (const f of ['completedByAdmin', 'createdByAdmin', 'updatedAt', 'profileReminderSentAt', 'profileReminderCount']) {
    test(`서버 전용 필드 ${f} 생성 시 포함 거부`, () => assertFails(setDoc(doc(U('sf', 'sf@example.com', true).firestore(), 'users', 'sf'), { nickname: 'x', [f]: f === 'completedByAdmin' || f === 'createdByAdmin' ? true : 1 })));
    test(`서버 전용 필드 ${f} 수정 거부`, async () => { await seedOld(); await assertFails(updateDoc(doc(U('old', 'old@example.com', true).firestore(), 'users', 'old'), { [f]: f === 'completedByAdmin' || f === 'createdByAdmin' ? false : 2 })); });
  }
  test('서버 전용 필드 삭제(덮어쓰기로 빠짐) 거부', async () => { await seedOld(); await assertFails(setDoc(doc(U('old', 'old@example.com', true).firestore(), 'users', 'old'), { nickname: 'x' })); });
  test('다른 email 로 생성 거부', () => assertFails(signupCode(U('new4', 'new4@example.com', false).firestore(), 'new4', 'other@example.com')));
  test('다른 email 로 수정 거부', async () => { await seedOld(); await assertFails(updateDoc(doc(U('old', 'old@example.com', true).firestore(), 'users', 'old'), { email: 'evil@example.com' })); });
  test('createdAt 변경(가입 하루 뒤) 거부', async () => { await seedOld(); await assertFails(updateDoc(doc(U('old', 'old@example.com', true).firestore(), 'users', 'old'), { createdAt: serverTimestamp() })); });
  test('createdAt 임의 과거 값으로 변경 거부', async () => { await seedOld(); await assertFails(updateDoc(doc(U('old', 'old@example.com', true).firestore(), 'users', 'old'), { createdAt: new Date(0) })); });
  test('createdAt 임의 값으로 생성 거부', () => assertFails(setDoc(doc(U('new5', 'new5@example.com', false).firestore(), 'users', 'new5'), { nickname: 'x', createdAt: new Date(0) })));
  test('createdAt 없는 문서에 회원이 createdAt 추가 거부', async () => {
    await env.withSecurityRulesDisabled(c => setDoc(doc(c.firestore(), 'users', 'noc'), { emailVerified: true }));
    await assertFails(updateDoc(doc(U('noc', 'noc@example.com', true).firestore(), 'users', 'noc'), { createdAt: serverTimestamp() }));
  });
  test('타인 문서 생성 거부', () => assertFails(signupCode(U('bob', 'bob@example.com', true).firestore(), 'victim', 'bob@example.com')));
  test('타인 문서 수정 거부', async () => { await seedOld(); await assertFails(updateDoc(doc(U('bob', 'bob@example.com', true).firestore(), 'users', 'old'), { nickname: 'x' })); });
  test('비로그인 쓰기 거부', () => assertFails(setDoc(doc(anon().firestore(), 'users', 'x'), { nickname: 'x' })));
  test('관리자 회원 목록·단건 읽기 유지', async () => {
    await seedOld();
    await assertSucceeds(getDocs(collection(admin().firestore(), 'users')));
    await assertSucceeds(getDoc(doc(admin().firestore(), 'users', 'old')));
  });
  test('본인 읽기 유지 · 타인 읽기 거부', async () => {
    await seedOld();
    await assertSucceeds(getDoc(doc(U('old', 'old@example.com', false).firestore(), 'users', 'old')));
    await assertFails(getDoc(doc(U('bob', 'bob@example.com', true).firestore(), 'users', 'old')));
  });
});

// ─────────── 관리자 화면 작업 (admin.html·voice.html·motion.html 의 직접 Firestore 호출) ───────────
// 관리 화면이 브라우저에서 직접 하는 읽기·쓰기 전부. API(Admin SDK) 경유 작업
// (회원 정지/삭제, 코칭 지식 확정·보류, 인터뷰 진행, 퀴즈 등)은 규칙 영향 없음.
describe('관리자 화면 작업 회귀', () => {
  const A = () => admin().firestore();
  test('세미나 목록 (orderBy date)', () => assertSucceeds(getDocs(query(collection(A(), 'schedules'), orderBy('date', 'desc')))));
  test('세미나 같은 날짜 조회 (중복 경고)', () => assertSucceeds(getDocs(query(collection(A(), 'schedules'), where('date', '==', '2026-11-20')))));
  test('세미나 단건 읽기', () => assertSucceeds(getDoc(doc(A(), 'schedules', 's1'))));
  test('세미나 추가', () => assertSucceeds(addDoc(collection(A(), 'schedules'), { date: '2026-11-20', title: 't', detail: 'd', type: 'upcoming', createdAt: new Date().toISOString() })));
  test('세미나 수정', () => assertSucceeds(updateDoc(doc(A(), 'schedules', 's1'), { title: '수정', updatedAt: new Date().toISOString() })));
  test('세미나 삭제', () => assertSucceeds(deleteDoc(doc(A(), 'schedules', 's1'))));
  test('도장 목록', () => assertSucceeds(getDocs(query(collection(A(), 'locations'), orderBy('order', 'asc')))));
  test('도장 추가', () => assertSucceeds(addDoc(collection(A(), 'locations'), { name: 'x', order: 29 })));
  test('도장 삭제', () => assertSucceeds(deleteDoc(doc(A(), 'locations', 'l1'))));
  test('회원 목록 (users 전체)', () => assertSucceeds(getDocs(collection(A(), 'users'))));
  test('AI 사용량 목록 (aiUsage 전체)', () => assertSucceeds(getDocs(collection(A(), 'aiUsage'))));
  test('코칭 관리 목록 (ai_coaching 전체)', () => assertSucceeds(getDocs(collection(A(), 'ai_coaching'))));
  test('코칭 단건 읽기', () => assertSucceeds(getDoc(doc(A(), 'ai_coaching', 'c-alice'))));
  test('인터뷰·SOS 목록 (ai_interview 전체)', () => assertSucceeds(getDocs(collection(A(), 'ai_interview'))));
  test('인터뷰 문서 수정', () => assertSucceeds(updateDoc(doc(A(), 'ai_interview', 'i1'), { status: '답변완료' })));
  test('인터뷰 문서 생성', () => assertSucceeds(addDoc(collection(A(), 'ai_interview'), { question: 'q', status: '인터뷰중' })));
  test('음성 초안 목록 (where status)', () => assertSucceeds(getDocs(query(collection(A(), 'voice_drafts'), where('status', '==', 'draft')))));
  test('음성 초안 제출 처리', () => assertSucceeds(updateDoc(doc(A(), 'voice_drafts', 'v1'), { status: 'submitted' })));
  test('품질 비교 질문 목록·추가·삭제', async () => {
    await assertSucceeds(getDocs(collection(A(), 'comparison_questions')));
    await assertSucceeds(addDoc(collection(A(), 'comparison_questions'), { question: 'q2' }));
    await assertSucceeds(deleteDoc(doc(A(), 'comparison_questions', 'cq1')));
  });
  test('품질 비교 결과 추가·목록', async () => {
    await assertSucceeds(addDoc(collection(A(), 'comparison_results'), { a: 1 }));
    await assertSucceeds(getDocs(collection(A(), 'comparison_results')));
  });
  test('동작 분석 저장·읽기·수정 (movement_data)', async () => {
    await assertSucceeds(addDoc(collection(A(), 'movement_data'), { x: 2 }));
    await assertSucceeds(getDoc(doc(A(), 'movement_data', 'm1')));
    await assertSucceeds(updateDoc(doc(A(), 'movement_data', 'm1'), { ai_feedback: 'f' }));
  });
  test('코칭 지식 직접 읽기·쓰기', async () => {
    await assertSucceeds(getDocs(collection(A(), 'coaching_knowledge')));
    await assertSucceeds(updateDoc(doc(A(), 'coaching_knowledge', 'k1'), { status: 'superseded' }));
  });
});

// ───────────────────────────── Storage ─────────────────────────────
// 2026-10-20 보강: 공개 폴더 관리자 업로드는 이미지·10MB 미만, list 는 gallery/ 만,
// SOS 는 sos_videos/{uid}/{ai_interview 문서 ID}.mp4 생성만(문서 교차 확인), 관리자는 email_verified 필요.
const PUBLIC_DIRS = ['assets', 'center', 'gallery', 'guide', 'logos', 'staff'];
const SOS = {
  ok:      'SosAliceOk0000000001', // alice, sos, 대기중, videoPath = 이 경로
  ok2:     'SosAliceOk0000000002', // 위와 같음(mov 용)
  ok3:     'SosAliceOk0000000003', // 위와 같음(재업로드 시험 전용)
  big:     'SosAliceBig000000001', // 용량 경계 시험용
  exists:  'SosAliceHasFile00001', // 이미 영상 파일이 있는 문서 (덮어쓰기 시험)
  bob:     'SosBobOk000000000001', // bob 의 문서
  done:    'SosAliceDone00000001', // alice, status 답변완료
  noPath:  'SosAliceNoPath000001', // alice, videoPath ''
  scen:    'SosAliceScenario0001', // alice, trackType scenario
  missing: 'SosMissingDoc0000001', // 문서 없음
};
const sosPath = (uid, id) => `sos_videos/${uid}/${id}.mp4`;
async function seedSosDocs() {
  await env.withSecurityRulesDisabled(async (ctx) => {
    const db = ctx.firestore();
    const put = (id, uid, extra = {}) => setDoc(doc(db, 'ai_interview', id),
      { ...sosPayload(uid), createdAt: new Date(), updatedAt: new Date(), videoPath: sosPath(uid, id), ...extra });
    await put(SOS.ok, 'alice');
    await put(SOS.ok2, 'alice');
    await put(SOS.ok3, 'alice');
    await put(SOS.big, 'alice');
    await put(SOS.exists, 'alice');
    await put(SOS.bob, 'bob');
    await put(SOS.done, 'alice', { status: '답변완료' });
    await put(SOS.noPath, 'alice', { videoPath: '' });
    await put(SOS.scen, 'alice', { trackType: 'scenario' });
    await uploadBytes(ref(ctx.storage(), sosPath('alice', SOS.exists)), bytes(10), { contentType: 'video/mp4' });
  });
}
const vid = (c, path, n = 1024, type = 'video/mp4') => uploadBytes(ref(c.storage(), path), bytes(n), { contentType: type });

describe('Storage 공개 이미지 폴더', () => {
  for (const p of PUBLIC_DIRS) {
    test(`${p}/ 비로그인 파일 읽기 허용`, () => assertSucceeds(getMetadata(ref(anon().storage(), `${p}/seed.png`))));
    test(`${p}/ 일반회원 파일 읽기 허용`, () => assertSucceeds(getMetadata(ref(alice().storage(), `${p}/seed.png`))));
    test(`${p}/ 비로그인 업로드 거부`, () => assertFails(uploadBytes(ref(anon().storage(), `${p}/x.png`), bytes(10), { contentType: 'image/png' })));
    test(`${p}/ 일반회원 업로드 거부`, () => assertFails(uploadBytes(ref(alice().storage(), `${p}/x.png`), bytes(10), { contentType: 'image/png' })));
    test(`${p}/ 관리자 이미지 업로드 허용`, () => assertSucceeds(uploadBytes(ref(admin().storage(), `${p}/x.png`), bytes(10), { contentType: 'image/png' })));
    test(`${p}/ 관리자 기존 이미지 교체 허용`, () => assertSucceeds(uploadBytes(ref(admin().storage(), `${p}/seed.png`), bytes(20), { contentType: 'image/webp' })));
    test(`${p}/ 관리자 비이미지(text/html) 업로드 거부`, () => assertFails(uploadBytes(ref(admin().storage(), `${p}/x.html`), bytes(10), { contentType: 'text/html' })));
    test(`${p}/ 관리자 비이미지(application/pdf) 업로드 거부`, () => assertFails(uploadBytes(ref(admin().storage(), `${p}/x.pdf`), bytes(10), { contentType: 'application/pdf' })));
    test(`${p}/ 미인증 관리자 이메일 업로드 거부`, () => assertFails(uploadBytes(ref(fakeAdmin().storage(), `${p}/x.png`), bytes(10), { contentType: 'image/png' })));
    test(`${p}/ 일반회원 삭제 거부`, () => assertFails(deleteObject(ref(alice().storage(), `${p}/seed.png`))));
    test(`${p}/ 비로그인 삭제 거부`, () => assertFails(deleteObject(ref(anon().storage(), `${p}/seed.png`))));
    test(`${p}/ 미인증 관리자 이메일 삭제 거부`, () => assertFails(deleteObject(ref(fakeAdmin().storage(), `${p}/seed.png`))));
    test(`${p}/ 관리자 삭제 허용`, () => assertSucceeds(deleteObject(ref(admin().storage(), `${p}/seed.png`))));
  }
  // 에뮬레이터는 단일 요청 본문 크기를 제한하므로 큰 파일은 분할(resumable) 업로드로 보낸다.
  test('logos/ 관리자 10MB 미만 이미지 허용', () => assertSucceeds(uploadBytesResumable(ref(admin().storage(), 'logos/near10.png'), bytes(10 * MB - 1), { contentType: 'image/png' })));
  test('logos/ 관리자 10MB 이미지 거부', () => assertFails(uploadBytesResumable(ref(admin().storage(), 'logos/ten.png'), bytes(10 * MB), { contentType: 'image/png' })));
  test('gallery/ 관리자 10MB 초과 이미지 거부', () => assertFails(uploadBytesResumable(ref(admin().storage(), 'gallery/big.jpg'), bytes(12 * MB), { contentType: 'image/jpeg' })));
  // 목록 조회는 gallery/ 만 (gallery.html·리뉴얼 전 index.html listAll)
  test('gallery/ 비로그인 목록 조회 허용', () => assertSucceeds(listAll(ref(anon().storage(), 'gallery/'))));
  test('gallery/ 일반회원 목록 조회 허용', () => assertSucceeds(listAll(ref(alice().storage(), 'gallery/'))));
  for (const p of PUBLIC_DIRS.filter(d => d !== 'gallery')) {
    test(`${p}/ 비로그인 목록 조회 거부`, () => assertFails(listAll(ref(anon().storage(), `${p}/`))));
    test(`${p}/ 관리자 목록 조회도 거부 (코드에 없음)`, () => assertFails(listAll(ref(admin().storage(), `${p}/`))));
  }
});

describe('Storage SOS 영상', () => {
  beforeEach(seedSosDocs);
  // 정상 흐름 — motion-legacy.html: 문서 생성 → 같은 ID 경로로 업로드
  test('본인 문서(대기중) 경로로 mp4 업로드 허용', () => assertSucceeds(vid(alice(), sosPath('alice', SOS.ok))));
  test('본인 문서 경로로 mov(video/quicktime) 업로드 허용', () => assertSucceeds(vid(alice(), sosPath('alice', SOS.ok2), 1024, 'video/quicktime')));
  test('클라이언트 흐름 그대로: 서버(Admin SDK)가 문서 생성 → 회원이 같은 ID 경로 업로드 허용', async () => {
    const id = 'ServerFlowDoc0000001';
    // manage-member submit-sos 가 만드는 문서와 같은 필드(서버 시각)
    await env.withSecurityRulesDisabled(c => setDoc(doc(c.firestore(), 'ai_interview', id), sosPayload('alice', { videoPath: sosPath('alice', id) })));
    await assertSucceeds(vid(alice(), sosPath('alice', id)));
    await assertFails(vid(alice(), sosPath('alice', id)));   // 같은 경로 재업로드(덮어쓰기)는 거부
  });
  test('서버 문서라도 남의 uid 폴더 업로드 거부', async () => {
    const id = 'ServerFlowDoc0000002';
    await env.withSecurityRulesDisabled(c => setDoc(doc(c.firestore(), 'ai_interview', id), sosPayload('alice', { videoPath: sosPath('alice', id) })));
    await assertFails(vid(bob(), sosPath('bob', id)));
    await assertFails(vid(bob(), sosPath('alice', id)));
  });
  // 이메일 인증 (2026-10-21)
  test('이메일 미인증 토큰 — 본인 문서(대기중) 경로라도 업로드 거부', () => assertFails(vid(aliceUnverified(), sosPath('alice', SOS.ok))));
  test('email_verified 없는 토큰 — 업로드 거부', () => assertFails(vid(aliceNoClaim(), sosPath('alice', SOS.ok))));
  test('이메일 미인증 토큰 — 본인 파일 읽기는 허용(기존과 같음)', () => assertSucceeds(getMetadata(ref(aliceUnverified().storage(), sosPath('alice', SOS.exists)))));
  // 교차 규칙 거부
  test('문서 없는 업로드 거부', () => assertFails(vid(alice(), sosPath('alice', SOS.missing))));
  test('남의 문서 ID 로 내 폴더에 업로드 거부', () => assertFails(vid(alice(), sosPath('alice', SOS.bob))));
  test('남의 폴더·남의 문서로 업로드 거부', () => assertFails(vid(alice(), sosPath('bob', SOS.bob))));
  test('남(bob)이 내 폴더·내 문서로 업로드 거부', () => assertFails(vid(bob(), sosPath('alice', SOS.ok))));
  test('답변완료 문서로 업로드 거부', () => assertFails(vid(alice(), sosPath('alice', SOS.done))));
  test('videoPath 가 빈 문서로 업로드 거부', () => assertFails(vid(alice(), sosPath('alice', SOS.noPath))));
  test('SOS 가 아닌 문서(scenario)로 업로드 거부', () => assertFails(vid(alice(), sosPath('alice', SOS.scen))));
  test('비로그인 업로드 거부', () => assertFails(vid(anon(), sosPath('alice', SOS.ok))));
  test('관리자도 클라이언트 업로드 거부 (서버 Admin SDK 전용)', () => assertFails(vid(admin(), sosPath('alice', SOS.ok))));
  // 경로·형식·크기
  test('파일명이 문서 ID 형식이 아니면 거부', () => assertFails(vid(alice(), 'sos_videos/alice/v.mp4')));
  test('확장자 .mov 경로 거부 (항상 .mp4)', () => assertFails(vid(alice(), `sos_videos/alice/${SOS.ok}.mov`)));
  test('하위 폴더 거부', () => assertFails(vid(alice(), `sos_videos/alice/sub/${SOS.ok}.mp4`)));
  test('비영상 형식 거부', () => assertFails(vid(alice(), sosPath('alice', SOS.ok), 10, 'application/json')));
  test('200MB 거부 (상한 200MB 미만)', () => assertFails(uploadBytesResumable(ref(alice().storage(), sosPath('alice', SOS.big)), bytes(200 * MB), { contentType: 'video/mp4' })));
  test('200MB 미만 대용량 허용', () => assertSucceeds(uploadBytesResumable(ref(alice().storage(), sosPath('alice', SOS.big)), bytes(200 * MB - 1), { contentType: 'video/mp4' })));
  // 덮어쓰기·삭제
  test('이미 있는 영상 덮어쓰기 거부', () => assertFails(vid(alice(), sosPath('alice', SOS.exists))));
  test('업로드 성공 후 같은 경로 재업로드 거부', async () => {
    await assertSucceeds(vid(alice(), sosPath('alice', SOS.ok3)));
    await assertFails(vid(alice(), sosPath('alice', SOS.ok3)));
  });
  test('본인 영상 삭제 거부', () => assertFails(deleteObject(ref(alice().storage(), sosPath('alice', SOS.exists)))));
  test('타인 영상 삭제 거부', () => assertFails(deleteObject(ref(bob().storage(), sosPath('alice', SOS.exists)))));
  test('비로그인 삭제 거부', () => assertFails(deleteObject(ref(anon().storage(), sosPath('alice', SOS.exists)))));
  test('관리자 클라이언트 삭제 거부 (서버 Admin SDK 가 삭제)', () => assertFails(deleteObject(ref(admin().storage(), sosPath('alice', SOS.exists)))));
  // 읽기
  test('본인 읽기 허용', () => assertSucceeds(getMetadata(ref(alice().storage(), sosPath('alice', SOS.exists)))));
  test('관리자 읽기 허용', () => assertSucceeds(getMetadata(ref(admin().storage(), sosPath('alice', SOS.exists)))));
  test('타인 읽기 거부', () => assertFails(getMetadata(ref(bob().storage(), sosPath('alice', SOS.exists)))));
  test('비로그인 읽기 거부', () => assertFails(getMetadata(ref(anon().storage(), sosPath('alice', SOS.exists)))));
  test('미인증 관리자 이메일 읽기 거부', () => assertFails(getMetadata(ref(fakeAdmin().storage(), sosPath('alice', SOS.exists)))));
  // 목록
  test('본인 폴더 목록 조회 거부', () => assertFails(listAll(ref(alice().storage(), 'sos_videos/alice/'))));
  test('관리자 전체 목록 조회 거부', () => assertFails(listAll(ref(admin().storage(), 'sos_videos/'))));
  test('타인 폴더 목록 조회 거부', () => assertFails(listAll(ref(bob().storage(), 'sos_videos/alice/'))));
});

describe('Storage 동작 분석·기타 경로', () => {
  test('movement_videos 비로그인 읽기 거부', () => assertFails(getMetadata(ref(anon().storage(), 'movement_videos/m1.mp4'))));
  test('movement_videos 일반회원 읽기 거부', () => assertFails(getMetadata(ref(alice().storage(), 'movement_videos/m1.mp4'))));
  test('movement_videos 관리자 읽기 허용', () => assertSucceeds(getMetadata(ref(admin().storage(), 'movement_videos/m1.mp4'))));
  test('movement_videos 미인증 관리자 이메일 읽기 거부', () => assertFails(getMetadata(ref(fakeAdmin().storage(), 'movement_videos/m1.mp4'))));
  test('movement_videos 일반회원 쓰기 거부', () => assertFails(uploadBytes(ref(alice().storage(), 'movement_videos/x.mp4'), bytes(10), { contentType: 'video/mp4' })));
  test('movement_landmarks 일반회원 쓰기 거부', () => assertFails(uploadBytes(ref(alice().storage(), 'movement_landmarks/x.json'), bytes(10), { contentType: 'application/json' })));
  test('movement_videos 관리자 쓰기 허용', () => assertSucceeds(uploadBytes(ref(admin().storage(), 'movement_videos/x.mp4'), bytes(10), { contentType: 'video/mp4' })));
  test('movement_landmarks 관리자 쓰기 허용 (gzip)', () => assertSucceeds(uploadBytes(ref(admin().storage(), 'movement_landmarks/x.json.gz'), bytes(10), { contentType: 'application/gzip' })));
  test('movement_videos 미인증 관리자 이메일 쓰기 거부', () => assertFails(uploadBytes(ref(fakeAdmin().storage(), 'movement_videos/x.mp4'), bytes(10), { contentType: 'video/mp4' })));
  test('지정되지 않은 경로 쓰기 거부 (관리자 포함)', () => assertFails(uploadBytes(ref(admin().storage(), 'other/x.png'), bytes(10), { contentType: 'image/png' })));
  test('지정되지 않은 경로 읽기 거부 (관리자 포함)', async () => {
    await env.withSecurityRulesDisabled(c => uploadBytes(ref(c.storage(), 'other/seed.png'), bytes(10), { contentType: 'image/png' }));
    await assertFails(getMetadata(ref(admin().storage(), 'other/seed.png')));
    await assertFails(getMetadata(ref(anon().storage(), 'other/seed.png')));
  });
});
