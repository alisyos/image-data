import { NextResponse } from 'next/server';

// googleSheets.ts의 getDefaultPrompt 함수를 직접 import
// 이렇게 하면 하나의 소스에서 기본 프롬프트를 관리할 수 있습니다.
async function getDefaultPromptForReset(): Promise<string> {
  // googleSheets.ts의 getDefaultPrompt 함수와 동일한 내용
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

// POST: 프롬프트를 기본값으로 초기화
export async function POST() {
  try {
    const { savePrompt } = await import('@/utils/googleSheets');
    const defaultPrompt = await getDefaultPromptForReset();
    
    // Google Sheets에 기본 프롬프트 저장
    await savePrompt(defaultPrompt, 'system (reset)');
    
    return NextResponse.json({ 
      success: true,
      message: '프롬프트가 기본값으로 초기화되었습니다.',
      resetAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('프롬프트 초기화 오류:', error);
    return NextResponse.json(
      { error: '프롬프트를 초기화하는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}