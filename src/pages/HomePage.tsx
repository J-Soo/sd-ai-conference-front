import React from 'react';
import { FileText, Mic, Video, User, ArrowRight, Sparkles, Volume2 } from 'lucide-react';
import { PageType } from '../types';

interface HomePageProps {
  darkMode: boolean;
  onNavigate: (page: PageType) => void;
}

const HomePage: React.FC<HomePageProps> = ({ darkMode, onNavigate }) => {
  // 메인 기능 메뉴 (1열)
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
    }
  ];

  // 서브 메뉴 (2열)
  const subMenuItems = [
    {
      id: 'video-management' as PageType,
      title: '영상 관리',
      description: '대본 세그먼트별로 영상 생성 옵션을 설정하고 AI 영상을 생성합니다',
      icon: Video,
      color: 'purple',
      features: ['세그먼트 커스터마이징', '이미지 업로드', '아바타 설정', '영상 생성']
    },
    {
      id: 'avatar-management' as PageType,
      title: '아바타 관리',
      description: '영상 생성에 사용할 아바타를 등록하고 관리합니다',
      icon: User,
      color: 'orange',
      features: ['아바타 등록', '이미지 업로드', '아바타 정보 관리', '아바타 삭제']
    }
  ];

  const getColorClasses = (color: string, darkMode: boolean) => {
    const colors = {
      blue: {
        bg: darkMode ? 'bg-blue-900/20 hover:bg-blue-900/30' : 'bg-blue-50 hover:bg-blue-100',
        border: darkMode ? 'border-blue-700 hover:border-blue-600' : 'border-blue-200 hover:border-blue-300',
        icon: darkMode ? 'text-blue-400' : 'text-blue-600',
        title: darkMode ? 'text-blue-300' : 'text-blue-700',
        arrow: darkMode ? 'text-blue-400 group-hover:text-blue-300' : 'text-blue-500 group-hover:text-blue-600'
      },
      green: {
        bg: darkMode ? 'bg-green-900/20 hover:bg-green-900/30' : 'bg-green-50 hover:bg-green-100',
        border: darkMode ? 'border-green-700 hover:border-green-600' : 'border-green-200 hover:border-green-300',
        icon: darkMode ? 'text-green-400' : 'text-green-600',
        title: darkMode ? 'text-green-300' : 'text-green-700',
        arrow: darkMode ? 'text-green-400 group-hover:text-green-300' : 'text-green-500 group-hover:text-green-600'
      },
      purple: {
        bg: darkMode ? 'bg-purple-900/20 hover:bg-purple-900/30' : 'bg-purple-50 hover:bg-purple-100',
        border: darkMode ? 'border-purple-700 hover:border-purple-600' : 'border-purple-200 hover:border-purple-300',
        icon: darkMode ? 'text-purple-400' : 'text-purple-600',
        title: darkMode ? 'text-purple-300' : 'text-purple-700',
        arrow: darkMode ? 'text-purple-400 group-hover:text-purple-300' : 'text-purple-500 group-hover:text-purple-600'
      },
      orange: {
        bg: darkMode ? 'bg-orange-900/20 hover:bg-orange-900/30' : 'bg-orange-50 hover:bg-orange-100',
        border: darkMode ? 'border-orange-700 hover:border-orange-600' : 'border-orange-200 hover:border-orange-300',
        icon: darkMode ? 'text-orange-400' : 'text-orange-600',
        title: darkMode ? 'text-orange-300' : 'text-orange-700',
        arrow: darkMode ? 'text-orange-400 group-hover:text-orange-300' : 'text-orange-500 group-hover:text-orange-600'
      }
    };
    return colors[color as keyof typeof colors];
  };

  const renderMenuCard = (item: any, size: 'large' | 'small' = 'large') => {
    const colors = getColorClasses(item.color, darkMode);
    const IconComponent = item.icon;
    
    return (
      <div
        key={item.id}
        onClick={() => onNavigate(item.id)}
        className={`group cursor-pointer rounded-xl border-2 transition-all duration-300 transform hover:scale-105 hover:shadow-lg
          ${size === 'large' ? 'p-8' : 'p-6'}
          ${colors.bg} ${colors.border}`}
      >
        <div className={`flex items-start justify-between ${size === 'large' ? 'mb-6' : 'mb-4'}`}>
          <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
            <IconComponent className={colors.icon} size={size === 'large' ? 32 : 28} />
          </div>
          <ArrowRight 
            className={`transition-all duration-300 transform group-hover:translate-x-1 ${colors.arrow}`} 
            size={size === 'large' ? 24 : 20} 
          />
        </div>
        
        <h3 className={`font-bold mb-3 ${size === 'large' ? 'text-2xl' : 'text-xl'} ${colors.title}`}>
          {item.title}
        </h3>
        
        <p className={`mb-6 leading-relaxed ${size === 'large' ? 'text-base' : 'text-sm'} ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          {item.description}
        </p>
        
        <div className="space-y-2">
          <h4 className={`font-semibold text-sm uppercase tracking-wide ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            주요 기능
          </h4>
          <ul className="space-y-1">
            {item.features.map((feature: string, index: number) => (
              <li key={index} className={`flex items-center ${size === 'large' ? 'text-sm' : 'text-xs'} ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                <div className={`w-1.5 h-1.5 rounded-full mr-3 ${colors.icon.replace('text-', 'bg-')}`}></div>
                {feature}
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  };

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

      {/* 메인 기능 메뉴 (1열) */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2 mb-6">
          <div className={`w-1 h-6 rounded-full ${darkMode ? 'bg-blue-500' : 'bg-blue-600'}`}></div>
          <h3 className="text-xl font-bold">메인 기능</h3>
        </div>
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {mainMenuItems.map((item) => renderMenuCard(item, 'large'))}
        </div>
      </div>

      {/* 서브 메뉴 (2열) */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2 mb-6">
          <div className={`w-1 h-6 rounded-full ${darkMode ? 'bg-purple-500' : 'bg-purple-600'}`}></div>
          <h3 className="text-xl font-bold">관리 도구</h3>
        </div>
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {subMenuItems.map((item) => renderMenuCard(item, 'small'))}
        </div>
      </div>

      {/* 워크플로우 섹션 */}
      <div className={`mt-16 p-8 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
        <h3 className="text-xl font-bold mb-6 text-center">워크플로우</h3>
        <div className="flex flex-col md:flex-row items-center justify-center space-y-4 md:space-y-0 md:space-x-6">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-full ${darkMode ? 'bg-blue-900/30' : 'bg-blue-100'}`}>
              <FileText className={`${darkMode ? 'text-blue-400' : 'text-blue-600'}`} size={20} />
            </div>
            <span className="font-medium">파일 업로드</span>
          </div>
          
          <ArrowRight className={`${darkMode ? 'text-gray-500' : 'text-gray-400'}`} size={20} />
          
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-full ${darkMode ? 'bg-purple-900/30' : 'bg-purple-100'}`}>
              <Sparkles className={`${darkMode ? 'text-purple-400' : 'text-purple-600'}`} size={20} />
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
    </div>
  );
};

export default HomePage;