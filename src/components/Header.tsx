import React from 'react';
import { FileText } from 'lucide-react';

interface HeaderProps {
  darkMode: boolean;
}

const Header: React.FC<HeaderProps> = ({ darkMode }) => {
  return (
    <header className={`py-4 ${darkMode ? 'bg-gray-800' : 'bg-white shadow-sm'}`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center">
          <div className="flex items-center space-x-2">
            <FileText className={`${darkMode ? 'text-blue-400' : 'text-blue-600'}`} size={24} />
            <span className="text-xl font-semibold">SD AI Conference</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;