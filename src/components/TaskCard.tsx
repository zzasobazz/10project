import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Calendar,
  Pin,
  MessageCircle,
  Paperclip,
  Clock,
  AlertCircle,
  CheckCircle2,
  Trash2,
  User,
  Mic,
} from 'lucide-react';
import { Task, User as UserType } from '../types';
import { format, isAfter, isBefore, startOfDay } from 'date-fns';
import { useApp } from '../context/AppContext';

interface TaskCardProps {
  task: Task;
  users: UserType[];
  onClick: () => void;
  className?: string;
}

export function TaskCard({ task, users, onClick, className = '' }: TaskCardProps) {
  const { deleteTask, toggleTaskPin, currentUser } = useApp();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // Получаем назначенных пользователей
  const assignees = users.filter(user => task.assigneeIds.includes(user.id));
  
  const isOverdue = task.deadline && isBefore(new Date(task.deadline), startOfDay(new Date()));
  const isDueSoon = task.deadline && isAfter(new Date(task.deadline), new Date()) && 
    isBefore(new Date(task.deadline), new Date(Date.now() + 2 * 24 * 60 * 60 * 1000));

  const priorityColors = {
    high: 'bg-[#FFE1E7] border-[#FFB3BA]',
    medium: 'bg-[#FCFCE9] border-[#FFDFBA]',
    low: 'bg-[#DFFAD7] border-[#BAFFC9]',
  };

  const priorityLabels = {
    high: 'ВЫСОКИЙ',
    medium: 'СРЕДНИЙ',
    low: 'НИЗКИЙ',
  };

  const priorityTextColors = {
    high: 'text-red-700',
    medium: 'text-yellow-700',
    low: 'text-green-700',
  };

  const statusIcons = {
    created: Clock,
    'in-progress': AlertCircle,
    completed: CheckCircle2,
  };

  const StatusIcon = statusIcons[task.status];

  const handlePinClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleTaskPin(task.id);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Проверяем, может ли пользователь удалить эту задачу
    if (currentUser?.role !== 'admin' && task.creatorId !== currentUser?.id) {
      alert('ВЫ МОЖЕТЕ УДАЛЯТЬ ТОЛЬКО СОЗДАННЫЕ ВАМИ ЗАДАЧИ');
      return;
    }
    
    if (window.confirm('ВЫ УВЕРЕНЫ, ЧТО ХОТИТЕ УДАЛИТЬ ЭТУ ЗАДАЧУ?')) {
      deleteTask(task.id);
    }
  };

  // Получаем последний комментарий для отображения
  const latestComment = task.comments.length > 0 ? task.comments[task.comments.length - 1] : null;
  const commentAuthor = latestComment ? users.find(user => user.id === latestComment.userId) : null;

  // Форматирование текста описания для отображения
  const formatDescription = (text: string) => {
    if (!text) return '';
    
    // Простое форматирование текста - убираем markdown/HTML и обрезаем
    let formatted = text
      .replace(/\*\*(.*?)\*\*/g, '$1') // Убираем жирный markdown
      .replace(/\*(.*?)\*/g, '$1') // Убираем курсив markdown
      .replace(/<[^>]*>/g, '') // Убираем HTML теги
      .replace(/^\s*[•\-\*]\s*/gm, '') // Убираем маркеры списков
      .replace(/^\s*\d+\.\s*/gm, '') // Убираем нумерованные списки
      .trim();
    
    return formatted.length > 100 ? formatted.substring(0, 100) + '...' : formatted;
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={`bg-white rounded-xl shadow-sm border-2 p-4 cursor-pointer hover:shadow-md transition-all duration-200 hover:border-[#CFE8FF] group ${priorityColors[task.priority]} ${className} ${
        isDragging ? 'opacity-50 rotate-3 z-50' : ''
      }`}
      style={{
        ...style,
        maxWidth: '100%',
        wordWrap: 'break-word',
        overflow: 'hidden'
      }}
    >
      {/* Заголовок */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2 flex-1 min-w-0">
          <StatusIcon className={`w-4 h-4 flex-shrink-0 ${
            task.status === 'completed' ? 'text-green-600' :
            task.status === 'in-progress' ? 'text-blue-600' : 'text-gray-500'
          }`} />
          <span className={`px-2 py-1 rounded-full text-xs font-medium border flex-shrink-0 ${priorityColors[task.priority]} ${priorityTextColors[task.priority]}`}>
            {priorityLabels[task.priority]}
          </span>
        </div>
        <div className="flex items-center space-x-2 flex-shrink-0">
          <button
            onClick={handlePinClick}
            className={`p-1 rounded hover:bg-white/50 transition-colors ${
              task.isPinned ? 'text-orange-600' : 'text-gray-400 hover:text-orange-600'
            }`}
          >
            <Pin className="w-4 h-4" />
          </button>
          <button
            onClick={handleDeleteClick}
            className="p-1 rounded hover:bg-red-100 text-gray-400 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Название и описание */}
      <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 uppercase text-sm break-words">{task.title}</h3>
      {task.description && (
        <p className="text-xs text-gray-600 mb-3 line-clamp-2 leading-relaxed break-words">
          {formatDescription(task.description)}
        </p>
      )}

      {/* Предварительный просмотр последнего комментария */}
      {latestComment && commentAuthor && (
        <div className="bg-gray-100 rounded-lg p-2 mb-3 border border-gray-200">
          <div className="flex items-center space-x-2 mb-1">
            <div className="w-3 h-3 rounded-full overflow-hidden flex-shrink-0">
              {commentAuthor.avatar ? (
                <img
                  src={commentAuthor.avatar}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center">
                  <User className="w-2 h-2 text-white" />
                </div>
              )}
            </div>
            <span className="text-xs font-medium text-gray-700 uppercase truncate">
              {commentAuthor.firstName} {commentAuthor.lastName}:
            </span>
          </div>
          <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed break-words">
            {latestComment.content.length > 50 
              ? latestComment.content.substring(0, 50) + '...' 
              : latestComment.content}
          </p>
        </div>
      )}

      {/* Срок выполнения */}
      {task.deadline && (
        <div className={`flex items-center space-x-1 mb-3 text-xs ${
          isOverdue ? 'text-red-600' : isDueSoon ? 'text-orange-600' : 'text-gray-500'
        }`}>
          <Calendar className="w-4 h-4 flex-shrink-0" />
          <span className="uppercase truncate">СРОК {format(new Date(task.deadline), 'dd.MM.yyyy')}</span>
          {isOverdue && <span className="text-red-600 font-medium uppercase">(ПРОСРОЧЕНО)</span>}
          {isDueSoon && <span className="text-orange-600 font-medium uppercase">(СКОРО ИСТЕКАЕТ СРОК)</span>}
        </div>
      )}

      {/* Подвал */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {/* Вложения, голосовые сообщения и комментарии */}
          <div className="flex items-center space-x-3 text-xs text-gray-500">
            {task.attachments.length > 0 && (
              <div className="flex items-center space-x-1">
                <Paperclip className="w-3 h-3" />
                <span>{task.attachments.length}</span>
              </div>
            )}
            {task.voiceMessages && task.voiceMessages.length > 0 && (
              <div className="flex items-center space-x-1">
                <Mic className="w-3 h-3" />
                <span>{task.voiceMessages.length}</span>
              </div>
            )}
            {task.comments.length > 0 && (
              <div className="flex items-center space-x-1">
                <MessageCircle className="w-3 h-3" />
                <span>{task.comments.length}</span>
              </div>
            )}
          </div>
        </div>

        {/* Назначенные пользователи */}
        {assignees.length > 0 && (
          <div className="flex items-center space-x-1 flex-shrink-0">
            <div className="flex -space-x-1">
              {assignees.slice(0, 3).map((assignee, index) => (
                <div
                  key={assignee.id}
                  className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-medium border-2 border-white overflow-hidden"
                  title={`${assignee.firstName} ${assignee.lastName}`}
                >
                  {assignee.avatar ? (
                    <img
                      src={assignee.avatar}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center">
                      {assignee.firstName.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
              ))}
              {assignees.length > 3 && (
                <div className="w-6 h-6 bg-gray-400 rounded-full flex items-center justify-center text-white text-xs font-medium border-2 border-white">
                  +{assignees.length - 3}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}