import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Calendar,
  Pin,
  Save,
  Trash2,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Paperclip,
  Upload,
  Mic,
  Square,
  Play,
  Download,
  Pause,
  Edit,
  Clock,
} from 'lucide-react';
import { Task, User as UserType, Comment, Attachment, VoiceMessage } from '../types';
import { useApp } from '../context/AppContext';
import { format } from 'date-fns';

interface TaskModalProps {
  task?: Task;
  isOpen: boolean;
  onClose: () => void;
  defaultStatus?: Task['status'];
}

export function TaskModal({ task, isOpen, onClose, defaultStatus = 'created' }: TaskModalProps) {
  const { users, currentUser, addTask, updateTask, deleteTask, currentBoardId, addComment, updateComment, deleteComment } = useApp();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: defaultStatus,
    priority: 'medium' as Task['priority'],
    assigneeIds: [] as string[],
    deadline: '',
    deadlineTime: '',
    isPinned: false,
  });
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState<Comment[]>([]);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [voiceMessages, setVoiceMessages] = useState<VoiceMessage[]>([]);
  const [newAttachments, setNewAttachments] = useState<File[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [playingVoice, setPlayingVoice] = useState<string | null>(null);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingCommentText, setEditingCommentText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);
  const titleRef = useRef<HTMLTextAreaElement>(null);

  // Получение пользователей текущей доски
  const boardUsers = users.filter(user => user.boardIds.includes(currentBoardId || ''));

  useEffect(() => {
    if (task) {
      const taskDeadline = task.deadline ? new Date(task.deadline) : null;
      setFormData({
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        assigneeIds: task.assigneeIds || [],
        deadline: taskDeadline ? format(taskDeadline, 'yyyy-MM-dd') : '',
        deadlineTime: taskDeadline ? format(taskDeadline, 'HH:mm') : '',
        isPinned: task.isPinned,
      });
      setComments(task.comments);
      setAttachments(task.attachments);
      setVoiceMessages(task.voiceMessages || []);
    } else {
      setFormData({
        title: '',
        description: '',
        status: defaultStatus,
        priority: 'medium',
        assigneeIds: currentUser?.id ? [currentUser.id] : [],
        deadline: '',
        deadlineTime: '',
        isPinned: false,
      });
      setComments([]);
      setAttachments([]);
      setVoiceMessages([]);
    }
    setNewAttachments([]);
    setHasUnsavedChanges(false);
    setEditingCommentId(null);
    setEditingCommentText('');
  }, [task, currentUser, defaultStatus]);

  // Отслеживание изменений
  useEffect(() => {
    if (task) {
      const taskDeadline = task.deadline ? new Date(task.deadline) : null;
      const currentDeadlineString = formData.deadline && formData.deadlineTime 
        ? `${formData.deadline}T${formData.deadlineTime}:00.000Z`
        : '';
      const originalDeadlineString = taskDeadline ? taskDeadline.toISOString() : '';
      
      const hasChanges = 
        formData.title !== task.title ||
        formData.description !== task.description ||
        formData.status !== task.status ||
        formData.priority !== task.priority ||
        JSON.stringify(formData.assigneeIds) !== JSON.stringify(task.assigneeIds || []) ||
        currentDeadlineString !== originalDeadlineString ||
        formData.isPinned !== task.isPinned ||
        newAttachments.length > 0 ||
        voiceMessages.length !== (task.voiceMessages || []).length ||
        comments.length !== task.comments.length;
      setHasUnsavedChanges(hasChanges);
    } else {
      const hasChanges = 
        formData.title !== '' ||
        formData.description !== '' ||
        formData.assigneeIds.length !== (currentUser?.id ? 1 : 0) ||
        formData.deadline !== '' ||
        formData.deadlineTime !== '' ||
        formData.isPinned !== false ||
        newAttachments.length > 0 ||
        voiceMessages.length > 0;
      setHasUnsavedChanges(hasChanges);
    }
  }, [formData, newAttachments, voiceMessages, comments, task, currentUser]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      alert('Название задачи не может быть пустым');
      return;
    }

    // Проверка даты и времени
    if (formData.deadline || formData.deadlineTime) {
      if (!formData.deadline || !formData.deadlineTime) {
        alert('Необходимо указать и дату, и время дедлайна');
        return;
      }

      const deadlineDateTime = new Date(`${formData.deadline}T${formData.deadlineTime}`);
      const now = new Date();
      
      if (deadlineDateTime <= now) {
        alert('Дата и время дедлайна не могут быть в прошлом');
        return;
      }
    }
    
    // Обработка вложений с ограничением размера (5MB)
    const maxFileSize = 5 * 1024 * 1024; // 5MB
    const validAttachments = newAttachments.filter(file => {
      if (file.size > maxFileSize) {
        alert(`Файл ${file.name} превышает максимальный размер 5MB`);
        return false;
      }
      return true;
    });
    
    const processedAttachments = [
      ...attachments,
      ...validAttachments.map(file => ({
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        name: file.name,
        size: file.size,
        type: file.type,
        url: URL.createObjectURL(file),
      }))
    ];

    // Формирование даты дедлайна
    let deadlineISO: string | undefined;
    if (formData.deadline && formData.deadlineTime) {
      deadlineISO = new Date(`${formData.deadline}T${formData.deadlineTime}`).toISOString();
    }
    
    const taskData = {
      ...formData,
      deadline: deadlineISO,
      assigneeIds: formData.assigneeIds,
      creatorId: currentUser?.id || '',
      boardId: task?.boardId || currentBoardId || '1',
      attachments: processedAttachments,
      voiceMessages,
      comments,
    };

    if (task) {
      updateTask(task.id, taskData);
    } else {
      addTask(taskData);
    }

    setHasUnsavedChanges(false);
    onClose();
  };

  const handleClose = () => {
    if (hasUnsavedChanges) {
      if (window.confirm('У вас есть несохраненные изменения. Вы уверены, что хотите закрыть?')) {
        setHasUnsavedChanges(false);
        onClose();
      }
    } else {
      onClose();
    }
  };

  const handleAddComment = () => {
    if (!newComment.trim() || currentUser?.role !== 'admin') return;

    if (task) {
      addComment(task.id, newComment);
      setComments([...comments, {
        id: Date.now().toString(),
        userId: currentUser.id,
        content: newComment,
        createdAt: new Date().toISOString(),
      }]);
    } else {
      const comment: Comment = {
        id: Date.now().toString(),
        userId: currentUser?.id || '',
        content: newComment,
        createdAt: new Date().toISOString(),
      };
      setComments([...comments, comment]);
    }
    setNewComment('');
  };

  const handleEditComment = (commentId: string) => {
    const comment = comments.find(c => c.id === commentId);
    if (comment) {
      setEditingCommentId(commentId);
      setEditingCommentText(comment.content);
    }
  };

  const handleSaveComment = (commentId: string) => {
    if (!editingCommentText.trim()) return;

    if (task) {
      updateComment(task.id, commentId, editingCommentText);
    }
    
    setComments(comments.map(comment => 
      comment.id === commentId 
        ? { ...comment, content: editingCommentText }
        : comment
    ));
    setEditingCommentId(null);
    setEditingCommentText('');
  };

  const handleDeleteComment = (commentId: string) => {
    if (window.confirm('Вы уверены, что хотите удалить этот комментарий?')) {
      if (task) {
        deleteComment(task.id, commentId);
      }
      setComments(comments.filter(comment => comment.id !== commentId));
    }
  };

  const handleDelete = () => {
    if (task && window.confirm('Вы уверены, что хотите удалить эту задачу?')) {
      deleteTask(task.id);
      onClose();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const maxFileSize = 5 * 1024 * 1024; // 5MB
    
    const validFiles = files.filter(file => {
      if (file.size > maxFileSize) {
        alert(`Файл ${file.name} превышает максимальный размер 5MB`);
        return false;
      }
      return true;
    });
    
    setNewAttachments(prev => [...prev, ...validFiles]);
  };

  const removeNewAttachment = (index: number) => {
    setNewAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingAttachment = (attachmentId: string) => {
    setAttachments(prev => prev.filter(att => att.id !== attachmentId));
  };

  const downloadAttachment = (attachment: Attachment) => {
    const link = document.createElement('a');
    link.href = attachment.url;
    link.download = attachment.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const playAttachment = (attachment: Attachment) => {
    if (attachment.type.startsWith('audio/')) {
      const audio = new Audio(attachment.url);
      audio.play();
    } else if (attachment.type.startsWith('image/')) {
      window.open(attachment.url, '_blank');
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];

      recorder.ondataavailable = (e) => {
        chunks.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/wav' });
        const voiceMessage: VoiceMessage = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          userId: currentUser?.id || '',
          url: URL.createObjectURL(blob),
          duration: 0,
          createdAt: new Date().toISOString(),
        };
        setVoiceMessages(prev => [...prev, voiceMessage]);
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
    } catch (error) {
      console.error('Ошибка при запуске записи:', error);
      alert('Не удалось получить доступ к микрофону');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
      setIsRecording(false);
      setMediaRecorder(null);
    }
  };

  const playVoiceMessage = (voiceMessage: VoiceMessage) => {
    if (playingVoice === voiceMessage.id) {
      setPlayingVoice(null);
      return;
    }
    
    setPlayingVoice(voiceMessage.id);
    const audio = new Audio(voiceMessage.url);
    audio.onended = () => setPlayingVoice(null);
    audio.play();
  };

  const removeVoiceMessage = (voiceId: string) => {
    setVoiceMessages(prev => prev.filter(vm => vm.id !== voiceId));
  };

  const applyTextFormat = (format: string) => {
    const textarea = descriptionRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    
    let formattedText = '';
    
    switch (format) {
      case 'bold':
        formattedText = `**${selectedText}**`;
        break;
      case 'italic':
        formattedText = `*${selectedText}*`;
        break;
      case 'underline':
        formattedText = `<u>${selectedText}</u>`;
        break;
      case 'list':
        formattedText = `\n• ${selectedText}`;
        break;
      case 'ordered-list':
        formattedText = `\n1. ${selectedText}`;
        break;
      case 'align-left':
        formattedText = `<div style="text-align: left">${selectedText}</div>`;
        break;
      case 'align-center':
        formattedText = `<div style="text-align: center">${selectedText}</div>`;
        break;
      case 'align-right':
        formattedText = `<div style="text-align: right">${selectedText}</div>`;
        break;
      default:
        formattedText = selectedText;
    }

    const newValue = textarea.value.substring(0, start) +  formattedText + textarea.value.substring(end);
    setFormData({ ...formData, description: newValue });
    
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + formattedText.length, start + formattedText.length);
    }, 0);
  };

  const getTodayDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  const getCurrentTime = () => {
    const now = new Date();
    return now.toTimeString().slice(0, 5);
  };

  // Функция для отображения форматированного текста без markdown символов
  const renderFormattedText = (text: string) => {
    if (!text) return '';
    
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/<u>(.*?)<\/u>/g, '<u>$1</u>')
      .replace(/\n• /g, '<br>• ')
      .replace(/\n\d+\. /g, '<br>$&')
      .replace(/\n/g, '<br>')
      .replace(/<div style="text-align: (left|center|right)">(.*?)<\/div>/g, '<div style="text-align: $1">$2</div>');
  };

  // Обработка множественного выбора пользователей
  const handleAssigneeChange = (userId: string, checked: boolean) => {
    if (checked) {
      setFormData({ ...formData, assigneeIds: [...formData.assigneeIds, userId] });
    } else {
      setFormData({ ...formData, assigneeIds: formData.assigneeIds.filter(id => id !== userId) });
    }
  };

  // Проверка прав на редактирование/удаление комментариев
  const canEditComment = (comment: Comment) => {
    return currentUser?.role === 'admin';
  };

  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditingCommentText('');
  };

  if (!isOpen) return null;

  const priorityLabels = {
    high: 'ВЫСОКИЙ',
    medium: 'СРЕДНИЙ',
    low: 'НИЗКИЙ',
  };

  const statusLabels = {
    created: 'СОЗДАНО',
    'in-progress': 'В ПРОЦЕССЕ',
    completed: 'ВЫПОЛНЕНО',
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-gray-200">
          <h2 className="text-lg md:text-xl font-semibold text-gray-900 uppercase pr-8">
            {task ? 'РЕДАКТИРОВАТЬ ЗАДАЧУ' : 'СОЗДАТЬ НОВУЮ ЗАДАЧУ'}
          </h2>
          <button
            onClick={handleClose}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-180px)]">
          <form onSubmit={handleSubmit} className="p-4 md:p-6 space-y-4 md:space-y-6">
            {/* Название с автоматическим изменением размера */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 uppercase">
                НАЗВАНИЕ ЗАДАЧИ
              </label>
              <textarea
                ref={titleRef}
                value={formData.title}
                onChange={(e) => {
                  setFormData({ ...formData, title: e.target.value });
                  // Автоматическое изменение высоты
                  if (titleRef.current) {
                    titleRef.current.style.height = 'auto';
                    titleRef.current.style.height = titleRef.current.scrollHeight + 'px';
                  }
                }}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#b6c2fc] focus:border-[#b6c2fc] transition-colors resize-none overflow-y-auto"
                style={{ minHeight: '60px', maxHeight: '120px' }}
                placeholder="ВВЕДИТЕ НАЗВАНИЕ ЗАДАЧИ..."
                required
              />
            </div>

            {/* Описание с форматированием */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 uppercase">
                ОПИСАНИЕ
              </label>
              
              {/* Панель инструментов форматирования */}
              <div className="flex items-center space-x-1 mb-2 p-2 rounded-xl border" style={{ backgroundColor: '#a4d2fc' }}>
                <button
                  type="button"
                  onClick={() => applyTextFormat('bold')}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-white rounded-lg transition-colors"
                  title="ЖИРНЫЙ"
                >
                  <Bold className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => applyTextFormat('italic')}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-white rounded-lg transition-colors"
                  title="КУРСИВ"
                >
                  <Italic className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => applyTextFormat('underline')}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-white rounded-lg transition-colors"
                  title="ПОДЧЕРКНУТЫЙ"
                >
                  <Underline className="w-4 h-4" />
                </button>
                <div className="w-px h-6 bg-gray-300 mx-1"></div>
                <button
                  type="button"
                  onClick={() => applyTextFormat('list')}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-white rounded-lg transition-colors"
                  title="МАРКИРОВАННЫЙ СПИСОК"
                >
                  <List className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => applyTextFormat('ordered-list')}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-white rounded-lg transition-colors"
                  title="НУМЕРОВАННЫЙ СПИСОК"
                >
                  <ListOrdered className="w-4 h-4" />
                </button>
                <div className="w-px h-6 bg-gray-300 mx-1"></div>
                <button
                  type="button"
                  onClick={() => applyTextFormat('align-left')}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-white rounded-lg transition-colors"
                  title="ПО ЛЕВОМУ КРАЮ"
                >
                  <AlignLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => applyTextFormat('align-center')}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-white rounded-lg transition-colors"
                  title="ПО ЦЕНТРУ"
                >
                  <AlignCenter className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => applyTextFormat('align-right')}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-white rounded-lg transition-colors"
                  title="ПО ПРАВОМУ КРАЮ"
                >
                  <AlignRight className="w-4 h-4" />
                </button>
              </div>

              <textarea
                ref={descriptionRef}
                value={formData.description}
                onChange={(e) => {
                  setFormData({ ...formData, description: e.target.value });
                  // Автоматическое изменение высоты
                  if (descriptionRef.current) {
                    descriptionRef.current.style.height = 'auto';
                    descriptionRef.current.style.height = descriptionRef.current.scrollHeight + 'px';
                  }
                }}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#b6c2fc] focus:border-[#b6c2fc] transition-colors resize-none overflow-y-auto"
                style={{ minHeight: '120px', maxHeight: '300px' }}
                placeholder="ОПИШИТЕ ЗАДАЧУ..."
              />
              
              {/* Предварительный просмотр форматированного текста */}
              {formData.description && (
                <div className="mt-2 p-3 bg-gray-50 rounded-xl border">
                  <div className="text-sm text-gray-600 mb-1 uppercase">ПРЕДВАРИТЕЛЬНЫЙ ПРОСМОТР:</div>
                  <div 
                    className="text-sm text-gray-800 leading-relaxed formatted-text"
                    dangerouslySetInnerHTML={{ __html: renderFormattedText(formData.description) }}
                  />
                </div>
              )}
            </div>

            {/* Вложения и голосовые сообщения */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 uppercase">
                ВЛОЖЕНИЯ И ГОЛОСОВЫЕ СООБЩЕНИЯ (МАКС. 5MB)
              </label>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center space-x-2 px-4 py-2 rounded-xl transition-colors text-white"
                    style={{ backgroundColor: '#a4d2fc' }}
                  >
                    <Upload className="w-4 h-4" />
                    <span className="uppercase">ПРИКРЕПИТЬ ФАЙЛЫ</span>
                  </button>
                  
                  <button
                    type="button"
                    onClick={isRecording ? stopRecording : startRecording}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-colors ${
                      isRecording 
                        ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                        : 'text-white hover:opacity-80'
                    }`}
                    style={!isRecording ? { backgroundColor: '#a4d2fc' } : {}}
                  >
                    {isRecording ? (
                      <>
                        <Square className="w-4 h-4" />
                        <span className="uppercase">ОСТАНОВИТЬ ЗАПИСЬ</span>
                      </>
                    ) : (
                      <>
                        <Mic className="w-4 h-4" />
                        <span className="uppercase">ЗАПИСАТЬ ГОЛОС</span>
                      </>
                    )}
                  </button>
                </div>
                
                {/* Голосовые сообщения */}
                {voiceMessages.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-gray-700 uppercase">ГОЛОСОВЫЕ СООБЩЕНИЯ:</div>
                    {voiceMessages.map((voiceMessage) => {
                      const author = users.find(user => user.id === voiceMessage.userId);
                      return (
                        <div key={voiceMessage.id} className="flex items-center justify-between p-3 rounded-xl border" style={{ backgroundColor: '#a4d2fc', borderColor: '#b6c2fc' }}>
                          <div className="flex items-center space-x-2">
                            <Mic className="w-4 h-4 text-blue-600" />
                            <span className="text-sm text-blue-800 uppercase">
                              ГОЛОСОВОЕ СООБЩЕНИЕ ОТ {author?.firstName} {author?.lastName}
                            </span>
                            <span className="text-xs text-blue-600 uppercase">
                              {format(new Date(voiceMessage.createdAt), 'dd.MM.yyyy HH:mm')}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              type="button"
                              onClick={() => playVoiceMessage(voiceMessage)}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              {playingVoice === voiceMessage.id ? (
                                <Pause className="w-4 h-4" />
                              ) : (
                                <Play className="w-4 h-4" />
                              )}
                            </button>
                            <button
                              type="button"
                              onClick={() => removeVoiceMessage(voiceMessage.id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*,audio/*,video/*,.pdf,.doc,.docx,.txt"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                
                {/* Существующие вложения */}
                {attachments.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-gray-700 uppercase px-3 py-1 rounded">ПРИКРЕПЛЁННЫЕ ВЛОЖЕНИЯ:</div>
                    {attachments.map((attachment) => (
                      <div key={attachment.id} className="flex items-center justify-between p-3 rounded-xl border" style={{ backgroundColor: '#a4d2fc', borderColor: '#b6c2fc' }}>
                        <div className="flex items-center space-x-2">
                          <Paperclip className="w-4 h-4 text-blue-600" />
                          <span className="text-sm text-blue-800 uppercase">{attachment.name}</span>
                          <span className="text-xs text-blue-600 uppercase">
                            ({(attachment.size / 1024).toFixed(1)} KB)
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          {(attachment.type.startsWith('audio/') || attachment.type.startsWith('image/')) && (
                            <button
                              type="button"
                              onClick={() => playAttachment(attachment)}
                              className="text-blue-600 hover:text-blue-800"
                              title={attachment.type.startsWith('audio/') ? 'ВОСПРОИЗВЕСТИ' : 'ПРОСМОТРЕТЬ'}
                            >
                              <Play className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => downloadAttachment(attachment)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => removeExistingAttachment(attachment.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Новые вложения */}
                {newAttachments.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-gray-700 uppercase">НОВЫЕ ВЛОЖЕНИЯ:</div>
                    {newAttachments.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-200">
                        <div className="flex items-center space-x-2">
                          <Paperclip className="w-4 h-4 text-gray-500" />
                          <span className="text-sm text-gray-700 uppercase">{file.name}</span>
                          <span className="text-xs text-gray-500 uppercase">
                            ({(file.size / 1024).toFixed(1)} KB)
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeNewAttachment(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Статус, Приоритет и Закрепление */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 uppercase">
                  СТАТУС
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as Task['status'] })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#b6c2fc] focus:border-[#b6c2fc] transition-colors uppercase"
                >
                  <option value="created">{statusLabels.created}</option>
                  <option value="in-progress">{statusLabels['in-progress']}</option>
                  <option value="completed">{statusLabels.completed}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 uppercase">
                  ПРИОРИТЕТ
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value as Task['priority'] })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#b6c2fc] focus:border-[#b6c2fc] transition-colors uppercase"
                >
                  <option value="low">{priorityLabels.low}</option>
                  <option value="medium">{priorityLabels.medium}</option>
                  <option value="high">{priorityLabels.high}</option>
                </select>
              </div>
            </div>

            {/* Закрепление задачи */}
            <div className="flex items-center justify-center">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isPinned}
                  onChange={(e) => setFormData({ ...formData, isPinned: e.target.checked })}
                  className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                />
                <span className="text-sm font-medium text-gray-700 uppercase">ЗАКРЕПИТЬ ЗАДАЧУ</span>
                <Pin className="w-4 h-4 text-orange-600" />
              </label>
            </div>

            {/* Назначение пользователей и Срок выполнения */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 uppercase">
                  НАЗНАЧИТЬ ПОЛЬЗОВАТЕЛЕЙ
                </label>
                <div className="space-y-2 max-h-32 overflow-y-auto border border-gray-200 rounded-xl p-3">
                  {boardUsers.map(user => (
                    <label key={user.id} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.assigneeIds.includes(user.id)}
                        onChange={(e) => handleAssigneeChange(user.id, e.target.checked)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <div className="flex items-center space-x-2">
                        {user.avatar ? (
                          <img
                            src={user.avatar}
                            alt="Avatar"
                            className="w-5 h-5 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-5 h-5 bg-gradient-to-br from-purple-300 to-pink-300 rounded-full flex items-center justify-center text-white text-xs font-medium">
                            {user.firstName.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <span className="text-sm text-gray-700 uppercase">
                          {user.firstName} {user.lastName} ({user.role.toUpperCase()})
                        </span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 uppercase">
                  СРОК ВЫПОЛНЕНИЯ
                </label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <input
                      type="date"
                      value={formData.deadline}
                      min={getTodayDate()}
                      onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                      className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#b6c2fc] focus:border-[#b6c2fc] transition-colors"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <input
                      type="time"
                      value={formData.deadlineTime}
                      min={formData.deadline === getTodayDate() ? getCurrentTime() : undefined}
                      onChange={(e) => setFormData({ ...formData, deadlineTime: e.target.value })}
                      className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#b6c2fc] focus:border-[#b6c2fc] transition-colors"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Раздел комментариев - только для администраторов */}
            {currentUser?.role === 'admin' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3 uppercase">
                  КОММЕНТАРИИ ({comments.length}) - ТОЛЬКО ДЛЯ АДМИНИСТРАТОРОВ
                </label>
                
                <div className="space-y-3 mb-4 max-h-40 overflow-y-auto">
                  {comments.map((comment) => {
                    const commenter = users.find(user => user.id === comment.userId);
                    const canEdit = canEditComment(comment);
                    
                    return (
                      <div key={comment.id} className="bg-gray-50 rounded-xl p-3">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center space-x-2">
                            <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-medium overflow-hidden">
                              {commenter?.avatar ? (
                                <img
                                  src={commenter.avatar}
                                  alt="Avatar"
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full bg-gradient-to-br from-blue-300 to-teal-300 flex items-center justify-center">
                                  {commenter?.firstName?.charAt(0).toUpperCase()}{commenter?.lastName?.charAt(0).toUpperCase()}
                                </div>
                              )}
                            </div>
                            <span className="text-sm font-medium text-gray-900 uppercase">
                              {commenter?.firstName} {commenter?.lastName}
                            </span>
                            <span className="text-xs text-gray-500">
                              {format(new Date(comment.createdAt), 'dd.MM.yyyy, HH:mm')}
                            </span>
                          </div>
                          {canEdit && (
                            <div className="flex items-center space-x-1">
                              <button
                                type="button"
                                onClick={() => handleEditComment(comment.id)}
                                className="p-1 text-gray-400 hover:text-blue-600 rounded"
                                title="РЕДАКТИРОВАТЬ"
                              >
                                <Edit className="w-3 h-3" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteComment(comment.id)}
                                className="p-1 text-gray-400 hover:text-red-600 rounded"
                                title="УДАЛИТЬ"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                        </div>
                        
                        {editingCommentId === comment.id ? (
                          <div className="ml-8 space-y-2">
                            <textarea
                              value={editingCommentText}
                              onChange={(e) => setEditingCommentText(e.target.value)}
                              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#b6c2fc] focus:border-[#b6c2fc] transition-colors text-sm resize-none"
                              rows={2}
                            />
                            <div className="flex items-center space-x-2">
                              <button
                                type="button"
                                onClick={() => handleSaveComment(comment.id)}
                                className="px-3 py-1 text-white rounded-lg transition-colors text-xs font-medium uppercase"
                                style={{ backgroundColor: '#b6c2fc' }}
                              >
                                СОХРАНИТЬ
                              </button>
                              <button
                                type="button"
                                onClick={handleCancelEdit}
                                className="px-3 py-1 text-gray-600 hover:text-gray-800 rounded-lg hover:bg-gray-100 transition-colors text-xs font-medium uppercase"
                              >
                                ОТМЕНА
                              </button>
                            </div>
                          </div>
                        ) : (
                          <p className="text-sm text-gray-700 ml-8 leading-relaxed">{comment.content}</p>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="ДОБАВИТЬ КОММЕНТАРИЙ..."
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#b6c2fc] focus:border-[#b6c2fc] transition-colors text-sm"
                    onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
                  />
                  <button
                    type="button"
                    onClick={handleAddComment}
                    className="px-4 py-2 text-white rounded-xl transition-colors text-sm font-medium uppercase"
                    style={{ backgroundColor: '#b6c2fc' }}
                  >
                    ДОБАВИТЬ
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Подвал */}
        <div className="flex items-center justify-between p-4 md:p-6 bg-gray-50 border-t border-gray-200">
          <div className="flex items-center">
            {task && (
              <button
                type="button"
                onClick={handleDelete}
                className="flex items-center justify-center space-x-2 px-4 md:px-6 py-2 md:py-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors font-medium uppercase"
              >
                <Trash2 className="w-4 h-4" />
                <span>УДАЛИТЬ</span>
              </button>
            )}
          </div>
          
          <div className="flex items-center space-x-3 md:space-x-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex items-center justify-center px-4 md:px-6 py-2 md:py-3 text-gray-700 hover:bg-gray-100 rounded-xl transition-colors font-medium uppercase"
            >
              ОТМЕНА
            </button>
            
            <button
              onClick={handleSubmit}
              className="flex items-center justify-center space-x-2 text-white px-4 md:px-6 py-2 md:py-3 rounded-xl transition-all font-medium uppercase"
              style={{ backgroundColor: '#b6c2fc' }}
            >
              <Save className="w-4 h-4" />
              <span>{task ? 'ОБНОВИТЬ' : 'СОЗДАТЬ'} ЗАДАЧУ</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}