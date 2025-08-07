import { FormData } from '@/types';
import { getCurrentPrompt } from '@/utils/googleSheets';

/**
 * 현재 시스템 프롬프트를 읽어옵니다.
 * Google Sheets에서 프롬프트를 가져옵니다.
 */
export async function getSystemPrompt(): Promise<string> {
  console.log('[getSystemPrompt] 시스템 프롬프트 읽기 시작:', new Date().toISOString());
  const prompt = await getCurrentPrompt();
  console.log('[getSystemPrompt] 프롬프트 읽기 완료:', {
    contentLength: prompt.length,
    contentPreview: prompt.substring(0, 150) + '...',
    timestamp: new Date().toISOString()
  });
  return prompt;
}

/**
 * 프롬프트와 입력 데이터를 결합하여 최종 프롬프트를 생성합니다.
 */
export async function createPrompt(data: FormData): Promise<string> {
  console.log('[createPrompt] 최종 프롬프트 생성 시작:', new Date().toISOString());
  const systemPrompt = await getSystemPrompt();
  
  const finalPrompt = `${systemPrompt}

### 입력 정보
- 과목: ${data.subject || '-'}
- 학년: ${data.grade || '-'}
- 영역: ${data.area || '-'}
- 주제: ${data.topic || '-'}
- 핵심어: ${data.keywords || '-'}
- 지문 유형: ${data.textType || '-'}

### 지문 내용
${data.content}`;

  console.log('[createPrompt] 최종 프롬프트 생성 완료:', {
    systemPromptLength: systemPrompt.length,
    finalPromptLength: finalPrompt.length,
    inputData: {
      subject: data.subject,
      grade: data.grade,
      contentLength: data.content?.length || 0
    },
    timestamp: new Date().toISOString()
  });

  return finalPrompt;
}