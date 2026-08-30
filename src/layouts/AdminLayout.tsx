import React, { useState } from 'react';
import { Navbar } from './Navbar';
import { Sidebar, ActiveTab } from './Sidebar';
import { Footer } from './Footer';

interface AdminLayoutProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  activeCount: number;
  isDbConnected: boolean;
  soundEnabled: boolean;
  onToggleSound: () => void;
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  activeTab,
  setActiveTab,
  activeCount,
  isDbConnected,
  soundEnabled,
  onToggleSound,
  children,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 font-sans">
      <Navbar
        soundEnabled={soundEnabled}
        onToggleSound={onToggleSound}
        isDbConnected={isDbConnected}
        activeAlertCount={activeCount}
        onOpenMobileMenu={() => setMobileMenuOpen(true)}
      />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          activeCount={activeCount}
          mobileOpen={mobileMenuOpen}
          onCloseMobileMenu={() => setMobileMenuOpen(false)}
        />

        <main className="flex-1 p-4 sm:p-6 min-w-0">
          {children}
        </main>
      </div>

      <Footer />
    </div>
  );
};
