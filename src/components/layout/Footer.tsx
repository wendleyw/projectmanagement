import React from 'react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer
      className={`
        fixed bottom-0 right-0 z-30 h-10 bg-white border-t border-gray-200
        transition-all duration-300 ease-in-out flex items-center
        w-full left-0 md:left-20 lg:left-64
      `}
    >
      <div className="w-full px-4 flex items-center justify-between">
        <div className="text-xs text-gray-500">
          &copy; {currentYear} SGP System. All rights reserved.
        </div>
        <div className="text-xs text-gray-500">
          <a href="#" className="hover:text-blue-600 transition-colors">
            Privacy Policy
          </a>
          <span className="mx-2">|</span>
          <a href="#" className="hover:text-blue-600 transition-colors">
            Terms of Service
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;