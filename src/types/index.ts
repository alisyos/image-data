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

export interface VisualRecommendation {
  type: 'illustration' | 'photo' | 'flowchart' | 'graph' | 'table';
  suitabilityPercent: number;
  reason: string;
  composition: string;
  implementation: string;
  freeImageSources: FreeImageSource[];
  aiPrompt: string;
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
}