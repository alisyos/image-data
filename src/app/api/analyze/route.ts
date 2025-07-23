import OpenAI from 'openai';
import { NextRequest, NextResponse } from 'next/server';
import { FormData, AnalysisResult } from '@/types';
import { createPrompt } from '@/utils/prompt';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const data: FormData = await request.json();
    
    if (!data.subject || !data.content) {
      return NextResponse.json(
        { error: '과목과 지문 내용은 필수 입력 항목입니다.' },
        { status: 400 }
      );
    }

    const prompt = await createPrompt(data);
    
    const response = await openai.chat.completions.create({
      model: 'gpt-4.1',
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 10000,
    });

    const content = response.choices[0]?.message?.content;
    
    if (!content) {
      throw new Error('OpenAI로부터 응답을 받지 못했습니다.');
    }

    // 응답이 잘렸는지 확인
    if (response.choices[0]?.finish_reason === 'length') {
      return NextResponse.json(
        { error: 'AI 응답이 너무 길어 잘렸습니다. 더 간단한 지문으로 다시 시도해주세요.' },
        { status: 500 }
      );
    }

    // JSON 형식 검증 및 정리
    let cleanContent = content.trim();
    
    // JSON이 완전하지 않은 경우 처리
    if (!cleanContent.endsWith('}')) {
      console.warn('JSON이 완전하지 않아 수정을 시도합니다.');
      // 마지막 완전한 객체까지만 파싱 시도
      const lastCompleteObjectIndex = cleanContent.lastIndexOf('}}');
      if (lastCompleteObjectIndex > 0) {
        cleanContent = cleanContent.substring(0, lastCompleteObjectIndex + 2);
      }
    }

    try {
      const result: AnalysisResult = JSON.parse(cleanContent);
      
      // 기본 검증
      if (!result.visualTypeSuitability || !result.visualRecommendations) {
        throw new Error('응답 형식이 올바르지 않습니다.');
      }

      if (result.visualRecommendations.length !== 5) {
        throw new Error('시각자료 추천은 정확히 5개여야 합니다.');
      }

      // 적합도 합계 검증 및 자동 조정
      const totalPercent = Object.values(result.visualTypeSuitability).reduce((sum, val) => sum + val, 0);
      if (totalPercent !== 100) {
        console.warn(`적합도 합계가 100%가 아닙니다: ${totalPercent}% - 자동 조정합니다.`);
        
        // 비율에 맞게 자동 조정
        const factor = 100 / totalPercent;
        Object.keys(result.visualTypeSuitability).forEach(key => {
          result.visualTypeSuitability[key as keyof typeof result.visualTypeSuitability] = 
            Math.round(result.visualTypeSuitability[key as keyof typeof result.visualTypeSuitability] * factor);
        });
        
        // 반올림 오차 조정
        const newTotal = Object.values(result.visualTypeSuitability).reduce((sum, val) => sum + val, 0);
        if (newTotal !== 100) {
          const diff = 100 - newTotal;
          const firstKey = Object.keys(result.visualTypeSuitability)[0] as keyof typeof result.visualTypeSuitability;
          result.visualTypeSuitability[firstKey] += diff;
        }
      }

      return NextResponse.json(result);
    } catch (parseError) {
      console.error('JSON 파싱 오류:', parseError);
      console.error('정리된 응답:', cleanContent.substring(0, 1000) + '...');
      
      // 더 자세한 에러 정보 제공
      let errorMessage = 'AI 응답을 파싱하는 중 오류가 발생했습니다.';
      if (parseError instanceof SyntaxError) {
        if (parseError.message.includes('Unterminated string')) {
          errorMessage += ' 응답이 너무 길어 잘린 것 같습니다.';
        } else if (parseError.message.includes('Unexpected token')) {
          errorMessage += ' JSON 형식이 올바르지 않습니다.';
        }
      }
      
      return NextResponse.json(
        { error: errorMessage },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('API 오류:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}