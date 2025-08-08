export interface VisualTypeSuitability {
  illustration: number;
  photo: number;
  flowchart: number;
  graph: number;
  table: number;
}

export interface FreeImageSource {
  site: string;
  searchKeywords: string;
  url: string;
}

export interface ImageGenerationPrompt {
  purpose: string;
  conditions: string;
  composition: string;
  precautions: string;
}

export interface VisualRecommendation {
  type: 'illustration' | 'photo' | 'flowchart' | 'graph' | 'table';
  suitabilityPercent: number;
  reason?: string;
  composition?: string;
  implementation?: string;
  freeImageSources: FreeImageSource[];
  aiPrompt?: string;
  imageGenerationPrompt?: ImageGenerationPrompt;
}

export interface ReasonSummary {
  type: 'illustration' | 'photo' | 'flowchart' | 'graph' | 'table';
  reason: string;
}

export interface Phase1Result {
  visualTypeSuitability: VisualTypeSuitability;
  reasonSummary: ReasonSummary[];
}

export interface AnalysisResult {
  visualTypeSuitability: VisualTypeSuitability;
  visualRecommendations: VisualRecommendation[];
}

export interface FormData {
  subject: string;
  grade?: string;
  area?: string;
  topic?: string;
  keywords?: string;
  textType?: string;
  content: string;
  contentSetId?: string;
}

export interface DetailRequest {
  visualType: 'illustration' | 'photo' | 'flowchart' | 'graph' | 'table';
  formData: FormData;
}