import React from 'react';
import { FileText, Mic, ArrowRight, Sparkles, Volume2 } from 'lucide-react';
import { PageType } from '../types';

interface HomePageProps {
  darkMode: boolean;
  onNavigate: (page: PageType) => void;
}

const HomePage: React.FC<HomePageProps> = ({ darkMode, onNavigate }) => {
  const menuItems = [
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
      }
    };
    return colors[color as keyof typeof colors];
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
          자연스러운 음성으로 변환하는 통합 솔루션입니다.
        </p>
      </div>

      {/* 메뉴 카드들 */}
      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {menuItems.map((item) => {
          const colors = getColorClasses(item.color, darkMode);
          const IconComponent = item.icon;
          
          return (
            <div
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`group cursor-pointer rounded-xl border-2 p-8 transition-all duration-300 transform hover:scale-105 hover:shadow-lg
                ${colors.bg} ${colors.border}`}
            >
              <div className="flex items-start justify-between mb-6">
                <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
                  <IconComponent className={colors.icon} size={32} />
                </div>
                <ArrowRight 
                  className={`transition-all duration-300 transform group-hover:translate-x-1 ${colors.arrow}`} 
                  size={24} 
                />
              </div>
              
              <h3 className={`text-2xl font-bold mb-3 ${colors.title}`}>
                {item.title}
              </h3>
              
              <p className={`mb-6 leading-relaxed ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                {item.description}
              </p>
              
              <div className="space-y-2">
                <h4 className={`font-semibold text-sm uppercase tracking-wide ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  주요 기능
                </h4>
                <ul className="space-y-1">
                  {item.features.map((feature, index) => (
                    <li key={index} className={`flex items-center text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      <div className={`w-1.5 h-1.5 rounded-full mr-3 ${colors.icon.replace('text-', 'bg-')}`}></div>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
      </div>

      {/* 워크플로우 섹션 */}
      <div className={`mt-16 p-8 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
        <h3 className="text-xl font-bold mb-6 text-center">워크플로우</h3>
        <div className="flex flex-col md:flex-row items-center justify-center space-y-4 md:space-y-0 md:space-x-8">
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
        </div>
      </div>
    </div>
  );
};

export default HomePage;