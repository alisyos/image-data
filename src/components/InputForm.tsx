'use client';

import { useState } from 'react';
import { FormData } from '@/types';

interface InputFormProps {
  onSubmit: (data: FormData) => void;
  loading: boolean;
}

export default function InputForm({ onSubmit, loading }: InputFormProps) {
  const [formData, setFormData] = useState<FormData>({
    subject: '',
    grade: '',
    area: '',
    topic: '',
    keywords: '',
    textType: '',
    content: ''
  });
  
  const [isDragOver, setIsDragOver] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.subject || !formData.content) {
      alert('과목과 지문 내용은 필수 입력 항목입니다.');
      return;
    }
    onSubmit(formData);
  };

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const parseTxtFile = (content: string): Partial<FormData> => {
    const lines = content.split('\n').map(line => line.trim()).filter(line => line);
    const result: Partial<FormData> = {};
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      if (line === '과목' && i + 1 < lines.length) {
        result.subject = lines[i + 1];
        i++;
      } else if (line === '학년' && i + 1 < lines.length) {
        result.grade = lines[i + 1];
        i++;
      } else if (line === '영역' && i + 1 < lines.length) {
        result.area = lines[i + 1];
        i++;
      } else if (line === '주제' && i + 1 < lines.length) {
        result.topic = lines[i + 1];
        i++;
      } else if ((line === '핵심개념어' || line === '핵심어') && i + 1 < lines.length) {
        result.keywords = lines[i + 1];
        i++;
      } else if ((line === '지문 유형' || line === '지문유형') && i + 1 < lines.length) {
        result.textType = lines[i + 1];
        i++;
      } else if (line === '지문' && i + 1 < lines.length) {
        const remainingLines = lines.slice(i + 1);
        result.content = remainingLines.join('\n');
        break;
      }
    }
    
    return result;
  };

  const processFile = (file: File) => {
    if (!file.name.toLowerCase().endsWith('.txt')) {
      alert('txt 파일만 업로드 가능합니다.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('파일 크기는 5MB를 초과할 수 없습니다.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        if (!content || content.trim() === '') {
          alert('빈 파일이거나 읽을 수 없는 파일입니다.');
          return;
        }
        
        const parsedData = parseTxtFile(content);
        
        if (Object.keys(parsedData).length === 0) {
          alert('파일에서 유효한 데이터를 찾을 수 없습니다. 파일 형식을 확인해주세요.');
          return;
        }
        
        setFormData(prev => ({
          ...prev,
          ...parsedData
        }));
        
        alert('파일 내용이 성공적으로 로드되었습니다.');
      } catch (error) {
        alert('파일을 처리하는 중 오류가 발생했습니다.');
      }
    };
    
    reader.onerror = () => {
      alert('파일을 읽는 중 오류가 발생했습니다.');
    };
    
    reader.readAsText(file, 'utf-8');
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    processFile(file);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(false);
    
    const files = event.dataTransfer.files;
    if (files.length > 0) {
      processFile(files[0]);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* 파일 업로드 */}
      <div 
        className={`border-2 border-dashed rounded-lg p-4 transition-colors ${
          isDragOver 
            ? 'border-blue-400 bg-blue-50' 
            : 'border-gray-300 bg-gray-50'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <div className="text-center">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            📁 txt 파일로 일괄 입력
          </label>
          <input
            type="file"
            accept=".txt"
            onChange={handleFileUpload}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          <p className="text-xs text-gray-500 mt-1">
            구조화된 txt 파일을 업로드하거나 <span className="font-medium">드래그 앤 드롭</span>하면 입력 항목이 자동으로 채워집니다.
          </p>
          {isDragOver && (
            <p className="text-xs text-blue-600 mt-1 font-medium">
              파일을 놓아주세요!
            </p>
          )}
        </div>
      </div>

      <div className="border-t pt-4">
        <p className="text-sm text-gray-600 mb-4">또는 직접 입력하세요:</p>
      </div>

      {/* 필수 입력 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          과목 <span className="text-red-500">*</span>
        </label>
        <select
          value={formData.subject}
          onChange={(e) => handleChange('subject', e.target.value)}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        >
          <option value="">선택하세요</option>
          <option value="과학">과학</option>
          <option value="사회">사회</option>
        </select>
      </div>

      {/* 선택 입력 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          학년
        </label>
        <select
          value={formData.grade}
          onChange={(e) => handleChange('grade', e.target.value)}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">선택하세요</option>
          <option value="초3">초3</option>
          <option value="초4">초4</option>
          <option value="초5">초5</option>
          <option value="초6">초6</option>
          <option value="중1">중1</option>
          <option value="중2">중2</option>
          <option value="중3">중3</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          영역
        </label>
        <input
          type="text"
          value={formData.area}
          onChange={(e) => handleChange('area', e.target.value)}
          placeholder="물리, 생물, 화학 등"
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          주제
        </label>
        <input
          type="text"
          value={formData.topic}
          onChange={(e) => handleChange('topic', e.target.value)}
          placeholder="빛과 파동, 힘과 운동 등"
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          핵심어
        </label>
        <input
          type="text"
          value={formData.keywords}
          onChange={(e) => handleChange('keywords', e.target.value)}
          placeholder="굴절, 경계명, 속력차 등"
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          지문 유형
        </label>
        <input
          type="text"
          value={formData.textType}
          onChange={(e) => handleChange('textType', e.target.value)}
          placeholder="설명문, 논설문, 기사 등"
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* 지문 내용 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          지문 내용 <span className="text-red-500">*</span>
        </label>
        <textarea
          value={formData.content}
          onChange={(e) => handleChange('content', e.target.value)}
          placeholder="어휘 학습용 지문을 입력하세요."
          rows={10}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full px-4 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? '분석 중...' : '시각자료 추천 받기'}
      </button>
    </form>
  );
}