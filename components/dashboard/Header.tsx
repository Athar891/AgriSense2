'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { WeatherWidget } from './WeatherWidget';
import { Bell, LogOut, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

interface HeaderProps {
  userRole: 'farmer' | 'seller' | 'admin';
  onLogout: () => void;
}

export function Header({ userRole, onLogout }: HeaderProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const getRoleBadge = () => {
    const roleColors = {
      farmer: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      seller: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      admin: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
    };

    return (
      <Badge className={roleColors[userRole]}>
        {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
      </Badge>
    );
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  if (!mounted) {
    return (
      <header className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome back!</h1>
            {getRoleBadge()}
          </div>
          
          <div className="flex items-center gap-4">
            <WeatherWidget compact={true} showLocation={false} />
            
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
            </Button>
            
            <Button 
              variant="outline" 
              onClick={onLogout}
              className="flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome back!</h1>
          {getRoleBadge()}
        </div>
        
        <div className="flex items-center gap-4">
          <WeatherWidget compact={true} showLocation={false} />
          
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleTheme}
            className="relative"
          >
            {theme === 'dark' ? (
              <Sun className="w-5 h-5" />
            ) : (
              <Moon className="w-5 h-5" />
            )}
          </Button>
          
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
          </Button>
          
          <Button 
            variant="outline" 
            onClick={onLogout}
            className="flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
}