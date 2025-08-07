import OpenAI from 'openai';
import { NextRequest, NextResponse } from 'next/server';
import { DetailRequest, VisualRecommendation } from '@/types';
import { readFileSync } from 'fs';
import { join } from 'path';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

function getDetailPrompt(visualType: string): string {
  const promptPath = join(process.cwd(), `src/data/${visualType}-prompt.txt`);
  return readFileSync(promptPath, 'utf-8');
}

function createDetailPrompt(request: DetailRequest): string {
  const systemPrompt = getDetailPrompt(request.visualType);
  const data = request.formData;
  
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
    console.log('[Analyze Detail API] 상세 분석 요청 시작:', new Date().toISOString());
    
    const requestData: DetailRequest = await request.json();
    
    if (!requestData.visualType || !requestData.formData?.subject || !requestData.formData?.content) {
      return NextResponse.json(
        { error: '시각자료 유형, 과목, 지문 내용은 필수 입력 항목입니다.' },
        { status: 400 }
      );
    }

    const validTypes = ['illustration', 'photo', 'flowchart', 'graph', 'table'];
    if (!validTypes.includes(requestData.visualType)) {
      return NextResponse.json(
        { error: '유효하지 않은 시각자료 유형입니다.' },
        { status: 400 }
      );
    }

    console.log('[Analyze Detail API] 프롬프트 생성 시작');
    const prompt = createDetailPrompt(requestData);
    console.log('[Analyze Detail API] 프롬프트 생성 완료, OpenAI API 호출 시작');
    
    const response = await openai.chat.completions.create({
      model: 'gpt-4.1',
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 4000,
    });

    console.log('[Analyze Detail API] OpenAI API 응답 받음');
    
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
      const lastCompleteObjectIndex = cleanContent.lastIndexOf('}');
      if (lastCompleteObjectIndex > 0) {
        cleanContent = cleanContent.substring(0, lastCompleteObjectIndex + 1);
      }
    }

    try {
      const result: VisualRecommendation = JSON.parse(cleanContent);
      
      // 타입별 필수 필드 검증
      if (!result.type) {
        throw new Error('응답 형식이 올바르지 않습니다.');
      }
      
      // 모든 타입은 imageGenerationPrompt가 필수
      if (!result.imageGenerationPrompt) {
        const typeNames = {
          illustration: '삽화',
          photo: '사진',
          flowchart: '순서도', 
          graph: '그래프',
          table: '도표'
        };
        throw new Error(`${typeNames[result.type as keyof typeof typeNames] || result.type} 응답에 imageGenerationPrompt가 없습니다.`);
      }

      if (result.type !== requestData.visualType) {
        result.type = requestData.visualType;
      }

      // suitabilityPercent는 클라이언트에서 1차 분석 결과를 사용하므로 여기서는 제거
      if ('suitabilityPercent' in result) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        delete (result as any).suitabilityPercent;
      }

      if (!result.freeImageSources || result.freeImageSources.length !== 3) {
        console.warn('이미지 소스가 3개가 아닙니다. 기본값으로 설정합니다.');
        result.freeImageSources = [
          {
            site: "Pixabay",
            searchKeywords: "교육, 학습",
            url: "https://pixabay.com/ko/images/search/education/"
          },
          {
            site: "Unsplash",
            searchKeywords: "학습 자료",
            url: "https://unsplash.com/s/photos/education"
          },
          {
            site: "Pexels",
            searchKeywords: "교육 도구",
            url: "https://www.pexels.com/search/education/"
          }
        ];
      }

      console.log('[Analyze Detail API] 상세 분석 완료:', new Date().toISOString());
      
      const responseObj = NextResponse.json(result);
      responseObj.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
      responseObj.headers.set('Pragma', 'no-cache');
      responseObj.headers.set('Expires', '0');
      
      return responseObj;
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