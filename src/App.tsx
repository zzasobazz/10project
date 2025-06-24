import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { AuthPage } from './components/AuthPage';
import { Header } from './components/Header';
import { KanbanBoard } from './components/KanbanBoard';
import { CalendarView } from './components/CalendarView';
import { UserManagement } from './components/UserManagement';
import { Analytics } from './components/Analytics';
import { ProfileModal } from './components/ProfileModal';
import { TaskModal } from './components/TaskModal';
import { ManualPage } from './components/ManualPage';
import { OnboardingTour, useOnboarding } from './components/OnboardingTour';

function AppContent() {
  const { isAuthenticated, setLastView, getLastView, currentUser } = useApp();
  const [currentView, setCurrentView] = useState<'board' | 'calendar' | 'users' | 'analytics' | 'profile' | 'manual'>('board');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { isOnboardingOpen, completeOnboarding, resetOnboarding } = useOnboarding();

  // Восстановление последнего представления при загрузке
  useEffect(() => {
    if (isAuthenticated) {
      const lastView = getLastView();
      if (lastView && ['board', 'calendar', 'users', 'analytics', 'profile', 'manual'].includes(lastView)) {
        setCurrentView(lastView as any);
      }
    }
  }, [isAuthenticated, getLastView]);

  // Автоматический запуск онбординга
  useEffect(() => {
    if (isAuthenticated && currentUser) {
      // Для демо аккаунтов всегда запускаем онбординг
      if (currentUser.username === 'admin123' || currentUser.username === 'user1234') {
        setTimeout(() => {
          resetOnboarding();
        }, 500);
      } else {
        // Для новых пользователей запускаем онбординг при первом входе
        const hasSeenOnboarding = localStorage.getItem('planify-onboarding-seen');
        if (!hasSeenOnboarding) {
          setTimeout(() => {
            resetOnboarding();
          }, 500);
        }
      }
    }
  }, [isAuthenticated, currentUser, resetOnboarding]);

  // Сохранение текущего представления
  const handleViewChange = (view: 'board' | 'calendar' | 'users' | 'analytics' | 'profile' | 'manual') => {
    setCurrentView(view);
    setLastView(view);
  };

  // Разные шаги онбординга для администраторов и пользователей
  const getOnboardingSteps = () => {
    const baseSteps = [
      {
        id: 'welcome',
        title: 'Добро пожаловать в Planify!',
        description: 'Это профессиональное приложение для управления задачами. Давайте познакомимся с основными функциями.',
        target: 'body',
        position: 'center' as const,
      },
      {
        id: 'create-task',
        title: 'Создание задач',
        description: 'Нажмите эту кнопку, чтобы создать новую задачу. Вы можете добавить описание, установить приоритет и назначить исполнителей.',
        target: '[data-tour="create-task"]',
        position: 'bottom' as const,
        action: () => setShowCreateModal(true),
      },
      {
        id: 'task-modal',
        title: 'Форма создания задачи',
        description: 'Здесь вы можете заполнить все детали задачи: название, описание, приоритет, назначить исполнителей и установить срок выполнения.',
        target: '.fixed.inset-0.z-50',
        position: 'center' as const,
        closeModals: true,
      },
      {
        id: 'board-selector',
        title: 'Переключение досок',
        description: 'Здесь вы можете переключаться между досками, создавать новые или делиться ссылками с командой.',
        target: '[data-tour="board-selector"]',
        position: 'bottom' as const,
      },
      {
        id: 'navigation',
        title: 'Навигация',
        description: 'Используйте эти вкладки для перехода между разными разделами: доска, календарь, аналитика и управление пользователями.',
        target: '[data-tour="navigation"]',
        position: 'bottom' as const,
      },
      {
        id: 'kanban-columns',
        title: 'Kanban доска',
        description: 'Перетаскивайте задачи между колонками для изменения их статуса. Задачи автоматически сортируются по приоритету.',
        target: '[data-tour="kanban-columns"]',
        position: 'top' as const,
      },
      {
        id: 'notifications',
        title: 'Уведомления',
        description: 'Здесь отображаются уведомления о новых задачах, изменениях и других важных событиях.',
        target: '[data-tour="notifications"]',
        position: 'bottom' as const,
      },
      {
        id: 'profile',
        title: 'Профиль пользователя',
        description: 'Нажмите на аватар, чтобы открыть настройки профиля, просмотреть статистику или выйти из системы.',
        target: '[data-tour="profile"]',
        position: 'bottom' as const,
      },
    ];

    // Дополнительные шаги для администраторов
    if (currentUser?.role === 'admin') {
      return [
        ...baseSteps,
        {
          id: 'admin-features',
          title: 'Функции администратора',
          description: 'Как администратор, вы имеете доступ к дополнительным функциям: управление пользователями, редактирование досок и добавление комментариев к задачам.',
          target: 'body',
          position: 'center' as const,
        },
      ];
    } else {
      // Дополнительные шаги для обычных пользователей
      return [
        ...baseSteps,
        {
          id: 'user-features',
          title: 'Возможности пользователя',
          description: 'Как пользователь, вы можете создавать и редактировать задачи, просматривать календарь и аналитику, а также управлять своим профилем.',
          target: 'body',
          position: 'center' as const,
        },
      ];
    }
  };

  if (!isAuthenticated) {
    return <AuthPage />;
  }

  if (currentView === 'manual') {
    return <ManualPage onClose={() => handleViewChange('board')} />;
  }

  const renderView = () => {
    switch (currentView) {
      case 'board':
        return <KanbanBoard />;
      case 'calendar':
        return <CalendarView />;
      case 'users':
        return <UserManagement />;
      case 'analytics':
        return <Analytics />;
      case 'profile':
        return <div className="p-6"><ProfileModal isOpen={true} onClose={() => handleViewChange('board')} /></div>;
      default:
        return <KanbanBoard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        currentView={currentView}
        onViewChange={handleViewChange}
        onCreateTask={() => setShowCreateModal(true)}
      />
      
      <main className="h-[calc(100vh-120px)]" data-tour="kanban-columns">
        {renderView()}
      </main>

      <TaskModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />

      {/* Онбординг тур */}
      <OnboardingTour
        isOpen={isOnboardingOpen}
        onClose={completeOnboarding}
        steps={getOnboardingSteps()}
      />
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;