import React, { useState, useRef, useEffect } from 'react';
import { Send, MessageSquare, Users, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { format } from 'date-fns';

interface ChatCenterProps {
  selectedGroupId?: string;
}

export default function ChatCenter({ selectedGroupId }: ChatCenterProps) {
  const [newMessage, setNewMessage] = useState('');
  const [selectedChatId, setSelectedChatId] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { groups, messages, addMessage, getStudentsByGroup, getActiveGroups, users } = useData();

  const teacherGroups = getActiveGroups(user?.id || '');
  const availableGroups = selectedGroupId 
    ? teacherGroups.filter(group => group.id === selectedGroupId)
    : teacherGroups;

  // Set default chat if none selected
  useEffect(() => {
    if (!selectedChatId && availableGroups.length > 0) {
      setSelectedChatId(availableGroups[0].id);
    }
  }, [availableGroups, selectedChatId]);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedChatId) return;

    addMessage({
      senderId: user?.id || '',
      content: newMessage.trim(),
      type: 'group',
      groupId: selectedChatId
    });

    setNewMessage('');
  };

  const getChatMessages = (groupId: string) => {
    return messages
      .filter(msg => msg.groupId === groupId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  };

  const getMessageCount = (groupId: string) => {
    return messages.filter(msg => msg.groupId === groupId).length;
  };

  const getUserName = (userId: string) => {
    const foundUser = users.find(u => u.id === userId);
    return foundUser ? `${foundUser.firstName} ${foundUser.lastName}` : 'Utilisateur inconnu';
  };

  const getUserPicture = (userId: string) => {
    const foundUser = users.find(u => u.id === userId);
    return foundUser?.picture;
  };

  const isCurrentUser = (userId: string) => {
    return userId === user?.id;
  };

  const selectedGroup = groups.find(g => g.id === selectedChatId);
  const chatMessages = selectedChatId ? getChatMessages(selectedChatId) : [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">
          {selectedGroupId ? `Chat - Groupe ${groups.find(g => g.id === selectedGroupId)?.name}` : 'Centre de Chat'}
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[600px]">
        {/* Liste des chats (sidebar) */}
        <div className="lg:col-span-1 bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-primary-600" />
              Chats de Groupe
            </h3>
          </div>
          
          <div className="overflow-y-auto h-full">
            {availableGroups.length === 0 ? (
              <div className="p-4 text-center">
                <Users className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Aucun groupe disponible</p>
              </div>
            ) : (
              <div className="space-y-1 p-2">
                {availableGroups.map((group) => {
                  const messageCount = getMessageCount(group.id);
                  const isSelected = selectedChatId === group.id;
                  
                  return (
                    <button
                      key={group.id}
                      onClick={() => setSelectedChatId(group.id)}
                      className={`w-full p-3 text-left rounded-lg transition-colors ${
                        isSelected
                          ? 'bg-primary-100 text-primary-700 border border-primary-200'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                            <Users className="w-5 h-5 text-primary-600" />
                          </div>
                          <div>
                            <p className="font-medium">Groupe {group.name}</p>
                            <p className="text-xs text-gray-600">
                              {group.studentIds.length} élèves
                            </p>
                          </div>
                        </div>
                        {messageCount > 0 && (
                          <span className="px-2 py-1 text-xs rounded-full bg-primary-200 text-primary-800">
                            {messageCount}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Zone de chat principale */}
        <div className="lg:col-span-3 bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col">
          {selectedGroup ? (
            <>
              {/* En-tête du chat */}
              <div className="p-4 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                    <Users className="w-6 h-6 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Groupe {selectedGroup.name}</h3>
                    <p className="text-sm text-gray-600">
                      {selectedGroup.description} • {selectedGroup.studentIds.length} élèves
                    </p>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {chatMessages.length === 0 ? (
                  <div className="text-center py-12">
                    <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-2">Aucun message dans ce chat</p>
                    <p className="text-sm text-gray-500">Commencez la conversation avec vos élèves !</p>
                  </div>
                ) : (
                  <>
                    {chatMessages.map((message) => {
                      const isOwn = isCurrentUser(message.senderId);
                      const senderPicture = getUserPicture(message.senderId);
                      const senderName = getUserName(message.senderId);
                      
                      return (
                        <div
                          key={message.id}
                          className={`flex gap-3 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}
                        >
                          <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center flex-shrink-0">
                            {senderPicture ? (
                              <img
                                src={senderPicture}
                                alt={senderName}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <User className="w-4 h-4 text-gray-400" />
                            )}
                          </div>
                          
                          <div className={`max-w-xs lg:max-w-md ${isOwn ? 'text-right' : 'text-left'}`}>
                            <div className={`inline-block p-3 rounded-lg ${
                              isOwn 
                                ? 'bg-primary-600 text-white' 
                                : 'bg-gray-100 text-gray-900'
                            }`}>
                              <p className="text-sm">{message.content}</p>
                            </div>
                            <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
                              <span>{isOwn ? 'Vous' : senderName}</span>
                              <span>•</span>
                              <span>{format(message.createdAt, 'HH:mm')}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>

              {/* Zone de saisie */}
              <div className="p-4 border-t border-gray-200">
                <form onSubmit={handleSendMessage} className="flex gap-3">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder={`Écrire un message au Groupe ${selectedGroup.name}...`}
                    className="flex-1 input"
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="btn-primary flex items-center gap-2 px-4 py-2"
                  >
                    <Send className="w-4 h-4" />
                    Envoyer
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">Sélectionnez un groupe pour commencer à chatter</p>
                <p className="text-sm text-gray-500">Choisissez un groupe dans la liste de gauche</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}