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
  duration_seconds?: number;
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
  segment_video_config?: SegmentVideoConfig;
}

export interface AudioGeneration {
  id: string;
  script_id: string;
  audio_url?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  created_at: string;
  updated_at: string;
}

export interface Avatar {
  id: string;
  name: string;
  image_url: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface VideoSegmentCustomization {
  id: string;
  segment_id: string;
  use_avatar: boolean;
  selected_avatar_id?: string;
  custom_image?: File;
  custom_image_url?: string;
  custom_prompt: string;
  created_at: string;
  updated_at: string;
}

export interface SegmentVideoConfig {
  id: string;
  script_id: string;
  segment_id: string;
  video_prompt?: string;
  prompt_status: 'pending' | 'generating' | 'completed' | 'failed';
  prompt_retry_count: number;
  prompt_error_message?: string;
  prompt_version: number;
  is_user_modified: boolean;
  original_prompt?: string;
  use_avatar: boolean;
  avatar_id?: string;
  custom_image_url?: string;
  last_modified_by: string;
  modified_count: number;
  created_at: string;
  updated_at: string;
}

export interface VideoGeneration {
  id: string;
  segment_id: string;
  video_url?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  created_at: string;
  updated_at: string;
}

export type PageType = 'home' | 'script-generation' | 'voice-generation' | 'video-management' | 'avatar-management';