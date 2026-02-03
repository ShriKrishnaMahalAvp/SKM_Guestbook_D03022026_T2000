
export interface ReviewFormData {
  name: string;
  date: string;
  rating: number;
  message: string;
  image: string | null;
  imageName: string;
}

export interface Review extends ReviewFormData {
  id: string;
  timestamp: number;
  aiResponse?: string;
  sentiment?: 'Positive' | 'Neutral' | 'Negative';
}

export enum SubmissionStatus {
  IDLE = 'idle',
  SUBMITTING = 'submitting',
  SUCCESS = 'success',
  ERROR = 'error'
}
