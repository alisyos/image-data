import { NextResponse } from 'next/server';
import { getCurrentPrompt } from '@/utils/googleSheets';

// 캐싱 방지를 위한 route segment config
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// POST: 프롬프트 캐시 강제 새로고침
export async function POST() {
  try {
    console.log('[Prompt Refresh API] 프롬프트 캐시 새로고침 시작:', new Date().toISOString());
    
    // 강제로 새로운 프롬프트를 읽어옴
    const prompt = await getCurrentPrompt();
    
    console.log('[Prompt Refresh API] 프롬프트 새로고침 완료:', {
      contentLength: prompt.length,
      contentPreview: prompt.substring(0, 100) + '...',
      timestamp: new Date().toISOString()
    });
    
    const response = NextResponse.json({ 
      success: true,
      message: '프롬프트가 성공적으로 새로고침되었습니다.',
      promptLength: prompt.length,
      refreshedAt: new Date().toISOString()
    });
    
    // 캐싱 방지 헤더 추가
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    
    return response;
  } catch (error) {
    console.error('[Prompt Refresh API] 프롬프트 새로고침 오류:', error);
    return NextResponse.json(
      { error: '프롬프트 새로고침 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 