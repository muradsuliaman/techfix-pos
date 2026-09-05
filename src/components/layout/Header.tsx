import React, { useState } from 'react';
import { 
  Menu, 
  Sun, 
  Moon, 
  Languages, 
  Bell, 
  Search, 
  ShoppingCart, 
  UserCheck, 
  ExternalLink,
  ChevronDown,
  Check
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { TabType } from './Sidebar';
import { Role } from '../../types';

interface HeaderProps {
  currentTab: TabType;
  setCurrentTab: (tab: TabType) => void;
  setMobileOpen: (o: boolean) => void;
  collapsed: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  setCurrentTab,
  setMobileOpen,
  collapsed
}) => {
  const { t, language, toggleLanguage, direction } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const { currentUser, switchUser, users } = useAuth();
  const { notifications, markNotificationAsRead, cart } = useApp();

  const [notifOpen, setNotifOpen] = useState(false);
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);

  const unreadNotifs = notifications.filter((n) => !n.read);

  const roleTitles: Record<Role, { en: string; ar: string }> = {
    admin: { en: 'Administrator', ar: 'مدير النظام' },
    manager: { en: 'Shop Manager', ar: 'مدير المتجر' },
    cashier: { en: 'Cashier', ar: 'أمين الصندوق' },
    technician: { en: 'Technician', ar: 'فني صيانة' },
    inventory_manager: { en: 'Inventory Officer', ar: 'مسؤول المستودع' }
  };

  return (
    <header className={`fixed top-0 end-0 z-30 h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-all duration-300 ${
      collapsed ? 'start-0 lg:start-20' : 'start-0 lg:start-64'
    }`}>
      <div className="h-full px-4 flex items-center justify-between gap-4">
        {/* Left Side: Mobile Menu & Breadcrumb */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden p-2 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white capitalize">
              {t(currentTab)}
            </h2>
          </div>
        </div>

        {/* Right Side: Quick Actions, Role Switcher, Lang/Theme */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* Quick POS Launch Button */}
          {currentTab !== 'pos' && (
            <button
              onClick={() => setCurrentTab('pos')}
              className="flex items-center gap-2 px-3.5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold text-xs md:text-sm shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30 transition-all transform hover:-translate-y-0.5"
            >
              <ShoppingCart className="w-4 h-4" />
              <span className="hidden sm:inline">{t('pos')}</span>
              {cart.length > 0 && (
                <span className="w-5 h-5 bg-white text-blue-600 text-[11px] font-bold rounded-full flex items-center justify-center">
                  {cart.length}
                </span>
              )}
            </button>
          )}

          {/* Customer Portal Link */}
          <button
            onClick={() => setCurrentTab('public_track')}
            className="hidden md:flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl hover:bg-emerald-100 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>{t('track_repair')}</span>
          </button>

          {/* Language Toggle */}
          <button
            onClick={toggleLanguage}
            title="Toggle Language / تغيير اللغة"
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors"
          >
            <Languages className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>{language === 'en' ? 'العربية' : 'English'}</span>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            title="Toggle Theme"
            className="p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
          </button>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => setNotifOpen(!notifOpen)}
              className="relative p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors"
            >
              <Bell className="w-4 h-4" />
              {unreadNotifs.length > 0 && (
                <span className="absolute -top-1 -end-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                  {unreadNotifs.length}
                </span>
              )}
            </button>

            {notifOpen && (
              <div className="absolute end-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-4 z-50">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                    {t('notifications')}
                  </h4>
                  <span className="text-xs text-blue-600 dark:text-blue-400 font-semibold cursor-pointer" onClick={() => setCurrentTab('notifications')}>
                    {t('view_details')}
                  </span>
                </div>

                <div className="mt-3 space-y-2 max-h-72 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-4">No notifications</p>
                  ) : (
                    notifications.slice(0, 4).map((n) => (
                      <div
                        key={n.id}
                        onClick={() => {
                          markNotificationAsRead(n.id);
                          if (n.link) setCurrentTab(n.link as TabType);
                          setNotifOpen(false);
                        }}
                        className={`p-3 rounded-xl cursor-pointer text-xs transition-colors ${
                          !n.read 
                            ? 'bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/50' 
                            : 'bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-slate-900 dark:text-white">
                            {language === 'ar' ? n.titleAr : n.title}
                          </span>
                          <span className="text-[10px] text-slate-400">{n.date.split(' ')[1] || n.date}</span>
                        </div>
                        <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed line-clamp-2">
                          {language === 'ar' ? n.messageAr : n.message}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Active User / Role Switcher */}
          <div className="relative">
            <button
              onClick={() => setRoleMenuOpen(!roleMenuOpen)}
              className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors text-start"
            >
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-7 h-7 rounded-lg object-cover ring-1 ring-blue-500/50"
              />
              <div className="hidden xl:block">
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-[120px]">
                  {currentUser.name}
                </p>
                <p className="text-[10px] font-medium text-blue-600 dark:text-blue-400 capitalize">
                  {roleTitles[currentUser.role]?.[language] || currentUser.role}
                </p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {roleMenuOpen && (
              <div className="absolute end-0 mt-2 w-64 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-2 z-50">
                <div className="p-2 border-b border-slate-200 dark:border-slate-800 mb-1">
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    {language === 'ar' ? 'تبديل دور المستخدم (للتجربة)' : 'Switch Role (Demo)'}
                  </p>
                </div>

                <div className="space-y-1">
                  {users.map((u) => {
                    const isCurrent = u.id === currentUser.id;
                    return (
                      <button
                        key={u.id}
                        onClick={() => {
                          switchUser(u.id);
                          setRoleMenuOpen(false);
                        }}
                        className={`w-full flex items-center justify-between p-2 rounded-xl text-xs transition-colors ${
                          isCurrent
                            ? 'bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold'
                            : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <img src={u.avatar} alt="" className="w-6 h-6 rounded-md object-cover" />
                          <div className="text-start truncate">
                            <p className="truncate font-semibold">{u.name}</p>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400">
                              {roleTitles[u.role]?.[language] || u.role}
                            </p>
                          </div>
                        </div>
                        {isCurrent && <Check className="w-4 h-4 text-blue-600" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
