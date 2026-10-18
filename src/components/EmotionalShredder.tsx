import React, { useState } from 'react';
import { Trash2, Sparkles, Flame, CheckCircle, RefreshCw, ShieldAlert, Heart } from 'lucide-react';
import { VentCleanseResult } from '../types';

export const EmotionalShredder: React.FC = () => {
  const [toxicText, setToxicText] = useState('');
  const [isShredding, setIsShredding] = useState(false);
  const [result, setResult] = useState<VentCleanseResult | null>(null);

  const sampleToxicPhrases = [
    '선생님이 애를 어떻게 지도했길래 우리 애가 이 모양이에요?',
    '당장 내일 교장실로 쫓아갈 테니 기다리세요!',
    '선생님들 방학 때 놀면서 월급 받는 거 다 세금 낭비 아닌가요?',
    '담임선생님 때문에 우리 애 인생 망쳤어요.',
  ];

  const handleShredAndCleanse = async () => {
    if (!toxicText.trim()) return;

    setIsShredding(true);
    setResult(null);

    try {
      const response = await fetch('/api/vent-cleanse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ toxicText }),
      });

      const data = await response.json();
      // Give a little time for paper animation to finish
      setTimeout(() => {
        setResult(data);
        setIsShredding(false);
      }, 1200);
    } catch (e) {
      console.error(e);
      setTimeout(() => {
        setResult({
          reframedTruth: '그 비수 같은 말은 결코 선생님의 본질이나 교사로서의 가치를 정의할 수 없습니다. 상대방의 미성숙한 불안과 분노의 투사일 뿐입니다.',
          comfortMessage: '선생님, 그 독기 어린 말을 마음에 담아두지 마세요. 선생님은 오늘도 수많은 위험과 혼란 속에서 교실을 지켜내신 소중한 분입니다.',
          affirmation: '나는 부당한 비난에 흔들리지 않으며, 존중받아 마땅한 훌륭한 교육자입니다.',
        });
        setIsShredding(false);
      }, 1000);
    }
  };

  const handleReset = () => {
    setToxicText('');
    setResult(null);
  };

  return (
    <div className="max-w-3xl mx-auto w-full pb-10">
      <div className="text-center mb-6">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 text-rose-800 text-xs font-semibold mb-2">
          <Trash2 className="w-3.5 h-3.5 text-rose-600" />
          상처 배출 &amp; 심리 정화
        </span>
        <h2 className="text-2xl sm:text-3xl font-bold font-serif text-stone-800">
          상처가 된 말 분쇄기
        </h2>
        <p className="text-sm text-stone-600 mt-1 max-w-lg mx-auto">
          가슴에 비수처럼 꽂힌 학부모의 폭언이나 억울한 말들을 이곳에 적고 파쇄기에 갈아버리세요.
          AI 심리상담사가 그 말에 담긴 거짓을 해체하고 정화된 진실을 돌려드립니다.
        </p>
      </div>

      {!result ? (
        <div className="bg-white/90 backdrop-blur-xs rounded-2xl border border-stone-200 p-6 shadow-sm">
          <div className="mb-4">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-rose-500" />
                마음에 상처를 남긴 독설이나 비수를 적어주세요
              </label>
            </div>
            <textarea
              value={toxicText}
              onChange={(e) => setToxicText(e.target.value)}
              placeholder="예: 학부모가 '선생님 자질이 의심스럽다, 당장 민원 넣겠다'라며 소리 질렀던 말..."
              rows={4}
              disabled={isShredding}
              className={`w-full p-4 rounded-xl text-sm border transition outline-hidden ${
                isShredding
                  ? 'bg-rose-50 border-rose-300 text-rose-800 line-through opacity-70'
                  : 'bg-stone-50 border-stone-300 focus:bg-white focus:border-rose-400 focus:ring-2 focus:ring-rose-200/50 text-stone-800'
              }`}
            />
          </div>

          {/* Quick Click Samples */}
          <div className="mb-6">
            <span className="text-[11px] font-semibold text-stone-400 block mb-1.5">
              자주 들리는 마음 아픈 말 예시:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {sampleToxicPhrases.map((phrase, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setToxicText(phrase)}
                  disabled={isShredding}
                  className="text-xs bg-stone-100 hover:bg-rose-50 hover:text-rose-800 text-stone-600 px-2.5 py-1 rounded-full border border-stone-200 transition cursor-pointer"
                >
                  &ldquo;{phrase}&rdquo;
                </button>
              ))}
            </div>
          </div>

          {/* Shredding Animation or Action Button */}
          {isShredding ? (
            <div className="p-6 bg-rose-50/70 border border-rose-200 rounded-xl text-center space-y-3">
              <div className="flex justify-center items-center gap-2">
                <Flame className="w-6 h-6 text-rose-600 animate-bounce" />
                <span className="font-bold text-rose-800 text-sm">
                  비수 같은 말을 갈기갈기 분쇄하고 태우는 중...
                </span>
              </div>
              <p className="text-xs text-rose-600">
                선생님의 가슴을 찌르던 독기를 모두 날려 보내고 있습니다. 잠시만 숨을 고르세요.
              </p>
              <div className="w-full bg-rose-200 h-2 rounded-full overflow-hidden">
                <div className="bg-rose-500 h-full animate-[pulse_1s_ease-in-out_infinite] w-full"></div>
              </div>
            </div>
          ) : (
            <button
              onClick={handleShredAndCleanse}
              disabled={!toxicText.trim()}
              className="w-full py-3.5 bg-gradient-to-r from-rose-500 to-amber-600 hover:from-rose-600 hover:to-amber-700 disabled:opacity-40 text-white font-bold text-sm rounded-xl shadow-xs transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>상처 지우고 정화하기</span>
            </button>
          )}
        </div>
      ) : (
        /* Purified & Reframed Card */
        <div className="bg-white/95 rounded-2xl border-2 border-emerald-300 p-6 sm:p-8 shadow-md space-y-6 animate-in fade-in zoom-in-95 duration-300">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <div className="flex items-center gap-2 text-emerald-700 font-bold text-base">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
              <span>정화 완료: 그 말은 선생님의 잘못이 아닙니다</span>
            </div>
            <button
              onClick={handleReset}
              className="text-xs text-stone-500 hover:text-stone-800 flex items-center gap-1 bg-stone-100 hover:bg-stone-200 px-2.5 py-1 rounded-lg transition cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>다른 상처 비우기</span>
            </button>
          </div>

          {/* Reframed Truth */}
          <div className="p-4 bg-emerald-50/70 rounded-xl border border-emerald-200">
            <h4 className="text-xs font-bold text-emerald-900 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              인지적 재구성 (심리학적 진실)
            </h4>
            <p className="text-sm text-stone-800 leading-relaxed">
              {result.reframedTruth}
            </p>
          </div>

          {/* Warm Comfort Message */}
          <div className="p-4 bg-amber-50/70 rounded-xl border border-amber-200">
            <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
              선생님께 드리는 온기
            </h4>
            <p className="text-sm text-stone-800 leading-relaxed font-serif">
              {result.comfortMessage}
            </p>
          </div>

          {/* Daily Affirmation */}
          <div className="p-4 bg-purple-50/70 rounded-xl border border-purple-200 text-center">
            <span className="text-[11px] font-bold text-purple-700 uppercase tracking-widest block mb-1">
              오늘 거울을 보며 나에게 전할 확언
            </span>
            <p className="text-base font-bold text-purple-900 font-serif">
              &ldquo;{result.affirmation}&rdquo;
            </p>
          </div>

          <div className="text-center pt-2">
            <p className="text-xs text-stone-400">
              오늘 하루도 교실을 위해 온 마음을 바친 선생님, 고맙습니다. 그리고 참 수고 많으셨습니다.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
