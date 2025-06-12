import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Trash2, Save, Loader2, AlertCircle, Plus, Image as ImageIcon, CheckSquare, Square, X } from 'lucide-react';
import { Avatar } from '../types';
import { formatDate, getImageUrl } from '../utils';
import ImageUploader from '../components/ImageUploader';
import axios from 'axios';

interface AvatarManagementPageProps {
  darkMode: boolean;
  serverConnected: boolean;
}

const AvatarManagementPage: React.FC<AvatarManagementPageProps> = ({
  darkMode,
  serverConnected
}) => {
  const navigate = useNavigate();
  const [avatars, setAvatars] = useState<Avatar[]>([]);
  const [selectedAvatar, setSelectedAvatar] = useState<Avatar | null>(null);
  const [loadingAvatars, setLoadingAvatars] = useState(true);
  const [savingAvatar, setSavingAvatar] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // 아바타 등록 폼 상태
  const [newAvatarForm, setNewAvatarForm] = useState({
    name: '',
    description: '',
    image: null as File | null,
    imageUrl: ''
  });
  
  // 삭제 관련 상태
  const [isMultiSelectMode, setIsMultiSelectMode] = useState(false);
  const [selectedAvatarIds, setSelectedAvatarIds] = useState<Set<string>>(new Set());
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showSingleDeleteConfirm, setShowSingleDeleteConfirm] = useState(false);
  const [avatarToDelete, setAvatarToDelete] = useState<Avatar | null>(null);
  const [deletingAvatarId, setDeletingAvatarId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // 더미 아바타 데이터
  const dummyAvatars: Avatar[] = [
    {
      id: 'avatar_1',
      name: '전문가 아바타',
      image_url: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop',
      description: '비즈니스 전문가 스타일의 아바타입니다. 정장을 입고 있으며 신뢰감을 주는 외모를 가지고 있습니다.',
      created_at: '2024-01-15T10:30:00Z',
      updated_at: '2024-01-15T10:30:00Z'
    },
    {
      id: 'avatar_2',
      name: '친근한 아바타',
      image_url: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop',
      description: '친근하고 따뜻한 스타일의 아바타입니다. 편안한 복장으로 친밀감을 표현합니다.',
      created_at: '2024-01-14T14:20:00Z',
      updated_at: '2024-01-14T14:20:00Z'
    },
    {
      id: 'avatar_3',
      name: '학술적 아바타',
      image_url: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop',
      description: '학술적이고 신뢰감 있는 스타일의 아바타입니다. 교육 및 연구 분야에 적합합니다.',
      created_at: '2024-01-13T09:15:00Z',
      updated_at: '2024-01-13T09:15:00Z'
    },
    {
      id: 'avatar_4',
      name: '열정적 아바타',
      image_url: 'https://images.pexels.com/photos/1181690/pexels-photo-1181690.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop',
      description: '에너지 넘치고 열정적인 스타일의 아바타입니다. 동기부여와 영감을 주는 발표에 적합합니다.',
      created_at: '2024-01-12T16:45:00Z',
      updated_at: '2024-01-12T16:45:00Z'
    }
  ];

  // 아바타 목록 로드
  useEffect(() => {
    loadAvatars();
  }, []);

  const loadAvatars = async () => {
    setLoadingAvatars(true);
    setError(null);

    try {
      if (serverConnected) {
        try {
          // 전체 URL 사용
          const response = await axios.get('http://localhost:8000/api/v1/avatars');
          console.log('아바타 응답:', response);
          
          if (response.data && response.data.avatars && Array.isArray(response.data.avatars)) {
            setAvatars(response.data.avatars);
          } else if (response.data && Array.isArray(response.data)) {
            // 백엔드가 배열을 직접 반환하는 경우
            setAvatars(response.data);
          } else {
            console.error('API 응답 형식 오류:', response.data);
            setError('API에서 유효한 응답을 받지 못했습니다.');
            setAvatars(dummyAvatars);
          }
        } catch (apiError: any) {
          if (apiError.response && apiError.response.status === 404) {
            setError('아바타 API가 아직 구현되지 않았습니다.');
            setAvatars(dummyAvatars);
          } else {
            setError(`서버 오류: ${apiError.message || '알 수 없는 오류'}`);
            setAvatars([]);
          }
        }
      } else {
        await new Promise(resolve => setTimeout(resolve, 1000));
        setAvatars(dummyAvatars);
      }
    } catch (err: any) {
      setError('아바타를 불러오는 중 오류가 발생했습니다.');
      setAvatars([]);
    } finally {
      setLoadingAvatars(false);
    }
  };

  // 이미지 선택 핸들러
  const handleImageSelected = (file: File) => {
    const imageUrl = URL.createObjectURL(file);
    setNewAvatarForm(prev => ({
      ...prev,
      image: file,
      imageUrl
    }));
  };

  // 폼 입력 핸들러
  const handleFormChange = (field: string, value: string) => {
    setNewAvatarForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // 폼 초기화
  const resetForm = () => {
    setNewAvatarForm({
      name: '',
      description: '',
      image: null,
      imageUrl: ''
    });
    // URL 객체 정리
    if (newAvatarForm.imageUrl) {
      URL.revokeObjectURL(newAvatarForm.imageUrl);
    }
  };

  // 아바타 저장
  const handleSaveAvatar = async () => {
    if (!newAvatarForm.name.trim()) {
      setError('아바타 이름을 입력해주세요.');
      return;
    }
    
    if (!newAvatarForm.image) {
      setError('아바타 이미지를 업로드해주세요.');
      return;
    }

    setSavingAvatar(true);
    setError(null);

    try {
      if (serverConnected) {
        try {
          // 먼저 이미지를 업로드
          const formData = new FormData();
          formData.append('file', newAvatarForm.image);

          const uploadResponse = await axios.post('http://localhost:8000/api/v1/avatars/upload', formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });
          
          console.log('업로드 응답:', uploadResponse);

          if (uploadResponse.data && uploadResponse.data.image_url) {
            // 이미지 업로드 성공 후 아바타 정보 등록
            const avatarData = {
              name: newAvatarForm.name.trim(),
              description: newAvatarForm.description.trim(),
              image_url: uploadResponse.data.image_url
            };

            const response = await axios.post('http://localhost:8000/api/v1/avatars', avatarData);
            console.log('아바타 생성 응답:', response);

            if (response.data) {
              setAvatars(prev => [response.data, ...prev]);
              resetForm();
            }
          }
        } catch (apiError: any) {
          if (apiError.response && apiError.response.status === 404) {
            setError('아바타 등록 API가 아직 구현되지 않았습니다.');
            
            // API가 구현되지 않은 경우에만 임시로 더미 데이터 추가
            const newAvatar: Avatar = {
              id: `avatar_${Date.now()}`,
              name: newAvatarForm.name.trim(),
              description: newAvatarForm.description.trim(),
              image_url: newAvatarForm.imageUrl,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            };
            
            setAvatars(prev => [newAvatar, ...prev]);
            resetForm();
          } else {
            setError(`아바타 등록 중 오류 발생: ${apiError.message || '알 수 없는 오류'}`);
          }
        }
      } else {
        // 테스트 모드
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        const newAvatar: Avatar = {
          id: `avatar_${Date.now()}`,
          name: newAvatarForm.name.trim(),
          description: newAvatarForm.description.trim(),
          image_url: newAvatarForm.imageUrl,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        setAvatars(prev => [newAvatar, ...prev]);
        resetForm();
      }
    } catch (err: any) {
      setError('아바타 등록 중 오류가 발생했습니다.');
    } finally {
      setSavingAvatar(false);
    }
  };

  // 개별 삭제 확인 모달 표시
  const showDeleteConfirmation = (avatar: Avatar) => {
    setAvatarToDelete(avatar);
    setShowSingleDeleteConfirm(true);
  };

  // 개별 아바타 삭제 실행
  const handleDeleteAvatar = async () => {
    if (!avatarToDelete) return;

    setIsDeleting(true);
    setDeletingAvatarId(avatarToDelete.id);

    try {
      if (serverConnected) {
        try {
          await axios.delete(`http://localhost:8000/api/v1/avatars/${avatarToDelete.id}`);
          
          setAvatars(prev => prev.filter(avatar => avatar.id !== avatarToDelete.id));
          
          if (selectedAvatar?.id === avatarToDelete.id) {
            setSelectedAvatar(null);
          }
          
        } catch (apiError: any) {
          if (apiError.response && apiError.response.status === 404) {
            setError('삭제 API가 아직 구현되지 않았습니다.');
            
            setAvatars(prev => prev.filter(avatar => avatar.id !== avatarToDelete.id));
            if (selectedAvatar?.id === avatarToDelete.id) {
              setSelectedAvatar(null);
            }
          } else {
            setError(`삭제 중 오류 발생: ${apiError.message || '알 수 없는 오류'}`);
          }
        }
      } else {
        await new Promise(resolve => setTimeout(resolve, 500));
        setAvatars(prev => prev.filter(avatar => avatar.id !== avatarToDelete.id));
        
        if (selectedAvatar?.id === avatarToDelete.id) {
          setSelectedAvatar(null);
        }
      }
    } catch (err: any) {
      setError('아바타 삭제 중 오류가 발생했습니다.');
    } finally {
      setIsDeleting(false);
      setDeletingAvatarId(null);
      setShowSingleDeleteConfirm(false);
      setAvatarToDelete(null);
    }
  };

  // 다중 아바타 삭제
  const handleDeleteMultipleAvatars = async () => {
    if (selectedAvatarIds.size === 0) return;

    setIsDeleting(true);

    try {
      const avatarIdsArray = Array.from(selectedAvatarIds);
      
      if (serverConnected) {
        try {
          await axios.post('http://localhost:8000/api/v1/avatars/delete-multiple', {
            avatar_ids: avatarIdsArray
          });
          
          setAvatars(prev => prev.filter(avatar => !selectedAvatarIds.has(avatar.id)));
          
          if (selectedAvatar && selectedAvatarIds.has(selectedAvatar.id)) {
            setSelectedAvatar(null);
          }
          
        } catch (apiError: any) {
          if (apiError.response && apiError.response.status === 404) {
            setError('다중 삭제 API가 아직 구현되지 않았습니다.');
            
            setAvatars(prev => prev.filter(avatar => !selectedAvatarIds.has(avatar.id)));
            if (selectedAvatar && selectedAvatarIds.has(selectedAvatar.id)) {
              setSelectedAvatar(null);
            }
          } else {
            setError(`다중 삭제 중 오류 발생: ${apiError.message || '알 수 없는 오류'}`);
          }
        }
      } else {
        await new Promise(resolve => setTimeout(resolve, 1000));
        setAvatars(prev => prev.filter(avatar => !selectedAvatarIds.has(avatar.id)));
        
        if (selectedAvatar && selectedAvatarIds.has(selectedAvatar.id)) {
          setSelectedAvatar(null);
        }
      }
      
      setIsMultiSelectMode(false);
      setSelectedAvatarIds(new Set());
      setShowDeleteConfirm(false);
      
    } catch (err: any) {
      setError('다중 아바타 삭제 중 오류가 발생했습니다.');
    } finally {
      setIsDeleting(false);
    }
  };

  // 다중 선택 토글
  const toggleMultiSelectMode = () => {
    setIsMultiSelectMode(!isMultiSelectMode);
    setSelectedAvatarIds(new Set());
  };

  // 아바타 선택 토글
  const toggleAvatarSelection = (avatarId: string) => {
    const newSelection = new Set(selectedAvatarIds);
    if (newSelection.has(avatarId)) {
      newSelection.delete(avatarId);
    } else {
      newSelection.add(avatarId);
    }
    setSelectedAvatarIds(newSelection);
  };

  // 전체 선택/해제
  const toggleSelectAll = () => {
    if (selectedAvatarIds.size === avatars.length) {
      setSelectedAvatarIds(new Set());
    } else {
      setSelectedAvatarIds(new Set(avatars.map(avatar => avatar.id)));
    }
  };

  // 아바타 선택 핸들러
  const handleAvatarSelect = (avatar: Avatar) => {
    if (isMultiSelectMode) {
      toggleAvatarSelection(avatar.id);
    } else {
      setSelectedAvatar(avatar);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate('/')}
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
          <h2 className="text-xl font-semibold">아바타 관리</h2>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            영상 생성에 사용할 아바타를 등록하고 관리하세요
          </p>
        </div>
      </div>

      {error && (
        <div className={`p-4 rounded-lg border ${darkMode ? 'bg-red-900/20 border-red-700 text-red-400' : 'bg-red-50 border-red-200 text-red-700'}`}>
          <div className="flex items-center space-x-2">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-8">
        {/* 왼쪽: 아바타 등록 영역 */}
        <div className="h-[700px]">
          <div className={`h-full rounded-lg overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
            <div className={`px-6 py-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex items-center space-x-2">
                <Plus className={`${darkMode ? 'text-orange-400' : 'text-orange-600'}`} size={20} />
                <h3 className="text-lg font-semibold">아바타 등록</h3>
              </div>
              {!serverConnected && (
                <p className={`text-xs mt-1 ${darkMode ? 'text-yellow-400' : 'text-yellow-600'}`}>
                  테스트 모드 - 로컬 저장
                </p>
              )}
            </div>
            <div className="p-6 h-[calc(100%-5rem)] overflow-y-auto">
              <div className="space-y-6">
                {/* 이미지 업로드 영역 */}
                <div>
                  <h4 className="font-medium mb-3">아바타 이미지</h4>
                  <ImageUploader
                    onImageSelected={handleImageSelected}
                    darkMode={darkMode}
                    currentImage={newAvatarForm.imageUrl}
                  />
                </div>

                {/* 아바타 이름 입력 */}
                <div>
                  <label className="block font-medium mb-2">
                    아바타 이름 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newAvatarForm.name}
                    onChange={(e) => handleFormChange('name', e.target.value)}
                    placeholder="아바타 이름을 입력하세요"
                    className={`w-full p-3 rounded-lg border ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-400' 
                        : 'bg-white border-gray-300 text-gray-800 placeholder-gray-500'
                    }`}
                  />
                </div>

                {/* 아바타 설명 입력 */}
                <div>
                  <label className="block font-medium mb-2">
                    아바타 설명
                  </label>
                  <textarea
                    value={newAvatarForm.description}
                    onChange={(e) => handleFormChange('description', e.target.value)}
                    placeholder="아바타에 대한 설명을 입력하세요 (선택사항)"
                    rows={4}
                    className={`w-full p-3 rounded-lg border resize-none ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-400' 
                        : 'bg-white border-gray-300 text-gray-800 placeholder-gray-500'
                    }`}
                  />
                </div>

                {/* 등록 및 초기화 버튼 */}
                <div className="flex space-x-3">
                  <button
                    onClick={resetForm}
                    className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors duration-200 ${
                      darkMode 
                        ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                        : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                    }`}
                  >
                    초기화
                  </button>
                  <button
                    onClick={handleSaveAvatar}
                    disabled={savingAvatar || !newAvatarForm.name.trim() || !newAvatarForm.image}
                    className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2 ${
                      savingAvatar || !newAvatarForm.name.trim() || !newAvatarForm.image
                        ? darkMode 
                          ? 'bg-gray-700 text-gray-500 cursor-not-allowed' 
                          : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : darkMode
                          ? 'bg-orange-600 hover:bg-orange-500 text-white'
                          : 'bg-orange-600 hover:bg-orange-700 text-white'
                    }`}
                  >
                    {savingAvatar ? (
                      <>
                        <Loader2 className="animate-spin\" size={18} />
                        <span>등록 중...</span>
                      </>
                    ) : (
                      <>
                        <Save size={18} />
                        <span>등록</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 오른쪽: 저장된 아바타 목록 */}
        <div className="h-[700px]">
          <div className="grid grid-cols-2 gap-4 h-full">
            {/* 왼쪽: 아바타 목록 */}
            <div className={`rounded-lg overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
              <div className={`px-4 py-3 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">아바타 목록</h4>
                  
                  {avatars.length > 0 && (
                    <div className="flex items-center space-x-1">
                      {isMultiSelectMode && (
                        <>
                          <button
                            onClick={toggleSelectAll}
                            className={`p-1 rounded transition-colors duration-200 ${
                              darkMode 
                                ? 'hover:bg-gray-700 text-gray-400' 
                                : 'hover:bg-gray-200 text-gray-600'
                            }`}
                            title={selectedAvatarIds.size === avatars.length ? "전체 해제" : "전체 선택"}
                          >
                            {selectedAvatarIds.size === avatars.length ? 
                              <CheckSquare size={14} /> : 
                              <Square size={14} />
                            }
                          </button>
                          
                          {selectedAvatarIds.size > 0 && (
                            <button
                              onClick={() => setShowDeleteConfirm(true)}
                              disabled={isDeleting}
                              className={`p-1 rounded transition-colors duration-200 ${
                                isDeleting
                                  ? darkMode 
                                    ? 'text-gray-600 cursor-not-allowed' 
                                    : 'text-gray-400 cursor-not-allowed'
                                  : darkMode
                                    ? 'hover:bg-red-600 text-red-400 hover:text-white'
                                    : 'hover:bg-red-600 text-red-500 hover:text-white'
                              }`}
                              title={`선택된 ${selectedAvatarIds.size}개 삭제`}
                            >
                              {isDeleting ? <Loader2 className="animate-spin\" size={14} /> : <Trash2 size={14} />}
                            </button>
                          )}
                          
                          <button
                            onClick={toggleMultiSelectMode}
                            className={`p-1 rounded transition-colors duration-200 ${
                              darkMode 
                                ? 'hover:bg-gray-700 text-gray-400' 
                                : 'hover:bg-gray-200 text-gray-600'
                            }`}
                            title="선택 모드 종료"
                          >
                            <X size={14} />
                          </button>
                        </>
                      )}
                      
                      {!isMultiSelectMode && (
                        <button
                          onClick={toggleMultiSelectMode}
                          className={`p-1 rounded transition-colors duration-200 ${
                            darkMode 
                              ? 'hover:bg-gray-700 text-gray-400' 
                              : 'hover:bg-gray-200 text-gray-600'
                          }`}
                          title="다중 선택 모드"
                        >
                          <CheckSquare size={14} />
                        </button>
                      )}
                    </div>
                  )}
                </div>
                <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {avatars.length}개의 아바타
                </p>
              </div>
              <div className="p-4 h-[calc(100%-4.5rem)] overflow-y-auto">
                {loadingAvatars ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className={`animate-spin ${darkMode ? 'text-orange-400' : 'text-orange-600'}`} size={20} />
                    <span className="ml-2 text-sm">로드 중...</span>
                  </div>
                ) : avatars.length === 0 ? (
                  <div className="text-center py-8">
                    <User className={`mx-auto mb-2 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} size={24} />
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      등록된 아바타가 없습니다
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {avatars.map((avatar) => (
                      <div
                        key={avatar.id}
                        onClick={() => handleAvatarSelect(avatar)}
                        className={`group p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                          selectedAvatar?.id === avatar.id && !isMultiSelectMode
                            ? darkMode 
                              ? 'bg-orange-600/20 border border-orange-500' 
                              : 'bg-orange-50 border border-orange-300'
                            : darkMode
                              ? 'hover:bg-gray-700 border border-transparent'
                              : 'hover:bg-gray-100 border border-transparent'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-3 flex-1">
                            {isMultiSelectMode && (
                              <div className="mt-1">
                                {selectedAvatarIds.has(avatar.id) ? 
                                  <CheckSquare className={`${darkMode ? 'text-orange-400' : 'text-orange-600'}`} size={16} /> : 
                                  <Square className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`} size={16} />
                                }
                              </div>
                            )}
                            
                            <img
                              src={getImageUrl(avatar.image_url)}
                              alt={avatar.name}
                              className="w-10 h-10 object-cover rounded-full"
                            />
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm font-medium truncate ${
                                selectedAvatar?.id === avatar.id && !isMultiSelectMode
                                  ? darkMode ? 'text-orange-300' : 'text-orange-700'
                                  : darkMode ? 'text-gray-300' : 'text-gray-700'
                              }`}>
                                {avatar.name}
                              </p>
                              <p className={`text-xs truncate ${
                                selectedAvatar?.id === avatar.id && !isMultiSelectMode
                                  ? darkMode ? 'text-orange-400' : 'text-orange-600'
                                  : darkMode ? 'text-gray-400' : 'text-gray-500'
                              }`}>
                                {formatDate(avatar.created_at)}
                              </p>
                            </div>
                          </div>
                          
                          {!isMultiSelectMode && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                showDeleteConfirmation(avatar);
                              }}
                              disabled={isDeleting && deletingAvatarId === avatar.id}
                              className={`opacity-0 group-hover:opacity-100 p-1 rounded transition-all duration-200 ${
                                isDeleting && deletingAvatarId === avatar.id
                                  ? darkMode 
                                    ? 'text-gray-600 cursor-not-allowed' 
                                    : 'text-gray-400 cursor-not-allowed'
                                  : darkMode
                                    ? 'hover:bg-red-600 text-red-400 hover:text-white'
                                    : 'hover:bg-red-600 text-red-500 hover:text-white'
                              }`}
                              title="아바타 삭제"
                            >
                              {isDeleting && deletingAvatarId === avatar.id ? 
                                <Loader2 className="animate-spin\" size={12} /> : 
                                <Trash2 size={12} />
                              }
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* 오른쪽: 선택된 아바타 이미지 */}
            <div className={`rounded-lg overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
              <div className={`px-4 py-3 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <h4 className="font-medium">아바타 이미지</h4>
              </div>
              <div className="p-4 h-[calc(100%-4.5rem)] overflow-y-auto">
                {selectedAvatar ? (
                  <div className="space-y-4">
                    <div className="text-center">
                      <img
                        src={getImageUrl(selectedAvatar.image_url)}
                        alt={selectedAvatar.name}
                        className="w-full max-w-xs mx-auto rounded-lg object-cover"
                      />
                    </div>
                    <div className="space-y-3">
                      <div>
                        <h5 className={`font-medium ${darkMode ? 'text-orange-300' : 'text-orange-700'}`}>
                          {selectedAvatar.name}
                        </h5>
                        <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          등록일: {formatDate(selectedAvatar.created_at)}
                        </p>
                      </div>
                      {selectedAvatar.description && (
                        <div>
                          <h6 className={`text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            설명
                          </h6>
                          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {selectedAvatar.description}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 h-full">
                    <ImageIcon className={`mb-2 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} size={32} />
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      아바타를 선택해주세요
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 개별 삭제 확인 모달 */}
      {showSingleDeleteConfirm && avatarToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`p-6 rounded-lg max-w-md w-full mx-4 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <h3 className="text-lg font-semibold mb-4">아바타 삭제 확인</h3>
            <p className={`mb-6 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              "<strong>{avatarToDelete.name}</strong>" 아바타를 삭제하시겠습니까?
              <br />
              <span className="text-sm text-red-500">이 작업은 되돌릴 수 없습니다.</span>
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowSingleDeleteConfirm(false);
                  setAvatarToDelete(null);
                }}
                disabled={isDeleting}
                className={`flex-1 py-2 px-4 rounded-md transition-colors duration-200 ${
                  darkMode 
                    ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                }`}
              >
                취소
              </button>
              <button
                onClick={handleDeleteAvatar}
                disabled={isDeleting}
                className={`flex-1 py-2 px-4 rounded-md transition-colors duration-200 flex items-center justify-center space-x-2 ${
                  isDeleting
                    ? darkMode 
                      ? 'bg-red-700 text-gray-400 cursor-not-allowed' 
                      : 'bg-red-400 text-white cursor-not-allowed'
                    : darkMode
                      ? 'bg-red-600 hover:bg-red-500 text-white'
                      : 'bg-red-600 hover:bg-red-700 text-white'
                }`}
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="animate-spin\" size={16} />
                    <span>삭제 중...</span>
                  </>
                ) : (
                  <span>삭제</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 다중 삭제 확인 모달 */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`p-6 rounded-lg max-w-md w-full mx-4 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <h3 className="text-lg font-semibold mb-4">아바타 삭제 확인</h3>
            <p className={`mb-6 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              선택된 {selectedAvatarIds.size}개의 아바타를 삭제하시겠습니까?
              <br />
              <span className="text-sm text-red-500">이 작업은 되돌릴 수 없습니다.</span>
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className={`flex-1 py-2 px-4 rounded-md transition-colors duration-200 ${
                  darkMode 
                    ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                }`}
              >
                취소
              </button>
              <button
                onClick={handleDeleteMultipleAvatars}
                disabled={isDeleting}
                className={`flex-1 py-2 px-4 rounded-md transition-colors duration-200 flex items-center justify-center space-x-2 ${
                  isDeleting
                    ? darkMode 
                      ? 'bg-red-700 text-gray-400 cursor-not-allowed' 
                      : 'bg-red-400 text-white cursor-not-allowed'
                    : darkMode
                      ? 'bg-red-600 hover:bg-red-500 text-white'
                      : 'bg-red-600 hover:bg-red-700 text-white'
                }`}
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="animate-spin\" size={16} />
                    <span>삭제 중...</span>
                  </>
                ) : (
                  <span>삭제</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AvatarManagementPage;