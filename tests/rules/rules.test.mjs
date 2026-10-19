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
const alice = () => env.authenticatedContext('alice', { email: 'alice@example.com' });
const bob = () => env.authenticatedContext('bob', { email: 'bob@example.com' });
const admin = () => env.authenticatedContext('admin', { email: ADMIN_EMAIL });

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
  test('ai_interview 일반회원 생성 허용', () => assertSucceeds(addDoc(collection(alice().firestore(), 'ai_interview'), { q: 1 })));
  test('ai_interview 일반회원 읽기 거부', () => assertFails(getDocs(collection(alice().firestore(), 'ai_interview'))));
  test('ai_interview 관리자 읽기 허용', () => assertSucceeds(getDocs(collection(admin().firestore(), 'ai_interview'))));
  test('ai_coaching 본인 생성 허용', () => assertSucceeds(addDoc(collection(alice().firestore(), 'ai_coaching'), { userId: 'alice' })));
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
describe('Storage', () => {
  for (const p of ['assets', 'center', 'gallery', 'guide', 'logos', 'staff']) {
    test(`${p}/ 비로그인 읽기 허용`, () => assertSucceeds(getMetadata(ref(anon().storage(), `${p}/seed.png`))));
    test(`${p}/ 일반회원 쓰기 거부`, () => assertFails(uploadBytes(ref(alice().storage(), `${p}/x.png`), bytes(10), { contentType: 'image/png' })));
    test(`${p}/ 관리자 쓰기 허용`, () => assertSucceeds(uploadBytes(ref(admin().storage(), `${p}/x.png`), bytes(10), { contentType: 'image/png' })));
  }
  test('logos/ 일반회원 삭제 거부', () => assertFails(deleteObject(ref(alice().storage(), 'logos/seed.png'))));
  test('logos/ 관리자 삭제 허용 (admin.html 도장 삭제)', () => assertSucceeds(deleteObject(ref(admin().storage(), 'logos/seed.png'))));
  test('gallery/ 비로그인 목록 조회 허용', () => assertSucceeds(listAll(ref(anon().storage(), 'gallery/'))));
  test('sos_videos 본인 영상 업로드 허용', () => assertSucceeds(uploadBytes(ref(alice().storage(), 'sos_videos/alice/v.mp4'), bytes(1024), { contentType: 'video/mp4' })));
  test('sos_videos 본인 mov 업로드 허용', () => assertSucceeds(uploadBytes(ref(alice().storage(), 'sos_videos/alice/v2.mp4'), bytes(1024), { contentType: 'video/quicktime' })));
  test('sos_videos 타인 폴더 업로드 거부', () => assertFails(uploadBytes(ref(bob().storage(), 'sos_videos/alice/v.mp4'), bytes(1024), { contentType: 'video/mp4' })));
  test('sos_videos 비로그인 업로드 거부', () => assertFails(uploadBytes(ref(anon().storage(), 'sos_videos/alice/v.mp4'), bytes(1024), { contentType: 'video/mp4' })));
  test('sos_videos 비영상 형식 거부', () => assertFails(uploadBytes(ref(alice().storage(), 'sos_videos/alice/a.json'), bytes(10), { contentType: 'application/json' })));
  // 에뮬레이터는 단일 요청 본문 크기를 제한하므로 실제 앱과 같은 분할(resumable) 업로드로 보낸다.
  test('sos_videos 상한(250MB) 초과 거부', () => assertFails(uploadBytesResumable(ref(alice().storage(), 'sos_videos/alice/big.mp4'), bytes(250 * MB + 1), { contentType: 'video/mp4' })));
  test('sos_videos 상한 이하 대용량(200MB) 허용', () => assertSucceeds(uploadBytesResumable(ref(alice().storage(), 'sos_videos/alice/ok200.mp4'), bytes(200 * MB), { contentType: 'video/mp4' })));
  test('sos_videos 본인 읽기 허용', () => assertSucceeds(getMetadata(ref(alice().storage(), 'sos_videos/alice/seed.mp4'))));
  test('sos_videos 관리자 읽기 허용', () => assertSucceeds(getMetadata(ref(admin().storage(), 'sos_videos/alice/seed.mp4'))));
  test('sos_videos 타인 읽기 거부', () => assertFails(getMetadata(ref(bob().storage(), 'sos_videos/alice/seed.mp4'))));
  test('movement_videos 일반회원 읽기 거부', () => assertFails(getMetadata(ref(alice().storage(), 'movement_videos/m1.mp4'))));
  test('movement_videos 일반회원 쓰기 거부', () => assertFails(uploadBytes(ref(alice().storage(), 'movement_videos/x.mp4'), bytes(10), { contentType: 'video/mp4' })));
  test('movement_landmarks 일반회원 쓰기 거부', () => assertFails(uploadBytes(ref(alice().storage(), 'movement_landmarks/x.json'), bytes(10), { contentType: 'application/json' })));
  test('movement_videos 관리자 쓰기 허용', () => assertSucceeds(uploadBytes(ref(admin().storage(), 'movement_videos/x.mp4'), bytes(10), { contentType: 'video/mp4' })));
  test('movement_landmarks 관리자 쓰기 허용 (gzip)', () => assertSucceeds(uploadBytes(ref(admin().storage(), 'movement_landmarks/x.json.gz'), bytes(10), { contentType: 'application/gzip' })));
  test('지정되지 않은 경로 거부 (관리자 포함)', () => assertFails(uploadBytes(ref(admin().storage(), 'other/x.png'), bytes(10), { contentType: 'image/png' })));
});
