import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import { Settings, Save, Download, Upload, RotateCcw, Building, Globe } from 'lucide-react';
import { ConfirmDialog } from '../components/common/ConfirmDialog';

export const SettingsPage: React.FC = () => {
  const { settings, updateSettings, exportBackupJson, importBackupJson, resetToDemoData } = useApp();
  const { t, language } = useLanguage();
  const { showToast } = useToast();

  const [form, setForm] = useState(settings);
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(form);
    showToast('Store settings saved', 'success');
  };

  const handleExportBackup = () => {
    const jsonStr = exportBackupJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `techfix-pos-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    showToast('Backup JSON exported', 'success');
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content && importBackupJson(content)) {
        showToast('Backup restored successfully!', 'success');
        window.location.reload();
      } else {
        showToast('Invalid backup file', 'error');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Settings className="w-5 h-5 text-blue-600" />
          <span>{t('settings')}</span>
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          {language === 'ar' ? 'بيانات المتجر، العملة الافتراضية، الضريبة، والنسخ الاحتياطي' : 'Store configuration, currency, tax rates, and database backup/restore'}
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Store Profile Card */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Building className="w-4 h-4 text-blue-600" />
            <span>Store Profile & Contact</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Shop Name (English)</label>
              <input
                type="text"
                value={form.shopName}
                onChange={(e) => setForm({ ...form, shopName: e.target.value })}
                className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl outline-none"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">اسم المحل (العربية)</label>
              <input
                type="text"
                value={form.shopNameAr}
                onChange={(e) => setForm({ ...form, shopNameAr: e.target.value })}
                className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl outline-none text-end"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Phone Number</label>
              <input
                type="text"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl outline-none font-mono"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">WhatsApp Number</label>
              <input
                type="text"
                value={form.whatsapp}
                onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl outline-none font-mono"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Tax / Registration ID</label>
              <input
                type="text"
                value={form.taxNumber}
                onChange={(e) => setForm({ ...form, taxNumber: e.target.value })}
                className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl outline-none font-mono"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl outline-none"
              />
            </div>
          </div>
        </div>

        {/* Currency & Financials */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Globe className="w-4 h-4 text-blue-600" />
            <span>Currency & Taxes</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Currency Code</label>
              <select
                value={form.currency}
                onChange={(e) => {
                  const c = e.target.value;
                  const sym = c === 'ILS' ? '₪' : c === 'USD' ? '$' : c === 'EUR' ? '€' : 'JOD';
                  setForm({ ...form, currency: c, currencySymbol: sym });
                }}
                className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl outline-none font-bold"
              >
                <option value="ILS">ILS (₪ - Shekel) [Default]</option>
                <option value="USD">USD ($ - US Dollar)</option>
                <option value="EUR">EUR (€ - Euro)</option>
                <option value="JOD">JOD (Jordanian Dinar)</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Currency Symbol</label>
              <input
                type="text"
                value={form.currencySymbol}
                onChange={(e) => setForm({ ...form, currencySymbol: e.target.value })}
                className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl outline-none font-bold text-center"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">VAT / Tax Rate (%)</label>
              <input
                type="number"
                min="0"
                value={form.taxRate}
                onChange={(e) => setForm({ ...form, taxRate: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl outline-none font-mono"
              />
            </div>
          </div>
        </div>

        {/* Save Settings Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs md:text-sm font-bold shadow-lg shadow-blue-500/25 transition-all"
          >
            <Save className="w-4 h-4" />
            <span>{t('save')}</span>
          </button>
        </div>
      </form>

      {/* Database Backup, Restore, and Demo Data Reset */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          Data Portability & Database Backups
        </h3>
        <p className="text-xs text-slate-500">
          Export your entire store database (products, repairs, sales, inventory, customers) to a portable JSON backup file, or restore anytime.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={handleExportBackup}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-xl text-xs font-bold transition-colors"
          >
            <Download className="w-4 h-4 text-blue-600" />
            <span>Export Backup (JSON)</span>
          </button>

          <label className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-xl text-xs font-bold transition-colors cursor-pointer">
            <Upload className="w-4 h-4 text-emerald-600" />
            <span>Restore Backup</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImportBackup}
              className="hidden"
            />
          </label>

          <button
            onClick={() => setResetConfirmOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-rose-50 dark:bg-rose-950 text-rose-600 rounded-xl text-xs font-bold hover:bg-rose-100 transition-colors ms-auto"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset to Demo Data</span>
          </button>
        </div>
      </div>

      <ConfirmDialog
        isOpen={resetConfirmOpen}
        onClose={() => setResetConfirmOpen(false)}
        onConfirm={() => {
          resetToDemoData();
          showToast('Store reset to initial demo data', 'info');
          window.location.reload();
        }}
        title="Reset All Store Data?"
        message="This will reset all products, sales, repairs, and customer records back to the fresh demo state. Are you sure?"
      />
    </div>
  );
};
