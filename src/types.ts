export type CounselorId = 'todak' | 'mentor' | 'psychologist' | 'rights' | 'cheer';

export interface Counselor {
  id: CounselorId;
  name: string;
  role: string;
  tagline: string;
  avatar: string;
  badge: string;
  color: string;
  bgGradient: string;
  borderColor: string;
  welcomeMessage: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: number;
}

export interface CounselingSession {
  id: string;
  counselorId: CounselorId;
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

export interface VentCleanseResult {
  reframedTruth: string;
  comfortMessage: string;
  affirmation: string;
}

export interface DetoxRecord {
  id: string;
  createdAt: number;
  toxicText: string;
  reframedTruth: string;
  comfortMessage: string;
  affirmation: string;
}

export interface AnalyticsData {
  totalSessions: number;
  totalMessages: number;
  totalPrescriptions: number;
  totalDetox: number;
  counselorUsage: Record<string, number>;
  topTags: { tag: string; count: number }[];
  weeklyActivity: { day: string; count: number }[];
}
