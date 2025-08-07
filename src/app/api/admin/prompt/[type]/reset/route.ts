import { NextRequest, NextResponse } from 'next/server';
import { writeFileSync } from 'fs';
import { join } from 'path';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface RouteParams {
  params: Promise<{
    type: string;
  }>;
}

const validTypes = ['phase1', 'illustration', 'photo', 'flowchart', 'graph', 'table'];

function getPromptFilePath(type: string): string {
  const fileName = type === 'phase1' ? 'phase1-prompt.txt' : `${type}-prompt.txt`;
  return join(process.cwd(), 'src/data', fileName);
}

function getDefaultPromptContent(type: string): string {
  const defaultPrompts = {
    phase1: `### 지시사항
아래 출력 규격에 맞추어 초·중등 어휘학습 지문을 분석하고 5가지 시각자료 유형별 적합도와 추천 이유만을 JSON 형태로 생성하십시오.

### 분석 기준
1. **illustration (삽화)**: 추상적 개념의 구체화, 상상력 자극 및 흥미 유발, 학습자의 이해도 향상
2. **photo (사진)**: 현실 연계성 제공, 실제 사례 제시, 생생한 경험 제공
3. **flowchart (순서도)**: 과정/절차/인과관계 표현, 논리적 사고 촉진, 단계별 이해 지원
4. **graph (그래프)**: 수치 데이터 시각화, 비교 분석 지원, 정량적 이해 촉진
5. **table (도표)**: 정보 체계화, 항목별 비교, 요약 정리 지원

### 출력 규격
JSON 형식으로만 답변하고, 다른 설명은 포함하지 마십시오.

\`\`\`json
{
  "visualTypeSuitability": {
    "illustration": 25,
    "photo": 20,
    "flowchart": 30,
    "graph": 15,
    "table": 10
  },
  "reasonSummary": [
    {
      "type": "illustration",
      "reason": "추상적 개념을 구체적인 이미지로 표현하여 학습자의 이해를 도울 수 있습니다."
    },
    {
      "type": "photo", 
      "reason": "실제 현상이나 사례를 시각적으로 제시하여 현실 연계성을 높일 수 있습니다."
    },
    {
      "type": "flowchart",
      "reason": "과정이나 절차를 단계별로 명확히 보여주어 논리적 사고를 촉진할 수 있습니다."
    },
    {
      "type": "graph",
      "reason": "수치 데이터나 변화 양상을 시각적으로 표현하여 정량적 이해를 돕습니다."
    },
    {
      "type": "table",
      "reason": "관련 정보를 체계적으로 정리하여 항목별 비교와 요약을 용이하게 합니다."
    }
  ]
}
\`\`\`

### 필수 검증 규칙
1. visualTypeSuitability의 각 값의 합은 반드시 100이어야 합니다.
2. reasonSummary 배열은 정확히 5개 요소를 포함해야 합니다.
3. reason은 100자 이내로 작성하십시오.
4. 각 시각자료 유형의 적합도는 지문 내용을 기반으로 합리적으로 판단하십시오.
5. JSON 형식을 정확히 준수하여 파싱 오류가 발생하지 않도록 하십시오.`,
    illustration: `### 지시사항
아래 지문에 대해 **삽화(illustration)** 시각자료의 이미지 생성 프롬프트와 저작권 프리 이미지 소스를 JSON 형태로 생성하십시오.

### 삽화 분석 기준
- 추상적 개념의 구체적 시각화
- 상상력 자극 및 학습 흥미 유발
- 복잡한 개념의 단순화 표현
- 학습자의 이해도 향상 지원
- 창의적이고 직관적인 표현

### 출력 규격
JSON 형식으로만 답변하고, 다른 설명은 포함하지 마십시오.

\`\`\`json
{
  "type": "illustration",
  "freeImageSources": [
    {
      "site": "Pixabay",
      "searchKeywords": "관련 키워드1, 키워드2",
      "url": "https://pixabay.com/ko/images/search/키워드/"
    },
    {
      "site": "Unsplash", 
      "searchKeywords": "관련 키워드3, 키워드4",
      "url": "https://unsplash.com/s/photos/키워드"
    },
    {
      "site": "Pexels",
      "searchKeywords": "관련 키워드5, 키워드6", 
      "url": "https://www.pexels.com/search/키워드/"
    }
  ],
  "imageGenerationPrompt": {
    "purpose": "초·중등 학습용 시각자료 (초6, 사회)",
    "conditions": "16:9 비율, 1920x1080 해상도, 삽화 스타일",
    "composition": "구성 요소: 주요 개념을 나타내는 캐릭터나 오브젝트를 중앙에 배치. 시각적 배치: 좌측에서 우측으로 흐르는 논리적 구성. 색상·스타일: 밝고 친근한 파스텔톤 색상, 단순하고 명확한 선화. 텍스트 삽입: 핵심 키워드를 말풍선이나 라벨로 표시. 설명 방식: 직관적이고 이해하기 쉬운 시각적 메타포 활용",
    "precautions": "모든 구성 요소가 명확히 구분되도록 하고, 학습자에게 혼동을 줄 수 있는 모호한 표현은 피할 것. 연령대에 적합한 친근하고 안전한 이미지로 구성"
  }
}
\`\`\`

### 필수 검증 규칙
1. freeImageSources는 정확히 3개 사이트를 포함하십시오.
2. 모든 URL은 실제 접근 가능한 주소여야 합니다.
3. imageGenerationPrompt의 모든 필드(purpose, conditions, composition, precautions)는 한글로 작성하십시오.
4. purpose는 학년과 과목을 포함하여 구체적으로 작성하십시오.
5. composition은 구성 요소, 시각적 배치, 색상·스타일, 텍스트 삽입, 설명 방식을 모두 포함하십시오.
6. JSON 형식을 정확히 준수하여 파싱 오류가 발생하지 않도록 하십시오.`,
    photo: `### 지시사항
아래 지문에 대해 **사진(photo)** 시각자료의 이미지 생성 프롬프트와 저작권 프리 이미지 소스를 JSON 형태로 생성하십시오.

### 사진 분석 기준
- 현실 연계성 제공 및 실제 사례 제시
- 생생한 경험과 현장감 전달
- 구체적이고 명확한 시각적 정보
- 학습 내용의 실제 적용 사례
- 현실적이고 신뢰할 수 있는 자료

### 출력 규격
JSON 형식으로만 답변하고, 다른 설명은 포함하지 마십시오.

\`\`\`json
{
  "type": "photo",
  "freeImageSources": [
    {
      "site": "Pixabay",
      "searchKeywords": "관련 키워드1, 키워드2",
      "url": "https://pixabay.com/ko/photos/search/키워드/"
    },
    {
      "site": "Unsplash", 
      "searchKeywords": "관련 키워드3, 키워드4",
      "url": "https://unsplash.com/s/photos/키워드"
    },
    {
      "site": "Pexels",
      "searchKeywords": "관련 키워드5, 키워드6", 
      "url": "https://www.pexels.com/search/키워드/"
    }
  ],
  "imageGenerationPrompt": {
    "purpose": "초·중등 학습용 시각자료 (초6, 사회)",
    "conditions": "16:9 비율, 1920x1080 해상도, 사실적 사진 스타일",
    "composition": "구성 요소: 주요 개념을 보여주는 실제 사물이나 상황을 중앙에 배치. 시각적 배치: 전경에서 배경으로 자연스러운 깊이감 형성. 색상·스타일: 자연스러운 색상, 선명하고 깨끗한 화질. 텍스트 삽입: 필요시 설명 라벨이나 캡션 추가. 설명 방식: 현실적이고 직관적인 시각적 정보 전달",
    "precautions": "실제 상황과 부합하는 정확한 표현 유지. 학습자가 오해할 수 있는 과장되거나 왜곡된 이미지 피할 것. 교육적으로 적절하고 안전한 이미지로 구성"
  }
}
\`\`\`

### 필수 검증 규칙
1. freeImageSources는 정확히 3개 사이트를 포함하십시오.
2. 모든 URL은 실제 접근 가능한 주소여야 합니다.
3. imageGenerationPrompt의 모든 필드(purpose, conditions, composition, precautions)는 한글로 작성하십시오.
4. purpose는 학년과 과목을 포함하여 구체적으로 작성하십시오.
5. composition은 구성 요소, 시각적 배치, 색상·스타일, 텍스트 삽입, 설명 방식을 모두 포함하십시오.
6. JSON 형식을 정확히 준수하여 파싱 오류가 발생하지 않도록 하십시오.`,
    flowchart: `### 지시사항
아래 지문에 대해 **순서도(flowchart)** 시각자료의 이미지 생성 프롬프트와 저작권 프리 이미지 소스를 JSON 형태로 생성하십시오.

### 순서도 분석 기준
- 과정, 절차, 인과관계의 명확한 표현
- 논리적 사고력 촉진 및 단계별 이해 지원
- 복잡한 과정의 체계적 정리
- 시간적 순서나 논리적 흐름 시각화
- 문제 해결 과정의 구조화

### 출력 규격
JSON 형식으로만 답변하고, 다른 설명은 포함하지 마십시오.

\`\`\`json
{
  "type": "flowchart",
  "freeImageSources": [
    {
      "site": "Pixabay",
      "searchKeywords": "관련 키워드1, 키워드2",
      "url": "https://pixabay.com/ko/images/search/키워드/"
    },
    {
      "site": "Unsplash", 
      "searchKeywords": "관련 키워드3, 키워드4",
      "url": "https://unsplash.com/s/photos/키워드"
    },
    {
      "site": "Pexels",
      "searchKeywords": "관련 키워드5, 키워드6", 
      "url": "https://www.pexels.com/search/키워드/"
    }
  ],
  "imageGenerationPrompt": {
    "purpose": "초·중등 학습용 시각자료 (초6, 사회)",
    "conditions": "16:9 비율, 1920x1080 해상도, 순서도 스타일",
    "composition": "구성 요소: 주요 과정을 나타내는 도형과 화살표를 체계적으로 배치. 시각적 배치: 상단에서 하단으로 또는 좌측에서 우측으로 논리적 흐름 구성. 색상·스타일: 명확한 구분을 위한 색상 코딩, 깔끔한 도형과 선. 텍스트 삽입: 각 단계별 핵심 내용을 간결하게 표시. 설명 방식: 단계적이고 직관적인 흐름으로 과정 시각화",
    "precautions": "각 단계가 명확히 구분되도록 하고, 흐름이 복잡하거나 혼동되지 않도록 단순하고 명확한 구성. 학습자가 따라가기 쉬운 논리적 순서 유지"
  }
}
\`\`\`

### 필수 검증 규칙
1. freeImageSources는 정확히 3개 사이트를 포함하십시오.
2. 모든 URL은 실제 접근 가능한 주소여야 합니다.
3. imageGenerationPrompt의 모든 필드(purpose, conditions, composition, precautions)는 한글로 작성하십시오.
4. purpose는 학년과 과목을 포함하여 구체적으로 작성하십시오.
5. composition은 구성 요소, 시각적 배치, 색상·스타일, 텍스트 삽입, 설명 방식을 모두 포함하십시오.
6. JSON 형식을 정확히 준수하여 파싱 오류가 발생하지 않도록 하십시오.`,
    graph: `### 지시사항
아래 지문에 대해 **그래프(graph)** 시각자료의 이미지 생성 프롬프트와 저작권 프리 이미지 소스를 JSON 형태로 생성하십시오.

### 그래프 분석 기준
- 수치 데이터의 효과적 시각화
- 비교 분석 및 추세 파악 지원
- 정량적 이해와 데이터 해석 능력 향상
- 변화 양상이나 관계성 명확한 표현
- 통계적 사고력 발달 촉진

### 출력 규격
JSON 형식으로만 답변하고, 다른 설명은 포함하지 마십시오.

\`\`\`json
{
  "type": "graph",
  "freeImageSources": [
    {
      "site": "Pixabay",
      "searchKeywords": "관련 키워드1, 키워드2",
      "url": "https://pixabay.com/ko/images/search/키워드/"
    },
    {
      "site": "Unsplash", 
      "searchKeywords": "관련 키워드3, 키워드4",
      "url": "https://unsplash.com/s/photos/키워드"
    },
    {
      "site": "Pexels",
      "searchKeywords": "관련 키워드5, 키워드6", 
      "url": "https://www.pexels.com/search/키워드/"
    }
  ],
  "imageGenerationPrompt": {
    "purpose": "초·중등 학습용 시각자료 (초6, 사회)",
    "conditions": "16:9 비율, 1920x1080 해상도, 그래프 스타일",
    "composition": "구성 요소: 명확한 축과 데이터 포인트, 범례를 포함한 완성된 그래프. 시각적 배치: 좌측 하단을 원점으로 하는 표준 그래프 형태. 색상·스타일: 데이터별 구분되는 색상, 깔끔한 격자와 축. 텍스트 삽입: 축 레이블과 제목, 수치 표시. 설명 방식: 데이터의 변화나 관계를 명확히 보여주는 시각적 표현",
    "precautions": "데이터 수치가 정확하고 읽기 쉽도록 하며, 축의 눈금과 범례가 명확히 표시되도록 구성. 학습자가 데이터 해석을 쉽게 할 수 있는 직관적인 그래프"
  }
}
\`\`\`

### 필수 검증 규칙
1. freeImageSources는 정확히 3개 사이트를 포함하십시오.
2. 모든 URL은 실제 접근 가능한 주소여야 합니다.
3. imageGenerationPrompt의 모든 필드(purpose, conditions, composition, precautions)는 한글로 작성하십시오.
4. purpose는 학년과 과목을 포함하여 구체적으로 작성하십시오.
5. composition은 구성 요소, 시각적 배치, 색상·스타일, 텍스트 삽입, 설명 방식을 모두 포함하십시오.
6. JSON 형식을 정확히 준수하여 파싱 오류가 발생하지 않도록 하십시오.`,
    table: `### 지시사항
아래 지문에 대해 **도표(table)** 시각자료의 이미지 생성 프롬프트와 저작권 프리 이미지 소스를 JSON 형태로 생성하십시오.

### 도표 분석 기준
- 정보의 체계적 정리 및 구조화
- 항목별 비교와 분류의 용이성
- 복잡한 정보의 요약 및 정리
- 관련 데이터의 종합적 제시
- 체계적 사고력 및 정리 능력 향상

### 출력 규격
JSON 형식으로만 답변하고, 다른 설명은 포함하지 마십시오.

\`\`\`json
{
  "type": "table",
  "freeImageSources": [
    {
      "site": "Pixabay",
      "searchKeywords": "관련 키워드1, 키워드2",
      "url": "https://pixabay.com/ko/images/search/키워드/"
    },
    {
      "site": "Unsplash", 
      "searchKeywords": "관련 키워드3, 키워드4",
      "url": "https://unsplash.com/s/photos/키워드"
    },
    {
      "site": "Pexels",
      "searchKeywords": "관련 키워드5, 키워드6", 
      "url": "https://www.pexels.com/search/키워드/"
    }
  ],
  "imageGenerationPrompt": {
    "purpose": "초·중등 학습용 시각자료 (초6, 사회)",
    "conditions": "16:9 비율, 1920x1080 해상도, 도표 스타일",
    "composition": "구성 요소: 명확한 헤더와 행/열 구조를 가진 완성된 표. 시각적 배치: 좌상단부터 시작하는 격자형 레이아웃. 색상·스타일: 헤더와 내용을 구분하는 색상, 읽기 쉬운 경계선. 텍스트 삽입: 각 셀에 적절한 내용과 라벨 배치. 설명 방식: 정보를 체계적으로 분류하고 정리하는 표 형태",
    "precautions": "모든 정보가 적절한 위치에 배치되고, 행과 열의 구분이 명확하도록 구성. 학습자가 정보를 쉽게 찾고 비교할 수 있는 직관적인 표 구조"
  }
}
\`\`\`

### 필수 검증 규칙
1. freeImageSources는 정확히 3개 사이트를 포함하십시오.
2. 모든 URL은 실제 접근 가능한 주소여야 합니다.
3. imageGenerationPrompt의 모든 필드(purpose, conditions, composition, precautions)는 한글로 작성하십시오.
4. purpose는 학년과 과목을 포함하여 구체적으로 작성하십시오.
5. composition은 구성 요소, 시각적 배치, 색상·스타일, 텍스트 삽입, 설명 방식을 모두 포함하십시오.
6. JSON 형식을 정확히 준수하여 파싱 오류가 발생하지 않도록 하십시오.`
  };
  
  return defaultPrompts[type as keyof typeof defaultPrompts] || '';
}

// POST 요청: 프롬프트를 기본값으로 초기화
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { type } = await params;
    
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: '유효하지 않은 프롬프트 유형입니다.' },
        { status: 400 }
      );
    }

    const defaultPrompt = getDefaultPromptContent(type);
    const filePath = getPromptFilePath(type);
    
    writeFileSync(filePath, defaultPrompt, 'utf-8');

    return NextResponse.json({ 
      success: true, 
      message: '프롬프트가 기본값으로 초기화되었습니다.',
      prompt: defaultPrompt
    });
  } catch (error) {
    console.error('프롬프트 초기화 오류:', error);
    return NextResponse.json(
      { error: '프롬프트를 초기화하는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}