'use client';

import { useState, useEffect } from 'react';

interface PromptEditorProps {
  prompt: string;
  onSave: (prompt: string) => Promise<void>;
  saving: boolean;
}

export default function PromptEditor({ prompt, onSave, saving }: PromptEditorProps) {
  const [currentPrompt, setCurrentPrompt] = useState(prompt);
  const [hasChanges, setHasChanges] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    setCurrentPrompt(prompt);
    setHasChanges(false);
  }, [prompt]);

  const handleChange = (value: string) => {
    setCurrentPrompt(value);
    setHasChanges(value !== prompt);
  };

  const handleRefreshCache = async () => {
    setRefreshing(true);
    try {
      console.log('프롬프트 캐시 새로고침 시작...');
      const response = await fetch('/api/admin/prompt/refresh', {
        method: 'POST',
        headers: {
          'Cache-Control': 'no-cache',
        },
      });

      if (!response.ok) {
        throw new Error('캐시 새로고침 실패');
      }

      const result = await response.json();
      console.log('프롬프트 캐시 새로고침 완료:', result);
      
      // 사용자에게 성공 메시지 표시 (선택적)
      alert('프롬프트 캐시가 성공적으로 새로고침되었습니다.');
    } catch (error) {
      console.error('캐시 새로고침 오류:', error);
      alert('캐시 새로고침 중 오류가 발생했습니다.');
    } finally {
      setRefreshing(false);
    }
  };

  const handleSave = async () => {
    if (!hasChanges) return;
    
    try {
      await onSave(currentPrompt);
      setHasChanges(false);
      
      // 저장 완료 후 자동으로 캐시 새로고침
      console.log('프롬프트 저장 완료, 캐시 새로고침 시작...');
      await handleRefreshCache();
    } catch (error) {
      console.error('프롬프트 저장 오류:', error);
    }
  };

  const handleReset = () => {
    if (!hasChanges) return;
    if (confirm('변경사항을 취소하시겠습니까?')) {
      setCurrentPrompt(prompt);
      setHasChanges(false);
    }
  };

  const getLineCount = () => {
    return currentPrompt.split('\n').length;
  };

  const getWordCount = () => {
    return currentPrompt.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  const isLoading = saving || refreshing;

  return (
    <div className="space-y-4">
      {/* 편집기 툴바 */}
      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center space-x-4 text-sm text-gray-600">
          <span>줄 수: {getLineCount().toLocaleString()}</span>
          <span>단어 수: {getWordCount().toLocaleString()}</span>
          <span>문자 수: {currentPrompt.length.toLocaleString()}</span>
        </div>
        
        <div className="flex items-center space-x-2">
          {hasChanges && (
            <span className="text-sm text-amber-600 font-medium">• 저장되지 않은 변경사항</span>
          )}
          
          {refreshing && (
            <span className="text-sm text-blue-600 font-medium">• 캐시 새로고침 중...</span>
          )}
          
          <button
            onClick={handleRefreshCache}
            disabled={isLoading}
            className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="프롬프트 캐시를 강제로 새로고침합니다"
          >
            {refreshing ? '새로고침 중...' : '캐시 새로고침'}
          </button>
          
          <button
            onClick={handleReset}
            disabled={!hasChanges || isLoading}
            className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            취소
          </button>
          
          <button
            onClick={handleSave}
            disabled={!hasChanges || isLoading}
            className="px-4 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? '저장 중...' : refreshing ? '저장 및 새로고침 중...' : '저장'}
          </button>
        </div>
      </div>

      {/* 텍스트 편집기 */}
      <div className="relative">
        <textarea
          value={currentPrompt}
          onChange={(e) => handleChange(e.target.value)}
          disabled={isLoading}
          className="w-full h-96 p-4 text-sm font-mono border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none disabled:opacity-50 disabled:cursor-not-allowed"
          placeholder="시스템 프롬프트를 입력하세요..."
          spellCheck={false}
        />
        
        {/* 라인 넘버 (선택적) */}
        <div className="absolute left-2 top-4 text-xs text-gray-400 font-mono pointer-events-none select-none">
          {Array.from({ length: getLineCount() }, (_, i) => (
            <div key={i} className="h-5 leading-5">
              {i + 1}
            </div>
          ))}
        </div>
      </div>

      {/* 프롬프트 구조 가이드 */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-yellow-800 mb-2">프롬프트 구조 가이드</h4>
        <div className="text-xs text-yellow-700 space-y-1">
          <p>• <strong>### 지시사항</strong>: 기본 작업 지시</p>
          <p>• <strong>### 작성지침</strong>: 상세한 작성 규칙</p>
          <p>• <strong>1. 전체 구조</strong>: JSON 형식 및 키 구조</p>
          <p>• <strong>2. 필수 필드 및 값 규칙</strong>: 각 필드별 요구사항</p>
          <p>• <strong>3. 세부 작성 기준</strong>: 세부 필드 작성법</p>
          <p>• <strong>4. 시각자료 유형별 분석 기준</strong>: 각 유형별 특징</p>
          <p>• <strong>5. 검증 규칙</strong>: 출력 검증 조건</p>
        </div>
      </div>

      {/* 프롬프트 테스트 및 캐시 관리 */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-blue-800 mb-2">💡 팁 및 캐시 관리</h4>
        <div className="text-xs text-blue-700 space-y-1">
          <p>• 프롬프트 변경 후에는 반드시 실제 지문으로 테스트해보세요.</p>
          <p>• <strong>저장 후 자동으로 캐시가 새로고침되어 즉시 반영됩니다.</strong></p>
          <p>• 변경사항이 반영되지 않으면 &apos;캐시 새로고침&apos; 버튼을 수동으로 클릭하세요.</p>
          <p>• JSON 형식을 엄격히 준수하도록 지시문을 명확히 작성하세요.</p>
          <p>• 각 시각자료별 특징을 구체적으로 명시하면 더 정확한 추천을 받을 수 있습니다.</p>
          <p>• 문자 수 제한(reason: 100자, composition: 200자, implementation: 150자)을 지켜주세요.</p>
        </div>
      </div>
    </div>
  );
}