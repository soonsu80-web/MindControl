import { useState } from 'react';
import { Navbar } from './components/Navbar';
import { ChatCounseling } from './components/ChatCounseling';
import { CounselingArchive } from './components/CounselingArchive';
import { MindPrescriptionView } from './components/MindPrescriptionView';
import { EmotionalShredder } from './components/EmotionalShredder';
import { BreathingDecompression } from './components/BreathingDecompression';
import { BurnoutAssessment } from './components/BurnoutAssessment';
import { CounselingSession } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<'chat' | 'archive' | 'prescribe' | 'shredder' | 'breathe' | 'assessment'>('chat');
  const [prescriptionContext, setPrescriptionContext] = useState<string>('');
  const [resumedSession, setResumedSession] = useState<CounselingSession | null>(null);

  const handleOpenPrescriptionWithContext = (summary: string) => {
    setPrescriptionContext(summary);
    setActiveTab('prescribe');
  };

  const handleResumeSession = (session: CounselingSession) => {
    setResumedSession(session);
    setActiveTab('chat');
  };

  return (
    <div className="min-h-screen bg-[#fcfaf7] text-stone-800 flex flex-col font-sans selection:bg-amber-200 selection:text-amber-900">
      {/* Top Navbar */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-4 sm:py-6 flex flex-col">
        {activeTab === 'chat' && (
          <ChatCounseling
            onOpenPrescriptionWithContext={handleOpenPrescriptionWithContext}
            onOpenArchive={() => setActiveTab('archive')}
            resumedSession={resumedSession}
          />
        )}
        {activeTab === 'archive' && (
          <CounselingArchive onResumeSession={handleResumeSession} />
        )}
        {activeTab === 'prescribe' && (
          <MindPrescriptionView initialWorries={prescriptionContext} />
        )}
        {activeTab === 'shredder' && <EmotionalShredder />}
        {activeTab === 'breathe' && <BreathingDecompression />}
        {activeTab === 'assessment' && (
          <BurnoutAssessment onStartCounseling={() => setActiveTab('chat')} />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-amber-200/40 bg-amber-50/40 py-4 mt-auto">
        <div className="max-w-6xl mx-auto px-4 text-center text-xs text-stone-500 space-y-1">
          <p className="font-medium text-stone-600">
            &ldquo;교실의 문을 열고 아이들을 마주하는 선생님은 매일 작은 기적을 만들고 계십니다.&rdquo;
          </p>
          <p className="text-[11px] text-stone-400">
            티처토닥 (Teacher Todak) &bull; 대한민국 선생님의 지친 마음을 위로하는 24시간 AI 안심 쉼터 &bull; Gemini 3.8 Flash 기반
          </p>
        </div>
      </footer>
    </div>
  );
}
