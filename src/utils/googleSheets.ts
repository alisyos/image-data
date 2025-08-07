import { GoogleAuth } from 'google-auth-library';
import { sheets_v4, google } from 'googleapis';

// 환경 변수 검증
const GOOGLE_SHEETS_PRIVATE_KEY = process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, '\n');
const GOOGLE_SHEETS_CLIENT_EMAIL = process.env.GOOGLE_SHEETS_CLIENT_EMAIL;
const GOOGLE_SHEETS_SPREADSHEET_ID = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;

if (!GOOGLE_SHEETS_PRIVATE_KEY || !GOOGLE_SHEETS_CLIENT_EMAIL || !GOOGLE_SHEETS_SPREADSHEET_ID) {
  console.warn('Google Sheets 환경 변수가 설정되지 않았습니다.');
}

// Google Sheets 클라이언트 초기화
let sheets: sheets_v4.Sheets | null = null;

async function initializeSheetsClient(): Promise<sheets_v4.Sheets> {
  if (sheets) return sheets;

  if (!GOOGLE_SHEETS_PRIVATE_KEY || !GOOGLE_SHEETS_CLIENT_EMAIL) {
    throw new Error('Google Sheets 인증 정보가 설정되지 않았습니다.');
  }

  const auth = new GoogleAuth({
    credentials: {
      private_key: GOOGLE_SHEETS_PRIVATE_KEY,
      client_email: GOOGLE_SHEETS_CLIENT_EMAIL,
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  sheets = google.sheets({ version: 'v4', auth });
  return sheets;
}

// 시트 이름 상수
const SHEETS = {
  CURRENT_PROMPT: 'current_prompt',
  PROMPT_HISTORY: 'prompt_history',
} as const;

export interface PromptHistoryEntry {
  timestamp: string;
  version: number;
  prompt_content: string;
  modified_by: string;
}

/**
 * 현재 활성 프롬프트를 가져옵니다.
 */
export async function getCurrentPrompt(): Promise<string> {
  try {
    console.log('[getCurrentPrompt] Google Sheets에서 프롬프트 읽기 시작:', new Date().toISOString());
    
    const sheetsClient = await initializeSheetsClient();
    
    if (!GOOGLE_SHEETS_SPREADSHEET_ID) {
      console.log('[getCurrentPrompt] GOOGLE_SHEETS_SPREADSHEET_ID가 설정되지 않음 - 기본 프롬프트 반환');
      throw new Error('GOOGLE_SHEETS_SPREADSHEET_ID가 설정되지 않았습니다.');
    }

    // 캐싱 방지를 위한 타임스탬프 추가
    const timestamp = Date.now();
    console.log('[getCurrentPrompt] API 호출 시작:', timestamp);

    const response = await sheetsClient.spreadsheets.values.get({
      spreadsheetId: GOOGLE_SHEETS_SPREADSHEET_ID,
      range: `${SHEETS.CURRENT_PROMPT}!A2:B2`, // A2: timestamp, B2: prompt_content
    });

    const values = response.data.values;
    console.log('[getCurrentPrompt] API 응답 받음:', {
      hasValues: !!values,
      valuesLength: values?.length || 0,
      hasPromptContent: !!(values && values.length > 0 && values[0][1]),
      timestamp: new Date().toISOString()
    });

    if (!values || values.length === 0 || !values[0][1]) {
      console.log('[getCurrentPrompt] 유효한 프롬프트 없음 - 기본 프롬프트 반환');
      // 프롬프트가 없으면 기본 프롬프트 반환
      return getDefaultPrompt();
    }

    const promptContent = values[0][1];
    console.log('[getCurrentPrompt] 프롬프트 성공적으로 읽음:', {
      contentLength: promptContent.length,
      contentPreview: promptContent.substring(0, 100) + '...',
      timestamp: new Date().toISOString()
    });

    return promptContent; // prompt_content
  } catch (error) {
    console.error('[getCurrentPrompt] Google Sheets에서 프롬프트 읽기 실패:', error);
    console.log('[getCurrentPrompt] 오류로 인해 기본 프롬프트 반환:', new Date().toISOString());
    // 오류 시 기본 프롬프트 반환
    return getDefaultPrompt();
  }
}

/**
 * 새로운 프롬프트를 저장합니다.
 */
export async function savePrompt(prompt: string, modifiedBy: string = 'admin'): Promise<void> {
  try {
    const sheetsClient = await initializeSheetsClient();
    
    if (!GOOGLE_SHEETS_SPREADSHEET_ID) {
      throw new Error('GOOGLE_SHEETS_SPREADSHEET_ID가 설정되지 않았습니다.');
    }

    const timestamp = new Date().toISOString();

    // 1. 현재 프롬프트 업데이트
    await sheetsClient.spreadsheets.values.update({
      spreadsheetId: GOOGLE_SHEETS_SPREADSHEET_ID,
      range: `${SHEETS.CURRENT_PROMPT}!A2:B2`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [[timestamp, prompt]],
      },
    });

    // 2. 히스토리에 추가
    await addToHistory(prompt, modifiedBy, timestamp);

  } catch (error) {
    console.error('Google Sheets에 프롬프트 저장 실패:', error);
    throw new Error('프롬프트를 저장하는 중 오류가 발생했습니다.');
  }
}

/**
 * 프롬프트 히스토리에 새 항목을 추가합니다.
 */
async function addToHistory(prompt: string, modifiedBy: string, timestamp: string): Promise<void> {
  try {
    const sheetsClient = await initializeSheetsClient();
    
    if (!GOOGLE_SHEETS_SPREADSHEET_ID) {
      throw new Error('GOOGLE_SHEETS_SPREADSHEET_ID가 설정되지 않았습니다.');
    }

    // 현재 히스토리 조회하여 버전 번호 계산
    const historyResponse = await sheetsClient.spreadsheets.values.get({
      spreadsheetId: GOOGLE_SHEETS_SPREADSHEET_ID,
      range: `${SHEETS.PROMPT_HISTORY}!A:D`,
    });

    const historyValues = historyResponse.data.values || [];
    const version = historyValues.length; // 헤더 포함하여 버전 번호 계산

    // 새 히스토리 항목 추가
    await sheetsClient.spreadsheets.values.append({
      spreadsheetId: GOOGLE_SHEETS_SPREADSHEET_ID,
      range: `${SHEETS.PROMPT_HISTORY}!A:D`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [[timestamp, version, prompt, modifiedBy]],
      },
    });

  } catch (error) {
    console.error('히스토리 추가 실패:', error);
    // 히스토리 추가 실패는 치명적이지 않으므로 에러를 던지지 않음
  }
}

/**
 * 프롬프트 히스토리를 가져옵니다.
 */
export async function getPromptHistory(): Promise<PromptHistoryEntry[]> {
  try {
    const sheetsClient = await initializeSheetsClient();
    
    if (!GOOGLE_SHEETS_SPREADSHEET_ID) {
      throw new Error('GOOGLE_SHEETS_SPREADSHEET_ID가 설정되지 않았습니다.');
    }

    const response = await sheetsClient.spreadsheets.values.get({
      spreadsheetId: GOOGLE_SHEETS_SPREADSHEET_ID,
      range: `${SHEETS.PROMPT_HISTORY}!A2:D`, // 헤더 제외
    });

    const values = response.data.values || [];
    
    return values.map((row): PromptHistoryEntry => ({
      timestamp: row[0] || '',
      version: parseInt(row[1] || '0'),
      prompt_content: row[2] || '',
      modified_by: row[3] || 'unknown',
    })).reverse(); // 최신순으로 정렬

  } catch (error) {
    console.error('Google Sheets에서 히스토리 읽기 실패:', error);
    return [];
  }
}

/**
 * 특정 버전의 프롬프트로 복원합니다.
 */
export async function restorePrompt(version: number, restoredBy: string = 'admin'): Promise<string> {
  try {
    const history = await getPromptHistory();
    const targetEntry = history.find(entry => entry.version === version);
    
    if (!targetEntry) {
      throw new Error(`버전 ${version}을 찾을 수 없습니다.`);
    }

    // 복원된 프롬프트를 현재 프롬프트로 설정
    await savePrompt(targetEntry.prompt_content, `${restoredBy} (restored from v${version})`);
    
    return targetEntry.prompt_content;

  } catch (error) {
    console.error('프롬프트 복원 실패:', error);
    throw new Error('프롬프트 복원 중 오류가 발생했습니다.');
  }
}

/**
 * Google Sheets에 필요한 시트들을 초기화합니다.
 */
export async function initializeGoogleSheets(): Promise<void> {
  try {
    const sheetsClient = await initializeSheetsClient();
    
    if (!GOOGLE_SHEETS_SPREADSHEET_ID) {
      throw new Error('GOOGLE_SHEETS_SPREADSHEET_ID가 설정되지 않았습니다.');
    }

    // 스프레드시트 정보 조회
    const spreadsheet = await sheetsClient.spreadsheets.get({
      spreadsheetId: GOOGLE_SHEETS_SPREADSHEET_ID,
    });

    const existingSheets = spreadsheet.data.sheets?.map(sheet => sheet.properties?.title) || [];

    // current_prompt 시트 생성
    if (!existingSheets.includes(SHEETS.CURRENT_PROMPT)) {
      await sheetsClient.spreadsheets.batchUpdate({
        spreadsheetId: GOOGLE_SHEETS_SPREADSHEET_ID,
        requestBody: {
          requests: [{
            addSheet: {
              properties: {
                title: SHEETS.CURRENT_PROMPT,
              },
            },
          }],
        },
      });

      // 헤더 추가
      await sheetsClient.spreadsheets.values.update({
        spreadsheetId: GOOGLE_SHEETS_SPREADSHEET_ID,
        range: `${SHEETS.CURRENT_PROMPT}!A1:B1`,
        valueInputOption: 'RAW',
        requestBody: {
          values: [['timestamp', 'prompt_content']],
        },
      });
    }

    // prompt_history 시트 생성
    if (!existingSheets.includes(SHEETS.PROMPT_HISTORY)) {
      await sheetsClient.spreadsheets.batchUpdate({
        spreadsheetId: GOOGLE_SHEETS_SPREADSHEET_ID,
        requestBody: {
          requests: [{
            addSheet: {
              properties: {
                title: SHEETS.PROMPT_HISTORY,
              },
            },
          }],
        },
      });

      // 헤더 추가
      await sheetsClient.spreadsheets.values.update({
        spreadsheetId: GOOGLE_SHEETS_SPREADSHEET_ID,
        range: `${SHEETS.PROMPT_HISTORY}!A1:D1`,
        valueInputOption: 'RAW',
        requestBody: {
          values: [['timestamp', 'version', 'prompt_content', 'modified_by']],
        },
      });
    }

  } catch (error) {
    console.error('Google Sheets 초기화 실패:', error);
    throw new Error('Google Sheets를 초기화하는 중 오류가 발생했습니다.');
  }
}


/**
 * 기본 프롬프트를 반환합니다.
 */
function getDefaultPrompt(): string {
  return `### 지시사항
아래 출력 규격에 맞추어 초·중등 어휘학습 지문을 분석하고 5가지 시각자료 유형별 적합도와 상세 추천 정보를 JSON 형태로 생성하십시오.

### 작성지침
1. 전체 구조
- 결과는 순수 JSON(UTF-8) 만 출력합니다.
- JSON 외의 문장·설명·주석은 절대 출력하지 마십시오.
- 최상위 키는 **visualTypeSuitability, visualRecommendations** 2개이며 **순서 고정**입니다.
- 모든 키와 하위 필드는 반드시 출력하며, 값이 없거나 파악 불가한 경우 단일 문자열 "-" 로 기재합니다.

2. 필수 필드 및 값 규칙
(1) **visualTypeSuitability**
- 5가지 시각자료 유형별 적합도를 **0~100% 정수**로 산출
- 모든 퍼센트의 합이 반드시 **100%**가 되도록 조정
- 지문 내용, 과목, 학년을 종합적으로 고려하여 산출

(2) **visualRecommendations**
- **5개 시각자료 유형**(illustration, photo, flowchart, graph, table) 모두 포함
- 적합도 높은 순서대로 배열 정렬
- 각 항목의 모든 하위 필드는 필수 출력

3. 세부 작성 기준
(1) **reason**: 해당 시각자료가 왜 적합한지 **교육적 근거** 중심으로 작성 (100자 이내)
(2) **composition**: 실제 구성 요소, 배치, 디자인 방향 등 **구체적 방안** 제시 (200자 이내)
(3) **implementation**: 제작 도구, 기술적 고려사항, 주의점 등 **실용적 정보** (150자 이내)
(4) **freeImageSources**:
- **정확히 3개 사이트** 정보 제공: Pixabay, Unsplash, Pexels
- 각 사이트별로 **site, searchKeywords, url** 필드 필수 작성
- **searchKeywords**: 영어로 2-4개 키워드, 쉼표와 공백으로 구분 (예: "science, physics, light")
- **url**: 실제 검색 가능한 완전한 URL 생성 (키워드를 URL 인코딩하여 삽입)
  * Pixabay: https://pixabay.com/ko/images/search/{URL인코딩된키워드}/
  * Unsplash: https://unsplash.com/s/photos/{URL인코딩된키워드}
  * Pexels: https://www.pexels.com/ko-kr/search/{URL인코딩된키워드}/
- 키워드는 지문 내용과 시각자료 유형에 맞게 구체적으로 선정
(5) **aiPrompt**:
- 영어로 작성 (AI 이미지 생성 도구 최적화)
- 구체적이고 상세한 설명 포함
- 교육용, 학습자료 용도 명시

4. 시각자료 유형별 분석 기준
- **illustration**: 추상적 개념의 구체화, 상상력 자극, 흥미 유발
- **photo**: 현실 연계성, 실제 사례 제시, 생생한 경험 제공
- **flowchart**: 과정/절차/인과관계 표현, 논리적 사고 촉진
- **graph**: 수치 데이터 시각화, 비교 분석, 정량적 이해
- **table**: 정보 체계화, 항목별 비교, 요약 정리

5. 검증 규칙
- visualRecommendations는 정확히 **5개 요소** 포함
- 적합도 퍼센트 총합이 **100%** 일치
- 모든 URL은 **실제 접근 가능한 주소**
- JSON 파싱 오류 없도록 특수문자 이스케이프 처리
- 모든 문자열 값 앞뒤 공백·줄바꿈 제거

### 필수 출력 형식 (반드시 이 JSON 구조를 따르십시오)

{
  "visualTypeSuitability": {
    "illustration": [0-100 정수],
    "photo": [0-100 정수],
    "flowchart": [0-100 정수],
    "graph": [0-100 정수],
    "table": [0-100 정수]
  },
  "visualRecommendations": [
    {
      "type": "illustration",
      "suitabilityPercent": [해당 퍼센트],
      "reason": "[100자 이내 추천 이유]",
      "composition": "[200자 이내 구성 방안]",
      "implementation": "[150자 이내 제작 고려사항]",
      "freeImageSources": [
        {
          "site": "Pixabay",
          "searchKeywords": "[영어 키워드, 쉼표로 구분]",
          "url": "https://pixabay.com/ko/images/search/[URL인코딩된키워드]/"
        },
        {
          "site": "Unsplash",
          "searchKeywords": "[영어 키워드, 쉼표로 구분]",
          "url": "https://unsplash.com/s/photos/[URL인코딩된키워드]"
        },
        {
          "site": "Pexels",
          "searchKeywords": "[영어 키워드, 쉼표로 구분]",
          "url": "https://www.pexels.com/ko-kr/search/[URL인코딩된키워드]/"
        }
      ],
      "aiPrompt": "[영어로 작성된 AI 이미지 생성 프롬프트]"
    },
    {
      "type": "photo",
      "suitabilityPercent": [해당 퍼센트],
      "reason": "[100자 이내 추천 이유]",
      "composition": "[200자 이내 구성 방안]",
      "implementation": "[150자 이내 제작 고려사항]",
      "freeImageSources": [
        {
          "site": "Pixabay",
          "searchKeywords": "[영어 키워드, 쉼표로 구분]",
          "url": "https://pixabay.com/ko/images/search/[URL인코딩된키워드]/"
        },
        {
          "site": "Unsplash",
          "searchKeywords": "[영어 키워드, 쉼표로 구분]",
          "url": "https://unsplash.com/s/photos/[URL인코딩된키워드]"
        },
        {
          "site": "Pexels",
          "searchKeywords": "[영어 키워드, 쉼표로 구분]",
          "url": "https://www.pexels.com/ko-kr/search/[URL인코딩된키워드]/"
        }
      ],
      "aiPrompt": "[영어로 작성된 AI 이미지 생성 프롬프트]"
    },
    {
      "type": "flowchart",
      "suitabilityPercent": [해당 퍼센트],
      "reason": "[100자 이내 추천 이유]",
      "composition": "[200자 이내 구성 방안]",
      "implementation": "[150자 이내 제작 고려사항]",
      "freeImageSources": [
        {
          "site": "Pixabay",
          "searchKeywords": "[영어 키워드, 쉼표로 구분]",
          "url": "https://pixabay.com/ko/images/search/[URL인코딩된키워드]/"
        },
        {
          "site": "Unsplash",
          "searchKeywords": "[영어 키워드, 쉼표로 구분]",
          "url": "https://unsplash.com/s/photos/[URL인코딩된키워드]"
        },
        {
          "site": "Pexels",
          "searchKeywords": "[영어 키워드, 쉼표로 구분]",
          "url": "https://www.pexels.com/ko-kr/search/[URL인코딩된키워드]/"
        }
      ],
      "aiPrompt": "[영어로 작성된 AI 이미지 생성 프롬프트]"
    },
    {
      "type": "graph",
      "suitabilityPercent": [해당 퍼센트],
      "reason": "[100자 이내 추천 이유]",
      "composition": "[200자 이내 구성 방안]",
      "implementation": "[150자 이내 제작 고려사항]",
      "freeImageSources": [
        {
          "site": "Pixabay",
          "searchKeywords": "[영어 키워드, 쉼표로 구분]",
          "url": "https://pixabay.com/ko/images/search/[URL인코딩된키워드]/"
        },
        {
          "site": "Unsplash",
          "searchKeywords": "[영어 키워드, 쉼표로 구분]",
          "url": "https://unsplash.com/s/photos/[URL인코딩된키워드]"
        },
        {
          "site": "Pexels",
          "searchKeywords": "[영어 키워드, 쉼표로 구분]",
          "url": "https://www.pexels.com/ko-kr/search/[URL인코딩된키워드]/"
        }
      ],
      "aiPrompt": "[영어로 작성된 AI 이미지 생성 프롬프트]"
    },
    {
      "type": "table",
      "suitabilityPercent": [해당 퍼센트],
      "reason": "[100자 이내 추천 이유]",
      "composition": "[200자 이내 구성 방안]",
      "implementation": "[150자 이내 제작 고려사항]",
      "freeImageSources": [
        {
          "site": "Pixabay",
          "searchKeywords": "[영어 키워드, 쉼표로 구분]",
          "url": "https://pixabay.com/ko/images/search/[URL인코딩된키워드]/"
        },
        {
          "site": "Unsplash",
          "searchKeywords": "[영어 키워드, 쉼표로 구분]",
          "url": "https://unsplash.com/s/photos/[URL인코딩된키워드]"
        },
        {
          "site": "Pexels",
          "searchKeywords": "[영어 키워드, 쉼표로 구분]",
          "url": "https://www.pexels.com/ko-kr/search/[URL인코딩된키워드]/"
        }
      ],
      "aiPrompt": "[영어로 작성된 AI 이미지 생성 프롬프트]"
    }
  ]
}

**중요**: 
1. 위의 JSON 구조를 정확히 따르되, 대괄호 안의 설명 부분은 실제 값으로 치환하십시오.
2. visualRecommendations 배열은 적합도 높은 순서대로 정렬하십시오.
3. 모든 퍼센트의 합이 100%가 되도록 하십시오.
4. freeImageSources는 반드시 3개 사이트 모두 포함하십시오.
5. 순수 JSON만 출력하고 다른 텍스트는 포함하지 마십시오.`;
}