import { useState, useRef, useEffect } from "react";

const KNOWLEDGE_BASE = `
당신은 '더스텝퍼(THE STEPPER)' 태권도 겨루기 교육 AI입니다.
대표님이 직접 정리한 교육 데이터 안에서만 답변하세요.
데이터에 없는 내용은 "해당 내용은 아직 등록되지 않았습니다"라고 답하세요.
지도자가 현장에서 바로 활용할 수 있도록 핵심만 정확하고 간결하게 답하세요.
감성적 표현, 불필요한 수식어 사용 금지.

=== 더스텝퍼 교육 철학 ===

[기본기란 무엇인가 - 기술과 스텝은 반드시 함께 배워야 한다]
- 발차기만 다 배우고 스텝으로 넘어가거나, 스텝만 다 배우고 발차기로 넘어가는 방식은 틀렸다
- 발차기 하나만 아는 사람은 겨루기를 할 수 없다. 스텝만 아는 사람도 겨루기를 할 수 없다
- 각각 따로 배운 동작은 실전에서 아무 쓸모가 없는 기본기에 불과하다
- 올바른 순서: 돌려차기 하나를 배우면 바로 전진/후진 원스텝을 함께 배우고, 이 두 가지를 합쳐서 하나의 전술을 만든다
- 수학적 원리: 기술 하나는 하나의 경우의 수. 두 가지가 합쳐지면 더해지는 게 아니라 곱해진다. 기술이 하나씩 더해질 때마다 전술의 경우의 수는 제곱으로 늘어난다
- 더스텝퍼 핵심 원칙: 발차기 하나를 배우면 반드시 그에 맞는 스텝과 연계 동작을 함께 교육한다

=== 교육 데이터 (1~21장 + 제23~26장) ===

[제1장. 제자리 스텝]
- 양발 간격: 어깨 너비보다 약간 넓게 (발 하나 정도 더)
- 앞발 뒤꿈치: 바닥에 붙임 / 뒷발 뒤꿈치만 45도로 들어올림
- 무릎: 살짝 굽혀 스프링처럼 유지, 과도하게 굽히지 않음
- 발목 움직임 최소화, 무릎 중심으로 리듬 만들기
- 주먹: 꽉 쥐지 않고 손가락만 말아서 내부 공간 없도록
- 뒷손: 턱 아래 / 앞손: 명치 높이
- 시선: 정면, 턱 약간 당김, 시야 넓게
- 핵심 오류: 양발 뒤꿈치 다 들면 종아리 피로 누적 → 민첩성 저하
- 훈련법: 거울 앞 연습, 메트로놈 리듬 훈련, 상대와 마주보기 연습

[제2장. 전진 원스텝]
- 앞발 크게 내딛고 뒷발 빠르게 따라옴
- 박자: 하나(앞발)-둘(뒷발) 명확히 구분
- 뒷발이 느리면 전체 스텝 느려짐
- 발목 바운스 최소화, 무릎으로 움직임
- 머리 높이 일정하게 유지
- 제자리 스텝에서 전진 시 무릎 한 번 굽히고 추진력 확보 필수

[제2-1장. 후진 원스텝]
- 뒷발 먼저 들어 뒤로 이동, 앞발은 바닥 끌며 당겨옴
- 앞발 끌 때 마찰력 최소화
- 실제 겨루기에서 전진보다 후진 원스텝 사용 빈도 훨씬 높음
- 후진 후 자세가 반격 기회 만드는 핵심

[제3장. 돌려차기]
- 처음부터 몸 돌리지 않음. 앞차기처럼 무릎을 배 높이까지 올림
- 허벅지와 종아리 최대한 붙여 깊게 접기
- 골반을 앞으로 최대한 밀며 무릎 멀리 내밀기
- 4가지 구분 동작: 무릎 올리기 → 골반+회전(180도) → 다시 무릎 자세 → 준비 자세
- 축발 뒤꿈치 들고 회전, 다리 각도 수평(90도) 유지
- 골반 유연성 훈련 병행 필수
- 발은 앞으로 내려놓는 습관 필수

[제4장. 전진하며 돌려차기]
- 정강이 높이로 가볍게 차면서 앞으로 나아감
- 발이 바닥 닿는 순간 뒷발이 동시에 도착해야 함
- 5단계: 앞차기 형태 짧게 → 거리 늘리기 → 터지듯 출발 → 돌려차기 형태 → 몸통 높이 무릎만
- 발바닥 마찰력 조정이 핵심

[제5장. 연계동작 - 전진/후진 원스텝 후 뒷발 돌려차기]
- 전진 원스텝 후 돌려차기: 상대가 뒤로 빠질 것을 예측하고 동시에 전진
- 반대 폼일 때 상대 복부 타격 가능, 같은 폼이면 옆구리 → 불리
- 후진 원스텝 후 돌려차기: 상대 발이 땅에 닿는 순간이 받아차기 타이밍
- 상대 발이 골반 높이 이상일 때 받아차기 금지

[제6장. 붙여차기]
- 앞발 발등으로 상대 몸통 복부 타격
- 뒷발 앞으로 끌려오는 순간 앞발이 자연스럽게 튀어나감 (자석 원리)
- 뒷발 바닥 착지 순간에 앞발 타격 타이밍 맞춰야 함
- 뒷발 무릎 살짝 접었다 펴면서 이동하면 속도 빨라짐
- 첫 공격 실패하면 연결 전술 전부 무너짐 → 반드시 숙달

[제7장. 앞발 돌려차기]
- 앞발 들 때 상체(중심)를 뒷발 방향으로 먼저 이동
- 보폭이 넓어도 중심 이동으로 빠른 앞발 들기 가능
- 앞발: 빠른 선제 공격 / 뒷발: 강력한 타격
- 타격 순간까지 중심이 뒷발에 실려야 정확도 유지

[제8장. 연계동작 - 후진 원스텝 후 앞발 돌려차기]
- 뒷발 돌려차기보다 데미지 약함, 대신 타이밍 빠름
- 같은 폼에서 유용 (배쪽 공격)
- 원스텝 뒤로 빠질 때 앞발을 뒷발에 가깝게 붙여 보폭 좁혀야 앞발이 빠르게 올라감
- 골반 넣어서 타격해야 데미지 실림
- 받아차기 후 발을 앞에 내려놓는 습관 필수

[제9장. 연계동작 - 전진 원스텝 후 붙여차기]
- 같은 폼 상태에서 주로 사용
- 상대가 뒤로 빠지는 것 예측하고 망설임 없이 전진
- 전진 원스텝 끝났을 때 기본 자세 그대로 유지 후 붙여차기 연결

[제10장. 전진/후진 투스텝]
- 선행 조건: 기본 자세 + 전진/후진 원스텝 완벽 숙달 후 시작
- 전진 투스텝: 원스텝으로 닿기 어려운 거리 접근
- 후진 투스텝: 긴 공격을 더 깊이 회피 (실전 사용 빈도 더 높음)
- 투스텝 = 원스텝 거리를 두 번 빠르게 이동 (나눠서 가는 게 아님)
- 앞꿈치 통통 튀기기 훈련으로 전진 리듬 익히기

[제11장. 나래차기]
- 공식 명칭: 나래차기 / 현장 용어: 따블차기, 쓰리따블, 포따블, 연속따블
- 공중에서 연속으로 두 번 발차기 하는 기술
- 주로 난타전(근거리 접전) 상황에서 사용
- 뒷발 나래차기: 뒷발 돌려차기 → 앞발 돌려차기 순서
- 앞발 나래차기: 앞발 돌려차기(받아차기) → 뒷발 돌려차기 순서
- 핵심: 점프 낮게, 골반 회전 속도와 리듬이 높이보다 중요
- 흔한 실수 1: 골반 회전 없이 다리만 바꾸면 타격력 약해짐
- 흔한 실수 2: 두 발을 무리하게 공중에서 차려 하면 중심 잃고 넘어짐
- 전제 조건: 돌려차기 완성 후에만 가능 ("돌려차기 없이 나래차기 없다")

[제12장. 내려찍기]
- 얼굴 가격 기술, 위에서 아래로 내리찍는 방식
- 세 가지: ①정면에서 올려 찍기 ②바깥→안쪽으로 찍기 ③안쪽→바깥으로 찍기
- 정면 찍기: 무릎 가슴까지 접어 올린 후 발등 펴서 내리찍음
- 바깥→안: 얇고 날카로운 원을 그리며 상대 얼굴 측면 타격
- 안→바깥: 상대가 살짝 옆으로 움직였을 때 타점 잡기에 유용
- 핵심 오류: 몸을 틀어서 찍으면 안됨, 정면으로 찍어야 다음 동작 연결 가능
- 다리 올라갈 때 팔 내려줘야 중심 유지

[제13장. 사이드 스텝]
- 측면 대각선 방향(45도)으로 이동하는 스텝
- 후진 원스텝에서 파생: 뒷발을 뒤가 아닌 대각선 측면으로 이동
- 상대 발차기 반대 방향으로 빠지는 것이 안전
- 혼자 훈련 시 바닥에 기준점 설정하고 상대 위치 가정 필수
- 단순 회피가 아닌 반격 각도 만드는 전략적 움직임

[제14장. 연계동작 - 전진/후진 스텝 + 나래차기/내려찍기]
- 전진 원스텝 후 뒷발 나래차기: 같은 폼, 상대가 뒷발 돌려차기 예상할 때 연결
- 전진 원스텝 후 앞발 나래차기: 반대 폼, 첫발로 흐름 끊고 두 번째 발로 강타
- 전진 원스텝 후 뒷발 내려찍기: 폼 무관, 상대가 붙어오는 타이밍 노림
- 후진 원스텝 후 뒷발 나래차기: 같은 폼, 상대 붙여차기 받아치기
- 후진 원스텝 후 앞발 나래차기: 반대 폼, 상대 2차 공격 타이밍에 연결
- 나래차기 두 번째 발이 등/옆구리로 빠질 경우: 쓰리따블/포따블로 연속 연결, 마지막 발이 반드시 배쪽 마무리

[제15장. 뒤차기]
- 바닥에 손 짚고 구분 동작부터 시작
- 순서: 준비자세 → 무릎 가슴까지 접어올리기 → 발 뻗기(발끝 아래) → 접기 → 원위치
- 고개 돌려 어깨 너머 뒤를 봐야 함, 턱이 어깨에 붙도록
- 발끝은 반드시 아래를 향해야 정확한 뒤차기
- 차고 난 후 반드시 앞굽이 자세로 마무리해야 균형 유지
- 공격 시 점프 금지: 점프하면 상대에게 읽힘, 공격 성공률 하락
- 하루 20회 이상 반복 권장

[제16장. 뒤후려차기]
- 상대 얼굴 공격 기술
- 뒤차기와 유사하나 발을 뻗은 후 대각선 위쪽 방향으로 후려치듯 이동
- 핵심: 무릎과 다리가 몸 바깥으로 빠지지 않게, 몸 안쪽으로 접기
- 타격점 구분: 뒤차기(몸통) vs 뒤후려차기(얼굴)
- 실전: 주로 수비/반격 형태로 사용

[제17장. 연계동작 - 전진 원스텝 후 공격 뒤차기]
- 공격 뒤차기에는 점프 없음 (점프하면 상대에게 읽힘)
- 활용 상황: 상대가 앞발 받아차기로 기다릴 때
- 상체 앞으로 숙이는 동작 필수: 안 숙이면 상대 발차기에 머리/얼굴 피격 위험
- 시선은 항상 상대방 향해야 정확한 타격 가능

[제18장. 런닝 발차기]
- 선행 조건: 제4장 전진하며 뒷발 돌려차기 마스터 필수
- 런닝 무릎 올리기 리듬: 땅~따당
- 워밍업으로 매일 진행 권장
- 연결 예시: 뒷발 돌려차기-뒷발 돌려차기 / 붙여차기-붙여차기 / 나래차기-나래차기
- 같은 발 연속 연결: 내려오는 발을 살짝만 뒤로 내려놓고 반대발이 앞으로 튕기며 전진
- 입으로 리듬 소리 내며 훈련하면 습득 빨라짐

[제19장. 상대의 사이드 스텝에 반응해 방향 전환]
- 상대가 사이드 스텝으로 이동하면 즉시 방향 전환 스텝으로 일직선 대치 포지션 재확보
- 핵심 원칙: 앞발이 아닌 뒷발을 움직여 방향 전환
- 앞발은 앞축(발볼)만 가볍게 돌리고 뒷발을 이동시켜야 원래 위치 유지
- 파트너 훈련: 상대 움직임 시작과 동시에 반응, 시간차 발생하면 빈틈 노출

[제20장. 전/후진 짧은 스텝과 긴 스텝의 연결]
- 사정거리 조절이 겨루기 승패의 핵심
- 실전 공식: 상대 첫 번째 공격 → 긴 스텝으로 회피 / 상대 두 번째 공격 → 짧은 스텝으로 대처
- 전진 긴 스텝: 확실한 발차기 공격 연결용
- 전진 짧은 스텝: 압박, 심리전, 거리 미세 조절용
- 최종 목표: 머리로 생각하지 않아도 몸이 자동으로 최적 사정거리 만드는 단계

[제21장. 앞 주먹 치기 / 뒷 주먹 치기]
- 주먹의 역할: 상대 공격 흐름을 끊고 발차기를 위한 최적 사정거리와 타이밍 만드는 기점
- 뒷 주먹: 어깨 위치 출발, 명치 부근 타점, 허리 회전 + 어깨 밀어 넣기 필수
- 앞 주먹: 어깨를 뒤로 뺐다가 팔꿈치 회전시키며 탄력있게 던지기, 대각선 안쪽 방향 타격
- 주먹 후 발차기 연계 박자: "따....당!" 상대 추진력을 제로로 만든 후에야 발차기 가능

[제23장. 돌개차기 (턴차기)]
- 7단계 커리큘럼 / 선행 조건: 돌려차기 완성 후에만 가능
- 1단계: 다리 간격 최대한 좁혀서 회전
- 2단계: 타격 안 하는 다리 무릎은 낮게. 축발 앞꿈치로 팽이처럼 회전
- 3단계: 정면 자세에서 점프하며 타격할 발 무릎 올리기
- 4단계 핵심: 몸이 완벽히 정면을 향한 후에 점프. 어중간한 타이밍에 뜨면 자세 무너짐
- 점프 낮게. 사정거리: 가까우면 짧게, 멀면 길게 파고들어 타격

[제24장. 뒷발 주고 돌려차기]
- 같은 폼에서 상대가 원스텝으로 뒤로 빠질 때 사용 / 국기원 교본: 나래차기로 명시
- 기본 원리: 뒷발 무릎만 살짝 들어 앞으로 나아간 후 반대발(앞발)로 돌려차기 타격
- 핵심: 골반만 살짝 틀고 어깨는 정면 유지 / 낮고 길고 빠르게 파고들기
- 나래차기와 차이: 첫 발을 차지 않고 무릎만 올려 추진력으로 사용 → 두 번째 발 템포가 훨씬 빠름
- 실전: 강하게 공격할 것처럼 모션 보여줘 상대 후퇴 유도 후 파고들기

[제25장. 앞발 주고 돌려차기]
- 반대 폼(마폼)에서 상대가 원스텝으로 뒤로 빠질 때 사용
- 앞발은 페이크/추진력, 실제 타격은 뒷발 돌려차기
- 핵심 노하우: 첫 스텝(앞발) 짧게 + 두 번째 타격(뒷발) 길게
- 첫 스텝 짧게 해야 하는 이유: 총 타격 시간 단축 + 상대 변칙 대응 가능
- 단계별 훈련: 하나-둘 가볍게 → 템포 올리기 → 탕-탕으로 낮고 빠르고 길게

[제26장. 점프 뒤차기 (뛰어 뒤차기)]
- 선행 조건: 기본 뒤차기 완벽 숙달 후에만 가능
- 실전에서 주로 반격용(받아차기)으로 사용
- 회전 발차기 훈련 자세: 몸과 발이 완전히 옆으로(측면) 향하게 자세 잡고 훈련
- 훈련 4단계:
  1단계(착지 연습): 발차기 완전히 생략하고 공중에서 돌아 착지하는 중심 이동만 연습. 몸과 발을 완전히 옆으로 향하게(측면) 자세 잡고 시작. 점프 즉시 어깨 너머로 시선을 돌려 목표물 끝까지 응시하며 착지. 양발 발가락이 처음과 반대 방향을 향하도록 넓게 착지
  2단계(90도 회전 착지): 타격할 발 무릎을 접고 180도가 아닌 90도만 회전하여 상대에게 등을 돌린 상태(뒤차기 준비 자세)로 착지. 무릎은 가슴이 아닌 뒤쪽(발목/복숭아뼈 위치)으로 접기. 앞뒤 간격 앞서기 정도로 좁게, 앞다리 무릎 살짝 굽혀 작은 앞굽이 형태로 착지 → 관절 부상 방지
  3단계(깔짝 차기): 접었던 다리를 공중에서 절반만 가볍게 뻗었다가 재빨리 접기. 착지는 반드시 2단계와 동일하게
  4단계(타겟 타격): 샌드백, 미트 등 단단한 타겟으로 끝까지 차기. 처음엔 툭툭 가볍게 시작 → 반발력으로 중심 흔들림 주의 → 점차 강도 높이기
- 타격 후 착지 스텝: 하나(디딤발) → 둘(찼던 발) → 셋(후진 원스텝으로 길게 뛰어 거리 확보)
- 하나-둘-셋 모든 순간 시선은 상대방에서 절대 떼지 않음
`;

const QUICK_QUESTIONS = [
  "기술과 스텝을 왜 함께 배워야 하나요",
  "점프 뒤차기 훈련 순서",
  "앞발 주고 돌려차기가 뭔가요",
  "돌개차기 점프 타이밍이 안 맞아요",
  "나래차기가 잘 안돼요",
  "붙여차기 속도가 느립니다",
  "받아차기 타이밍 잡는 법",
  "뒤차기 후 자꾸 넘어져요",
];

function StepperLogo({ size = 44 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <polygon points="30,2 70,2 98,30 98,70 70,98 30,98 2,70 2,30" fill="#c8102e" />
      <polygon points="32,8 68,8 92,32 92,68 68,92 32,92 8,68 8,32" fill="#FFE000" />
      <polygon points="34,14 66,14 86,34 86,66 66,86 34,86 14,66 14,34" fill="#0033A0" />
      <text x="50" y="38" textAnchor="middle" fill="#FFE000" fontSize="13" fontWeight="900" fontFamily="Arial Black, sans-serif" letterSpacing="1">THE</text>
      <text x="50" y="58" textAnchor="middle" fill="#FFE000" fontSize="14" fontWeight="900" fontFamily="Arial Black, sans-serif" letterSpacing="-0.5" fontStyle="italic">STEPPER</text>
      <text x="50" y="76" textAnchor="middle" fill="#FFE000" fontSize="10" fontWeight="900" fontFamily="Arial Black, sans-serif">TSP</text>
    </svg>
  );
}

export default function TheStepper() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isHome, setIsHome] = useState(true);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // 메인으로 돌아가기
  function goHome() {
    setMessages([]);
    setInput("");
    setIsHome(true);
  }

  async function sendMessage(text) {
    const userText = text || input.trim();
    if (!userText) return;
    setInput("");
    setIsHome(false);
    const newMessages = [...messages, { role: "user", content: userText }];
    setMessages(newMessages);
    setLoading(true);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: KNOWLEDGE_BASE,
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await res.json();
      const reply = data.content?.map((c) => c.text || "").join("") || "응답 오류";
      setMessages([...newMessages, { role: "assistant", content: reply }]);
    } catch {
      setMessages([...newMessages, { role: "assistant", content: "오류가 발생했습니다. 다시 시도해주세요." }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", color: "#f0f0f0", fontFamily: "'Noto Sans KR', sans-serif", display: "flex", flexDirection: "column" }}>

      {/* 헤더 */}
      <div style={{ background: "#111", borderBottom: "2px solid #c8102e", padding: "14px 20px", display: "flex", alignItems: "center", gap: "14px" }}>
        {/* 로고 - 클릭하면 홈으로 */}
        <div onClick={goHome} style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 14 }}>
          <StepperLogo size={48} />
          <div>
            <div style={{ fontWeight: 900, fontSize: 18, letterSpacing: 2, color: "#FFE000", fontStyle: "italic" }}>THE STEPPER</div>
            <div style={{ fontSize: 11, color: "#aaa", fontWeight: 600, letterSpacing: 1, marginTop: 1 }}>태권도 겨루기 교육 AI</div>
          </div>
        </div>

        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10 }}>
          {/* 홈 버튼 - 대화 중일 때만 표시 */}
          {!isHome && (
            <button
              onClick={goHome}
              style={{
                background: "#1a1a1a",
                border: "1px solid #c8102e",
                borderRadius: 20,
                padding: "6px 16px",
                color: "#c8102e",
                fontSize: 12,
                fontWeight: 700,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 5,
                transition: "all 0.15s",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "#c8102e"; e.currentTarget.style.color = "#fff"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "#1a1a1a"; e.currentTarget.style.color = "#c8102e"; }}
            >
              ⌂ 처음으로
            </button>
          )}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
            <div style={{ background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 20, padding: "3px 12px", fontSize: 11, color: "#555" }}>DEMO v1.1</div>
            <div style={{ fontSize: 10, color: "#c8102e", fontWeight: 700, letterSpacing: 1 }}>SINCE 2021 · KOREA</div>
          </div>
        </div>
      </div>

      {/* 메인 화면 */}
      <div style={{ flex: 1, overflowY: "auto", padding: "24px 16px", maxWidth: 720, width: "100%", margin: "0 auto" }}>

        {/* 홈 화면 */}
        {isHome && (
          <div style={{ textAlign: "center", marginTop: 32 }}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
              <StepperLogo size={80} />
            </div>
            <div style={{ fontWeight: 900, fontSize: 22, color: "#FFE000", fontStyle: "italic", letterSpacing: 2, marginBottom: 4 }}>THE STEPPER</div>
            <div style={{ fontWeight: 600, fontSize: 14, color: "#fff", marginBottom: 6 }}>태권도 겨루기 교육 AI</div>
            <div style={{ color: "#555", fontSize: 13, marginBottom: 32, lineHeight: 1.8 }}>
              스텝 · 발차기 · 연계기술 · 교육 철학<br />
              궁금한 내용을 질문하거나 아래 예시를 눌러보세요
            </div>

            {/* 예시 질문 버튼들 */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center", maxWidth: 500, margin: "0 auto" }}>
              {QUICK_QUESTIONS.map((q) => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  style={{
                    background: "#161616",
                    border: "1px solid #2a2a2a",
                    borderRadius: 24,
                    padding: "10px 20px",
                    color: "#ccc",
                    fontSize: 13,
                    cursor: "pointer",
                    transition: "all 0.15s",
                    lineHeight: 1.4,
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "#c8102e"; e.currentTarget.style.color = "#fff"; e.currentTarget.style.background = "#1a0a0a"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "#2a2a2a"; e.currentTarget.style.color = "#ccc"; e.currentTarget.style.background = "#161616"; }}
                >
                  {q}
                </button>
              ))}
            </div>

            {/* 구분선 */}
            <div style={{ margin: "32px auto", maxWidth: 300, borderTop: "1px solid #1e1e1e" }} />
            <div style={{ color: "#333", fontSize: 11 }}>또는 아래 입력창에 직접 질문하세요</div>
          </div>
        )}

        {/* 대화 화면 */}
        {!isHome && (
          <>
            {messages.map((m, i) => (
              <div key={i} style={{ display: "flex", flexDirection: m.role === "user" ? "row-reverse" : "row", gap: 10, marginBottom: 20, alignItems: "flex-start" }}>
                {m.role === "assistant" && (
                  <div style={{ minWidth: 36 }}><StepperLogo size={36} /></div>
                )}
                <div style={{
                  background: m.role === "user" ? "#c8102e" : "#161616",
                  border: m.role === "user" ? "none" : "1px solid #222",
                  borderRadius: m.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                  padding: "12px 16px", maxWidth: "80%", fontSize: 14, lineHeight: 1.75, color: "#f0f0f0", whiteSpace: "pre-wrap",
                }}>
                  {m.content}
                </div>
              </div>
            ))}

            {loading && (
              <div style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 20 }}>
                <div style={{ minWidth: 36 }}><StepperLogo size={36} /></div>
                <div style={{ background: "#161616", border: "1px solid #222", borderRadius: "18px 18px 18px 4px", padding: "14px 18px", display: "flex", gap: 5, alignItems: "center" }}>
                  {[0,1,2].map(i => <div key={i} style={{ width: 7, height: 7, borderRadius: "50%", background: "#c8102e", animation: "pulse 1.2s infinite", animationDelay: `${i*0.2}s` }} />)}
                </div>
              </div>
            )}

            {/* 답변 후 예시 질문 버튼 - 로딩 끝나면 표시 */}
            {!loading && messages.length > 0 && (
              <div style={{ marginTop: 24, paddingTop: 20, borderTop: "1px solid #1e1e1e" }}>
                <div style={{ color: "#444", fontSize: 12, marginBottom: 12, textAlign: "center" }}>다른 질문을 해보세요</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
                  {QUICK_QUESTIONS.map((q) => (
                    <button
                      key={q}
                      onClick={() => sendMessage(q)}
                      style={{
                        background: "#161616",
                        border: "1px solid #2a2a2a",
                        borderRadius: 20,
                        padding: "7px 14px",
                        color: "#888",
                        fontSize: 12,
                        cursor: "pointer",
                        transition: "all 0.15s",
                      }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = "#c8102e"; e.currentTarget.style.color = "#fff"; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = "#2a2a2a"; e.currentTarget.style.color = "#888"; }}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        <div ref={bottomRef} />
      </div>

      {/* 입력창 */}
      <div style={{ background: "#111", borderTop: "1px solid #1e1e1e", padding: "16px" }}>
        <div style={{ maxWidth: 720, margin: "0 auto", display: "flex", gap: 10 }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMessage()}
            placeholder="겨루기 교육 관련 질문을 입력하세요"
            style={{ flex: 1, background: "#161616", border: "1px solid #2a2a2a", borderRadius: 12, padding: "12px 16px", color: "#f0f0f0", fontSize: 14, outline: "none" }}
          />
          <button
            onClick={() => sendMessage()}
            disabled={loading || !input.trim()}
            style={{ background: loading || !input.trim() ? "#222" : "#c8102e", border: "none", borderRadius: 12, padding: "12px 20px", color: loading || !input.trim() ? "#555" : "#fff", fontWeight: 700, fontSize: 14, cursor: loading || !input.trim() ? "not-allowed" : "pointer", whiteSpace: "nowrap" }}
          >
            전송
          </button>
        </div>
        <div style={{ textAlign: "center", marginTop: 8, fontSize: 11, color: "#333" }}>
          THE STEPPER © 더스텝퍼 태권도 겨루기 클럽 · SINCE 2021 · KOREA
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;600;700;800;900&display=swap');
        @keyframes pulse { 0%,100%{opacity:0.3;transform:scale(0.8)} 50%{opacity:1;transform:scale(1)} }
        *{box-sizing:border-box}
        ::-webkit-scrollbar{width:4px}
        ::-webkit-scrollbar-track{background:#0a0a0a}
        ::-webkit-scrollbar-thumb{background:#2a2a2a;border-radius:4px}
        input::placeholder{color:#444}
      `}</style>
    </div>
  );
}
