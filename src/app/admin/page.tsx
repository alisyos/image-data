'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import PromptEditor from '@/components/admin/PromptEditor';
import BackupList from '@/components/admin/BackupList';

type PromptType = 'phase1' | 'illustration' | 'photo' | 'flowchart' | 'graph' | 'table';

interface PromptData {
  [key: string]: string;
}

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<PromptType>('phase1');
  const [prompts, setPrompts] = useState<PromptData>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const promptTypes = [
    { key: 'phase1', name: '1차 분석 (적합도)', file: 'phase1-prompt.txt' },
    { key: 'illustration', name: '삽화', file: 'illustration-prompt.txt' },
    { key: 'photo', name: '사진', file: 'photo-prompt.txt' },
    { key: 'flowchart', name: '순서도', file: 'flowchart-prompt.txt' },
    { key: 'graph', name: '그래프', file: 'graph-prompt.txt' },
    { key: 'table', name: '도표', file: 'table-prompt.txt' },
  ];

  useEffect(() => {
    loadAllPrompts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadAllPrompts = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const newPrompts: PromptData = {};
      
      // 각 프롬프트 파일을 읽어오기
      for (const promptType of promptTypes) {
        const response = await fetch(`/api/admin/prompt/${promptType.key}`);
        if (response.ok) {
          const data = await response.json();
          newPrompts[promptType.key] = data.prompt;
        } else {
          // 파일이 없는 경우 빈 문자열로 초기화
          newPrompts[promptType.key] = '';
        }
      }
      
      setPrompts(newPrompts);
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const savePrompt = async (promptType: PromptType, newPrompt: string) => {
    setSaving(true);
    setError(null);
    setSuccess(null);
    
    try {
      const response = await fetch(`/api/admin/prompt/${promptType}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: newPrompt }),
      });
      
      if (!response.ok) {
        throw new Error('프롬프트 저장에 실패했습니다.');
      }
      
      setPrompts(prev => ({ ...prev, [promptType]: newPrompt }));
      setSuccess(`${promptTypes.find(p => p.key === promptType)?.name} 프롬프트가 성공적으로 저장되었습니다.`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : '저장 중 오류가 발생했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const resetPrompt = async (promptType: PromptType) => {
    const promptName = promptTypes.find(p => p.key === promptType)?.name || promptType;
    if (!confirm(`${promptName} 프롬프트를 기본값으로 초기화하시겠습니까? 현재 변경사항은 모두 사라집니다.`)) {
      return;
    }
    
    try {
      const response = await fetch(`/api/admin/prompt/${promptType}/reset`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error('초기화에 실패했습니다.');
      }
      
      const data = await response.json();
      setPrompts(prev => ({ ...prev, [promptType]: data.prompt }));
      setSuccess(`${promptName} 프롬프트가 기본값으로 초기화되었습니다.`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : '초기화 중 오류가 발생했습니다.');
    }
  };

  const resetAllPrompts = async () => {
    if (!confirm('모든 프롬프트를 기본값으로 초기화하시겠습니까? 현재 변경사항은 모두 사라집니다.')) {
      return;
    }
    
    try {
      for (const promptType of promptTypes) {
        await fetch(`/api/admin/prompt/${promptType.key}/reset`, {
          method: 'POST',
        });
      }
      
      await loadAllPrompts();
      setSuccess('모든 프롬프트가 기본값으로 초기화되었습니다.');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : '초기화 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* 헤더 */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">관리자 페이지</h1>
              <p className="text-sm text-gray-600 mt-1">시스템 프롬프트 관리 (2단계 구조)</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={resetAllPrompts}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                모든 프롬프트 초기화
              </button>
              <Link
                href="/"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                메인으로 돌아가기
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* 메인 컨텐츠 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 알림 메시지 */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">오류</h3>
                <div className="mt-2 text-sm text-red-700">{error}</div>
              </div>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">성공</h3>
                <div className="mt-2 text-sm text-green-700">{success}</div>
              </div>
            </div>
          </div>
        )}

        {/* 로딩 상태 */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-lg text-gray-600">프롬프트를 불러오는 중...</p>
          </div>
        )}

        {/* 프롬프트 편집기 */}
        {!loading && (
          <div className="bg-white rounded-lg shadow-sm">
            {/* 탭 헤더 */}
            <div className="border-b border-gray-200 px-6 py-3">
              <div className="flex space-x-8 overflow-x-auto">
                {promptTypes.map((promptType) => (
                  <button
                    key={promptType.key}
                    onClick={() => setActiveTab(promptType.key as PromptType)}
                    className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                      activeTab === promptType.key
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {promptType.name}
                  </button>
                ))}
              </div>
            </div>

            {/* 탭 콘텐츠 */}
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">
                    {promptTypes.find(p => p.key === activeTab)?.name} 프롬프트
                  </h2>
                  <p className="text-sm text-gray-600">
                    파일: {promptTypes.find(p => p.key === activeTab)?.file}
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-sm text-gray-500">
                    문자 수: {(prompts[activeTab] || '').length.toLocaleString()}
                  </div>
                  <button
                    onClick={() => resetPrompt(activeTab)}
                    className="px-3 py-1.5 bg-gray-600 text-white text-sm rounded-md hover:bg-gray-700 transition-colors"
                  >
                    기본값으로 초기화
                  </button>
                </div>
              </div>
              
              <PromptEditor
                prompt={prompts[activeTab] || ''}
                onSave={(newPrompt) => savePrompt(activeTab, newPrompt)}
                saving={saving}
              />

              {/* 프롬프트별 안내사항 */}
              <div className="mt-6 bg-blue-50 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-blue-900 mb-2">
                  {promptTypes.find(p => p.key === activeTab)?.name} 프롬프트 가이드
                </h3>
                <div className="text-sm text-blue-800 space-y-1">
                  {activeTab === 'phase1' ? (
                    <>
                      <p>• 1차 분석에서는 적합도 퍼센트와 간단한 추천 이유만 제공합니다.</p>
                      <p>• visualTypeSuitability 객체의 합은 반드시 100이어야 합니다.</p>
                      <p>• reasonSummary 배열은 정확히 5개 요소를 포함해야 합니다.</p>
                    </>
                  ) : (
                    <>
                      <p>• 상세 분석에서는 구성방안, 제작고려사항, 이미지소스, AI프롬프트를 제공합니다.</p>
                      <p>• reason은 100자 이내, composition은 200자 이내, implementation은 150자 이내입니다.</p>
                      <p>• freeImageSources는 정확히 3개 사이트를 포함해야 합니다.</p>
                      <p>• aiPrompt는 영어로 작성되어야 합니다.</p>
                    </>
                  )}
                  <p>• JSON 형식을 정확히 준수하여 파싱 오류가 발생하지 않도록 주의하세요.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 백업 관리 (별도 섹션) */}
        {!loading && (
          <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
            <BackupList onRestore={loadAllPrompts} />
          </div>
        )}
      </main>
    </div>
  );
}