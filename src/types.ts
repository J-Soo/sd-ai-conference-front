export interface FileInfo {
  id: string;
  name: string;
  type: string;
  size: string;
  sizeInBytes: number;
  file: File;
  uploadedAt: string;
}

export interface Script {
  id: string;
  title: string;
  content: string;
  file_name: string;
  duration_minutes: number;
  created_at: string;
  updated_at: string;
}

export interface ScriptSegment {
  id: string;
  script_id: string;
  segment_index: number;
  content: string;
  slide_reference?: string;
  created_at: string;
}

export interface AudioGeneration {
  id: string;
  script_id: string;
  audio_url?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  created_at: string;
  updated_at: string;
}

export type PageType = 'home' | 'script-generation' | 'voice-generation';