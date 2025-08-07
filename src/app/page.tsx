'use client';

import { useState } from 'react';
import InputForm from '@/components/InputForm';
import Phase1Display from '@/components/Phase1Display';
import DetailDisplay from '@/components/DetailDisplay';
import { FormData, Phase1Result, VisualRecommendation } from '@/types';

export default function Home() {
  const [phase1Result, setPhase1Result] = useState<Phase1Result | null>(null);
  const [selectedDetails, setSelectedDetails] = useState<Map<string, VisualRecommendation>>(new Map());
  const [activeTab, setActiveTab] = useState<'phase1' | 'details'>('phase1');
  const [currentDetailType, setCurrentDetailType] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData | null>(null);

  const handleSubmit = async (data: FormData) => {
    setLoading(true);
    setError(null);
    setPhase1Result(null);
    setFormData(data);

    try {
      const response = await fetch('/api/analyze-phase1', {
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

      const result: Phase1Result = await response.json();
      setPhase1Result(result);
      setActiveTab('phase1');
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectVisualType = async (visualType: string, formData: FormData) => {
    if (selectedDetails.has(visualType)) {
      setCurrentDetailType(visualType);
      setActiveTab('details');
      return;
    }

    setLoadingDetails(prev => new Set(prev).add(visualType));

    try {
      const response = await fetch('/api/analyze-detail', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          visualType,
          formData
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '상세 분석 중 오류가 발생했습니다.');
      }

      const detail: VisualRecommendation = await response.json();
      
      // 1차 분석의 적합도를 상세 분석 결과에 추가
      if (phase1Result) {
        detail.suitabilityPercent = phase1Result.visualTypeSuitability[visualType as keyof typeof phase1Result.visualTypeSuitability];
      }
      
      setSelectedDetails(prev => new Map(prev).set(visualType, detail));
      setCurrentDetailType(visualType);
      setActiveTab('details');
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
    } finally {
      setLoadingDetails(prev => {
        const newSet = new Set(prev);
        newSet.delete(visualType);
        return newSet;
      });
    }
  };

  const handleSelectDetailType = (visualType: string) => {
    setCurrentDetailType(visualType);
    setActiveTab('details');
  };

  const handleRegenerateDetail = async () => {
    if (!currentDetailType || !formData) return;
    
    setLoadingDetails(prev => new Set(prev).add(currentDetailType));

    try {
      const response = await fetch('/api/analyze-detail', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          visualType: currentDetailType,
          formData
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '재생성 중 오류가 발생했습니다.');
      }

      const detail: VisualRecommendation = await response.json();
      
      // 1차 분석의 적합도를 상세 분석 결과에 추가
      if (phase1Result) {
        detail.suitabilityPercent = phase1Result.visualTypeSuitability[currentDetailType as keyof typeof phase1Result.visualTypeSuitability];
      }
      
      setSelectedDetails(prev => new Map(prev).set(currentDetailType, detail));
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
    } finally {
      setLoadingDetails(prev => {
        const newSet = new Set(prev);
        newSet.delete(currentDetailType);
        return newSet;
      });
    }
  };

  const handleReset = () => {
    setPhase1Result(null);
    setSelectedDetails(new Map());
    setActiveTab('phase1');
    setCurrentDetailType('');
    setError(null);
    setFormData(null);
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
        <div className="w-2/3 bg-gray-50 flex flex-col">
          {!phase1Result && !loading && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">시각자료 추천 결과</h3>
                <p className="text-gray-600 mb-4">
                  좌측에 지문 정보를 입력하고 &apos;시각자료 추천 받기&apos; 버튼을 클릭하세요.
                </p>
                <p className="text-sm text-gray-500">
                  1단계: 삽화, 사진, 순서도, 그래프, 도표의 적합도와 추천 이유를 확인<br/>
                  2단계: 원하는 시각자료의 상세 정보 (구성 방안, 제작 고려사항, 이미지 소스 등)를 확인
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

          {phase1Result && formData && !loading && (
            <>
              {/* 탭 헤더 */}
              <div className="bg-white border-b border-gray-200 px-6 py-3">
                <div className="flex space-x-8">
                  <button
                    onClick={() => setActiveTab('phase1')}
                    className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === 'phase1'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    1차 분석 (적합도 및 추천 이유)
                  </button>
                  <button
                    onClick={() => setActiveTab('details')}
                    className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === 'details'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                    disabled={selectedDetails.size === 0}
                  >
                    상세 분석 ({selectedDetails.size}개 선택됨)
                  </button>
                </div>
              </div>

              {/* 탭 콘텐츠 */}
              <div className="flex-1 overflow-y-auto p-6">
                {activeTab === 'phase1' && (
                  <Phase1Display 
                    result={phase1Result}
                    formData={formData}
                    onSelectVisualType={handleSelectVisualType}
                    loadingDetails={loadingDetails}
                  />
                )}

                {activeTab === 'details' && (
                  <div className="space-y-6">
                    {selectedDetails.size === 0 ? (
                      <div className="text-center py-12">
                        <div className="w-12 h-12 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">선택된 시각자료가 없습니다</h3>
                        <p className="text-gray-600 mb-4">
                          1차 분석 탭에서 시각자료를 선택하면 상세 정보를 확인할 수 있습니다.
                        </p>
                        <button
                          onClick={() => setActiveTab('phase1')}
                          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                        >
                          1차 분석으로 이동
                        </button>
                      </div>
                    ) : (
                      <>
                        {/* 시각자료 선택 버튼들 */}
                        <div className="mb-6">
                          <h3 className="text-lg font-bold text-gray-800 mb-3">상세 분석 결과</h3>
                          <div className="flex flex-wrap gap-2 mb-4">
                            {Array.from(selectedDetails.keys()).map((visualType) => {
                              const visualTypeNames = {
                                illustration: '삽화',
                                photo: '사진', 
                                flowchart: '순서도',
                                graph: '그래프',
                                table: '도표'
                              };
                              return (
                                <button
                                  key={visualType}
                                  onClick={() => handleSelectDetailType(visualType)}
                                  className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                                    currentDetailType === visualType
                                      ? 'bg-blue-600 text-white'
                                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                  }`}
                                >
                                  {visualTypeNames[visualType as keyof typeof visualTypeNames]}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* 선택된 상세 정보 */}
                        {currentDetailType && selectedDetails.has(currentDetailType) && (
                          <DetailDisplay 
                            detail={selectedDetails.get(currentDetailType)!}
                            onBack={() => setActiveTab('phase1')}
                            onRegenerate={handleRegenerateDetail}
                            regenerating={loadingDetails.has(currentDetailType)}
                          />
                        )}

                        {currentDetailType && !selectedDetails.has(currentDetailType) && (
                          <div className="text-center py-8">
                            <p className="text-gray-600">선택된 시각자료의 상세 정보를 불러오는 중입니다...</p>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            </>
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