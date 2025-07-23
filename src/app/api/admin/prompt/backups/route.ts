import { NextResponse } from 'next/server';
import { getPromptHistory } from '@/utils/googleSheets';

export async function GET() {
  try {
    const history = await getPromptHistory();
    
    // 백업 목록 형식으로 변환
    const backups = history.map((entry) => ({
      filename: `version-${entry.version}.txt`,
      createdAt: entry.timestamp,
      modifiedAt: entry.timestamp,
      size: entry.prompt_content.length,
      preview: entry.prompt_content.substring(0, 200) + (entry.prompt_content.length > 200 ? '...' : ''),
      charCount: entry.prompt_content.length,
      version: entry.version,
      modifiedBy: entry.modified_by
    }));

    return NextResponse.json({ backups });
  } catch (error) {
    console.error('백업 목록 조회 오류:', error);
    return NextResponse.json(
      { error: '백업 목록을 조회하는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}