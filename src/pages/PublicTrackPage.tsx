import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { formatCurrency, formatDate } from '../utils/formatters';
import { RepairTicket, RepairStatus } from '../types';
import { StatusBadge } from '../components/common/Badge';
import { 
  Search, 
  Wrench, 
  CheckCircle2, 
  Clock, 
  Phone, 
  MessageSquare, 
  ShieldCheck,
  Cpu,
  ChevronRight,
  HelpCircle
} from 'lucide-react';

export const PublicTrackPage: React.FC = () => {
  const { repairs, settings } = useApp();
  const { t, language } = useLanguage();

  const [ticketQuery, setTicketQuery] = useState('');
  const [searched, setSearched] = useState(false);
  const [foundTicket, setFoundTicket] = useState<RepairTicket | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketQuery.trim()) return;

    const clean = ticketQuery.trim().toLowerCase();
    const match = repairs.find(
      (r) => r.ticketNumber.toLowerCase() === clean || r.customerPhone.includes(clean)
    );

    setFoundTicket(match || null);
    setSearched(true);
  };

  const statusSteps: { id: RepairStatus; label: string; labelAr: string }[] = [
    { id: 'received', label: 'Received', labelAr: 'تم الاستلام' },
    { id: 'diagnosing', label: 'Diagnosing', labelAr: 'الفحص والتشخيص' },
    { id: 'in_repair', label: 'In Repair', labelAr: 'قيد الصيانة' },
    { id: 'ready_for_pickup', label: 'Ready for Pickup', labelAr: 'جاهز للاستلام' },
    { id: 'delivered', label: 'Delivered', labelAr: 'تم التسليم' }
  ];

  const getStepIndex = (st: RepairStatus): number => {
    switch (st) {
      case 'received': return 0;
      case 'diagnosing': return 1;
      case 'waiting_approval': return 1;
      case 'waiting_parts': return 2;
      case 'in_repair': return 2;
      case 'ready_for_pickup': return 3;
      case 'delivered': return 4;
      case 'cancelled': return -1;
      default: return 0;
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-6 px-4 space-y-8">
      {/* Brand Header */}
      <div className="text-center space-y-2">
        <div className="w-14 h-14 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl text-white flex items-center justify-center mx-auto shadow-xl shadow-blue-500/20">
          <Cpu className="w-8 h-8" />
        </div>
        <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white">
          {language === 'ar' ? 'بوابة تتبع الصيانة المباشرة' : 'Customer Repair Tracking Portal'}
        </h1>
        <p className="text-xs md:text-sm text-slate-500 max-w-md mx-auto">
          {language === 'ar' 
            ? 'أدخل رقم التذكرة أو رقم هاتفك لمتابعة حالة جهازك في مركز الصيانة فورياً' 
            : 'Enter your repair ticket number or phone number to check live status.'}
        </p>
      </div>

      {/* Search Box */}
      <form onSubmit={handleSearch} className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-lg flex items-center gap-2">
        <Search className="w-5 h-5 text-slate-400 ms-2 flex-shrink-0" />
        <input
          type="text"
          value={ticketQuery}
          onChange={(e) => setTicketQuery(e.target.value)}
          placeholder={language === 'ar' ? 'مثال: REP-2026-001 أو 0599123456' : 'e.g. REP-2026-001 or 0599123456'}
          className="flex-1 bg-transparent border-none outline-none text-sm md:text-base font-medium text-slate-900 dark:text-white placeholder-slate-400"
        />
        <button
          type="submit"
          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs md:text-sm rounded-2xl shadow-md transition-all flex-shrink-0"
        >
          {language === 'ar' ? 'تتبع الجهاز' : 'Track Device'}
        </button>
      </form>

      {/* Search Results */}
      {searched && (
        <div>
          {foundTicket ? (
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 md:p-8 shadow-xl space-y-6">
              {/* Ticket Hero Banner */}
              <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <span className="font-mono text-xs font-bold text-blue-600 uppercase tracking-widest block mb-1">
                    {foundTicket.ticketNumber}
                  </span>
                  <h3 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white">
                    {foundTicket.brand} {foundTicket.model}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Customer: {foundTicket.customerName}
                  </p>
                </div>

                <div className="text-end">
                  <StatusBadge status={foundTicket.status} />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Received: {formatDate(foundTicket.receivedDate)}
                  </p>
                </div>
              </div>

              {/* Ready for Pickup Celebration Banner if Ready */}
              {foundTicket.status === 'ready_for_pickup' && (
                <div className="p-4 bg-emerald-500/10 border-2 border-emerald-500 rounded-2xl flex items-center gap-3 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="w-6 h-6 flex-shrink-0" />
                  <div>
                    <h4 className="font-extrabold text-sm">
                      {language === 'ar' ? 'جهازك جاهز للاستلام!' : 'Your device is ready for pickup!'}
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                      {language === 'ar' 
                        ? 'يرجى إحضار سند الاستلام ومراجعة المركز خلال أوقات الدوام الرسمي.' 
                        : 'Please bring your claim ticket to the store during opening hours.'}
                    </p>
                  </div>
                </div>
              )}

              {/* Progress Stepper */}
              <div>
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
                  {language === 'ar' ? 'مراحل العمل على جهازك' : 'Live Repair Stages'}
                </h4>
                <div className="relative flex items-center justify-between">
                  {statusSteps.map((step, idx) => {
                    const currentIndex = getStepIndex(foundTicket.status);
                    const isDone = currentIndex >= idx;
                    const isCurrent = currentIndex === idx;

                    return (
                      <div key={step.id} className="flex-1 flex flex-col items-center text-center relative z-10">
                        <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                          isDone 
                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' 
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                        } ${isCurrent ? 'ring-4 ring-blue-400/40 animate-pulse' : ''}`}>
                          {isDone ? <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5" /> : idx + 1}
                        </div>
                        <span className={`text-[11px] md:text-xs font-semibold mt-2 ${
                          isDone ? 'text-slate-900 dark:text-white' : 'text-slate-400'
                        }`}>
                          {language === 'ar' ? step.labelAr : step.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Diagnosis and Problem Box */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-4 border-t border-slate-200 dark:border-slate-800">
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                  <span className="text-slate-400 font-bold block mb-1">Reported Issue:</span>
                  <p className="text-slate-800 dark:text-slate-200">{foundTicket.problemReported}</p>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                  <span className="text-slate-400 font-bold block mb-1">Technician Findings:</span>
                  <p className="text-slate-800 dark:text-slate-200">{foundTicket.diagnosis || 'Diagnosis in progress...'}</p>
                </div>
              </div>

              {/* Financial Balance Summary */}
              <div className="p-5 bg-blue-50 dark:bg-blue-950/40 rounded-2xl border border-blue-200 dark:border-blue-900/50 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <span className="text-xs text-slate-500 block">Total Repair Cost</span>
                  <span className="text-xl font-extrabold text-slate-900 dark:text-white font-mono">
                    {formatCurrency(foundTicket.finalCost || foundTicket.estimatedCost, settings.currencySymbol)}
                  </span>
                  <p className="text-[11px] text-slate-500">Deposit Paid: {formatCurrency(foundTicket.deposit, settings.currencySymbol)}</p>
                </div>

                <div className="text-end">
                  <span className="text-xs text-slate-500 block">Remaining Balance Due</span>
                  <span className="text-xl font-black text-rose-600 dark:text-rose-400 font-mono">
                    {formatCurrency(foundTicket.remainingBalance, settings.currencySymbol)}
                  </span>
                </div>
              </div>

              {/* Contact Support Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span>Warranty: {foundTicket.warrantyPeriod}</span>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={`https://wa.me/${settings.whatsapp.replace(/[^0-9]/g, '')}?text=Hello%20TechFix,%20inquiry%20regarding%20ticket%20${foundTicket.ticketNumber}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>WhatsApp Inquiry</span>
                  </a>
                  <a
                    href={`tel:${settings.phone}`}
                    className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call Center</span>
                  </a>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 text-center space-y-3">
              <HelpCircle className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                {language === 'ar' ? 'لم يتم العثور على تذكرة صيانة' : 'No Repair Ticket Found'}
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {language === 'ar'
                  ? 'يرجى التأكد من كتابة رقم التذكرة بدقة (مثل REP-2026-001) أو مراجعة المركز مباشرة.'
                  : 'Please check your ticket number and try again, or contact the shop support desk.'}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
