import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { formatCurrency, formatDate } from '../utils/formatters';
import { TabType } from '../components/layout/Sidebar';
import { 
  TrendingUp, 
  DollarSign, 
  ShoppingCart, 
  Wrench, 
  CheckCircle2, 
  AlertTriangle, 
  Users, 
  Boxes, 
  Receipt, 
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  ExternalLink,
  ChevronRight,
  Plus
} from 'lucide-react';
import { StatusBadge } from '../components/common/Badge';

export const DashboardPage: React.FC<{ setCurrentTab: (tab: TabType) => void }> = ({ setCurrentTab }) => {
  const { products, sales, repairs, customers, expenses, settings } = useApp();
  const { t, language } = useLanguage();
  const [timeRange, setTimeRange] = useState<'7d' | '30d'>('7d');

  // Calculate Metrics
  const todayStr = new Date().toISOString().split('T')[0];
  const todaySales = sales.filter((s) => s.createdAt.startsWith(todayStr) && s.status === 'completed');
  const todayRevenue = todaySales.reduce((sum, s) => sum + s.total, 0);
  
  // Calculate Profit: Revenue - Cost
  const todayCost = todaySales.reduce((sum, s) => {
    return sum + s.items.reduce((iSum, item) => iSum + (item.purchasePrice * item.quantity), 0);
  }, 0);
  const todayProfit = Math.max(0, todayRevenue - todayCost);

  const pendingRepairs = repairs.filter((r) => r.status !== 'delivered' && r.status !== 'cancelled');
  const completedRepairs = repairs.filter((r) => r.status === 'delivered');
  const lowStockProducts = products.filter((p) => p.quantity <= p.minStock);

  const totalInventoryRetail = products.reduce((sum, p) => sum + p.sellingPrice * p.quantity, 0);
  const totalInventoryCost = products.reduce((sum, p) => sum + p.purchasePrice * p.quantity, 0);

  const todayExpenses = expenses
    .filter((e) => e.date === todayStr)
    .reduce((sum, e) => sum + e.amount, 0);

  const totalCustomerDebt = customers.reduce((sum, c) => sum + c.outstandingBalance, 0);

  // Sales trend dummy values for charts
  const salesHistory = timeRange === '7d' 
    ? [
        { label: 'Mon', sales: 1200, profit: 450 },
        { label: 'Tue', sales: 1850, profit: 720 },
        { label: 'Wed', sales: 1400, profit: 530 },
        { label: 'Thu', sales: 2200, profit: 890 },
        { label: 'Fri', sales: 950, profit: 340 },
        { label: 'Sat', sales: 2600, profit: 1100 },
        { label: 'Today', sales: Math.max(todayRevenue, 1950), profit: Math.max(todayProfit, 780) }
      ]
    : [
        { label: 'Week 1', sales: 11200, profit: 4200 },
        { label: 'Week 2', sales: 13500, profit: 5100 },
        { label: 'Week 3', sales: 14800, profit: 5800 },
        { label: 'Week 4', sales: 16200, profit: 6400 }
      ];

  const maxSales = Math.max(...salesHistory.map((h) => h.sales));

  // Category Breakdown Data
  const categoriesSales = [
    { name: language === 'ar' ? 'شواحن وكوابل' : 'Chargers & Cables', value: 38, color: 'bg-blue-500' },
    { name: language === 'ar' ? 'صوتيات وسماعات' : 'Audio & Earphones', value: 24, color: 'bg-indigo-500' },
    { name: language === 'ar' ? 'أقراص ورامات' : 'Storage & RAM', value: 20, color: 'bg-emerald-500' },
    { name: language === 'ar' ? 'صيانة وقطع غيار' : 'Repairs & Parts', value: 12, color: 'bg-amber-500' },
    { name: language === 'ar' ? 'أجهزة مستعملة' : 'Used Devices', value: 6, color: 'bg-rose-500' },
  ];

  return (
    <div className="space-y-6">
      {/* Quick Top Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 p-5 rounded-3xl text-white shadow-xl shadow-blue-500/10">
        <div>
          <h2 className="text-xl md:text-2xl font-black tracking-tight">
            {language === 'ar' ? 'أهلاً بك في نظام تك فيكس' : 'Welcome back to TechFix'}
          </h2>
          <p className="text-xs md:text-sm text-blue-100 mt-1">
            {language === 'ar' 
              ? 'متابعة شاملة للمبيعات، ورشة الصيانة، والمخزون في الوقت الفعلي' 
              : 'Real-time overview of sales, repair workshop, and store inventory'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setCurrentTab('pos')}
            className="flex items-center gap-2 px-4 py-2.5 bg-white text-blue-700 hover:bg-blue-50 rounded-2xl text-xs md:text-sm font-bold shadow-md transition-all transform hover:-translate-y-0.5"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>{language === 'ar' ? 'فتح نقطة البيع' : 'New Sale (POS)'}</span>
          </button>

          <button
            onClick={() => setCurrentTab('repairs')}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-500/40 hover:bg-blue-500/60 text-white border border-white/20 rounded-2xl text-xs md:text-sm font-bold backdrop-blur-sm transition-all"
          >
            <Wrench className="w-4 h-4" />
            <span>{t('new_repair')}</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
        {/* Today's Sales */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-blue-500/50 transition-colors">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold">{language === 'ar' ? 'مبيعات اليوم' : "Today's Sales"}</span>
            <div className="p-2 bg-blue-50 dark:bg-blue-950 text-blue-600 rounded-xl">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-white">
            {formatCurrency(todayRevenue, settings.currencySymbol, language)}
          </h3>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 flex items-center font-medium">
            <ArrowUpRight className="w-3.5 h-3.5 me-0.5" />
            {todaySales.length} {language === 'ar' ? 'عمليات بيع' : 'transactions'}
          </p>
        </div>

        {/* Today's Profit */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-emerald-500/50 transition-colors">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold">{language === 'ar' ? 'أرباح اليوم' : "Today's Profit"}</span>
            <div className="p-2 bg-emerald-50 dark:bg-emerald-950 text-emerald-600 rounded-xl">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-xl md:text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
            {formatCurrency(todayProfit, settings.currencySymbol, language)}
          </h3>
          <p className="text-[11px] text-slate-500 mt-1">
            {language === 'ar' ? 'صافي هامش الربح' : 'Gross profit margin'}
          </p>
        </div>

        {/* Pending Repairs */}
        <div 
          onClick={() => setCurrentTab('repairs')}
          className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-amber-500/50 transition-colors cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold">{language === 'ar' ? 'أجهزة قيد الصيانة' : 'Pending Repairs'}</span>
            <div className="p-2 bg-amber-50 dark:bg-amber-950 text-amber-600 rounded-xl group-hover:scale-110 transition-transform">
              <Wrench className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-xl md:text-2xl font-extrabold text-amber-600 dark:text-amber-400">
            {pendingRepairs.length}
          </h3>
          <p className="text-[11px] text-slate-500 mt-1">
            {repairs.filter((r) => r.status === 'ready_for_pickup').length} {language === 'ar' ? 'جاهز للتسليم' : 'ready for pickup'}
          </p>
        </div>

        {/* Low Stock Alerts */}
        <div 
          onClick={() => setCurrentTab('inventory')}
          className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-rose-500/50 transition-colors cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold">{t('low_stock')}</span>
            <div className="p-2 bg-rose-50 dark:bg-rose-950 text-rose-600 rounded-xl group-hover:scale-110 transition-transform">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-xl md:text-2xl font-extrabold text-rose-600 dark:text-rose-400">
            {lowStockProducts.length}
          </h3>
          <p className="text-[11px] text-slate-500 mt-1">
            {language === 'ar' ? 'منتجات تحتاج إعادة توريد' : 'items below minimum'}
          </p>
        </div>

        {/* Customer Debts */}
        <div 
          onClick={() => setCurrentTab('customers')}
          className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-purple-500/50 transition-colors cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold">{language === 'ar' ? 'ديون العملاء' : 'Customer Debts'}</span>
            <div className="p-2 bg-purple-50 dark:bg-purple-950 text-purple-600 rounded-xl group-hover:scale-110 transition-transform">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-xl md:text-2xl font-extrabold text-purple-600 dark:text-purple-400">
            {formatCurrency(totalCustomerDebt, settings.currencySymbol, language)}
          </h3>
          <p className="text-[11px] text-slate-500 mt-1">
            {customers.filter((c) => c.outstandingBalance > 0).length} {language === 'ar' ? 'عملاء عليهم مستحقات' : 'owing customers'}
          </p>
        </div>
      </div>

      {/* Secondary Metrics Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-slate-100/70 dark:bg-slate-800/50 p-3 rounded-2xl flex items-center justify-between">
          <span className="text-xs text-slate-600 dark:text-slate-400">{language === 'ar' ? 'قيمة بضاعة المحل (بيع)' : 'Total Retail Value'}</span>
          <span className="font-extrabold text-sm text-slate-900 dark:text-white">
            {formatCurrency(totalInventoryRetail, settings.currencySymbol, language)}
          </span>
        </div>
        <div className="bg-slate-100/70 dark:bg-slate-800/50 p-3 rounded-2xl flex items-center justify-between">
          <span className="text-xs text-slate-600 dark:text-slate-400">{language === 'ar' ? 'تكلفة المخزون' : 'Inventory Cost'}</span>
          <span className="font-extrabold text-sm text-slate-900 dark:text-white">
            {formatCurrency(totalInventoryCost, settings.currencySymbol, language)}
          </span>
        </div>
        <div className="bg-slate-100/70 dark:bg-slate-800/50 p-3 rounded-2xl flex items-center justify-between">
          <span className="text-xs text-slate-600 dark:text-slate-400">{language === 'ar' ? 'مصروفات اليوم' : "Today's Expenses"}</span>
          <span className="font-extrabold text-sm text-rose-600 dark:text-rose-400">
            {formatCurrency(todayExpenses, settings.currencySymbol, language)}
          </span>
        </div>
        <div className="bg-slate-100/70 dark:bg-slate-800/50 p-3 rounded-2xl flex items-center justify-between">
          <span className="text-xs text-slate-600 dark:text-slate-400">{language === 'ar' ? 'أجهزة تم تسليمها' : 'Delivered Repairs'}</span>
          <span className="font-extrabold text-sm text-teal-600 dark:text-teal-400">
            {completedRepairs.length}
          </span>
        </div>
      </div>

      {/* Charts & Graphs Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales & Profit Chart (2 Cols) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {language === 'ar' ? 'المبيعات والأرباح' : 'Sales & Profit Overview'}
              </h3>
              <p className="text-xs text-slate-500">
                {language === 'ar' ? 'مقارنة حجم المبيعات مقابل هامش الربح' : 'Comparing gross revenue against profit'}
              </p>
            </div>

            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold">
              <button
                onClick={() => setTimeRange('7d')}
                className={`px-3 py-1 rounded-lg transition-colors ${
                  timeRange === '7d' ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-sm' : 'text-slate-500'
                }`}
              >
                {language === 'ar' ? 'آخر 7 أيام' : 'Last 7 Days'}
              </button>
              <button
                onClick={() => setTimeRange('30d')}
                className={`px-3 py-1 rounded-lg transition-colors ${
                  timeRange === '30d' ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-sm' : 'text-slate-500'
                }`}
              >
                {language === 'ar' ? 'آخر 30 يوم' : 'Last 30 Days'}
              </button>
            </div>
          </div>

          {/* Bar Chart Visualization */}
          <div className="h-64 flex items-end justify-between gap-3 pt-4 px-2">
            {salesHistory.map((item, idx) => {
              const salesHeight = (item.sales / maxSales) * 100;
              const profitHeight = (item.profit / maxSales) * 100;

              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                  <div className="w-full flex items-end justify-center gap-1.5 h-48">
                    {/* Sales Bar */}
                    <div 
                      style={{ height: `${salesHeight}%` }}
                      className="w-full max-w-[20px] bg-gradient-to-t from-blue-600 to-indigo-500 rounded-t-lg transition-all group-hover:brightness-110 relative"
                    >
                      <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 transform -translate-x-1/2 bg-slate-900 text-white text-[10px] py-0.5 px-1.5 rounded whitespace-nowrap pointer-events-none transition-opacity z-10 font-mono">
                        {formatCurrency(item.sales, settings.currencySymbol)}
                      </div>
                    </div>

                    {/* Profit Bar */}
                    <div 
                      style={{ height: `${profitHeight}%` }}
                      className="w-full max-w-[14px] bg-gradient-to-t from-emerald-500 to-teal-400 rounded-t-lg transition-all group-hover:brightness-110 relative"
                    >
                      <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 transform -translate-x-1/2 bg-emerald-900 text-white text-[10px] py-0.5 px-1.5 rounded whitespace-nowrap pointer-events-none transition-opacity z-10 font-mono">
                        +{formatCurrency(item.profit, settings.currencySymbol)}
                      </div>
                    </div>
                  </div>

                  <span className="text-[11px] font-medium text-slate-500 truncate max-w-[45px]">
                    {item.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-blue-600" />
              <span>{language === 'ar' ? 'المبيعات' : 'Sales Revenue'}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500" />
              <span>{language === 'ar' ? 'الأرباح' : 'Gross Profit'}</span>
            </div>
          </div>
        </div>

        {/* Sales by Category & Top Products */}
        <div className="space-y-6">
          {/* Category Distribution */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">
              {language === 'ar' ? 'المبيعات حسب الفئة' : 'Sales by Category'}
            </h3>

            <div className="space-y-3">
              {categoriesSales.map((cat, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-700 dark:text-slate-300">{cat.name}</span>
                    <span className="text-slate-500 font-mono">{cat.value}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className={`h-full ${cat.color} rounded-full`} style={{ width: `${cat.value}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Active Repair Pipeline Mini */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {language === 'ar' ? 'حالة أجهزة الصيانة' : 'Repair Workshop'}
              </h3>
              <button 
                onClick={() => setCurrentTab('repairs')}
                className="text-xs text-blue-600 dark:text-blue-400 font-bold hover:underline"
              >
                {language === 'ar' ? 'عرض الكل' : 'View All'}
              </button>
            </div>

            <div className="space-y-2.5">
              {repairs.slice(0, 3).map((r) => (
                <div 
                  key={r.id}
                  onClick={() => setCurrentTab('repairs')}
                  className="p-3 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl cursor-pointer transition-colors flex items-center justify-between"
                >
                  <div className="truncate me-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-blue-600">{r.ticketNumber}</span>
                      <span className="text-xs font-bold text-slate-900 dark:text-white truncate">{r.brand} {r.model}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">{r.customerName}</p>
                  </div>
                  <StatusBadge status={r.status} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Low Stock Warning Table & Recent Sales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Low Stock Watch */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-500" />
                <span>{language === 'ar' ? 'تنبيهات انخفاض المخزون' : 'Low Stock Watch'}</span>
              </h3>
              <p className="text-xs text-slate-500">{lowStockProducts.length} {language === 'ar' ? 'منتجات أوشكت على النفاد' : 'products need restocking'}</p>
            </div>

            <button
              onClick={() => setCurrentTab('purchases')}
              className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
            >
              <span>{language === 'ar' ? 'طلب توريد' : 'Create PO'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-start text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 pb-2">
                  <th className="text-start pb-2 font-semibold">Product</th>
                  <th className="text-center pb-2 font-semibold">In Stock</th>
                  <th className="text-center pb-2 font-semibold">Min</th>
                  <th className="text-end pb-2 font-semibold">Selling Price</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {lowStockProducts.slice(0, 5).map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                    <td className="py-2.5 pe-2">
                      <div className="font-semibold text-slate-900 dark:text-white truncate max-w-[200px]">
                        {language === 'ar' ? p.nameAr : p.name}
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">{p.sku}</span>
                    </td>
                    <td className="py-2.5 text-center font-bold text-rose-600 dark:text-rose-400">
                      {p.quantity}
                    </td>
                    <td className="py-2.5 text-center text-slate-400 font-mono">
                      {p.minStock}
                    </td>
                    <td className="py-2.5 text-end font-bold text-slate-900 dark:text-white">
                      {formatCurrency(p.sellingPrice, settings.currencySymbol, language)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Completed Sales */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {language === 'ar' ? 'آخر المبيعات المكتملة' : 'Recent Completed Sales'}
              </h3>
              <p className="text-xs text-slate-500">{language === 'ar' ? 'فواتير تم إصدارها اليوم' : 'Invoices processed today'}</p>
            </div>

            <button
              onClick={() => setCurrentTab('pos')}
              className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
            >
              <span>{language === 'ar' ? 'نقطة البيع' : 'View POS'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-2.5">
            {sales.slice(0, 4).map((s) => (
              <div 
                key={s.id}
                className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-2xl flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">{s.invoiceNumber}</span>
                    <span className="text-[11px] px-2 py-0.5 rounded-full font-bold uppercase bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400 text-[10px]">
                      {s.paymentMethod}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">{s.customerName} &bull; {s.items.length} items</p>
                </div>

                <div className="text-end">
                  <span className="font-extrabold text-sm text-blue-600 dark:text-blue-400">
                    {formatCurrency(s.total, settings.currencySymbol, language)}
                  </span>
                  <p className="text-[10px] text-slate-400">{s.createdAt.split(' ')[1] || 'Today'}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
