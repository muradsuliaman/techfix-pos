import React from 'react';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Wrench, 
  Package, 
  Boxes, 
  Truck, 
  Users, 
  Building2, 
  Receipt, 
  CreditCard, 
  BarChart3, 
  ShieldCheck, 
  Bell, 
  Settings,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Cpu
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useApp } from '../../context/AppContext';

export type TabType = 
  | 'dashboard'
  | 'pos'
  | 'repairs'
  | 'products'
  | 'inventory'
  | 'purchases'
  | 'customers'
  | 'suppliers'
  | 'expenses'
  | 'payments'
  | 'reports'
  | 'employees'
  | 'notifications'
  | 'settings'
  | 'public_track';

interface SidebarProps {
  currentTab: TabType;
  setCurrentTab: (tab: TabType) => void;
  collapsed: boolean;
  setCollapsed: (c: boolean) => void;
  mobileOpen: boolean;
  setMobileOpen: (o: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  setCurrentTab,
  collapsed,
  setCollapsed,
  mobileOpen,
  setMobileOpen
}) => {
  const { t, language, direction } = useLanguage();
  const { notifications, repairs, products } = useApp();

  const unreadNotifs = notifications.filter((n) => !n.read).length;
  const activeRepairs = repairs.filter((r) => r.status !== 'delivered' && r.status !== 'cancelled').length;
  const lowStockCount = products.filter((p) => p.quantity <= p.minStock).length;

  const navItems = [
    { id: 'dashboard' as TabType, label: t('dashboard'), icon: LayoutDashboard },
    { id: 'pos' as TabType, label: t('pos'), icon: ShoppingCart, highlight: true },
    { id: 'repairs' as TabType, label: t('repairs'), icon: Wrench, count: activeRepairs },
    { id: 'products' as TabType, label: t('products'), icon: Package },
    { id: 'inventory' as TabType, label: t('inventory'), icon: Boxes, count: lowStockCount, alert: lowStockCount > 0 },
    { id: 'purchases' as TabType, label: t('purchases'), icon: Truck },
    { id: 'customers' as TabType, label: t('customers'), icon: Users },
    { id: 'suppliers' as TabType, label: t('suppliers'), icon: Building2 },
    { id: 'expenses' as TabType, label: t('expenses'), icon: Receipt },
    { id: 'payments' as TabType, label: t('payments'), icon: CreditCard },
    { id: 'reports' as TabType, label: t('reports'), icon: BarChart3 },
    { id: 'employees' as TabType, label: t('employees'), icon: ShieldCheck },
    { id: 'notifications' as TabType, label: t('notifications'), icon: Bell, count: unreadNotifs },
    { id: 'settings' as TabType, label: t('settings'), icon: Settings },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 z-40 flex flex-col bg-white dark:bg-slate-900 border-e border-slate-200 dark:border-slate-800 transition-all duration-300 ${
          collapsed ? 'w-20' : 'w-64'
        } ${
          mobileOpen ? 'translate-x-0' : direction === 'rtl' ? 'translate-x-full lg:translate-x-0' : '-translate-x-full lg:translate-x-0'
        } ${
          direction === 'rtl' ? 'right-0' : 'left-0'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3 overflow-hidden cursor-pointer" onClick={() => setCurrentTab('dashboard')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 flex-shrink-0">
              <Cpu className="w-6 h-6" />
            </div>
            {!collapsed && (
              <div className="truncate">
                <h1 className="font-extrabold text-base tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  TechFix POS
                </h1>
                <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 truncate">
                  {language === 'ar' ? 'صيانة وإكسسوارات' : 'Repair & Retail ERP'}
                </p>
              </div>
            )}
          </div>

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {collapsed ? (
              direction === 'rtl' ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />
            ) : (
              direction === 'rtl' ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentTab(item.id);
                  setMobileOpen(false);
                }}
                title={collapsed ? item.label : undefined}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                    : item.highlight
                    ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Icon className={`w-5 h-5 flex-shrink-0 transition-transform group-hover:scale-110 ${
                  isActive ? 'text-white' : item.highlight ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500'
                }`} />

                {!collapsed && (
                  <span className="flex-1 text-start truncate">
                    {item.label}
                  </span>
                )}

                {!collapsed && item.count !== undefined && item.count > 0 && (
                  <span className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : item.alert
                      ? 'bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                  }`}>
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}

          {/* Dedicated Customer Portal Link */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              onClick={() => {
                setCurrentTab('public_track');
                setMobileOpen(false);
              }}
              title={collapsed ? t('track_repair') : undefined}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors"
            >
              <ExternalLink className="w-5 h-5 flex-shrink-0" />
              {!collapsed && (
                <span className="flex-1 text-start truncate font-semibold">
                  {t('track_repair')}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* User Card / Footer */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          {!collapsed ? (
            <div className="text-xs text-center text-slate-400">
              <span className="font-semibold text-slate-600 dark:text-slate-300">TechFix v2.4</span> &bull; 2026 Edition
            </div>
          ) : (
            <div className="w-2 h-2 rounded-full bg-emerald-500 mx-auto" />
          )}
        </div>
      </aside>
    </>
  );
};
