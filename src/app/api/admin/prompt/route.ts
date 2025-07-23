import { NextRequest, NextResponse } from 'next/server';
import { getCurrentPrompt, savePrompt } from '@/utils/googleSheets';

// GET: 현재 프롬프트 읽기
export async function GET() {
  try {
    const prompt = await getCurrentPrompt();
    
    return NextResponse.json({ 
      prompt,
      lastModified: new Date().toISOString()
    });
  } catch (error) {
    console.error('프롬프트 읽기 오류:', error);
    return NextResponse.json(
      { error: '프롬프트를 읽는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// POST: 프롬프트 업데이트
export async function POST(request: NextRequest) {
  try {
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
    
    // Google Sheets에 프롬프트 저장
    await savePrompt(prompt.trim(), 'admin');
    
    return NextResponse.json({ 
      success: true,
      message: '프롬프트가 성공적으로 저장되었습니다.',
      savedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('프롬프트 저장 오류:', error);
    return NextResponse.json(
      { error: '프롬프트를 저장하는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}