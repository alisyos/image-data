import OpenAI from 'openai';
import { NextRequest, NextResponse } from 'next/server';
import { FormData, Phase1Result } from '@/types';
import { readFileSync } from 'fs';
import { join } from 'path';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

function getPhase1Prompt(): string {
  const promptPath = join(process.cwd(), 'src/data/phase1-prompt.txt');
  return readFileSync(promptPath, 'utf-8');
}

function createPhase1Prompt(data: FormData): string {
  const systemPrompt = getPhase1Prompt();
  
  return `${systemPrompt}

### 입력 정보
- 과목: ${data.subject || '-'}
- 학년: ${data.grade || '-'}
- 영역: ${data.area || '-'}
- 주제: ${data.topic || '-'}
- 핵심어: ${data.keywords || '-'}
- 지문 유형: ${data.textType || '-'}

### 지문 내용
${data.content}`;
}

export async function POST(request: NextRequest) {
  try {
    console.log('[Analyze Phase1 API] 1차 분석 요청 시작:', new Date().toISOString());
    
    const data: FormData = await request.json();
    
    if (!data.subject || !data.content) {
      return NextResponse.json(
        { error: '과목과 지문 내용은 필수 입력 항목입니다.' },
        { status: 400 }
      );
    }

    console.log('[Analyze Phase1 API] 프롬프트 생성 시작');
    const prompt = createPhase1Prompt(data);
    console.log('[Analyze Phase1 API] 프롬프트 생성 완료, OpenAI API 호출 시작');
    
    const response = await openai.chat.completions.create({
      model: 'gpt-4.1',
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 3000,
    });

    console.log('[Analyze Phase1 API] OpenAI API 응답 받음');
    
    const content = response.choices[0]?.message?.content;
    
    if (!content) {
      throw new Error('OpenAI로부터 응답을 받지 못했습니다.');
    }

    if (response.choices[0]?.finish_reason === 'length') {
      return NextResponse.json(
        { error: 'AI 응답이 너무 길어 잘렸습니다. 더 간단한 지문으로 다시 시도해주세요.' },
        { status: 500 }
      );
    }

    let cleanContent = content.trim();
    
    // 마크다운 코드블록 제거
    if (cleanContent.startsWith('```json')) {
      cleanContent = cleanContent.replace(/^```json\s*/, '');
    }
    if (cleanContent.endsWith('```')) {
      cleanContent = cleanContent.replace(/\s*```$/, '');
    }
    
    cleanContent = cleanContent.trim();
    
    if (!cleanContent.endsWith('}')) {
      console.warn('JSON이 완전하지 않아 수정을 시도합니다.');
      const lastCompleteObjectIndex = cleanContent.lastIndexOf('}}');
      if (lastCompleteObjectIndex > 0) {
        cleanContent = cleanContent.substring(0, lastCompleteObjectIndex + 2);
      }
    }

    try {
      const result: Phase1Result = JSON.parse(cleanContent);
      
      if (!result.visualTypeSuitability || !result.reasonSummary) {
        throw new Error('응답 형식이 올바르지 않습니다.');
      }

      if (result.reasonSummary.length !== 5) {
        throw new Error('추천 이유는 정확히 5개여야 합니다.');
      }

      const totalPercent = Object.values(result.visualTypeSuitability).reduce((sum, val) => sum + val, 0);
      if (totalPercent !== 100) {
        console.warn(`적합도 합계가 100%가 아닙니다: ${totalPercent}% - 자동 조정합니다.`);
        
        const factor = 100 / totalPercent;
        Object.keys(result.visualTypeSuitability).forEach(key => {
          result.visualTypeSuitability[key as keyof typeof result.visualTypeSuitability] = 
            Math.round(result.visualTypeSuitability[key as keyof typeof result.visualTypeSuitability] * factor);
        });
        
        const newTotal = Object.values(result.visualTypeSuitability).reduce((sum, val) => sum + val, 0);
        if (newTotal !== 100) {
          const diff = 100 - newTotal;
          const firstKey = Object.keys(result.visualTypeSuitability)[0] as keyof typeof result.visualTypeSuitability;
          result.visualTypeSuitability[firstKey] += diff;
        }
      }

      console.log('[Analyze Phase1 API] 1차 분석 완료:', new Date().toISOString());
      
      const response = NextResponse.json(result);
      response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
      response.headers.set('Pragma', 'no-cache');
      response.headers.set('Expires', '0');
      
      return response;
    } catch (parseError) {
      console.error('JSON 파싱 오류:', parseError);
      console.error('정리된 응답:', cleanContent.substring(0, 1000) + '...');
      
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