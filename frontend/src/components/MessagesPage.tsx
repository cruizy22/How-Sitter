// src/components/MessagesPage.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';
import { api } from '../services/api';

export const MessagesPage: React.FC = () => {
  const { user } = useAuth();
  const [arrangements, setArrangements] = useState<any[]>([]);
  const [selectedArrangement, setSelectedArrangement] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchArrangements();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchArrangements = async () => {
    try {
      setLoading(true);
      const response = await api.getArrangements();
      setArrangements(response.arrangements || []);
      
      if (response.arrangements.length > 0) {
        setSelectedArrangement(response.arrangements[0]);
        fetchMessages(response.arrangements[0].id);
      }
    } catch (error) {
      console.error('Failed to fetch arrangements:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (arrangementId: string) => {
    try {
      const response = await api.getArrangementMessages(arrangementId);
      setMessages(response.messages || []);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedArrangement) return;

    try {
      const response = await api.sendArrangementMessage(selectedArrangement.id, newMessage.trim());
      
      const newMsg = {
        id: response.messageId,
        sender_id: user?.id,
        sender_name: user?.name,
        sender_avatar: user?.avatar_url,
        message: newMessage.trim(),
        created_at: new Date().toISOString()
      };
      
      setMessages([...messages, newMsg]);
      setNewMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
      alert('Failed to send message. Please try again.');
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const getOtherPartyName = (arrangement: any) => {
    if (!user) return '';
    return user.role === 'homeowner' ? arrangement.sitter_name : arrangement.homeowner_name;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Messages</h1>
          <p className="text-gray-600">Communicate with your house sitting partners</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Arrangements List */}
          <div className="lg:w-1/3">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Conversations</h2>
              </div>
              <div className="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
                {arrangements.length === 0 ? (
                  <div className="p-6 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                      <i className="fas fa-comment text-gray-400 text-2xl"></i>
                    </div>
                    <p className="text-gray-600">No conversations yet</p>
                    <p className="text-gray-500 text-sm mt-2">Start by booking a property</p>
                  </div>
                ) : (
                  arrangements.map((arrangement) => (
                    <button
                      key={arrangement.id}
                      onClick={() => {
                        setSelectedArrangement(arrangement);
                        fetchMessages(arrangement.id);
                      }}
                      className={`w-full text-left p-6 hover:bg-gray-50 transition-colors ${
                        selectedArrangement?.id === arrangement.id ? 'bg-primary/5' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium text-gray-900 line-clamp-1">
                          {arrangement.property_title}
                        </h3>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          arrangement.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          arrangement.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                          arrangement.status === 'active' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {arrangement.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-1">
                        With: {getOtherPartyName(arrangement)}
                      </p>
                      <div className="flex justify-between text-sm text-gray-500">
                        <span>{formatDate(arrangement.start_date)} - {formatDate(arrangement.end_date)}</span>
                        <span>{arrangement.message_count || 0} messages</span>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Messages Panel */}
          <div className="lg:w-2/3">
            {selectedArrangement ? (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm h-[600px] flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">{selectedArrangement.property_title}</h2>
                      <p className="text-gray-600">
                        With: {getOtherPartyName(selectedArrangement)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">
                        {formatDate(selectedArrangement.start_date)} - {formatDate(selectedArrangement.end_date)}
                      </p>
                      <p className="font-medium text-gray-900">${selectedArrangement.total_amount}</p>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 p-6 overflow-y-auto">
                  {messages.length === 0 ? (
                    <div className="h-full flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                          <i className="fas fa-comments text-gray-400 text-2xl"></i>
                        </div>
                        <p className="text-gray-600">No messages yet</p>
                        <p className="text-gray-500 text-sm mt-2">Start the conversation</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[70%] rounded-2xl p-4 ${
                              message.sender_id === user?.id
                                ? 'bg-primary text-white rounded-br-none'
                                : 'bg-gray-100 text-gray-900 rounded-bl-none'
                            }`}
                          >
                            <div className="flex items-center mb-2">
                              {message.sender_avatar ? (
                                <img
                                  src={message.sender_avatar}
                                  className="w-8 h-8 rounded-full mr-2"
                                  alt={message.sender_name}
                                />
                              ) : (
                                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center mr-2">
                                  <i className="fas fa-user text-primary text-xs"></i>
                                </div>
                              )}
                              <span className="font-medium">{message.sender_name}</span>
                              <span className={`ml-2 text-xs ${message.sender_id === user?.id ? 'text-primary-200' : 'text-gray-500'}`}>
                                {formatTime(message.created_at)}
                              </span>
                            </div>
                            <p className="whitespace-pre-wrap">{message.message}</p>
                          </div>
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>
                  )}
                </div>

                {/* Input */}
                <div className="p-6 border-t border-gray-200">
                  <div className="flex gap-3">
                    <textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      placeholder="Type your message..."
                      rows={3}
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim()}
                      className="self-end bg-primary hover:bg-primary-hover text-white px-6 py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Send
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm h-[600px] flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <i className="fas fa-comments text-gray-400 text-2xl"></i>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Select a conversation</h3>
                  <p className="text-gray-600">Choose a conversation from the list to start messaging</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper functions
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });
};

const formatTime = (dateString: string) => {
  return new Date(dateString).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });
};