import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import { formatCurrency, formatDate } from '../utils/formatters';
import { Modal } from '../components/common/Modal';
import { Truck, Plus, Search, Trash2, CheckCircle2, ShoppingBag } from 'lucide-react';

export const PurchasesPage: React.FC = () => {
  const { purchases, suppliers, products, createPurchase, settings } = useApp();
  const { t, language } = useLanguage();
  const { showToast } = useToast();

  const [poModalOpen, setPoModalOpen] = useState(false);
  const [selectedSupplierId, setSelectedSupplierId] = useState(suppliers[0]?.id || '');
  const [paidAmount, setPaidAmount] = useState<number>(0);
  const [notes, setNotes] = useState('');

  // Purchase Items Line Rows
  const [items, setItems] = useState<{ productId: string; quantity: number; unitCost: number }[]>([
    { productId: products[0]?.id || '', quantity: 10, unitCost: products[0]?.purchasePrice || 35 }
  ]);

  const addItemRow = () => {
    setItems([...items, { productId: products[0]?.id || '', quantity: 5, unitCost: products[0]?.purchasePrice || 30 }]);
  };

  const removeItemRow = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItemRow = (index: number, field: string, val: any) => {
    const next = [...items];
    (next[index] as any)[field] = val;
    if (field === 'productId') {
      const prod = products.find((p) => p.id === val);
      if (prod) next[index].unitCost = prod.purchasePrice;
    }
    setItems(next);
  };

  const totalCost = items.reduce((sum, it) => sum + it.quantity * it.unitCost, 0);

  const handleCreatePO = (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;

    createPurchase({
      supplierId: selectedSupplierId,
      items,
      paidAmount: paidAmount || 0,
      notes
    });

    setPoModalOpen(false);
    setNotes('');
    setPaidAmount(0);
    showToast('Purchase invoice created & inventory restocked', 'success');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Truck className="w-5 h-5 text-blue-600" />
            <span>{t('purchases')}</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {language === 'ar' ? 'فواتير التوريد، زيادة المخزون تلقائياً، وحسابات الموردين' : 'Create restock purchase orders and update inventory automatically'}
          </p>
        </div>

        <button
          onClick={() => {
            setItems([{ productId: products[0]?.id || '', quantity: 10, unitCost: products[0]?.purchasePrice || 35 }]);
            setPoModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs md:text-sm font-bold shadow-lg shadow-blue-500/25 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>{language === 'ar' ? 'فاتورة مشتريات جديدة' : 'New Purchase Invoice'}</span>
        </button>
      </div>

      {/* Purchases List */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-start text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 text-slate-500 font-semibold">
                <th className="text-start p-4">Invoice #</th>
                <th className="text-start p-4">Supplier</th>
                <th className="text-start p-4">Items Summary</th>
                <th className="text-end p-4">Total Amount</th>
                <th className="text-end p-4">Paid Amount</th>
                <th className="text-end p-4">Remaining Balance</th>
                <th className="text-center p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {purchases.map((po) => (
                <tr key={po.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="p-4 font-mono font-bold text-blue-600">
                    {po.invoiceNumber}
                    <span className="block text-[10px] text-slate-400 font-normal">{formatDate(po.createdAt)}</span>
                  </td>
                  <td className="p-4 font-bold text-slate-900 dark:text-white">{po.supplierName}</td>
                  <td className="p-4 text-slate-600 dark:text-slate-300">
                    {po.items.map((it, i) => (
                      <span key={i} className="inline-block me-2">
                        {it.productName} (x{it.quantity})
                      </span>
                    ))}
                  </td>
                  <td className="p-4 text-end font-mono font-bold text-slate-900 dark:text-white">
                    {formatCurrency(po.totalAmount, settings.currencySymbol, language)}
                  </td>
                  <td className="p-4 text-end font-mono text-emerald-600 font-bold">
                    {formatCurrency(po.paidAmount, settings.currencySymbol, language)}
                  </td>
                  <td className="p-4 text-end font-mono text-rose-600 font-bold">
                    {formatCurrency(po.remainingAmount, settings.currencySymbol, language)}
                  </td>
                  <td className="p-4 text-center">
                    <span className="px-2.5 py-0.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 rounded-full font-bold uppercase text-[10px]">
                      {po.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Purchase Invoice Modal */}
      <Modal
        isOpen={poModalOpen}
        onClose={() => setPoModalOpen(false)}
        title="Create Purchase Invoice"
        maxWidth="3xl"
      >
        <form onSubmit={handleCreatePO} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Select Supplier</label>
            <select
              value={selectedSupplierId}
              onChange={(e) => setSelectedSupplierId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl outline-none font-bold"
            >
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>{s.name} (Debt: {s.balance} ₪)</option>
              ))}
            </select>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="font-bold text-slate-700 dark:text-slate-300">Items to Restock</label>
              <button
                type="button"
                onClick={addItemRow}
                className="px-2.5 py-1 bg-blue-50 text-blue-600 font-bold rounded-lg hover:bg-blue-100"
              >
                + Add Item
              </button>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {items.map((row, idx) => (
                <div key={idx} className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 p-2.5 rounded-xl">
                  <select
                    value={row.productId}
                    onChange={(e) => updateItemRow(idx, 'productId', e.target.value)}
                    className="flex-1 px-2 py-1 bg-white dark:bg-slate-900 rounded-lg outline-none font-medium"
                  >
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>{p.name} (Current: {p.quantity})</option>
                    ))}
                  </select>

                  <div className="w-24">
                    <input
                      type="number"
                      min="1"
                      placeholder="Qty"
                      value={row.quantity}
                      onChange={(e) => updateItemRow(idx, 'quantity', parseInt(e.target.value) || 1)}
                      className="w-full px-2 py-1 bg-white dark:bg-slate-900 rounded-lg outline-none font-mono text-center"
                    />
                  </div>

                  <div className="w-24">
                    <input
                      type="number"
                      min="0"
                      placeholder="Cost"
                      value={row.unitCost}
                      onChange={(e) => updateItemRow(idx, 'unitCost', parseFloat(e.target.value) || 0)}
                      className="w-full px-2 py-1 bg-white dark:bg-slate-900 rounded-lg outline-none font-mono text-end"
                    />
                  </div>

                  <span className="font-mono font-bold w-20 text-end">
                    {formatCurrency(row.quantity * row.unitCost, settings.currencySymbol)}
                  </span>

                  <button
                    type="button"
                    onClick={() => removeItemRow(idx)}
                    disabled={items.length === 1}
                    className="p-1 text-slate-400 hover:text-rose-500 disabled:opacity-30"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl">
            <div>
              <span className="text-slate-400 block mb-1">Total PO Amount:</span>
              <span className="text-xl font-black font-mono text-slate-900 dark:text-white">
                {formatCurrency(totalCost, settings.currencySymbol)}
              </span>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Paid Amount Now (₪)</label>
              <input
                type="number"
                min="0"
                value={paidAmount || ''}
                onChange={(e) => setPaidAmount(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 rounded-xl outline-none font-mono font-bold"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Remaining ₪{Math.max(0, totalCost - paidAmount)} added to supplier debt
              </span>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Notes / Bill Reference</label>
            <input
              type="text"
              placeholder="e.g. Delivered by courier, check #9021..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setPoModalOpen(false)}
              className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl font-bold"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-xl font-bold shadow"
            >
              Confirm & Stock In
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
