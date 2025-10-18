import React, { useState, useRef, useEffect } from 'react';
import { Send, Upload, MessageCircle, Briefcase, Code, Plus, Trash2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card } from '../components/ui/card';
import { ScrollArea } from '../components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger } from '../components/ui/tabs';
import { toast } from '../hooks/use-toast';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const mockModes = [
  {
    id: 'casual',
    name: 'Günlük',
    description: 'Rahat ve samimi sohbet',
    icon: 'MessageCircle'
  },
  {
    id: 'formal',
    name: 'Resmi',
    description: 'Profesyonel ve resmi iletişim',
    icon: 'Briefcase'
  },
  {
    id: 'professional',
    name: 'Teknik',
    description: 'Detaylı ve teknik açıklamalar',
    icon: 'Code'
  }
];

const HomePage = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [selectedMode, setSelectedMode] = useState('casual');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const scrollRef = useRef(null);
  const fileInputRef = useRef(null);

  const modeIcons = {
    MessageCircle,
    Briefcase,
    Code
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() && !selectedFile) return;

    const userMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage,
      file: selectedFile,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setSelectedFile(null);
    setIsTyping(true);

    // Mock response delay
    setTimeout(() => {
      const assistantMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: generateMockResponse(inputMessage, selectedMode),
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 1000);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile({
        name: file.name,
        size: file.size,
        type: file.type
      });
      toast({
        title: 'Dosya seçildi',
        description: file.name
      });
    }
  };

  const handleNewChat = () => {
    setMessages([]);
    setSelectedFile(null);
    toast({
      title: 'Yeni sohbet başlatıldı',
      description: 'Temiz bir sayfa ile başlayabilirsiniz'
    });
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 backdrop-blur-sm bg-white/80">
        <div className="max-w-7xl mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-br from-slate-700 to-slate-900 rounded-xl flex items-center justify-center shadow-lg">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Hamsi AI</h1>
                <p className="text-sm text-slate-500">Türkiye'nin yapay zeka asistanı</p>
              </div>
            </div>
            <Button
              onClick={handleNewChat}
              variant="outline"
              className="flex items-center space-x-2 hover:bg-slate-50 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Yeni Sohbet</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-6 py-8">
        {/* Mode Selector */}
        <Card className="p-6 mb-8 border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Konuşma Modu</h2>
          <Tabs value={selectedMode} onValueChange={setSelectedMode} className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-slate-100">
              {mockModes.map((mode) => {
                const Icon = modeIcons[mode.icon];
                return (
                  <TabsTrigger
                    key={mode.id}
                    value={mode.id}
                    className="flex items-center space-x-2 data-[state=active]:bg-white data-[state=active]:text-slate-900 transition-all"
                  >
                    <Icon className="w-4 h-4" />
                    <span>{mode.name}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </Tabs>
          <p className="text-sm text-slate-600 mt-3">
            {mockModes.find(m => m.id === selectedMode)?.description}
          </p>
        </Card>

        {/* Chat Area */}
        <Card className="border-slate-200 shadow-lg">
          <ScrollArea ref={scrollRef} className="h-[500px] p-6">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6">
                  <MessageCircle className="w-10 h-10 text-slate-400" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">Hamsi AI'ya Hoş Geldiniz</h3>
                <p className="text-slate-600 max-w-md">
                  Size nasıl yardımcı olabilirim? Sorularınızı sorabilir, dosya yükleyebilir veya konuşma modunu seçerek başlayabilirsiniz.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-5 py-3 ${
                        message.role === 'user'
                          ? 'bg-slate-900 text-white'
                          : 'bg-slate-100 text-slate-900'
                      } shadow-sm transition-all hover:shadow-md`}
                    >
                      {message.file && (
                        <div className="mb-2 text-sm opacity-80 flex items-center space-x-2">
                          <Upload className="w-4 h-4" />
                          <span>{message.file.name}</span>
                        </div>
                      )}
                      <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                      <p className={`text-xs mt-2 ${
                        message.role === 'user' ? 'text-slate-300' : 'text-slate-500'
                      }`}>
                        {new Date(message.timestamp).toLocaleTimeString('tr-TR', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-slate-100 rounded-2xl px-5 py-3 shadow-sm">
                      <div className="flex space-x-2">
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>

          {/* Input Area */}
          <div className="border-t border-slate-200 p-6">
            {selectedFile && (
              <div className="mb-3 flex items-center justify-between bg-slate-50 rounded-lg px-4 py-2">
                <div className="flex items-center space-x-2 text-sm text-slate-700">
                  <Upload className="w-4 h-4" />
                  <span>{selectedFile.name}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedFile(null)}
                  className="h-8 hover:bg-slate-200"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            )}
            <div className="flex items-end space-x-3">
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileSelect}
                className="hidden"
                accept="image/*,.pdf,.doc,.docx,.txt"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => fileInputRef.current?.click()}
                className="flex-shrink-0 h-12 w-12 hover:bg-slate-50 transition-colors"
              >
                <Upload className="w-5 h-5" />
              </Button>
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Mesajınızı yazın..."
                className="flex-1 h-12 text-base border-slate-300 focus:border-slate-500 transition-colors"
              />
              <Button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() && !selectedFile}
                className="flex-shrink-0 h-12 px-6 bg-slate-900 hover:bg-slate-800 transition-colors"
              >
                <Send className="w-5 h-5" />
              </Button>
            </div>
            <p className="text-xs text-slate-500 mt-3">
              Enter tuşuna basarak mesaj gönderebilir, Shift+Enter ile yeni satır ekleyebilirsiniz
            </p>
          </div>
        </Card>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 mt-16">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <p className="text-center text-slate-600 text-sm">
            2025 © miracthedev
          </p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;