import { useState, useCallback } from 'react';

export interface TutorialStep {
  id: string;
  title: string;
  description?: string;
  content?: string; // Step content for display in the tutorial
  target?: string; // CSS selector of the target element
  position?: 'top' | 'right' | 'bottom' | 'left';
  action?: string;
  completed?: boolean;
  image?: string; // URL of the optional image
}

/**
 * Custom hook to manage tutorials in the application
 * Allows controlling the display of interactive tutorials
 */
export const useTutorial = () => {
  const [showPermissionsTutorial, setShowPermissionsTutorial] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [tutorialSteps, setTutorialSteps] = useState<TutorialStep[]>([]);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [tutorialProgress, setTutorialProgress] = useState(0);
  
  // Check if it's the first time the user accesses the application
  const checkFirstTimeUser = useCallback(() => {
    const isFirstTime = !localStorage.getItem('permissionsTutorialCompleted');
    return isFirstTime;
  }, []);
  
  // Show the permissions tutorial automatically for new users
  const showTutorialForNewUsers = useCallback(() => {
    if (checkFirstTimeUser()) {
      setShowPermissionsTutorial(true);
      return true;
    }
    return false;
  }, [checkFirstTimeUser]);
  
  // Open the permissions tutorial manually
  const openPermissionsTutorial = useCallback(() => {
    setShowPermissionsTutorial(true);
  }, []);
  
  // Close the permissions tutorial
  const closePermissionsTutorial = useCallback(() => {
    setShowPermissionsTutorial(false);
  }, []);
  
  // Mark a tutorial as completed
  const markTutorialCompleted = useCallback((tutorialName: string) => {
    localStorage.setItem(`${tutorialName}Completed`, 'true');
  }, []);
  
  // Verificar se um tutorial foi concluído
  const isTutorialCompleted = useCallback((tutorialName: string) => {
    return localStorage.getItem(`${tutorialName}Completed`) === 'true';
  }, []);
  
  // Resetar o status de um tutorial (para testes)
  const resetTutorialStatus = useCallback((tutorialName: string) => {
    localStorage.removeItem(`${tutorialName}Completed`);
  }, []);
  
  // Definir os passos do tutorial
  const setTutorialContent = useCallback((steps: TutorialStep[]) => {
    setTutorialSteps(steps);
    // Calcular o progresso inicial
    setCompletedSteps(prev => {
      const completed = steps.filter(step => prev.includes(step.id)).length;
      setTutorialProgress(steps.length > 0 ? (completed / steps.length) * 100 : 0);
      return prev;
    });
  }, []); // Removemos a dependência de completedSteps para evitar loops
  
  // Avançar para o próximo passo do tutorial
  const nextTutorialStep = useCallback(() => {
    if (currentStepIndex < tutorialSteps.length - 1) {
      // Marcar o passo atual como concluído
      const currentStep = tutorialSteps[currentStepIndex];
      if (currentStep && !completedSteps.includes(currentStep.id)) {
        setCompletedSteps(prev => [...prev, currentStep.id]);
      }
      
      // Avançar para o próximo passo
      setCurrentStepIndex(currentStepIndex + 1);
      
      // Atualizar o progresso
      const newProgress = tutorialSteps.length > 0 
        ? ((completedSteps.length + 1) / tutorialSteps.length) * 100 
        : 0;
      setTutorialProgress(newProgress);
    } else if (currentStepIndex === tutorialSteps.length - 1) {
      // Último passo, marcar como concluído e fechar o tutorial
      const currentStep = tutorialSteps[currentStepIndex];
      if (currentStep && !completedSteps.includes(currentStep.id)) {
        setCompletedSteps(prev => [...prev, currentStep.id]);
      }
      
      // Marcar o tutorial de permissões como concluído
      markTutorialCompleted('permissions');
      
      // Fechar o tutorial
      setShowPermissionsTutorial(false);
      
      // Atualizar o progresso para 100%
      setTutorialProgress(100);
    }
  }, [currentStepIndex, tutorialSteps, completedSteps, markTutorialCompleted]);
  
  // Voltar para o passo anterior do tutorial
  const previousTutorialStep = useCallback(() => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  }, [currentStepIndex]);
  
  // Ir para um passo específico do tutorial
  const goToTutorialStep = useCallback((stepIndex: number) => {
    if (stepIndex >= 0 && stepIndex < tutorialSteps.length) {
      setCurrentStepIndex(stepIndex);
    }
  }, [tutorialSteps]);
  
  // Obter o passo atual do tutorial
  const getCurrentTutorialStep = useCallback(() => {
    return tutorialSteps[currentStepIndex] || null;
  }, [tutorialSteps, currentStepIndex]);
  
  // Verificar o progresso do tutorial
  const getTutorialProgress = useCallback(() => {
    return tutorialProgress;
  }, [tutorialProgress]);
  
  return {
    showPermissionsTutorial,
    openPermissionsTutorial,
    closePermissionsTutorial,
    showTutorialForNewUsers,
    checkFirstTimeUser,
    markTutorialCompleted,
    isTutorialCompleted,
    resetTutorialStatus,
    setTutorialContent,
    nextTutorialStep,
    previousTutorialStep,
    goToTutorialStep,
    getCurrentTutorialStep,
    getTutorialProgress,
    currentStepIndex,
    completedSteps
  };
};
