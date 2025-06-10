import React from 'react';
import { FileText, Mic, Video, User, ArrowRight, Sparkles, Volume2 } from 'lucide-react';
import { PageType } from '../types';
import MenuCard from '../components/MenuCard';

interface HomePageProps {
  darkMode: boolean;
  onNavigate: (page: PageType) => void;
}

const HomePage: React.FC<HomePageProps> = ({ darkMode, onNavigate }) => {
  // 메인 메뉴
  const mainMenuItems = [
    {
      id: 'script-generation' as PageType,
      title: '대본 관리',
      description: 'PPT나 PDF 파일을 업로드하여 AI 기술로 발표 대본을 자동 생성하고 관리합니다',
      icon: FileText,
      color: 'blue',
      features: ['파일 업로드', 'AI 대본 생성', '발표 시간 설정', '대본 세그먼트 관리']
    },
    {
      id: 'voice-generation' as PageType,
      title: '음성 관리',
      description: '생성된 대본을 바탕으로 자연스러운 TTS 음성 파일을 생성하고 관리합니다',
      icon: Mic,
      color: 'green',
      features: ['대본 선택', 'TTS 음성 생성', '음성 미리보기', '다운로드']
    },
    {
      id: 'video-management' as PageType,
      title: '영상 관리',
      description: '대본 세그먼트별로 영상 생성 옵션을 설정하고 AI 영상을 생성합니다',
      icon: Video,
      color: 'purple',
      features: ['세그먼트 커스터마이징', '이미지 업로드', '아바타 설정', '영상 생성']
    }
  ];

  // 서브 메뉴
  const subMenuItems = [
    {
      id: 'avatar-management' as PageType,
      title: '아바타 관리',
      description: '영상 생성에 사용할 아바타를 등록하고 관리합니다',
      icon: User,
      color: 'orange',
      features: ['아바타 등록', '이미지 업로드', '아바타 정보 관리', '아바타 삭제']
    }
  ];

  return (
    <div className="space-y-8">
      {/* 헤더 섹션 */}
      <div className="text-center mb-12">
        <div className="flex items-center justify-center mb-4">
          <Sparkles className={`mr-3 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`} size={32} />
          <h2 className="text-2xl font-bold">AI 컨퍼런스 영상 생성기</h2>
        </div>
        <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'} max-w-2xl mx-auto`}>
          PPT/PDF 자료를 업로드하여 AI가 자동으로 발표 대본을 생성하고, 
          자연스러운 음성과 영상으로 변환하는 통합 솔루션입니다.
        </p>
      </div>

      {/* 워크플로우 섹션 */}
      <div className={`p-8 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
        <h3 className="text-xl font-bold mb-6 text-center">워크플로우</h3>
        <div className="flex flex-col md:flex-row items-center justify-center space-y-4 md:space-y-0 md:space-x-6">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <FileText className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`} size={20} />
            </div>
            <span className="font-medium">파일 업로드</span>
          </div>
          
          <ArrowRight className={`${darkMode ? 'text-gray-500' : 'text-gray-400'}`} size={20} />
          
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-full ${darkMode ? 'bg-blue-900/30' : 'bg-blue-100'}`}>
              <Sparkles className={`${darkMode ? 'text-blue-400' : 'text-blue-600'}`} size={20} />
            </div>
            <span className="font-medium">대본 생성</span>
          </div>
          
          <ArrowRight className={`${darkMode ? 'text-gray-500' : 'text-gray-400'}`} size={20} />
          
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-full ${darkMode ? 'bg-green-900/30' : 'bg-green-100'}`}>
              <Volume2 className={`${darkMode ? 'text-green-400' : 'text-green-600'}`} size={20} />
            </div>
            <span className="font-medium">음성 생성</span>
          </div>
          
          <ArrowRight className={`${darkMode ? 'text-gray-500' : 'text-gray-400'}`} size={20} />
          
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-full ${darkMode ? 'bg-purple-900/30' : 'bg-purple-100'}`}>
              <Video className={`${darkMode ? 'text-purple-400' : 'text-purple-600'}`} size={20} />
            </div>
            <span className="font-medium">영상 생성</span>
          </div>
        </div>
      </div>

      {/* 메인 메뉴 */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2 mb-6">
          <div className={`w-1 h-6 rounded-full ${darkMode ? 'bg-blue-500' : 'bg-blue-600'}`}></div>
          <h3 className="text-xl font-bold">메인 메뉴</h3>
        </div>
        <div className="flex flex-wrap gap-8 justify-start">
          {mainMenuItems.map((item) => (
            <MenuCard
              key={item.id}
              id={item.id}
              title={item.title}
              description={item.description}
              icon={item.icon}
              color={item.color}
              features={item.features}
              darkMode={darkMode}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      </div>

      {/* 서브 메뉴 */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2 mb-6">
          <div className={`w-1 h-6 rounded-full ${darkMode ? 'bg-orange-500' : 'bg-orange-600'}`}></div>
          <h3 className="text-xl font-bold">서브 메뉴</h3>
        </div>
        <div className="flex flex-wrap gap-8 justify-start">
          {subMenuItems.map((item) => (
            <MenuCard
              key={item.id}
              id={item.id}
              title={item.title}
              description={item.description}
              icon={item.icon}
              color={item.color}
              features={item.features}
              darkMode={darkMode}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomePage;