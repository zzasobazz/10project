import React, { useState, useEffect } from 'react';
import {
  FileText,
  Calendar,
  Users,
  LogOut,
  Bell,
  Plus,
  LayoutGrid,
  ChevronDown,
  Folder,
  FolderPlus,
  BarChart3,
  Trash2,
  Share2,
  User as UserIcon,
  Edit,
  Undo,
  Redo,
  Book,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { BoardModal } from './BoardModal';
import { ProfileModal } from './ProfileModal';
import { NotificationPanel } from './NotificationPanel';

interface HeaderProps {
  currentView: 'board' | 'calendar' | 'users' | 'analytics' | 'profile' | 'manual';
  onViewChange: (view: 'board' | 'calendar' | 'users' | 'analytics' | 'profile' | 'manual') => void;
  onCreateTask: () => void;
}

export function Header({ currentView, onViewChange, onCreateTask }: HeaderProps) {
  const { 
    currentUser, 
    logout, 
    boards, 
    currentBoardId, 
    setCurrentBoard, 
    getCurrentBoardTasks, 
    deleteBoard, 
    generateBoardLink, 
    notifications, 
    updateBoard, 
    undoLastAction, 
    redoLastAction, 
    canUndo, 
    canRedo 
  } = useApp();
  
  const [showBoardDropdown, setShowBoardDropdown] = useState(false);
  const [showBoardModal, setShowBoardModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [editingBoardId, setEditingBoardId] = useState<string | null>(null);
  const [editingBoardName, setEditingBoardName] = useState('');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Закрытие выпадающих меню при клике вне их
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      
      // Закрываем выпадающее меню досок
      if (showBoardDropdown && !target.closest('.board-dropdown-container')) {
        setShowBoardDropdown(false);
      }
      
      // Закрываем панель уведомлений
      if (showNotifications && !target.closest('.notification-panel-container')) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showBoardDropdown, showNotifications]);

  // Закрытие других панелей при открытии новой (мобильная версия)
  useEffect(() => {
    if (isMobile) {
      if (showBoardDropdown) {
        setShowNotifications(false);
        setShowProfileModal(false);
      }
      if (showNotifications) {
        setShowBoardDropdown(false);
        setShowProfileModal(false);
      }
      if (showProfileModal) {
        setShowBoardDropdown(false);
        setShowNotifications(false);
      }
    }
  }, [showBoardDropdown, showNotifications, showProfileModal, isMobile]);

  const tasks = getCurrentBoardTasks();
  const activeTasks = tasks.filter(task => task.status !== 'completed').length;
  const currentBoard = boards.find(board => board.id === currentBoardId);

  // Фильтрация досок для текущего пользователя
  const userBoards = boards.filter(board => {
    return currentUser?.boardIds.includes(board.id);
  });

  // Уведомления для текущего пользователя
  const userNotifications = notifications.filter(n => n.userId === currentUser?.id);
  const unreadNotifications = userNotifications.filter(n => !n.isRead).length;

  const handleBoardChange = (boardId: string) => {
    setCurrentBoard(boardId);
    setShowBoardDropdown(false);
  };

  const handleDeleteBoard = (boardId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const board = boards.find(b => b.id === boardId);
    if (!board) return;
    
    if (window.confirm(`Вы уверены, что хотите удалить доску "${board.name}"?`)) {
      deleteBoard(boardId);
    }
  };

  const handleShareBoard = (boardId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const link = generateBoardLink(boardId);
    navigator.clipboard.writeText(link).then(() => {
      alert('Ссылка на доску скопирована в буфер обмена');
    }).catch(() => {
      prompt('Скопируйте ссылку на доску:', link);
    });
  };

  const handleEditBoard = (boardId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const board = boards.find(b => b.id === boardId);
    if (!board) return;
    
    setEditingBoardId(boardId);
    setEditingBoardName(board.name);
  };

  const handleSaveBoardName = (boardId: string) => {
    if (editingBoardName.trim()) {
      updateBoard(boardId, { name: editingBoardName.trim() });
    }
    setEditingBoardId(null);
    setEditingBoardName('');
  };

  const handleCancelEdit = () => {
    setEditingBoardId(null);
    setEditingBoardName('');
  };

  // Функции для истории действий
  const handleUndo = () => {
    if (canUndo) {
      undoLastAction();
    }
  };

  const handleRedo = () => {
    if (canRedo) {
      redoLastAction();
    }
  };

  // Функция для обрезки названия доски
  const truncateBoardName = (name: string, maxLength: number = 15) => {
    if (name.length <= maxLength) return name;
    return name.substring(0, maxLength) + '...';
  };

  const iconColor = '#B6C2FC';

  return (
    <header className="bg-white border-b border-gray-200 px-4 md:px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4 md:space-x-8 flex-1 min-w-0">
          <div className="flex items-center space-x-3 flex-shrink-0">
            <div className="flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-xl" style={{ background: `linear-gradient(135deg, ${iconColor} 0%, #A4D2FC 100%)` }}>
              <FileText className="w-4 h-4 md:w-6 md:h-6 text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg md:text-xl font-bold text-gray-900 uppercase">PLANIFY</h1>
              <p className="text-xs md:text-sm text-gray-500 uppercase">АКТИВНЫХ ЗАДАЧ: {activeTasks}</p>
            </div>
          </div>

          {/* Селектор досок с адаптивной шириной */}
          <div className="relative flex-1 max-w-xs board-dropdown-container" data-tour="board-selector">
            <button
              onClick={() => setShowBoardDropdown(!showBoardDropdown)}
              className="flex items-center space-x-2 px-3 md:px-4 py-2 rounded-lg transition-colors w-full text-left bg-white border border-gray-200 hover:border-gray-300"
              style={{ 
                minWidth: isMobile ? '120px' : '200px', 
                maxWidth: isMobile ? '160px' : '280px',
                width: 'fit-content'
              }}
            >
              <Folder className="w-3 h-3 md:w-4 md:h-4 text-gray-600 flex-shrink-0" />
              <span className="font-medium text-gray-900 uppercase truncate text-sm md:text-base">
                {currentBoard?.name ? (
                  isMobile ? truncateBoardName(currentBoard.name, 10) : currentBoard.name
                ) : 'ВЫБЕРИТЕ ДОСКУ'}
              </span>
              <ChevronDown className="w-3 h-3 md:w-4 md:h-4 text-gray-600 flex-shrink-0" />
            </button>

            {showBoardDropdown && (
              <div className="absolute top-full left-0 mt-2 w-full md:w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-80 overflow-y-auto">
                <div className="p-2">
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wide px-3 py-2">
                    ДОСКИ
                  </div>
                  {userBoards.map(board => (
                    <div key={board.id} className="group">
                      <div
                        className={`flex items-center justify-between px-3 py-2 rounded-md hover:bg-gray-100 transition-colors cursor-pointer ${
                          board.id === currentBoardId ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                        }`}
                        onClick={() => handleBoardChange(board.id)}
                      >
                        <div className="flex-1 min-w-0">
                          {editingBoardId === board.id ? (
                            <div className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
                              <input
                                type="text"
                                value={editingBoardName}
                                onChange={(e) => setEditingBoardName(e.target.value)}
                                className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                onKeyPress={(e) => {
                                  if (e.key === 'Enter') {
                                    handleSaveBoardName(board.id);
                                  } else if (e.key === 'Escape') {
                                    handleCancelEdit();
                                  }
                                }}
                                onBlur={() => handleSaveBoardName(board.id)}
                                autoFocus
                              />
                            </div>
                          ) : (
                            <>
                              <div className="font-medium uppercase truncate text-sm">{board.name}</div>
                              {board.description && (
                                <div className="text-xs text-gray-500 truncate uppercase">{board.description}</div>
                              )}
                              <div className="text-xs text-gray-400 uppercase">КОД: {board.code}</div>
                            </>
                          )}
                        </div>
                        {editingBoardId !== board.id && (
                          <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={(e) => handleShareBoard(board.id, e)}
                              className="p-1 text-blue-600 hover:text-blue-800"
                              title="ПОДЕЛИТЬСЯ ДОСКОЙ"
                            >
                              <Share2 className="w-3 h-3" />
                            </button>
                            {currentUser?.role === 'admin' && (
                              <button
                                onClick={(e) => handleEditBoard(board.id, e)}
                                className="p-1 text-gray-600 hover:text-gray-800"
                                title="РЕДАКТИРОВАТЬ НАЗВАНИЕ"
                              >
                                <Edit className="w-3 h-3" />
                              </button>
                            )}
                            {(currentUser?.role === 'admin' || board.createdBy === currentUser?.id) && userBoards.length > 1 && (
                              <button
                                onClick={(e) => handleDeleteBoard(board.id, e)}
                                className="p-1 text-red-600 hover:text-red-800"
                                title="УДАЛИТЬ ДОСКУ"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  <hr className="my-2" />
                  <button
                    onClick={() => {
                      setShowBoardModal(true);
                      setShowBoardDropdown(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-100 transition-colors text-blue-600 flex items-center space-x-2"
                  >
                    <FolderPlus className="w-3 h-3 md:w-4 md:h-4" />
                    <span className="uppercase text-sm">СОЗДАТЬ НОВУЮ ДОСКУ</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Кнопки отмены/повтора действий */}
          <div className="hidden md:flex items-center space-x-1">
            <button
              onClick={handleUndo}
              disabled={!canUndo}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="ОТМЕНИТЬ ДЕЙСТВИЕ"
            >
              <Undo className="w-4 h-4" />
            </button>
            <button
              onClick={handleRedo}
              disabled={!canRedo}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="ПОВТОРИТЬ ДЕЙСТВИЕ"
            >
              <Redo className="w-4 h-4" />
            </button>
          </div>

          {/* Навигация для десктопа с уменьшенными отступами */}
          <nav className="hidden md:flex items-center space-x-1" data-tour="navigation">
            <button
              onClick={() => onViewChange('board')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg font-medium transition-colors ${
                currentView === 'board'
                  ? 'text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              style={{ backgroundColor: currentView === 'board' ? iconColor : 'transparent' }}
            >
              <LayoutGrid className="w-4 h-4" style={{ color: currentView === 'board' ? 'white' : iconColor }} />
              <span className="uppercase text-sm">ДОСКА</span>
            </button>
            <button
              onClick={() => onViewChange('calendar')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg font-medium transition-colors ${
                currentView === 'calendar'
                  ? 'text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              style={{ backgroundColor: currentView === 'calendar' ? iconColor : 'transparent' }}
            >
              <Calendar className="w-4 h-4" style={{ color: currentView === 'calendar' ? 'white' : iconColor }} />
              <span className="uppercase text-sm">КАЛЕНДАРЬ</span>
            </button>
            <button
              onClick={() => onViewChange('analytics')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg font-medium transition-colors ${
                currentView === 'analytics'
                  ? 'text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              style={{ backgroundColor: currentView === 'analytics' ? iconColor : 'transparent' }}
            >
              <BarChart3 className="w-4 h-4" style={{ color: currentView === 'analytics' ? 'white' : iconColor }} />
              <span className="uppercase text-sm">АНАЛИТИКА</span>
            </button>
            <button
              onClick={() => onViewChange('users')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg font-medium transition-colors ${
                currentView === 'users'
                  ? 'text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              style={{ backgroundColor: currentView === 'users' ? iconColor : 'transparent' }}
            >
              <Users className="w-4 h-4" style={{ color: currentView === 'users' ? 'white' : iconColor }} />
              <span className="uppercase text-sm">ПОЛЬЗОВАТЕЛИ</span>
            </button>
            <button
              onClick={() => onViewChange('manual')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg font-medium transition-colors ${
                currentView === 'manual'
                  ? 'text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              style={{ backgroundColor: currentView === 'manual' ? iconColor : 'transparent' }}
            >
              <Book className="w-4 h-4" style={{ color: currentView === 'manual' ? 'white' : iconColor }} />
              <span className="uppercase text-sm">РУКОВОДСТВО</span>
            </button>
          </nav>
        </div>

        <div className="flex items-center space-x-2 md:space-x-3 flex-shrink-0">
          <button
            onClick={onCreateTask}
            data-tour="create-task"
            className="flex items-center space-x-1 md:space-x-2 text-white px-3 md:px-4 py-2 rounded-lg transition-all font-medium"
            style={{ backgroundColor: '#a4d2fc' }}
          >
            <Plus className="w-4 h-4 md:w-5 md:h-5" />
            <span className="hidden sm:inline uppercase text-sm md:text-base">СОЗДАТЬ ЗАДАЧУ</span>
          </button>

          <div className="relative notification-panel-container" data-tour="notifications">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Bell className="w-4 h-4 md:w-5 md:h-5" />
              {unreadNotifications > 0 && (
                <span className="absolute -top-1 -right-1 w-2 h-2 md:w-3 md:h-3 bg-red-500 rounded-full"></span>
              )}
            </button>
            
            {showNotifications && (
              <NotificationPanel 
                isOpen={showNotifications}
                onClose={() => setShowNotifications(false)}
              />
            )}
          </div>

          <div className="flex items-center space-x-2 md:space-x-3" data-tour="profile">
            <button
              onClick={() => setShowProfileModal(true)}
              className="flex items-center space-x-2 hover:bg-gray-100 rounded-lg p-2 transition-colors"
            >
              <div className="hidden sm:block text-right">
                <div className="text-xs md:text-sm font-medium text-gray-900 uppercase">
                  {currentUser?.firstName} {currentUser?.lastName}
                </div>
                <div className="text-xs text-gray-500 uppercase">{currentUser?.role}</div>
              </div>
              {currentUser?.avatar ? (
                <img
                  src={currentUser.avatar}
                  alt="Avatar"
                  className="w-6 h-6 md:w-8 md:h-8 rounded-full object-cover"
                />
              ) : (
                <div className="w-6 h-6 md:w-8 md:h-8 bg-gradient-to-br from-purple-300 to-pink-300 rounded-full flex items-center justify-center text-white font-medium text-xs md:text-sm">
                  {currentUser?.firstName?.charAt(0).toUpperCase()}{currentUser?.lastName?.charAt(0).toUpperCase()}
                </div>
              )}
            </button>
            <button
              onClick={logout}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4 md:w-5 md:h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Мобильная навигация с уменьшенными отступами */}
      <nav className="md:hidden flex items-center justify-between bg-gray-50 rounded-lg p-1 mt-4 overflow-x-auto">
        <button
          onClick={() => onViewChange('board')}
          className={`flex-1 flex items-center justify-center space-x-1 py-2 px-1 rounded-md font-medium transition-colors ${
            currentView === 'board'
              ? 'text-white shadow-sm'
              : 'text-gray-600'
          }`}
          style={{ backgroundColor: currentView === 'board' ? '#B6C2FC' : 'transparent' }}
        >
          <LayoutGrid className="w-4 h-4" style={{ color: currentView === 'board' ? 'white' : iconColor }} />
          <span className="text-xs uppercase">ДОСКА</span>
        </button>
        <button
          onClick={() => onViewChange('calendar')}
          className={`flex-1 flex items-center justify-center space-x-1 py-2 px-1 rounded-md font-medium transition-colors ${
            currentView === 'calendar'
              ? 'text-white shadow-sm'
              : 'text-gray-600'
          }`}
          style={{ backgroundColor: currentView === 'calendar' ? '#B6C2FC' : 'transparent' }}
        >
          <Calendar className="w-4 h-4" style={{ color: currentView === 'calendar' ? 'white' : iconColor }} />
          <span className="text-xs uppercase">КАЛЕНДАРЬ</span>
        </button>
        <button
          onClick={() => onViewChange('analytics')}
          className={`flex-1 flex items-center justify-center space-x-1 py-2 px-1 rounded-md font-medium transition-colors ${
            currentView === 'analytics'
              ? 'text-white shadow-sm'
              : 'text-gray-600'
          }`}
          style={{ backgroundColor: currentView === 'analytics' ? '#B6C2FC' : 'transparent' }}
        >
          <BarChart3 className="w-4 h-4" style={{ color: currentView === 'analytics' ? 'white' : iconColor }} />
          <span className="text-xs uppercase">АНАЛИТИКА</span>
        </button>
        <button
          onClick={() => onViewChange('users')}
          className={`flex-1 flex items-center justify-center space-x-1 py-2 px-1 rounded-md font-medium transition-colors ${
            currentView === 'users'
              ? 'text-white shadow-sm'
              : 'text-gray-600'
          }`}
          style={{ backgroundColor: currentView === 'users' ? '#B6C2FC' : 'transparent' }}
        >
          <Users className="w-4 h-4" style={{ color: currentView === 'users' ? 'white' : iconColor }} />
          <span className="text-xs uppercase">ПОЛЬЗОВАТЕЛИ</span>
        </button>
        <button
          onClick={() => onViewChange('profile')}
          className={`flex-1 flex items-center justify-center space-x-1 py-2 px-1 rounded-md font-medium transition-colors ${
            currentView === 'profile'
              ? 'text-white shadow-sm'
              : 'text-gray-600'
          }`}
          style={{ backgroundColor: currentView === 'profile' ? '#B6C2FC' : 'transparent' }}
        >
          <UserIcon className="w-4 h-4" style={{ color: currentView === 'profile' ? 'white' : iconColor }} />
          <span className="text-xs uppercase">ПРОФИЛЬ</span>
        </button>
        <button
          onClick={() => onViewChange('manual')}
          className={`flex-1 flex items-center justify-center space-x-1 py-2 px-1 rounded-md font-medium transition-colors ${
            currentView === 'manual'
              ? 'text-white shadow-sm'
              : 'text-gray-600'
          }`}
          style={{ backgroundColor: currentView === 'manual' ? '#B6C2FC' : 'transparent' }}
        >
          <Book className="w-4 h-4" style={{ color: currentView === 'manual' ? 'white' : iconColor }} />
          <span className="text-xs uppercase">РУКОВОДСТВО</span>
        </button>
      </nav>

      <BoardModal
        isOpen={showBoardModal}
        onClose={() => setShowBoardModal(false)}
      />

      <ProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
      />
    </header>
  );
}