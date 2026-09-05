import React, { useState } from 'react';
import { Sidebar, TabType } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { ToastContainer } from './components/common/Toast';
import { useLanguage } from './context/LanguageContext';

// Pages
import { DashboardPage } from './pages/DashboardPage';
import { POSPage } from './pages/POSPage';
import { RepairsPage } from './pages/RepairsPage';
import { PublicTrackPage } from './pages/PublicTrackPage';
import { ProductsPage } from './pages/ProductsPage';
import { InventoryPage } from './pages/InventoryPage';
import { PurchasesPage } from './pages/PurchasesPage';
import { CustomersPage } from './pages/CustomersPage';
import { SuppliersPage } from './pages/SuppliersPage';
import { ExpensesPage } from './pages/ExpensesPage';
import { PaymentsPage } from './pages/PaymentsPage';
import { ReportsPage } from './pages/ReportsPage';
import { EmployeesPage } from './pages/EmployeesPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { SettingsPage } from './pages/SettingsPage';

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<TabType>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const { direction } = useLanguage();

  const renderContent = () => {
    switch (currentTab) {
      case 'dashboard': return <DashboardPage setCurrentTab={setCurrentTab} />;
      case 'pos': return <POSPage />;
      case 'repairs': return <RepairsPage />;
      case 'public_track': return <PublicTrackPage />;
      case 'products': return <ProductsPage />;
      case 'inventory': return <InventoryPage />;
      case 'purchases': return <PurchasesPage />;
      case 'customers': return <CustomersPage />;
      case 'suppliers': return <SuppliersPage />;
      case 'expenses': return <ExpensesPage />;
      case 'payments': return <PaymentsPage />;
      case 'reports': return <ReportsPage />;
      case 'employees': return <EmployeesPage />;
      case 'notifications': return <NotificationsPage />;
      case 'settings': return <SettingsPage />;
      default: return <DashboardPage setCurrentTab={setCurrentTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Toast Notification Container */}
      <ToastContainer />

      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
        mobileOpen={mobileSidebarOpen}
        setMobileOpen={setMobileSidebarOpen}
      />

      {/* Top Navbar */}
      <Header
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        setMobileOpen={setMobileSidebarOpen}
        collapsed={sidebarCollapsed}
      />

      {/* Main App Content Body */}
      <main className={`flex-1 p-4 md:p-6 mt-16 transition-all duration-300 ${
        sidebarCollapsed 
          ? direction === 'rtl' ? 'lg:me-20' : 'lg:ms-20'
          : direction === 'rtl' ? 'lg:me-64' : 'lg:ms-64'
      }`}>
        {renderContent()}
      </main>
    </div>
  );
};
