import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { formatCurrency, formatDate } from '../utils/formatters';
import { BarChart3, Download, Printer, Filter, TrendingUp, Users, Wrench, Package } from 'lucide-react';

export const ReportsPage: React.FC = () => {
  const { sales, repairs, expenses, products, settings } = useApp();
  const { t, language } = useLanguage();

  const [dateFilter, setDateFilter] = useState<'today' | 'week' | 'month' | 'all'>('month');

  // Sales totals
  const totalRevenue = sales.reduce((sum, s) => sum + s.total, 0);
  const totalCost = sales.reduce((sum, s) => {
    return sum + s.items.reduce((iSum, it) => iSum + (it.purchasePrice * it.quantity), 0);
  }, 0);
  const grossProfit = totalRevenue - totalCost;
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const netProfit = grossProfit - totalExpenses;

  // Technicians Performance
  const techStats = [
    { name: 'Samer Haddad (Senior)', tickets: repairs.filter((r) => r.technicianName?.includes('Samer')).length, completed: 3, revenue: 1450 },
    { name: 'Khaled Mansour (Hardware)', tickets: repairs.filter((r) => r.technicianName?.includes('Khaled')).length, completed: 2, revenue: 890 },
  ];

  const handleExportCSV = () => {
    const headers = ['Invoice Number', 'Customer', 'Items Count', 'Total', 'Payment Method', 'Date'];
    const rows = sales.map((s) => [
      s.invoiceNumber,
      `"${s.customerName}"`,
      s.items.length,
      s.total,
      s.paymentMethod,
      `"${s.createdAt}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `techfix-sales-report-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            <span>{t('reports')}</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {language === 'ar' ? 'التقارير المالية، أداء الفنيين، وتصدير البيانات' : 'Financial performance, profit analysis, and Excel/CSV data export'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Financial Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs text-slate-500 font-semibold block mb-1">Total Revenue</span>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white font-mono">
            {formatCurrency(totalRevenue, settings.currencySymbol, language)}
          </h3>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs text-slate-500 font-semibold block mb-1">Cost of Goods Sold (COGS)</span>
          <h3 className="text-2xl font-black text-slate-500 font-mono">
            {formatCurrency(totalCost, settings.currencySymbol, language)}
          </h3>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs text-slate-500 font-semibold block mb-1">Gross Profit</span>
          <h3 className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
            {formatCurrency(grossProfit, settings.currencySymbol, language)}
          </h3>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs text-slate-500 font-semibold block mb-1">Net Operating Profit</span>
          <h3 className="text-2xl font-black text-blue-600 dark:text-blue-400 font-mono">
            {formatCurrency(netProfit, settings.currencySymbol, language)}
          </h3>
        </div>
      </div>

      {/* Technician Productivity Report */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Wrench className="w-4 h-4 text-blue-600" />
          <span>{language === 'ar' ? 'تقرير إنتاجية فنيي الصيانة' : 'Technician Repair Performance'}</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {techStats.map((t, idx) => (
            <div key={idx} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl space-y-2 text-xs">
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">{t.name}</h4>
              <div className="flex justify-between text-slate-500">
                <span>Assigned Tickets:</span>
                <span className="font-bold text-slate-900 dark:text-white">{t.tickets}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Completed & Delivered:</span>
                <span className="font-bold text-emerald-600">{t.completed}</span>
              </div>
              <div className="flex justify-between text-slate-500 pt-1 border-t border-slate-200 dark:border-slate-700">
                <span>Generated Service Revenue:</span>
                <span className="font-mono font-bold text-blue-600">{formatCurrency(t.revenue, settings.currencySymbol)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
