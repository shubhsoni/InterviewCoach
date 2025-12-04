export interface AssessmentCategory {
  name: string;
  score: number;
  feedback: string;
  status: 'excellent' | 'good' | 'needs_improvement';
}

export interface InterviewAnalysis {
  overallScore: number;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  actionableTips: string[];
  categories: AssessmentCategory[];
  transcriptSnippet?: string; // Optional snippet if the model provides it
}

export interface AnalysisState {
  isLoading: boolean;
  error: string | null;
  result: InterviewAnalysis | null;
}

export enum UploadStatus {
  IDLE = 'IDLE',
  UPLOADING = 'UPLOADING',
  READY = 'READY',
  ERROR = 'ERROR',
}