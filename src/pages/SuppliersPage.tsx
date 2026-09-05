import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import { formatCurrency } from '../utils/formatters';
import { Supplier } from '../types';
import { Modal } from '../components/common/Modal';
import { Building2, Plus, Phone, MessageSquare, DollarSign, Search } from 'lucide-react';

export const SuppliersPage: React.FC = () => {
  const { suppliers, addSupplier, paySupplier, settings } = useApp();
  const { t, language } = useLanguage();
  const { showToast } = useToast();

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [activeSup, setActiveSup] = useState<Supplier | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    contactPerson: '',
    phone: '',
    whatsapp: '',
    email: '',
    address: '',
    notes: ''
  });

  const [payAmount, setPayAmount] = useState<number>(0);
  const [payMethod, setPayMethod] = useState<'cash' | 'bank'>('bank');

  const handleCreateSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    addSupplier({
      name: formData.name.trim(),
      contactPerson: formData.contactPerson.trim(),
      phone: formData.phone.trim(),
      whatsapp: formData.whatsapp.trim(),
      email: formData.email.trim(),
      address: formData.address.trim(),
      notes: formData.notes.trim()
    });

    setAddModalOpen(false);
    setFormData({ name: '', contactPerson: '', phone: '', whatsapp: '', email: '', address: '', notes: '' });
    showToast('Supplier registered', 'success');
  };

  const handlePaySupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSup || payAmount <= 0) return;

    paySupplier(activeSup.id, payAmount, payMethod);
    setPayModalOpen(false);
    setPayAmount(0);
    showToast(`Recorded ${payAmount} ₪ payment to supplier`, 'success');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-600" />
            <span>{t('suppliers')}</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {language === 'ar' ? 'شركات التوريد، الديون المستحقة، ومسؤولي المبيعات' : 'Electronics distributors, payables, and procurement ledger'}
          </p>
        </div>

        <button
          onClick={() => setAddModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs md:text-sm font-bold shadow-lg shadow-blue-500/25 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>{language === 'ar' ? 'إضافة مورد جديد' : 'New Supplier'}</span>
        </button>
      </div>

      {/* Supplier Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {suppliers.map((sup) => (
          <div
            key={sup.id}
            className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] uppercase font-bold text-slate-400">Distributor</span>
                <span className={`text-xs font-mono font-extrabold px-2 py-0.5 rounded-full ${
                  sup.balance > 0 ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400' : 'bg-emerald-100 text-emerald-700'
                }`}>
                  Owed: {formatCurrency(sup.balance, settings.currencySymbol, language)}
                </span>
              </div>

              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white line-clamp-1">{sup.name}</h3>
              <p className="text-xs text-slate-500 mt-0.5">{sup.contactPerson}</p>

              <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-1 text-xs text-slate-600 dark:text-slate-300">
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-mono">{sup.phone}</span>
                </div>
                {sup.address && (
                  <p className="text-[11px] text-slate-400 truncate">{sup.address}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
              {sup.whatsapp && (
                <a
                  href={`https://wa.me/${sup.whatsapp.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-100 transition-colors"
                >
                  <MessageSquare className="w-4 h-4" />
                </a>
              )}

              {sup.balance > 0 && (
                <button
                  onClick={() => {
                    setActiveSup(sup);
                    setPayAmount(sup.balance);
                    setPayModalOpen(true);
                  }}
                  className="flex-1 py-2 bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 font-bold rounded-xl hover:bg-blue-100 text-xs"
                >
                  Pay Supplier
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Pay Supplier Modal */}
      <Modal
        isOpen={payModalOpen}
        onClose={() => setPayModalOpen(false)}
        title="Record Supplier Payment"
        maxWidth="sm"
      >
        <form onSubmit={handlePaySupplier} className="space-y-4 text-xs">
          <p className="text-slate-600 dark:text-slate-300">
            Payment to: <span className="font-bold text-slate-900 dark:text-white">{activeSup?.name}</span>
          </p>

          <div>
            <label className="block font-bold mb-1">Payment Amount (₪)</label>
            <input
              type="number"
              min="1"
              required
              value={payAmount || ''}
              onChange={(e) => setPayAmount(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl outline-none font-mono font-bold text-base"
            />
          </div>

          <div>
            <label className="block font-bold mb-1">Source Account</label>
            <select
              value={payMethod}
              onChange={(e) => setPayMethod(e.target.value as any)}
              className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl outline-none font-bold"
            >
              <option value="bank">Company Bank Account</option>
              <option value="cash">Register Cash Drawer</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setPayModalOpen(false)}
              className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl font-bold"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 text-white rounded-xl font-bold shadow"
            >
              Record Payment
            </button>
          </div>
        </form>
      </Modal>

      {/* Add Supplier Modal */}
      <Modal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="Register Supplier"
        maxWidth="md"
      >
        <form onSubmit={handleCreateSupplier} className="space-y-3 text-xs">
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Company / Supplier Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl outline-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Contact Person</label>
              <input
                type="text"
                value={formData.contactPerson}
                onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl outline-none"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Phone Number</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl outline-none font-mono"
              />
            </div>
          </div>
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">WhatsApp</label>
            <input
              type="text"
              value={formData.whatsapp}
              onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
              className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl outline-none font-mono"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Address / Warehouse</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl outline-none"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setAddModalOpen(false)}
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
