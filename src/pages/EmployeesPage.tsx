import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Role } from '../types';
import { ShieldCheck, User, Check, X, ShieldAlert } from 'lucide-react';

export const EmployeesPage: React.FC = () => {
  const { users, currentUser, switchUser } = useAuth();
  const { t, language } = useLanguage();

  const permissionsMatrix = [
    { name: 'POS & Sales Checkout', admin: true, manager: true, cashier: true, tech: false, inv: false },
    { name: 'View Financial & Profit Reports', admin: true, manager: true, cashier: false, tech: false, inv: false },
    { name: 'Manage Workshop Repairs', admin: true, manager: true, cashier: true, tech: true, inv: false },
    { name: 'Manage Inventory & Stock-In', admin: true, manager: true, cashier: false, tech: false, inv: true },
    { name: 'Edit Wholesale Cost Prices', admin: true, manager: true, cashier: false, tech: false, inv: true },
    { name: 'System Settings & Database Backups', admin: true, manager: false, cashier: false, tech: false, inv: false },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-blue-600" />
          <span>{t('employees')}</span>
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          {language === 'ar' ? 'إدارة أدوار الموظفين، الصلاحيات، وتبديل الحسابات' : 'Role-based access controls, employee permissions, and account management'}
        </p>
      </div>

      {/* Active User Highlight Card */}
      <div className="p-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-3xl shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <img src={currentUser.avatar} alt="" className="w-14 h-14 rounded-2xl object-cover ring-2 ring-white/30" />
          <div>
            <span className="text-[10px] uppercase font-bold text-blue-200 tracking-wider block">Active Session</span>
            <h3 className="text-xl font-black">{currentUser.name}</h3>
            <p className="text-xs text-blue-100 capitalize font-medium">{currentUser.role.replace('_', ' ')} &bull; {currentUser.email}</p>
          </div>
        </div>

        <div className="text-xs text-blue-100 bg-white/10 px-4 py-2 rounded-xl backdrop-blur-sm">
          Click any employee below to simulate their role!
        </div>
      </div>

      {/* Employees Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {users.map((u) => {
          const isCurrent = u.id === currentUser.id;
          return (
            <div
              key={u.id}
              onClick={() => switchUser(u.id)}
              className={`p-5 rounded-3xl border transition-all cursor-pointer ${
                isCurrent
                  ? 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-600 shadow-md'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-blue-300'
              }`}
            >
              <div className="flex items-center gap-3 mb-3">
                <img src={u.avatar} alt="" className="w-12 h-12 rounded-2xl object-cover" />
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate">{u.name}</h4>
                  <span className="text-xs font-semibold text-blue-600 capitalize block">{u.role.replace('_', ' ')}</span>
                </div>
                {isCurrent && <span className="text-[10px] px-2 py-0.5 bg-blue-600 text-white rounded-full font-bold">Active</span>}
              </div>
              <p className="text-xs text-slate-500 truncate">{u.email}</p>
            </div>
          );
        })}
      </div>

      {/* Permission Matrix */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          Role-Based Permission Matrix
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-start text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold pb-2">
                <th className="text-start pb-2">Permission / Feature Area</th>
                <th className="text-center pb-2">Admin</th>
                <th className="text-center pb-2">Manager</th>
                <th className="text-center pb-2">Cashier</th>
                <th className="text-center pb-2">Technician</th>
                <th className="text-center pb-2">Inventory Officer</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {permissionsMatrix.map((row, i) => (
                <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="py-3 font-semibold text-slate-800 dark:text-slate-200">{row.name}</td>
                  <td className="py-3 text-center">{row.admin ? <Check className="w-4 h-4 text-emerald-500 mx-auto" /> : <X className="w-4 h-4 text-slate-300 mx-auto" />}</td>
                  <td className="py-3 text-center">{row.manager ? <Check className="w-4 h-4 text-emerald-500 mx-auto" /> : <X className="w-4 h-4 text-slate-300 mx-auto" />}</td>
                  <td className="py-3 text-center">{row.cashier ? <Check className="w-4 h-4 text-emerald-500 mx-auto" /> : <X className="w-4 h-4 text-slate-300 mx-auto" />}</td>
                  <td className="py-3 text-center">{row.tech ? <Check className="w-4 h-4 text-emerald-500 mx-auto" /> : <X className="w-4 h-4 text-slate-300 mx-auto" />}</td>
                  <td className="py-3 text-center">{row.inv ? <Check className="w-4 h-4 text-emerald-500 mx-auto" /> : <X className="w-4 h-4 text-slate-300 mx-auto" />}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
