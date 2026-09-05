import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import { formatCurrency, formatDate } from '../utils/formatters';
import { Modal } from '../components/common/Modal';
import { 
  Boxes, 
  ArrowUpRight, 
  ArrowDownRight, 
  RotateCcw, 
  AlertTriangle, 
  Plus, 
  Minus, 
  DollarSign, 
  History,
  TrendingUp,
  Search
} from 'lucide-react';

export const InventoryPage: React.FC = () => {
  const { products, inventoryTransactions, adjustStock, settings } = useApp();
  const { t, language } = useLanguage();
  const { showToast } = useToast();

  const [adjustModalOpen, setAdjustModalOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string>(products[0]?.id || '');
  const [adjustType, setAdjustType] = useState<'in' | 'out' | 'adjustment'>('in');
  const [adjustQuantity, setAdjustQuantity] = useState<number>(1);
  const [adjustReason, setAdjustReason] = useState<string>('');

  const [searchFilter, setSearchFilter] = useState('');

  // Valuation metrics
  const totalRetail = products.reduce((sum, p) => sum + p.sellingPrice * p.quantity, 0);
  const totalCost = products.reduce((sum, p) => sum + p.purchasePrice * p.quantity, 0);
  const unrealizedProfit = totalRetail - totalCost;
  const marginPercent = totalRetail > 0 ? ((unrealizedProfit / totalRetail) * 100).toFixed(1) : '0';

  const lowStockProducts = products.filter((p) => p.quantity <= p.minStock);

  const handleAdjustSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId || adjustQuantity <= 0) return;

    adjustStock(
      selectedProductId,
      adjustQuantity,
      adjustReason || (adjustType === 'in' ? 'Manual Stock In' : adjustType === 'out' ? 'Damaged / Write-off' : 'Audit Reconciliation'),
      adjustType
    );

    setAdjustModalOpen(false);
    setAdjustQuantity(1);
    setAdjustReason('');
    showToast('Stock level adjusted successfully', 'success');
  };

  const filteredTxs = inventoryTransactions.filter((tx) => {
    const q = searchFilter.toLowerCase().trim();
    if (!q) return true;
    return tx.productName.toLowerCase().includes(q) || tx.reason.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      {/* Header & Valuation Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Boxes className="w-5 h-5 text-blue-600" />
            <span>{t('inventory')}</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {language === 'ar' ? 'تقييم بضاعة المحل، التوريد، الصرف، وسجل الحركات' : 'Stock levels, inventory valuation, stock-in/out, and movement logs'}
          </p>
        </div>

        <button
          onClick={() => setAdjustModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs md:text-sm font-bold shadow-lg shadow-blue-500/25 transition-all"
        >
          <RotateCcw className="w-4 h-4" />
          <span>{t('stock_adjustment')}</span>
        </button>
      </div>

      {/* Valuation Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 block mb-1">{t('total_retail_value')}</span>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white font-mono">
            {formatCurrency(totalRetail, settings.currencySymbol, language)}
          </h3>
          <p className="text-[11px] text-slate-400 mt-1">{products.length} catalog items in system</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 block mb-1">{t('total_cost_value')}</span>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white font-mono">
            {formatCurrency(totalCost, settings.currencySymbol, language)}
          </h3>
          <p className="text-[11px] text-slate-400 mt-1">Wholesale procurement cost</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 block mb-1">{t('potential_profit')}</span>
          <h3 className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
            +{formatCurrency(unrealizedProfit, settings.currencySymbol, language)}
          </h3>
          <p className="text-[11px] text-emerald-600 font-bold mt-1">Estimated {marginPercent}% Margin</p>
        </div>
      </div>

      {/* Low Stock Alerts */}
      {lowStockProducts.length > 0 && (
        <div className="bg-rose-50 dark:bg-rose-950/40 p-4 rounded-3xl border border-rose-200 dark:border-rose-900/50 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-rose-500 text-white rounded-2xl shadow">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-extrabold text-rose-900 dark:text-rose-200">
                {lowStockProducts.length} {language === 'ar' ? 'منتجات أوشكت على النفاد' : 'Products are critically low'}
              </h4>
              <p className="text-xs text-rose-700 dark:text-rose-400 mt-0.5">
                {language === 'ar' ? 'يرجى مراجعة الموردين لإعادة التوريد قبل نفاذ المخزون.' : 'Items below threshold should be reordered promptly.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Audit Log Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <History className="w-4 h-4 text-blue-600" />
              <span>{language === 'ar' ? 'سجل حركات المخزون والمستودع' : 'Stock Movement Audit Log'}</span>
            </h3>
          </div>

          <div className="relative w-64">
            <Search className="absolute start-3 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Search log..."
              className="w-full ps-8 pe-3 py-1.5 text-xs bg-slate-100 dark:bg-slate-800 rounded-xl outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-start text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold pb-2">
                <th className="text-start pb-2">Date / Time</th>
                <th className="text-start pb-2">Product</th>
                <th className="text-center pb-2">Type</th>
                <th className="text-center pb-2">Quantity</th>
                <th className="text-center pb-2">Stock Balance</th>
                <th className="text-start pb-2">Reason / Note</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredTxs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-slate-400">
                    No movement records yet. Stock changes appear here automatically.
                  </td>
                </tr>
              ) : (
                filteredTxs.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-3 text-slate-400 font-mono">{formatDate(tx.date)}</td>
                    <td className="py-3 font-bold text-slate-900 dark:text-white">{tx.productName}</td>
                    <td className="py-3 text-center">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                        tx.type === 'in' || tx.type === 'purchase'
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
                          : tx.type === 'out' || tx.type === 'sale'
                          ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400'
                          : 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400'
                      }`}>
                        {tx.type}
                      </span>
                    </td>
                    <td className="py-3 text-center font-bold font-mono">
                      {tx.type === 'in' ? '+' : '-'}{tx.quantity}
                    </td>
                    <td className="py-3 text-center font-mono text-slate-500">
                      {tx.previousStock} &rarr; <span className="font-bold text-slate-900 dark:text-white">{tx.newStock}</span>
                    </td>
                    <td className="py-3 text-slate-600 dark:text-slate-300 italic">{tx.reason}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stock Adjustment Modal */}
      <Modal
        isOpen={adjustModalOpen}
        onClose={() => setAdjustModalOpen(false)}
        title={t('stock_adjustment')}
        maxWidth="md"
      >
        <form onSubmit={handleAdjustSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Select Product</label>
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl outline-none font-bold"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} (Current: {p.quantity})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Movement Type</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setAdjustType('in')}
                className={`py-2 rounded-xl font-bold flex items-center justify-center gap-1 ${
                  adjustType === 'in' ? 'bg-emerald-600 text-white shadow' : 'bg-slate-100 dark:bg-slate-800'
                }`}
              >
                <Plus className="w-3.5 h-3.5" /> Stock In
              </button>
              <button
                type="button"
                onClick={() => setAdjustType('out')}
                className={`py-2 rounded-xl font-bold flex items-center justify-center gap-1 ${
                  adjustType === 'out' ? 'bg-rose-600 text-white shadow' : 'bg-slate-100 dark:bg-slate-800'
                }`}
              >
                <Minus className="w-3.5 h-3.5" /> Stock Out
              </button>
              <button
                type="button"
                onClick={() => setAdjustType('adjustment')}
                className={`py-2 rounded-xl font-bold flex items-center justify-center gap-1 ${
                  adjustType === 'adjustment' ? 'bg-blue-600 text-white shadow' : 'bg-slate-100 dark:bg-slate-800'
                }`}
              >
                <RotateCcw className="w-3.5 h-3.5" /> Exact Set
              </button>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Quantity</label>
            <input
              type="number"
              min="1"
              required
              value={adjustQuantity || ''}
              onChange={(e) => setAdjustQuantity(parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl outline-none font-mono font-bold"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Reason / Reference</label>
            <input
              type="text"
              placeholder="e.g. Audit variance, supplier bonus, cracked glass in drawer..."
              value={adjustReason}
              onChange={(e) => setAdjustReason(e.target.value)}
              className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setAdjustModalOpen(false)}
              className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl font-bold"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 text-white rounded-xl font-bold shadow"
            >
              Save Adjustment
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
