'use client';

import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { DashboardHome } from './DashboardHome';
import { LiveMonitoring } from './LiveMonitoring';
import { Marketplace } from './Marketplace';
import { Community } from './Community';
import { AIAssistant } from './AIAssistant';
import { Profile } from './Profile';

interface DashboardProps {
  userRole: 'farmer' | 'seller' | 'admin';
  onLogout: () => void;
}

export function Dashboard({ userRole, onLogout }: DashboardProps) {
  const [activeTab, setActiveTab] = useState('home');

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <DashboardHome userRole={userRole} />;
      case 'monitoring':
        return <LiveMonitoring />;
      case 'marketplace':
        return <Marketplace userRole={userRole} />;
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      <Sidebar 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
        userRole={userRole}
      />
      <div className="flex-1 flex flex-col">
        <Header userRole={userRole} onLogout={onLogout} />
        <main className="flex-1 p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}