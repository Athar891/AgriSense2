'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Bot, 
  Send, 
  Camera, 
  Upload,
  Zap,
  MessageSquare,
  Lightbulb
} from 'lucide-react';

export function AIAssistant() {
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([
    {
      id: 1,
      type: 'bot',
      content: 'Hello! I\'m your AgriSense AI assistant. I can help you with crop diseases, farming techniques, weather advice, and more. How can I assist you today?',
      timestamp: new Date().toISOString()
    }
  ]);

  const quickQuestions = [
    'How to prevent leaf blight in tomatoes?',
    'Best fertilizer for wheat crops?',
    'When to plant rice in monsoon?',
    'Organic pest control methods?',
    'Soil pH for potato farming?',
    'Water management techniques?'
  ];

  const handleSendMessage = () => {
    if (message.trim()) {
      const newMessage = {
        id: chatHistory.length + 1,
        type: 'user',
        content: message,
        timestamp: new Date().toISOString()
      };
      
      setChatHistory([...chatHistory, newMessage]);
      setMessage('');
      
      // Simulate AI response
      setTimeout(() => {
        const aiResponse = {
          id: chatHistory.length + 2,
          type: 'bot',
          content: 'Thank you for your question! Based on current agricultural best practices and your specific crop conditions, I recommend the following approach...',
          timestamp: new Date().toISOString()
        };
        setChatHistory(prev => [...prev, aiResponse]);
      }, 1000);
    }
  };

  const handleQuickQuestion = (question: string) => {
    setMessage(question);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">AI Assistant</h2>
        <div className="flex items-center gap-2">
          <Badge className="bg-green-100 text-green-800">
            <Bot className="w-4 h-4 mr-1" />
            Online
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Chat with AI
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="flex flex-col h-96">
                <div className="flex-1 overflow-y-auto space-y-4 p-6 pb-4">
                  {chatHistory.map((chat) => (
                    <div key={chat.id} className={`flex ${chat.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] p-3 rounded-lg ${
                        chat.type === 'user' 
                          ? 'bg-green-600 text-white' 
                          : 'bg-gray-100 text-gray-900'
                      }`}>
                        {chat.type === 'bot' && (
                          <div className="flex items-center gap-2 mb-2">
                            <Bot className="w-4 h-4" />
                            <span className="font-semibold text-sm">AgriSense AI</span>
                          </div>
                        )}
                        <p className="text-sm">{chat.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="border-t bg-white p-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Ask about crops, diseases, farming techniques..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      className="flex-1"
                    />
                    <Button 
                      onClick={handleSendMessage} 
                      className="bg-green-600 hover:bg-green-700 px-4"
                      disabled={!message.trim()}
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5" />
                Quick Questions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {quickQuestions.map((question, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="w-full text-left justify-start text-sm h-auto p-3"
                    onClick={() => handleQuickQuestion(question)}
                  >
                    {question}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="w-5 h-5" />
                Image Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-sm text-gray-600">
                  Upload a photo of your crop for instant disease detection and recommendations.
                </p>
                <Button className="w-full" variant="outline">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Image
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                AI Features
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Disease Detection</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Crop Recommendations</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Weather Insights</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Multilingual Support</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}