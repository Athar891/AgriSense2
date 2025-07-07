'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { WeatherWidget } from './WeatherWidget';
import { Bell, LogOut, Moon, Sun, Menu, X, AlertTriangle, CheckCircle, ShoppingCart } from 'lucide-react';
import { CartPanel } from './CartPanel';
import { useTheme } from 'next-themes';
import { useEffect, useState, useRef } from 'react';
import ReactDOM from 'react-dom';
import { useWeather } from '@/hooks/useWeather';

interface CartItem {
  id: number;
  name: string;
  price: number;
  image: string;
  seller: string;
  quantity: number;
}

interface HeaderProps {
  userRole: 'farmer' | 'seller' | 'admin';
  onLogout: () => void;
  isMobileMenuOpen: boolean;
  onMobileMenuToggle: () => void;
  cartItemCount: number;
  cart: CartItem[];
  onRemoveFromCart: (productId: number) => void;
  onUpdateQuantity: (productId: number, quantity: number) => void;
  getCartTotal: () => number;
  getCartItemCount: () => number;
}

export function Header({ 
  userRole, 
  onLogout, 
  isMobileMenuOpen, 
  onMobileMenuToggle, 
  cartItemCount,
  cart,
  onRemoveFromCart,
  onUpdateQuantity,
  getCartTotal,
  getCartItemCount
}: HeaderProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const bellRef = useRef<HTMLButtonElement>(null);

  // Weather integration
  const { alerts: weatherAlerts } = useWeather();

  // Sample notifications
  const [notifications, setNotifications] = useState<Array<{
    id: number;
    title: string;
    description: string;
    type: string;
    time: string;
    read: boolean;
  }>>([
    {
      id: 1,
      title: 'Leaf blight detected',
      description: 'Leaf blight detected in Field A-2',
      type: 'warning',
      time: '2 hours ago',
      read: false,
    },
    {
      id: 2,
      title: 'Irrigation scheduled',
      description: 'Irrigation scheduled for tomorrow',
      type: 'info',
      time: '4 hours ago',
      read: false,
    },
    {
      id: 3,
      title: 'Harvest completed',
      description: 'Harvest completed in Field B-1',
      type: 'success',
      time: '1 day ago',
      read: true,
    },
  ]);

  // Combine weather alerts with regular notifications
  const allNotifications = [
    ...weatherAlerts.map((alert, index) => ({
      id: `weather-${index}`,
      title: alert.headline,
      description: alert.description,
      type: alert.severity.toLowerCase() === 'extreme' || alert.severity.toLowerCase() === 'severe' ? 'warning' : 'info',
      time: 'Just now',
      read: false,
      isWeatherAlert: true,
      alert
    })),
    ...notifications
  ];

  // Portal for notification panel
  const NotificationPortal = ({ children }: { children: React.ReactNode }) => {
    if (typeof window === 'undefined') return null;
    return ReactDOM.createPortal(children, document.body);
  };

  // Close on outside click
  useEffect(() => {
    if (!notifOpen) return;
    function handle(e: MouseEvent) {
      if (
        bellRef.current &&
        !bellRef.current.contains(e.target as Node) &&
        document.getElementById('notification-panel') &&
        !(document.getElementById('notification-panel') as HTMLElement).contains(e.target as Node)
      ) {
        setNotifOpen(false);
      }
    }
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [notifOpen]);

  // Mark all as read when panel opens
  useEffect(() => {
    if (notifOpen) {
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    }
  }, [notifOpen]);

  const unread = allNotifications.some((n) => !n.read);

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
      <header className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700 h-16 flex items-center px-6">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-4">
            {/* Mobile Menu Button */}
            <Button
              variant="outline"
              size="icon"
              onClick={onMobileMenuToggle}
              className="lg:hidden border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </Button>
            
            <h1 className="text-base sm:text-lg md:text-2xl font-bold text-gray-900 dark:text-white">Welcome back!</h1>
            <div className="hidden md:block">
              {getRoleBadge()}
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden md:block">
              <WeatherWidget compact={true} showLocation={false} />
            </div>
            
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
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700 h-16 flex items-center px-6">
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-4">
          {/* Mobile Menu Button */}
          <Button
            variant="outline"
            size="icon"
            onClick={onMobileMenuToggle}
            className="lg:hidden border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            {isMobileMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </Button>
          
          <h1 className="text-base sm:text-lg md:text-2xl font-bold text-gray-900 dark:text-white">Welcome back!</h1>
          <div className="hidden md:block">
            {getRoleBadge()}
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="hidden md:block">
            <WeatherWidget compact={true} showLocation={false} />
          </div>
          
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
          
          {/* Notification Bell */}
          <Button
            ref={bellRef}
            variant="ghost"
            size="icon"
            className="relative"
            onClick={() => setNotifOpen((v) => !v)}
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unread && <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full" />}
          </Button>
          
          {/* Cart Icon */}
          <Button
            variant="ghost"
            size="icon"
            className="relative"
            aria-label="Shopping Cart"
            onClick={() => setCartOpen(true)}
          >
            <ShoppingCart className="w-5 h-5" />
            {cartItemCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-green-600 text-white text-xs rounded-full flex items-center justify-center font-medium">
                {cartItemCount > 99 ? '99+' : cartItemCount}
              </span>
            )}
          </Button>
          
          {/* Notification Panel */}
          {notifOpen && (
            <NotificationPortal>
              <div
                id="notification-panel"
                className="fixed z-[9999] right-4 top-20 w-[95vw] max-w-sm sm:right-8 sm:top-20 sm:w-96 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-4"
              >
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800 bg-gradient-to-r from-green-50/80 to-blue-50/80 dark:from-green-900/30 dark:to-blue-900/30">
                  <span className="font-bold text-gray-900 dark:text-white text-lg">Notifications</span>
                  <Button variant="ghost" size="icon" onClick={() => setNotifOpen(false)}>
                    <X className="w-5 h-5" />
                  </Button>
                </div>
                <div className="max-h-80 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800">
                  {allNotifications.length === 0 && (
                    <div className="p-6 text-center text-gray-500 dark:text-gray-400">No notifications</div>
                  )}
                  {allNotifications.map((n) => (
                    <div
                      key={n.id}
                      className={`flex items-start gap-3 px-4 py-4 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                        'isWeatherAlert' in n && n.isWeatherAlert ? 'border-l-4 border-l-red-500' : ''
                      }`}
                    >
                      <div className="mt-1">
                        {n.type === 'warning' && <AlertTriangle className="w-5 h-5 text-yellow-500" />}
                        {n.type === 'info' && <Sun className="w-5 h-5 text-blue-500" />}
                        {n.type === 'success' && <CheckCircle className="w-5 h-5 text-green-500" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-gray-900 dark:text-white truncate">
                          {n.title}
                          {'isWeatherAlert' in n && n.isWeatherAlert && (
                            <Badge variant="destructive" className="ml-2 text-xs">
                              Weather
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-300 truncate">{n.description}</div>
                        <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">{n.time}</div>
                        {'isWeatherAlert' in n && n.isWeatherAlert && 'alert' in n && n.alert && (
                          <div className="text-xs text-gray-500 mt-1">
                            Areas: {n.alert.areas} • Expires: {new Date(n.alert.expires).toLocaleTimeString()}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </NotificationPortal>
          )}
          
          <Button 
            variant="outline" 
            onClick={onLogout}
            className="flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </div>

      {/* Cart Panel */}
      <CartPanel
        cart={cart}
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        onRemoveFromCart={onRemoveFromCart}
        onUpdateQuantity={onUpdateQuantity}
        getCartTotal={getCartTotal}
        getCartItemCount={getCartItemCount}
      />
    </header>
  );
}