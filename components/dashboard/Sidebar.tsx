'use client';

import { cn } from '@/lib/utils';
import { 
  Home, 
  Store, 
  MessageCircle, 
  Bot, 
  User,
  Settings,
  Shield,
  BarChart3,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  userRole: 'farmer' | 'seller' | 'admin';
  isMobileMenuOpen: boolean;
  onMobileMenuToggle: () => void;
}

export function Sidebar({ activeTab, onTabChange, userRole, isMobileMenuOpen, onMobileMenuToggle }: SidebarProps) {
  const getMenuItems = () => {
    const baseItems = [
      { id: 'home', label: 'Dashboard', icon: Home },
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

  const handleTabChange = (tab: string) => {
    onTabChange(tab);
    onMobileMenuToggle(); // Close mobile menu when tab is selected
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={onMobileMenuToggle}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed lg:relative lg:translate-x-0 transition-transform duration-300 ease-in-out z-50",
        "w-64 bg-white dark:bg-gray-900 shadow-lg border-r border-gray-200 dark:border-gray-700",
        "h-screen lg:h-full",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="h-16 flex items-center px-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <div className="bg-green-600 p-2 rounded-lg">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900 dark:text-white">AgriSense</span>
              </div>
              
              {/* Mobile Close Button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={onMobileMenuToggle}
                className="lg:hidden"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>
          
          {/* Navigation */}
          <nav className="flex-1 p-6 overflow-y-auto">
            <div className="space-y-2">
              {getMenuItems().map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleTabChange(item.id)}
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
            </div>
          </nav>
        </div>
      </div>
    </>
  );
}