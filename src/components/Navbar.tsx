import React, { useState } from 'react';
import { Heart, MessageSquareHeart, Sparkles, Wind, Trash2, ShieldAlert, PhoneCall, X, FolderArchive } from 'lucide-react';
import { SUPPORT_CENTERS } from '../data/resources';

interface NavbarProps {
  activeTab: 'chat' | 'archive' | 'prescribe' | 'shredder' | 'breathe' | 'assessment';
  setActiveTab: (tab: 'chat' | 'archive' | 'prescribe' | 'shredder' | 'breathe' | 'assessment') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  const [showHotlineModal, setShowHotlineModal] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 bg-amber-50/90 backdrop-blur-md border-b border-amber-200/60 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Brand */}
            <div 
              className="flex items-center gap-3 cursor-pointer"
              onClick={() => setActiveTab('chat')}
            >
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-rose-400 flex items-center justify-center text-white shadow-sm ring-2 ring-amber-200/60">
                <Heart className="w-5 h-5 fill-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold text-stone-800 tracking-tight font-serif">
                    티처토닥
                  </h1>
                  <span className="text-[11px] font-medium bg-amber-200/80 text-amber-900 px-2 py-0.5 rounded-full">
                    교사 마음 쉼터
                  </span>
                </div>
                <p className="text-xs text-stone-500 hidden sm:block">
                  선생님의 힘겨운 오늘을 온 마음으로 위로합니다
                </p>
              </div>
            </div>

            {/* Quick Emergency Crisis Center Link */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowHotlineModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-medium border border-rose-200/80 transition-all cursor-pointer shadow-xs"
                title="긴급 심리상담 및 교원치유지원센터 안내"
              >
                <PhoneCall className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
                <span className="hidden sm:inline">긴급 교원 상담</span>
                <span className="text-[11px] font-bold text-rose-600 sm:hidden">1393</span>
              </button>
            </div>
          </div>

          {/* Navigation Bar Tabs */}
          <nav className="flex space-x-1 sm:space-x-2 overflow-x-auto py-2 no-scrollbar border-t border-amber-100/80">
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all cursor-pointer ${
                activeTab === 'chat'
                  ? 'bg-amber-600 text-white shadow-xs font-semibold'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-amber-100/50'
              }`}
            >
              <MessageSquareHeart className="w-4 h-4" />
              <span>토닥 상담소</span>
            </button>

            <button
              onClick={() => setActiveTab('archive')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all cursor-pointer ${
                activeTab === 'archive'
                  ? 'bg-amber-600 text-white shadow-xs font-semibold'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-amber-100/50'
              }`}
            >
              <FolderArchive className="w-4 h-4" />
              <span>상담 보관함</span>
            </button>

            <button
              onClick={() => setActiveTab('prescribe')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all cursor-pointer ${
                activeTab === 'prescribe'
                  ? 'bg-amber-600 text-white shadow-xs font-semibold'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-amber-100/50'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>마음 처방전</span>
            </button>

            <button
              onClick={() => setActiveTab('shredder')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all cursor-pointer ${
                activeTab === 'shredder'
                  ? 'bg-amber-600 text-white shadow-xs font-semibold'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-amber-100/50'
              }`}
            >
              <Trash2 className="w-4 h-4" />
              <span>상처말 분쇄기</span>
            </button>

            <button
              onClick={() => setActiveTab('breathe')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all cursor-pointer ${
                activeTab === 'breathe'
                  ? 'bg-amber-600 text-white shadow-xs font-semibold'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-amber-100/50'
              }`}
            >
              <Wind className="w-4 h-4" />
              <span>3분 숨고르기</span>
            </button>

            <button
              onClick={() => setActiveTab('assessment')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all cursor-pointer ${
                activeTab === 'assessment'
                  ? 'bg-amber-600 text-white shadow-xs font-semibold'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-amber-100/50'
              }`}
            >
              <ShieldAlert className="w-4 h-4" />
              <span>소진도 자가진단</span>
            </button>
          </nav>
        </div>
      </header>

      {/* Emergency Hotline Modal */}
      {showHotlineModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-stone-200 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2 text-rose-600 font-bold text-base">
                <PhoneCall className="w-5 h-5" />
                <span>선생님을 위한 긴급 지원 &amp; 상담 안내</span>
              </div>
              <button
                onClick={() => setShowHotlineModal(false)}
                className="text-stone-400 hover:text-stone-700 p-1 rounded-lg hover:bg-stone-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4 text-sm text-stone-700">
              <div className="p-3.5 bg-rose-50/80 rounded-xl border border-rose-200">
                <p className="font-semibold text-rose-900 text-sm mb-1">
                  선생님, 지금 순간이 감당할 수 없을 만큼 고통스러우신가요?
                </p>
                <p className="text-xs text-rose-800 leading-relaxed">
                  선생님은 혼자가 아니며, 잘못이 아닙니다. 아래 24시간 긴급 전문 상담 전화 또는 시도교육청 교원치유지원센터를 통해 전문가의 보호와 지원을 즉시 받으실 수 있습니다.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold text-stone-900 text-xs uppercase tracking-wider text-stone-500">
                  전국 24시간 긴급 상담 직통전화
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <a
                    href="tel:1393"
                    className="p-3 rounded-xl bg-amber-50 hover:bg-amber-100/80 border border-amber-200 flex flex-col justify-between transition-colors"
                  >
                    <span className="text-xs text-amber-900 font-medium">자살예방 위기상담</span>
                    <span className="text-lg font-bold text-amber-800">☎ 1393</span>
                    <span className="text-[11px] text-amber-700">24시간 무료 비밀보장</span>
                  </a>
                  <a
                    href="tel:1577-0199"
                    className="p-3 rounded-xl bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200 flex flex-col justify-between transition-colors"
                  >
                    <span className="text-xs text-emerald-900 font-medium">정신건강 위기상담</span>
                    <span className="text-lg font-bold text-emerald-800">☎ 1577-0199</span>
                    <span className="text-[11px] text-emerald-700">24시간 전문가 상담</span>
                  </a>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-stone-900 text-xs uppercase tracking-wider text-stone-500 mb-2">
                  시·도 교육청 교원치유지원센터 (심리·법률 무료 지원)
                </h4>
                <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1 border border-stone-100 rounded-xl p-2 bg-stone-50">
                  {SUPPORT_CENTERS.slice(0, 9).map((center) => (
                    <div key={center.region} className="flex items-center justify-between text-xs p-1.5 bg-white rounded-lg border border-stone-200/60">
                      <div>
                        <span className="font-bold text-stone-800 mr-2">[{center.region}]</span>
                        <span className="text-stone-600">{center.name}</span>
                      </div>
                      <a
                        href={`tel:${center.tel}`}
                        className="font-mono font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md hover:bg-amber-100"
                      >
                        {center.tel}
                      </a>
                    </div>
                  ))}
                </div>
                <p className="text-[11px] text-stone-500 mt-2">
                  * 각 교육청 교원치유지원센터는 연간 100~250만원 상당의 전문 심리상담비 및 교권 침해 변호사 동행을 전액 지원합니다.
                </p>
              </div>
            </div>

            <div className="mt-5 text-right">
              <button
                onClick={() => setShowHotlineModal(false)}
                className="px-4 py-2 bg-stone-800 text-white text-xs font-semibold rounded-xl hover:bg-stone-700 transition cursor-pointer"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
