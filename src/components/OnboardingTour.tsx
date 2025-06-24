import React, { useState, useEffect } from 'react';
import { X, ArrowRight, ArrowLeft, CheckCircle, RotateCcw } from 'lucide-react';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  target: string;
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
  action?: () => void;
  closeModals?: boolean;
}

interface OnboardingTourProps {
  isOpen: boolean;
  onClose: () => void;
  steps: OnboardingStep[];
}

export function OnboardingTour({ isOpen, onClose, steps }: OnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [popupPosition, setPopupPosition] = useState({ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' });

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (isOpen && steps[currentStep]) {
      const step = steps[currentStep];
      
      // Закрываем модальные окна если требуется
      if (step.closeModals) {
        // Закрываем все модальные окна
        const modals = document.querySelectorAll('[role="dialog"], .fixed.inset-0');
        modals.forEach(modal => {
          const closeButton = modal.querySelector('button[aria-label="Close"], button:has(svg)');
          if (closeButton && modal.classList.contains('z-50')) {
            (closeButton as HTMLElement).click();
          }
        });
      }

      const element = document.querySelector(step.target) as HTMLElement;
      setTargetElement(element);
      
      if (element) {
        // Прокручиваем к элементу
        element.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
        
        // Добавляем подсветку с правильными стилями
        element.style.position = 'relative';
        element.style.zIndex = '1001';
        element.style.boxShadow = '0 0 0 3px rgba(182, 194, 252, 0.6), 0 0 20px rgba(182, 194, 252, 0.3)';
        element.style.borderRadius = '8px';
        element.style.backgroundColor = element.style.backgroundColor || 'rgba(182, 194, 252, 0.1)';
        element.style.transition = 'all 0.3s ease';
        
        // Блокируем клики на другие элементы
        const allInteractiveElements = document.querySelectorAll('button, a, [role="button"], input, select, textarea');
        allInteractiveElements.forEach(btn => {
          if (!element.contains(btn) && !btn.closest('.onboarding-popup')) {
            (btn as HTMLElement).style.pointerEvents = 'none';
            (btn as HTMLElement).style.opacity = '0.5';
            (btn as HTMLElement).style.filter = 'grayscale(50%)';
          }
        });
        
        // Вычисляем позицию попапа
        setTimeout(() => {
          const rect = element.getBoundingClientRect();
          const viewportWidth = window.innerWidth;
          const viewportHeight = window.innerHeight;
          const popupWidth = isMobile ? Math.min(350, viewportWidth - 32) : 400;
          const popupHeight = 300; // Примерная высота попапа
          
          let top = '50%';
          let left = '50%';
          let transform = 'translate(-50%, -50%)';
          
          if (!isMobile && step.position !== 'center') {
            switch (step.position) {
              case 'top':
                top = `${Math.max(20, rect.top - popupHeight - 20)}px`;
                left = `${Math.min(Math.max(20, rect.left + rect.width / 2 - popupWidth / 2), viewportWidth - popupWidth - 20)}px`;
                transform = 'none';
                break;
              case 'bottom':
                top = `${Math.min(viewportHeight - popupHeight - 20, rect.bottom + 20)}px`;
                left = `${Math.min(Math.max(20, rect.left + rect.width / 2 - popupWidth / 2), viewportWidth - popupWidth - 20)}px`;
                transform = 'none';
                break;
              case 'left':
                top = `${Math.min(Math.max(20, rect.top + rect.height / 2 - popupHeight / 2), viewportHeight - popupHeight - 20)}px`;
                left = `${Math.max(20, rect.left - popupWidth - 20)}px`;
                transform = 'none';
                break;
              case 'right':
                top = `${Math.min(Math.max(20, rect.top + rect.height / 2 - popupHeight / 2), viewportHeight - popupHeight - 20)}px`;
                left = `${Math.min(viewportWidth - popupWidth - 20, rect.right + 20)}px`;
                transform = 'none';
                break;
            }
          }
          
          setPopupPosition({ top, left, transform });
        }, 100);
      }
    }

    return () => {
      if (targetElement) {
        targetElement.style.position = '';
        targetElement.style.zIndex = '';
        targetElement.style.boxShadow = '';
        targetElement.style.borderRadius = '';
        targetElement.style.backgroundColor = '';
        targetElement.style.transition = '';
        
        // Восстанавливаем клики на все элементы
        const allInteractiveElements = document.querySelectorAll('button, a, [role="button"], input, select, textarea');
        allInteractiveElements.forEach(btn => {
          (btn as HTMLElement).style.pointerEvents = '';
          (btn as HTMLElement).style.opacity = '';
          (btn as HTMLElement).style.filter = '';
        });
      }
    };
  }, [currentStep, isOpen, steps, targetElement, isMobile]);

  const nextStep = () => {
    if (steps[currentStep]?.action) {
      steps[currentStep].action!();
    }
    
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleClose();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleClose = () => {
    // Восстанавливаем все стили
    if (targetElement) {
      targetElement.style.position = '';
      targetElement.style.zIndex = '';
      targetElement.style.boxShadow = '';
      targetElement.style.borderRadius = '';
      targetElement.style.backgroundColor = '';
      targetElement.style.transition = '';
      
      const allInteractiveElements = document.querySelectorAll('button, a, [role="button"], input, select, textarea');
      allInteractiveElements.forEach(btn => {
        (btn as HTMLElement).style.pointerEvents = '';
        (btn as HTMLElement).style.opacity = '';
        (btn as HTMLElement).style.filter = '';
      });
    }
    
    onClose();
  };

  if (!isOpen || !steps[currentStep]) return null;

  const step = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-40 z-1000" />
      
      {/* Tour popup */}
      <div 
        className="fixed z-1002 onboarding-popup"
        style={{
          top: popupPosition.top,
          left: popupPosition.left,
          transform: popupPosition.transform,
          maxWidth: isMobile ? '90vw' : '400px',
          width: isMobile ? '90vw' : '400px',
          maxHeight: '90vh'
        }}
      >
        <div className="bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden">
          {/* Header */}
          <div 
            className="p-4 text-white relative"
            style={{ background: 'linear-gradient(135deg, #b6c2fc 0%, #afd6fa 100%)' }}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold uppercase">{step.title}</h3>
                <div className="text-sm opacity-90 uppercase">
                  ШАГ {currentStep + 1} ИЗ {steps.length}
                </div>
              </div>
              <button
                onClick={handleClose}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Progress bar */}
            <div className="mt-3 w-full bg-white/20 rounded-full h-2">
              <div 
                className="bg-white h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <p className="text-gray-700 leading-relaxed mb-6">
              {step.description}
            </p>

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {currentStep > 0 && (
                  <button
                    onClick={prevStep}
                    className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span className="uppercase">НАЗАД</span>
                  </button>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={handleClose}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors uppercase"
                >
                  ЗАВЕРШИТЬ
                </button>
                
                <button
                  onClick={nextStep}
                  className="flex items-center space-x-2 px-4 py-2 text-white rounded-lg transition-colors uppercase"
                  style={{ backgroundColor: '#b6c2fc' }}
                >
                  {currentStep === steps.length - 1 ? (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      <span>ЗАВЕРШИТЬ</span>
                    </>
                  ) : (
                    <>
                      <span>ДАЛЕЕ</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// Хук для управления онбордингом
export function useOnboarding() {
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);

  useEffect(() => {
    const seen = localStorage.getItem('planify-onboarding-seen');
    setHasSeenOnboarding(!!seen);
  }, []);

  const startOnboarding = () => {
    setIsOnboardingOpen(true);
  };

  const completeOnboarding = () => {
    setIsOnboardingOpen(false);
    setHasSeenOnboarding(true);
    localStorage.setItem('planify-onboarding-seen', 'true');
  };

  const resetOnboarding = () => {
    localStorage.removeItem('planify-onboarding-seen');
    setHasSeenOnboarding(false);
    setIsOnboardingOpen(true);
  };

  return {
    isOnboardingOpen,
    hasSeenOnboarding,
    startOnboarding,
    completeOnboarding,
    resetOnboarding,
  };
}