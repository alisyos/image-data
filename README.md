# 초·중등 어휘학습 지문 시각자료 추천 시스템

AI를 활용하여 교육용 지문에 최적화된 시각자료를 추천하는 웹 애플리케이션입니다.

## 🎯 프로젝트 개요

초·중등 어휘학습을 위한 지문에 시각자료를 추가하기 위해 개발된 시스템으로, OpenAI GPT API를 활용하여 다음과 같은 기능을 제공합니다:

- **5가지 시각자료 유형별 적합도 분석**: 삽화, 사진, 순서도, 그래프, 도표
- **상세 추천 정보 제공**: 추천 이유, 구성 방안, 제작 고려사항  
- **저작권 프리 이미지 소스 제공**: Pixabay, Unsplash, Pexels 등
- **AI 이미지 생성 프롬프트 제공**: DALL-E, Midjourney 등 활용 가능
- **관리자 시스템**: 시스템 프롬프트 관리 및 백업 기능

## 🚀 기술 스택

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS v4
- **AI Integration**: OpenAI API
- **Deployment**: Vercel

## 📋 기능 명세

### 입력 항목
- **필수**: 과목(과학/사회), 지문 내용
- **선택**: 학년, 영역, 주제, 핵심어, 지문 유형

### 출력 정보
- 시각자료 유형별 적합도 분석 (퍼센트)
- 추천 순위별 상세 정보
- 저작권 프리 이미지 검색 정보
- AI 이미지 생성용 영어 프롬프트

## 🛠️ 설치 및 실행

### 1. 프로젝트 클론 및 의존성 설치
```bash
git clone <repository-url>
cd visual-learning-system
npm install
```

### 2. 환경 변수 설정
```bash
cp .env.example .env.local
```

`.env.local` 파일에 필요한 API 키들을 설정하세요:
```env
# OpenAI API 키
OPENAI_API_KEY=sk-your-openai-api-key-here

# Google Sheets API 설정 (프롬프트 저장용)
GOOGLE_SHEETS_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
GOOGLE_SHEETS_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
GOOGLE_SHEETS_SPREADSHEET_ID=your-spreadsheet-id-here
```

#### Google Sheets API 설정 방법:
1. [Google Cloud Console](https://console.cloud.google.com/)에서 프로젝트 생성
2. Google Sheets API 활성화
3. 서비스 계정 생성 및 JSON 키 다운로드
4. 스프레드시트 생성 후 서비스 계정에 편집 권한 부여
5. 스프레드시트 ID를 환경 변수에 설정

### 3. 개발 서버 실행
```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

### 4. 빌드 및 배포
```bash
npm run build
npm start
```

## 📁 프로젝트 구조

```
src/
├── app/
│   ├── admin/                 # 관리자 페이지
│   │   └── page.tsx
│   ├── api/
│   │   ├── admin/            # 관리자 API
│   │   │   └── prompt/       # 프롬프트 관리
│   │   └── analyze/          # 지문 분석 API
│   │       └── route.ts
│   ├── globals.css           # 전역 스타일
│   ├── layout.tsx           # 루트 레이아웃
│   └── page.tsx             # 메인 페이지
├── components/
│   ├── InputForm.tsx        # 입력 폼 컴포넌트
│   ├── ResultDisplay.tsx    # 결과 표시 컴포넌트
│   └── admin/               # 관리자 컴포넌트
│       ├── BackupList.tsx
│       └── PromptEditor.tsx
├── data/
│   ├── backups/            # 프롬프트 백업 파일
│   └── system-prompt.txt   # 시스템 프롬프트
├── types/
│   └── index.ts           # TypeScript 타입 정의
└── utils/
    └── prompt.ts          # 프롬프트 유틸리티
```

## 🔧 API 사용법

### POST /api/analyze

지문 분석 및 시각자료 추천을 요청합니다.

**Request Body:**
```json
{
  "subject": "과학",
  "grade": "중1",
  "area": "물리",
  "topic": "빛과 파동",
  "keywords": "굴절, 반사",
  "textType": "설명문",
  "content": "빛이 다른 매질로 들어갈 때..."
}
```

**Response:**
```json
{
  "visualTypeSuitability": {
    "illustration": 25,
    "photo": 20,
    "flowchart": 15,
    "graph": 30,
    "table": 10
  },
  "visualRecommendations": [
    {
      "type": "graph",
      "suitabilityPercent": 30,
      "reason": "수치 데이터의 시각적 표현에 적합...",
      "composition": "X축은 입사각, Y축은 굴절각...",
      "implementation": "Excel이나 온라인 차트 도구 활용...",
      "freeImageSources": [...],
      "aiPrompt": "Educational graph showing..."
    }
  ]
}
```

## 🌐 배포 (Vercel)

### 자동 배포
1. GitHub에 프로젝트를 푸시
2. Vercel에서 GitHub 저장소 연결
3. 환경 변수 `OPENAI_API_KEY` 설정
4. 자동 배포 완료

### 수동 배포
```bash
npm install -g vercel
vercel --prod
```

## 🛠️ 관리자 기능

`/admin` 경로로 접근하여 다음 기능을 사용할 수 있습니다:

- **시스템 프롬프트 편집**: 실시간으로 AI 분석 프롬프트 수정
- **백업 관리**: 프롬프트 변경 이력 관리 및 복원
- **기본값 초기화**: 원본 프롬프트로 복원

## 📊 사용 예시

1. **과목 선택**: 과학 또는 사회 중 선택
2. **지문 입력**: 분석할 교육용 텍스트 입력
3. **추가 정보**: 학년, 영역, 주제 등 선택 입력
4. **분석 실행**: "시각자료 추천 받기" 버튼 클릭
5. **결과 확인**: 
   - 5가지 시각자료의 적합도 비율
   - 각 시각자료별 상세 추천 정보
   - 무료 이미지 소스 링크
   - AI 생성용 프롬프트

## 🔍 기술적 특징

- **반응형 디자인**: 모바일, 태블릿, 데스크톱 최적화
- **타입 안전성**: TypeScript로 전체 프로젝트 구성
- **에러 핸들링**: 사용자 친화적 오류 메시지 제공
- **성능 최적화**: Next.js 15 App Router 활용
- **접근성**: WCAG 가이드라인 준수
- **관리자 시스템**: 프롬프트 실시간 편집 및 백업 관리
- **분할 UI**: 좌측 입력, 우측 결과 표시로 사용성 극대화

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 라이선스

이 프로젝트는 교육용 목적으로 제작되었습니다.

## 📞 지원

문제가 발생하거나 기능 개선 제안이 있으시면 이슈를 등록해주세요.

---

**OpenAI GPT-4.1를 활용한 교육용 시각자료 추천 시스템**
