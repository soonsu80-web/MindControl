import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Wind, Bell, CloudRain } from 'lucide-react';
import { soundEngine } from '../utils/audio';

type BreathPhase = 'inhale' | 'hold' | 'exhale' | 'pause';

export const BreathingDecompression: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<'478' | 'box'>('478');
  const [phase, setPhase] = useState<BreathPhase>('inhale');
  const [phaseSecondsLeft, setPhaseSecondsLeft] = useState(4);
  const [totalSecondsLeft, setTotalSecondsLeft] = useState(180); // 3 minutes
  const [activeSound, setActiveSound] = useState<'rain' | 'wind' | null>(null);

  // 4-7-8 timing: Inhale 4s -> Hold 7s -> Exhale 8s
  // Box timing: Inhale 4s -> Hold 4s -> Exhale 4s -> Pause 4s
  useEffect(() => {
    let interval: any = null;

    if (isActive) {
      interval = setInterval(() => {
        // Decrease total timer
        setTotalSecondsLeft((prev) => {
          if (prev <= 1) {
            setIsActive(false);
            soundEngine.playSingingBowl();
            return 180;
          }
          return prev - 1;
        });

        // Handle breath phases
        setPhaseSecondsLeft((prev) => {
          if (prev > 1) {
            return prev - 1;
          }

          // Transition to next phase
          if (mode === '478') {
            if (phase === 'inhale') {
              setPhase('hold');
              return 7;
            } else if (phase === 'hold') {
              setPhase('exhale');
              return 8;
            } else {
              setPhase('inhale');
              return 4;
            }
          } else {
            // Box breathing
            if (phase === 'inhale') {
              setPhase('hold');
              return 4;
            } else if (phase === 'hold') {
              setPhase('exhale');
              return 4;
            } else if (phase === 'exhale') {
              setPhase('pause');
              return 4;
            } else {
              setPhase('inhale');
              return 4;
            }
          }
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isActive, phase, mode]);

  const toggleTimer = () => {
    if (!isActive) {
      soundEngine.playSingingBowl();
    }
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setTotalSecondsLeft(180);
    setPhase('inhale');
    setPhaseSecondsLeft(4);
  };

  const handleSoundToggle = (type: 'rain' | 'wind') => {
    if (activeSound === type) {
      soundEngine.stopAmbient();
      setActiveSound(null);
    } else {
      soundEngine.startAmbient(type);
      setActiveSound(type);
    }
  };

  const getPhaseText = () => {
    switch (phase) {
      case 'inhale':
        return '코로 천천히 깊게 들이마십니다';
      case 'hold':
        return '숨을 편안하게 멈추고 온몸의 긴장을 놓습니다';
      case 'exhale':
        return '입으로 후- 하고 길게 내쉽니다';
      case 'pause':
        return '잠시 멈추고 고요함을 느낍니다';
    }
  };

  const getCircleScaleClass = () => {
    if (!isActive) return 'scale-90';
    if (phase === 'inhale') return 'scale-125 transition-transform duration-[4000ms] ease-out';
    if (phase === 'hold') return 'scale-125';
    if (phase === 'exhale') return 'scale-85 transition-transform duration-[8000ms] ease-in';
    return 'scale-85';
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="max-w-3xl mx-auto w-full pb-10">
      <div className="text-center mb-6">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-100 text-teal-800 text-xs font-semibold mb-2">
          <Wind className="w-3.5 h-3.5 text-teal-600" />
          신경계 안정 &amp; 교감신경 이완
        </span>
        <h2 className="text-2xl sm:text-3xl font-bold font-serif text-stone-800">
          교무실 3분 숨고르기
        </h2>
        <p className="text-sm text-stone-600 mt-1 max-w-lg mx-auto">
          학부모 상담 직후, 또는 수업 후 가슴이 쿵쾅거리고 손이 떨릴 때
          3분 동안 시각화 원을 바라보며 호흡을 따라오세요.
        </p>
      </div>

      <div className="bg-white/90 backdrop-blur-xs rounded-2xl border border-stone-200/80 p-6 sm:p-8 shadow-xs flex flex-col items-center">
        {/* Breathing Mode Selector */}
        <div className="flex items-center gap-2 mb-8 bg-stone-100 p-1 rounded-xl">
          <button
            onClick={() => {
              setMode('478');
              resetTimer();
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              mode === '478'
                ? 'bg-white text-stone-800 shadow-2xs'
                : 'text-stone-500 hover:text-stone-700'
            }`}
          >
            4-7-8 이완 호흡 (불안·분노 진정)
          </button>
          <button
            onClick={() => {
              setMode('box');
              resetTimer();
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              mode === 'box'
                ? 'bg-white text-stone-800 shadow-2xs'
                : 'text-stone-500 hover:text-stone-700'
            }`}
          >
            박스 호흡 (멘탈 집중 &amp; 평정심)
          </button>
        </div>

        {/* Breathing Visualization Orb */}
        <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center my-4">
          {/* Outer glow ring */}
          <div
            className={`absolute inset-0 rounded-full bg-gradient-to-tr from-teal-200/40 via-emerald-200/30 to-amber-200/40 blur-xl transition-all duration-1000 ${
              isActive ? 'opacity-90 scale-110' : 'opacity-40 scale-90'
            }`}
          />

          {/* Main animated orb */}
          <div
            className={`w-52 h-52 sm:w-60 sm:h-60 rounded-full bg-gradient-to-br from-teal-400/90 via-emerald-500/80 to-amber-400/80 flex flex-col items-center justify-center shadow-lg text-white p-6 text-center transform transition-all ${getCircleScaleClass()}`}
          >
            <span className="text-xs uppercase tracking-widest font-semibold opacity-90 mb-1">
              {phase === 'inhale' ? '들이마시기' : phase === 'hold' ? '숨 멈추기' : phase === 'exhale' ? '내쉬기' : '휴식'}
            </span>
            <span className="text-4xl font-extrabold font-mono tracking-tight">
              {phaseSecondsLeft}초
            </span>
            <span className="text-xs font-medium opacity-90 mt-2 px-2">
              {getPhaseText()}
            </span>
          </div>
        </div>

        {/* Remaining Session Time */}
        <div className="mt-6 text-center">
          <span className="text-xs text-stone-400 block mb-0.5">남은 쉼표 시간</span>
          <span className="text-xl font-bold font-mono text-stone-700">
            {formatTime(totalSecondsLeft)}
          </span>
        </div>

        {/* Control Buttons */}
        <div className="flex items-center gap-3 mt-6">
          <button
            onClick={toggleTimer}
            className={`px-6 py-2.5 rounded-xl text-white font-semibold text-sm flex items-center gap-2 shadow-xs transition cursor-pointer ${
              isActive
                ? 'bg-stone-700 hover:bg-stone-800'
                : 'bg-emerald-600 hover:bg-emerald-700'
            }`}
          >
            {isActive ? (
              <>
                <Pause className="w-4 h-4" />
                <span>일시 정지</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white" />
                <span>호흡 시작하기</span>
              </>
            )}
          </button>

          <button
            onClick={resetTimer}
            className="p-2.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-100 text-stone-600 transition cursor-pointer shadow-2xs"
            title="처음으로 리셋"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={() => soundEngine.playSingingBowl()}
            className="p-2.5 rounded-xl border border-stone-200 bg-amber-50 hover:bg-amber-100 text-amber-800 transition cursor-pointer shadow-2xs flex items-center gap-1.5 text-xs font-medium"
            title="432Hz 치유 싱잉볼 울리기"
          >
            <Bell className="w-4 h-4 text-amber-600" />
            <span className="hidden sm:inline">싱잉볼</span>
          </button>
        </div>

        {/* Ambient Nature Sound Controller */}
        <div className="mt-8 pt-6 border-t border-stone-100 w-full max-w-md">
          <div className="flex items-center justify-between mb-3 text-xs text-stone-500 font-semibold">
            <span className="flex items-center gap-1.5">
              <Volume2 className="w-3.5 h-3.5 text-stone-400" />
              배경 마음안정 ASMR 사운드
            </span>
            {activeSound && (
              <button
                onClick={() => {
                  soundEngine.stopAmbient();
                  setActiveSound(null);
                }}
                className="text-stone-400 hover:text-stone-600 flex items-center gap-1"
              >
                <VolumeX className="w-3 h-3" />
                <span>음소거</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleSoundToggle('rain')}
              className={`p-2.5 rounded-xl border text-xs font-medium flex items-center justify-center gap-2 transition cursor-pointer ${
                activeSound === 'rain'
                  ? 'border-teal-500 bg-teal-50 text-teal-800 ring-1 ring-teal-300'
                  : 'border-stone-200 hover:bg-stone-50 text-stone-600'
              }`}
            >
              <CloudRain className="w-4 h-4 text-teal-600" />
              <span>포근한 빗소리 {activeSound === 'rain' && '●'}</span>
            </button>

            <button
              onClick={() => handleSoundToggle('wind')}
              className={`p-2.5 rounded-xl border text-xs font-medium flex items-center justify-center gap-2 transition cursor-pointer ${
                activeSound === 'wind'
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-800 ring-1 ring-emerald-300'
                  : 'border-stone-200 hover:bg-stone-50 text-stone-600'
              }`}
            >
              <Wind className="w-4 h-4 text-emerald-600" />
              <span>숲속 솔바람 {activeSound === 'wind' && '●'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
