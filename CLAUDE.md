# 초·중등 어휘학습 지문 시각자료 추천 시스템

## 프로젝트 개요
초·중등 어휘 학습을 위한 지문에 시각자료를 추가하기 위한 시각자료 추천 및 생성 시스템입니다. OpenAI GPT API를 활용하여 교육용 지문을 분석하고 최적의 시각자료를 추천합니다.

## 시스템 기능
- 지문 내용을 분석하여 5가지 시각자료 유형별 적합도 평가
- 시각자료별 상세 추천 정보 제공 
- 저작권 프리 이미지 검색 정보 제공
- AI 이미지 생성 프롬프트 제공
- 관리자 시스템을 통한 프롬프트 관리 및 백업

## 기술 스택
- **프레임워크**: Next.js 15 (App Router)
- **언어**: TypeScript
- **스타일링**: Tailwind CSS v4
- **AI API**: OpenAI API
- **배포**: Vercel

## 입력 항목

### 필수 입력
- **과목**: 드롭다운 선택 (과학, 사회)
- **지문 내용**: 직접 입력 (필수)

### 선택 입력  
- **학년**: 드롭다운 선택 (초3, 초4, 초5, 초6, 중1, 중2, 중3)
- **영역**: 직접 입력 (물리, 생물, 화학 등)
- **주제**: 직접 입력 (빛과 파동, 힘과 운동 등)
- **핵심어**: 직접 입력 (굴절, 경계명, 속력차 등)
- **지문 유형**: 직접 입력 (설명문, 논설문, 기사 등)

## 출력 형식

### JSON 구조
```json
{
  "visualTypeSuitability": {
    "illustration": 0,
    "photo": 0, 
    "flowchart": 0,
    "graph": 0,
    "table": 0
  },
  "visualRecommendations": [
    {
      "type": "flowchart",
      "suitabilityPercent": 0,
      "reason": "추천 이유 (100자 이내)",
      "composition": "구성 방안 (200자 이내)",
      "implementation": "제작 고려사항 (150자 이내)",
      "freeImageSources": [
        {
          "site": "Pixabay",
          "searchKeywords": "검색 키워드",
          "url": "검색 URL"
        }
      ],
      "aiPrompt": "AI 이미지 생성 프롬프트 (영어)"
    }
  ]
}
```

## 시각자료 유형별 분석 기준

### 1. illustration (삽화)
- 추상적 개념의 구체화
- 상상력 자극 및 흥미 유발
- 학습자의 이해도 향상

### 2. photo (사진)
- 현실 연계성 제공
- 실제 사례 제시
- 생생한 경험 제공

### 3. flowchart (순서도)
- 과정/절차/인과관계 표현
- 논리적 사고 촉진
- 단계별 이해 지원

### 4. graph (그래프)
- 수치 데이터 시각화
- 비교 분석 지원
- 정량적 이해 촉진

### 5. table (도표)
- 정보 체계화
- 항목별 비교
- 요약 정리 지원

## 개발 환경 설정

### 환경 변수
```bash
# OpenAI API
OPENAI_API_KEY=your-openai-api-key-here

# Google Sheets API (프롬프트 저장)
GOOGLE_SHEETS_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nyour-private-key-here\n-----END PRIVATE KEY-----"
GOOGLE_SHEETS_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
GOOGLE_SHEETS_SPREADSHEET_ID=your-spreadsheet-id-here
```

### 개발 서버 실행
```bash
npm install
npm run dev
```

### 빌드 및 배포
```bash
npm run build
npm run start
```

## 주요 컴포넌트

### 1. 메인 페이지 (src/app/page.tsx)
- 좌우 분할 레이아웃 (1/3 입력, 2/3 결과)
- 실시간 분석 결과 표시
- 에러 핸들링 및 로딩 상태 관리

### 2. 입력 폼 (src/components/InputForm.tsx)
- 과목 선택 드롭다운
- 선택적 입력 필드들
- 지문 내용 텍스트 영역

### 3. 결과 표시 (src/components/ResultDisplay.tsx)
- 시각자료 유형별 적합도 차트
- 추천 순위별 상세 정보
- 이미지 소스 링크 및 AI 프롬프트

### 4. 관리자 페이지 (src/app/admin/page.tsx)
- 시스템 프롬프트 실시간 편집
- 백업 관리 기능
- 기본값 초기화

## API 엔드포인트

### POST /api/analyze
지문 분석 및 시각자료 추천

**요청 형식:**
```json
{
  "subject": "과학",
  "grade": "중1",
  "area": "물리",
  "topic": "빛과 파동",
  "keywords": "굴절, 반사",
  "textType": "설명문",
  "content": "지문 내용..."
}
```

### GET/POST /api/admin/prompt
시스템 프롬프트 조회 및 수정

### POST /api/admin/prompt/reset
기본 프롬프트로 초기화

### GET/POST /api/admin/prompt/backups
프롬프트 백업 관리

## 검증 규칙

### 응답 검증
- visualRecommendations 배열은 정확히 5개 요소 포함
- 적합도 퍼센트 총합이 100%
- 모든 URL은 실제 접근 가능한 주소
- JSON 파싱 오류 방지

### 입력 검증
- 과목과 지문 내용은 필수
- 지문 내용 최소 길이 검증
- 특수문자 이스케이프 처리

## 프롬프트 관리

### 저장 방식
- **저장소**: Google Sheets
- **현재 프롬프트**: `current_prompt` 시트
- **이력 관리**: `prompt_history` 시트
- **버전 관리**: 자동 버전 번호 부여

### 시트 구조
#### current_prompt 시트
- A열: timestamp (마지막 수정 시간)
- B열: prompt_content (현재 프롬프트 내용)

#### prompt_history 시트
- A열: timestamp (수정 시간)
- B열: version (버전 번호)
- C열: prompt_content (프롬프트 내용)
- D열: modified_by (수정자)

### 기본 프롬프트 구조
1. 지시사항 및 작성지침
2. 필수 필드 및 값 규칙
3. 세부 작성 기준
4. 시각자료 유형별 분석 기준
5. 검증 규칙

## 배포 설정

### Vercel 배포
1. GitHub 저장소 연결
2. 환경 변수 `OPENAI_API_KEY` 설정
3. 자동 배포 완료

### vercel.json 설정
```json
{
  "functions": {
    "src/app/api/**/*.ts": {
      "maxDuration": 30
    }
  }
}
```

## 테스트 시나리오
1. 과학 과목 물리 지문 테스트
2. 사회 과목 역사 지문 테스트
3. 다양한 학년별 지문 테스트
4. API 오류 상황 테스트
5. 대용량 지문 처리 테스트
6. 관리자 기능 테스트

## 성능 최적화
- Next.js App Router 활용
- TypeScript 타입 안전성
- Tailwind CSS로 최적화된 스타일링
- 반응형 디자인 구현

## 보안 고려사항
- OpenAI API 키 서버사이드 보관
- 환경 변수를 통한 민감 정보 관리
- 입력 데이터 검증 및 sanitization

## 향후 확장 계획
- 추가 과목 지원 (국어, 수학 등)
- 다국어 지원
- 사용자 피드백 시스템
- 학습 효과 분석 기능
- 시각자료 생성 자동화