import React from 'react';
import { FileText, ArrowLeft, CheckCircle, Users, Calendar, BarChart3, Settings, MessageCircle, Pin, Upload, Mic, User, Bell, Plus, LayoutGrid, Crown, Edit, Trash2, Share2, Eye, EyeOff, Save, X, RotateCcw } from 'lucide-react';
import { useOnboarding } from './OnboardingTour';

interface ManualPageProps {
  onClose: () => void;
}

export function ManualPage({ onClose }: ManualPageProps) {
  const [activeSection, setActiveSection] = React.useState('intro');
  const { resetOnboarding } = useOnboarding();

  const sections = [
    { id: 'intro', title: 'ВВЕДЕНИЕ', icon: FileText },
    { id: 'auth', title: 'РЕГИСТРАЦИЯ И ВХОД', icon: Users },
    { id: 'tasks', title: 'УПРАВЛЕНИЕ ЗАДАЧАМИ', icon: CheckCircle },
    { id: 'boards', title: 'УПРАВЛЕНИЕ ДОСКАМИ', icon: Settings },
    { id: 'calendar', title: 'КАЛЕНДАРЬ', icon: Calendar },
    { id: 'analytics', title: 'АНАЛИТИКА', icon: BarChart3 },
    { id: 'users', title: 'ПОЛЬЗОВАТЕЛИ', icon: Users },
    { id: 'profile', title: 'ПРОФИЛЬ', icon: User },
    { id: 'notifications', title: 'УВЕДОМЛЕНИЯ', icon: Bell },
    { id: 'tips', title: 'ПОЛЕЗНЫЕ СОВЕТЫ', icon: CheckCircle },
  ];

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleStartTour = () => {
    resetOnboarding();
    onClose();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Заголовок с градиентным фоном */}
      <div 
        className="sticky top-0 z-10 p-4 md:p-6"
        style={{
          background: 'linear-gradient(135deg, #b6c2fc 0%, #afd6fa 100%)'
        }}
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white uppercase">РУКОВОДСТВО ПОЛЬЗОВАТЕЛЯ PLANIFY</h1>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleStartTour}
              className="flex items-center space-x-2 px-4 py-2 text-white hover:bg-white/20 rounded-lg transition-colors backdrop-blur-sm"
            >
              <RotateCcw className="w-5 h-5" />
              <span className="uppercase hidden md:inline">ПОВТОРИТЬ ОБУЧЕНИЕ</span>
            </button>
            <button
              onClick={onClose}
              className="flex items-center space-x-2 px-4 py-2 text-white hover:bg-white/20 rounded-lg transition-colors backdrop-blur-sm"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="uppercase hidden md:inline">НАЗАД</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto flex gap-6 p-4 md:p-6">
        {/* Боковая навигация */}
        <div className="hidden lg:block w-64 flex-shrink-0">
          <div className="sticky top-32 bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-4 uppercase">СОДЕРЖАНИЕ</h3>
            <nav className="space-y-2">
              {sections.map((section) => {
                const Icon = section.icon;
                return (
                  <button
                    key={section.id}
                    onClick={() => scrollToSection(section.id)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      activeSection === section.id
                        ? 'text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                    style={{
                      backgroundColor: activeSection === section.id ? '#b6c2fc' : 'transparent'
                    }}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm uppercase">{section.title}</span>
                  </button>
                );
              })}
            </nav>
            
            {/* Кнопка повторного обучения в боковой панели */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <button
                onClick={handleStartTour}
                className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors text-white"
                style={{ backgroundColor: '#b6c2fc' }}
              >
                <RotateCcw className="w-4 h-4" />
                <span className="text-sm uppercase">ПОВТОРИТЬ ОБУЧЕНИЕ</span>
              </button>
            </div>
          </div>
        </div>

        {/* Основной контент */}
        <div className="flex-1 space-y-8">
          
          {/* Введение */}
          <section id="intro" className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div 
              className="p-6 text-white"
              style={{
                background: 'linear-gradient(135deg, #b6c2fc 0%, #afd6fa 100%)'
              }}
            >
              <h2 className="text-2xl font-bold uppercase flex items-center space-x-3">
                <FileText className="w-6 h-6" />
                <span>ДОБРО ПОЖАЛОВАТЬ В PLANIFY</span>
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex flex-col md:flex-row gap-6 items-center">
                <div className="flex-1">
                  <p className="text-gray-700 leading-relaxed mb-4">
                    Planify — это профессиональное приложение для управления задачами и проектами с использованием методологии Kanban. 
                    Приложение предназначено для командной работы и позволяет эффективно организовать рабочие процессы, 
                    отслеживать прогресс выполнения задач и анализировать продуктивность команды.
                  </p>
                  
                  {/* Кнопка запуска обучения */}
                  <div className="mb-4">
                    <button
                      onClick={handleStartTour}
                      className="flex items-center space-x-2 px-6 py-3 text-white rounded-lg transition-colors font-medium uppercase"
                      style={{ backgroundColor: '#b6c2fc' }}
                    >
                      <RotateCcw className="w-5 h-5" />
                      <span>НАЧАТЬ ИНТЕРАКТИВНОЕ ОБУЧЕНИЕ</span>
                    </button>
                    <p className="text-sm text-gray-600 mt-2">
                      Пройдите пошаговое обучение для знакомства с основными функциями приложения
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <LayoutGrid className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                      <div className="text-sm font-medium text-blue-800 uppercase">KANBAN ДОСКИ</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <Users className="w-8 h-8 mx-auto mb-2 text-green-600" />
                      <div className="text-sm font-medium text-green-800 uppercase">КОМАНДНАЯ РАБОТА</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <BarChart3 className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                      <div className="text-sm font-medium text-purple-800 uppercase">АНАЛИТИКА</div>
                    </div>
                  </div>
                </div>
                <div className="w-full md:w-64 h-48 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl flex items-center justify-center">
                  <div className="text-center">
                    <FileText className="w-16 h-16 mx-auto mb-2 text-blue-600" />
                    <div className="text-sm text-gray-600 uppercase">ПЛАНИРУЙТЕ ЭФФЕКТИВНО</div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Регистрация и вход */}
          <section id="auth" className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div 
              className="p-6 text-white"
              style={{
                background: 'linear-gradient(135deg, #b6c2fc 0%, #afd6fa 100%)'
              }}
            >
              <h2 className="text-xl font-bold uppercase flex items-center space-x-3">
                <Users className="w-5 h-5" />
                <span>1. РЕГИСТРАЦИЯ И ВХОД В СИСТЕМУ</span>
              </h2>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3 uppercase flex items-center space-x-2">
                    <User className="w-4 h-4" />
                    <span>РЕГИСТРАЦИЯ:</span>
                  </h3>
                  <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                    <li>Откройте приложение в браузере</li>
                    <li>На странице входа выберите вкладку "Регистрация"</li>
                    <li>Введите имя пользователя (8-30 символов, только английские буквы и цифры)</li>
                    <li>Укажите email адрес (8-50 символов)</li>
                    <li>Придумайте пароль (8-30 символов, английские буквы и цифры)</li>
                    <li>Введите имя и фамилию (только буквы)</li>
                    <li>Отчество (необязательно)</li>
                    <li>Если у вас есть код доски, введите его в поле "Код доски"</li>
                    <li>Нажмите "Создать аккаунт"</li>
                  </ul>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-green-800 mb-3 uppercase flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4" />
                    <span>ДЕМО АККАУНТЫ:</span>
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="bg-white p-3 rounded border">
                      <div className="font-medium text-purple-700">Демо Администратор:</div>
                      <div className="text-gray-600">admin123 / password123</div>
                    </div>
                    <div className="bg-white p-3 rounded border">
                      <div className="font-medium text-green-700">Демо Пользователь:</div>
                      <div className="text-gray-600">user1234 / password123</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Управление задачами */}
          <section id="tasks" className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div 
              className="p-6 text-white"
              style={{
                background: 'linear-gradient(135deg, #b6c2fc 0%, #afd6fa 100%)'
              }}
            >
              <h2 className="text-xl font-bold uppercase flex items-center space-x-3">
                <CheckCircle className="w-5 h-5" />
                <span>2. УПРАВЛЕНИЕ ЗАДАЧАМИ</span>
              </h2>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-3 uppercase flex items-center space-x-2">
                      <Plus className="w-4 h-4" />
                      <span>СОЗДАНИЕ ЗАДАЧИ:</span>
                    </h3>
                    <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                      <li>Нажмите кнопку "Создать задачу" в заголовке</li>
                      <li>Заполните название и описание</li>
                      <li>Выберите статус и приоритет</li>
                      <li>Назначьте пользователей</li>
                      <li>Установите срок выполнения (дата и время)</li>
                      <li>Прикрепите файлы или запишите голосовое сообщение</li>
                      <li>Закрепите задачу при необходимости</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-3 uppercase flex items-center space-x-2">
                      <Pin className="w-4 h-4" />
                      <span>ДОПОЛНИТЕЛЬНЫЕ ФУНКЦИИ:</span>
                    </h3>
                    <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                      <li>Перетаскивание между колонками</li>
                      <li>Закрепление важных задач</li>
                      <li>Добавление комментариев (админы)</li>
                      <li>Прикрепление файлов до 5 МБ</li>
                      <li>Запись голосовых сообщений</li>
                    </ul>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-4 rounded-lg">
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    <div className="bg-blue-100 p-3 rounded text-center">
                      <div className="text-xs font-medium text-blue-800 uppercase">К ВЫПОЛНЕНИЮ</div>
                    </div>
                    <div className="bg-yellow-100 p-3 rounded text-center">
                      <div className="text-xs font-medium text-yellow-800 uppercase">В ПРОЦЕССЕ</div>
                    </div>
                    <div className="bg-green-100 p-3 rounded text-center">
                      <div className="text-xs font-medium text-green-800 uppercase">ВЫПОЛНЕНО</div>
                    </div>
                  </div>
                  <div className="text-center text-sm text-gray-600 uppercase">
                    KANBAN ДОСКА - ПЕРЕТАСКИВАЙТЕ ЗАДАЧИ МЕЖДУ КОЛОНКАМИ
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Управление досками */}
          <section id="boards" className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div 
              className="p-6 text-white"
              style={{
                background: 'linear-gradient(135deg, #b6c2fc 0%, #afd6fa 100%)'
              }}
            >
              <h2 className="text-xl font-bold uppercase flex items-center space-x-3">
                <Settings className="w-5 h-5" />
                <span>3. УПРАВЛЕНИЕ ДОСКАМИ</span>
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3 uppercase">СОЗДАНИЕ И УПРАВЛЕНИЕ:</h3>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                    <li>Создание новых досок через селектор</li>
                    <li>Редактирование названий (только админы)</li>
                    <li>Удаление досок (создатель или админ)</li>
                    <li>Поделиться ссылкой на доску</li>
                    <li>Переключение между досками</li>
                  </ul>
                </div>
                <div className="flex items-center justify-center bg-gradient-to-br from-orange-50 to-red-50 p-6 rounded-lg">
                  <div className="text-center">
                    <Share2 className="w-12 h-12 mx-auto mb-2 text-orange-600" />
                    <div className="text-sm text-gray-600 uppercase">ПОДЕЛИТЕСЬ ДОСКОЙ С КОМАНДОЙ</div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Календарь */}
          <section id="calendar" className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div 
              className="p-6 text-white"
              style={{
                background: 'linear-gradient(135deg, #b6c2fc 0%, #afd6fa 100%)'
              }}
            >
              <h2 className="text-xl font-bold uppercase flex items-center space-x-3">
                <Calendar className="w-5 h-5" />
                <span>4. КАЛЕНДАРЬ ЗАДАЧ</span>
              </h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <p className="text-gray-700 mb-4">Календарь позволяет просматривать задачи по датам выполнения:</p>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                    <li>Просмотр задач по месяцам</li>
                    <li>Цветные индикаторы приоритета</li>
                    <li>Быстрый переход к текущей дате</li>
                    <li>Детальный просмотр задач дня (мобильная версия)</li>
                  </ul>
                </div>
                <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-4 rounded-lg">
                  <div className="grid grid-cols-7 gap-1 mb-3">
                    {['ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ', 'ВС'].map((day, i) => (
                      <div key={i} className="text-center text-xs font-medium text-gray-600 p-1">{day}</div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-1">
                    {Array.from({ length: 14 }, (_, i) => (
                      <div key={i} className="aspect-square bg-white rounded border flex items-center justify-center text-xs">
                        {i + 1}
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 flex items-center justify-center space-x-4 text-xs">
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-red-300 rounded"></div>
                      <span>ВЫСОКИЙ</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-yellow-300 rounded"></div>
                      <span>СРЕДНИЙ</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-green-300 rounded"></div>
                      <span>НИЗКИЙ</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Аналитика */}
          <section id="analytics" className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div 
              className="p-6 text-white"
              style={{
                background: 'linear-gradient(135deg, #b6c2fc 0%, #afd6fa 100%)'
              }}
            >
              <h2 className="text-xl font-bold uppercase flex items-center space-x-3">
                <BarChart3 className="w-5 h-5" />
                <span>5. АНАЛИТИКА И ОТЧЕТЫ</span>
              </h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <p className="text-gray-700 mb-4">Раздел аналитики предоставляет подробную статистику:</p>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                    <li>Общая статистика по задачам</li>
                    <li>Распределение по статусам</li>
                    <li>Месячная динамика</li>
                    <li>Производительность пользователей</li>
                    <li>Процент выполнения</li>
                    <li>Просроченные задачи</li>
                  </ul>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-blue-600">85%</div>
                    <div className="text-xs text-blue-700 uppercase">ВЫПОЛНЕНО</div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-green-600">24</div>
                    <div className="text-xs text-green-700 uppercase">ЗАДАЧ</div>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-purple-600">5</div>
                    <div className="text-xs text-purple-700 uppercase">УЧАСТНИКОВ</div>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-orange-600">2</div>
                    <div className="text-xs text-orange-700 uppercase">ПРОСРОЧЕНО</div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Управление пользователями */}
          <section id="users" className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div 
              className="p-6 text-white"
              style={{
                background: 'linear-gradient(135deg, #b6c2fc 0%, #afd6fa 100%)'
              }}
            >
              <h2 className="text-xl font-bold uppercase flex items-center space-x-3">
                <Users className="w-5 h-5" />
                <span>6. УПРАВЛЕНИЕ ПОЛЬЗОВАТЕЛЯМИ</span>
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Crown className="w-4 h-4 text-yellow-600" />
                  <span className="font-medium text-yellow-800 uppercase">ТОЛЬКО ДЛЯ АДМИНИСТРАТОРОВ</span>
                </div>
                <p className="text-yellow-700 text-sm">Функции управления пользователями доступны только администраторам системы.</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3 uppercase">ВОЗМОЖНОСТИ:</h3>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                    <li>Добавление существующих пользователей в доску</li>
                    <li>Изменение ролей пользователей</li>
                    <li>Удаление пользователей из системы</li>
                    <li>Просмотр статистики по пользователям</li>
                    <li>Управление правами доступа</li>
                  </ul>
                </div>
                <div className="flex items-center justify-center bg-gradient-to-br from-teal-50 to-cyan-50 p-6 rounded-lg">
                  <div className="text-center">
                    <Users className="w-12 h-12 mx-auto mb-2 text-teal-600" />
                    <div className="text-sm text-gray-600 uppercase">КОМАНДНАЯ РАБОТА</div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Профиль */}
          <section id="profile" className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div 
              className="p-6 text-white"
              style={{
                background: 'linear-gradient(135deg, #b6c2fc 0%, #afd6fa 100%)'
              }}
            >
              <h2 className="text-xl font-bold uppercase flex items-center space-x-3">
                <User className="w-5 h-5" />
                <span>7. ПРОФИЛЬ ПОЛЬЗОВАТЕЛЯ</span>
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3 uppercase">РЕДАКТИРОВАНИЕ ПРОФИЛЯ:</h3>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                    <li>Изменение личных данных</li>
                    <li>Загрузка аватара (макс. 2МБ)</li>
                    <li>Смена пароля</li>
                    <li>Просмотр личной статистики</li>
                    <li>Статистика по доскам</li>
                  </ul>
                </div>
                <div className="bg-gradient-to-br from-pink-50 to-purple-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold">
                      АП
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">АДМИНИСТРАТОР ПЛАНИФАЙ</div>
                      <div className="text-sm text-gray-600">admin@planify.com</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-center text-sm">
                    <div className="bg-white p-2 rounded">
                      <div className="font-bold text-blue-600">15</div>
                      <div className="text-gray-600 uppercase">ЗАДАЧ</div>
                    </div>
                    <div className="bg-white p-2 rounded">
                      <div className="font-bold text-green-600">12</div>
                      <div className="text-gray-600 uppercase">ВЫПОЛНЕНО</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Уведомления */}
          <section id="notifications" className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div 
              className="p-6 text-white"
              style={{
                background: 'linear-gradient(135deg, #b6c2fc 0%, #afd6fa 100%)'
              }}
            >
              <h2 className="text-xl font-bold uppercase flex items-center space-x-3">
                <Bell className="w-5 h-5" />
                <span>8. СИСТЕМА УВЕДОМЛЕНИЙ</span>
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3  uppercase">ТИПЫ УВЕДОМЛЕНИЙ:</h3>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                    <li>Назначение новых задач</li>
                    <li>Завершение задач</li>
                    <li>Добавление в доску</li>
                    <li>Назначение администратором</li>
                    <li>Приближение дедлайнов</li>
                  </ul>
                </div>
                <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-4 rounded-lg">
                  <div className="space-y-3">
                    <div className="bg-white p-3 rounded border-l-4 border-blue-400">
                      <div className="flex items-center space-x-2">
                        <Bell className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium">Новая задача</span>
                      </div>
                      <div className="text-xs text-gray-600 mt-1">Вам назначена задача "Дизайн интерфейса"</div>
                    </div>
                    <div className="bg-white p-3 rounded border-l-4 border-green-400">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium">Задача завершена</span>
                      </div>
                      <div className="text-xs text-gray-600 mt-1">Задача "Тестирование" выполнена</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Полезные советы */}
          <section id="tips" className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div 
              className="p-6 text-white"
              style={{
                background: 'linear-gradient(135deg, #b6c2fc 0%, #afd6fa 100%)'
              }}
            >
              <h2 className="text-xl font-bold uppercase flex items-center space-x-3">
                <CheckCircle className="w-5 h-5" />
                <span>9. ПОЛЕЗНЫЕ СОВЕТЫ</span>
              </h2>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-green-800 mb-2 uppercase flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4" />
                    <span>ЭФФЕКТИВНОСТЬ:</span>
                  </h4>
                  <ul className="list-disc list-inside space-y-1 text-green-700 text-sm ml-4">
                    <li>Используйте закрепление для важных задач</li>
                    <li>Устанавливайте реалистичные сроки</li>
                    <li>Регулярно проверяйте аналитику</li>
                  </ul>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-2 uppercase flex items-center space-x-2">
                    <LayoutGrid className="w-4 h-4" />
                    <span>МОБИЛЬНАЯ ВЕРСИЯ:</span>
                  </h4>
                  <ul className="list-disc list-inside space-y-1 text-blue-700 text-sm ml-4">
                    <li>Полная адаптация под мобильные</li>
                    <li>Горизонтальная прокрутка колонок</li>
                    <li>Все функции доступны</li>
                  </ul>
                </div>

                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-yellow-800 mb-2 uppercase flex items-center space-x-2">
                    <Settings className="w-4 h-4" />
                    <span>СИНХРОНИЗАЦИЯ:</span>
                  </h4>
                  <ul className="list-disc list-inside space-y-1 text-yellow-700 text-sm ml-4">
                    <li>Автосохранение в браузере</li>
                    <li>Работа с разных устройств</li>
                    <li>Приглашения работают везде</li>
                  </ul>
                </div>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 uppercase">ТЕХНИЧЕСКАЯ ИНФОРМАЦИЯ:</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2 uppercase">СИСТЕМНЫЕ ТРЕБОВАНИЯ:</h4>
                    <ul className="list-disc list-inside space-y-1 text-gray-600 text-sm ml-4">
                      <li>Современный веб-браузер</li>
                      <li>Включенный JavaScript</li>
                      <li>Стабильное интернет-соединение</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2 uppercase">ОГРАНИЧЕНИЯ:</h4>
                    <ul className="list-disc list-inside space-y-1 text-gray-600 text-sm ml-4">
                      <li>Максимальный размер файла: 5 МБ</li>
                      <li>Максимальный размер аватара: 2 МБ</li>
                      <li>Поддержка основных форматов файлов</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Мобильная навигация */}
      <div className="lg:hidden fixed bottom-4 left-4 right-4 z-20">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-2">
          <div className="flex overflow-x-auto space-x-2 scrollbar-thin">
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <button
                  key={section.id}
                  onClick={() => scrollToSection(section.id)}
                  className={`flex-shrink-0 flex flex-col items-center space-y-1 px-3 py-2 rounded-lg transition-colors ${
                    activeSection === section.id
                      ? 'text-white'
                      : 'text-gray-600'
                  }`}
                  style={{
                    backgroundColor: activeSection === section.id ? '#b6c2fc' : 'transparent'
                  }}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-xs uppercase whitespace-nowrap">{section.title}</span>
                </button>
              );
            })}
            <button
              onClick={handleStartTour}
              className="flex-shrink-0 flex flex-col items-center space-y-1 px-3 py-2 rounded-lg transition-colors text-white"
              style={{ backgroundColor: '#b6c2fc' }}
            >
              <RotateCcw className="w-4 h-4" />
              <span className="text-xs uppercase whitespace-nowrap">ОБУЧЕНИЕ</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}