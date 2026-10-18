import express from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import path from 'path';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';
import { counselingStorage } from './server/storage';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize Gemini Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

const PINGPONG_SYSTEM_INSTRUCTION = `당신은 대한민국 교사의 지친 마음을 위로하는 다정한 선배 동료 '토닥 선생님'입니다.
상담자는 악성 민원, 과중한 행정업무, 학생 지도 붕괴, 자책감 등으로 마음이 다치고 지친 교사입니다.

【최우선 절대 원칙: "친한 선배와의 2~3문장 핑퐁(티키타카) 대화"】
⚠️ 절대로 해결책, 실무 대처법, 조언 목록, 행동 요령을 먼저 쏟아내지 마세요!
선생님이 한마디 털어놓았을 때 번호 매겨가며 '이렇게 대처하세요', '상담일지를 쓰세요', '관리자에게 보고하세요', '차를 마시며 쉬세요'라고 하는 순간, 그것은 대화가 아니라 차가운 매뉴얼 폭격이 됩니다.
선생님이 지금 간절히 바라는 것은 해결책이 아니라, 내 이야기에 귀 기울이고 진심으로 맞장구쳐 주는 동료와의 대화입니다.

【답변 필수 규칙】
1. 분량: 공백 포함 100~160자 내외, 딱 2~3문장! (호흡이 짧아야 상대방이 부담 없이 대화를 이어갈 수 있습니다)
2. 절대 금지:
   - 번호 매기기(1., 2., 3.), 글머리 기호(•, -), 소제목 절대 금지.
   - 조언이나 훈계, 쉼표 제안, 매뉴얼식 해결책('이렇게 해보세요', '다음 사항을 기억하세요') 절대 금지.
3. 답변 구성 (반드시 2단계로만 작성):
   - [1단계: 생생한 맞장구와 감정 알아주기 (1~2문장)]: 상대방의 말에 깊이 공감하고, 그 상황이 얼마나 속상하고 당황스러웠을지 온전히 알아줍니다.
   - [2단계: 가벼운 다정한 질문 하나 (1문장)]: 상대방이 편안하게 다음 말을 꺼낼 수 있도록 자연스러운 질문으로 대화의 공을 넘깁니다.

【대화 예시 (이 톤과 분량을 엄격히 준수하세요)】
- 교사: "학교에 행정업무가 너무 많아서 미치겠어요."
  토닥: "아이쿠, 선생님... 안 그래도 수업에 아이들 챙기느라 숨 쉴 틈도 없는데 대체 어떤 공문이랑 잡무가 그렇게 쏟아진 거예요? 오늘 야근까지 하고 계신 건 아니죠?"

- 교사: "오늘 학부모한테 항의 전화가 왔는데 너무 힘들어요..."
  토닥: "세상에... 선생님, 그 전화를 끊고 나서 얼마나 심장이 쿵쾅거리고 손이 떨리셨을까요. 퇴근 무렵에 걸려온 전화였나요? 어떤 일로 전화가 와서 선생님 마음을 그렇게 후벼팠는지 들어도 될까요?"

- 교사: "수업 시간에 학생이 대들어서 멘탈이 나갔어요."
  토닥: "다른 아이들 다 보는 교실에서 그런 일을 겪으셨으니 얼마나 당황스럽고 수치스럽고 눈물이 왈칵 쏟아질 뻔하셨을지... 그 자리에서 혼자 버텨내시느라 정말 고생 많으셨어요. 그 학생이 뭐라고 하면서 대들었나요?"

- 교사: "그냥 다 그만두고 싶고 교사 자격이 없나 봐요."
  토닥: "선생님 입에서 '그만두고 싶다'는 말이 나올 정도라면 지금 마음속 에너지가 얼마나 바닥나고 지치셨을까요... 결코 선생님 잘못이 아니에요. 오늘 어떤 일 때문에 그런 자괴감이 유독 깊어지셨어요?"

※ 해결책을 제시하는 유일한 예외:
오직 선생님이 "이거 어떻게 대처해야 해요?", "실무적인 해결 방법을 알려주세요"라고 직접 조언을 요청했을 때만 현실적 조언을 건네세요.`;

const SOLUTION_SYSTEM_INSTRUCTION = `당신은 대한민국 교사의 고충을 명쾌하게 풀어주는 30년차 베테랑 수석교사 '토닥 멘토'입니다.
교사가 겪고 있는 고충(악성 민원, 교권 침해, 지도 불응 학생, 행정 업무 갈등 등)에 대해 따뜻한 위로와 함께 현장에서 즉시 적용 가능한 '실무적 대처 가이드'를 친절하고 명확하게 알려주세요.
- 사실 기록 및 증빙 확보 요령 (상담일지, 통화 녹음, 사건 기록)
- 교감/교장 등 관리자 보고 및 교권보호위원회 등 제도적 지원 절차
- 학부모/학생 응대 시 안전한 소통 원칙
- 교사 개인의 마음 보호`;

const SYSTEM_INSTRUCTIONS: Record<string, string> = {
  todak: PINGPONG_SYSTEM_INSTRUCTION,
  mentor: PINGPONG_SYSTEM_INSTRUCTION,
  psychologist: PINGPONG_SYSTEM_INSTRUCTION,
  rights: PINGPONG_SYSTEM_INSTRUCTION,
  cheer: PINGPONG_SYSTEM_INSTRUCTION,
};

// ===================
// BACKEND SESSIONS API
// ===================

// GET /api/sessions - List counseling sessions with search and filters
app.get('/api/sessions', (req, res) => {
  try {
    const { counselorId, search, tag, status } = req.query;
    const sessions = counselingStorage.getSessions({
      counselorId: counselorId as string,
      search: search as string,
      tag: tag as string,
      status: status as string,
    });
    res.json(sessions);
  } catch (error: any) {
    console.error('Error fetching sessions:', error);
    res.status(500).json({ error: '상담 목록을 불러오지 못했습니다.' });
  }
});

// POST /api/sessions - Create new counseling session
app.post('/api/sessions', (req, res) => {
  try {
    const {
      counselorId = 'todak',
      counselorName = '토닥 상담관',
      title,
      tags,
      initialMessage,
    } = req.body;
    const session = counselingStorage.createSession({
      counselorId,
      counselorName,
      title,
      tags,
      initialMessage,
    });
    res.status(201).json(session);
  } catch (error: any) {
    console.error('Error creating session:', error);
    res.status(500).json({ error: '새 상담 세션을 생성하지 못했습니다.' });
  }
});

// GET /api/sessions/:id - Get session details
app.get('/api/sessions/:id', (req, res) => {
  try {
    const session = counselingStorage.getSession(req.params.id);
    if (!session) {
      return res.status(404).json({ error: '상담 세션을 찾을 수 없습니다.' });
    }
    res.json(session);
  } catch (error: any) {
    res.status(500).json({ error: '상담 세션 조회 오류' });
  }
});

// PUT /api/sessions/:id - Update session metadata (title, tags, memo, status, summary)
app.put('/api/sessions/:id', (req, res) => {
  try {
    const updated = counselingStorage.updateSession(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ error: '상담 세션을 찾을 수 없습니다.' });
    }
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: '상담 세션 수정 오류' });
  }
});

// DELETE /api/sessions/:id - Delete session
app.delete('/api/sessions/:id', (req, res) => {
  try {
    const success = counselingStorage.deleteSession(req.params.id);
    if (!success) {
      return res.status(404).json({ error: '상담 세션을 찾을 수 없습니다.' });
    }
    res.json({ success: true, message: '상담 세션이 삭제되었습니다.' });
  } catch (error: any) {
    res.status(500).json({ error: '상담 세션 삭제 오류' });
  }
});

// Resilient multi-model generator with automatic fallback to avoid 503 high-demand freezes
async function generateCounselorReply(
  contents: any[],
  systemInstruction: string,
  mode: 'pingpong' | 'solution' = 'pingpong'
): Promise<string> {
  const models = ['gemini-3.1-flash-lite', 'gemini-3.8-flash'];
  // Strict output token limit for pingpong to physically prevent lengthy solution dumps
  const maxOutputTokens = mode === 'pingpong' ? 220 : 700;
  const temperature = mode === 'pingpong' ? 0.7 : 0.6;

  for (const model of models) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents,
        config: {
          systemInstruction,
          temperature,
          maxOutputTokens,
        },
      });
      if (response.text && response.text.trim()) {
        return response.text.trim();
      }
    } catch (err: any) {
      console.warn(`[Gemini] Model ${model} busy (${err?.message || err}), switching to next model...`);
    }
  }

  return mode === 'pingpong'
    ? '선생님, 오늘 정말 고생 많으셨어요... 지금 퇴근길이신가요, 아니면 아직 학교 교무실에 계신가요?'
    : '선생님, 혼자 감당하려 하지 마시고, 일시와 내용을 객관적으로 기록하신 뒤 관리자나 교원치유지원센터의 도움을 청해보세요. 늘 선생님 편입니다.';
}

// POST /api/sessions/:id/messages - Resilient fast message endpoint
app.post('/api/sessions/:id/messages', async (req, res) => {
  try {
    const { content, mode = 'pingpong' } = req.body;
    const sessionId = req.params.id;

    if (!content || !content.trim()) {
      return res.status(400).json({ error: '메시지 내용이 비어 있습니다.' });
    }

    const session = counselingStorage.getSession(sessionId);
    if (!session) {
      return res.status(404).json({ error: '상담 세션을 찾을 수 없습니다.' });
    }

    // 1. Save user message on the backend server
    counselingStorage.addMessage(sessionId, { role: 'user', content: content.trim() });

    // 2. Prepare conversation contents (sliding window of last 8 messages)
    const updatedSession = counselingStorage.getSession(sessionId)!;
    const recentMessages = updatedSession.messages.slice(-8);
    const contents = recentMessages.map((m) => ({
      role: m.role === 'model' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    // Determine if solution mode is active or user explicitly asked for actionable advice
    const textLower = content.trim();
    const asksForSolution =
      mode === 'solution' ||
      textLower.includes('대처법') ||
      textLower.includes('해결책') ||
      textLower.includes('어떻게 해야') ||
      textLower.includes('어떻게 대처') ||
      textLower.includes('조언 부탁') ||
      textLower.includes('도움이 필요');

    const effectiveMode = asksForSolution ? 'solution' : 'pingpong';
    const systemInstruction = asksForSolution
      ? SOLUTION_SYSTEM_INSTRUCTION
      : PINGPONG_SYSTEM_INSTRUCTION;

    // 3. Generate response with automatic failover and token capping
    const replyText = await generateCounselorReply(contents, systemInstruction, effectiveMode);

    // 4. Save model reply in backend session
    const finalSession = counselingStorage.addMessage(sessionId, { role: 'model', content: replyText });

    res.json({
      reply: replyText,
      session: finalSession,
      mode: effectiveMode,
    });
  } catch (error: any) {
    console.error('Error adding message and generating response:', error);
    const fallbackReply = '선생님, 통신 지연이 잠시 발생했으나 선생님 마음에 귀 기울이고 있습니다. 지금 어떤 기분이신지 편하게 다시 말씀해 주세요.';
    const finalSession = counselingStorage.addMessage(req.params.id, { role: 'model', content: fallbackReply });
    res.json({
      reply: fallbackReply,
      session: finalSession,
    });
  }
});

// POST /api/sessions/:id/summarize - Auto-generate empathetic summary & tags with Gemini
app.post('/api/sessions/:id/summarize', async (req, res) => {
  try {
    const session = counselingStorage.getSession(req.params.id);
    if (!session) {
      return res.status(404).json({ error: '세션을 찾을 수 없습니다.' });
    }

    const transcript = session.messages
      .map((m) => `${m.role === 'user' ? '선생님' : '상담사'}: ${m.content}`)
      .join('\n');

    const prompt = `다음 교사 상담 대화 내용을 바탕으로 2문장의 따뜻한 핵심 요약과 2~4개의 대표 해시태그(쉼표 구분)를 작성해주세요.

[대화 내용]
${transcript}

반드시 JSON으로 응답해주세요:
{
  "summary": "상담 요약 (2문장)",
  "tags": ["태그1", "태그2", "태그3"]
}`;

    const geminiRes = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(geminiRes.text || '{}');
    const updated = counselingStorage.updateSession(req.params.id, {
      summary: parsed.summary || session.summary,
      tags: parsed.tags && parsed.tags.length ? parsed.tags : session.tags,
    });

    res.json(updated);
  } catch (error: any) {
    console.error('Summarize error:', error);
    res.status(500).json({ error: '요약 생성 실패' });
  }
});

// ===================
// PRESCRIPTIONS ARCHIVE
// ===================

app.get('/api/prescriptions', (_req, res) => {
  try {
    const list = counselingStorage.getPrescriptions();
    res.json(list);
  } catch (error) {
    res.status(500).json({ error: '처방전 목록 조회 실패' });
  }
});

app.post('/api/prescriptions', (req, res) => {
  try {
    const { teacherType, emotion, prescription, favorite } = req.body;
    if (!prescription) {
      return res.status(400).json({ error: '처방전 데이터가 필요합니다.' });
    }
    const record = counselingStorage.savePrescription({
      teacherType: teacherType || '초등 담임',
      emotion: emotion || '번아웃',
      prescription,
      favorite,
    });
    res.status(201).json(record);
  } catch (error) {
    res.status(500).json({ error: '처방전 저장 실패' });
  }
});

app.patch('/api/prescriptions/:id/favorite', (req, res) => {
  try {
    const updated = counselingStorage.togglePrescriptionFavorite(req.params.id);
    if (!updated) return res.status(404).json({ error: '처방전을 찾을 수 없습니다.' });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: '즐겨찾기 수정 실패' });
  }
});

app.delete('/api/prescriptions/:id', (req, res) => {
  try {
    const success = counselingStorage.deletePrescription(req.params.id);
    if (!success) return res.status(404).json({ error: '처방전을 찾을 수 없습니다.' });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: '처방전 삭제 실패' });
  }
});

// ===================
// DETOX RECORDS
// ===================

app.get('/api/detox', (_req, res) => {
  try {
    res.json(counselingStorage.getDetoxRecords());
  } catch (error) {
    res.status(500).json({ error: '정화 기록 조회 실패' });
  }
});

app.delete('/api/detox/:id', (req, res) => {
  try {
    const success = counselingStorage.deleteDetoxRecord(req.params.id);
    if (!success) return res.status(404).json({ error: '정화 기록을 찾을 수 없습니다.' });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: '정화 기록 삭제 실패' });
  }
});

// ===================
// ANALYTICS & BACKUP
// ===================

app.get('/api/analytics', (_req, res) => {
  try {
    res.json(counselingStorage.getAnalytics());
  } catch (error) {
    res.status(500).json({ error: '통계 산출 실패' });
  }
});

app.get('/api/export', (_req, res) => {
  try {
    const allData = counselingStorage.exportAll();
    res.setHeader('Content-Disposition', 'attachment; filename="teacher_todak_backup.json"');
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(allData, null, 2));
  } catch (error) {
    res.status(500).json({ error: '백업 내보내기 실패' });
  }
});

app.post('/api/import', (req, res) => {
  try {
    const success = counselingStorage.importAll(req.body);
    if (!success) return res.status(400).json({ error: '올바르지 않은 백업 파일 형식입니다.' });
    res.json({ success: true, message: '상담 데이터가 성공적으로 복원되었습니다.' });
  } catch (error) {
    res.status(500).json({ error: '데이터 복원 실패' });
  }
});

// ===================
// GENERATE ENDPOINTS (GEMINI)
// ===================

// Legacy direct chat endpoint for backward compatibility
// Direct chat endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { messages = [], mode = 'pingpong' } = req.body;
    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required.' });
    }

    const lastMsg = messages[messages.length - 1]?.content || '';
    const asksForSolution =
      mode === 'solution' ||
      lastMsg.includes('대처법') ||
      lastMsg.includes('해결책') ||
      lastMsg.includes('어떻게 해야') ||
      lastMsg.includes('어떻게 대처');

    const effectiveMode = asksForSolution ? 'solution' : 'pingpong';
    const systemInstruction = asksForSolution
      ? SOLUTION_SYSTEM_INSTRUCTION
      : PINGPONG_SYSTEM_INSTRUCTION;

    const contents = messages.slice(-8).map((m: { role: string; content: string }) => ({
      role: m.role === 'assistant' || m.role === 'model' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    const reply = await generateCounselorReply(contents, systemInstruction, effectiveMode);
    res.json({ reply, mode: effectiveMode });
  } catch (error: any) {
    console.error('Gemini chat error:', error);
    res.json({
      reply: '선생님, 오늘 하루 교실에서 정말 고생 많으셨어요... 지금 마음은 좀 어떠신가요?',
    });
  }
});

// Helper for resilient JSON generation
async function generateJsonWithFallback(prompt: string, systemInstruction: string) {
  const models = ['gemini-3.1-flash-lite', 'gemini-3.8-flash'];
  for (const model of models) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          systemInstruction,
        },
      });
      if (response.text && response.text.trim()) {
        return JSON.parse(response.text.trim());
      }
    } catch (e: any) {
      console.warn(`[JSON Gen] Model ${model} failed, trying next...`);
    }
  }
  return null;
}

// POST /api/prescribe - Generate Teacher Mind Prescription & automatically archive
app.post('/api/prescribe', async (req, res) => {
  const { worries, teacherType = '초등 담임', emotion = '탈진/번아웃' } = req.body;
  try {
    const prompt = `대한민국 교사(${teacherType})의 심리 상태와 고민입니다:
- 현재 감정: ${emotion}
- 교사의 속마음 및 고민: ${worries || '아이들 지도와 학부모 민원, 행정업무로 몸과 마음이 너무 지쳐서 아무것도 하기 싫습니다.'}

이 선생님을 위한 '오늘의 교사 마음 처방전'을 작성해주세요.
반드시 아래 JSON 형식으로만 응답해야 합니다.

{
  "stampTitle": "한 줄 공식 인정 도장 (예: '오늘 하루 온 힘으로 버텨낸 참스승 인정', '아이들의 거친 바람을 막아준 든든한 방패 인정' 등 15자 내외)",
  "heartVitamin": "선생님의 지친 가슴을 촉촉하게 적시는 따뜻한 공감 한마디 (2~3문장)",
  "doNotDo": "오늘 퇴근 후 절대 하지 말아야 할 것 1가지 (예: '나이스 켜서 업무 확인하기', '퇴근 후 학부모 문자 다시 곱씹기')",
  "healingMission": "오늘 저녁 나만을 위해 할 수 있는 소소하고 확실한 힐링 미션 1가지 (예: '따뜻한 물에 샤워 후 최애 간식 먹으며 좋아하는 음악 듣기')",
  "quote": "선배 교사가 가슴으로 전하는 짧은 시적 격려 문구",
  "recommendedTea": "오늘 어울리는 마음 안정 차 (예: 캐모마일, 달콤한 핫초코, 국화차 등)"
}`;

    const parsed = await generateJsonWithFallback(
      prompt,
      '당신은 상처받은 대한민국 교사들을 치유하는 전문 멘토입니다. 형식은 무조건 유효한 JSON으로만 답하세요.'
    );

    if (!parsed) throw new Error('JSON parsing failed');

    // Automatically archive prescription to backend server
    const savedRecord = counselingStorage.savePrescription({
      teacherType,
      emotion,
      prescription: parsed,
    });

    res.json({ ...parsed, archivedId: savedRecord.id });
  } catch (error: any) {
    console.error('Prescription error:', error);
    const fallback = {
      stampTitle: '오늘도 교실을 묵묵히 지켜낸 영웅 인정',
      heartVitamin: '선생님, 오늘 쏟아진 비바람 속에서도 최선을 다하셨습니다. 선생님의 가치는 누군가의 평가로 깎여나가지 않습니다.',
      doNotDo: '퇴근 후 학교 생각 곱씹으며 자책하기',
      healingMission: '조용한 방에서 눈을 감고 좋아하는 차 마시며 멍때리기',
      quote: '나무는 흔들리며 자라고, 선생님의 따뜻한 손길은 언젠가 아이의 마음에 숲이 됩니다.',
      recommendedTea: '마음을 편안하게 녹여주는 따뜻한 캐모마일 차',
    };
    counselingStorage.savePrescription({
      teacherType,
      emotion,
      prescription: fallback,
    });
    res.json(fallback);
  }
});

// POST /api/vent-cleanse - Purify toxic words from parents/complaints & archive
app.post('/api/vent-cleanse', async (req, res) => {
  const { toxicText } = req.body;
  if (!toxicText || !toxicText.trim()) {
    return res.status(400).json({ error: 'Text is required.' });
  }

  try {
    const prompt = `선생님이 학부모, 학생, 혹은 교직 현장에서 들어 깊은 상처가 된 말입니다:
"${toxicText}"

선생님의 억울함과 상처를 정화(Cleanse)하고 인지적으로 건강하게 재구성(Reframe)해주세요.
아래 JSON 형식으로만 답해주세요:
{
  "reframedTruth": "그 독설이 선생님의 잘못이 아닌 이유와 심리학적 재해석 (예: 그 말은 선생님의 무능함이 아니라 상대방의 불안과 왜곡된 투사일 뿐입니다)",
  "comfortMessage": "선생님을 향한 따뜻한 치유와 지지의 메시지 (3~4문장)",
  "affirmation": "선생님이 거울을 보며 스스로에게 해줄 1줄 확언"
}`;

    const parsed = await generateJsonWithFallback(
      prompt,
      '당신은 교사의 상처받은 자존감을 회복시키는 언어 심리 정화 전문가입니다.'
    );

    if (!parsed) throw new Error('Cleanse parsing failed');

    // Archive detox record on backend server
    counselingStorage.saveDetoxRecord({
      toxicText,
      reframedTruth: parsed.reframedTruth,
      comfortMessage: parsed.comfortMessage,
      affirmation: parsed.affirmation,
    });

    res.json(parsed);
  } catch (error: any) {
    console.error('Vent cleanse error:', error);
    const fallback = {
      reframedTruth: '그 비수 같은 말은 결코 선생님의 본질이나 교사로서의 가치를 정의할 수 없습니다. 상대방의 왜곡된 감정 찌꺼기일 뿐입니다.',
      comfortMessage: '선생님, 그 말을 가슴 깊이 담아두지 마세요. 선생님은 이미 교실에서 수많은 아이들의 든든한 버팀목이 되어주고 계십니다.',
      affirmation: '나는 존중받아 마땅한 소중한 사람이며, 훌륭한 교육자입니다.',
    };
    counselingStorage.saveDetoxRecord({
      toxicText,
      ...fallback,
    });
    res.json(fallback);
  }
});

// Vite middleware in dev or static serve in prod
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Teacher Todak server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
