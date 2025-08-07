import { NextRequest, NextResponse } from 'next/server';
import { getCurrentPrompt, savePrompt } from '@/utils/googleSheets';

// 캐싱 방지를 위한 route segment config
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET: 현재 프롬프트 읽기
export async function GET() {
  try {
    console.log('[Admin Prompt API] 프롬프트 읽기 요청:', new Date().toISOString());
    
    const prompt = await getCurrentPrompt();
    
    console.log('[Admin Prompt API] 프롬프트 읽기 완료:', {
      contentLength: prompt.length,
      timestamp: new Date().toISOString()
    });
    
    const response = NextResponse.json({ 
      prompt,
      lastModified: new Date().toISOString()
    });
    
    // 캐싱 방지 헤더 추가
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    
    return response;
  } catch (error) {
    console.error('[Admin Prompt API] 프롬프트 읽기 오류:', error);
    return NextResponse.json(
      { error: '프롬프트를 읽는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// POST: 프롬프트 업데이트
export async function POST(request: NextRequest) {
  try {
    console.log('[Admin Prompt API] 프롬프트 저장 요청 시작:', new Date().toISOString());
    
    const { prompt } = await request.json();
    
    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { error: '유효한 프롬프트를 입력해주세요.' },
        { status: 400 }
      );
    }
    
    if (prompt.trim().length === 0) {
      return NextResponse.json(
        { error: '프롬프트는 비어있을 수 없습니다.' },
        { status: 400 }
      );
    }
    
    console.log('[Admin Prompt API] Google Sheets에 프롬프트 저장 시작:', {
      contentLength: prompt.trim().length,
      timestamp: new Date().toISOString()
    });
    
    // Google Sheets에 프롬프트 저장
    await savePrompt(prompt.trim(), 'admin');
    
    console.log('[Admin Prompt API] 프롬프트 저장 완료:', new Date().toISOString());
    
    const response = NextResponse.json({ 
      success: true,
      message: '프롬프트가 성공적으로 저장되었습니다.',
      savedAt: new Date().toISOString()
    });
    
    // 캐싱 방지 헤더 추가
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    
    return response;
  } catch (error) {
    console.error('[Admin Prompt API] 프롬프트 저장 오류:', error);
    return NextResponse.json(
      { error: '프롬프트를 저장하는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}