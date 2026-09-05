import React from 'react';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { formatDate } from '../utils/formatters';
import { Bell, CheckCheck, AlertTriangle, Wrench, DollarSign, Package } from 'lucide-react';

export const NotificationsPage: React.FC = () => {
  const { notifications, markNotificationAsRead, markAllNotificationsAsRead } = useApp();
  const { t, language } = useLanguage();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Bell className="w-5 h-5 text-blue-600" />
            <span>{t('notifications')}</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {language === 'ar' ? 'التنبيهات التلقائية لانخفاض المخزون، جاهزية الصيانة، والديون' : 'Automated alerts for inventory, repair pickups, and balances'}
          </p>
        </div>

        <button
          onClick={markAllNotificationsAsRead}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-colors"
        >
          <CheckCheck className="w-4 h-4" />
          <span>Mark All as Read</span>
        </button>
      </div>

      <div className="space-y-3">
        {notifications.map((n) => (
          <div
            key={n.id}
            onClick={() => markNotificationAsRead(n.id)}
            className={`p-4 rounded-3xl border transition-all cursor-pointer ${
              !n.read 
                ? 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-300 dark:border-blue-900 shadow-sm' 
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 opacity-80'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="p-2.5 bg-blue-100 dark:bg-blue-900 text-blue-600 rounded-2xl flex-shrink-0 mt-0.5">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                    {language === 'ar' ? n.titleAr : n.title}
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                    {language === 'ar' ? n.messageAr : n.message}
                  </p>
                </div>
              </div>

              <span className="text-[10px] text-slate-400 font-mono whitespace-nowrap">{n.date}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
