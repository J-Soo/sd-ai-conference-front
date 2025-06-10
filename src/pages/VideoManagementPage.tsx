import React, { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, Play, Download, Loader2, FileText, Calendar, Clock, Save, RotateCcw, Video, Image as ImageIcon, User, Check } from 'lucide-react';
import { Script, ScriptSegment, VideoSegmentCustomization, VideoGeneration, Avatar } from '../types';
import { formatDate } from '../utils';
import ImageUploader from '../components/ImageUploader';
import axios from 'axios';

interface VideoManagementPageProps {
  darkMode: boolean;
  serverConnected: boolean;
  onBack: () => void;
}

const VideoManagementPage: React.FC<VideoManagementPageProps> = ({
  darkMode,
  serverConnected,
  onBack
}) => {
  const [scripts, setScripts] = useState<Script[]>([]);
  const [selectedScript, setSelectedScript] = useState<Script | null>(null);
  const [segments, setSegments] = useState<ScriptSegment[]>([]);
  const [selectedSegment, setSelectedSegment] = useState<ScriptSegment | null>(null);
  const [customization, setCustomization] = useState<VideoSegmentCustomization | null>(null);
  const [videoGenerations, setVideoGenerations] = useState<VideoGeneration[]>([]);
  const [selectedVideoGeneration, setSelectedVideoGeneration] = useState<VideoGeneration | null>(null);
  const [avatars, setAvatars] = useState<Avatar[]>([]);
  
  // 글로벌 아바타 설정 - 일괄 적용이 한 번이라도 저장된 적이 있는지 추적
  const [globalAvatarSettings, setGlobalAvatarSettings] = useState({
    selectedAvatarId: '',
    applyToAll: false, // 기본값은 항상 false
    hasBeenAppliedBefore: false // 이전에 일괄 적용이 저장된 적이 있는지 추적
  });
  
  // UI 상태
  const [showSegments, setShowSegments] = useState(false);
  const [showVideoResults, setShowVideoResults] = useState(false);
  const [loadingScripts, setLoadingScripts] = useState(true);
  const [loadingSegments, setLoadingSegments] = useState(false);
  const [savingCustomization, setSavingCustomization] = useState(false);
  const [generatingVideo, setGeneratingVideo] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 더미 데이터
  const dummyScripts: Script[] = [
    {
      id: '1',
      title: '마케팅 전략 발표',
      content: '안녕하세요! 오늘 발표할 주제에 대해 말씀드리겠습니다.',
      file_name: 'marketing_strategy.pptx',
      duration_minutes: 5,
      duration_seconds: 0,
      created_at: '2024-01-15T10:30:00Z',
      updated_at: '2024-01-15T10:30:00Z'
    },
    {
      id: '2',
      title: '프로젝트 진행 현황',
      content: '여러분, 반갑습니다! 오늘 준비한 발표 내용은 크게 세 부분으로 구성되어 있습니다.',
      file_name: 'project_status.pdf',
      duration_minutes: 3,
      duration_seconds: 0,
      created_at: '2024-01-14T14:20:00Z',
      updated_at: '2024-01-14T14:20:00Z'
    }
  ];

  const dummyAvatars: Avatar[] = [
    {
      id: 'avatar-1',
      name: '비즈니스맨',
      image_url: '/avatars/business-man.jpg',
      description: '비즈니스 프레젠테이션에 적합한 아바타',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'avatar-2',
      name: '여성 강사',
      image_url: '/avatars/female-instructor.jpg',
      description: '교육 및 강의 콘텐츠에 적합한 아바타',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'avatar-3',
      name: '테크 전문가',
      image_url: '/avatars/tech-expert.jpg',
      description: '기술 관련 프레젠테이션에 적합한 아바타',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'avatar-4',
      name: '캐주얼 스타일',
      image_url: '/avatars/casual-style.jpg',
      description: '친근한 분위기의 콘텐츠에 적합한 아바타',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];

  const generateDummySegments = (scriptId: string): ScriptSegment[] => [
    {
      id: `seg_${scriptId}_1`,
      script_id: scriptId,
      segment_index: 1,
      content: '안녕하세요! 오늘 발표할 주제에 대해 말씀드리겠습니다.',
      slide_reference: 'slide_01.png',
      created_at: new Date().toISOString()
    },
    {
      id: `seg_${scriptId}_2`,
      script_id: scriptId,
      segment_index: 2,
      content: '첫 번째로, 우리가 다룰 핵심 내용은 다음과 같습니다.',
      slide_reference: 'slide_02.png',
      created_at: new Date().toISOString()
    },
    {
      id: `seg_${scriptId}_3`,
      script_id: scriptId,
      segment_index: 3,
      content: '마지막으로, 앞으로의 계획과 목표에 대해 말씀드리겠습니다.',
      slide_reference: 'slide_03.png',
      created_at: new Date().toISOString()
    }
  ];

  // 스크립트 목록 로드
  useEffect(() => {
    loadScripts();
    loadAvatars();
    loadGlobalAvatarSettings();
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

  const loadAvatars = async () => {
    try {
      if (serverConnected) {
        try {
          const response = await axios.get('http://localhost:8000/api/v1/avatars');
          if (response.data && Array.isArray(response.data)) {
            setAvatars(response.data);
          } else {
            setAvatars(dummyAvatars);
          }
        } catch (apiError: any) {
          setAvatars(dummyAvatars);
        }
      } else {
        setAvatars(dummyAvatars);
      }
    } catch (err: any) {
      setAvatars(dummyAvatars);
    }
  };

  // 글로벌 아바타 설정 로드 (이전에 일괄 적용이 저장된 적이 있는지 확인)
  const loadGlobalAvatarSettings = async () => {
    try {
      if (serverConnected) {
        try {
          const response = await axios.get('http://localhost:8000/api/v1/video/global-avatar-settings');
          if (response.data) {
            setGlobalAvatarSettings({
              selectedAvatarId: response.data.selectedAvatarId || '',
              applyToAll: response.data.hasBeenAppliedBefore || false, // 이전에 저장된 적이 있으면 true
              hasBeenAppliedBefore: response.data.hasBeenAppliedBefore || false
            });
          }
        } catch (apiError: any) {
          // API가 없거나 오류인 경우 기본값 유지 (모두 false)
          console.log('글로벌 아바타 설정 API 없음 - 기본값 사용');
        }
      } else {
        // 테스트 모드에서는 localStorage에서 확인
        const savedSettings = localStorage.getItem('globalAvatarSettings');
        if (savedSettings) {
          const parsed = JSON.parse(savedSettings);
          setGlobalAvatarSettings({
            selectedAvatarId: parsed.selectedAvatarId || '',
            applyToAll: parsed.hasBeenAppliedBefore || false, // 이전에 저장된 적이 있으면 true
            hasBeenAppliedBefore: parsed.hasBeenAppliedBefore || false
          });
        }
      }
    } catch (err: any) {
      console.log('글로벌 아바타 설정 로드 실패 - 기본값 사용');
    }
  };

  // 세그먼트 로드
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
            setSegments(generateDummySegments(scriptId));
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

  // 대본 선택 핸들러
  const handleScriptSelect = async (script: Script) => {
    setSelectedScript(script);
    setSelectedSegment(null);
    setCustomization(null);
    await loadSegments(script.id);
    setShowSegments(true);
  };

  // 세그먼트 선택 핸들러
  const handleSegmentSelect = (segment: ScriptSegment) => {
    setSelectedSegment(segment);
    
    // 기본 커스터마이제이션 생성
    const defaultCustomization: VideoSegmentCustomization = {
      id: `custom_${segment.id}`,
      segment_id: segment.id,
      use_avatar: false,
      selected_avatar_id: globalAvatarSettings.hasBeenAppliedBefore ? globalAvatarSettings.selectedAvatarId : '',
      custom_prompt: `${segment.content}에 대한 영상을 생성해주세요. 전문적이고 깔끔한 스타일로 제작해주세요.`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    setCustomization(defaultCustomization);
  };

  // 뒤로가기 핸들러
  const handleBackToScripts = () => {
    setShowSegments(false);
    setSelectedScript(null);
    setSelectedSegment(null);
    setCustomization(null);
    setSegments([]);
  };

  // 이미지 선택 핸들러
  const handleImageSelected = (file: File) => {
    if (customization) {
      const imageUrl = URL.createObjectURL(file);
      setCustomization({
        ...customization,
        custom_image: file,
        custom_image_url: imageUrl,
        updated_at: new Date().toISOString()
      });
    }
  };

  // 아바타 사용 토글
  const handleAvatarToggle = (useAvatar: boolean) => {
    if (customization) {
      const updatedCustomization = {
        ...customization,
        use_avatar: useAvatar,
        custom_image: useAvatar ? undefined : customization.custom_image,
        custom_image_url: useAvatar ? undefined : customization.custom_image_url,
        selected_avatar_id: useAvatar && globalAvatarSettings.hasBeenAppliedBefore ? globalAvatarSettings.selectedAvatarId : customization.selected_avatar_id,
        updated_at: new Date().toISOString()
      };
      
      setCustomization(updatedCustomization);
    }
  };

  // 아바타 선택 핸들러
  const handleAvatarSelect = (avatarId: string) => {
    if (customization) {
      setCustomization({
        ...customization,
        selected_avatar_id: avatarId,
        updated_at: new Date().toISOString()
      });
    }

    // 일괄 적용이 활성화된 경우 글로벌 설정 업데이트
    if (globalAvatarSettings.applyToAll) {
      setGlobalAvatarSettings(prev => ({
        ...prev,
        selectedAvatarId: avatarId
      }));
    }
  };

  // 일괄 적용 토글
  const handleApplyToAllToggle = (applyToAll: boolean) => {
    setGlobalAvatarSettings(prev => ({
      ...prev,
      applyToAll
    }));

    // 일괄 적용이 활성화되고 현재 아바타가 선택되어 있다면 현재 세그먼트의 아바타를 글로벌로 설정
    if (applyToAll && customization?.selected_avatar_id) {
      setGlobalAvatarSettings(prev => ({
        ...prev,
        selectedAvatarId: customization.selected_avatar_id || '',
        applyToAll: true
      }));
    }
  };

  // 프롬프트 변경 핸들러
  const handlePromptChange = (prompt: string) => {
    if (customization) {
      setCustomization({
        ...customization,
        custom_prompt: prompt,
        updated_at: new Date().toISOString()
      });
    }
  };

  // 커스터마이제이션 저장
  const handleSaveCustomization = async () => {
    if (!customization) return;

    setSavingCustomization(true);
    try {
      if (serverConnected) {
        // 실제 API 호출
        await axios.post(`http://localhost:8000/api/v1/video/customization`, customization);
        
        // 일괄 적용이 체크되어 있다면 글로벌 설정도 저장
        if (globalAvatarSettings.applyToAll) {
          await axios.post('http://localhost:8000/api/v1/video/global-avatar-settings', {
            selectedAvatarId: globalAvatarSettings.selectedAvatarId,
            hasBeenAppliedBefore: true
          });
          
          // 로컬 상태 업데이트
          setGlobalAvatarSettings(prev => ({
            ...prev,
            hasBeenAppliedBefore: true
          }));
        }
      } else {
        // 테스트 모드
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // 일괄 적용이 체크되어 있다면 localStorage에 저장
        if (globalAvatarSettings.applyToAll) {
          const settingsToSave = {
            selectedAvatarId: globalAvatarSettings.selectedAvatarId,
            hasBeenAppliedBefore: true
          };
          localStorage.setItem('globalAvatarSettings', JSON.stringify(settingsToSave));
          
          // 로컬 상태 업데이트
          setGlobalAvatarSettings(prev => ({
            ...prev,
            hasBeenAppliedBefore: true
          }));
        }
      }
      
      // 성공 메시지 표시 (선택사항)
      console.log('세그먼트 옵션이 저장되었습니다.');
    } catch (err: any) {
      setError('세그먼트 옵션 저장 중 오류가 발생했습니다.');
    } finally {
      setSavingCustomization(false);
    }
  };

  // 영상 생성
  const handleGenerateVideo = async () => {
    if (!selectedScript) return;

    setGeneratingVideo(true);
    setError(null);

    try {
      if (serverConnected) {
        // 실제 API 호출
        const response = await axios.post(`http://localhost:8000/api/v1/video/generate/${selectedScript.id}`);
        setVideoGenerations(response.data);
      } else {
        // 테스트 모드
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        const dummyVideos: VideoGeneration[] = segments.map(segment => ({
          id: `video_${segment.id}`,
          segment_id: segment.id,
          video_url: 'https://www.w3schools.com/html/mov_bbb.mp4', // 테스트용 비디오
          status: 'completed' as const,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }));
        
        setVideoGenerations(dummyVideos);
      }
      
      setShowVideoResults(true);
    } catch (err: any) {
      setError('영상 생성 중 오류가 발생했습니다.');
    } finally {
      setGeneratingVideo(false);
    }
  };

  // 영상 선택 핸들러
  const handleVideoSelect = (video: VideoGeneration) => {
    setSelectedVideoGeneration(video);
  };

  // 선택된 아바타 정보 가져오기
  const getSelectedAvatar = () => {
    return avatars.find(avatar => avatar.id === customization?.selected_avatar_id);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <button
          onClick={onBack}
          className={`p-2 rounded-full transition-colors duration-200 ${
            darkMode 
              ? 'bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white' 
              : 'bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-800'
          }`}
          aria-label="홈으로 돌아가기"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 className="text-xl font-semibold">영상 관리</h2>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            대본 세그먼트별로 영상 생성 옵션을 설정하고 AI 영상을 생성하세요
          </p>
        </div>
      </div>

      {error && (
        <div className={`p-4 rounded-lg border ${darkMode ? 'bg-red-900/20 border-red-700 text-red-400' : 'bg-red-50 border-red-200 text-red-700'}`}>
          <span>{error}</span>
        </div>
      )}

      {!showVideoResults ? (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* 왼쪽: 대본 목록 / 세그먼트 목록 */}
          <div className="h-[600px]">
            <div className={`h-full rounded-lg overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-md relative`}>
              {/* 대본 목록 */}
              <div className={`absolute inset-0 transition-transform duration-300 ease-in-out ${
                showSegments ? '-translate-x-full' : 'translate-x-0'
              }`}>
                <div className={`px-6 py-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <h3 className="text-lg font-semibold">대본 목록</h3>
                  {!serverConnected && (
                    <p className={`text-xs mt-1 ${darkMode ? 'text-yellow-400' : 'text-yellow-600'}`}>
                      테스트 모드 - 더미 데이터 표시 중
                    </p>
                  )}
                </div>
                <div className="p-6 h-[calc(100%-5rem)] overflow-y-auto">
                  {loadingScripts ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className={`animate-spin ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} size={24} />
                      <span className="ml-2">대본 목록 로드 중...</span>
                    </div>
                  ) : scripts.length === 0 ? (
                    <div className="text-center py-8">
                      <FileText className={`mx-auto mb-2 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} size={32} />
                      <p className={darkMode ? 'text-gray-400' : 'text-gray-500'}>
                        저장된 대본이 없습니다
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {scripts.map((script) => (
                        <div
                          key={script.id}
                          onClick={() => handleScriptSelect(script)}
                          className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                            selectedScript?.id === script.id
                              ? darkMode 
                                ? 'border-purple-500 bg-purple-900/20' 
                                : 'border-purple-500 bg-purple-50'
                              : darkMode
                                ? 'border-gray-600 hover:border-gray-500 bg-gray-700/50 hover:bg-gray-700'
                                : 'border-gray-200 hover:border-gray-300 bg-gray-50 hover:bg-gray-100'
                          }`}
                        >
                          <h4 className="font-medium mb-2">{script.title}</h4>
                          <div className="flex items-center space-x-4 text-xs">
                            <div className="flex items-center space-x-1">
                              <FileText size={12} />
                              <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>
                                {script.file_name}
                              </span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Clock size={12} />
                              <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>
                                {script.duration_minutes}분 {script.duration_seconds || 0}초
                              </span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Calendar size={12} />
                              <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>
                                {formatDate(script.created_at)}
                              </span>
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
                <div className="p-6 h-[calc(100%-5rem)] overflow-y-auto">
                  {loadingSegments ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className={`animate-spin ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} size={24} />
                      <span className="ml-2">세그먼트 로드 중...</span>
                    </div>
                  ) : segments.length === 0 ? (
                    <div className="text-center py-8">
                      <FileText className={`mx-auto mb-2 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} size={32} />
                      <p className={darkMode ? 'text-gray-400' : 'text-gray-500'}>
                        세그먼트가 없습니다
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {segments.map((segment) => (
                        <div
                          key={segment.id}
                          onClick={() => handleSegmentSelect(segment)}
                          className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                            selectedSegment?.id === segment.id
                              ? darkMode 
                                ? 'border-purple-500 bg-purple-900/20' 
                                : 'border-purple-500 bg-purple-50'
                              : darkMode
                                ? 'border-gray-600 hover:border-gray-500 bg-gray-700/50 hover:bg-gray-700'
                                : 'border-gray-200 hover:border-gray-300 bg-gray-50 hover:bg-gray-100'
                          }`}
                        >
                          <div className="flex items-center space-x-2 mb-2">
                            <div className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium ${
                              darkMode ? 'bg-purple-600 text-white' : 'bg-purple-100 text-purple-600'
                            }`}>
                              {segment.segment_index}
                            </div>
                            <span className="font-medium">세그먼트 {segment.segment_index}</span>
                          </div>
                          <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'} line-clamp-2`}>
                            {segment.content}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 오른쪽: 세그먼트 옵션 */}
          <div className="h-[600px]">
            <div className={`h-full rounded-lg overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
              <div className={`px-6 py-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">세그먼트 옵션</h3>
                  {/* 세그먼트가 선택되었을 때만 아바타 사용 체크박스 표시 */}
                  {selectedSegment && (
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="useAvatar"
                        checked={customization?.use_avatar || false}
                        onChange={(e) => handleAvatarToggle(e.target.checked)}
                        disabled={!customization}
                        className="rounded"
                      />
                      <label htmlFor="useAvatar" className="text-sm font-medium">
                        아바타 사용
                      </label>
                    </div>
                  )}
                </div>
              </div>
              <div className="p-6 h-[calc(100%-5rem)] overflow-y-auto">
                {!selectedSegment ? (
                  <div className="flex flex-col items-center justify-center py-8 h-full">
                    <Video className={`mb-2 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} size={32} />
                    <p className={darkMode ? 'text-gray-400' : 'text-gray-500'}>
                      세그먼트를 선택해주세요
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* 선택된 세그먼트 정보 */}
                    <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                      <h4 className="font-medium mb-2">세그먼트 {selectedSegment.segment_index}</h4>
                      <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        {selectedSegment.content}
                      </p>
                    </div>

                    {/* 이미지 업로드 또는 아바타 선택 영역 */}
                    {customization?.use_avatar ? (
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <h5 className="font-medium">아바타 선택</h5>
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="applyToAll"
                              checked={globalAvatarSettings.applyToAll}
                              onChange={(e) => handleApplyToAllToggle(e.target.checked)}
                              className="rounded"
                            />
                            <label htmlFor="applyToAll" className="text-sm">
                              일괄 적용
                            </label>
                          </div>
                        </div>
                        
                        {/* 좌우 분할 레이아웃 */}
                        <div className="grid grid-cols-2 gap-4 h-64">
                          {/* 왼쪽: 아바타 목록 */}
                          <div className={`rounded-lg border ${darkMode ? 'border-gray-600 bg-gray-700/30' : 'border-gray-200 bg-gray-50'} p-3`}>
                            <h6 className={`text-sm font-medium mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                              아바타 목록
                            </h6>
                            <div className="space-y-2 max-h-48 overflow-y-auto">
                              {avatars.map((avatar) => (
                                <div
                                  key={avatar.id}
                                  onClick={() => handleAvatarSelect(avatar.id)}
                                  className={`flex items-center space-x-3 p-2 rounded-lg cursor-pointer transition-all duration-200 ${
                                    customization.selected_avatar_id === avatar.id
                                      ? darkMode 
                                        ? 'bg-purple-600/20 border border-purple-500' 
                                        : 'bg-purple-50 border border-purple-300'
                                      : darkMode
                                        ? 'hover:bg-gray-600/50'
                                        : 'hover:bg-gray-100'
                                  }`}
                                >
                                  <img
                                    src={avatar.image_url}
                                    alt={avatar.name}
                                    className="w-10 h-10 object-cover rounded-full"
                                  />
                                  <div className="flex-1 min-w-0">
                                    <p className={`text-sm font-medium truncate ${
                                      customization.selected_avatar_id === avatar.id
                                        ? darkMode ? 'text-purple-300' : 'text-purple-700'
                                        : darkMode ? 'text-gray-300' : 'text-gray-700'
                                    }`}>
                                      {avatar.name}
                                    </p>
                                    <p className={`text-xs truncate ${
                                      customization.selected_avatar_id === avatar.id
                                        ? darkMode ? 'text-purple-400' : 'text-purple-600'
                                        : darkMode ? 'text-gray-400' : 'text-gray-500'
                                    }`}>
                                      {avatar.description}
                                    </p>
                                  </div>
                                  {customization.selected_avatar_id === avatar.id && (
                                    <Check size={16} className={darkMode ? 'text-purple-400' : 'text-purple-600'} />
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* 오른쪽: 선택된 아바타 이미지 */}
                          <div className={`rounded-lg border ${darkMode ? 'border-gray-600 bg-gray-700/30' : 'border-gray-200 bg-gray-50'} p-3`}>
                            <h6 className={`text-sm font-medium mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                              선택된 아바타 이미지
                            </h6>
                            <div className="flex flex-col items-center justify-center h-48">
                              {getSelectedAvatar() ? (
                                <div className="text-center">
                                  <img
                                    src={getSelectedAvatar()!.image_url}
                                    alt={getSelectedAvatar()!.name}
                                    className="w-32 h-32 object-cover rounded-lg mx-auto mb-3"
                                  />
                                  <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                    {getSelectedAvatar()!.name}
                                  </p>
                                  <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                    {getSelectedAvatar()!.description}
                                  </p>
                                </div>
                              ) : (
                                <div className="text-center">
                                  <User className={`mx-auto mb-2 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} size={48} />
                                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                    아바타를 선택해주세요
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <h5 className="font-medium mb-3">이미지 업로드</h5>
                        <ImageUploader
                          onImageSelected={handleImageSelected}
                          darkMode={darkMode}
                          disabled={customization?.use_avatar}
                          currentImage={customization?.custom_image_url}
                        />
                      </div>
                    )}

                    {/* 기본 프롬프트 영역 */}
                    <div>
                      <h5 className="font-medium mb-3">기본 프롬프트</h5>
                      <textarea
                        value={customization?.custom_prompt || ''}
                        onChange={(e) => handlePromptChange(e.target.value)}
                        placeholder="영상 생성을 위한 프롬프트를 입력하세요..."
                        className={`w-full h-32 p-3 rounded-lg border resize-none ${
                          darkMode 
                            ? 'bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-400' 
                            : 'bg-white border-gray-300 text-gray-800 placeholder-gray-500'
                        }`}
                      />
                    </div>

                    {/* 저장 및 초기화 버튼 */}
                    <div className="flex space-x-3">
                      <button
                        onClick={() => {
                          if (selectedSegment) {
                            handleSegmentSelect(selectedSegment);
                          }
                        }}
                        className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2 ${
                          darkMode 
                            ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                            : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                        }`}
                      >
                        <RotateCcw size={16} />
                        <span>초기화</span>
                      </button>
                      <button
                        onClick={handleSaveCustomization}
                        disabled={!customization || savingCustomization}
                        className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2 ${
                          !customization || savingCustomization
                            ? darkMode 
                              ? 'bg-gray-700 text-gray-500 cursor-not-allowed' 
                              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            : darkMode
                              ? 'bg-purple-600 hover:bg-purple-500 text-white'
                              : 'bg-purple-600 hover:bg-purple-700 text-white'
                        }`}
                      >
                        {savingCustomization ? (
                          <>
                            <Loader2 className="animate-spin\" size={16} />
                            <span>저장 중...</span>
                          </>
                        ) : (
                          <>
                            <Save size={16} />
                            <span>저장</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* 영상 결과 확인 영역 */
        <div className="grid lg:grid-cols-2 gap-6">
          {/* 왼쪽: 세그먼트 목록 */}
          <div className="h-[600px]">
            <div className={`h-full rounded-lg overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
              <div className={`px-6 py-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <h3 className="text-lg font-semibold">세그먼트 목록</h3>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  생성된 영상을 확인하세요
                </p>
              </div>
              <div className="p-6 h-[calc(100%-5rem)] overflow-y-auto">
                <div className="space-y-3">
                  {videoGenerations.map((video) => {
                    const segment = segments.find(s => s.id === video.segment_id);
                    return (
                      <div
                        key={video.id}
                        onClick={() => handleVideoSelect(video)}
                        className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                          selectedVideoGeneration?.id === video.id
                            ? darkMode 
                              ? 'border-purple-500 bg-purple-900/20' 
                              : 'border-purple-500 bg-purple-50'
                            : darkMode
                              ? 'border-gray-600 hover:border-gray-500 bg-gray-700/50 hover:bg-gray-700'
                              : 'border-gray-200 hover:border-gray-300 bg-gray-50 hover:bg-gray-100'
                        }`}
                      >
                        <div className="flex items-center space-x-2 mb-2">
                          <div className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium ${
                            darkMode ? 'bg-purple-600 text-white' : 'bg-purple-100 text-purple-600'
                          }`}>
                            {segment?.segment_index}
                          </div>
                          <span className="font-medium">세그먼트 {segment?.segment_index}</span>
                          <div className={`px-2 py-1 rounded-full text-xs ${
                            video.status === 'completed' 
                              ? 'bg-green-100 text-green-600' 
                              : 'bg-yellow-100 text-yellow-600'
                          }`}>
                            {video.status === 'completed' ? '완료' : '처리중'}
                          </div>
                        </div>
                        <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'} line-clamp-2`}>
                          {segment?.content}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* 오른쪽: 생성된 영상 확인 */}
          <div className="h-[600px]">
            <div className={`h-full rounded-lg overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
              <div className={`px-6 py-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <h3 className="text-lg font-semibold">생성된 영상 확인</h3>
              </div>
              <div className="p-6 h-[calc(100%-5rem)] overflow-y-auto">
                {!selectedVideoGeneration ? (
                  <div className="flex flex-col items-center justify-center py-8 h-full">
                    <Video className={`mb-2 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} size={32} />
                    <p className={darkMode ? 'text-gray-400' : 'text-gray-500'}>
                      세그먼트를 선택해서 영상을 확인하세요
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {selectedVideoGeneration.video_url ? (
                      <div>
                        <video
                          controls
                          className="w-full rounded-lg"
                          src={selectedVideoGeneration.video_url}
                        >
                          브라우저가 비디오를 지원하지 않습니다.
                        </video>
                        <div className="flex items-center justify-between mt-3">
                          <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            세그먼트 {segments.find(s => s.id === selectedVideoGeneration.segment_id)?.segment_index}
                          </span>
                          <button
                            onClick={() => {
                              const link = document.createElement('a');
                              link.href = selectedVideoGeneration.video_url!;
                              link.download = `segment_${segments.find(s => s.id === selectedVideoGeneration.segment_id)?.segment_index}.mp4`;
                              link.click();
                            }}
                            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors duration-200 ${
                              darkMode 
                                ? 'bg-purple-600 hover:bg-purple-500 text-white' 
                                : 'bg-purple-600 hover:bg-purple-700 text-white'
                            }`}
                          >
                            <Download size={14} className="inline mr-1" />
                            다운로드
                          </button>
                        </div>
                        {!serverConnected && (
                          <p className={`text-xs mt-2 ${darkMode ? 'text-yellow-400' : 'text-yellow-600'}`}>
                            테스트 모드 - 샘플 비디오 파일
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Loader2 className={`animate-spin mx-auto mb-2 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} size={32} />
                        <p className={darkMode ? 'text-gray-400' : 'text-gray-500'}>
                          영상 생성 중...
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 영상 생성하기 버튼 */}
      {!showVideoResults && selectedScript && segments.length > 0 && (
        <div className="flex justify-center">
          <button
            onClick={handleGenerateVideo}
            disabled={generatingVideo}
            className={`px-8 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2 ${
              generatingVideo
                ? darkMode 
                  ? 'bg-gray-700 text-gray-400 cursor-not-allowed' 
                  : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                : darkMode
                  ? 'bg-purple-600 hover:bg-purple-500 text-white'
                  : 'bg-purple-600 hover:bg-purple-700 text-white'
            }`}
          >
            {generatingVideo ? (
              <>
                <Loader2 className="animate-spin\" size={20} />
                <span>영상 생성 중...</span>
              </>
            ) : (
              <>
                <Video size={20} />
                <span>영상 생성하기</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* 뒤로가기 버튼 (영상 결과 화면에서) */}
      {showVideoResults && (
        <div className="flex justify-center">
          <button
            onClick={() => setShowVideoResults(false)}
            className={`px-6 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2 ${
              darkMode 
                ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
            }`}
          >
            <ArrowLeft size={16} />
            <span>세그먼트 옵션으로 돌아가기</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default VideoManagementPage;