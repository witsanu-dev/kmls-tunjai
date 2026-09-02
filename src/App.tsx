import React, { useState, useEffect, useCallback } from 'react';
import { AdminLayout } from './layouts/AdminLayout';
import { ActiveTab } from './layouts/Sidebar';
import { FRDispatchPage } from './pages/FRDispatchPage';
import { HospitalMonitorPage } from './pages/HospitalMonitorPage';
import { DataTablesHistoryPage } from './pages/DataTablesHistoryPage';
import { AnalyticsDashboardPage } from './pages/AnalyticsDashboardPage';
import { LoginPage } from './pages/LoginPage';
import { UserManagementPage } from './pages/UserManagementPage';
import { MophNotifySettingsPage } from './pages/MophNotifySettingsPage';
import { AuditLogPage } from './pages/AuditLogPage';
import { AuthProvider, useAuth } from './context/AuthContext';

import { CaseRecord, Hospital, NewCasePayload, CaseStatus } from './types/emergency';
import { fetchCases, fetchHospitals, createCase, updateCaseStatus, deleteSingleCase, resetAllCases, fetchHealthStatus } from './services/api';
import { subscribeToEmergencyAlerts } from './services/socket';
import { playEmergencySirenSound } from './components/AudioAlert';

function MainAppContent() {
  const { user, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<ActiveTab>('fr');
  const [cases, setCases] = useState<CaseRecord[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [isDbConnected, setIsDbConnected] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Set default tab according to user role when logged in
  useEffect(() => {
    if (user) {
      if (user.role === 'fr_dispatch') setActiveTab('fr');
      else if (user.role === 'er_staff') setActiveTab('hospital');
      else if (user.role === 'director') setActiveTab('analytics');
      else if (user.role === 'admin') setActiveTab('fr');
    }
  }, [user]);

  // Load initial data
  const loadData = useCallback(async () => {
    const [casesData, hospitalsData, health] = await Promise.all([
      fetchCases(),
      fetchHospitals(),
      fetchHealthStatus(),
    ]);
    setCases(casesData);
    setHospitals(hospitalsData);
    setIsDbConnected(health.mysql === 'connected');
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Subscribe to real-time WebSockets events
  useEffect(() => {
    const unsubscribe = subscribeToEmergencyAlerts(
      (newCase: CaseRecord) => {
        setCases((prev) => {
          if (prev.some(c => c.id === newCase.id)) return prev;
          return [newCase, ...prev];
        });

        // Trigger sound siren if enabled
        if (soundEnabled) {
          playEmergencySirenSound();
        }
      },
      ({ id, status }) => {
        setCases((prev) => prev.map(c => c.id === id ? { ...c, status } : c));
      },
      () => {
        setCases([]);
      },
      ({ id }) => {
        setCases((prev) => prev.filter(c => c.id !== id));
      }
    );

    return () => unsubscribe();
  }, [soundEnabled]);

  const handleCreateCase = async (payload: NewCasePayload): Promise<CaseRecord> => {
    const created = await createCase(payload);
    setCases((prev) => [created, ...prev.filter(c => c.id !== created.id)]);
    return created;
  };

  const handleUpdateStatus = async (id: string, status: CaseStatus) => {
    await updateCaseStatus(id, status);
    setCases((prev) => prev.map(c => c.id === id ? { ...c, status } : c));
  };

  const handleDeleteCase = async (id: string) => {
    await deleteSingleCase(id);
    setCases((prev) => prev.filter(c => c.id !== id));
  };

  const handleResetAll = async () => {
    await resetAllCases();
    setCases([]);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white font-bold text-sm">
        กำลังตรวจสอบสิทธิการเข้าใช้งานระบบ...
      </div>
    );
  }

  // Mandatory Authentication Guard for Production Standard
  if (!user) {
    return <LoginPage hospitals={hospitals} />;
  }

  const activeCount = cases.filter(c => c.status !== 'arrived').length;

  return (
    <AdminLayout
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      activeCount={activeCount}
      isDbConnected={isDbConnected}
      soundEnabled={soundEnabled}
      onToggleSound={() => setSoundEnabled(!soundEnabled)}
    >
      {activeTab === 'fr' && (
        <FRDispatchPage
          hospitals={hospitals}
          onSubmitCase={handleCreateCase}
          onNavigateToMonitor={() => setActiveTab('hospital')}
        />
      )}

      {activeTab === 'hospital' && (
        <HospitalMonitorPage
          cases={cases}
          hospitals={hospitals}
          onUpdateStatus={handleUpdateStatus}
          onDeleteCase={handleDeleteCase}
          onRefresh={loadData}
          onResetAll={handleResetAll}
        />
      )}

      {activeTab === 'history' && (
        <DataTablesHistoryPage cases={cases} />
      )}

      {activeTab === 'analytics' && (
        <AnalyticsDashboardPage cases={cases} />
      )}

      {activeTab === 'users' && user.role === 'admin' && (
        <UserManagementPage hospitals={hospitals} />
      )}

      {activeTab === 'moph-notify' && user.role === 'admin' && (
        <MophNotifySettingsPage />
      )}

      {activeTab === 'audit-logs' && (user.role === 'admin' || user.role === 'director') && (
        <AuditLogPage />
      )}
    </AdminLayout>
  );
}

export function App() {
  return (
    <AuthProvider>
      <MainAppContent />
    </AuthProvider>
  );
}

export default App;
