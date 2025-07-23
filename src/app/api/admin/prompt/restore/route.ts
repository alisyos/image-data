import { NextRequest, NextResponse } from 'next/server';
import { restorePrompt } from '@/utils/googleSheets';

export async function POST(request: NextRequest) {
  try {
    const { version } = await request.json();
    
    if (!version || typeof version !== 'number') {
      return NextResponse.json(
        { error: '유효한 버전 번호를 입력해주세요.' },
        { status: 400 }
      );
    }
    
    // 지정된 버전의 프롬프트로 복원
    const restoredPrompt = await restorePrompt(version, 'admin');
    
    return NextResponse.json({
      success: true,
      message: `버전 ${version}으로 복원되었습니다.`,
      restoredAt: new Date().toISOString(),
      preview: restoredPrompt.substring(0, 200) + (restoredPrompt.length > 200 ? '...' : '')
    });
  } catch (error) {
    console.error('프롬프트 복원 오류:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '프롬프트 복원 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}