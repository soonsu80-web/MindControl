import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  RefreshCw,
  Copy,
  Check,
  Sparkles,
  Heart,
  FolderArchive,
  History,
  AlertCircle,
  MessageCircle,
  Lightbulb,
  Smile,
  ShieldCheck
} from 'lucide-react';
import { ChatMessage, CounselingSession } from '../types';
import { TODAK_COUNSELOR, QUICK_PROMPTS } from '../data/counselors';

interface ChatCounselingProps {
  onOpenPrescriptionWithContext?: (summary: string) => void;
  onOpenArchive?: () => void;
  resumedSession?: CounselingSession | null;
}

export const ChatCounseling: React.FC<ChatCounselingProps> = ({
  onOpenPrescriptionWithContext,
  onOpenArchive,
  resumedSession,
}) => {
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [sessionTitle, setSessionTitle] = useState<string>('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [recentSessions, setRecentSessions] = useState<CounselingSession[]>([]);
  const [showSessionDrawer, setShowSessionDrawer] = useState(false);
  const [chatMode, setChatMode] = useState<'pingpong' | 'solution'>('pingpong');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const typewriterTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch recent sessions
  const fetchRecentSessions = async () => {
    try {
      const res = await fetch('/api/sessions');
      if (res.ok) {
        const list = await res.json();
        setRecentSessions(list.slice(0, 8));
      }
    } catch (e) {
      console.warn('Failed to fetch recent sessions', e);
    }
  };

  useEffect(() => {
    fetchRecentSessions();
  }, []);

  // When a resumed session is passed from the archive
  useEffect(() => {
    if (resumedSession) {
      if (typewriterTimerRef.current) clearInterval(typewriterTimerRef.current);
      setCurrentSessionId(resumedSession.id);
      setSessionTitle(resumedSession.title);
      setMessages(resumedSession.messages);
      setIsLoading(false);
      setErrorMessage(null);
    } else if (!currentSessionId) {
      startNewBackendSession();
    }
  }, [resumedSession]);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (typewriterTimerRef.current) clearInterval(typewriterTimerRef.current);
    };
  }, []);

  // Initialize or start a brand new session
  const startNewBackendSession = async () => {
    if (typewriterTimerRef.current) clearInterval(typewriterTimerRef.current);
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          counselorId: 'todak',
          counselorName: TODAK_COUNSELOR.name,
          initialMessage: TODAK_COUNSELOR.welcomeMessage,
          tags: ['공감대화'],
        }),
      });

      if (res.ok) {
        const session: CounselingSession = await res.json();
        setCurrentSessionId(session.id);
        setSessionTitle(session.title);
        setMessages(session.messages);
        fetchRecentSessions();
      } else {
        throw new Error('세션 생성 실패');
      }
    } catch (err) {
      console.error('Error starting backend session:', err);
      // Fallback
      setMessages([
        {
          id: 'welcome',
          role: 'model',
          content: TODAK_COUNSELOR.welcomeMessage,
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setIsLoading(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Smooth typewriter reveal for live feel without network hanging risk
  const runTypewriter = (modelMsgId: string, fullText: string) => {
    let index = 0;
    const chunkSize = 3;
    const interval = 18;

    if (typewriterTimerRef.current) clearInterval(typewriterTimerRef.current);

    typewriterTimerRef.current = setInterval(() => {
      index += chunkSize;
      if (index >= fullText.length) {
        if (typewriterTimerRef.current) clearInterval(typewriterTimerRef.current);
        setMessages((prev) =>
          prev.map((m) => (m.id === modelMsgId ? { ...m, content: fullText } : m))
        );
        setIsLoading(false);
      } else {
        const partial = fullText.slice(0, index);
        setMessages((prev) =>
          prev.map((m) => (m.id === modelMsgId ? { ...m, content: partial } : m))
        );
      }
    }, interval);
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isLoading) return;

    if (typewriterTimerRef.current) clearInterval(typewriterTimerRef.current);
    setErrorMessage(null);

    const tempUserMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: Date.now(),
    };

    const modelMsgId = `model-${Date.now()}`;
    const initialModelMsg: ChatMessage = {
      id: modelMsgId,
      role: 'model',
      content: '',
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, tempUserMsg, initialModelMsg]);
    setInputMessage('');
    setIsLoading(true);

    try {
      let activeId = currentSessionId;

      // If no session exists, create one first
      if (!activeId) {
        const createRes = await fetch('/api/sessions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            counselorId: 'todak',
            counselorName: TODAK_COUNSELOR.name,
            initialMessage: TODAK_COUNSELOR.welcomeMessage,
            tags: ['공감대화'],
          }),
        });
        const createdSession: CounselingSession = await createRes.json();
        activeId = createdSession.id;
        setCurrentSessionId(activeId);
      }

      // Safe fetch with 45s timeout controller to guarantee it never hangs
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 45000);

      const response = await fetch(`/api/sessions/${activeId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: text,
          mode: chatMode,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }

      const data = await response.json();
      const fullReply = data.reply || '선생님, 늘 곁에서 온 마음으로 응원하겠습니다.';

      if (data.session?.title) {
        setSessionTitle(data.session.title);
      }

      // If the backend detected that solution mode was used, reflect it if desired
      if (data.mode === 'solution') {
        // user asked for solution, keep as is
      }

      // Run smooth typewriter effect
      runTypewriter(modelMsgId, fullReply);
      fetchRecentSessions();
    } catch (err: any) {
      console.error('Chat error:', err);
      setIsLoading(false);
      const isTimeout = err?.name === 'AbortError';
      const fallbackText = isTimeout
        ? '선생님, 통신 응답에 시간이 조금 더 소요되었습니다. 아래 [다시 시도]를 누르시거나 잠시 후 다시 말씀해 주세요.'
        : '선생님, 잠시 네트워크 상태가 원활하지 않았습니다. 선생님의 노고와 마음은 언제나 소중합니다. 잠시 후 다시 말씀해 주세요.';

      setMessages((prev) =>
        prev.map((m) => (m.id === modelMsgId ? { ...m, content: fallbackText } : m))
      );
      setErrorMessage('통신 지연이 발생했습니다. [다시 시도] 또는 [새 상담 시작]을 누르실 수 있습니다.');
    } finally {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSwitchToPastSession = (s: CounselingSession) => {
    if (typewriterTimerRef.current) clearInterval(typewriterTimerRef.current);
    setCurrentSessionId(s.id);
    setSessionTitle(s.title);
    setMessages(s.messages);
    setIsLoading(false);
    setErrorMessage(null);
    setShowSessionDrawer(false);
  };

  // Conversational continuation chips for seamless back-and-forth ping-pong
  const ONGOING_PINGPONG_CHIPS = [
    '퇴근하고 집에 왔는데도 손이 떨려요.',
    '제가 뭘 잘못한 건지 계속 곱씹게 돼요.',
    '동료들 눈치가 보여서 아무한테도 말을 못 꺼내겠어요.',
    '💡 이럴 땐 현실적으로 어떻게 대처해야 할까요?',
    '따뜻하게 들어주셔서 마음이 조금 편안해졌어요.',
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-8.5rem)] max-w-5xl mx-auto w-full relative">
      {/* Unified Counselor Hero / Status Bar with Mode Switcher */}
      <div className="bg-white/95 backdrop-blur-xs border border-stone-200/80 rounded-2xl p-3.5 mb-3 shadow-xs">
        <div className="flex items-center justify-between gap-3 flex-wrap sm:flex-nowrap">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 to-emerald-500 flex items-center justify-center text-2xl text-white shadow-2xs shrink-0 ring-2 ring-amber-200/70">
              🌱
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-stone-900 text-sm sm:text-base">
                  {TODAK_COUNSELOR.name}
                </h3>
                <span className="text-[11px] font-semibold bg-emerald-100 text-emerald-900 px-2.5 py-0.5 rounded-full border border-emerald-200/60">
                  {chatMode === 'pingpong' ? '🌿 핑퐁 공감 모드' : '💡 현실 조언 모드'}
                </span>
                <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded font-mono hidden sm:inline">
                  ● 정상 작동 중
                </span>
              </div>
              <p className="text-xs text-stone-500 truncate mt-0.5">
                {chatMode === 'pingpong'
                  ? '해결책 강요 없이, 온전히 선생님 마음에 귀 기울이며 2~3문장 티키타카 대화를 나눕니다.'
                  : '선배 교사의 현실적인 실무 대처법, 교권 보호 요령, 관리자 보고 가이드를 안내합니다.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 ml-auto sm:ml-0">
            {/* Mode Switcher Toggle */}
            <div className="inline-flex bg-stone-100 p-0.5 rounded-xl border border-stone-200 text-xs">
              <button
                type="button"
                onClick={() => setChatMode('pingpong')}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg font-medium transition cursor-pointer ${
                  chatMode === 'pingpong'
                    ? 'bg-white text-emerald-800 shadow-2xs font-bold'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
                title="해결책 폭격 없이 편안하게 대화 나누기"
              >
                <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                <span className="hidden md:inline">공감 핑퐁</span>
              </button>
              <button
                type="button"
                onClick={() => setChatMode('solution')}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg font-medium transition cursor-pointer ${
                  chatMode === 'solution'
                    ? 'bg-white text-amber-900 shadow-2xs font-bold'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
                title="현실적인 대처법 및 조언 받기"
              >
                <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
                <span className="hidden md:inline">현실 조언</span>
              </button>
            </div>

            {recentSessions.length > 0 && (
              <button
                onClick={() => setShowSessionDrawer(!showSessionDrawer)}
                className="text-stone-700 hover:text-stone-900 text-xs flex items-center gap-1.5 cursor-pointer transition bg-stone-50 hover:bg-stone-100 px-3 py-1.5 rounded-xl border border-stone-200 shadow-2xs font-medium"
                title="과거 상담 세션 목록"
              >
                <History className="w-3.5 h-3.5 text-amber-600" />
                <span className="hidden lg:inline">지난 상담</span>
                <span className="text-[11px] font-bold text-amber-700">({recentSessions.length})</span>
              </button>
            )}

            <button
              onClick={startNewBackendSession}
              className="text-white bg-amber-600 hover:bg-amber-700 text-xs flex items-center gap-1.5 cursor-pointer transition px-3 py-1.5 rounded-xl shadow-2xs font-semibold"
              title="새 상담 대화 시작"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">새 대화</span>
            </button>
          </div>
        </div>
      </div>

      {/* Past Sessions Drawer */}
      {showSessionDrawer && (
        <div className="absolute top-20 left-0 right-0 z-30 bg-white rounded-2xl border border-stone-300 p-4 shadow-xl animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="flex items-center justify-between pb-2 border-b border-stone-100 mb-3">
            <span className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
              <History className="w-4 h-4 text-amber-600" />
              서버에 보관된 최근 상담 세션
            </span>
            {onOpenArchive && (
              <button
                onClick={onOpenArchive}
                className="text-xs text-amber-700 hover:underline font-semibold flex items-center gap-1 cursor-pointer"
              >
                <span>전체 보관함 가기</span>
                <FolderArchive className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <div className="space-y-1.5 max-h-60 overflow-y-auto">
            {recentSessions.map((s) => (
              <div
                key={s.id}
                onClick={() => handleSwitchToPastSession(s)}
                className={`p-2.5 rounded-xl border text-xs flex items-center justify-between cursor-pointer transition ${
                  currentSessionId === s.id
                    ? 'bg-amber-50 border-amber-300 text-amber-900 font-bold'
                    : 'bg-stone-50 hover:bg-stone-100 border-stone-200 text-stone-700'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <span className="text-base">🌱</span>
                  <span className="truncate">{s.title}</span>
                </div>
                <span className="text-[10px] text-stone-400 shrink-0 ml-2">
                  {new Date(s.updatedAt).toLocaleDateString('ko-KR')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Chat Box */}
      <div className="flex-1 bg-white/95 backdrop-blur-xs border border-stone-200/80 rounded-2xl shadow-xs overflow-hidden flex flex-col">
        {/* Chat Sub-header */}
        <div className="px-4 py-2 bg-stone-50 border-b border-stone-200/80 flex items-center justify-between text-xs text-stone-600">
          <div className="flex items-center gap-2 truncate">
            <span className="font-semibold text-stone-800 truncate">
              {sessionTitle || '토닥 선생님과의 마음 대화'}
            </span>
            {chatMode === 'pingpong' ? (
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                <Smile className="w-3 h-3" />
                성급한 해결책 없이 공감과 경청 중심
              </span>
            ) : (
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                <ShieldCheck className="w-3 h-3" />
                현실적 대처법 및 실무 가이드 모드
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {onOpenPrescriptionWithContext && (
              <button
                onClick={() => {
                  const userIssues = messages
                    .filter((m) => m.role === 'user')
                    .map((m) => m.content)
                    .join(' ');
                  onOpenPrescriptionWithContext(userIssues);
                }}
                className="flex items-center gap-1.5 px-2.5 py-1 bg-gradient-to-r from-amber-500 to-rose-400 hover:from-amber-600 hover:to-rose-500 text-white text-xs font-semibold rounded-lg shadow-2xs transition cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>오늘의 처방전</span>
              </button>
            )}
          </div>
        </div>

        {/* Optional Error Recovery Notice */}
        {errorMessage && (
          <div className="px-4 py-2 bg-amber-50 border-b border-amber-200 flex items-center justify-between text-xs text-amber-800">
            <div className="flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={startNewBackendSession}
              className="text-amber-900 font-bold underline hover:text-amber-950 ml-2"
            >
              새로고침
            </button>
          </div>
        )}

        {/* Scrollable Message List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {messages.map((msg, idx) => {
            const isUser = msg.role === 'user';
            const isLatestLoading = !isUser && isLoading && idx === messages.length - 1;

            return (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-3xl ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-100 to-emerald-100 border border-amber-300 flex items-center justify-center text-base shrink-0 select-none shadow-2xs">
                    🌱
                  </div>
                )}

                <div className="group relative max-w-[85%] sm:max-w-[75%]">
                  <div
                    className={`p-3.5 sm:p-4 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap break-words ${
                      isUser
                        ? 'bg-amber-600 text-white rounded-tr-xs shadow-xs'
                        : 'bg-stone-100/90 text-stone-800 rounded-tl-xs border border-stone-200/70 shadow-2xs'
                    }`}
                  >
                    {msg.content ? (
                      <>
                        {msg.content}
                        {isLatestLoading && (
                          <span className="inline-block w-1.5 h-3.5 bg-amber-600 animate-pulse ml-1 align-middle"></span>
                        )}
                      </>
                    ) : (
                      <span className="flex items-center gap-2 text-stone-500 py-0.5 font-sans">
                        <Heart className="w-3.5 h-3.5 text-rose-400 animate-bounce" />
                        <span className="text-xs">선생님의 마음에 귀 기울이며 답변 작성 중...</span>
                        <span className="inline-block w-1.5 h-3.5 bg-amber-500 animate-pulse ml-0.5"></span>
                      </span>
                    )}
                  </div>

                  {msg.content && (
                    <div
                      className={`flex items-center gap-1.5 mt-1 text-[11px] text-stone-400 px-1 ${
                        isUser ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <span>
                        {new Date(msg.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      {!isUser && !isLatestLoading && (
                        <button
                          onClick={() => handleCopy(msg.id, msg.content)}
                          className="opacity-0 group-hover:opacity-100 hover:text-stone-700 transition cursor-pointer p-0.5 rounded"
                          title="메시지 복사"
                        >
                          {copiedId === msg.id ? (
                            <Check className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          <div ref={messagesEndRef} />
        </div>

        {/* Dynamic Context-Aware Ping-Pong Chips */}
        <div className="px-4 py-2 border-t border-stone-100 bg-stone-50/70">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-semibold text-stone-500 flex items-center gap-1">
              <MessageCircle className="w-3 h-3 text-amber-600" />
              {messages.length <= 2 ? '첫마디 툭 털어놓기 (클릭해서 시작):' : '핑퐁 대화 이어가기:'}
            </span>
            {chatMode === 'pingpong' && (
              <button
                type="button"
                onClick={() => setChatMode('solution')}
                className="text-[11px] text-amber-700 hover:text-amber-900 font-semibold flex items-center gap-1 hover:underline cursor-pointer"
              >
                <Lightbulb className="w-3 h-3 text-amber-600" />
                <span>실무 대처법이 궁금할 땐?</span>
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {(messages.length <= 2 ? QUICK_PROMPTS : ONGOING_PINGPONG_CHIPS).map((prompt, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendMessage(prompt)}
                disabled={isLoading}
                className="text-xs bg-white hover:bg-amber-50 text-stone-700 hover:text-amber-900 border border-stone-200/90 hover:border-amber-300 px-2.5 py-1 rounded-full transition cursor-pointer text-left truncate max-w-full shadow-2xs disabled:opacity-50"
              >
                &ldquo;{prompt}&rdquo;
              </button>
            ))}
          </div>
        </div>

        {/* Input Bar */}
        <div className="p-3 sm:p-4 bg-stone-50/90 border-t border-stone-200">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-end gap-2"
          >
            <div className="flex-1 bg-white border border-stone-300 focus-within:border-amber-500 focus-within:ring-2 focus-within:ring-amber-200/60 rounded-xl overflow-hidden transition shadow-2xs">
              <textarea
                ref={inputRef}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  chatMode === 'pingpong'
                    ? '오늘 속상했던 일, 마음에 걸리는 말을 한 줄만 툭 적어보세요. (예: "오늘 학부모한테 전화왔는데 너무 힘들어요")'
                    : '궁금하신 교권 침해 상황, 대처법, 관리자 보고 요령을 질문해 주세요.'
                }
                rows={2}
                disabled={isLoading}
                className="w-full p-2.5 sm:p-3 text-sm text-stone-800 placeholder-stone-400 resize-none outline-hidden disabled:bg-stone-50"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading || !inputMessage.trim()}
              className="h-11 px-4 bg-amber-600 hover:bg-amber-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer shadow-xs shrink-0"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline text-xs font-semibold">
                {isLoading ? '답변 중...' : '전송'}
              </span>
            </button>
          </form>
          <div className="flex items-center justify-between text-[11px] text-stone-400 mt-1.5 px-1">
            <span>
              {chatMode === 'pingpong'
                ? '🌿 공감 핑퐁 모드: 성급한 해결책 없이 2~3문장으로 편안한 대화를 나눕니다.'
                : '💡 현실 조언 모드: 현장 실무 대응 매뉴얼과 조언을 제공합니다.'}
            </span>
            <span className="hidden sm:inline">엔터(Enter)로 전송</span>
          </div>
        </div>
      </div>
    </div>
  );
};
