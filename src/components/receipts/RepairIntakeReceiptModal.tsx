import React from 'react';
import { Modal } from '../common/Modal';
import { RepairTicket } from '../../types';
import { useApp } from '../../context/AppContext';
import { useLanguage } from '../../context/LanguageContext';
import { formatCurrency, formatDate, generateBarcodeSvg } from '../../utils/formatters';
import { Printer, CheckCircle2, Wrench } from 'lucide-react';

interface RepairReceiptProps {
  isOpen: boolean;
  onClose: () => void;
  ticket: RepairTicket | null;
}

export const RepairIntakeReceiptModal: React.FC<RepairReceiptProps> = ({
  isOpen,
  onClose,
  ticket
}) => {
  const { settings } = useApp();
  const { t, language } = useLanguage();

  if (!ticket) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={language === 'ar' ? 'سند استلام جهاز للصيانة' : 'Repair Claim & Intake Ticket'} maxWidth="lg">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between bg-blue-50 dark:bg-blue-950/40 p-3 rounded-xl border border-blue-200 dark:border-blue-900/50">
          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
            <Wrench className="w-5 h-5" />
            <span className="text-sm font-bold">
              {ticket.ticketNumber} - {ticket.brand} {ticket.model}
            </span>
          </div>

          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>{t('print_receipt')}</span>
          </button>
        </div>

        {/* Printable Intake Claim Form */}
        <div 
          id="printable-receipt"
          className="bg-white text-slate-900 p-6 rounded-2xl border border-slate-200 shadow-inner font-sans text-xs max-w-md mx-auto w-full leading-relaxed"
        >
          {/* Header */}
          <div className="text-center pb-3 border-b-2 border-slate-900">
            <h2 className="text-base font-extrabold uppercase text-slate-900">
              {settings.shopName}
            </h2>
            <p className="text-[11px] text-slate-600 font-semibold">{settings.shopNameAr}</p>
            <p className="text-[10px] text-slate-500">{settings.address} | Tel: {settings.phone}</p>
            <div className="inline-block bg-slate-900 text-white text-[11px] font-bold px-3 py-0.5 rounded-full mt-2">
              REPAIR INTAKE RECEIPT / سند استلام صيانة
            </div>
          </div>

          {/* Ticket ID & Barcode */}
          <div className="py-3 text-center border-b border-slate-200">
            <div 
              className="w-48 mx-auto"
              dangerouslySetInnerHTML={{ __html: generateBarcodeSvg(ticket.ticketNumber, 35) }}
            />
            <p className="text-sm font-extrabold tracking-wider mt-1">{ticket.ticketNumber}</p>
            <p className="text-[10px] text-slate-500">Date Received: {formatDate(ticket.receivedDate, 'en')}</p>
          </div>

          {/* Customer & Device Grid */}
          <div className="py-3 border-b border-slate-200 grid grid-cols-2 gap-2 text-[11px]">
            <div>
              <span className="text-slate-500 block text-[10px]">Customer Name:</span>
              <span className="font-bold">{ticket.customerName}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">Phone Number:</span>
              <span className="font-bold">{ticket.customerPhone}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">Device:</span>
              <span className="font-semibold capitalize">{ticket.deviceType}: {ticket.brand} {ticket.model}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">Color / Condition:</span>
              <span>{ticket.color} ({ticket.condition})</span>
            </div>
            {ticket.imei1 && (
              <div className="col-span-2">
                <span className="text-slate-500 text-[10px]">IMEI / Serial:</span>{' '}
                <span className="font-mono font-bold">{ticket.imei1}</span>
              </div>
            )}
            <div className="col-span-2">
              <span className="text-slate-500 text-[10px]">Accessories Received:</span>{' '}
              <span>{ticket.accessoriesReceived || 'None'}</span>
            </div>
          </div>

          {/* Reported Problem */}
          <div className="py-2.5 border-b border-slate-200 text-[11px]">
            <span className="text-slate-500 block text-[10px] font-bold">Reported Problem:</span>
            <p className="text-slate-800 italic bg-slate-50 p-2 rounded border border-slate-100 mt-1">
              "{ticket.problemReported}"
            </p>
          </div>

          {/* Financials */}
          <div className="py-2.5 border-b border-slate-200 grid grid-cols-3 gap-2 text-center text-[11px]">
            <div className="bg-slate-50 p-2 rounded">
              <span className="text-slate-500 text-[10px] block">Est. Cost</span>
              <span className="font-bold">{formatCurrency(ticket.finalCost || ticket.estimatedCost, settings.currencySymbol)}</span>
            </div>
            <div className="bg-emerald-50 text-emerald-800 p-2 rounded">
              <span className="text-[10px] block">Deposit Paid</span>
              <span className="font-bold">{formatCurrency(ticket.deposit, settings.currencySymbol)}</span>
            </div>
            <div className="bg-rose-50 text-rose-800 p-2 rounded">
              <span className="text-[10px] block">Balance Due</span>
              <span className="font-bold">{formatCurrency(ticket.remainingBalance, settings.currencySymbol)}</span>
            </div>
          </div>

          {/* Terms & Signature */}
          <div className="pt-3 text-[9px] text-slate-500 leading-tight space-y-1">
            <p>1. Claim ticket must be presented upon receiving device.</p>
            <p>2. The shop is not responsible for devices left unclaimed after 60 days.</p>
            <p>3. Please backup your data prior to hardware repairs.</p>
            <p className="text-end font-arabic">1. يجب إبراز هذا السند عند الاستلام. 2. المركز غير مسؤول عن الأجهزة المتروكة بعد 60 يوماً.</p>

            <div className="pt-6 grid grid-cols-2 gap-4 text-center">
              <div className="border-t border-slate-300 pt-1">
                <span>Customer Signature (توقيع العميل)</span>
              </div>
              <div className="border-t border-slate-300 pt-1">
                <span>Technician Signature (توقيع الفني)</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-colors"
          >
            {t('close')}
          </button>
        </div>
      </div>
    </Modal>
  );
};
