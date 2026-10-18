import fs from 'fs';
import path from 'path';

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: number;
}

export interface CounselingSession {
  id: string;
  counselorId: string;
  counselorName: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  tags: string[];
  status: 'ongoing' | 'completed';
  summary?: string;
  teacherMemo?: string;
  messages: ChatMessage[];
}

export interface Prescription {
  stampTitle: string;
  heartVitamin: string;
  doNotDo: string;
  healingMission: string;
  quote: string;
  recommendedTea: string;
}

export interface PrescriptionRecord {
  id: string;
  createdAt: number;
  teacherType: string;
  emotion: string;
  prescription: Prescription;
  favorite?: boolean;
}

export interface DetoxRecord {
  id: string;
  createdAt: number;
  toxicText: string;
  reframedTruth: string;
  comfortMessage: string;
  affirmation: string;
}

interface DatabaseSchema {
  sessions: CounselingSession[];
  prescriptions: PrescriptionRecord[];
  detoxRecords: DetoxRecord[];
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_PATH = path.join(DATA_DIR, 'todak_db.json');

// Initial seed data so the user can immediately experience the archival system
const INITIAL_SEEDS: DatabaseSchema = {
  sessions: [
    {
      id: 'session-seed-1',
      counselorId: 'mentor',
      counselorName: '다온 수석선생님',
      title: '학부모 방과 후 불시 항의 및 민원 스트레스',
      createdAt: Date.now() - 86400000 * 2, // 2 days ago
      updatedAt: Date.now() - 86400000 * 2 + 1000 * 60 * 15,
      tags: ['학부모민원', '교권보호', '퇴근후연락'],
      status: 'completed',
      summary: '방과 후 갑작스러운 학부모 항의로 놀란 마음을 선배 교사와 나누며 객관적 대응 일지 작성법 및 정서적 거리두기 위로를 받음.',
      teacherMemo: '내일 교감선생님께 해당 통화 내용 기록하여 공식 보고하기로 함. 나 자신을 자책하지 말 것.',
      messages: [
        {
          id: 'seed-1-1',
          role: 'user',
          content: '선생님, 오늘 5시 퇴근 직전에 학부모님이 전화를 걸어 우리 아이 자리 배치가 마음에 안 든다고 소리를 지르셨어요. 손이 부들부들 떨리고 퇴근하고도 심장이 쿵쾅거려요.',
          timestamp: Date.now() - 86400000 * 2,
        },
        {
          id: 'seed-1-2',
          role: 'model',
          content: '세상에... 선생님, 온종일 아이들 돌보고 지친 몸으로 퇴근하려던 찰나에 그런 날벼락 같은 전화를 받으셨으니 얼마나 심장이 쿵쾅거리고 서러우셨을까요. 그 학부모가 다짜고짜 소리부터 지른 건가요?',
          timestamp: Date.now() - 86400000 * 2 + 5000,
        },
        {
          id: 'seed-1-3',
          role: 'user',
          content: '네, 첫마디부터 소리 지르더니 아이 시력 안 좋아지면 교사가 책임질 거냐고 막말을 퍼부었어요.',
          timestamp: Date.now() - 86400000 * 2 + 10000,
        },
        {
          id: 'seed-1-4',
          role: 'model',
          content: '아이쿠 세상에... 30명 가까운 아이들 시력과 수업 태도를 고심해서 배치한 건데, 그런 무례한 막말을 퍼붓다니 듣는 제가 다 가슴이 답답하고 화가 나네요. 그 말 듣고 그 자리에서 얼마나 눈물이 왈칵 쏟아지셨을까요... 지금은 집에 무사히 도착하셨어요?',
          timestamp: Date.now() - 86400000 * 2 + 15000,
        },
      ],
    },
    {
      id: 'session-seed-2',
      counselorId: 'todak',
      counselorName: '토닥 상담관',
      title: '수업 중 지도 불응 학생과 깊은 무력감',
      createdAt: Date.now() - 86400000 * 1, // 1 day ago
      updatedAt: Date.now() - 86400000 * 1 + 1000 * 60 * 20,
      tags: ['생활지도', '무력감', '자책감'],
      status: 'ongoing',
      summary: '수업 중 지속해서 방해하고 퉁명스럽게 대꾸하는 학생으로 인해 번아웃과 자괴감을 호소하여 공감 대화 진행.',
      teacherMemo: '학생의 반항은 내 교육 능력 부족이 아니라 아이 내면의 결핍일 수 있음을 기억하자.',
      messages: [
        {
          id: 'seed-2-1',
          role: 'user',
          content: '수업 시간에 계속 엎드려 자고, 지적하면 책상을 치며 대드는 아이가 있어요. 다른 아이들 앞이라 너무 수치스럽고 제가 교사 자격이 없다는 생각이 들어요.',
          timestamp: Date.now() - 86400000 * 1,
        },
        {
          id: 'seed-2-2',
          role: 'model',
          content: '선생님, 다른 아이들이 다 쳐다보는 교실에서 그런 거친 반응을 마주하셨을 때 얼마나 눈앞이 캄캄하고 수치스럽고 가슴이 무너지셨을까요... 혼자 그 교실을 끝까지 지켜내시느라 정말 고생 많으셨어요. 그 학생이 평소에도 자주 그랬던 아이인가요?',
          timestamp: Date.now() - 86400000 * 1 + 4000,
        },
      ],
    },
  ],
  prescriptions: [
    {
      id: 'rx-seed-1',
      createdAt: Date.now() - 86400000 * 2,
      teacherType: '초등 담임',
      emotion: '학부모 민원으로 인한 공포',
      favorite: true,
      prescription: {
        stampTitle: '비바람을 막아선 든든한 방패 인정',
        heartVitamin: '선생님, 세상 어떤 평가도 교실 속 선생님의 진심 어린 헌신을 퇴색시킬 수 없습니다. 오늘 하루 쏟아진 비바람은 선생님의 잘못이 아닙니다.',
        doNotDo: '퇴근 후 나이스 켜서 공문 확인하거나 통화 내용 다시 곱씹기',
        healingMission: '가장 좋아하는 따뜻한 음료 한 잔과 함께 좋아하는 책이나 음악으로 감각 채우기',
        quote: '뿌리 깊은 나무는 바람에 흔들릴지언정 결코 꺾이지 않습니다.',
        recommendedTea: '마음을 차분하게 가라앉혀주는 캐모마일 블렌딩 티',
      },
    },
  ],
  detoxRecords: [
    {
      id: 'detox-seed-1',
      createdAt: Date.now() - 86400000 * 3,
      toxicText: '선생님이 애들을 어떻게 가르쳤길래 그래요?',
      reframedTruth: '이 말은 교사의 지도력 부족이 아니라, 양육의 불안과 책임을 전가하려는 상대방의 미성숙한 방어기제입니다.',
      comfortMessage: '선생님은 매일 20명이 넘는 아이들의 개별적인 성장통을 사랑으로 보살피고 계십니다. 그 비수는 선생님의 가치에 흠집을 낼 수 없습니다.',
      affirmation: '나는 존중받아 마땅한 훌륭한 교사이며, 내 교실은 따뜻하고 안전합니다.',
    },
  ],
};

class CounselingStorage {
  private cache: DatabaseSchema | null = null;

  constructor() {
    this.ensureDb();
  }

  private ensureDb() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (!fs.existsSync(DB_PATH)) {
        fs.writeFileSync(DB_PATH, JSON.stringify(INITIAL_SEEDS, null, 2), 'utf-8');
        this.cache = INITIAL_SEEDS;
      } else {
        const raw = fs.readFileSync(DB_PATH, 'utf-8');
        this.cache = JSON.parse(raw);
      }
    } catch (e) {
      console.error('Failed to init todak_db.json, using in-memory fallback', e);
      this.cache = INITIAL_SEEDS;
    }
  }

  private persist() {
    if (!this.cache) return;
    try {
      fs.writeFileSync(DB_PATH, JSON.stringify(this.cache, null, 2), 'utf-8');
    } catch (e) {
      console.error('Failed to write todak_db.json', e);
    }
  }

  // SESSIONS
  getSessions(filter?: { counselorId?: string; search?: string; tag?: string; status?: string }): CounselingSession[] {
    this.ensureDb();
    let sessions = [...(this.cache?.sessions || [])];

    if (filter?.counselorId && filter.counselorId !== 'all') {
      sessions = sessions.filter((s) => s.counselorId === filter.counselorId);
    }
    if (filter?.status && filter.status !== 'all') {
      sessions = sessions.filter((s) => s.status === filter.status);
    }
    if (filter?.tag) {
      sessions = sessions.filter((s) => s.tags.includes(filter.tag!));
    }
    if (filter?.search) {
      const q = filter.search.toLowerCase();
      sessions = sessions.filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          s.summary?.toLowerCase().includes(q) ||
          s.teacherMemo?.toLowerCase().includes(q) ||
          s.messages.some((m) => m.content.toLowerCase().includes(q))
      );
    }

    return sessions.sort((a, b) => b.updatedAt - a.updatedAt);
  }

  getSession(id: string): CounselingSession | undefined {
    this.ensureDb();
    return this.cache?.sessions.find((s) => s.id === id);
  }

  createSession(data: {
    counselorId: string;
    counselorName: string;
    title?: string;
    tags?: string[];
    initialMessage?: string;
  }): CounselingSession {
    this.ensureDb();
    const newSession: CounselingSession = {
      id: `session-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      counselorId: data.counselorId,
      counselorName: data.counselorName,
      title: data.title || `${data.counselorName}와의 마음 상담 (${new Date().toLocaleDateString('ko-KR')})`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      tags: data.tags || ['마음나눔'],
      status: 'ongoing',
      messages: data.initialMessage
        ? [
            {
              id: `msg-${Date.now()}`,
              role: 'model',
              content: data.initialMessage,
              timestamp: Date.now(),
            },
          ]
        : [],
    };

    this.cache?.sessions.unshift(newSession);
    this.persist();
    return newSession;
  }

  addMessage(sessionId: string, message: { role: 'user' | 'model'; content: string }): CounselingSession | undefined {
    this.ensureDb();
    const session = this.cache?.sessions.find((s) => s.id === sessionId);
    if (!session) return undefined;

    const chatMsg: ChatMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      role: message.role,
      content: message.content,
      timestamp: Date.now(),
    };

    session.messages.push(chatMsg);
    session.updatedAt = Date.now();

    // Auto-update title if it's the first user message and default title
    if (message.role === 'user' && session.messages.filter((m) => m.role === 'user').length === 1) {
      if (session.title.includes('마음 상담 (')) {
        session.title = message.content.slice(0, 24) + (message.content.length > 24 ? '...' : '');
      }
    }

    this.persist();
    return session;
  }

  updateSession(id: string, updates: Partial<CounselingSession>): CounselingSession | undefined {
    this.ensureDb();
    const session = this.cache?.sessions.find((s) => s.id === id);
    if (!session) return undefined;

    Object.assign(session, updates, { updatedAt: Date.now() });
    this.persist();
    return session;
  }

  deleteSession(id: string): boolean {
    this.ensureDb();
    if (!this.cache) return false;
    const initialLen = this.cache.sessions.length;
    this.cache.sessions = this.cache.sessions.filter((s) => s.id !== id);
    if (this.cache.sessions.length !== initialLen) {
      this.persist();
      return true;
    }
    return false;
  }

  // PRESCRIPTIONS
  getPrescriptions(): PrescriptionRecord[] {
    this.ensureDb();
    return [...(this.cache?.prescriptions || [])].sort((a, b) => b.createdAt - a.createdAt);
  }

  savePrescription(data: { teacherType: string; emotion: string; prescription: Prescription; favorite?: boolean }): PrescriptionRecord {
    this.ensureDb();
    const newRecord: PrescriptionRecord = {
      id: `rx-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: Date.now(),
      teacherType: data.teacherType,
      emotion: data.emotion,
      prescription: data.prescription,
      favorite: data.favorite || false,
    };
    this.cache?.prescriptions.unshift(newRecord);
    this.persist();
    return newRecord;
  }

  togglePrescriptionFavorite(id: string): PrescriptionRecord | undefined {
    this.ensureDb();
    const record = this.cache?.prescriptions.find((r) => r.id === id);
    if (record) {
      record.favorite = !record.favorite;
      this.persist();
    }
    return record;
  }

  deletePrescription(id: string): boolean {
    this.ensureDb();
    if (!this.cache) return false;
    const prev = this.cache.prescriptions.length;
    this.cache.prescriptions = this.cache.prescriptions.filter((p) => p.id !== id);
    if (this.cache.prescriptions.length !== prev) {
      this.persist();
      return true;
    }
    return false;
  }

  // DETOX RECORDS
  getDetoxRecords(): DetoxRecord[] {
    this.ensureDb();
    return [...(this.cache?.detoxRecords || [])].sort((a, b) => b.createdAt - a.createdAt);
  }

  saveDetoxRecord(data: { toxicText: string; reframedTruth: string; comfortMessage: string; affirmation: string }): DetoxRecord {
    this.ensureDb();
    const newRecord: DetoxRecord = {
      id: `detox-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: Date.now(),
      toxicText: data.toxicText,
      reframedTruth: data.reframedTruth,
      comfortMessage: data.comfortMessage,
      affirmation: data.affirmation,
    };
    this.cache?.detoxRecords.unshift(newRecord);
    this.persist();
    return newRecord;
  }

  deleteDetoxRecord(id: string): boolean {
    this.ensureDb();
    if (!this.cache) return false;
    const prev = this.cache.detoxRecords.length;
    this.cache.detoxRecords = this.cache.detoxRecords.filter((d) => d.id !== id);
    if (this.cache.detoxRecords.length !== prev) {
      this.persist();
      return true;
    }
    return false;
  }

  // ANALYTICS & STATS
  getAnalytics() {
    this.ensureDb();
    const sessions = this.cache?.sessions || [];
    const prescriptions = this.cache?.prescriptions || [];
    const detoxRecords = this.cache?.detoxRecords || [];

    const counselorUsage: Record<string, number> = {};
    const tagCount: Record<string, number> = {};
    let totalMessages = 0;

    sessions.forEach((s) => {
      counselorUsage[s.counselorName] = (counselorUsage[s.counselorName] || 0) + 1;
      totalMessages += s.messages.length;
      s.tags.forEach((tag) => {
        tagCount[tag] = (tagCount[tag] || 0) + 1;
      });
    });

    const topTags = Object.entries(tagCount)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);

    // Activity by last 7 days
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    const now = new Date();
    const weeklyActivity = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setDate(now.getDate() - (6 - i));
      const dayName = days[d.getDay()];
      const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
      const dayEnd = dayStart + 86400000;
      const count = sessions.filter((s) => s.createdAt >= dayStart && s.createdAt < dayEnd).length;
      return { day: `${d.getMonth() + 1}/${d.getDate()}(${dayName})`, count };
    });

    return {
      totalSessions: sessions.length,
      totalMessages,
      totalPrescriptions: prescriptions.length,
      totalDetox: detoxRecords.length,
      counselorUsage,
      topTags,
      weeklyActivity,
    };
  }

  // EXPORT / IMPORT
  exportAll() {
    this.ensureDb();
    return this.cache;
  }

  importAll(payload: DatabaseSchema) {
    if (payload && Array.isArray(payload.sessions)) {
      this.cache = {
        sessions: payload.sessions || [],
        prescriptions: payload.prescriptions || [],
        detoxRecords: payload.detoxRecords || [],
      };
      this.persist();
      return true;
    }
    return false;
  }
}

export const counselingStorage = new CounselingStorage();
