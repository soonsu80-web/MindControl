import { Counselor } from '../types';

export const TODAK_COUNSELOR: Counselor = {
  id: 'todak',
  name: '토닥 상담관',
  role: '교사 마음 치유 & 핑퐁 공감 동반자',
  tagline: '성급한 해결책 대신, 지친 선생님의 마음에 깊이 공감하고 티키타카 대화를 나누는 따뜻한 쉼터',
  avatar: '🌱',
  badge: '공감 핑퐁 상담소',
  color: 'amber',
  bgGradient: 'from-amber-500/15 to-emerald-500/10',
  borderColor: 'border-amber-300',
  welcomeMessage: `선생님, 오늘 하루도 교실에서 아이들 챙기시느라 정말 고생 많으셨어요.
지금 퇴근길이신가요, 아니면 아직 교무실에 계신가요?

마음에 걸리는 일이나 속상했던 일, 그냥 혼잣말처럼 편하게 한마디 툭 털어놓아 주세요.`,
};

export const COUNSELORS: Counselor[] = [TODAK_COUNSELOR];

export const QUICK_PROMPTS = [
  '학교에 행정업무가 너무 많아서 숨이 턱 막혀요.',
  '오늘 학부모한테 항의 전화가 왔는데 너무 힘들어요...',
  '수업 시간에 대드는 학생 때문에 멘탈이 나갔어요.',
  '그냥 다 그만두고 싶고 교사 자격이 없나 싶어요.',
  '퇴근길인데 계속 눈물만 나고 가슴이 답답해요.',
];
