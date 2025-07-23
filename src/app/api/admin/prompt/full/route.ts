import { NextResponse } from 'next/server';
import { getCurrentPrompt } from '@/utils/googleSheets';

// GET: 현재 프롬프트 전체 내용을 반환
export async function GET() {
  try {
    const prompt = await getCurrentPrompt();
    
    return NextResponse.json({ 
      prompt,
      length: prompt.length,
      lines: prompt.split('\n').length,
      lastChecked: new Date().toISOString()
    });
  } catch (error) {
    console.error('프롬프트 조회 오류:', error);
    return NextResponse.json(
      { error: '프롬프트를 조회하는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}