import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  Mail,
  User as UserIcon,
  Edit,
  Trash2,
  Crown,
  AlertCircle,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { User } from '../types';

export function UserManagement() {
  const { users, currentUser, addUser, updateUser, deleteUser, getCurrentBoardTasks, currentBoardId } = useApp();
  const [showAddUser, setShowAddUser] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    username: '',
    role: 'user' as 'admin' | 'user',
  });
  const [error, setError] = useState('');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const tasks = getCurrentBoardTasks();

  // Получение пользователей текущей доски
  const boardUsers = users.filter(user => user.boardIds.includes(currentBoardId || ''));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Проверяем, существует ли пользователь с таким именем
    const existingUser = users.find(u => u.username === formData.username);
    if (!existingUser) {
      setError('Пользователь с таким именем не найден');
      return;
    }

    // Проверяем, не добавлен ли уже пользователь в доску
    if (existingUser.boardIds.includes(currentBoardId || '')) {
      setError('Пользователь уже добавлен в эту доску');
      return;
    }
    
    if (editingUser) {
      // Обновляем роль пользователя
      updateUser(editingUser.id, { role: formData.role });
      setEditingUser(null);
      setShowAddUser(false);
    } else {
      // Добавляем существующего пользователя в доску
      const updatedBoardIds = [...existingUser.boardIds, currentBoardId || ''];
      updateUser(existingUser.id, { 
        boardIds: updatedBoardIds,
        role: formData.role 
      });
      setShowAddUser(false);
    }
    
    setFormData({ username: '', role: 'user' });
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      role: user.role,
    });
    setShowAddUser(true);
    setError('');
  };

  const handleDelete = (user: User) => {
    if (user.id === currentUser?.id) {
      alert('Вы не можете удалить свой собственный аккаунт.');
      return;
    }
    
    if (window.confirm(`Вы уверены, что хотите удалить ${user.firstName} ${user.lastName}?`)) {
      deleteUser(user.id);
    }
  };

  const getUserTaskStats = (userId: string) => {
    const userTasks = tasks.filter(task => task.assigneeIds?.includes(userId));
    return {
      completed: userTasks.filter(task => task.status === 'completed').length,
      inProgress: userTasks.filter(task => task.status === 'in-progress').length,
      created: userTasks.filter(task => task.status === 'created').length,
    };
  };

  const cancelEdit = () => {
    setShowAddUser(false);
    setEditingUser(null);
    setFormData({ username: '', role: 'user' });
    setError('');
  };

  // Общая статистика
  const totalCompleted = tasks.filter(task => task.status === 'completed').length;

  // Мобильная версия - список пользователей
  if (isMobile) {
    return (
      <div className="p-4 h-full overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-bold text-gray-900 uppercase">ПОЛЬЗОВАТЕЛИ</h2>
          </div>
          
          {currentUser?.role === 'admin' && (
            <button
              onClick={() => setShowAddUser(true)}
              className="flex items-center space-x-1 text-gray-800 px-3 py-2 rounded-xl font-medium uppercase text-sm"
              style={{ backgroundColor: '#CFE8FF' }}
            >
              <UserPlus className="w-4 h-4" />
              <span>ДОБАВИТЬ</span>
            </button>
          )}
        </div>

        {/* Общая статистика */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-xl font-bold text-blue-600">{boardUsers.length}</div>
              <div className="text-xs text-gray-500 uppercase">ПОЛЬЗОВАТЕЛЕЙ</div>
            </div>
            <div>
              <div className="text-xl font-bold text-green-600">{totalCompleted}</div>
              <div className="text-xs text-gray-500 uppercase">ВЫПОЛНЕНО</div>
            </div>
          </div>
        </div>

        {/* Форма добавления/редактирования пользователя */}
        {showAddUser && currentUser?.role === 'admin' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
            <h3 className="text-md font-semibold text-gray-900 mb-4 uppercase">
              {editingUser ? 'РЕДАКТИРОВАТЬ РОЛЬ' : 'ДОБАВИТЬ ПОЛЬЗОВАТЕЛЯ В ДОСКУ'}
            </h3>
            
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center space-x-2 text-red-700">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">{error}</span>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {!editingUser && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 uppercase">
                    ИМЯ ПОЛЬЗОВАТЕЛЯ
                  </label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#CFE8FF] focus:border-[#CFE8FF] transition-colors"
                    placeholder="ВВЕДИТЕ ИМЯ ПОЛЬЗОВАТЕЛЯ"
                    required
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 uppercase">
                  РОЛЬ
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as 'admin' | 'user' })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#CFE8FF] focus:border-[#CFE8FF] transition-colors uppercase"
                >
                  <option value="user">ПОЛЬЗОВАТЕЛЬ</option>
                  <option value="admin">АДМИНИСТРАТОР</option>
                </select>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  type="submit"
                  className="text-gray-800 px-6 py-2 rounded-xl font-medium uppercase"
                  style={{ backgroundColor: '#CFE8FF' }}
                >
                  {editingUser ? 'ОБНОВИТЬ' : 'ДОБАВИТЬ'}
                </button>
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="text-gray-600 hover:text-gray-800 px-6 py-2 rounded-xl hover:bg-gray-100 transition-colors font-medium uppercase"
                >
                  ОТМЕНА
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Список пользователей */}
        <div className="space-y-3">
          {boardUsers.map((user) => {
            const stats = getUserTaskStats(user.id);
            const isCurrentUser = user.id === currentUser?.id;
            
            return (
              <div key={user.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3 flex-1">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-medium overflow-hidden">
                      {user.avatar ? (
                        <img
                          src={user.avatar}
                          alt="Avatar"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-300 to-teal-300 rounded-full flex items-center justify-center">
                          {user.firstName.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 flex items-center space-x-2">
                        <span className="uppercase">{user.firstName} {user.lastName}</span>
                        {isCurrentUser && (
                          <span className="text-xs px-2 py-1 rounded-full uppercase" style={{ backgroundColor: '#CFE8FF', color: '#1e40af' }}>
                            ВЫ
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-600">{user.email}</div>
                      <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium mt-1 ${
                        user.role === 'admin' 
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {user.role === 'admin' ? (
                          <Crown className="w-3 h-3" />
                        ) : (
                          <UserIcon className="w-3 h-3" />
                        )}
                        <span className="uppercase">
                          {user.role === 'admin' ? 'АДМИНИСТРАТОР' : 'ПОЛЬЗОВАТЕЛЬ'}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        <div className="text-green-600 uppercase">{stats.completed} ВЫПОЛНЕНО</div>
                        <div className="text-blue-600 uppercase">{stats.inProgress} В ПРОЦЕССЕ</div>
                      </div>
                    </div>
                  </div>
                  
                  {currentUser?.role === 'admin' && (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEdit(user)}
                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      {!isCurrentUser && (
                        <button
                          onClick={() => handleDelete(user)}
                          className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Десктопная версия - таблица
  return (
    <div className="p-6 h-full overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Users className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900 uppercase">УПРАВЛЕНИЕ ПОЛЬЗОВАТЕЛЯМИ</h2>
          <span className="text-blue-700 px-3 py-1 rounded-full text-sm font-medium uppercase" style={{ backgroundColor: '#CFE8FF' }}>
            {boardUsers.length} ПОЛЬЗОВАТЕЛЕЙ
          </span>
        </div>
        
        {currentUser?.role === 'admin' && (
          <button
            onClick={() => setShowAddUser(true)}
            className="flex items-center space-x-2 text-gray-800 px-4 py-2 rounded-xl font-medium uppercase"
            style={{ backgroundColor: '#CFE8FF' }}
          >
            <UserPlus className="w-5 h-5" />
            <span>ДОБАВИТЬ ПОЛЬЗОВАТЕЛЯ</span>
          </button>
        )}
      </div>

      {/* Форма добавления/редактирования пользователя */}
      {showAddUser && currentUser?.role === 'admin' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 uppercase">
            {editingUser ? 'РЕДАКТИРОВАТЬ РОЛЬ ПОЛЬЗОВАТЕЛЯ' : 'ДОБАВИТЬ ПОЛЬЗОВАТЕЛЯ В ДОСКУ'}
          </h3>
          
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center space-x-2 text-red-700">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm">{error}</span>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {!editingUser && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 uppercase">
                  ИМЯ ПОЛЬЗОВАТЕЛЯ
                </label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#CFE8FF] focus:border-[#CFE8FF] transition-colors"
                  placeholder="ВВЕДИТЕ ИМЯ ПОЛЬЗОВАТЕЛЯ"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 uppercase">
                РОЛЬ
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as 'admin' | 'user' })}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#CFE8FF] focus:border-[#CFE8FF] transition-colors uppercase"
              >
                <option value="user">ПОЛЬЗОВАТЕЛЬ</option>
                <option value="admin">АДМИНИСТРАТОР</option>
              </select>
            </div>

            <div className="flex items-end space-x-3">
              <button
                type="submit"
                className="text-gray-800 px-6 py-2 rounded-xl font-medium uppercase"
                style={{ backgroundColor: '#CFE8FF' }}
              >
                {editingUser ? 'ОБНОВИТЬ РОЛЬ' : 'ДОБАВИТЬ В ДОСКУ'}
              </button>
              <button
                type="button"
                onClick={cancelEdit}
                className="text-gray-600 hover:text-gray-800 px-6 py-2 rounded-xl hover:bg-gray-100 transition-colors font-medium uppercase"
              >
                ОТМЕНА
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Таблица пользователей */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-gray-200" style={{ backgroundColor: '#add8ff' }}>
              <tr>
                <th className="text-left py-4 px-6 font-medium text-gray-700 uppercase">ПОЛЬЗОВАТЕЛЬ</th>
                <th className="text-left py-4 px-6 font-medium text-gray-700 uppercase">ВЫПОЛНЕНО</th>
                <th className="text-left py-4 px-6 font-medium text-gray-700 uppercase">В ПРОЦЕССЕ</th>
                <th className="text-left py-4 px-6 font-medium text-gray-700 uppercase">СОЗДАНО</th>
                <th className="text-left py-4 px-6 font-medium text-gray-700 uppercase">ЭФФЕКТИВНОСТЬ</th>
                {currentUser?.role === 'admin' && (
                  <th className="text-right py-4 px-6 font-medium text-gray-700 uppercase">ДЕЙСТВИЯ</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {boardUsers.map((user) => {
                const stats = getUserTaskStats(user.id);
                const isCurrentUser = user.id === currentUser?.id;
                const total = stats.completed + stats.inProgress + stats.created;
                const efficiency = total > 0 ? Math.round((stats.completed / total) * 100) : 0;
                
                return (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-medium overflow-hidden">
                          {user.avatar ? (
                            <img
                              src={user.avatar}
                              alt="Avatar"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-blue-300 to-teal-300 rounded-full flex items-center justify-center">
                              {user.firstName.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 flex items-center space-x-2">
                            <span className="uppercase">{user.firstName} {user.lastName}</span>
                            {isCurrentUser && (
                              <span className="text-xs px-2 py-1 rounded-full uppercase" style={{ backgroundColor: '#CFE8FF', color: '#1e40af' }}>
                                ВЫ
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-600">{user.email}</div>
                          <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
                            user.role === 'admin' 
                              ? 'bg-purple-100 text-purple-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}>
                            {user.role === 'admin' ? (
                              <Crown className="w-3 h-3" />
                            ) : (
                              <UserIcon className="w-3 h-3" />
                            )}
                            <span className="uppercase">
                              {user.role === 'admin' ? 'АДМИНИСТРАТОР' : 'ПОЛЬЗОВАТЕЛЬ'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                        {stats.completed}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                        {stats.inProgress}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                        {stats.created}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              efficiency >= 80 ? 'bg-green-300' : 
                              efficiency >= 60 ? 'bg-yellow-300' : 'bg-red-300'
                            }`}
                            style={{ width: `${efficiency}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-900">{efficiency}%</span>
                      </div>
                    </td>
                    {currentUser?.role === 'admin' && (
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleEdit(user)}
                            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          {!isCurrentUser && (
                            <button
                              onClick={() => handleDelete(user)}
                              className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}