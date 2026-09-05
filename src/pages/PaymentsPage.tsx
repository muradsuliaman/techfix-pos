import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import { formatCurrency, formatDate } from '../utils/formatters';
import { Modal } from '../components/common/Modal';
import { CreditCard, Banknote, ShieldCheck, Lock, Unlock, DollarSign, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export const PaymentsPage: React.FC = () => {
  const { registerSession, openRegisterSession, closeRegisterSession, settings, customers, suppliers } = useApp();
  const { t, language } = useLanguage();
  const { showToast } = useToast();

  const [openModal, setOpenModal] = useState(false);
  const [closeModal, setCloseModal] = useState(false);
  const [openAmount, setOpenAmount] = useState<number>(500);
  const [actualCashCount, setActualCashCount] = useState<number>(registerSession.expectedCash);

  const totalCustomerDebt = customers.reduce((sum, c) => sum + c.outstandingBalance, 0);
  const totalSupplierDebt = suppliers.reduce((sum, s) => sum + s.balance, 0);

  const handleOpenRegister = (e: React.FormEvent) => {
    e.preventDefault();
    openRegisterSession(openAmount);
    setOpenModal(false);
    showToast('New cash register session opened', 'success');
  };

  const handleCloseRegister = (e: React.FormEvent) => {
    e.preventDefault();
    closeRegisterSession(actualCashCount);
    setCloseModal(false);
    showToast('Register session closed and reconciled', 'info');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-blue-600" />
            <span>{t('payments')}</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {language === 'ar' ? 'جلسات الصندوق اليومية، تسوية النقدية، وحسابات الذمم' : 'Daily cash register reconciliation, cash drawer balance, and accounts'}
          </p>
        </div>

        <div>
          {registerSession.status === 'open' ? (
            <button
              onClick={() => {
                setActualCashCount(registerSession.expectedCash);
                setCloseModal(true);
              }}
              className="flex items-center gap-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl text-xs md:text-sm font-bold shadow transition-all"
            >
              <Lock className="w-4 h-4" />
              <span>{language === 'ar' ? 'إغلاق درج الكاشير' : 'Close Cash Register'}</span>
            </button>
          ) : (
            <button
              onClick={() => setOpenModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs md:text-sm font-bold shadow transition-all"
            >
              <Unlock className="w-4 h-4" />
              <span>{language === 'ar' ? 'فتح جلسة كاشير جديدة' : 'Open Register Session'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Cash Drawer Status Card */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-950 text-white p-6 md:p-8 rounded-3xl shadow-xl space-y-6 border border-slate-800">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`w-2.5 h-2.5 rounded-full ${
                registerSession.status === 'open' ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
              }`} />
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-slate-400">
                Session: {registerSession.id}
              </span>
            </div>
            <h3 className="text-3xl font-black font-mono">
              {formatCurrency(registerSession.expectedCash, settings.currencySymbol, language)}
            </h3>
            <p className="text-xs text-slate-400 mt-1">Expected Cash in Drawer Right Now</p>
          </div>

          <div className="text-end">
            <span className="text-xs text-slate-400 block">Active Cashier:</span>
            <span className="font-bold text-sm text-white">{registerSession.cashierName}</span>
            <span className="text-[11px] text-slate-500 block mt-0.5">Opened: {formatDate(registerSession.openedAt)}</span>
          </div>
        </div>

        {/* Breakdown Flow */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 text-xs font-mono">
          <div className="p-3 bg-slate-800/60 rounded-2xl">
            <span className="text-slate-400 block text-[10px]">Opening Float</span>
            <span className="font-bold text-white text-sm">{formatCurrency(registerSession.openingCash, settings.currencySymbol)}</span>
          </div>
          <div className="p-3 bg-emerald-950/40 border border-emerald-800/40 rounded-2xl text-emerald-400">
            <span className="text-[10px] block">+ Cash Sales</span>
            <span className="font-bold text-sm">+{formatCurrency(registerSession.cashSales, settings.currencySymbol)}</span>
          </div>
          <div className="p-3 bg-emerald-950/40 border border-emerald-800/40 rounded-2xl text-emerald-400">
            <span className="text-[10px] block">+ Cash Repairs</span>
            <span className="font-bold text-sm">+{formatCurrency(registerSession.cashRepairs, settings.currencySymbol)}</span>
          </div>
          <div className="p-3 bg-rose-950/40 border border-rose-800/40 rounded-2xl text-rose-400">
            <span className="text-[10px] block">- Cash Expenses</span>
            <span className="font-bold text-sm">-{formatCurrency(registerSession.cashExpenses, settings.currencySymbol)}</span>
          </div>
          <div className="p-3 bg-blue-950/40 border border-blue-800/40 rounded-2xl text-blue-400">
            <span className="text-[10px] block">+ Customer Debts</span>
            <span className="font-bold text-sm">+{formatCurrency(registerSession.customerDebtCash, settings.currencySymbol)}</span>
          </div>
        </div>
      </div>

      {/* Receivables & Payables Ledger */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Customer Accounts Receivable */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {language === 'ar' ? 'ديون ومستحقات على العملاء' : 'Accounts Receivable (Customer Debts)'}
            </h3>
            <span className="text-sm font-extrabold font-mono text-rose-600 dark:text-rose-400">
              {formatCurrency(totalCustomerDebt, settings.currencySymbol, language)}
            </span>
          </div>

          <div className="space-y-2">
            {customers.filter((c) => c.outstandingBalance > 0).map((c) => (
              <div key={c.id} className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl flex justify-between items-center text-xs">
                <div>
                  <span className="font-bold text-slate-900 dark:text-white block">{c.name}</span>
                  <span className="text-slate-500 font-mono">{c.phone}</span>
                </div>
                <span className="font-mono font-extrabold text-rose-600">
                  {formatCurrency(c.outstandingBalance, settings.currencySymbol)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Supplier Accounts Payable */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {language === 'ar' ? 'مستحقات واجبة للموردين' : 'Accounts Payable (Supplier Debts)'}
            </h3>
            <span className="text-sm font-extrabold font-mono text-rose-600 dark:text-rose-400">
              {formatCurrency(totalSupplierDebt, settings.currencySymbol, language)}
            </span>
          </div>

          <div className="space-y-2">
            {suppliers.filter((s) => s.balance > 0).map((s) => (
              <div key={s.id} className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl flex justify-between items-center text-xs">
                <div>
                  <span className="font-bold text-slate-900 dark:text-white block">{s.name}</span>
                  <span className="text-slate-500">{s.contactPerson}</span>
                </div>
                <span className="font-mono font-extrabold text-rose-600">
                  {formatCurrency(s.balance, settings.currencySymbol)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Close Register Modal */}
      <Modal
        isOpen={closeModal}
        onClose={() => setCloseModal(false)}
        title="Reconcile & Close Cash Drawer"
        maxWidth="sm"
      >
        <form onSubmit={handleCloseRegister} className="space-y-4 text-xs">
          <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl space-y-1">
            <span className="text-slate-400 block text-[11px]">System Expected Cash:</span>
            <span className="text-xl font-black font-mono text-slate-900 dark:text-white">
              {formatCurrency(registerSession.expectedCash, settings.currencySymbol)}
            </span>
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Actual Cash Count in Drawer (₪)
            </label>
            <input
              type="number"
              min="0"
              step="any"
              required
              value={actualCashCount || ''}
              onChange={(e) => setActualCashCount(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl outline-none font-mono font-bold text-base"
            />
          </div>

          <div className="flex justify-between items-center pt-2 font-bold">
            <span className="text-slate-500">Difference (Variance):</span>
            <span className={`font-mono ${
              actualCashCount - registerSession.expectedCash === 0 
                ? 'text-emerald-600' 
                : actualCashCount - registerSession.expectedCash > 0
                ? 'text-blue-600'
                : 'text-rose-600'
            }`}>
              {formatCurrency(actualCashCount - registerSession.expectedCash, settings.currencySymbol)}
            </span>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setCloseModal(false)}
              className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl font-bold"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-rose-600 text-white rounded-xl font-bold shadow"
            >
              Close Drawer Session
            </button>
          </div>
        </form>
      </Modal>

      {/* Open Register Modal */}
      <Modal
        isOpen={openModal}
        onClose={() => setOpenModal(false)}
        title="Open New Register Session"
        maxWidth="sm"
      >
        <form onSubmit={handleOpenRegister} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Opening Float Cash (₪)
            </label>
            <input
              type="number"
              min="0"
              required
              value={openAmount || ''}
              onChange={(e) => setOpenAmount(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl outline-none font-mono font-bold text-base"
            />
            <span className="text-[10px] text-slate-400 mt-1 block">
              Initial coins and bills kept in drawer for change
            </span>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setOpenModal(false)}
              className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl font-bold"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-600 text-white rounded-xl font-bold shadow"
            >
              Open Session
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
