'use client';

import { useState } from 'react';
import InputForm from '@/components/InputForm';
import ResultDisplay from '@/components/ResultDisplay';
import { FormData, AnalysisResult } from '@/types';

export default function Home() {
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: FormData) => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '분석 중 오류가 발생했습니다.');
      }

      const result: AnalysisResult = await response.json();
      setResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* 헤더 */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl lg:text-2xl font-bold text-gray-900">
              초·중등 어휘학습 지문 시각자료 추천 시스템
            </h1>
            <div className="flex items-center space-x-3">
              <a
                href="/admin"
                className="px-3 py-2 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
              >
                관리자
              </a>
              <button
                onClick={handleReset}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
              >
                초기화
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 메인 컨텐츠 - 좌우 분할 */}
      <main className="flex-1 flex">
        {/* 좌측 입력 영역 (1/3) */}
        <div className="w-1/3 bg-white border-r border-gray-200 p-6 overflow-y-auto">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">지문 정보 입력</h2>
            <p className="text-sm text-gray-600">
              지문을 입력하면 AI가 최적의 시각자료를 추천해드립니다.
            </p>
          </div>
          
          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-4 w-4 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-2">
                  <h3 className="text-sm font-medium text-red-800">오류 발생</h3>
                  <div className="mt-1 text-xs text-red-700">{error}</div>
                </div>
              </div>
            </div>
          )}

          <InputForm onSubmit={handleSubmit} loading={loading} />
        </div>

        {/* 우측 결과 영역 (2/3) */}
        <div className="w-2/3 bg-gray-50 p-6 overflow-y-auto">
          {!result && !loading && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 002 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">시각자료 추천 결과</h3>
                <p className="text-gray-600 mb-4">
                  좌측에 지문 정보를 입력하고 &apos;시각자료 추천 받기&apos; 버튼을 클릭하세요.
                </p>
                <p className="text-sm text-gray-500">
                  삽화, 사진, 순서도, 그래프, 도표 중에서 가장 적합한 시각자료와 구체적인 제작 방안을 제시합니다.
                </p>
              </div>
            </div>
          )}

          {loading && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">분석 중...</h3>
                <p className="text-gray-600">AI가 지문을 분석하고 있습니다. 잠시만 기다려주세요.</p>
              </div>
            </div>
          )}

          {result && !loading && (
            <div className="h-full">
              <ResultDisplay result={result} />
            </div>
          )}
        </div>
      </main>

      {/* 푸터 */}
      <footer className="bg-white border-t">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-center text-xs text-gray-500">
            OpenAI GPT-4를 활용한 시각자료 추천 시스템 | 교육용 목적으로 제작됨
          </p>
        </div>
      </footer>
    </div>
  );
}