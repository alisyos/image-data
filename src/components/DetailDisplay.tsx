'use client';

import { VisualRecommendation } from '@/types';

interface DetailDisplayProps {
  detail: VisualRecommendation;
  onBack?: () => void;
  onRegenerate?: () => void;
  regenerating?: boolean;
}

export default function DetailDisplay({ detail, onRegenerate, regenerating }: DetailDisplayProps) {
  const visualTypeNames = {
    illustration: '삽화',
    photo: '사진', 
    flowchart: '순서도',
    graph: '그래프',
    table: '도표'
  };

  return (
    <div className="space-y-6">

      {/* 상세 추천 */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-xl font-bold text-gray-800">
            {visualTypeNames[detail.type]} 상세 추천 정보
          </h4>
          <div className="flex items-center space-x-3">
            {detail.suitabilityPercent && (
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                적합도 {detail.suitabilityPercent}%
              </span>
            )}
            {onRegenerate && (
              <button
                onClick={onRegenerate}
                disabled={regenerating}
                className="px-3 py-1.5 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {regenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-3 w-3 border border-white border-t-transparent"></div>
                    <span>재생성 중...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span>재생성</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        <div className="space-y-4">
          {/* 이미지 생성 프롬프트 (모든 유형에 적용) */}
          {detail.imageGenerationPrompt ? (
            <div>
              <h5 className="text-sm font-semibold text-gray-700 mb-3">이미지 생성 프롬프트</h5>
              <div className="space-y-3">
                <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
                  <h6 className="text-xs font-semibold text-blue-900 mb-1">생성 목적</h6>
                  <p className="text-sm text-blue-800">{detail.imageGenerationPrompt.purpose}</p>
                </div>
                
                <div className="bg-green-50 border border-green-200 p-3 rounded-lg">
                  <h6 className="text-xs font-semibold text-green-900 mb-1">생성 조건</h6>
                  <p className="text-sm text-green-800">{detail.imageGenerationPrompt.conditions}</p>
                </div>
                
                <div className="bg-purple-50 border border-purple-200 p-3 rounded-lg">
                  <h6 className="text-xs font-semibold text-purple-900 mb-1">구성 방안</h6>
                  <p className="text-sm text-purple-800 whitespace-pre-line">{detail.imageGenerationPrompt.composition}</p>
                </div>
                
                <div className="bg-orange-50 border border-orange-200 p-3 rounded-lg">
                  <h6 className="text-xs font-semibold text-orange-900 mb-1">주의사항</h6>
                  <p className="text-sm text-orange-800">{detail.imageGenerationPrompt.precautions}</p>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-3">
                위 정보를 참고하여 DALL-E, Midjourney, Stable Diffusion 등 AI 이미지 생성 도구를 활용하세요.
              </p>
            </div>
          ) : detail.aiPrompt && (
            /* 기존 AI 프롬프트 (다른 타입용) */
            <div>
              <h5 className="text-sm font-semibold text-gray-700 mb-1">AI 이미지 생성 프롬프트</h5>
              <div className="bg-gray-900 text-green-400 p-3 rounded font-mono text-xs break-all">
                {detail.aiPrompt}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                위 프롬프트를 DALL-E, Midjourney, Stable Diffusion 등 AI 이미지 생성 도구에 입력하여 사용하세요.
              </p>
            </div>
          )}

          {/* 저작권 프리 이미지 소스 */}
          <div>
            <h5 className="text-sm font-semibold text-gray-700 mb-2">저작권 프리 이미지 소스</h5>
            {detail.freeImageSources && detail.freeImageSources.length > 0 ? (
              <div className="grid grid-cols-1 gap-2">
                {detail.freeImageSources.map((source, sourceIndex) => (
                  <div key={sourceIndex} className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 p-3 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-bold">{sourceIndex + 1}</span>
                        </div>
                        <span className="text-sm font-semibold text-gray-800">{source.site}</span>
                      </div>
                      <a 
                        href={source.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="px-3 py-1 bg-blue-600 text-white text-xs rounded-full hover:bg-blue-700 transition-colors flex items-center space-x-1"
                      >
                        <span>검색하기</span>
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    </div>
                    <div className="bg-white/70 rounded p-2">
                      <p className="text-xs text-gray-700">
                        <span className="font-medium">검색 키워드:</span> 
                        <span className="ml-1 font-mono bg-gray-100 px-1 rounded">{source.searchKeywords}</span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
                <p className="text-sm text-yellow-700">이미지 소스 정보가 생성되지 않았습니다.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}