import React, { useState } from 'react';
import { ShieldAlert, CheckCircle, AlertTriangle, PhoneCall, HelpCircle, Heart, ChevronRight } from 'lucide-react';
import { BURNOUT_QUESTIONS, SUPPORT_CENTERS } from '../data/resources';

interface BurnoutAssessmentProps {
  onStartCounseling?: () => void;
}

export const BurnoutAssessment: React.FC<BurnoutAssessmentProps> = ({ onStartCounseling }) => {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [showResult, setShowResult] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState<string>('전체');

  const handleSelectScore = (questionId: number, score: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: score }));
  };

  const isAllAnswered = BURNOUT_QUESTIONS.every((q) => answers[q.id] !== undefined);

  const totalScore = Object.values(answers).reduce((acc, curr) => acc + curr, 0);

  const getBurnoutLevel = (score: number) => {
    if (score <= 5) {
      return {
        level: '안정·경미한 스트레스',
        color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
        badge: 'bg-emerald-100 text-emerald-800',
        icon: CheckCircle,
        advice: '현재 선생님의 마음 에너지는 비교적 안정적입니다. 다만 교직 현장의 돌발 상황에 대비해 퇴근 후에는 확실한 쉼과 취미 생활로 에너지를 비축해 두세요.',
      };
    } else if (score <= 11) {
      return {
        level: '주의 및 초기 번아웃',
        color: 'text-amber-800 bg-amber-50 border-amber-200',
        badge: 'bg-amber-100 text-amber-900',
        icon: AlertTriangle,
        advice: '상당한 정서적 피로와 무력감이 누적된 상태입니다. "내가 더 잘해야지"라는 자책을 멈추고, 토닥 상담소와의 대화 및 주말 완전 휴식을 통해 나를 돌보아야 할 시점입니다.',
      };
    } else {
      return {
        level: '심각한 소진 및 탈진 위험',
        color: 'text-rose-800 bg-rose-50 border-rose-200',
        badge: 'bg-rose-100 text-rose-900',
        icon: ShieldAlert,
        advice: '마음의 비상벨이 울리고 있습니다. 선생님 혼자서 감당할 수 있는 한계를 넘어섰습니다. 시도교육청 교원치유지원센터의 전액 무료 심리상담 또는 병원 진료를 적극 권유드립니다.',
      };
    }
  };

  const resultInfo = getBurnoutLevel(totalScore);
  const ResultIcon = resultInfo.icon;

  const filteredCenters = selectedRegion === '전체'
    ? SUPPORT_CENTERS
    : SUPPORT_CENTERS.filter((c) => c.region === selectedRegion || c.region === '전국 공통');

  return (
    <div className="max-w-4xl mx-auto w-full pb-12">
      <div className="text-center mb-6">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-100 text-indigo-800 text-xs font-semibold mb-2">
          <HelpCircle className="w-3.5 h-3.5 text-indigo-600" />
          교사 심리 건강 자가진단
        </span>
        <h2 className="text-2xl sm:text-3xl font-bold font-serif text-stone-800">
          교사 소진도(번아웃) 자가진단
        </h2>
        <p className="text-sm text-stone-600 mt-1 max-w-xl mx-auto">
          선생님의 감정 노동과 스트레스 수준을 객관적으로 점검하고, 전국 교원치유지원센터의
          무료 심리상담 및 법률 보호 혜택을 확인하세요.
        </p>
      </div>

      {!showResult ? (
        <div className="bg-white/90 backdrop-blur-xs rounded-2xl border border-stone-200/80 p-5 sm:p-7 shadow-xs space-y-6">
          <div className="space-y-4">
            {BURNOUT_QUESTIONS.map((q, idx) => (
              <div key={q.id} className="p-4 rounded-xl bg-stone-50/70 border border-stone-200/60">
                <p className="text-sm font-semibold text-stone-800 mb-3">
                  <span className="text-amber-700 font-bold mr-1.5">Q{idx + 1}.</span>
                  {q.question}
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  {[
                    { label: '전혀 그렇지 않다', score: 0 },
                    { label: '가끔 그렇다', score: 1 },
                    { label: '자주 그렇다', score: 2 },
                    { label: '거의 매일 그렇다', score: 3 },
                  ].map((opt) => (
                    <button
                      key={opt.score}
                      type="button"
                      onClick={() => handleSelectScore(q.id, opt.score)}
                      className={`p-2.5 rounded-lg border text-center font-medium transition cursor-pointer ${
                        answers[q.id] === opt.score
                          ? 'border-indigo-500 bg-indigo-50 text-indigo-900 font-bold ring-1 ring-indigo-300'
                          : 'border-stone-200 bg-white hover:bg-stone-100 text-stone-600'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2">
            <button
              onClick={() => setShowResult(true)}
              disabled={!isAllAnswered}
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white font-bold text-sm rounded-xl shadow-xs transition cursor-pointer flex items-center justify-center gap-2"
            >
              <span>{isAllAnswered ? '진단 결과 확인하기' : '모든 문항에 답변해 주세요'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        /* Result Screen */
        <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
          <div className={`p-6 sm:p-8 rounded-2xl border-2 ${resultInfo.color} shadow-xs`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200/50 pb-5 mb-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-white shadow-2xs flex items-center justify-center shrink-0">
                  <ResultIcon className="w-6 h-6 text-stone-800" />
                </div>
                <div>
                  <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${resultInfo.badge}`}>
                    진단 결과
                  </span>
                  <h3 className="text-xl font-bold font-serif text-stone-900 mt-1">
                    {resultInfo.level} (총점 {totalScore}점 / 18점)
                  </h3>
                </div>
              </div>

              <button
                onClick={() => {
                  setAnswers({});
                  setShowResult(false);
                }}
                className="text-xs bg-white text-stone-700 hover:bg-stone-100 px-3 py-1.5 rounded-lg border border-stone-200 transition font-medium self-start sm:self-center cursor-pointer"
              >
                다시 진단하기
              </button>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-600">
                선생님을 위한 마음 처방 가이드
              </h4>
              <p className="text-sm leading-relaxed text-stone-800 font-serif">
                {resultInfo.advice}
              </p>
            </div>

            {onStartCounseling && (
              <div className="mt-5 pt-4 border-t border-stone-200/50 flex justify-end">
                <button
                  onClick={onStartCounseling}
                  className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                >
                  <Heart className="w-3.5 h-3.5 fill-rose-400 text-rose-400" />
                  <span>상담사와 바로 대화하기</span>
                </button>
              </div>
            )}
          </div>

          {/* Teacher Rights Protection Golden Rules */}
          <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-5 shadow-xs">
            <h4 className="font-bold text-amber-950 text-sm mb-2 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-amber-700" />
              악성 민원 및 교권 침해 발생 시 교사 보호 5대 원칙
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-amber-900 mt-3">
              <div className="p-2.5 bg-white/80 rounded-xl border border-amber-200/60">
                <strong className="block text-stone-900 mb-0.5">1. 개인 연락처 노출 차단</strong>
                <span>교원 안심번호(투넘버)를 사용하고, 근무시간 외 통화나 메신저는 철저히 분리하세요.</span>
              </div>
              <div className="p-2.5 bg-white/80 rounded-xl border border-amber-200/60">
                <strong className="block text-stone-900 mb-0.5">2. 통화 녹음 및 상담일지 기록</strong>
                <span>폭언이나 무리한 요구 시 "상담 내용이 녹음됩니다" 고지 후 일시와 내용을 기록해 두세요.</span>
              </div>
              <div className="p-2.5 bg-white/80 rounded-xl border border-amber-200/60">
                <strong className="block text-stone-900 mb-0.5">3. 혼자 감당하지 말고 관리자 보고</strong>
                <span>교감·교장 등 학교 관리자에게 즉시 공식 보고하고 교권보호위원회 심의를 요청하세요.</span>
              </div>
              <div className="p-2.5 bg-white/80 rounded-xl border border-amber-200/60">
                <strong className="block text-stone-900 mb-0.5">4. 교육청 무료 변호사·상담 신청</strong>
                <span>시도 교육청 교원치유지원센터에서 연 최대 250만원의 심리치료비와 변호사 동행을 지원합니다.</span>
              </div>
            </div>
          </div>

          {/* Teacher Support Center Directory */}
          <div className="bg-white/90 backdrop-blur-xs rounded-2xl border border-stone-200/80 p-5 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h4 className="font-bold text-stone-800 text-sm flex items-center gap-2">
                  <PhoneCall className="w-4 h-4 text-emerald-600" />
                  전국 교원치유지원센터 무료 상담 지원망
                </h4>
                <p className="text-xs text-stone-500 mt-0.5">
                  상담 비용과 법률 자문은 국가와 교육청에서 전액 부담합니다.
                </p>
              </div>

              {/* Region Selector */}
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="text-xs border border-stone-300 rounded-lg p-1.5 bg-stone-50 text-stone-700 outline-hidden font-medium"
              >
                <option value="전체">전체 지역 보기</option>
                <option value="서울">서울</option>
                <option value="경기">경기</option>
                <option value="인천">인천</option>
                <option value="부산">부산</option>
                <option value="대구">대구</option>
                <option value="광주">광주</option>
                <option value="대전">대전</option>
                <option value="울산">울산</option>
                <option value="세종">세종</option>
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {filteredCenters.map((center, idx) => (
                <div key={idx} className="p-3 bg-stone-50/70 border border-stone-200 rounded-xl flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-stone-800">
                        [{center.region}] {center.name}
                      </span>
                      <a
                        href={`tel:${center.tel}`}
                        className="text-xs font-mono font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 px-2 py-0.5 rounded"
                      >
                        {center.tel}
                      </a>
                    </div>
                    <p className="text-[11px] text-stone-600 leading-tight">
                      {center.benefits}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
