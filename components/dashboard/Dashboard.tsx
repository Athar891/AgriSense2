'use client';

import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { DashboardHome } from './DashboardHome';
import { Marketplace } from './Marketplace';
import { Community } from './Community';
import { AIAssistant } from './AIAssistant';
import { Profile } from './Profile';

interface CartItem {
  id: number;
  name: string;
  price: number;
  image: string;
  seller: string;
  quantity: number;
}

interface DashboardProps {
  userRole: 'farmer' | 'seller' | 'admin';
  onLogout: () => void;
}

export function Dashboard({ userRole, onLogout }: DashboardProps) {
  const [activeTab, setActiveTab] = useState('home');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);

  const handleMobileMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const addToCart = (product: { id: number; name: string; price: number; image: string; seller: string }) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prevCart, { ...product, quantity: 1 }];
      }
    });
  };

  const removeFromCart = (productId: number) => {
    setCart(prevCart => prevCart.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prevCart =>
      prevCart.map(item =>
        item.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getCartItemCount = () => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <DashboardHome userRole={userRole} />;
      case 'marketplace':
        return (
          <Marketplace 
            userRole={userRole} 
            cart={cart}
            onAddToCart={addToCart}
            onRemoveFromCart={removeFromCart}
            onUpdateQuantity={updateQuantity}
            getCartTotal={getCartTotal}
            getCartItemCount={getCartItemCount}
          />
        );
      case 'community':
        return <Community />;
      case 'ai':
        return <AIAssistant />;
      case 'profile':
        return <Profile userRole={userRole} />;
      default:
        return <DashboardHome userRole={userRole} />;
    }
  };

  return (
    <div className="h-screen bg-gray-50 dark:bg-gray-900 flex overflow-hidden">
      <Sidebar 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
        userRole={userRole}
        isMobileMenuOpen={isMobileMenuOpen}
        onMobileMenuToggle={handleMobileMenuToggle}
      />
      <div className="flex-1 flex flex-col lg:ml-0 min-w-0">
        <Header 
          userRole={userRole} 
          onLogout={onLogout}
          isMobileMenuOpen={isMobileMenuOpen}
          onMobileMenuToggle={handleMobileMenuToggle}
          cartItemCount={getCartItemCount()}
          cart={cart}
          onRemoveFromCart={removeFromCart}
          onUpdateQuantity={updateQuantity}
          getCartTotal={getCartTotal}
          getCartItemCount={getCartItemCount}
        />
        <main className="flex-1 p-4 lg:p-5 pt-2 lg:pt-6 overflow-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}