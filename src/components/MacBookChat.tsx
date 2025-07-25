import React, { useState, useRef, useEffect } from 'react';
import { Send, Smile, ThumbsUp, Heart, Star, Zap, BellOff, UserCheck } from 'lucide-react';
import { isTextInappropriate } from '../utils/textModeration';
import type { Message as GlobalMessage } from '../types';

interface ChatMessage {
  id: string;
  text: string;
  sender: string;
  timestamp: Date;
  reactions?: ('thumbsUp' | 'heart' | 'star' | 'zap')[];
}

export default function MacBookChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isExamMode, setIsExamMode] = useState(false);
  const [showReactions, setShowReactions] = useState<string | null>(null);
  const [inappropriateCount, setInappropriateCount] = useState(0);
  const [isBanned, setIsBanned] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Sample messages for demo
    const demoMessages: ChatMessage[] = [
      { id: '1', text: "Salut tout le monde ! 🎵", sender: "Marie-Claude", timestamp: new Date(Date.now() - 300000) },
      { id: '2', text: "Bonjour ! Comment ça va avec votre pratique du piano ?", sender: "Alexandre", timestamp: new Date(Date.now() - 240000) },
      { id: '3', text: "Très bien ! J'ai réussi à jouer le morceau de Chopin ! 🎹", sender: "Marie-Claude", timestamp: new Date(Date.now() - 180000) },
      { id: '4', text: "Félicitations ! C'est un beau morceau. Tu veux qu'on le joue ensemble ?", sender: "Sophie", timestamp: new Date(Date.now() - 120000) },
      { id: '5', text: "Oui, ça serait super ! On peut essayer demain ?", sender: "Marie-Claude", timestamp: new Date(Date.now() - 60000) }
    ];
    setMessages(demoMessages);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (isTextInappropriate(newMessage)) {
      const newCount = inappropriateCount + 1;
      setInappropriateCount(newCount);
      
      if (newCount >= 3) {
        setIsBanned(true);
        alert("Vous avez été banni du chat pour l'envoi de contenu inapproprié. Veuillez contacter votre enseignant.");
      } else {
        alert(`Attention, ce contenu est inapproprié. Au bout de 3 avertissements, vous serez banni. (Tentative ${newCount}/3)`);
      }
      setNewMessage('');
      return;
    }

    if (newMessage.trim()) {
      const message: ChatMessage = {
        id: Date.now().toString(),
        text: newMessage,
        sender: "Vous",
        timestamp: new Date()
      };
      setMessages([...messages, message]);
      setNewMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const addReaction = (messageId: string, reaction: 'thumbsUp' | 'heart' | 'star' | 'zap') => {
    setMessages(messages.map(msg => {
      if (msg.id === messageId) {
        return {
          ...msg,
          reactions: [...(msg.reactions || []), reaction]
        };
      }
      return msg;
    }));
    setShowReactions(null);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('fr-CA', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getReactionIcon = (reaction: string) => {
    switch (reaction) {
      case 'thumbsUp': return <ThumbsUp className="w-3 h-3" />;
      case 'heart': return <Heart className="w-3 h-3" />;
      case 'star': return <Star className="w-3 h-3" />;
      case 'zap': return <Zap className="w-3 h-3" />;
      default: return null;
    }
  };

  return (
    <div className="relative w-full max-w-6xl mx-auto transform translate-y-[50px]">
      {/* Chat Interface */}
      <div className="flex items-center justify-center">
        <div className="w-[640px] h-[850px] overflow-hidden rounded-2xl border border-gray-200 shadow-lg bg-white">
          {/* Chat Header */}
          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 h-[120px] p-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
              <span className="text-white text-sm font-semibold">En ligne</span>
            </div>
            <button
              onClick={() => setIsExamMode(!isExamMode)}
              className={`px-3 py-1.5 text-sm font-semibold rounded-lg flex items-center gap-2 transition-all ${
                isExamMode
                  ? 'bg-red-600 text-white'
                  : 'bg-white/30 text-white hover:bg-white/50'
              }`}
            >
              <BellOff className="w-4 h-4" />
              {isExamMode ? "Reprendre le Chat" : "Arrêt pour examen"}
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto h-[calc(100%-200px)] p-4" style={{ overscrollBehavior: 'contain' }}>
            {isExamMode ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <BellOff className="w-16 h-16 text-gray-400 mb-4" />
                <h3 className="text-xl font-bold text-gray-800">Mode Examen Activé</h3>
                <p className="text-gray-500">Le chat est temporairement désactivé.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message) => (
                  <div key={message.id} className="flex flex-col">
                    <div className={`flex ${message.sender === "Vous" ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                        message.sender === "Vous" 
                          ? "bg-gradient-to-r from-yellow-400 to-orange-500 text-white" 
                          : "bg-transparent text-gray-800"
                      }`}>
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-semibold text-sm">{message.sender}</span>
                          <span className="text-xs opacity-70">{formatTime(message.timestamp)}</span>
                        </div>
                        <p className={`text-sm ${isTextInappropriate(message.text) ? 'blur-sm' : ''}`}>{message.text}</p>
                        
                        {/* Reactions */}
                        {message.reactions && message.reactions.length > 0 && (
                          <div className="flex items-center space-x-1 mt-2">
                            {message.reactions.map((reaction, index) => (
                              <div key={index} className="bg-transparent rounded-full p-1">
                                {getReactionIcon(reaction)}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Reaction Button */}
                    <div className={`flex ${message.sender === "Vous" ? "justify-end" : "justify-start"} mt-1`}>
                      <button
                        onClick={() => setShowReactions(showReactions === message.id ? null : message.id)}
                        className="text-gray-400 hover:text-gray-600 text-xs px-2 py-1 rounded"
                      >
                        Réagir
                      </button>
                    </div>
                    
                    {/* Reaction Picker */}
                    {showReactions === message.id && (
                      <div className={`flex ${message.sender === "Vous" ? "justify-end" : "justify-start"} mt-1`}>
                        <div className="bg-transparent rounded-full px-2 py-1 flex space-x-1 shadow-lg">
                          <button
                            onClick={() => addReaction(message.id, 'thumbsUp')}
                            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                          >
                            <ThumbsUp className="w-4 h-4 text-blue-500" />
                          </button>
                          <button
                            onClick={() => addReaction(message.id, 'heart')}
                            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                          >
                            <Heart className="w-4 h-4 text-red-500" />
                          </button>
                          <button
                            onClick={() => addReaction(message.id, 'star')}
                            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                          >
                            <Star className="w-4 h-4 text-yellow-500" />
                          </button>
                          <button
                            onClick={() => addReaction(message.id, 'zap')}
                            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                          >
                            <Zap className="w-4 h-4 text-purple-500" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Message Input */}
          <div className="bg-white p-4">
            {isBanned ? (
              <div className="text-center">
                <p className="text-red-600 font-bold mb-2">Vous êtes banni de ce chat.</p>
                <p className="text-sm text-gray-600 mb-4">Contactez votre enseignant pour être réintégré.</p>
                <button
                  onClick={() => {
                    setIsBanned(false);
                    setInappropriateCount(0);
                    alert("Vous avez été réintégré par l'enseignant.");
                  }}
                  className="btn-primary flex items-center gap-2 mx-auto"
                >
                  <UserCheck className="w-4 h-4" />
                  Simuler la réintégration par l'enseignant
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <button className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-colors">
                  <Smile className="w-5 h-5" />
                </button>
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Tapez votre message..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    disabled={isExamMode || isBanned}
                  />
                </div>
                <button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || isExamMode || isBanned}
                  className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white p-2 rounded-full hover:from-yellow-500 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 