'use client';

import { Phase1Result, FormData } from '@/types';

interface Phase1DisplayProps {
  result: Phase1Result;
  formData: FormData;
  onSelectVisualType: (visualType: string, formData: FormData) => void;
  loadingDetails: Set<string>;
}

export default function Phase1Display({ result, formData, onSelectVisualType, loadingDetails }: Phase1DisplayProps) {
  const visualTypeNames = {
    illustration: '삽화',
    photo: '사진', 
    flowchart: '순서도',
    graph: '그래프',
    table: '도표'
  };

  // 적합도 순으로 정렬
  const sortedReasons = result.reasonSummary.sort((a, b) => 
    result.visualTypeSuitability[b.type] - result.visualTypeSuitability[a.type]
  );

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

      {/* 추천 이유 및 선택 */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-800">시각자료별 추천 이유</h3>
          <p className="text-sm text-gray-600">상세 정보를 보려면 시각자료를 선택하세요</p>
        </div>
        
        <div className="grid grid-cols-1 gap-3">
          {sortedReasons.map((reason, index) => (
            <div key={reason.type} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                      #{index + 1}
                    </span>
                    <h4 className="text-md font-bold text-gray-800">
                      {visualTypeNames[reason.type]} ({result.visualTypeSuitability[reason.type]}%)
                    </h4>
                  </div>
                  <button
                    onClick={() => onSelectVisualType(reason.type, formData)}
                    disabled={loadingDetails.has(reason.type)}
                    className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    {loadingDetails.has(reason.type) ? (
                      <>
                        <div className="animate-spin rounded-full h-3 w-3 border border-white border-t-transparent"></div>
                        <span>분석 중...</span>
                      </>
                    ) : (
                      <span>상세 정보 보기</span>
                    )}
                  </button>
                </div>
                <div>
                  <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">{reason.reason}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-2">
            <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h5 className="text-sm font-semibold text-blue-800 mb-1">안내</h5>
              <p className="text-sm text-blue-700">
                각 시각자료의 &apos;상세 정보 보기&apos; 버튼을 클릭하면 구성 방안, 제작 고려사항, 이미지 소스, AI 생성 프롬프트 등의 상세한 정보를 확인할 수 있습니다.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}