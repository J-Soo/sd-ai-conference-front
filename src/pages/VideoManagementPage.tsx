import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, Calendar, Clock, Loader2, Video, Star, StarOff, Trash2, Play, X, Download } from 'lucide-react';
import { Script, ScriptSegment, VideoGeneration } from '../types';
import { formatDate } from '../utils';
import axios from 'axios';

interface VideoManagementPageProps {
  darkMode: boolean;
  serverConnected: boolean;
}

const VideoManagementPage: React.FC<VideoManagementPageProps> = ({
  darkMode,
  serverConnected
}) => {
  const navigate = useNavigate();
  const [scripts, setScripts] = useState<Script[]>([]);
  const [selectedScript, setSelectedScript] = useState<Script | null>(null);
  const [segments, setSegments] = useState<ScriptSegment[]>([]);
  const [selectedSegment, setSelectedSegment] = useState<ScriptSegment | null>(null);
  const [videos, setVideos] = useState<VideoGeneration[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<VideoGeneration | null>(null);
  
  // UI 상태
  const [showSegments, setShowSegments] = useState(false);
  const [loadingScripts, setLoadingScripts] = useState(true);
  const [loadingSegments, setLoadingSegments] = useState(false);
  const [loadingVideos, setLoadingVideos] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // 영상 미리보기 모달 상태
  const [showVideoPreview, setShowVideoPreview] = useState(false);
  const [previewVideo, setPreviewVideo] = useState<VideoGeneration | null>(null);

  // 더미 데이터
  const dummyScripts: Script[] = [
    {
      id: '1',
      title: '마케팅 전략 발표',
      content: '안녕하세요! 오늘 발표할 주제에 대해 말씀드리겠습니다.',
      file_name: 'marketing_strategy.pptx',
      duration_minutes: 5,
      created_at: '2024-01-15T10:30:00Z',
      updated_at: '2024-01-15T10:30:00Z'
    },
    {
      id: '2',
      title: '프로젝트 진행 현황',
      content: '여러분, 반갑습니다! 오늘 준비한 발표 내용은 크게 세 부분으로 구성되어 있습니다.',
      file_name: 'project_status.pdf',
      duration_minutes: 3,
      created_at: '2024-01-14T14:20:00Z',
      updated_at: '2024-01-14T20:00Z'
    }
  ];

  const generateDummySegments = (scriptId: string): ScriptSegment[] => {
    const segments: ScriptSegment[] = [];
    const maxSegments = scriptId === '2' ? 9 : 3; // 두 번째 스크립트(3분짜리)는 9개 세그먼트
    
    for (let i = 1; i <= maxSegments; i++) {
      segments.push({
        id: `seg_${scriptId}_${i}`,
        script_id: scriptId,
        segment_index: i,
        content: `세그먼트 ${i}의 내용입니다. 이 부분에서는 발표의 ${i}번째 주요 포인트를 다룹니다.`,
        slide_reference: `slide_${i.toString().padStart(2, '0')}.png`,
        created_at: new Date().toISOString()
      });
    }
    
    return segments;
  };

  const generateDummyVideos = (segmentId: string): VideoGeneration[] => {
    // 실제 generated_videos 폴더에 있는 파일들 사용
    const availableVideos = [
      'video_5e426576-fe6c-486a-b582-e8425d66104f_b6916432.mp4',
      'video_6c008ebb-9f10-448f-8bce-63b45d2f87f8_9a92e4d0.mp4',
      'video_a4a3e985-4277-4ab2-ba71-496a0991120f_096a67ef.mp4',
      'video_a4c8043a-322b-4f39-a93f-ffe4b1bc6411_98048b65.mp4'
    ];
    
    // 세그먼트 ID에서 세그먼트 번호 추출 (seg_2_9 형태에서 9 추출)
    const parts = segmentId.split('_');
    const segmentNumber = parts.length > 2 ? parseInt(parts[2], 10) : 1;
    console.log('Segment ID:', segmentId, 'Segment Number:', segmentNumber);
    
    // 세그먼트 번호에 따라 비디오 선택
    const videoFile = availableVideos[(segmentNumber - 1) % availableVideos.length];
    console.log('Selected video file:', videoFile);
    
    return [
      {
        id: `video_${segmentId}_1`,
        segment_id: segmentId,
        video_url: `http://localhost:8000/generated_videos/${videoFile}`,
        thumbnail_url: undefined, // 썸네일은 비디오 첫 프레임 사용
        status: 'completed',
        is_representative: true,
        created_at: '2024-01-15T10:30:00Z',
        updated_at: '2024-01-15T10:30:00Z'
      }
    ];
  };

  // 스크립트 목록 로드
  useEffect(() => {
    loadScripts();
  }, []);

  const loadScripts = async () => {
    setLoadingScripts(true);
    setError(null);

    try {
      if (serverConnected) {
        try {
          const response = await axios.get('http://localhost:8000/api/v1/scripts/all');
          if (response.data && Array.isArray(response.data)) {
            setScripts(response.data);
          } else {
            setError('API에서 유효한 응답을 받지 못했습니다.');
            setScripts([]);
          }
        } catch (apiError: any) {
          if (apiError.response && apiError.response.status === 404) {
            setError('스크립트 API가 아직 구현되지 않았습니다.');
            setScripts(dummyScripts);
          } else {
            setError(`서버 오류: ${apiError.message || '알 수 없는 오류'}`);
            setScripts([]);
          }
        }
      } else {
        await new Promise(resolve => setTimeout(resolve, 1000));
        setScripts(dummyScripts);
      }
    } catch (err: any) {
      setError('스크립트를 불러오는 중 오류가 발생했습니다.');
      setScripts([]);
    } finally {
      setLoadingScripts(false);
    }
  };

  const loadSegments = async (scriptId: string) => {
    setLoadingSegments(true);
    setError(null);

    try {
      if (serverConnected) {
        try {
          const response = await axios.get(`http://localhost:8000/api/v1/scripts/${scriptId}/segments`);
          if (response.data && Array.isArray(response.data)) {
            setSegments(response.data);
          } else {
            setError('세그먼트 API에서 유효한 응답을 받지 못했습니다.');
            setSegments([]);
          }
        } catch (apiError: any) {
          if (apiError.response && apiError.response.status === 404) {
            setSegments(generateDummySegments(scriptId));
          } else {
            setError(`세그먼트 로드 오류: ${apiError.message || '알 수 없는 오류'}`);
            setSegments([]);
          }
        }
      } else {
        await new Promise(resolve => setTimeout(resolve, 800));
        setSegments(generateDummySegments(scriptId));
      }
    } catch (err: any) {
      setError('세그먼트를 불러오는 중 오류가 발생했습니다.');
      setSegments([]);
    } finally {
      setLoadingSegments(false);
    }
  };

  const loadVideos = async (segmentId: string) => {
    setLoadingVideos(true);
    setError(null);

    try {
      if (serverConnected) {
        try {
          const response = await axios.get(`http://localhost:8000/api/v1/videos/segment/${segmentId}`);
          let videosData = [];
          
          if (response.data && response.data.videos && Array.isArray(response.data.videos)) {
            videosData = response.data.videos;
          } else if (response.data && Array.isArray(response.data)) {
            videosData = response.data;
          } else {
            setError('영상 API에서 유효한 응답을 받지 못했습니다.');
            setVideos([]);
            return;
          }
          
          // DB에 저장된 URL 경로를 올바른 절대 경로로 변환
          const correctedVideos = videosData.map((video: any) => {
            let correctedUrl = video.video_url;
            
            if (correctedUrl) {
              // 이미 절대 URL인 경우 그대로 사용
              if (correctedUrl.startsWith('http')) {
                return { ...video, video_url: correctedUrl };
              }
              
              // 상대 경로인 경우 절대 경로로 변환
              if (correctedUrl.startsWith('/static/videos/')) {
                correctedUrl = correctedUrl.replace('/static/videos/', 'http://localhost:8000/generated_videos/');
              } else if (correctedUrl.startsWith('/generated_videos/')) {
                correctedUrl = `http://localhost:8000${correctedUrl}`;
              }
            }
            
            return { ...video, video_url: correctedUrl };
          });
          
          console.log('API에서 받은 비디오 데이터 (URL 수정됨):', correctedVideos);
          setVideos(correctedVideos);
        } catch (apiError: any) {
          console.log('API call failed, using dummy data:', apiError.message);
          const dummyVideos = generateDummyVideos(segmentId);
          console.log('API 실패 시 더미 비디오 사용:', segmentId, dummyVideos);
          setVideos(dummyVideos);
        }
      } else {
        await new Promise(resolve => setTimeout(resolve, 800));
        const dummyVideos = generateDummyVideos(segmentId);
        console.log('Loading dummy videos for segment:', segmentId, dummyVideos);
        setVideos(dummyVideos);
      }
    } catch (err: any) {
      setError('영상을 불러오는 중 오류가 발생했습니다.');
      setVideos([]);
    } finally {
      setLoadingVideos(false);
    }
  };

  // 대본 선택 핸들러
  const handleScriptSelect = async (script: Script) => {
    setSelectedScript(script);
    setSelectedSegment(null);
    setVideos([]);
    await loadSegments(script.id);
    setShowSegments(true);
  };

  // 세그먼트 선택 핸들러
  const handleSegmentSelect = async (segment: ScriptSegment) => {
    setSelectedSegment(segment);
    await loadVideos(segment.id);
  };

  // 뒤로가기 핸들러
  const handleBackToScripts = () => {
    setShowSegments(false);
    setSelectedScript(null);
    setSelectedSegment(null);
    setVideos([]);
    setSegments([]);
  };

  // 대표 영상 설정
  const handleSetRepresentative = async (videoId: string) => {
    try {
      if (serverConnected) {
        try {
          await axios.patch(`http://localhost:8000/api/v1/videos/${videoId}/representative`);
        } catch (apiError: any) {
          if (apiError.response && apiError.response.status === 404) {
            // API가 구현되지 않은 경우 로컬에서 처리
          } else {
            setError(`대표 영상 설정 오류: ${apiError.message || '알 수 없는 오류'}`);
            return;
          }
        }
      }

      // 로컬 상태 업데이트
      setVideos(prev => prev.map(video => ({
        ...video,
        is_representative: video.id === videoId
      })));
      
      setSuccessMessage('대표 영상이 설정되었습니다.');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setError('대표 영상 설정 중 오류가 발생했습니다.');
    }
  };

  // 영상 삭제
  const handleDeleteVideo = async (videoId: string) => {
    try {
      if (serverConnected) {
        try {
          await axios.delete(`http://localhost:8000/api/v1/videos/${videoId}`);
        } catch (apiError: any) {
          if (apiError.response && apiError.response.status === 404) {
            // API가 구현되지 않은 경우 로컬에서 처리
          } else {
            setError(`영상 삭제 오류: ${apiError.message || '알 수 없는 오류'}`);
            return;
          }
        }
      }

      // 삭제할 영상이 대표 영상인지 확인
      const videoToDelete = videos.find(v => v.id === videoId);
      const isRepresentative = videoToDelete?.is_representative;

      // 로컬 상태에서 영상 제거
      const remainingVideos = videos.filter(v => v.id !== videoId);
      
      // 대표 영상이 삭제된 경우, 가장 최신 영상을 대표 영상으로 설정
      if (isRepresentative && remainingVideos.length > 0) {
        const latestVideo = remainingVideos.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )[0];
        
        latestVideo.is_representative = true;
        
        // 서버에도 업데이트 (API가 있는 경우)
        if (serverConnected) {
          try {
            await axios.patch(`http://localhost:8000/api/v1/videos/${latestVideo.id}/representative`);
          } catch (apiError: any) {
            // API 오류는 무시 (로컬에서는 이미 처리됨)
          }
        }
      }

      setVideos(remainingVideos);
      setSuccessMessage('영상이 삭제되었습니다.');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setError('영상 삭제 중 오류가 발생했습니다.');
    }
  };

  // 영상 미리보기
  const handleVideoPreview = (video: VideoGeneration) => {
    setPreviewVideo(video);
    setShowVideoPreview(true);
  };

  // 영상 정렬 (대표 영상 제외하고 최신순)
  const sortedVideos = videos.sort((a, b) => {
    if (a.is_representative) return -1;
    if (b.is_representative) return 1;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  return (
    <div className="space-y-6">

      {error && (
        <div className={`p-4 rounded-lg border ${darkMode ? 'bg-red-900/20 border-red-700 text-red-400' : 'bg-red-50 border-red-200 text-red-700'}`}>
          <span>{error}</span>
        </div>
      )}

      {successMessage && (
        <div className={`p-4 rounded-lg border ${darkMode ? 'bg-green-900/20 border-green-700 text-green-400' : 'bg-green-50 border-green-200 text-green-700'}`}>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="font-medium">{successMessage}</span>
          </div>
        </div>
      )}

      {/* 메인 컨테이너 */}
      <div className="grid lg:grid-cols-5 gap-6">
        {/* 왼쪽 영역 - 대본/세그먼트 목록 */}
        <div className="lg:col-span-2">
          <div className="h-[700px]">
            <div className={`h-full rounded-lg overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-md relative`}>
              {/* 대본 목록 */}
              <div className={`absolute inset-0 transition-transform duration-300 ease-in-out ${
                showSegments ? '-translate-x-full' : 'translate-x-0'
              }`}>
                <div className={`px-6 py-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <h3 className="text-lg font-semibold">대본 목록</h3>
                  {!serverConnected && (
                    <p className={`text-xs mt-1 ${darkMode ? 'text-yellow-400' : 'text-yellow-600'}`}>
                      테스트 모드
                    </p>
                  )}
                </div>
                <div className="p-4 h-[calc(100%-4.5rem)] overflow-y-auto">
                  {loadingScripts ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className={`animate-spin ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`} size={20} />
                      <span className="ml-2 text-sm">로드 중...</span>
                    </div>
                  ) : scripts.length === 0 ? (
                    <div className="text-center py-8">
                      <FileText className={`mx-auto mb-2 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} size={24} />
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        저장된 대본이 없습니다
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {scripts.map((script) => (
                        <div
                          key={script.id}
                          onClick={() => handleScriptSelect(script)}
                          className={`group p-3 rounded-lg cursor-pointer transition-all duration-200 border-2 ${
                            selectedScript?.id === script.id
                              ? darkMode 
                                ? 'border-indigo-500 bg-indigo-900/20' 
                                : 'border-indigo-500 bg-indigo-50'
                              : darkMode
                                ? 'border-gray-600 hover:border-gray-500 bg-gray-700/50 hover:bg-gray-700'
                                : 'border-gray-200 hover:border-gray-300 bg-gray-50 hover:bg-gray-100'
                          }`}
                        >
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium truncate ${
                              selectedScript?.id === script.id
                                ? darkMode ? 'text-indigo-300' : 'text-indigo-700'
                                : darkMode ? 'text-gray-300' : 'text-gray-700'
                            }`}>
                              {script.title}
                            </p>
                            <div className="flex items-center space-x-3 mt-1">
                              <div className="flex items-center space-x-1">
                                <Clock size={10} />
                                <span className={`text-xs ${
                                  selectedScript?.id === script.id
                                    ? darkMode ? 'text-indigo-400' : 'text-indigo-600'
                                    : darkMode ? 'text-gray-400' : 'text-gray-500'
                                }`}>
                                  {script.duration_minutes}분
                                </span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Calendar size={10} />
                                <span className={`text-xs ${
                                  selectedScript?.id === script.id
                                    ? darkMode ? 'text-indigo-400' : 'text-indigo-600'
                                    : darkMode ? 'text-gray-400' : 'text-gray-500'
                                }`}>
                                  {formatDate(script.created_at)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* 세그먼트 목록 */}
              <div className={`absolute inset-0 transition-transform duration-300 ease-in-out ${
                showSegments ? 'translate-x-0' : 'translate-x-full'
              }`}>
                <div className={`px-6 py-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={handleBackToScripts}
                      className={`p-1 rounded-full transition-colors duration-200 ${
                        darkMode 
                          ? 'hover:bg-gray-700 text-gray-400 hover:text-white' 
                          : 'hover:bg-gray-200 text-gray-600 hover:text-gray-800'
                      }`}
                    >
                      <ArrowLeft size={16} />
                    </button>
                    <div>
                      <h3 className="text-lg font-semibold">세그먼트 목록</h3>
                      {selectedScript && (
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {selectedScript.title}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                <div className="p-4 h-[calc(100%-4.5rem)] overflow-y-auto">
                  {loadingSegments ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className={`animate-spin ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`} size={20} />
                      <span className="ml-2 text-sm">로드 중...</span>
                    </div>
                  ) : segments.length === 0 ? (
                    <div className="text-center py-8">
                      <Video className={`mx-auto mb-2 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} size={24} />
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        이 대본에는 세그먼트가 없습니다
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {segments.map((segment) => (
                        <div
                          key={segment.id}
                          onClick={() => handleSegmentSelect(segment)}
                          className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                            selectedSegment?.id === segment.id
                              ? darkMode 
                                ? 'bg-indigo-600/20 border border-indigo-500' 
                                : 'bg-indigo-50 border border-indigo-300'
                              : darkMode
                                ? 'hover:bg-gray-700 border border-transparent'
                                : 'hover:bg-gray-100 border border-transparent'
                          }`}
                        >
                          <div className="flex items-start space-x-3">
                            <div className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium ${
                              selectedSegment?.id === segment.id
                                ? darkMode ? 'bg-indigo-600 text-white' : 'bg-indigo-600 text-white'
                                : darkMode ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-600'
                            }`}>
                              {segment.segment_index}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm font-medium ${
                                selectedSegment?.id === segment.id
                                  ? darkMode ? 'text-indigo-300' : 'text-indigo-700'
                                  : darkMode ? 'text-gray-300' : 'text-gray-700'
                              }`}>
                                세그먼트 {segment.segment_index}
                              </p>
                              <p className={`text-xs mt-1 line-clamp-2 ${
                                selectedSegment?.id === segment.id
                                  ? darkMode ? 'text-indigo-400' : 'text-indigo-600'
                                  : darkMode ? 'text-gray-400' : 'text-gray-500'
                              }`}>
                                {segment.content}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 오른쪽 영역 - 영상 갤러리 */}
        <div className="lg:col-span-3">
          <div className="h-[700px]">
            <div className={`h-full rounded-lg overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
              {!selectedSegment ? (
                <div className="flex flex-col items-center justify-center h-full">
                  <Video className={`mb-4 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} size={48} />
                  <p className={`text-lg font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    세그먼트를 선택해주세요
                  </p>
                  <p className={`text-sm mt-2 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                    생성된 영상들을 확인하고 관리할 수 있습니다
                  </p>
                </div>
              ) : (
                <>
                  <div className={`px-6 py-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold">영상 갤러리</h3>
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          세그먼트 {selectedSegment.segment_index} - {videos.length}개의 영상
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-6 h-[calc(100%-5rem)] overflow-y-auto">
                    {loadingVideos ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className={`animate-spin ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`} size={24} />
                        <span className="ml-2">영상 로드 중...</span>
                      </div>
                    ) : videos.length === 0 ? (
                      <div className="text-center py-8">
                        <Video className={`mx-auto mb-2 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} size={32} />
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          이 세그먼트에는 생성된 영상이 없습니다
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-4">
                        {sortedVideos.map((video, index) => (
                          <div
                            key={video.id}
                            className={`relative group rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                              selectedVideo?.id === video.id
                                ? darkMode 
                                  ? 'border-indigo-500 shadow-lg' 
                                  : 'border-indigo-500 shadow-lg'
                                : darkMode
                                  ? 'border-gray-600 hover:border-gray-500'
                                  : 'border-gray-200 hover:border-gray-300'
                            }`}
                            onClick={() => setSelectedVideo(video)}
                          >
                            {/* 썸네일 */}
                            <div className="aspect-video bg-gray-300 relative overflow-hidden">
                              {video.thumbnail_url ? (
                                <img
                                  src={video.thumbnail_url}
                                  alt={`영상 ${index + 1}`}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    console.log('Thumbnail failed, showing video instead');
                                    e.currentTarget.style.display = 'none';
                                    const videoEl = e.currentTarget.parentElement?.querySelector('video') as HTMLVideoElement;
                                    if (videoEl) {
                                      videoEl.style.display = 'block';
                                      videoEl.load(); // 비디오 다시 로드
                                    }
                                  }}
                                />
                              ) : (
                                <div className="w-full h-full bg-gray-400 flex items-center justify-center">
                                  <div className="text-center text-gray-600">
                                    <Video size={24} className="mx-auto mb-1" />
                                    <p className="text-xs">Loading...</p>
                                  </div>
                                </div>
                              )}
                              
                              <video
                                key={video.id}
                                src={video.video_url}
                                className="w-full h-full object-cover"
                                style={{ display: video.thumbnail_url ? 'none' : 'block' }}
                                muted
                                preload="metadata"
                                onLoadedMetadata={(e) => {
                                  const videoEl = e.currentTarget;
                                  videoEl.currentTime = 0.5; // 0.5초 지점의 프레임을 썸네일로 사용
                                  console.log('Video metadata loaded:', video.video_url);
                                }}
                                onLoadedData={(e) => {
                                  console.log('Video data loaded successfully');
                                  // 썸네일이 없는 경우 비디오를 보여줌
                                  if (!video.thumbnail_url) {
                                    e.currentTarget.style.display = 'block';
                                  }
                                }}
                                onError={(e) => {
                                  console.error('Video loading error:', e, video.video_url);
                                  const container = e.currentTarget.parentElement;
                                  if (container) {
                                    const errorDiv = document.createElement('div');
                                    errorDiv.className = 'w-full h-full flex items-center justify-center bg-red-100';
                                    errorDiv.innerHTML = `
                                      <div class="text-center text-red-600">
                                        <svg class="mx-auto mb-2" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                          <polygon points="23 7 16 12 23 17 23 7"></polygon>
                                          <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
                                        </svg>
                                        <p class="text-xs">로드 실패</p>
                                      </div>
                                    `;
                                    container.appendChild(errorDiv);
                                    e.currentTarget.style.display = 'none';
                                  }
                                }}
                              />
                              
                              {/* 대표 영상 배지 */}
                              {video.is_representative && (
                                <div className="absolute top-2 left-2">
                                  <div className={`px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${
                                    darkMode ? 'bg-yellow-600 text-white' : 'bg-yellow-500 text-white'
                                  }`}>
                                    <Star size={12} />
                                    <span>대표</span>
                                  </div>
                                </div>
                              )}
                              
                              {/* 호버 오버레이 */}
                              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex space-x-2">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleVideoPreview(video);
                                    }}
                                    className="p-2 bg-white bg-opacity-90 rounded-full hover:bg-opacity-100 transition-all duration-200"
                                    title="미리보기"
                                  >
                                    <Play size={16} className="text-gray-800" />
                                  </button>
                                  
                                  {!video.is_representative && (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleSetRepresentative(video.id);
                                      }}
                                      className="p-2 bg-white bg-opacity-90 rounded-full hover:bg-opacity-100 transition-all duration-200"
                                      title="대표 영상으로 설정"
                                    >
                                      <StarOff size={16} className="text-gray-800" />
                                    </button>
                                  )}
                                  
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteVideo(video.id);
                                    }}
                                    className="p-2 bg-white bg-opacity-90 rounded-full hover:bg-opacity-100 transition-all duration-200"
                                    title="영상 삭제"
                                  >
                                    <Trash2 size={16} className="text-red-600" />
                                  </button>
                                </div>
                              </div>
                            </div>
                            
                            {/* 영상 정보 */}
                            <div className="p-3">
                              <div className="flex items-center justify-between">
                                <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                  영상 {index + 1}
                                </span>
                                <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                  {formatDate(video.created_at)}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 영상 미리보기 모달 */}
      {showVideoPreview && previewVideo && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className={`max-w-4xl w-full mx-4 rounded-lg overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className={`px-6 py-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'} flex items-center justify-between`}>
              <h3 className="text-lg font-semibold">영상 미리보기</h3>
              <button
                onClick={() => {
                  setShowVideoPreview(false);
                  setPreviewVideo(null);
                }}
                className={`p-2 rounded-full ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors duration-200`}
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              <video
                src={previewVideo.video_url}
                controls
                autoPlay
                className="w-full aspect-video rounded-lg"
                crossOrigin="anonymous"
                onError={(e) => {
                  console.error('Video playback error:', e);
                  const container = e.currentTarget.parentElement;
                  if (container) {
                    const errorDiv = document.createElement('div');
                    errorDiv.className = 'w-full aspect-video rounded-lg bg-gray-200 flex items-center justify-center';
                    errorDiv.innerHTML = `
                      <div class="text-center">
                        <div class="mx-auto mb-2 text-gray-500">
                          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polygon points="23 7 16 12 23 17 23 7"></polygon>
                            <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
                          </svg>
                        </div>
                        <p class="text-gray-600">영상을 재생할 수 없습니다</p>
                        <p class="text-sm text-gray-500 mt-1">URL: ${previewVideo.video_url}</p>
                      </div>
                    `;
                    container.replaceChild(errorDiv, e.currentTarget);
                  }
                }}
                onLoadStart={() => {
                  console.log('Preview video loading started:', previewVideo.video_url);
                }}
                onLoadedMetadata={() => {
                  console.log('Preview video metadata loaded:', previewVideo.video_url);
                }}
                onLoadedData={() => {
                  console.log('Preview video data loaded successfully:', previewVideo.video_url);
                }}
                onCanPlay={() => {
                  console.log('Preview video can play:', previewVideo.video_url);
                }}
                onCanPlayThrough={() => {
                  console.log('Preview video can play through:', previewVideo.video_url);
                }}
              >
                브라우저가 비디오를 지원하지 않습니다.
              </video>
              <div className="mt-4 flex items-center justify-between">
                <div>
                  <p className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {previewVideo.is_representative ? '대표 영상' : '일반 영상'}
                  </p>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    생성일: {formatDate(previewVideo.created_at)}
                  </p>
                </div>
                <div className="flex space-x-2">
                  {!previewVideo.is_representative && (
                    <button
                      onClick={() => {
                        handleSetRepresentative(previewVideo.id);
                        setShowVideoPreview(false);
                        setPreviewVideo(null);
                      }}
                      className={`px-4 py-2 rounded-md transition-colors duration-200 ${
                        darkMode 
                          ? 'bg-yellow-600 hover:bg-yellow-500 text-white' 
                          : 'bg-yellow-500 hover:bg-yellow-600 text-white'
                      }`}
                    >
                      대표 영상으로 설정
                    </button>
                  )}
                  <button
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = previewVideo.video_url!;
                      link.download = `segment_${selectedSegment?.segment_index}_${previewVideo.id}.mp4`;
                      link.click();
                    }}
                    className={`px-4 py-2 rounded-md transition-colors duration-200 flex items-center space-x-2 ${
                      darkMode 
                        ? 'bg-indigo-600 hover:bg-indigo-500 text-white' 
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                    }`}
                  >
                    <Download size={16} />
                    <span>다운로드</span>
                  </button>
                  <button
                    onClick={() => {
                      handleDeleteVideo(previewVideo.id);
                      setShowVideoPreview(false);
                      setPreviewVideo(null);
                    }}
                    className={`px-4 py-2 rounded-md transition-colors duration-200 ${
                      darkMode 
                        ? 'bg-red-600 hover:bg-red-500 text-white' 
                        : 'bg-red-600 hover:bg-red-700 text-white'
                    }`}
                  >
                    영상 삭제
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoManagementPage;