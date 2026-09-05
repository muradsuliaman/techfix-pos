import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import { formatCurrency, formatDate } from '../utils/formatters';
import { Customer } from '../types';
import { Modal } from '../components/common/Modal';
import { Users, Plus, Search, Phone, MessageSquare, DollarSign, Wrench, ShoppingCart } from 'lucide-react';

export const CustomersPage: React.FC = () => {
  const { customers, sales, repairs, addCustomer, updateCustomer, settleCustomerDebt, settings } = useApp();
  const { t, language } = useLanguage();
  const { showToast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCust, setSelectedCust] = useState<Customer | null>(null);

  // New Customer Modal
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    whatsapp: '',
    email: '',
    address: '',
    notes: ''
  });

  // Debt Payment Modal
  const [settleModalOpen, setSettleModalOpen] = useState(false);
  const [debtCust, setDebtCust] = useState<Customer | null>(null);
  const [settleAmount, setSettleAmount] = useState<number>(0);
  const [settleMethod, setSettleMethod] = useState<'cash' | 'card' | 'bank'>('cash');

  const handleSaveCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim()) return;

    addCustomer({
      name: formData.name.trim(),
      phone: formData.phone.trim(),
      whatsapp: formData.whatsapp.trim() || ('970' + formData.phone.replace(/^0+/, '')),
      email: formData.email.trim(),
      address: formData.address.trim(),
      notes: formData.notes.trim()
    });

    setAddModalOpen(false);
    setFormData({ name: '', phone: '', whatsapp: '', email: '', address: '', notes: '' });
    showToast('Customer registered successfully', 'success');
  };

  const handleSettleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!debtCust || settleAmount <= 0) return;

    settleCustomerDebt(debtCust.id, settleAmount, settleMethod);
    setSettleModalOpen(false);
    setSettleAmount(0);
    showToast(`Received ${settleAmount} ₪ debt payment`, 'success');
  };

  const filteredCustomers = customers.filter((c) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return c.name.toLowerCase().includes(q) || c.phone.includes(q) || (c.address && c.address.toLowerCase().includes(q));
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            <span>{t('customers')}</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {language === 'ar' ? 'إدارة العملاء، سجل المشتريات، متابعة الصيانة، والديون' : 'Customer CRM, purchase logs, repair history, and debt balances'}
          </p>
        </div>

        <button
          onClick={() => setAddModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs md:text-sm font-bold shadow-lg shadow-blue-500/25 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>{language === 'ar' ? 'إضافة عميل جديد' : 'New Customer'}</span>
        </button>
      </div>

      {/* Search Filter */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="relative">
          <Search className="absolute start-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by customer name, phone, address..."
            className="w-full ps-9 pe-4 py-2 text-xs bg-slate-100 dark:bg-slate-800 border-none rounded-2xl text-slate-900 dark:text-white outline-none"
          />
        </div>
      </div>

      {/* Customer Cards & Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-start text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 text-slate-500 font-semibold">
                <th className="text-start p-4">Customer Name</th>
                <th className="text-start p-4">Contact Info</th>
                <th className="text-center p-4">Total Purchases</th>
                <th className="text-center p-4">Repairs</th>
                <th className="text-end p-4">Outstanding Debt</th>
                <th className="text-end p-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredCustomers.map((cust) => (
                <tr 
                  key={cust.id} 
                  onClick={() => setSelectedCust(cust)}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors cursor-pointer"
                >
                  <td className="p-4">
                    <span className="font-bold text-slate-900 dark:text-white block">{cust.name}</span>
                    <span className="text-[10px] text-slate-400">{cust.address || 'Store Customer'}</span>
                  </td>
                  <td className="p-4 font-mono">
                    <span className="text-slate-800 dark:text-slate-200 font-bold block">{cust.phone}</span>
                    {cust.email && <span className="text-[10px] text-slate-400 font-sans">{cust.email}</span>}
                  </td>
                  <td className="p-4 text-center font-mono font-bold">
                    {formatCurrency(cust.totalPurchases, settings.currencySymbol, language)}
                  </td>
                  <td className="p-4 text-center font-mono font-bold text-blue-600">
                    {cust.totalRepairs}
                  </td>
                  <td className="p-4 text-end font-mono">
                    {cust.outstandingBalance > 0 ? (
                      <span className="font-extrabold text-rose-600 dark:text-rose-400">
                        {formatCurrency(cust.outstandingBalance, settings.currencySymbol, language)}
                      </span>
                    ) : (
                      <span className="text-emerald-600 font-bold">₪0.00</span>
                    )}
                  </td>
                  <td className="p-4 text-end" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-2">
                      {cust.whatsapp && (
                        <a
                          href={`https://wa.me/${cust.whatsapp.replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noreferrer"
                          title="WhatsApp Chat"
                          className="p-1.5 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-100 transition-colors"
                        >
                          <MessageSquare className="w-4 h-4" />
                        </a>
                      )}
                      {cust.outstandingBalance > 0 && (
                        <button
                          onClick={() => {
                            setDebtCust(cust);
                            setSettleAmount(cust.outstandingBalance);
                            setSettleModalOpen(true);
                          }}
                          className="px-3 py-1.5 bg-rose-50 text-rose-600 font-bold rounded-xl hover:bg-rose-100 text-xs"
                        >
                          Settle Debt
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Details Drawer */}
      {selectedCust && (
        <Modal
          isOpen={!!selectedCust}
          onClose={() => setSelectedCust(null)}
          title={`Customer Profile: ${selectedCust.name}`}
          maxWidth="2xl"
        >
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl flex flex-wrap justify-between items-center gap-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">{selectedCust.name}</h3>
                <p className="text-slate-500">{selectedCust.phone} &bull; {selectedCust.email}</p>
                <p className="text-slate-400 text-[11px] mt-1">{selectedCust.address}</p>
              </div>

              <div className="text-end">
                <span className="text-slate-400 block">Debt Balance:</span>
                <span className="text-lg font-black text-rose-600 font-mono">
                  {formatCurrency(selectedCust.outstandingBalance, settings.currencySymbol)}
                </span>
              </div>
            </div>

            {/* Notes */}
            {selectedCust.notes && (
              <div className="p-3 bg-blue-50 dark:bg-blue-950/40 rounded-xl">
                <span className="font-bold text-blue-900 dark:text-blue-300 block mb-0.5">Notes:</span>
                <p className="text-slate-600 dark:text-slate-300">{selectedCust.notes}</p>
              </div>
            )}

            {/* Recent Purchases by this Customer */}
            <div>
              <h4 className="font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
                <ShoppingCart className="w-4 h-4 text-blue-600" />
                <span>Sales Invoices</span>
              </h4>
              <div className="space-y-1.5 max-h-36 overflow-y-auto">
                {sales.filter((s) => s.customerId === selectedCust.id).length === 0 ? (
                  <p className="text-slate-400 py-2">No direct purchase invoices on file</p>
                ) : (
                  sales.filter((s) => s.customerId === selectedCust.id).map((s) => (
                    <div key={s.id} className="p-2 bg-slate-50 dark:bg-slate-800 rounded-xl flex justify-between">
                      <span className="font-mono font-bold text-blue-600">{s.invoiceNumber}</span>
                      <span className="text-slate-500">{s.items.length} items</span>
                      <span className="font-mono font-bold">{formatCurrency(s.total, settings.currencySymbol)}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Repair Tickets for this customer */}
            <div>
              <h4 className="font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
                <Wrench className="w-4 h-4 text-blue-600" />
                <span>Repair Tickets</span>
              </h4>
              <div className="space-y-1.5 max-h-36 overflow-y-auto">
                {repairs.filter((r) => r.customerId === selectedCust.id).length === 0 ? (
                  <p className="text-slate-400 py-2">No repair tickets on file</p>
                ) : (
                  repairs.filter((r) => r.customerId === selectedCust.id).map((r) => (
                    <div key={r.id} className="p-2 bg-slate-50 dark:bg-slate-800 rounded-xl flex justify-between">
                      <span className="font-mono font-bold text-blue-600">{r.ticketNumber}</span>
                      <span className="font-semibold">{r.brand} {r.model}</span>
                      <span className="capitalize">{r.status.replace('_', ' ')}</span>
                      <span className="font-mono font-bold">{formatCurrency(r.finalCost, settings.currencySymbol)}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Settle Debt Modal */}
      <Modal
        isOpen={settleModalOpen}
        onClose={() => setSettleModalOpen(false)}
        title="Record Debt Payment"
        maxWidth="sm"
      >
        <form onSubmit={handleSettleSubmit} className="space-y-4 text-xs">
          <p className="text-slate-600 dark:text-slate-300">
            Paying debt for <span className="font-bold text-slate-900 dark:text-white">{debtCust?.name}</span>
          </p>

          <div>
            <label className="block font-bold mb-1">Amount Received (₪)</label>
            <input
              type="number"
              min="1"
              required
              value={settleAmount || ''}
              onChange={(e) => setSettleAmount(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl outline-none font-mono font-bold text-base"
            />
          </div>

          <div>
            <label className="block font-bold mb-1">Payment Method</label>
            <select
              value={settleMethod}
              onChange={(e) => setSettleMethod(e.target.value as any)}
              className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl outline-none font-bold"
            >
              <option value="cash">Cash (Register Drawer)</option>
              <option value="card">Credit Card</option>
              <option value="bank">Bank Transfer</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setSettleModalOpen(false)}
              className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl font-bold"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-600 text-white rounded-xl font-bold shadow"
            >
              Confirm Payment
            </button>
          </div>
        </form>
      </Modal>

      {/* Add Customer Modal */}
      <Modal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="Register New Customer"
        maxWidth="md"
      >
        <form onSubmit={handleSaveCustomer} className="space-y-3 text-xs">
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Customer Name *</label>
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
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Phone *</label>
              <input
                type="text"
                required
                placeholder="0599000000"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl outline-none font-mono"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">WhatsApp</label>
              <input
                type="text"
                placeholder="970599000000"
                value={formData.whatsapp}
                onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl outline-none font-mono"
              />
            </div>
          </div>
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl outline-none"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Address / City</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl outline-none"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Notes</label>
            <textarea
              rows={2}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
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
