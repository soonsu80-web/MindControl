export interface SupportCenter {
  region: string;
  name: string;
  tel: string;
  benefits: string;
}

export const SUPPORT_CENTERS: SupportCenter[] = [
  { region: '서울', name: '서울교원치유지원센터 (세움)', tel: '02-399-9600', benefits: '개인·집단 심리상담비(1인 연 250만원 한도), 변호사 법률상담 지원' },
  { region: '경기', name: '경기교원치유지원센터', tel: '031-820-0935', benefits: '맞춤형 전문의 진료 및 심리치료비 지원, 법률 동행 서비스' },
  { region: '인천', name: '인천교원돋움터', tel: '032-420-8480', benefits: '원스톱 심리상담, 분쟁조정 및 교육활동 보호 변호사 지원' },
  { region: '부산', name: '부산교원치유지원센터', tel: '051-860-0320', benefits: '치유 연수, 심리치료비 및 긴급 교원보호조치' },
  { region: '대구', name: '대구교원치유지원센터', tel: '053-231-0320', benefits: '마음건강 전문의 상담 및 교권 침해 법률상담' },
  { region: '광주', name: '광주교원치유지원센터', tel: '062-380-4560', benefits: '전문 심리상담 연계 및 힐링 힐-링 캠프 프로그램' },
  { region: '대전', name: '대전교원치유지원센터', tel: '042-865-6540', benefits: '에듀힐링센터 연계 심리상담 및 힐링 코칭 지원' },
  { region: '울산', name: '울산교원치유지원센터', tel: '052-210-5470', benefits: '교원 힐링 테라피 프로그램 및 전문 심리치료 지원' },
  { region: '세종', name: '세종교원치유지원센터', tel: '044-320-1420', benefits: '안심콜 지원, 심리검사 및 치료비 지원' },
  { region: '전국 공통', name: '정신건강 위기상담 전화', tel: '1577-0199', benefits: '24시간 전문가 심리상담 및 위기 개입' },
  { region: '전국 공통', name: '자살예방 및 위기 상담', tel: '1393', benefits: '24시간 무료 비밀 보장 긴급 상담' },
];

export interface BurnoutQuestion {
  id: number;
  question: string;
  category: 'emotional' | 'depersonalization' | 'inefficacy';
}

export const BURNOUT_QUESTIONS: BurnoutQuestion[] = [
  { id: 1, question: '퇴근 후에도 교실에서 있었던 일이나 학부모 연락 걱정 때문에 마음이 편치 않고 불안하다.', category: 'emotional' },
  { id: 2, question: '아침에 눈을 떠 출근할 생각을 하면 온몸에 힘이 빠지고 깊은 피로감이 엄습한다.', category: 'emotional' },
  { id: 3, question: '예전에는 아이들의 눈망울이 사랑스러웠는데, 요즘은 아이들을 대할 때 나도 모르게 감정이 메마르고 방어적이 된다.', category: 'depersonalization' },
  { id: 4, question: '사소한 학생의 행동이나 학부모의 말투에도 가슴이 쿵쾅거리고 갑작스럽게 분노나 눈물이 치민다.', category: 'emotional' },
  { id: 5, question: '아무리 밤낮으로 애써도 내가 아이들에게 긍정적인 영향을 주지 못하는 무능한 교사처럼 느껴진다.', category: 'inefficacy' },
  { id: 6, question: '행정 공문이나 학교 내 인간관계 때문에 진정한 교육자로서의 보람을 잃어버렸다고 느낀다.', category: 'inefficacy' },
];
