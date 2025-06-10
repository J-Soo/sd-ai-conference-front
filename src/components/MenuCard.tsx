import React from 'react';
import { ArrowRight } from 'lucide-react';
import { PageType } from '../types';

interface MenuCardProps {
  id: PageType;
  title: string;
  description: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  color: string;
  features: string[];
  darkMode: boolean;
  onNavigate: (page: PageType) => void;
}

const MenuCard: React.FC<MenuCardProps> = ({
  id,
  title,
  description,
  icon: IconComponent,
  color,
  features,
  darkMode,
  onNavigate
}) => {
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

  const colors = getColorClasses(color, darkMode);

  return (
    <div
      onClick={() => onNavigate(id)}
      className={`group cursor-pointer rounded-xl border-2 transition-all duration-300 transform hover:scale-105 hover:shadow-lg
        w-96 h-[470px] p-10 pb-20 flex flex-col mb-6
        ${colors.bg} ${colors.border}`}
    >
      <div className="flex items-start justify-between mb-8">
        <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
          <IconComponent className={colors.icon} size={36} />
        </div>
        <ArrowRight 
          className={`transition-all duration-300 transform group-hover:translate-x-1 ${colors.arrow}`} 
          size={28} 
        />
      </div>
      
      <h3 className={`font-bold mb-4 text-2xl ${colors.title}`}>
        {title}
      </h3>
      
      <p className={`mb-8 leading-relaxed text-lg flex-1 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
        {description}
      </p>
      
      <div className="mt-auto mb-6">
        <h4 className={`font-semibold text-sm uppercase tracking-wide mb-3 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          주요 기능
        </h4>
        <ul className="space-y-2">
          {features.map((feature: string, index: number) => (
            <li key={index} className={`flex items-center text-base ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              <div className={`w-2 h-2 rounded-full mr-3 ${colors.icon.replace('text-', 'bg-')}`}></div>
              {feature}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default MenuCard;