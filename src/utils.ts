/**
 * Generates a unique ID for file tracking
 */
export const generateUniqueId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

/**
 * Formats file size to human-readable format
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Formats ISO date string to user-friendly format
 */
export const formatDate = (isoString: string): string => {
  const date = new Date(isoString);
  return date.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * 이미지 URL을 올바르게 처리합니다
 * - 완전한 URL(http://)이면 그대로 사용
 * - 상대 경로면 백엔드 서버 URL을 추가
 */
export const getImageUrl = (imageUrl: string): string => {
  if (!imageUrl) return '';
  
  // 이미 절대 URL이면 그대로 반환
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }
  
  // 슬래시로 시작하지 않으면 추가
  if (!imageUrl.startsWith('/')) {
    imageUrl = '/' + imageUrl;
  }
  
  // 백엔드 URL 직접 사용
  const backendUrl = 'http://localhost:8000';
  
  // URL 시작 부분의 중복 슬래시 제거
  const cleanPath = imageUrl.replace(/^\/+/, '/');
  
  return `${backendUrl}${cleanPath}`;
};