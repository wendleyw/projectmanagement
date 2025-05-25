import React from 'react';
import { BookOpen } from 'lucide-react';
import { useTutorial } from '../../hooks/useTutorial';

/**
 * Botu00e3o para abrir o tutorial de permissu00f5es
 * Pode ser colocado em qualquer lugar da aplicau00e7u00e3o
 */
const TutorialButton: React.FC = () => {
  const { openPermissionsTutorial } = useTutorial();

  return (
    <button
      onClick={openPermissionsTutorial}
      className="flex items-center px-4 py-2 bg-indigo-100 text-indigo-700 rounded-md hover:bg-indigo-200 transition-colors"
      aria-label="Abrir tutorial de permissu00f5es"
    >
      <BookOpen className="w-4 h-4 mr-2" />
      <span className="text-sm font-medium">Tutorial de Permissu00f5es</span>
    </button>
  );
};

export default TutorialButton;
