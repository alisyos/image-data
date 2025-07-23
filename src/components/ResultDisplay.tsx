'use client';

import { AnalysisResult } from '@/types';

interface ResultDisplayProps {
  result: AnalysisResult;
}

export default function ResultDisplay({ result }: ResultDisplayProps) {
  const visualTypeNames = {
    illustration: '삽화',
    photo: '사진', 
    flowchart: '순서도',
    graph: '그래프',
    table: '도표'
  };

  return (
    <div className="space-y-6">
      {/* 적합도 분석 */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <h3 className="text-lg font-bold mb-4 text-gray-800">시각자료 적합도 분석</h3>
        <div className="space-y-2">
          {Object.entries(result.visualTypeSuitability).map(([type, percent]) => (
            <div key={type} className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-700 w-12">
                  {visualTypeNames[type as keyof typeof visualTypeNames]}
                </span>
                <div className="flex-1 bg-gray-200 rounded-full h-2 w-20">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${percent}%` }}
                  ></div>
                </div>
              </div>
              <span className="text-sm font-bold text-blue-600">{percent}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* 상세 추천 */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-gray-800">상세 추천 정보</h3>
        {result.visualRecommendations.map((rec, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-md font-bold text-gray-800">
                {visualTypeNames[rec.type]} ({rec.suitabilityPercent}%)
              </h4>
              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                #{index + 1}
              </span>
            </div>

            <div className="space-y-3">
              <div>
                <h5 className="text-sm font-semibold text-gray-700 mb-1">추천 이유</h5>
                <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">{rec.reason}</p>
              </div>

              <div>
                <h5 className="text-sm font-semibold text-gray-700 mb-1">구성 방안</h5>
                <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">{rec.composition}</p>
              </div>

              <div>
                <h5 className="text-sm font-semibold text-gray-700 mb-1">제작 고려사항</h5>
                <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">{rec.implementation}</p>
              </div>

              <div>
                <h5 className="text-sm font-semibold text-gray-700 mb-2">저작권 프리 이미지 소스</h5>
                {rec.freeImageSources && rec.freeImageSources.length > 0 ? (
                  <div className="grid grid-cols-1 gap-2">
                    {rec.freeImageSources.map((source, sourceIndex) => (
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

              <div>
                <h5 className="text-sm font-semibold text-gray-700 mb-1">AI 이미지 생성 프롬프트</h5>
                <div className="bg-gray-900 text-green-400 p-2 rounded font-mono text-xs">
                  {rec.aiPrompt}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}