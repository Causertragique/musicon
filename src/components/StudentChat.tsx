import React, { useState, useRef, useEffect } from 'react';
import { Send, MessageSquare, Users, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { format } from 'date-fns';

interface StudentChatProps {
  groupId?: string;
}

export default function StudentChat({ groupId }: StudentChatProps) {
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { groups, messages, addMessage, users } = useData();

  const group = groups.find(g => g.id === groupId);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !groupId) return;

    addMessage({
      senderId: user?.id || '',
      content: newMessage.trim(),
      type: 'group',
      groupId: groupId
    });

    setNewMessage('');
  };

  const getChatMessages = () => {
    if (!groupId) return [];
    return messages
      .filter(msg => msg.groupId === groupId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
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

  const chatMessages = getChatMessages();

  if (!group) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">Chat de Groupe</h2>
        <div className="text-center py-12">
          <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Vous n'êtes assigné à aucun groupe pour le moment</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Chat - Groupe {group.name}</h2>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col h-[600px]">
        {/* En-tête du chat */}
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
              <Users className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Groupe {group.name}</h3>
              <p className="text-sm text-gray-600">
                {group.description} • {group.studentIds.length} élèves
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
              <p className="text-sm text-gray-500">Commencez la conversation avec votre professeur !</p>
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
              placeholder={`Écrire un message au Groupe ${group.name}...`}
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
      </div>
    </div>
  );
}