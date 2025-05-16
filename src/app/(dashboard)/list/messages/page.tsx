'use client';

import { useEffect, useRef, useState } from 'react';
import io, { Socket } from 'socket.io-client';
import Image from 'next/image';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

interface MiniUser {
  _id: string;
  username: string;
  role: string;
}

interface Conversation {
  _id: string;
  participants: MiniUser[];
}

interface Message {
  _id: string;
  conversation: string;
  sender: MiniUser | string;
  text: string;
  createdAt: string;
  status?: 'sending' | 'sent' | 'delivered' | 'read' | 'error';
}

export default function MessagesPage() {
  const [token, setToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [convs, setConvs] = useState<Conversation[]>([]);
  const [sel, setSel] = useState<Conversation | null>(null);
  const [qry, setQry] = useState('');
  const [thera, setThera] = useState<MiniUser[]>([]);
  const [busy, setBusy] = useState(true);
  const [msgs, setMsgs] = useState<Message[]>([]);
  const [txt, setTxt] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [whoIsTyping, setWhoIsTyping] = useState<string[]>([]);
  const [socketConnected, setSocketConnected] = useState(false);
  
  const bottomRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  const currentRoomRef = useRef<string | null>(null);
  const socketRef = useRef<Socket | null>(null);

  // Initialize auth state
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedToken = localStorage.getItem('token');
      const storedUserId = localStorage.getItem('userId');
      setToken(storedToken);
      setUserId(storedUserId);
    }
  }, []);

  interface MessageUpdate {
    messageId: string;
    status: Message['status'];
  }

  // Initialize socket once we have token
  useEffect(() => {
    if (!token || socketRef.current) return;

    console.log('Initializing socket connection...');

    const newSocket = io(API, { 
      auth: { token },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000
    });

    const handleConnect = () => {
      console.log('Socket connected:', newSocket.id);
      setSocketConnected(true);
      if (currentRoomRef.current) {
        console.log('Reconnected, rejoining room:', currentRoomRef.current);
        newSocket.emit('join', currentRoomRef.current);
      }
    };

    const handleDisconnect = (reason: string) => {
      console.log('Socket disconnected:', reason);
      setSocketConnected(false);
    };

    const handleConnectError = (error: Error) => {
      console.error('Socket connection error:', error);
      setSocketConnected(false);
    };

    newSocket.on('connect', handleConnect);
    newSocket.on('disconnect', handleDisconnect);
    newSocket.on('connect_error', handleConnectError);
    
    socketRef.current = newSocket;

    // Load initial conversations after socket connects
    fetch(`${API}/api/chat/conversations`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(setConvs)
      .catch(console.error)
      .finally(() => setBusy(false));

    return () => {
      console.log('Cleaning up socket connection...');
      newSocket.off('connect', handleConnect);
      newSocket.off('disconnect', handleDisconnect);
      newSocket.off('connect_error', handleConnectError);
      
      if (currentRoomRef.current) {
        newSocket.emit('leave', currentRoomRef.current);
      }
      newSocket.disconnect();
      socketRef.current = null;
      setSocketConnected(false);
    };
  }, [token]);

  // Handle room joining and message events
  useEffect(() => {
    if (!socketConnected || !socketRef.current || !sel || !sel._id) return;

    console.log('Setting up message handlers for room:', sel._id);
    const currentSocket = socketRef.current;

    // Leave previous room if any
    if (currentRoomRef.current && currentRoomRef.current !== sel._id) {
      console.log('Leaving previous room:', currentRoomRef.current);
      currentSocket.emit('leave', currentRoomRef.current);
    }

    // Join new room if not already in it
    if (currentRoomRef.current !== sel._id) {
      console.log('Joining new room:', sel._id);
      currentSocket.emit('join', sel._id);
      currentRoomRef.current = sel._id;
    }

    // Load messages for this conversation
    if (token) {
      fetch(`${API}/api/chat/${sel._id}/messages`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(r => r.json())
        .then(messages => {
          setMsgs(messages.map((m: Message) => ({ ...m, status: 'delivered' })));
          bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
        })
        .catch(console.error);
    }

    const handleNewMessage = (message: Message) => {
      console.log('New message received:', message);
      
      setMsgs(prev => {
        // Check for duplicates
        if (prev.some(m => m._id === message._id)) {
          return prev;
        }

        // Update temp message if exists
        const tempIndex = prev.findIndex(m => 
          m.text === message.text && 
          m.sender === message.sender && 
          m.status === 'sending'
        );
        
        if (tempIndex >= 0) {
          const newMsgs = [...prev];
          newMsgs[tempIndex] = { ...message, status: 'delivered' as const };
          return newMsgs;
        }

        const newMsg: Message = { 
          ...message, 
          status: 'delivered' as const 
        };
        
        // Send received confirmation for messages from others
        if (typeof message.sender === 'string' ? 
            message.sender !== userId : 
            message.sender._id !== userId) {
          currentSocket.emit('message-received', {
            messageId: message._id,
            conversationId: sel._id
          });
        }

        return [...prev, newMsg];
      });

      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleMessageStatus = (update: MessageUpdate) => {
      setMsgs(prev => prev.map(m => 
        m._id === update.messageId ? 
        { ...m, status: update.status } : 
        m
      ));
    };

    const handleTypingIndicator = (data: { userId: string; isTyping: boolean }) => {
      if (!sel || !sel.participants || data.userId === userId) return;

      setWhoIsTyping(prev => {
        const user = sel.participants.find(p => p._id === data.userId);
        if (!user) return prev;
        
        if (data.isTyping) {
          // Add user to typing list if not already there
          return prev.includes(user.username) ? prev : [...prev, user.username];
        } else {
          // Remove user from typing list
          return prev.filter(name => name !== user.username);
        }
      });
    };

    currentSocket.on('new-message', handleNewMessage);
    currentSocket.on('message-status', handleMessageStatus);
    currentSocket.on('typing', handleTypingIndicator);
    
    return () => {
      currentSocket.off('new-message', handleNewMessage);
      currentSocket.off('message-status', handleMessageStatus);
      currentSocket.off('typing', handleTypingIndicator);
    };
  }, [sel, socketConnected, token, userId]);

  // Handle typing indicator
  const handleTyping = (value: string) => {
    setTxt(value);
    
    if (!sel || !socketConnected || !socketRef.current) return;    

    const currentSocket = socketRef.current;
    const isCurrentlyTyping = value.trim().length > 0;

    // Only emit if typing status changed
    if (isCurrentlyTyping !== isTyping) {
      currentSocket.emit('typing', { 
        conversationId: sel._id, 
        isTyping: isCurrentlyTyping 
      });
      setIsTyping(isCurrentlyTyping);
    }

    // Reset existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing after 2 seconds
    if (isCurrentlyTyping) {
      typingTimeoutRef.current = setTimeout(() => {
        if (socketRef.current) {
          currentSocket.emit('typing', { 
            conversationId: sel._id, 
            isTyping: false 
          });
          setIsTyping(false);
        }
      }, 2000);
    }
  };

  const send = async () => {
    if (!sel || !sel._id || !socketConnected || !socketRef.current || !txt.trim()) return;

    const currentSocket = socketRef.current;
    const tempId = Date.now().toString();
    const messageText = txt.trim();
    
    // İlk önce input'u temizle ve typing durumunu kapat
    setTxt('');
    setIsTyping(false);
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    currentSocket.emit('typing', { 
      conversationId: sel._id, 
      isTyping: false 
    });

    const tempMessage: Message = {
      _id: tempId,
      conversation: sel._id,
      sender: {
        _id: userId as string,
        username: '',
        role: ''
      },
      text: messageText,
      createdAt: new Date().toISOString(),
      status: 'sending' as const
    };

    setMsgs(prev => [...prev, tempMessage]);
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });

    try {
      // Emit to socket first for immediate delivery
      currentSocket.emit('send-message', {
        conversationId: sel._id,
        text: messageText,
        tempId
      });

      // Save to database
      const response = await fetch(`${API}/api/chat/${sel._id}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ text: messageText })
      });

      if (!response.ok) throw new Error('Failed to send message');

      const savedMessage: Message = await response.json();
      console.log('Message saved:', savedMessage);

      // Update temp message with saved data
      setMsgs(prev => prev.map(m => 
        m._id === tempId ? { ...savedMessage, status: 'sent' as const } : m
      ));

    } catch (error) {
      console.error('Error sending message:', error);
      setMsgs(prev => prev.map(m => 
        m._id === tempId ? { ...m, status: 'error' as const } : m
      ));
    }
  };

  // Search therapists
  useEffect(() => {
    if (!qry.trim()) {
      setThera([]);
      return;
    }

    const t = setTimeout(() => {
      if (token) {
        fetch(`${API}/api/therapists/list?q=${encodeURIComponent(qry)}`)
          .then(r => r.json())
          .then(setThera)
          .catch(console.error);
      }
    }, 400);

    return () => clearTimeout(t);
  }, [qry, token]);

  const startDM = async (id: string) => {
    if (!token || !socketConnected) return;
    
    try {
      const r = await fetch(`${API}/api/chat/conversations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ partnerId: id })
      });

      if (!r.ok) {
        throw new Error('Konuşma açılamadı');
      }

      const c: Conversation = await r.json();
      setConvs(p => p.some(x => x._id === c._id) ? p : [c, ...p]);
      setSel(c);
      setThera([]);
      setQry('');
    } catch (error) {
      console.error('Error starting DM:', error);
      alert('Konuşma açılamadı');
    }
  };

  if (!token) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)] bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H8m4-6V4" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Oturum Açmanız Gerekiyor</h3>
          <p className="text-gray-500 mb-4">
            Mesajlaşma sistemini kullanmak için lütfen giriş yapın
          </p>
          <button
            onClick={() => window.location.href = '/auth/login'}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-upliftPurple hover:bg-opacity-90"
          >
            Giriş Yap
          </button>
        </div>
      </div>
    );
  }

  if (busy) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)] bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4">
            <svg className="w-16 h-16 text-upliftPurple animate-spin" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>
          <p className="text-gray-500">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-gray-50">
      {/* Sol Sidebar - Konuşmalar */}
      <aside className="w-80 bg-white border-r flex flex-col shadow-sm">
        <div className="p-4 border-b bg-white">
          <div className="relative">
            <input
              value={qry}
              onChange={e => setQry(e.target.value)}
              placeholder="Terapist ara…"
              className="w-full border rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-upliftPurple focus:border-transparent"
            />
            <svg
              className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>

        {/* Terapist Arama Sonuçları */}
        {qry && (
          <div className="border-b">
            {thera.length ? (
              <div className="max-h-64 overflow-y-auto py-2">
                {thera.map(t => (
                  <button
                    key={t._id}
                    onClick={() => startDM(t._id)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                  >
                    <div className="relative w-10 h-10">
                      <Image
                        src="/default-avatar.png"
                        alt=""
                        width={40}
                        height={40}
                        className="rounded-full object-cover"
                      />
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></div>
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-medium text-gray-900">{t.username}</div>
                      <div className="text-xs text-gray-500">{t.role}</div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <p className="px-4 py-3 text-sm text-gray-500">Sonuç bulunamadı</p>
            )}
          </div>
        )}

        {/* Konuşma Listesi */}
        <div className="flex-1 overflow-y-auto">
          {convs.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-6">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <svg
                  className="w-8 h-8 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </div>
              <p className="text-gray-500 text-sm">Henüz konuşmanız yok</p>
              <p className="text-gray-400 text-xs mt-1">
                Yukarıdan bir terapist arayarak başlayın
              </p>
            </div>
          ) : (
            convs.map(c => {
              const myId = userId;
              const other = c.participants.find(p => p._id !== myId) || c.participants[0];
              const isSelected = sel?._id === c._id;
              
              return (
                <button
                  key={c._id}
                  onClick={() => setSel(c)}
                  className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors ${
                    isSelected ? 'bg-gray-50' : ''
                  }`}
                >
                  <div className="relative w-12 h-12">
                    <Image
                      src="/default-avatar.png"
                      alt=""
                      width={48}
                      height={48}
                      className="rounded-full object-cover"
                    />
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></div>
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-medium text-gray-900">
                      {other?.username || 'Bilinmeyen'}
                    </div>
                    <div className="text-xs text-gray-500">{other?.role}</div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </aside>

      {/* Ana Mesajlaşma Alanı */}
      <main className="flex-1 flex flex-col bg-white">
        {sel ? (
          <>
            {/* Üst Bar */}
            <div className="flex items-center gap-3 px-6 py-4 border-b bg-white">
              <div className="relative w-10 h-10">
                <Image
                  src="/default-avatar.png"
                  alt=""
                  width={40}
                  height={40}
                  className="rounded-full object-cover"
                />
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></div>
              </div>
              <div>
                <div className="font-medium text-gray-900">
                  {sel.participants.find(p => p._id !== userId)?.username || 'Bilinmeyen'}
                </div>
                <div className="text-xs text-gray-500">
                  {sel.participants.find(p => p._id !== userId)?.role}
                </div>
              </div>
            </div>

            {/* Mesaj Alanı */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <div className="space-y-4">
                {msgs.map((m, index) => {
                  const isMe = typeof m.sender === 'string'
                    ? m.sender === userId
                    : m.sender._id === userId;

                  return (
                    <div 
                      key={`${m._id}-${index}`} 
                      className={`flex ${isMe ? 'justify-end' : 'justify-start'} group`}
                    >
                      <div className={`relative max-w-[70%] rounded-2xl px-4 py-2 shadow-sm
                        ${isMe 
                          ? 'bg-upliftPurple text-white rounded-br-none' 
                          : 'bg-gray-100 text-gray-900 rounded-bl-none'
                        }`}
                      >
                        {!isMe && (
                          <div className="text-xs text-gray-500 mb-1">
                            {typeof m.sender === 'string' ? m.sender : m.sender.username}
                          </div>
                        )}
                        <div className="text-sm whitespace-pre-wrap break-words">
                          {m.text}
                        </div>
                        <div className={`text-xs mt-1 flex items-center gap-1 
                          ${isMe ? 'text-white/75' : 'text-gray-500'}`}
                        >
                          <span>{new Date(m.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}</span>
                          {isMe && m.status && (
                            <span>
                              {m.status === 'sending' && (
                                <svg className="w-3 h-3 animate-spin" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                              )}
                              {m.status === 'sent' && '✓'}
                              {m.status === 'delivered' && '✓✓'}
                              {m.status === 'read' && (
                                <span className="text-blue-400">✓✓</span>
                              )}
                              {m.status === 'error' && '⚠️'}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div ref={bottomRef} />
            </div>

            {/* Yazıyor Göstergesi */}
            {whoIsTyping.length > 0 && (
              <div className="px-6 py-2">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <div className="flex space-x-1">
                    {[0, 150, 300].map((delay, index) => (
                      <div
                        key={`typing-dot-${index}`}
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: `${delay}ms` }}
                      />
                    ))}
                  </div>
                  <span>{whoIsTyping.join(', ')} yazıyor</span>
                </div>
              </div>
            )}

            {/* Mesaj Yazma Alanı */}
            <div className="p-4 border-t bg-white">
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <input
                    value={txt}
                    onChange={e => handleTyping(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
                    placeholder="Mesajınızı yazın..."
                    className="w-full border rounded-full pl-4 pr-12 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-upliftPurple focus:border-transparent"
                  />
                  <button className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </button>
                </div>
                <button
                  onClick={send}
                  disabled={!txt.trim()}
                  className="flex items-center justify-center w-12 h-12 rounded-full bg-upliftPurple text-white disabled:opacity-40 disabled:cursor-not-allowed transition-opacity hover:opacity-90"
                >
                  <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                  </svg>
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center p-8">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <svg
                className="w-10 h-10 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">
              Hoş geldiniz
            </h3>
            <p className="text-gray-500 mb-6">
              Soldaki listeden bir konuşma seçin veya<br />
              yeni bir konuşma başlatmak için terapist arayın
            </p>
            <button
              onClick={() => setQry('a')}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-upliftPurple hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-upliftPurple"
            >
              Terapist Ara
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
