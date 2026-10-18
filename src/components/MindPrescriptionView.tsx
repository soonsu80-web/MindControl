import React, { useState, useEffect } from 'react';
import { Sparkles, Printer, Copy, Check, Heart, ShieldCheck, Coffee, Ban, Compass } from 'lucide-react';
import { Prescription } from '../types';

interface MindPrescriptionViewProps {
  initialWorries?: string;
}

export const MindPrescriptionView: React.FC<MindPrescriptionViewProps> = ({ initialWorries = '' }) => {
  const [teacherType, setTeacherType] = useState('초등 담임');
  const [emotion, setEmotion] = useState('극심한 피로와 번아웃');
  const [worries, setWorries] = useState(initialWorries);
  const [isLoading, setIsLoading] = useState(false);
  const [prescription, setPrescription] = useState<Prescription | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (initialWorries) {
      setWorries(initialWorries);
    }
  }, [initialWorries]);

  const handleGenerate = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/prescribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teacherType,
          emotion,
          worries: worries || '오늘 하루 교실에서 너무 많은 에너지를 쏟아붓고 녹초가 되었습니다.',
        }),
      });

      if (!response.ok) {
        throw new Error('처방전 생성 오류');
      }

      const data = await response.json();
      setPrescription(data);
    } catch (e) {
      console.error(e);
      // Fallback
      setPrescription({
        stampTitle: '오늘도 교실을 묵묵히 지켜낸 영웅 인정',
        heartVitamin: '선생님, 오늘 쏟아진 비바람 속에서도 최선을 다하셨습니다. 선생님의 가치는 누군가의 평가나 날선 말로 깎여나가지 않습니다.',
        doNotDo: '퇴근 후 나이스 켜거나 학부모 문자 다시 곱씹기',
        healingMission: '조용한 방에서 조명을 낮추고, 가장 편안한 옷으로 갈아입고 멍때리기',
        quote: '나무는 흔들리며 자라고, 선생님의 따뜻한 손길은 언젠가 아이의 마음에 울창한 숲이 됩니다.',
        recommendedTea: '마음을 편안하게 녹여주는 따뜻한 캐모마일 차',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyText = () => {
    if (!prescription) return;
    const text = `[티처토닥 - 오늘의 교사 마음 처방전]\n` +
      `인정 도장: [${prescription.stampTitle}]\n\n` +
      `💝 마음에 보내는 비타민:\n${prescription.heartVitamin}\n\n` +
      `🚫 오늘 퇴근 후 절대 금지:\n${prescription.doNotDo}\n\n` +
      `✨ 오늘 저녁 나를 위한 힐링 미션:\n${prescription.healingMission}\n\n` +
      `☕️ 추천 차: ${prescription.recommendedTea}\n\n` +
      `💌 선배의 한마디: "${prescription.quote}"`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto w-full pb-10">
      <div className="text-center mb-6">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-semibold mb-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          AI 마음 치유 센터
        </span>
        <h2 className="text-2xl sm:text-3xl font-bold font-serif text-stone-800">
          오늘의 교사 마음 처방전
        </h2>
        <p className="text-sm text-stone-600 mt-1 max-w-xl mx-auto">
          병원 처방전보다 더 시급한 것은 상처받은 선생님의 마음을 보듬는 인정과 쉼입니다.
          오늘 하루 수고한 나 자신에게 공식 치유 처방전을 발급해 보세요.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Input Configuration Form */}
        <div className="md:col-span-5 bg-white/90 backdrop-blur-xs p-5 rounded-2xl border border-stone-200/80 shadow-xs space-y-4">
          <h3 className="font-bold text-stone-800 text-sm flex items-center gap-2 border-b border-stone-100 pb-2">
            <Compass className="w-4 h-4 text-amber-600" />
            선생님의 오늘 상태 입력
          </h3>

          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1.5">
              교직 구분
            </label>
            <div className="grid grid-cols-3 gap-1.5 text-xs">
              {['초등 담임', '중·고등 교과', '유치원/특수', '비교과/보건/상담', '부장교사', '기간제/신규'].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setTeacherType(type)}
                  className={`p-2 rounded-lg border text-center font-medium transition cursor-pointer truncate ${
                    teacherType === type
                      ? 'border-amber-500 bg-amber-50 text-amber-900 font-semibold ring-1 ring-amber-300'
                      : 'border-stone-200 bg-stone-50/50 text-stone-600 hover:bg-stone-100'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1.5">
              오늘 가장 나를 짓누른 감정
            </label>
            <div className="grid grid-cols-2 gap-1.5 text-xs">
              {['극심한 번아웃과 탈진', '학부모 민원으로 인한 공포', '학생 생활지도의 무력감', '과중한 잡무와 자책감'].map((em) => (
                <button
                  key={em}
                  type="button"
                  onClick={() => setEmotion(em)}
                  className={`p-2 rounded-lg border text-left font-medium transition cursor-pointer text-[11px] leading-tight ${
                    emotion === em
                      ? 'border-rose-400 bg-rose-50 text-rose-900 font-semibold ring-1 ring-rose-300'
                      : 'border-stone-200 bg-stone-50/50 text-stone-600 hover:bg-stone-100'
                  }`}
                >
                  {em}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1.5">
              오늘 속상했던 일 또는 나에게 해주고 싶은 말 (선택)
            </label>
            <textarea
              value={worries}
              onChange={(e) => setWorries(e.target.value)}
              placeholder="예: 오늘 학부모가 교무실로 찾아와 억지 항의를 해서 하루 종일 심장이 두근거리고 울컥했어요..."
              rows={3}
              className="w-full text-xs p-2.5 rounded-xl border border-stone-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200/50 outline-hidden resize-none"
            />
          </div>

          <button
            onClick={handleGenerate}
            disabled={isLoading}
            className="w-full py-3 bg-gradient-to-r from-amber-600 to-rose-500 hover:from-amber-700 hover:to-rose-600 text-white font-semibold text-sm rounded-xl shadow-xs transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Heart className="w-4 h-4 animate-spin" />
                <span>처방전을 정성껏 작성 중입니다...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>맞춤 마음 처방전 발급하기</span>
              </>
            )}
          </button>
        </div>

        {/* Prescription Display Card */}
        <div className="md:col-span-7 flex flex-col items-center justify-center">
          {prescription ? (
            <div className="w-full bg-[#fdfbf7] border-2 border-amber-300/80 rounded-2xl p-6 sm:p-8 shadow-md relative overflow-hidden text-stone-800">
              {/* Decorative Prescription Background Header */}
              <div className="flex items-center justify-between border-b-2 border-stone-800/10 pb-4 mb-5">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-bold font-serif text-stone-900 tracking-wider">
                      교사 마음 회복 처방전
                    </span>
                    <span className="text-[10px] bg-stone-800 text-white px-2 py-0.5 rounded uppercase tracking-widest font-mono">
                      RX-TODAK
                    </span>
                  </div>
                  <p className="text-xs text-stone-500 mt-0.5">
                    대상자: {teacherType} 선생님 귀하 | 발급일: {new Date().toLocaleDateString('ko-KR')}
                  </p>
                </div>

                {/* Stamp Seal */}
                <div className="relative rotate-[-8deg] shrink-0">
                  <div className="w-20 h-20 rounded-full border-2 border-dashed border-rose-600 flex flex-col items-center justify-center p-1 bg-rose-50/60 shadow-xs">
                    <ShieldCheck className="w-4 h-4 text-rose-600" />
                    <span className="text-[10px] font-bold text-rose-700 text-center leading-tight mt-0.5">
                      {prescription.stampTitle}
                    </span>
                  </div>
                </div>
              </div>

              {/* Heart Vitamin Section */}
              <div className="mb-5 bg-amber-100/50 p-4 rounded-xl border border-amber-200/60">
                <div className="flex items-center gap-2 text-amber-900 font-bold text-xs uppercase tracking-wide mb-1.5">
                  <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
                  <span>오늘 선생님의 마음에 보내는 비타민</span>
                </div>
                <p className="text-sm leading-relaxed text-stone-800 whitespace-pre-wrap font-serif">
                  {prescription.heartVitamin}
                </p>
              </div>

              {/* Two Column Directives: Do Not Do & Healing Mission */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
                <div className="p-3.5 bg-rose-50/70 rounded-xl border border-rose-200/70">
                  <div className="flex items-center gap-1.5 text-rose-800 font-bold text-xs mb-1">
                    <Ban className="w-3.5 h-3.5 text-rose-600" />
                    <span>오늘 퇴근 후 절대 금지</span>
                  </div>
                  <p className="text-xs text-stone-700 leading-relaxed font-medium">
                    {prescription.doNotDo}
                  </p>
                </div>

                <div className="p-3.5 bg-emerald-50/70 rounded-xl border border-emerald-200/70">
                  <div className="flex items-center gap-1.5 text-emerald-800 font-bold text-xs mb-1">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    <span>오늘 나만의 힐링 미션</span>
                  </div>
                  <p className="text-xs text-stone-700 leading-relaxed font-medium">
                    {prescription.healingMission}
                  </p>
                </div>
              </div>

              {/* Recommended Tea & Quote */}
              <div className="space-y-3 pt-3 border-t border-stone-200/70">
                <div className="flex items-center gap-2 text-xs text-stone-600">
                  <Coffee className="w-4 h-4 text-amber-700 shrink-0" />
                  <span>
                    <strong>오늘 어울리는 마음 안정 차:</strong> {prescription.recommendedTea}
                  </span>
                </div>

                <blockquote className="italic text-xs text-stone-600 border-l-2 border-amber-400 pl-3 py-1 font-serif">
                  &ldquo;{prescription.quote}&rdquo;
                </blockquote>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex items-center justify-end gap-2 pt-3 border-t border-stone-200/50">
                <button
                  onClick={handleCopyText}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 flex items-center gap-1.5 cursor-pointer transition"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>복사 완료!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>처방전 복사</span>
                    </>
                  )}
                </button>
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-amber-600 hover:bg-amber-700 text-white flex items-center gap-1.5 cursor-pointer transition shadow-2xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>인쇄 / 저장</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="w-full h-80 rounded-2xl border-2 border-dashed border-stone-300 flex flex-col items-center justify-center p-6 text-center text-stone-400 bg-stone-50/50">
              <Sparkles className="w-10 h-10 text-amber-300 mb-3 animate-pulse" />
              <h4 className="font-serif font-bold text-stone-600 text-base mb-1">
                아직 발급된 처방전이 없습니다
              </h4>
              <p className="text-xs text-stone-500 max-w-sm">
                왼쪽에서 선생님의 오늘 상태와 감정을 선택하신 뒤, [맞춤 마음 처방전 발급하기] 버튼을 눌러주세요.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
