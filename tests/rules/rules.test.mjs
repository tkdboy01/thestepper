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
  query, where, orderBy, serverTimestamp,
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
  test('stats 비로그인 쓰기 허용 (방문자 카운터)', () => assertSucceeds(setDoc(doc(anon().firestore(), 'stats', 'visitors'), { count: 1 })));
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
  test('coaching_knowledge 로그인 읽기 허용', () => assertSucceeds(getDocs(collection(alice().firestore(), 'coaching_knowledge'))));
  test('quiz_questions confirmed 비로그인 읽기 허용', () => assertSucceeds(getDoc(doc(anon().firestore(), 'quiz_questions', 'confirmed1'))));
  test('quiz_questions draft 비로그인 읽기 거부', () => assertFails(getDoc(doc(anon().firestore(), 'quiz_questions', 'draft1'))));
  test('movement_data 일반회원 거부', () => assertFails(getDoc(doc(alice().firestore(), 'movement_data', 'm1'))));
  test('movement_data 관리자 허용', () => assertSucceeds(getDoc(doc(admin().firestore(), 'movement_data', 'm1'))));
  test('voice_drafts 일반회원 거부', () => assertFails(getDocs(collection(alice().firestore(), 'voice_drafts'))));
  test('voice_drafts 관리자 허용', () => assertSucceeds(getDocs(collection(admin().firestore(), 'voice_drafts'))));
  test('comparison_results 관리자 쓰기 허용', () => assertSucceeds(addDoc(collection(admin().firestore(), 'comparison_results'), { a: 1 })));
  test('user_messages 생성 거부', () => assertFails(addDoc(collection(alice().firestore(), 'user_messages'), { userId: 'alice' })));
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
