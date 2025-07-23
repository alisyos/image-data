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

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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