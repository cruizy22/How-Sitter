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
  const [error, setError] = useState<string | null>(null);
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
      setError(null);
      const response = await api.getArrangements();
      
      // Handle different response formats
      let arrangementsList = [];
      if (response && response.arrangements) {
        arrangementsList = response.arrangements;
      } else if (Array.isArray(response)) {
        arrangementsList = response;
      }
      
      // Filter active arrangements (not cancelled/completed)
      const activeArrangements = arrangementsList.filter(
        (arr: any) => arr.status !== 'cancelled' && arr.status !== 'completed'
      );
      
      setArrangements(activeArrangements);
      
      if (activeArrangements.length > 0) {
        setSelectedArrangement(activeArrangements[0]);
        fetchMessages(activeArrangements[0].id);
      }
    } catch (error: any) {
      console.error('Failed to fetch arrangements:', error);
      setError(error.message || 'Failed to load conversations');
      setArrangements([]);
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
      setMessages([]);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedArrangement) return;

    try {
      const response = await api.sendArrangementMessage(selectedArrangement.id, newMessage.trim());
      
      const newMsg = {
        id: response.messageId || Date.now().toString(),
        sender_id: user?.id,
        sender_name: user?.name,
        sender_avatar: user?.avatar_url,
        message: newMessage.trim(),
        created_at: new Date().toISOString(),
        via_whatsapp: false
      };
      
      setMessages([...messages, newMsg]);
      setNewMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
      alert('Failed to send message. You can also use WhatsApp directly.');
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const getOtherPartyName = (arrangement: any) => {
    if (!user || !arrangement) return '';
    return user.role === 'homeowner' ? arrangement.sitter_name : arrangement.homeowner_name;
  };

  const getOtherPartyWhatsApp = (arrangement: any) => {
    if (!user || !arrangement) return '6588888888'; // Default fallback
    
    if (user.role === 'homeowner') {
      return arrangement.sitter_whatsapp || arrangement.whatsapp_number || '6588888888';
    } else {
      return arrangement.homeowner_whatsapp || arrangement.whatsapp_number || '6588888888';
    }
  };

  const getWhatsAppMessage = (arrangement: any) => {
    const otherParty = getOtherPartyName(arrangement);
    return encodeURIComponent(`Hi ${otherParty}, regarding our arrangement at ${arrangement?.property_title || 'the property'}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your conversations...</p>
          <p className="text-sm text-gray-500">How Sitter Messaging</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
            <i className="fas fa-exclamation-triangle text-red-500 text-3xl"></i>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Messages</h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={fetchArrangements}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Brand Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">How Sitter Messages</h1>
            <p className="text-gray-600">
              Communicate directly with your house sitting partners via platform or WhatsApp
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center">
              <i className="fas fa-comments text-white"></i>
            </div>
            <span className="text-2xl font-bold text-gray-900">How Sitter</span>
          </div>
        </div>

        {/* WhatsApp Integration Banner - Only show if arrangement selected */}
        {selectedArrangement && (
          <div className="mb-6 bg-gradient-to-r from-green-50 to-green-100 rounded-2xl p-6 border border-green-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full bg-green-600 flex items-center justify-center mr-4">
                  <i className="fab fa-whatsapp text-white text-xl"></i>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Direct WhatsApp Communication</h3>
                  <p className="text-gray-600 text-sm">
                    Use WhatsApp for real-time conversations. All arrangements include WhatsApp contact.
                  </p>
                </div>
              </div>
              <a
                href={`https://wa.me/${getOtherPartyWhatsApp(selectedArrangement)}?text=${getWhatsAppMessage(selectedArrangement)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center shadow-md hover:shadow-lg"
              >
                <i className="fab fa-whatsapp mr-2"></i>
                Open WhatsApp
              </a>
            </div>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Arrangements List */}
          <div className="lg:w-1/3">
            <div className="bg-white rounded-2xl border-2 border-green-200 shadow-xl overflow-hidden">
              <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-green-50 to-white">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-gray-900">Conversations</h2>
                  <span className="text-sm text-green-600 bg-green-100 px-3 py-1 rounded-full">
                    {arrangements.length} active
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1">Select an arrangement to message</p>
              </div>
              <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
                {arrangements.length === 0 ? (
                  <div className="p-6 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-green-100 to-blue-100 rounded-full flex items-center justify-center">
                      <i className="fas fa-comment text-green-400 text-2xl"></i>
                    </div>
                    <p className="text-gray-600">No active conversations yet</p>
                    <p className="text-gray-500 text-sm mt-2">Start by booking a property or accepting a sitter</p>
                    <button
                      onClick={() => window.location.href = user?.role === 'sitter' ? '/properties' : '/sitters'}
                      className="mt-4 text-green-600 hover:text-green-700 font-medium"
                    >
                      Browse {user?.role === 'sitter' ? 'Properties' : 'Sitters'} →
                    </button>
                  </div>
                ) : (
                  arrangements.map((arrangement) => (
                    <button
                      key={arrangement.id}
                      onClick={() => {
                        setSelectedArrangement(arrangement);
                        fetchMessages(arrangement.id);
                      }}
                      className={`w-full text-left p-6 hover:bg-green-50 transition-colors ${
                        selectedArrangement?.id === arrangement.id ? 'bg-green-50 border-l-4 border-green-600' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-bold text-gray-900 line-clamp-1">
                          {arrangement.property_title || 'Property'}
                        </h3>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          arrangement.status === 'active' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {arrangement.status || 'Active'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-1">
                        With: {getOtherPartyName(arrangement) || 'Unknown'}
                      </p>
                      <div className="flex justify-between items-center text-sm text-gray-500">
                        <div className="flex items-center">
                          <i className="fas fa-calendar mr-1"></i>
                          <span>{formatDate(arrangement.start_date)} - {formatDate(arrangement.end_date)}</span>
                        </div>
                        <div className="flex items-center">
                          <i className="fas fa-comment mr-1"></i>
                          <span>{arrangement.message_count || 0}</span>
                        </div>
                      </div>
                      {/* WhatsApp Direct Link */}
                      <div className="mt-3">
                        <a
                          href={`https://wa.me/${getOtherPartyWhatsApp(arrangement)}?text=${getWhatsAppMessage(arrangement)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-green-600 hover:text-green-700 flex items-center"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <i className="fab fa-whatsapp mr-1"></i>
                          Message on WhatsApp
                        </a>
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
              <div className="bg-white rounded-2xl border-2 border-green-200 shadow-xl h-[600px] flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-green-50 to-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">{selectedArrangement.property_title || 'Property'}</h2>
                      <div className="flex items-center text-gray-600">
                        <span>With: {getOtherPartyName(selectedArrangement) || 'Unknown'}</span>
                        <span className="mx-2">•</span>
                        <span className="text-sm">
                          {formatDate(selectedArrangement.start_date)} - {formatDate(selectedArrangement.end_date)}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500">Monthly Amount</div>
                      <div className="font-bold text-green-600">${selectedArrangement.monthly_amount || 0}</div>
                      <div className="text-xs text-gray-500">Security: ${selectedArrangement.security_deposit || 0}</div>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 p-6 overflow-y-auto bg-gradient-to-b from-white to-green-50/30">
                  {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center">
                      <div className="text-center">
                        <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-green-100 to-blue-100 rounded-full flex items-center justify-center">
                          <i className="fas fa-comments text-green-400 text-2xl"></i>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No messages yet</h3>
                        <p className="text-gray-600 mb-6">Start the conversation about your house sitting arrangement</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* Payment Reminder */}
                      {selectedArrangement.transaction_count === 0 && (
                        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg mb-4">
                          <div className="flex items-start">
                            <i className="fas fa-exclamation-circle text-yellow-500 mt-1 mr-3"></i>
                            <div>
                              <p className="font-bold text-yellow-800">Payment Reminder</p>
                              <p className="text-yellow-700 text-sm mt-1">
                                First transaction must use PayPal through How Sitter for at least 50% of the booking amount.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[70%] rounded-2xl p-4 ${
                              message.sender_id === user?.id
                                ? 'bg-gradient-to-r from-green-600 to-green-700 text-white rounded-br-none'
                                : 'bg-gray-100 text-gray-900 rounded-bl-none'
                            }`}
                          >
                            <div className="flex items-center mb-2">
                              {message.sender_avatar ? (
                                <img
                                  src={message.sender_avatar}
                                  className="w-8 h-8 rounded-full mr-2 border-2 border-white"
                                  alt={message.sender_name}
                                />
                              ) : (
                                <div className={`w-8 h-8 rounded-full ${message.sender_id === user?.id ? 'bg-green-800' : 'bg-blue-100'} flex items-center justify-center mr-2`}>
                                  <i className={`fas fa-user ${message.sender_id === user?.id ? 'text-white' : 'text-blue-600'} text-xs`}></i>
                                </div>
                              )}
                              <span className="font-medium">{message.sender_name}</span>
                              <span className={`ml-2 text-xs ${message.sender_id === user?.id ? 'text-green-200' : 'text-gray-500'}`}>
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
                <div className="p-6 border-t border-gray-200 bg-white">
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
                      placeholder="Type your message here..."
                      rows={3}
                      className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none transition-all"
                    />
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim()}
                        className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-6 py-3 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
                      >
                        Send
                      </button>
                      {selectedArrangement && (
                        <a
                          href={`https://wa.me/${getOtherPartyWhatsApp(selectedArrangement)}?text=${encodeURIComponent(newMessage || '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-xl font-semibold flex items-center justify-center text-sm shadow-md hover:shadow-lg"
                        >
                          <i className="fab fa-whatsapp mr-2"></i>
                          Send via WhatsApp
                        </a>
                      )}
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center">
                      <i className="fas fa-info-circle mr-2 text-green-500"></i>
                      <span>Messages are saved for reference. Use WhatsApp for urgent matters.</span>
                    </div>
                    <span>Press Enter to send, Shift+Enter for new line</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border-2 border-green-200 shadow-xl h-[600px] flex items-center justify-center">
                <div className="text-center">
                  <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-green-100 to-blue-100 rounded-full flex items-center justify-center">
                    <i className="fas fa-comments text-green-400 text-2xl"></i>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Select a conversation</h3>
                  <p className="text-gray-600 mb-6">Choose a house sitting arrangement from the list to start messaging</p>
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
  try {
    if (!dateString) return 'TBD';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  } catch {
    return dateString || 'TBD';
  }
};

const formatTime = (dateString: string) => {
  try {
    if (!dateString) return '';
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return '';
  }
};