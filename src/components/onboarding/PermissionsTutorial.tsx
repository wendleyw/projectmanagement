import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Check, Shield } from 'lucide-react';
import { useTutorial } from '../../hooks/useTutorial';
import { useIsAdmin } from '../../store/authStore';

// Interface local para os passos do tutorial
interface TutorialStepLocal {
  id: string;
  title: string;
  content: string;
  image?: string;
}

/**
 * Tutorial interativo para o sistema de permissu00f5es
 * Exibido automaticamente para novos usuu00e1rios ou quando solicitado
 */
const PermissionsTutorial: React.FC<{ onClose: () => void; autoStart?: boolean }> = ({ 
  onClose,
  autoStart = false
}) => {
  const [isVisible, setIsVisible] = useState(autoStart);
  const [currentStep, setCurrentStep] = useState(0);
  const [completed, setCompleted] = useState(false);
  const isAdmin = useIsAdmin();
  
  // Usar o hook useTutorial
  const { 
    openPermissionsTutorial, 
    closePermissionsTutorial,
    setTutorialContent,
    nextTutorialStep,
    previousTutorialStep
  } = useTutorial();
  
  const tutorialSteps: TutorialStepLocal[] = [
    {
      id: 'welcome',
      title: 'Bem-vindo ao Sistema de Permissu00f5es',
      content: 'Este tutorial ru00e1pido vai te ajudar a entender como o sistema de permissu00f5es funciona e como ele afeta o que vocu00ea pode ver e fazer na aplicau00e7u00e3o.'
    },
    {
      id: 'user-roles',
      title: 'Funu00e7u00f5es de Usuu00e1rio',
      content: 'Existem tru00eas funu00e7u00f5es principais: Administrador (acesso total), Gerente (gerencia projetos atribuu00eddos) e Membro (acesso limitado ao que foi atribuu00eddo).'
    },
    {
      id: 'protected-resources',
      title: 'Recursos Protegidos',
      content: 'O sistema protege quatro tipos principais de recursos: Projetos, Tarefas, Calendu00e1rio e Tracking. Seu acesso a cada um deles depende da sua funu00e7u00e3o e permissu00f5es especu00edficas.'
    },
    {
      id: 'project-permissions',
      title: 'Permissu00f5es de Projetos',
      content: 'Vocu00ea su00f3 pode ver e editar projetos aos quais tem acesso. Gerentes podem gerenciar membros de seus projetos, enquanto membros comuns podem apenas visualizar e trabalhar em tarefas atribuu00eddas.'
    },
    {
      id: 'task-permissions',
      title: 'Permissu00f5es de Tarefas',
      content: 'Vocu00ea su00f3 pode ver e editar tarefas atribuu00eddas a vocu00ea ou de projetos que vocu00ea gerencia. Isso garante que cada pessoa trabalhe apenas no que lhe foi designado.'
    },
    {
      id: 'calendar-tracking',
      title: 'Calendu00e1rio e Tracking',
      content: 'O acesso ao calendu00e1rio e sistema de tracking u00e9 controlado separadamente. Mesmo que vocu00ea tenha acesso a projetos e tarefas, pode nu00e3o ter permissu00e3o para ver eventos no calendu00e1rio ou registros de tempo.'
    },
    {
      id: 'help-available',
      title: 'Ajuda Disponível',
      content: `Você pode acessar a ajuda sobre permissões a qualquer momento clicando no botão de ajuda no canto inferior direito da tela. ${isAdmin ? 'Como administrador, você também pode acessar a documentação completa e a página de demonstração.' : ''}`
    }
  ];

  // Inicializar o tutorial quando o componente for montado - apenas uma vez
  useEffect(() => {
    if (autoStart) {
      // Converter os passos do formato local para o formato do hook
      const formattedSteps = tutorialSteps.map(step => ({
        id: step.id,
        title: step.title,
        content: step.content,
        description: step.content,
        image: step.image
      }));
      
      // Configura o conteu00fado apenas uma vez
      setTutorialContent(formattedSteps);
      
      // Abre o tutorial apenas se ainda nu00e3o estiver visiu00edvel
      if (!isVisible) {
        openPermissionsTutorial();
      }
    }
  // Importante: removemos 'tutorialSteps' e outras dependu00eancias que mudam a cada renderizau00e7u00e3o
  // Usamos apenas [] para garantir que esse efeito rode apenas uma vez na montagem
  // Como tutorialSteps u00e9 definido no componente, ele seria recriado a cada renderizau00e7u00e3o
  }, []);
  
  // Avançar para o próximo passo
  const nextStep = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
      nextTutorialStep();
    } else {
      // Concluir o tutorial
      setCompleted(true);
      
      // Marcar o tutorial como concluído
      localStorage.setItem('permissionsTutorialCompleted', 'true');
      
      // Fechar o tutorial após 3 segundos
      setTimeout(() => {
        setIsVisible(false);
        closePermissionsTutorial();
        onClose();
      }, 3000);
    }
  };

  // Voltar para o passo anterior
  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      previousTutorialStep();
    }
  };

  // Fechar o tutorial
  const closeTutorial = () => {
    setIsVisible(false);
    closePermissionsTutorial();
    onClose();
  };

  // Verificar se o tutorial foi concluído anteriormente - apenas uma vez na montagem
  useEffect(() => {
    const tutorialCompleted = localStorage.getItem('permissionsTutorialCompleted') === 'true';
    // Se o tutorial já foi concluído, não exibi-lo novamente
    if (autoStart && tutorialCompleted) {
      setIsVisible(false);
      // Chamar onClose para notificar o componente pai
      onClose();
    }
  }, []); // Removemos a dependência autoStart para evitar re-execuções desnecessárias

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 overflow-hidden">
        {/* Cabeu00e7alho */}
        <div className="bg-indigo-600 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <Shield className="w-5 h-5 mr-2" />
            <h2 className="text-lg font-medium">Tutorial de Permissu00f5es</h2>
          </div>
          <button 
            onClick={closeTutorial}
            className="text-white hover:text-indigo-100"
            aria-label="Fechar tutorial"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Conteu00fado */}
        {completed ? (
          <div className="p-6 text-center">
            <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <Check className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Tutorial Concluu00eddo!</h3>
            <p className="text-gray-600 mb-4">
              Agora vocu00ea estu00e1 pronto para usar o sistema de permissu00f5es. Lembre-se que vocu00ea pode acessar a ajuda a qualquer momento.
            </p>
          </div>
        ) : (
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {tutorialSteps[currentStep].title}
            </h3>
            <p className="text-gray-600 mb-6">
              {tutorialSteps[currentStep].content}
            </p>

            {/* Barra de progresso */}
            <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
              <div 
                className="bg-indigo-600 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${((currentStep + 1) / tutorialSteps.length) * 100}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Botu00f5es de navegau00e7u00e3o */}
        {!completed && (
          <div className="px-6 py-4 bg-gray-50 flex justify-between">
            <button
              onClick={prevStep}
              disabled={currentStep === 0}
              className={`flex items-center ${currentStep === 0 ? 'text-gray-400 cursor-not-allowed' : 'text-indigo-600 hover:text-indigo-800'}`}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Anterior
            </button>
            <button
              onClick={nextStep}
              className="flex items-center text-indigo-600 hover:text-indigo-800 font-medium"
            >
              {currentStep < tutorialSteps.length - 1 ? 'Pru00f3ximo' : 'Concluir'}
              <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PermissionsTutorial;
