import React, { useState, useEffect } from 'react';
import {
  FolderArchive,
  Search,
  Filter,
  Trash2,
  Edit3,
  Check,
  Sparkles,
  BarChart3,
  Download,
  Upload,
  Calendar,
  MessageSquare,
  BookOpen,
  Heart,
  ChevronRight,
  Bookmark,
  X,
  FileText
} from 'lucide-react';
import { CounselingSession, PrescriptionRecord, AnalyticsData } from '../types';

interface CounselingArchiveProps {
  onResumeSession: (session: CounselingSession) => void;
}

export const CounselingArchive: React.FC<CounselingArchiveProps> = ({ onResumeSession }) => {
  const [subTab, setSubTab] = useState<'sessions' | 'prescriptions' | 'analytics' | 'backup'>('sessions');
  const [sessions, setSessions] = useState<CounselingSession[]>([]);
  const [prescriptions, setPrescriptions] = useState<PrescriptionRecord[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [counselorFilter, setCounselorFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Selected session for detailed transcript & memo edit
  const [activeSession, setActiveSession] = useState<CounselingSession | null>(null);
  const [editingMemo, setEditingMemo] = useState('');
  const [editingTitle, setEditingTitle] = useState('');
  const [newTagInput, setNewTagInput] = useState('');
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [isSavingMemo, setIsSavingMemo] = useState(false);

  // Selected prescription modal
  const [activePrescription, setActivePrescription] = useState<PrescriptionRecord | null>(null);

  const fetchSessions = async () => {
    try {
      let url = '/api/sessions?';
      if (counselorFilter !== 'all') url += `counselorId=${counselorFilter}&`;
      if (statusFilter !== 'all') url += `status=${statusFilter}&`;
      if (selectedTag) url += `tag=${encodeURIComponent(selectedTag)}&`;
      if (searchQuery.trim()) url += `search=${encodeURIComponent(searchQuery.trim())}&`;

      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setSessions(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchPrescriptions = async () => {
    try {
      const res = await fetch('/api/prescriptions');
      if (res.ok) {
        const data = await res.json();
        setPrescriptions(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const res = await fetch('/api/analytics');
      if (res.ok) {
        const data = await res.json();
        setAnalytics(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    setIsLoading(true);
    Promise.all([fetchSessions(), fetchPrescriptions(), fetchAnalytics()]).finally(() => {
      setIsLoading(false);
    });
  }, [counselorFilter, statusFilter, selectedTag]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchSessions();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleDeleteSession = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('이 상담 기록을 백엔드 서버에서 영구 삭제하시겠습니까?')) {
      try {
        const res = await fetch(`/api/sessions/${id}`, { method: 'DELETE' });
        if (res.ok) {
          setSessions((prev) => prev.filter((s) => s.id !== id));
          if (activeSession?.id === id) setActiveSession(null);
          fetchAnalytics();
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleOpenSessionModal = (session: CounselingSession) => {
    setActiveSession(session);
    setEditingMemo(session.teacherMemo || '');
    setEditingTitle(session.title);
  };

  const handleSaveSessionDetails = async () => {
    if (!activeSession) return;
    setIsSavingMemo(true);
    try {
      const res = await fetch(`/api/sessions/${activeSession.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editingTitle,
          teacherMemo: editingMemo,
        }),
      });
      if (res.ok) {
        const updated = await res.json();
        setActiveSession(updated);
        setSessions((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSavingMemo(false);
    }
  };

  const handleAddTag = async () => {
    if (!activeSession || !newTagInput.trim()) return;
    const tag = newTagInput.trim().replace(/^#/, '');
    if (activeSession.tags.includes(tag)) {
      setNewTagInput('');
      return;
    }
    const updatedTags = [...activeSession.tags, tag];
    try {
      const res = await fetch(`/api/sessions/${activeSession.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tags: updatedTags }),
      });
      if (res.ok) {
        const updated = await res.json();
        setActiveSession(updated);
        setSessions((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
        setNewTagInput('');
        fetchAnalytics();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleRemoveTag = async (tagToRemove: string) => {
    if (!activeSession) return;
    const updatedTags = activeSession.tags.filter((t) => t !== tagToRemove);
    try {
      const res = await fetch(`/api/sessions/${activeSession.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tags: updatedTags }),
      });
      if (res.ok) {
        const updated = await res.json();
        setActiveSession(updated);
        setSessions((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
        fetchAnalytics();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAutoSummarize = async () => {
    if (!activeSession) return;
    setIsSummarizing(true);
    try {
      const res = await fetch(`/api/sessions/${activeSession.id}/summarize`, {
        method: 'POST',
      });
      if (res.ok) {
        const updated = await res.json();
        setActiveSession(updated);
        setSessions((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
        fetchAnalytics();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSummarizing(false);
    }
  };

  const handleTogglePrescriptionFavorite = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await fetch(`/api/prescriptions/${id}/favorite`, { method: 'PATCH' });
      if (res.ok) {
        const updated = await res.json();
        setPrescriptions((prev) => prev.map((p) => (p.id === id ? updated : p)));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeletePrescription = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('이 처방전을 삭제하시겠습니까?')) {
      try {
        const res = await fetch(`/api/prescriptions/${id}`, { method: 'DELETE' });
        if (res.ok) {
          setPrescriptions((prev) => prev.filter((p) => p.id !== id));
          if (activePrescription?.id === id) setActivePrescription(null);
          fetchAnalytics();
        }
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        const res = await fetch('/api/import', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(json),
        });
        if (res.ok) {
          alert('상담 데이터가 백엔드 서버에 성공적으로 복원되었습니다.');
          fetchSessions();
          fetchPrescriptions();
          fetchAnalytics();
        } else {
          alert('복원에 실패했습니다. 파일 형식을 확인해주세요.');
        }
      } catch (err) {
        alert('올바른 JSON 백업 파일이 아닙니다.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="max-w-5xl mx-auto w-full pb-12">
      {/* Header */}
      <div className="text-center mb-6">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-semibold mb-2">
          <FolderArchive className="w-3.5 h-3.5 text-amber-600" />
          서버 데이터 관리 &amp; 아카이브
        </span>
        <h2 className="text-2xl sm:text-3xl font-bold font-serif text-stone-800">
          선생님의 상담 기록 보관함
        </h2>
        <p className="text-sm text-stone-600 mt-1 max-w-xl mx-auto">
          백엔드 서버에 안전하게 암호화 보관된 상담 대화 일지, 나만의 비밀 메모, 마음 처방전과 통계를 확인하고 관리하세요.
        </p>
      </div>

      {/* Sub-tab Navigation */}
      <div className="flex items-center justify-center gap-2 mb-6">
        <div className="bg-stone-200/60 p-1 rounded-xl flex items-center space-x-1">
          <button
            onClick={() => setSubTab('sessions')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
              subTab === 'sessions'
                ? 'bg-white text-stone-800 shadow-2xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>상담 세션 ({sessions.length})</span>
          </button>

          <button
            onClick={() => setSubTab('prescriptions')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
              subTab === 'prescriptions'
                ? 'bg-white text-stone-800 shadow-2xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>마음 처방전 ({prescriptions.length})</span>
          </button>

          <button
            onClick={() => setSubTab('analytics')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
              subTab === 'analytics'
                ? 'bg-white text-stone-800 shadow-2xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>감정 통계 분석</span>
          </button>

          <button
            onClick={() => setSubTab('backup')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
              subTab === 'backup'
                ? 'bg-white text-stone-800 shadow-2xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>백업 및 복원</span>
          </button>
        </div>
      </div>

      {/* ===================== */}
      {/* 1. SESSIONS TAB */}
      {/* ===================== */}
      {subTab === 'sessions' && (
        <div className="space-y-4">
          {/* Search & Filter Bar */}
          <div className="bg-white/90 p-4 rounded-2xl border border-stone-200/80 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="상담 내용, 제목, 메모 검색..."
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-stone-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200/50 outline-hidden bg-stone-50 focus:bg-white"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto no-scrollbar">
              <div className="flex items-center gap-1 text-xs text-stone-500 font-medium shrink-0">
                <Filter className="w-3.5 h-3.5" />
                <span>필터:</span>
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-xs p-1.5 rounded-lg border border-stone-300 bg-stone-50 text-stone-700 outline-hidden font-medium"
              >
                <option value="all">전체 상태</option>
                <option value="ongoing">진행 중</option>
                <option value="completed">완료됨</option>
              </select>

              {selectedTag && (
                <button
                  onClick={() => setSelectedTag(null)}
                  className="px-2 py-1 bg-amber-100 text-amber-900 text-xs rounded-lg flex items-center gap-1 font-semibold shrink-0"
                >
                  <span>#{selectedTag}</span>
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {/* Session Cards List */}
          {sessions.length === 0 ? (
            <div className="bg-white/80 rounded-2xl border-2 border-dashed border-stone-200 p-12 text-center text-stone-400">
              <MessageSquare className="w-10 h-10 mx-auto mb-2 text-stone-300" />
              <p className="font-semibold text-stone-600 text-sm">조건에 맞는 상담 기록이 없습니다.</p>
              <p className="text-xs mt-1">토닥 상담소에서 새로운 상담을 시작해 보세요.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {sessions.map((s) => (
                <div
                  key={s.id}
                  onClick={() => handleOpenSessionModal(s)}
                  className="p-4 sm:p-5 bg-white/95 hover:bg-stone-50/80 rounded-2xl border border-stone-200/80 hover:border-amber-300 transition shadow-2xs hover:shadow-xs cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
                >
                  <div className="flex items-start gap-3.5 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-xl shrink-0">
                      {s.counselorId === 'mentor' ? '👩‍🏫' : s.counselorId === 'psychologist' ? '🌿' : s.counselorId === 'rights' ? '🛡️' : s.counselorId === 'cheer' ? '✨' : '🌱'}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-bold text-stone-900 text-sm truncate">
                          {s.title}
                        </span>
                        <span className="text-[11px] font-medium bg-stone-100 text-stone-600 px-2 py-0.5 rounded-md">
                          {s.counselorName}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            s.status === 'completed'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {s.status === 'completed' ? '상담 완료' : '진행 중'}
                        </span>
                      </div>

                      {s.summary ? (
                        <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                          {s.summary}
                        </p>
                      ) : (
                        <p className="text-xs text-stone-400 italic">
                          최근 메시지: {s.messages[s.messages.length - 1]?.content.slice(0, 60)}...
                        </p>
                      )}

                      {/* Tags & Time */}
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        {s.tags.map((tag) => (
                          <span
                            key={tag}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedTag(tag);
                            }}
                            className="text-[11px] text-amber-800 bg-amber-50/80 hover:bg-amber-100 px-2 py-0.5 rounded-md border border-amber-200/50"
                          >
                            #{tag}
                          </span>
                        ))}
                        <span className="text-[11px] text-stone-400 flex items-center gap-1 ml-auto sm:ml-2">
                          <Calendar className="w-3 h-3" />
                          {new Date(s.updatedAt).toLocaleDateString('ko-KR')}
                        </span>
                        <span className="text-[11px] text-stone-400">
                          (메시지 {s.messages.length}개)
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onResumeSession(s);
                      }}
                      className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1 transition shadow-2xs"
                      title="이어서 상담하기"
                    >
                      <span>이어하기</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => handleDeleteSession(s.id, e)}
                      className="p-2 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                      title="세션 삭제"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ===================== */}
      {/* 2. PRESCRIPTIONS TAB */}
      {/* ===================== */}
      {subTab === 'prescriptions' && (
        <div className="space-y-4">
          {prescriptions.length === 0 ? (
            <div className="bg-white/80 rounded-2xl border-2 border-dashed border-stone-200 p-12 text-center text-stone-400">
              <Sparkles className="w-10 h-10 mx-auto mb-2 text-amber-300" />
              <p className="font-semibold text-stone-600 text-sm">보관된 마음 처방전이 없습니다.</p>
              <p className="text-xs mt-1">[마음 처방전] 메뉴에서 나를 위한 처방전을 발급받아 보세요.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {prescriptions.map((record) => (
                <div
                  key={record.id}
                  onClick={() => setActivePrescription(record)}
                  className="p-5 bg-[#fdfbf7] rounded-2xl border-2 border-amber-200/80 hover:border-amber-400 transition shadow-2xs hover:shadow-xs cursor-pointer relative flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3 border-b border-stone-200/60 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold font-serif text-stone-900">
                          {record.teacherType} 마음 처방전
                        </span>
                        <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-mono">
                          {new Date(record.createdAt).toLocaleDateString('ko-KR')}
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => handleTogglePrescriptionFavorite(record.id, e)}
                          className={`p-1 rounded-md transition ${
                            record.favorite ? 'text-amber-500 fill-amber-500' : 'text-stone-300 hover:text-stone-500'
                          }`}
                        >
                          <Bookmark className={`w-4 h-4 ${record.favorite ? 'fill-amber-500' : ''}`} />
                        </button>
                        <button
                          onClick={(e) => handleDeletePrescription(record.id, e)}
                          className="p-1 text-stone-400 hover:text-rose-600 rounded-md transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Stamp Title */}
                    <div className="inline-block px-2.5 py-1 rounded-md bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold mb-2">
                      인정: {record.prescription.stampTitle}
                    </div>

                    <p className="text-xs text-stone-700 line-clamp-3 leading-relaxed font-serif">
                      {record.prescription.heartVitamin}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-stone-200/60 flex items-center justify-between text-[11px] text-stone-500">
                    <span className="italic truncate max-w-[200px]">
                      &ldquo;{record.prescription.quote}&rdquo;
                    </span>
                    <span className="text-amber-700 font-semibold flex items-center gap-1">
                      <span>자세히 보기</span>
                      <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ===================== */}
      {/* 3. ANALYTICS TAB */}
      {/* ===================== */}
      {subTab === 'analytics' && analytics && (
        <div className="space-y-6">
          {/* Overview Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 bg-white rounded-2xl border border-stone-200 shadow-2xs text-center">
              <span className="text-xs text-stone-500 font-medium">총 누적 상담 세션</span>
              <p className="text-2xl font-bold font-mono text-amber-700 mt-1">{analytics.totalSessions}회</p>
            </div>
            <div className="p-4 bg-white rounded-2xl border border-stone-200 shadow-2xs text-center">
              <span className="text-xs text-stone-500 font-medium">나눈 위로 메시지</span>
              <p className="text-2xl font-bold font-mono text-emerald-700 mt-1">{analytics.totalMessages}건</p>
            </div>
            <div className="p-4 bg-white rounded-2xl border border-stone-200 shadow-2xs text-center">
              <span className="text-xs text-stone-500 font-medium">발급받은 마음 처방전</span>
              <p className="text-2xl font-bold font-mono text-rose-700 mt-1">{analytics.totalPrescriptions}장</p>
            </div>
            <div className="p-4 bg-white rounded-2xl border border-stone-200 shadow-2xs text-center">
              <span className="text-xs text-stone-500 font-medium">정화된 상처 비수</span>
              <p className="text-2xl font-bold font-mono text-purple-700 mt-1">{analytics.totalDetox}개</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Counselor Consult Distribution */}
            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs">
              <h4 className="font-bold text-stone-800 text-sm mb-3 flex items-center gap-2">
                <Heart className="w-4 h-4 text-rose-500" />
                가장 많이 찾은 상담관
              </h4>
              <div className="space-y-3">
                {Object.entries(analytics.counselorUsage).map(([name, count]) => {
                  const percent = Math.round((count / (analytics.totalSessions || 1)) * 100);
                  return (
                    <div key={name}>
                      <div className="flex justify-between text-xs font-semibold mb-1">
                        <span className="text-stone-700">{name}</span>
                        <span className="text-stone-500">{count}회 ({percent}%)</span>
                      </div>
                      <div className="w-full bg-stone-100 h-2.5 rounded-full overflow-hidden">
                        <div
                          className="bg-amber-500 h-full rounded-full transition-all duration-500"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Top Stress Topics */}
            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs">
              <h4 className="font-bold text-stone-800 text-sm mb-3 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-amber-600" />
                자주 털어놓은 고민 키워드
              </h4>
              <div className="flex flex-wrap gap-2">
                {analytics.topTags.map((t) => (
                  <span
                    key={t.tag}
                    className="px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold flex items-center gap-1.5"
                  >
                    <span>#{t.tag}</span>
                    <span className="text-[10px] bg-amber-200/80 px-1.5 py-0.2 rounded-full">
                      {t.count}회
                    </span>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Weekly Activity */}
          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs">
            <h4 className="font-bold text-stone-800 text-sm mb-4">최근 7일간의 마음 돌봄 빈도</h4>
            <div className="grid grid-cols-7 gap-2 text-center">
              {analytics.weeklyActivity.map((day) => (
                <div key={day.day} className="flex flex-col items-center">
                  <div className="w-full bg-stone-50 h-24 rounded-xl flex items-end justify-center p-1 border border-stone-100">
                    <div
                      className="w-full bg-emerald-500 rounded-lg transition-all duration-500"
                      style={{ height: `${Math.min(100, Math.max(15, day.count * 30))}%` }}
                    />
                  </div>
                  <span className="text-[11px] font-medium text-stone-600 mt-2">{day.day}</span>
                  <span className="text-[11px] font-bold text-emerald-800">{day.count}회</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ===================== */}
      {/* 4. BACKUP & RESTORE TAB */}
      {/* ===================== */}
      {subTab === 'backup' && (
        <div className="bg-white/95 p-6 sm:p-8 rounded-2xl border border-stone-200/80 shadow-xs max-w-2xl mx-auto space-y-6">
          <div>
            <h3 className="font-bold font-serif text-lg text-stone-900 mb-1">
              상담 데이터 백업 및 영구 보관
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              선생님께서 나누신 소중한 상담 대화와 메모, 마음 처방전은 모두 백엔드 서버에 저장되어 있습니다.
              외장 저장장치나 개인 보관을 위해 언제든지 JSON 파일로 안전하게 다운로드하거나 다른 기기에서 복원하실 수 있습니다.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <a
              href="/api/export"
              download="teacher_todak_backup.json"
              className="p-5 rounded-xl border border-amber-200 bg-amber-50 hover:bg-amber-100 transition flex flex-col justify-between group cursor-pointer"
            >
              <div>
                <Download className="w-6 h-6 text-amber-700 mb-2 group-hover:scale-110 transition" />
                <h4 className="font-bold text-stone-900 text-sm">데이터 백업 다운로드</h4>
                <p className="text-xs text-stone-600 mt-1">
                  모든 상담 세션, 메시지, 처방전을 포함한 JSON 파일을 PC에 저장합니다.
                </p>
              </div>
              <span className="mt-4 text-xs font-bold text-amber-800">지금 다운로드 &rarr;</span>
            </a>

            <label className="p-5 rounded-xl border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 transition flex flex-col justify-between group cursor-pointer">
              <div>
                <Upload className="w-6 h-6 text-indigo-700 mb-2 group-hover:scale-110 transition" />
                <h4 className="font-bold text-stone-900 text-sm">백업 데이터 복원하기</h4>
                <p className="text-xs text-stone-600 mt-1">
                  기존에 백업해 두었던 JSON 파일을 서버로 업로드하여 기록을 복원합니다.
                </p>
              </div>
              <input
                type="file"
                accept=".json"
                onChange={handleImportBackup}
                className="hidden"
              />
              <span className="mt-4 text-xs font-bold text-indigo-800">백업 파일 선택 &rarr;</span>
            </label>
          </div>
        </div>
      )}

      {/* ================================== */}
      {/* DETAILED SESSION TRANSCRIPT & MEMO MODAL */}
      {/* ================================== */}
      {activeSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl border border-stone-200 max-h-[90vh] overflow-y-auto flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <div className="flex items-center gap-2">
                <span className="text-2xl">
                  {activeSession.counselorId === 'mentor' ? '👩‍🏫' : activeSession.counselorId === 'psychologist' ? '🌿' : activeSession.counselorId === 'rights' ? '🛡️' : activeSession.counselorId === 'cheer' ? '✨' : '🌱'}
                </span>
                <div>
                  <h3 className="font-bold text-stone-900 text-base">
                    {activeSession.title}
                  </h3>
                  <span className="text-xs text-stone-500">
                    {activeSession.counselorName} &bull; {new Date(activeSession.createdAt).toLocaleString('ko-KR')}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setActiveSession(null)}
                className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* AI Summary Section with Auto-summarize button */}
            <div className="my-4 p-3.5 bg-amber-50/70 border border-amber-200/80 rounded-xl">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  AI 상담 요약
                </span>
                <button
                  onClick={handleAutoSummarize}
                  disabled={isSummarizing}
                  className="text-xs bg-white text-amber-800 hover:bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-md font-medium flex items-center gap-1 transition"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>{isSummarizing ? '요약 분석 중...' : 'Gemini AI 자동 요약 생성'}</span>
                </button>
              </div>
              <p className="text-xs text-stone-700 leading-relaxed">
                {activeSession.summary || '아직 요약이 생성되지 않았습니다. 우측의 [Gemini AI 자동 요약 생성]을 클릭해 보세요.'}
              </p>
            </div>

            {/* Editable Teacher Note / Memo */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
                  <Edit3 className="w-3.5 h-3.5 text-stone-500" />
                  선생님만의 비밀 회복 메모 (서버 영구 보관)
                </label>
                <button
                  onClick={handleSaveSessionDetails}
                  disabled={isSavingMemo}
                  className="text-xs bg-stone-800 hover:bg-stone-700 text-white px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1"
                >
                  <Check className="w-3 h-3" />
                  <span>{isSavingMemo ? '저장 중...' : '메모 저장'}</span>
                </button>
              </div>
              <textarea
                value={editingMemo}
                onChange={(e) => setEditingMemo(e.target.value)}
                placeholder="예: 이번 상담을 통해 깨달은 점, 다음 학부모 상담 때 적용할 대처법, 나에게 주는 다짐 등을 적어두세요."
                rows={2}
                className="w-full text-xs p-2.5 rounded-xl border border-stone-300 focus:border-amber-500 focus:ring-1 focus:ring-amber-200 outline-hidden"
              />
            </div>

            {/* Tags management */}
            <div className="mb-4">
              <span className="text-xs font-bold text-stone-700 block mb-1.5">해시태그 관리:</span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {activeSession.tags.map((t) => (
                  <span
                    key={t}
                    className="text-xs bg-stone-100 text-stone-700 px-2.5 py-0.5 rounded-md border border-stone-200 flex items-center gap-1"
                  >
                    <span>#{t}</span>
                    <button
                      onClick={() => handleRemoveTag(t)}
                      className="hover:text-rose-600"
                    >
                      &times;
                    </button>
                  </span>
                ))}
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    value={newTagInput}
                    onChange={(e) => setNewTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                    placeholder="태그 추가..."
                    className="text-xs p-1 rounded-md border border-stone-300 w-24 outline-hidden"
                  />
                  <button
                    onClick={handleAddTag}
                    className="text-xs bg-stone-100 hover:bg-stone-200 px-2 py-1 rounded-md font-medium"
                  >
                    추가
                  </button>
                </div>
              </div>
            </div>

            {/* Full Transcript */}
            <div className="flex-1 overflow-y-auto border-t border-stone-200 pt-4 space-y-3 max-h-60 pr-1">
              <span className="text-xs font-bold text-stone-500 block mb-2">상담 전체 대화록:</span>
              {activeSession.messages.map((m) => (
                <div
                  key={m.id}
                  className={`p-3 rounded-xl text-xs leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-amber-50 text-amber-950 border border-amber-200 ml-6'
                      : 'bg-stone-100 text-stone-800 mr-6'
                  }`}
                >
                  <span className="font-bold block mb-0.5 text-stone-500">
                    {m.role === 'user' ? '선생님' : activeSession.counselorName}
                  </span>
                  <div className="whitespace-pre-wrap">{m.content}</div>
                </div>
              ))}
            </div>

            <div className="mt-5 pt-3 border-t border-stone-200 flex items-center justify-between">
              <button
                onClick={() => {
                  onResumeSession(activeSession);
                  setActiveSession(null);
                }}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition"
              >
                <span>이 상담 세션으로 채팅창 열기</span>
                <ChevronRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => setActiveSession(null)}
                className="px-4 py-2 bg-stone-200 hover:bg-stone-300 text-stone-800 text-xs font-semibold rounded-xl transition"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================================== */}
      {/* PRESCRIPTION DETAIL MODAL */}
      {/* ================================== */}
      {activePrescription && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-[#fdfbf7] border-2 border-amber-300 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative text-stone-800">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3 mb-4">
              <div>
                <h3 className="font-serif font-bold text-stone-900 text-lg">교사 마음 회복 처방전</h3>
                <span className="text-xs text-stone-500">
                  {activePrescription.teacherType} &bull; {new Date(activePrescription.createdAt).toLocaleDateString('ko-KR')}
                </span>
              </div>
              <button
                onClick={() => setActivePrescription(null)}
                className="p-1 text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-3 bg-rose-50 rounded-xl border border-rose-200">
                <span className="font-bold text-rose-800 block mb-0.5">인정 직인</span>
                <p className="text-sm font-bold text-rose-900 font-serif">
                  {activePrescription.prescription.stampTitle}
                </p>
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
                <span className="font-bold text-amber-800 block mb-0.5">마음 비타민</span>
                <p className="text-stone-800 leading-relaxed font-serif">
                  {activePrescription.prescription.heartVitamin}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 bg-stone-100 rounded-lg">
                  <span className="font-bold text-rose-700 block mb-0.5">퇴근 후 금지</span>
                  <p className="text-stone-700">{activePrescription.prescription.doNotDo}</p>
                </div>
                <div className="p-2.5 bg-emerald-50 rounded-lg">
                  <span className="font-bold text-emerald-700 block mb-0.5">힐링 미션</span>
                  <p className="text-stone-700">{activePrescription.prescription.healingMission}</p>
                </div>
              </div>

              <div className="pt-2 text-stone-600 italic">
                &ldquo;{activePrescription.prescription.quote}&rdquo;
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-stone-200 flex justify-end">
              <button
                onClick={() => setActivePrescription(null)}
                className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-white text-xs font-semibold rounded-xl"
              >
                확인 완료
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
