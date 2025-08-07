'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import PromptEditor from '@/components/admin/PromptEditor';
import BackupList from '@/components/admin/BackupList';

export default function AdminPage() {
  const [currentPrompt, setCurrentPrompt] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadCurrentPrompt();
  }, []);

  const loadCurrentPrompt = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/admin/prompt');
      if (!response.ok) {
        throw new Error('프롬프트를 불러오는데 실패했습니다.');
      }
      
      const data = await response.json();
      setCurrentPrompt(data.prompt);
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const savePrompt = async (newPrompt: string) => {
    setSaving(true);
    setError(null);
    setSuccess(null);
    
    try {
      const response = await fetch('/api/admin/prompt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: newPrompt }),
      });
      
      if (!response.ok) {
        throw new Error('프롬프트 저장에 실패했습니다.');
      }
      
      setCurrentPrompt(newPrompt);
      setSuccess('프롬프트가 성공적으로 저장되었습니다.');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : '저장 중 오류가 발생했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const resetToDefault = async () => {
    if (!confirm('기본 프롬프트로 초기화하시겠습니까? 현재 변경사항은 모두 사라집니다.')) {
      return;
    }
    
    try {
      const response = await fetch('/api/admin/prompt/reset', {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error('초기화에 실패했습니다.');
      }
      
      await loadCurrentPrompt();
      setSuccess('기본 프롬프트로 초기화되었습니다.');
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
              <p className="text-sm text-gray-600 mt-1">시스템 프롬프트 관리</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => window.open('/api/admin/prompt/full', '_blank')}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                전체 프롬프트 보기
              </button>
              <button
                onClick={resetToDefault}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
              >
                기본값으로 초기화
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 메인 편집 영역 */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-800">시스템 프롬프트</h2>
                  <div className="text-sm text-gray-500">
                    문자 수: {currentPrompt.length.toLocaleString()}
                  </div>
                </div>
                
                <PromptEditor
                  prompt={currentPrompt}
                  onSave={savePrompt}
                  saving={saving}
                />
              </div>

              {/* 사용 가이드 */}
              <div className="bg-blue-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-blue-900 mb-3">사용 가이드</h3>
                <div className="text-sm text-blue-800 space-y-2">
                  <p>• 프롬프트 수정 후 반드시 &apos;저장&apos; 버튼을 클릭하세요.</p>
                  <p>• 변경사항은 즉시 시스템에 적용됩니다.</p>
                  <p>• JSON 출력 형식을 유지하도록 주의하세요.</p>
                  <p>• 기본값으로 초기화하면 모든 변경사항이 사라집니다.</p>
                </div>
              </div>
            </div>

            {/* 백업 관리 영역 */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <BackupList onRestore={loadCurrentPrompt} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}