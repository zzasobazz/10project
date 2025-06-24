import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { AppState, User, Task, Board, Notification } from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';

interface AppContextType extends AppState {
  login: (usernameOrEmail: string, password: string, boardCode?: string) => Promise<boolean>;
  register: (userData: {
    username: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    patronymic?: string;
  }, boardCode?: string) => Promise<boolean>;
  logout: () => void;
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  deleteTask: (taskId: string) => void;
  toggleTaskPin: (taskId: string) => void;
  addUser: (user: Omit<User, 'id' | 'createdAt' | 'boardIds'>) => Promise<{ success: boolean; message: string }>;
  updateUser: (userId: string, updates: Partial<User>) => void;
  updateCurrentUser: (updates: Partial<User>) => void;
  deleteUser: (userId: string) => void;
  addBoard: (board: Omit<Board, 'id' | 'createdAt' | 'updatedAt' | 'code' | 'memberIds'>) => void;
  updateBoard: (boardId: string, updates: Partial<Board>) => void;
  deleteBoard: (boardId: string) => void;
  setCurrentBoard: (boardId: string) => void;
  getCurrentBoardTasks: () => Task[];
  joinBoardByCode: (boardCode: string) => Promise<boolean>;
  generateBoardLink: (boardId: string) => string;
  clearSavedCredentials: () => void;
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => void;
  markNotificationAsRead: (notificationId: string) => void;
  markAllNotificationsAsRead: () => void;
  setLastView: (view: string) => void;
  getLastView: () => string | null;
  undoLastAction: () => void;
  redoLastAction: () => void;
  canUndo: boolean;
  canRedo: boolean;
  addComment: (taskId: string, content: string) => void;
  updateComment: (taskId: string, commentId: string, content: string) => void;
  deleteComment: (taskId: string, commentId: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const initialState: AppState = {
  currentUser: null,
  users: [],
  tasks: [],
  boards: [],
  notifications: [],
  currentBoardId: null,
  isAuthenticated: false,
  savedCredentials: null,
};

type Action =
  | { type: 'LOGIN'; payload: User }
  | { type: 'LOGOUT' }
  | { type: 'SET_USERS'; payload: User[] }
  | { type: 'SET_TASKS'; payload: Task[] }
  | { type: 'SET_BOARDS'; payload: Board[] }
  | { type: 'SET_NOTIFICATIONS'; payload: Notification[] }
  | { type: 'SET_CURRENT_BOARD'; payload: string }
  | { type: 'SET_SAVED_CREDENTIALS'; payload: { username: string; password: string } | null }
  | { type: 'ADD_TASK'; payload: Task }
  | { type: 'UPDATE_TASK'; payload: { id: string; updates: Partial<Task> } }
  | { type: 'DELETE_TASK'; payload: string }
  | { type: 'ADD_USER'; payload: User }
  | { type: 'UPDATE_USER'; payload: { id: string; updates: Partial<User> } }
  | { type: 'DELETE_USER'; payload: string }
  | { type: 'ADD_BOARD'; payload: Board }
  | { type: 'UPDATE_BOARD'; payload: { id: string; updates: Partial<Board> } }
  | { type: 'DELETE_BOARD'; payload: string }
  | { type: 'ADD_NOTIFICATION'; payload: Notification }
  | { type: 'UPDATE_NOTIFICATION'; payload: { id: string; updates: Partial<Notification> } }
  | { type: 'DELETE_NOTIFICATION'; payload: string }
  | { type: 'RESTORE_STATE'; payload: AppState };

interface HistoryAction {
  type: 'ADD_TASK' | 'UPDATE_TASK' | 'DELETE_TASK' | 'ADD_USER' | 'DELETE_USER' | 'ADD_BOARD' | 'DELETE_BOARD';
  payload: any;
  inverse?: any;
}

function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'LOGIN':
      return {
        ...state,
        currentUser: action.payload,
        isAuthenticated: true,
      };
    case 'LOGOUT':
      return {
        ...state,
        currentUser: null,
        isAuthenticated: false,
      };
    case 'SET_USERS':
      return {
        ...state,
        users: action.payload,
      };
    case 'SET_TASKS':
      return {
        ...state,
        tasks: action.payload,
      };
    case 'SET_BOARDS':
      return {
        ...state,
        boards: action.payload,
      };
    case 'SET_NOTIFICATIONS':
      return {
        ...state,
        notifications: action.payload,
      };
    case 'SET_CURRENT_BOARD':
      return {
        ...state,
        currentBoardId: action.payload,
      };
    case 'SET_SAVED_CREDENTIALS':
      return {
        ...state,
        savedCredentials: action.payload,
      };
    case 'ADD_TASK':
      return {
        ...state,
        tasks: [...state.tasks, action.payload],
      };
    case 'UPDATE_TASK':
      return {
        ...state,
        tasks: state.tasks.map(task =>
          task.id === action.payload.id
            ? { ...task, ...action.payload.updates, updatedAt: new Date().toISOString() }
            : task
        ),
      };
    case 'DELETE_TASK':
      return {
        ...state,
        tasks: state.tasks.filter(task => task.id !== action.payload),
      };
    case 'ADD_USER':
      return {
        ...state,
        users: [...state.users, action.payload],
      };
    case 'UPDATE_USER':
      return {
        ...state,
        users: state.users.map(user =>
          user.id === action.payload.id
            ? { ...user, ...action.payload.updates }
            : user
        ),
        currentUser: state.currentUser?.id === action.payload.id 
          ? { ...state.currentUser, ...action.payload.updates }
          : state.currentUser,
      };
    case 'DELETE_USER':
      return {
        ...state,
        users: state.users.filter(user => user.id !== action.payload),
      };
    case 'ADD_BOARD':
      return {
        ...state,
        boards: [...state.boards, action.payload],
      };
    case 'UPDATE_BOARD':
      return {
        ...state,
        boards: state.boards.map(board =>
          board.id === action.payload.id
            ? { ...board, ...action.payload.updates, updatedAt: new Date().toISOString() }
            : board
        ),
      };
    case 'DELETE_BOARD':
      return {
        ...state,
        boards: state.boards.filter(board => board.id !== action.payload),
      };
    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [...state.notifications, action.payload],
      };
    case 'UPDATE_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.map(notification =>
          notification.id === action.payload.id
            ? { ...notification, ...action.payload.updates }
            : notification
        ),
      };
    case 'DELETE_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.filter(notification => notification.id !== action.payload),
      };
    case 'RESTORE_STATE':
      return action.payload;
    default:
      return state;
  }
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const [storedUsers, setStoredUsers] = useLocalStorage<User[]>('planify-users', []);
  const [storedTasks, setStoredTasks] = useLocalStorage<Task[]>('planify-tasks', []);
  const [storedBoards, setStoredBoards] = useLocalStorage<Board[]>('planify-boards', []);
  const [storedNotifications, setStoredNotifications] = useLocalStorage<Notification[]>('planify-notifications', []);
  const [currentUserId, setCurrentUserId] = useLocalStorage<string | null>('planify-current-user', null);
  const [currentBoardId, setCurrentBoardId] = useLocalStorage<string | null>('planify-current-board', null);
  const [savedCredentials, setSavedCredentials] = useLocalStorage<{ username: string; password: string } | null>('planify-saved-credentials', null);
  const [lastView, setLastViewStorage] = useLocalStorage<string>('planify-last-view', 'board');
  const [actionHistory, setActionHistory] = useLocalStorage<HistoryAction[]>('planify-action-history', []);
  const [historyIndex, setHistoryIndex] = useLocalStorage<number>('planify-history-index', -1);

  // Генерация уникального кода доски
  const generateBoardCode = (): string => {
    return Math.random().toString(36).substr(2, 8).toUpperCase();
  };

  // Инициализация с демо данными, если пусто
  useEffect(() => {
    if (storedUsers.length === 0) {
      const demoUsers: User[] = [
        {
          id: '1',
          username: 'admin123',
          email: 'admin@planify.com',
          firstName: 'АДМИНИСТРАТОР',
          lastName: 'СИСТЕМЫ',
          password: 'password123',
          role: 'admin',
          createdAt: new Date().toISOString(),
          boardIds: ['1'],
        },
        {
          id: '2',
          username: 'user1234',
          email: 'user@planify.com',
          firstName: 'ОБЫЧНЫЙ',
          lastName: 'ПОЛЬЗОВАТЕЛЬ',
          password: 'password123',
          role: 'user',
          createdAt: new Date().toISOString(),
          boardIds: ['1'],
        },
      ];
      setStoredUsers(demoUsers);
      dispatch({ type: 'SET_USERS', payload: demoUsers });
    } else {
      dispatch({ type: 'SET_USERS', payload: storedUsers });
    }

    if (storedBoards.length === 0) {
      const demoBoards: Board[] = [
        {
          id: '1',
          name: 'ОСНОВНАЯ ДОСКА',
          description: 'ГЛАВНАЯ ДОСКА ДЛЯ УПРАВЛЕНИЯ ЗАДАЧАМИ',
          code: 'DEMO2024',
          createdBy: '1',
          memberIds: ['1', '2'],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];
      setStoredBoards(demoBoards);
      dispatch({ type: 'SET_BOARDS', payload: demoBoards });
      if (!currentBoardId) {
        setCurrentBoardId('1');
        dispatch({ type: 'SET_CURRENT_BOARD', payload: '1' });
      }
    } else {
      dispatch({ type: 'SET_BOARDS', payload: storedBoards });
      if (currentBoardId) {
        dispatch({ type: 'SET_CURRENT_BOARD', payload: currentBoardId });
      }
    }

    if (storedTasks.length === 0) {
      const demoTasks: Task[] = [
        {
          id: '1',
          title: 'ДИЗАЙН ПОЛЬЗОВАТЕЛЬСКОГО ИНТЕРФЕЙСА',
          description: 'СОЗДАТЬ МАКЕТЫ И ПРОТОТИПЫ ДЛЯ НОВОЙ ФУНКЦИИ',
          status: 'in-progress',
          priority: 'high',
          assigneeIds: ['2'],
          creatorId: '1',
          boardId: '1',
          deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          isPinned: true,
          attachments: [],
          comments: [],
          voiceMessages: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: '2',
          title: 'РЕАЛИЗАЦИЯ АУТЕНТИФИКАЦИИ',
          description: 'НАСТРОИТЬ СИСТЕМУ ВХОДА И РЕГИСТРАЦИИ ПОЛЬЗОВАТЕЛЕЙ',
          status: 'created',
          priority: 'high',
          assigneeIds: ['1'],
          creatorId: '1',
          boardId: '1',
          isPinned: false,
          attachments: [],
          comments: [],
          voiceMessages: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];
      setStoredTasks(demoTasks);
      dispatch({ type: 'SET_TASKS', payload: demoTasks });
    } else {
      dispatch({ type: 'SET_TASKS', payload: storedTasks });
    }

    // Загрузка уведомлений
    dispatch({ type: 'SET_NOTIFICATIONS', payload: storedNotifications });

    // Проверка существующего входа
    if (currentUserId) {
      const user = storedUsers.find(u => u.id === currentUserId);
      if (user) {
        dispatch({ type: 'LOGIN', payload: user });
      }
    }

    // Загрузка сохраненных данных для автозаполнения
    if (savedCredentials) {
      dispatch({ type: 'SET_SAVED_CREDENTIALS', payload: savedCredentials });
    }
  }, []);

  // Синхронизация с localStorage
  useEffect(() => {
    setStoredUsers(state.users);
  }, [state.users, setStoredUsers]);

  useEffect(() => {
    setStoredTasks(state.tasks);
  }, [state.tasks, setStoredTasks]);

  useEffect(() => {
    setStoredBoards(state.boards);
  }, [state.boards, setStoredBoards]);

  useEffect(() => {
    setStoredNotifications(state.notifications);
  }, [state.notifications, setStoredNotifications]);

  useEffect(() => {
    if (state.currentBoardId) {
      setCurrentBoardId(state.currentBoardId);
    }
  }, [state.currentBoardId, setCurrentBoardId]);

  // Функции для истории действий
  const saveToHistory = (action: HistoryAction) => {
    const newHistory = actionHistory.slice(0, historyIndex + 1);
    newHistory.push(action);
    
    // Ограничиваем историю 50 действиями для экономии памяти
    if (newHistory.length > 50) {
      newHistory.shift();
    } else {
      setHistoryIndex(historyIndex + 1);
    }
    
    setActionHistory(newHistory);
  };

  const undoLastAction = () => {
    if (historyIndex >= 0 && actionHistory[historyIndex]) {
      const action = actionHistory[historyIndex];
      
      switch (action.type) {
        case 'ADD_TASK':
          dispatch({ type: 'DELETE_TASK', payload: action.payload.id });
          break;
        case 'DELETE_TASK':
          if (action.inverse) {
            dispatch({ type: 'ADD_TASK', payload: action.inverse });
          }
          break;
        case 'UPDATE_TASK':
          if (action.inverse) {
            dispatch({ type: 'UPDATE_TASK', payload: { id: action.payload.id, updates: action.inverse } });
            
            // Удаляем уведомления о завершении, если задача была перемещена из "Выполнено"
            if (action.payload.updates.status === 'completed' && action.inverse.status !== 'completed') {
              const completionNotifications = state.notifications.filter(
                n => n.type === 'task_completed' && n.relatedId === action.payload.id
              );
              completionNotifications.forEach(notification => {
                dispatch({ type: 'DELETE_NOTIFICATION', payload: notification.id });
              });
            }
          }
          break;
        case 'ADD_USER':
          dispatch({ type: 'DELETE_USER', payload: action.payload.id });
          break;
        case 'DELETE_USER':
          if (action.inverse) {
            dispatch({ type: 'ADD_USER', payload: action.inverse });
          }
          break;
        case 'ADD_BOARD':
          dispatch({ type: 'DELETE_BOARD', payload: action.payload.id });
          break;
        case 'DELETE_BOARD':
          if (action.inverse) {
            dispatch({ type: 'ADD_BOARD', payload: action.inverse });
          }
          break;
      }
      
      setHistoryIndex(historyIndex - 1);
    }
  };

  const redoLastAction = () => {
    if (historyIndex < actionHistory.length - 1) {
      setHistoryIndex(historyIndex + 1);
      const action = actionHistory[historyIndex + 1];
      
      switch (action.type) {
        case 'ADD_TASK':
          dispatch({ type: 'ADD_TASK', payload: action.payload });
          break;
        case 'DELETE_TASK':
          dispatch({ type: 'DELETE_TASK', payload: action.payload });
          break;
        case 'UPDATE_TASK':
          dispatch({ type: 'UPDATE_TASK', payload: action.payload });
          break;
        case 'ADD_USER':
          dispatch({ type: 'ADD_USER', payload: action.payload });
          break;
        case 'DELETE_USER':
          dispatch({ type: 'DELETE_USER', payload: action.payload });
          break;
        case 'ADD_BOARD':
          dispatch({ type: 'ADD_BOARD', payload: action.payload });
          break;
        case 'DELETE_BOARD':
          dispatch({ type: 'DELETE_BOARD', payload: action.payload });
          break;
      }
    }
  };

  const canUndo = historyIndex >= 0;
  const canRedo = historyIndex < actionHistory.length - 1;

  // Функция добавления уведомления
  const addNotification = (notificationData: Omit<Notification, 'id' | 'createdAt'>) => {
    const notification: Notification = {
      ...notificationData,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
    };
    dispatch({ type: 'ADD_NOTIFICATION', payload: notification });
  };

  // Функция отметки уведомления как прочитанного
  const markNotificationAsRead = (notificationId: string) => {
    dispatch({ type: 'UPDATE_NOTIFICATION', payload: { id: notificationId, updates: { isRead: true } } });
  };

  // Функция отметки всех уведомлений как прочитанных
  const markAllNotificationsAsRead = () => {
    const userNotifications = state.notifications.filter(n => n.userId === state.currentUser?.id && !n.isRead);
    userNotifications.forEach(notification => {
      dispatch({ type: 'UPDATE_NOTIFICATION', payload: { id: notification.id, updates: { isRead: true } } });
    });
  };

  // Функции для сохранения и получения последнего представления
  const setLastView = (view: string) => {
    setLastViewStorage(view);
  };

  const getLastView = () => {
    return lastView;
  };

  // Генерация ссылки на доску
  const generateBoardLink = (boardId: string): string => {
    const board = state.boards.find(b => b.id === boardId);
    if (!board) return '';
    
    const baseUrl = window.location.origin;
    return `${baseUrl}?board=${board.code}`;
  };

  // Присоединение к доске по коду
  const joinBoardByCode = async (boardCode: string): Promise<boolean> => {
    if (!boardCode) return false;

    const board = state.boards.find(b => b.code === boardCode);
    if (!board) return false;

    // Добавляем пользователя в доску, если его там нет
    if (state.currentUser && !state.currentUser.boardIds.includes(board.id)) {
      const updatedUser = {
        ...state.currentUser,
        boardIds: [...state.currentUser.boardIds, board.id],
        role: 'user' as const // При присоединении по коду пользователь получает роль user
      };
      
      const updatedBoard = {
        ...board,
        memberIds: [...board.memberIds, state.currentUser.id]
      };

      dispatch({ type: 'UPDATE_USER', payload: { id: state.currentUser.id, updates: updatedUser } });
      dispatch({ type: 'UPDATE_BOARD', payload: { id: board.id, updates: updatedBoard } });

      // Добавляем уведомление о присоединении к доске
      addNotification({
        userId: state.currentUser.id,
        type: 'board_added',
        title: 'Добавлен в доску',
        message: `Вы были добавлены в доску "${board.name}"`,
        isRead: false,
      });
    }

    dispatch({ type: 'SET_CURRENT_BOARD', payload: board.id });
    return true;
  };

  const login = async (usernameOrEmail: string, password: string, boardCode?: string): Promise<boolean> => {
    // Поиск пользователя по имени пользователя или email
    const user = state.users.find(u => 
      (u.username === usernameOrEmail || u.email === usernameOrEmail) && u.password === password
    );
    
    if (user) {
      dispatch({ type: 'LOGIN', payload: user });
      setCurrentUserId(user.id);
      
      // Сохранение данных для автозаполнения (используем username для сохранения)
      const credentials = { username: user.username, password };
      setSavedCredentials(credentials);
      dispatch({ type: 'SET_SAVED_CREDENTIALS', payload: credentials });
      
      // Если предоставлен код доски, попытаться присоединиться
      if (boardCode) {
        await joinBoardByCode(boardCode);
      } else {
        // Устанавливаем первую доступную доску
        if (user.boardIds.length > 0) {
          dispatch({ type: 'SET_CURRENT_BOARD', payload: user.boardIds[0] });
        }
      }
      
      // Для демо аккаунтов всегда сбрасываем онбординг
      if (user.username === 'admin123' || user.username === 'user1234') {
        localStorage.removeItem('planify-onboarding-seen');
      }
      
      return true;
    }
    return false;
  };

  const register = async (userData: {
    username: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    patronymic?: string;
  
  }, boardCode?: string): Promise<boolean> => {
    const existingUser = state.users.find(u => u.username === userData.username || u.email === userData.email);
    if (existingUser) {
      return false;
    }

    let boardIds: string[] = [];
    let userRole: 'admin' | 'user' = 'admin'; // По умолчанию новые пользователи - администраторы
    
    // Если предоставлен код доски, проверяем его существование
    if (boardCode) {
      const board = state.boards.find(b => b.code === boardCode);
      if (board) {
        boardIds = [board.id];
        userRole = 'user'; // При регистрации по коду доски пользователь получает роль user
        
        // Добавляем пользователя в список участников доски
        const updatedBoard = {
          ...board,
          memberIds: [...board.memberIds, Date.now().toString()]
        };
        dispatch({ type: 'UPDATE_BOARD', payload: { id: board.id, updates: updatedBoard } });
      }
    }

    // Если нет доступных досок, создаем новую
    if (boardIds.length === 0) {
      const newBoardId = (Date.now() + 1).toString();
      const newBoard: Board = {
        id: newBoardId,
        name: `ДОСКА ${userData.firstName.toUpperCase()} ${userData.lastName.toUpperCase()}`,
        description: `ПЕРСОНАЛЬНАЯ ДОСКА ДЛЯ ${userData.firstName.toUpperCase()} ${userData.lastName.toUpperCase()}`,
        code: generateBoardCode(),
        createdBy: Date.now().toString(),
        memberIds: [Date.now().toString()],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      dispatch({ type: 'ADD_BOARD', payload: newBoard });
      boardIds = [newBoardId];
    }

    const newUser: User = {
      id: Date.now().toString(),
      username: userData.username,
      email: userData.email,
      firstName: userData.firstName.toUpperCase(),
      lastName: userData.lastName.toUpperCase(),
      patronymic: userData.patronymic?.toUpperCase(),
      password: userData.password,
      role: userRole,
      createdAt: new Date().toISOString(),
      boardIds,
    };

    dispatch({ type: 'ADD_USER', payload: newUser });
    dispatch({ type: 'LOGIN', payload: newUser });
    setCurrentUserId(newUser.id);
    
    // Сохранение данных для автозаполнения
    const credentials = { username: userData.username, password: userData.password };
    setSavedCredentials(credentials);
    dispatch({ type: 'SET_SAVED_CREDENTIALS', payload: credentials });
    
    // Устанавливаем текущую доску
    if (boardIds.length > 0) {
      dispatch({ type: 'SET_CURRENT_BOARD', payload: boardIds[0] });
    }
    
    return true;
  };

  const logout = () => {
    dispatch({ type: 'LOGOUT' });
    setCurrentUserId(null);
  };

  const clearSavedCredentials = () => {
    setSavedCredentials(null);
    dispatch({ type: 'SET_SAVED_CREDENTIALS', payload: null });
  };

  const addTask = (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newTask: Task = {
      ...taskData,
      id: Date.now().toString(),
      boardId: taskData.boardId || state.currentBoardId || '1',
      assigneeIds: taskData.assigneeIds || [],
      voiceMessages: taskData.voiceMessages || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    dispatch({ type: 'ADD_TASK', payload: newTask });

    // Добавляем уведомления для назначенных пользователей
    newTask.assigneeIds.forEach(userId => {
      if (userId !== state.currentUser?.id) {
        addNotification({
          userId,
          type: 'task_assigned',
          title: 'Назначена новая задача',
          message: `Вам назначена задача "${newTask.title}"`,
          isRead: false,
          relatedId: newTask.id,
        });
      }
    });

    saveToHistory({ type: 'ADD_TASK', payload: newTask });
  };

  const updateTask = (taskId: string, updates: Partial<Task>) => {
    const existingTask = state.tasks.find(t => t.id === taskId);
    if (!existingTask) return;

    // Сохраняем предыдущее состояние для отмены
    const previousState = { ...existingTask };
    
    dispatch({ type: 'UPDATE_TASK', payload: { id: taskId, updates } });

    // Проверяем изменения для уведомлений
    if (updates.status === 'completed' && existingTask.status !== 'completed') {
      // Уведомление о завершении задачи
      existingTask.assigneeIds.forEach(userId => {
        addNotification({
          userId,
          type: 'task_completed',
          title: 'Задача завершена',
          message: `Задача "${existingTask.title}" была завершена`,
          isRead: false,
          relatedId: taskId,
        });
      });
    }

    // Удаляем уведомления о завершении, если задача была перемещена из "Выполнено"
    if (existingTask.status === 'completed' && updates.status && updates.status !== 'completed') {
      const completionNotifications = state.notifications.filter(
        n => n.type === 'task_completed' && n.relatedId === taskId
      );
      completionNotifications.forEach(notification => {
        dispatch({ type: 'DELETE_NOTIFICATION', payload: notification.id });
      });
    }

    // Уведомления о новых назначениях
    if (updates.assigneeIds) {
      const newAssignees = updates.assigneeIds.filter(id => !existingTask.assigneeIds.includes(id));
      newAssignees.forEach(userId => {
        if (userId !== state.currentUser?.id) {
          addNotification({
            userId,
            type: 'task_assigned',
            title: 'Назначена задача',
            message: `Вам назначена задача "${existingTask.title}"`,
            isRead: false,
            relatedId: taskId,
          });
        }
      });
    }

    saveToHistory({ 
      type: 'UPDATE_TASK', 
      payload: { id: taskId, updates },
      inverse: previousState
    });
  };

  const deleteTask = (taskId: string) => {
    const taskToDelete = state.tasks.find(t => t.id === taskId);
    if (taskToDelete) {
      dispatch({ type: 'DELETE_TASK', payload: taskId });
      saveToHistory({ 
        type: 'DELETE_TASK', 
        payload: taskId,
        inverse: taskToDelete
      });
    }
  };

  const toggleTaskPin = (taskId: string) => {
    const task = state.tasks.find(t => t.id === taskId);
    if (task) {
      updateTask(taskId, { isPinned: !task.isPinned });
    }
  };

  // Функции для комментариев (только для администраторов)
  const addComment = (taskId: string, content: string) => {
    if (state.currentUser?.role !== 'admin') return;
    
    const task = state.tasks.find(t => t.id === taskId);
    if (!task) return;

    const newComment = {
      id: Date.now().toString(),
      userId: state.currentUser.id,
      content,
      createdAt: new Date().toISOString(),
    };

    const updatedComments = [...task.comments, newComment];
    updateTask(taskId, { comments: updatedComments });
  };

  const updateComment = (taskId: string, commentId: string, content: string) => {
    if (state.currentUser?.role !== 'admin') return;
    
    const task = state.tasks.find(t => t.id === taskId);
    if (!task) return;

    const updatedComments = task.comments.map(comment =>
      comment.id === commentId ? { ...comment, content } : comment
    );
    updateTask(taskId, { comments: updatedComments });
  };

  const deleteComment = (taskId: string, commentId: string) => {
    if (state.currentUser?.role !== 'admin') return;
    
    const task = state.tasks.find(t => t.id === taskId);
    if (!task) return;

    const updatedComments = task.comments.filter(comment => comment.id !== commentId);
    updateTask(taskId, { comments: updatedComments });
  };

  const addUser = async (userData: Omit<User, 'id' | 'createdAt' | 'boardIds'>): Promise<{ success: boolean; message: string }> => {
    const existingUserByEmail = state.users.find(u => u.email.toLowerCase() === userData.email.toLowerCase());
    const existingUserByUsername = state.users.find(u => u.username.toLowerCase() === userData.username.toLowerCase());
    
    if (existingUserByEmail) {
      return { success: false, message: 'Пользователь с таким email уже существует' };
    }
    
    if (existingUserByUsername) {
      return { success: false, message: 'Пользователь с таким именем пользователя уже существует' };
    }

    const newUser: User = {
      ...userData,
      firstName: userData.firstName.toUpperCase(),
      lastName: userData.lastName.toUpperCase(),
      patronymic: userData.patronymic?.toUpperCase(),
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      boardIds: state.currentBoardId ? [state.currentBoardId] : [],
    };
    
    dispatch({ type: 'ADD_USER', payload: newUser });
    
    // Добавляем пользователя в текущую доску
    if (state.currentBoardId) {
      const currentBoard = state.boards.find(b => b.id === state.currentBoardId);
      if (currentBoard) {
        const updatedBoard = {
          ...currentBoard,
          memberIds: [...currentBoard.memberIds, newUser.id]
        };
        dispatch({ type: 'UPDATE_BOARD', payload: { id: state.currentBoardId, updates: updatedBoard } });
      }
    }

    // Добавляем уведомление новому пользователю
    addNotification({
      userId: newUser.id,
      type: 'board_added',
      title: 'Добавлен в доску',
      message: `Вы были добавлены в доску администратором`,
      isRead: false,
    });

    // Если пользователь назначен администратором
    if (userData.role === 'admin') {
      addNotification({
        userId: newUser.id,
        type: 'admin_assigned',
        title: 'Назначен администратором',
        message: `Вам назначена роль администратора`,
        isRead: false,
      });
    }

    saveToHistory({ type: 'ADD_USER', payload: newUser });
    
    return { success: true, message: 'Пользователь успешно создан' };
  };

  const updateUser = (userId: string, updates: Partial<User>) => {
    const existingUser = state.users.find(u => u.id === userId);
    if (!existingUser) return;

    const updatedUser = { ...updates };
    if (updatedUser.firstName) {
      updatedUser.firstName = updatedUser.firstName.toUpperCase();
    }
    if (updatedUser.lastName) {
      updatedUser.lastName = updatedUser.lastName.toUpperCase();
    }
    if (updatedUser.patronymic) {
      updatedUser.patronymic = updatedUser.patronymic.toUpperCase();
    }
    
    dispatch({ type: 'UPDATE_USER', payload: { id: userId, updates: updatedUser } });

    // Уведомление о назначении администратором
    if (updates.role === 'admin' && existingUser.role !== 'admin') {
      addNotification({
        userId,
        type: 'admin_assigned',
        title: 'Назначен администратором',
        message: `Вам назначена роль администратора`,
        isRead: false,
      });
    }
  };

  const updateCurrentUser = (updates: Partial<User>) => {
    if (state.currentUser) {
      updateUser(state.currentUser.id, updates);
    }
  };

  const deleteUser = (userId: string) => {
    const userToDelete = state.users.find(u => u.id === userId);
    if (userToDelete) {
      dispatch({ type: 'DELETE_USER', payload: userId });
      saveToHistory({ 
        type: 'DELETE_USER', 
        payload: userId,
        inverse: userToDelete
      });
    }
  };

  const addBoard = (boardData: Omit<Board, 'id' | 'createdAt' | 'updatedAt' | 'code' | 'memberIds'>) => {
    const newBoard: Board = {
      ...boardData,
      name: boardData.name.toUpperCase(),
      description: boardData.description?.toUpperCase(),
      id: Date.now().toString(),
      code: generateBoardCode(),
      memberIds: [state.currentUser?.id || ''],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    dispatch({ type: 'ADD_BOARD', payload: newBoard });
    
    // Добавляем доску в список досок пользователя
    if (state.currentUser) {
      const updatedUser = {
        ...state.currentUser,
        boardIds: [...state.currentUser.boardIds, newBoard.id]
      };
      dispatch({ type: 'UPDATE_USER', payload: { id: state.currentUser.id, updates: updatedUser } });
    }

    saveToHistory({ type: 'ADD_BOARD', payload: newBoard });
  };

  const updateBoard = (boardId: string, updates: Partial<Board>) => {
    const updatedBoard = { ...updates };
    if (updatedBoard.name) {
      updatedBoard.name = updatedBoard.name.toUpperCase();
    }
    if (updatedBoard.description) {
      updatedBoard.description = updatedBoard.description.toUpperCase();
    }
    dispatch({ type: 'UPDATE_BOARD', payload: { id: boardId, updates: updatedBoard } });
  };

  const deleteBoard = (boardId: string) => {
    // Проверяем, может ли пользователь удалить эту доску
    const board = state.boards.find(b => b.id === boardId);
    if (!board) return;
    
    const canDelete = state.currentUser?.role === 'admin' || 
      (board.createdBy === state.currentUser?.id && state.boards.length > 1);
    
    if (!canDelete) {
      alert('Вы не можете удалить эту доску');
      return;
    }
    
    dispatch({ type: 'DELETE_BOARD', payload: boardId });
    
    // Удаляем доску из списков пользователей
    state.users.forEach(user => {
      if (user.boardIds.includes(boardId)) {
        const updatedBoardIds = user.boardIds.filter(id => id !== boardId);
        dispatch({ type: 'UPDATE_USER', payload: { id: user.id, updates: { boardIds: updatedBoardIds } } });
      }
    });
    
    // Переключаемся на другую доску, если текущая была удалена
    if (state.currentBoardId === boardId) {
      const remainingBoards = state.boards.filter(b => b.id !== boardId);
      if (remainingBoards.length > 0) {
        dispatch({ type: 'SET_CURRENT_BOARD', payload: remainingBoards[0].id });
      }
    }

    saveToHistory({ 
      type: 'DELETE_BOARD', 
      payload: boardId,
      inverse: board
    });
  };

  const setCurrentBoard = (boardId: string) => {
    dispatch({ type: 'SET_CURRENT_BOARD', payload: boardId });
  };

  const getCurrentBoardTasks = () => {
    // Сортировка задач по приоритету: высокий, средний, низкий
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    
    return state.tasks
      .filter(task => task.boardId === state.currentBoardId)
      .sort((a, b) => {
        // Сначала закрепленные
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        
        // Затем по приоритету
        const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
        if (priorityDiff !== 0) return priorityDiff;
        
        // Затем по дате создания
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  };

  const value: AppContextType = {
    ...state,
    savedCredentials,
    login,
    register,
    logout,
    addTask,
    updateTask,
    deleteTask,
    toggleTaskPin,
    addUser,
    updateUser,
    updateCurrentUser,
    deleteUser,
    addBoard,
    updateBoard,
    deleteBoard,
    setCurrentBoard,
    getCurrentBoardTasks,
    joinBoardByCode,
    generateBoardLink,
    clearSavedCredentials,
    addNotification,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    setLastView,
    getLastView,
    undoLastAction,
    redoLastAction,
    canUndo,
    canRedo,
    addComment,
    updateComment,
    deleteComment,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}