import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Send, MessageCircle, User, ShieldCheck, Video } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { VideoCallModal } from '../../components/collaboration/VideoCallModal';

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: string;
}

interface Conversation {
  id: string;
  participantId: string;
  participantName: string;
  participantRole: 'entrepreneur' | 'investor';
  lastMessage: string;
  timestamp: string;
  messages: Message[];
}

const INITIAL_CONVERSATIONS: Conversation[] = [
  {
    id: 'conv_1',
    participantId: 'user_investor_1',
    participantName: 'Robert Soros (Investor)',
    participantRole: 'investor',
    lastMessage: 'I reviewed your financial pitch deck, let\'s chat.',
    timestamp: '10:42 AM',
    messages: [
      { id: 'm1', senderId: 'user_investor_1', senderName: 'Robert Soros', text: 'Hello! I am highly interested in your marketplace SaaS module.', timestamp: '10:40 AM' },
      { id: 'm2', senderId: 'current_user', senderName: 'Me', text: 'Thank you Robert! Glad to hear. I can share the prototype data link.', timestamp: '10:41 AM' },
      { id: 'm3', senderId: 'user_investor_1', senderName: 'Robert Soros', text: 'I reviewed your financial pitch deck, let\'s chat.', timestamp: '10:42 AM' }
    ]
  },
  {
    id: 'conv_2',
    participantId: 'user_entrepreneur_2',
    participantName: 'Ayesha Khan (HealthTech)',
    participantRole: 'entrepreneur',
    lastMessage: 'Looking forward to our scheduled slot tomorrow.',
    timestamp: 'Yesterday',
    messages: [
      { id: 'm4', senderId: 'user_entrepreneur_2', senderName: 'Ayesha Khan', text: 'Looking forward to our scheduled slot tomorrow.', timestamp: 'Yesterday' }
    ]
  }
];

export const MessagesPage: React.FC = () => {
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [conversations, setConversations] = useState<Conversation[]>(() => {
    const saved = localStorage.getItem('nexus_chat_data');
    return saved ? JSON.parse(saved) : INITIAL_CONVERSATIONS;
  });
  const [activeConvId, setActiveConvId] = useState<string | null>(conversations[0]?.id || null);
  const [typedMessage, setTypedMessage] = useState('');

  // --- VIDEO CALL MODAL STATE ---
  const [isVideoCallOpen, setIsVideoCallOpen] = useState(false);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConvId, conversations]);

  useEffect(() => {
    localStorage.setItem('nexus_chat_data', JSON.stringify(conversations));
  }, [conversations]);

  if (!user) return null;

  const activeConversation = conversations.find(c => c.id === activeConvId);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!typedMessage.trim() || !activeConvId) return;

    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    const newMsg: Message = {
      id: String(Date.now()),
      senderId: user.id,
      senderName: user.name,
      text: typedMessage.trim(),
      timestamp: currentTime
    };

    setConversations(prevConvs => 
      prevConvs.map(conv => {
        if (conv.id === activeConvId) {
          return {
            ...conv,
            lastMessage: typedMessage.trim(),
            timestamp: currentTime,
            messages: [...conv.messages, newMsg]
          };
        }
        return conv;
      })
    );

    setTypedMessage('');
  };

  return (
    <div className="h-[calc(100vh-7rem)] bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden flex animate-fade-in">
      
      {/* LEFT PANEL */}
      <div className="w-1/3 border-r border-gray-200 flex flex-col bg-gray-50/50">
        <div className="p-4 border-b border-gray-200 bg-white">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <MessageCircle className="text-blue-600" size={20} />
            Inbox Messages
          </h2>
        </div>
        <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
          {conversations.map((conv) => (
            <div
              key={conv.id}
              onClick={() => setActiveConvId(conv.id)}
              className={`p-4 cursor-pointer transition flex items-start gap-3 relative ${
                activeConvId === conv.id ? 'bg-blue-50/70 border-l-4 border-blue-600' : 'hover:bg-gray-50 bg-white'
              }`}
            >
              <div className="p-2.5 bg-gray-100 text-gray-600 rounded-full">
                <User size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline mb-0.5">
                  <h4 className="font-semibold text-sm text-gray-900 truncate">{conv.participantName}</h4>
                  <span className="text-xs text-gray-400 whitespace-nowrap">{conv.timestamp}</span>
                </div>
                <p className="text-xs text-gray-500 truncate">{conv.lastMessage}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="w-2/3 flex flex-col bg-white">
        {activeConversation ? (
          <>
            {/* Header with Video Call Action */}
            <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-white shadow-sm z-10">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 text-blue-700 rounded-full">
                  <User size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-sm flex items-center gap-1.5">
                    {activeConversation.participantName}
                    <ShieldCheck size={16} className="text-emerald-500" />
                  </h3>
                  <span className="text-xs text-gray-400 capitalize font-medium">{activeConversation.participantRole} Account</span>
                </div>
              </div>

              {/* --- ADDED VIDEO CALL ACTION BUTTON --- */}
              <button 
                onClick={() => setIsVideoCallOpen(true)}
                className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl shadow-sm text-xs font-semibold transition"
              >
                <Video size={16} />
                Start Meeting Call
              </button>
            </div>

            {/* Message Stream */}
            <div className="flex-1 p-4 overflow-y-auto bg-slate-50 space-y-4">
              {activeConversation.messages.map((msg) => {
                const isMe = msg.senderId === user.id || msg.senderName === 'Me';
                return (
                  <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] rounded-2xl p-3.5 shadow-sm text-sm ${
                      isMe 
                        ? 'bg-blue-600 text-white rounded-tr-none' 
                        : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'
                    }`}>
                      <p className="leading-relaxed">{msg.text}</p>
                      <span className={`text-[10px] block mt-1 text-right ${isMe ? 'text-blue-200' : 'text-gray-400'}`}>
                        {msg.timestamp}
                      </span>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Bottom Input */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 bg-white flex gap-3 items-center">
              <input
                type="text"
                value={typedMessage}
                onChange={(e) => setTypedMessage(e.target.value)}
                placeholder="Type your message here..."
                className="flex-1 p-3 bg-gray-50 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 text-sm transition"
              />
              <Button type="submit" size="md" className="!rounded-xl px-4 py-3 bg-blue-600">
                <Send size={16} />
              </Button>
            </form>

            {/* --- MOUNTED VIDEO CALL COMPONENT INSTANCE --- */}
            <VideoCallModal 
              isOpen={isVideoCallOpen} 
              onClose={() => setIsVideoCallOpen(false)} 
              participantName={activeConversation.participantName}
            />
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 bg-gray-50/50">
            <div className="bg-gray-100 p-6 rounded-full mb-4">
              <MessageCircle size={32} className="text-gray-400" />
            </div>
            <h2 className="text-xl font-medium text-gray-900">Select a connection</h2>
            <p className="text-gray-500 text-center mt-2 max-w-sm text-sm">
              Choose an entrepreneur or investor from the sidebar list to view communications.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};