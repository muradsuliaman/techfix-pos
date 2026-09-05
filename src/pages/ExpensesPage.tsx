import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import { formatCurrency, formatDate } from '../utils/formatters';
import { Expense, ExpenseCategory } from '../types';
import { Modal } from '../components/common/Modal';
import { Receipt, Plus, Search, Trash2, Calendar, Banknote, Building, DollarSign } from 'lucide-react';

export const ExpensesPage: React.FC = () => {
  const { expenses, addExpense, deleteExpense, settings } = useApp();
  const { t, language } = useLanguage();
  const { showToast } = useToast();

  const [modalOpen, setModalOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('all');

  const [formData, setFormData] = useState({
    category: 'hospitality' as ExpenseCategory,
    description: '',
    amount: 0,
    paymentMethod: 'cash' as const,
    employeeName: 'Staff',
    notes: ''
  });

  const categories: { id: ExpenseCategory; label: string; labelAr: string }[] = [
    { id: 'rent', label: 'Rent', labelAr: 'إيجار المحل' },
    { id: 'electricity', label: 'Electricity', labelAr: 'كهرباء' },
    { id: 'internet', label: 'Internet & Phone', labelAr: 'إنترنت وهاتف' },
    { id: 'salaries', label: 'Salaries', labelAr: 'رواتب موظفين' },
    { id: 'transport', label: 'Transportation', labelAr: 'مواصلات ونقل' },
    { id: 'maintenance', label: 'Shop Maintenance', labelAr: 'صيانة وتجهيزات' },
    { id: 'hospitality', label: 'Coffee & Hospitality', labelAr: 'ضيافة وبوفيه' },
    { id: 'tools', label: 'Tools & Consumables', labelAr: 'أدوات ومواد ورشة' },
    { id: 'other', label: 'Other', labelAr: 'مصاريف أخرى' },
  ];

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const cashExpenses = expenses.filter((e) => e.paymentMethod === 'cash').reduce((sum, e) => sum + e.amount, 0);
  const bankExpenses = expenses.filter((e) => e.paymentMethod === 'bank').reduce((sum, e) => sum + e.amount, 0);

  const handleCreateExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.description.trim() || formData.amount <= 0) return;

    addExpense({
      date: new Date().toISOString().split('T')[0],
      category: formData.category,
      description: formData.description.trim(),
      amount: formData.amount,
      paymentMethod: formData.paymentMethod,
      employeeName: formData.employeeName,
      notes: formData.notes
    });

    setModalOpen(false);
    setFormData({ category: 'hospitality', description: '', amount: 0, paymentMethod: 'cash', employeeName: 'Staff', notes: '' });
    showToast('Expense recorded', 'success');
  };

  const filteredExpenses = expenses.filter((e) => categoryFilter === 'all' || e.category === categoryFilter);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Receipt className="w-5 h-5 text-blue-600" />
            <span>{t('expenses')}</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {language === 'ar' ? 'تسجيل المصروفات التشغيلية، الإيجارات، وتجهيزات المحل' : 'Record operational expenses, utilities, and workshop materials'}
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs md:text-sm font-bold shadow-lg shadow-blue-500/25 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>{language === 'ar' ? 'تسجيل مصروف جديد' : 'New Expense'}</span>
        </button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 block mb-1">Total Recorded Expenses</span>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white font-mono">
            {formatCurrency(totalExpenses, settings.currencySymbol, language)}
          </h3>
          <p className="text-[11px] text-slate-400 mt-1">{expenses.length} transactions</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 block mb-1">Cash Register Petty Cash</span>
          <h3 className="text-2xl font-black text-rose-600 dark:text-rose-400 font-mono">
            {formatCurrency(cashExpenses, settings.currencySymbol, language)}
          </h3>
          <p className="text-[11px] text-slate-400 mt-1">Deducted from drawer balance</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 block mb-1">Bank Account Payments</span>
          <h3 className="text-2xl font-black text-blue-600 dark:text-blue-400 font-mono">
            {formatCurrency(bankExpenses, settings.currencySymbol, language)}
          </h3>
          <p className="text-[11px] text-slate-400 mt-1">Transferred via bank</p>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-start text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 text-slate-500 font-semibold">
                <th className="text-start p-4">Date</th>
                <th className="text-start p-4">Category</th>
                <th className="text-start p-4">Description</th>
                <th className="text-center p-4">Payment Method</th>
                <th className="text-end p-4">Amount</th>
                <th className="text-end p-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredExpenses.map((exp) => (
                <tr key={exp.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="p-4 font-mono text-slate-400">{exp.date}</td>
                  <td className="p-4 font-bold text-slate-800 dark:text-slate-200 capitalize">
                    {categories.find(c => c.id === exp.category)?.[language === 'ar' ? 'labelAr' : 'label'] || exp.category}
                  </td>
                  <td className="p-4 text-slate-600 dark:text-slate-300">{exp.description}</td>
                  <td className="p-4 text-center">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                      exp.paymentMethod === 'cash' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {exp.paymentMethod}
                    </span>
                  </td>
                  <td className="p-4 text-end font-mono font-extrabold text-slate-900 dark:text-white">
                    {formatCurrency(exp.amount, settings.currencySymbol, language)}
                  </td>
                  <td className="p-4 text-end">
                    <button
                      onClick={() => {
                        deleteExpense(exp.id);
                        showToast('Expense removed', 'info');
                      }}
                      className="p-1 text-slate-400 hover:text-rose-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Expense Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Record Expense"
        maxWidth="md"
      >
        <form onSubmit={handleCreateExpense} className="space-y-3 text-xs">
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Expense Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
              className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl outline-none font-bold"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{language === 'ar' ? c.labelAr : c.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Description *</label>
            <input
              type="text"
              required
              placeholder="e.g. Relife solder paste & copper wick for workshop..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Amount (₪) *</label>
              <input
                type="number"
                min="0.5"
                step="any"
                required
                value={formData.amount || ''}
                onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl outline-none font-mono font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Payment Method</label>
              <select
                value={formData.paymentMethod}
                onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value as any })}
                className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl outline-none font-bold"
              >
                <option value="cash">Cash (Register Drawer)</option>
                <option value="bank">Company Bank Account</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl font-bold"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 text-white rounded-xl font-bold shadow"
            >
              {t('save')}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
