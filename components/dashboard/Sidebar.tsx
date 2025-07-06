'use client';

import { cn } from '@/lib/utils';
import { 
  Home, 
  Camera, 
  Store, 
  MessageCircle, 
  Bot, 
  User,
  Settings,
  Shield,
  BarChart3
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  userRole: 'farmer' | 'seller' | 'admin';
}

export function Sidebar({ activeTab, onTabChange, userRole }: SidebarProps) {
  const getMenuItems = () => {
    const baseItems = [
      { id: 'home', label: 'Dashboard', icon: Home },
      { id: 'monitoring', label: 'Live Monitoring', icon: Camera },
      { id: 'marketplace', label: 'Marketplace', icon: Store },
      { id: 'community', label: 'Community', icon: MessageCircle },
      { id: 'ai', label: 'AI Assistant', icon: Bot },
      { id: 'profile', label: 'Profile', icon: User },
    ];

    if (userRole === 'admin') {
      baseItems.splice(-1, 0, 
        { id: 'analytics', label: 'Analytics', icon: BarChart3 },
        { id: 'settings', label: 'Settings', icon: Settings }
      );
    }

    return baseItems;
  };

  return (
    <div className="w-64 bg-white dark:bg-gray-900 shadow-lg border-r border-gray-200 dark:border-gray-700">
      <div className="p-6">
        <div className="flex items-center gap-2 mb-8">
          <div className="bg-green-600 p-2 rounded-lg">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold text-gray-900 dark:text-white">AgriSense</span>
        </div>
        
        <nav className="space-y-2">
          {getMenuItems().map((item) => (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 text-left rounded-lg transition-colors",
                activeTab === item.id
                  ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border-r-2 border-green-600"
                  : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
              )}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}