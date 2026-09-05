import React from 'react';
import { Modal } from '../common/Modal';
import { Sale } from '../../types';
import { useApp } from '../../context/AppContext';
import { useLanguage } from '../../context/LanguageContext';
import { formatCurrency, formatDate, generateBarcodeSvg } from '../../utils/formatters';
import { Printer, CheckCircle2, Download, Share2 } from 'lucide-react';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  sale: Sale | null;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  isOpen,
  onClose,
  sale
}) => {
  const { settings } = useApp();
  const { t, language } = useLanguage();

  if (!sale) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('print_receipt')} maxWidth="lg">
      <div className="flex flex-col gap-6">
        {/* Action Toolbar */}
        <div className="flex items-center justify-between bg-blue-50 dark:bg-blue-950/40 p-3 rounded-xl border border-blue-200 dark:border-blue-900/50">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
            <span className="text-sm font-bold">
              {language === 'ar' ? 'تمت عملية البيع بنجاح!' : 'Sale Completed Successfully!'}
            </span>
          </div>

          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>{t('print_receipt')}</span>
          </button>
        </div>

        {/* Printable Thermal Receipt Card */}
        <div 
          id="printable-receipt"
          className="bg-white text-slate-900 p-6 rounded-2xl border border-slate-200 shadow-inner font-mono text-xs max-w-sm mx-auto w-full leading-relaxed"
        >
          {/* Header */}
          <div className="text-center pb-4 border-b border-dashed border-slate-300">
            <h2 className="text-base font-extrabold uppercase tracking-tight">
              {settings.shopName}
            </h2>
            <p className="text-[11px] text-slate-600 mt-0.5">
              {settings.shopNameAr}
            </p>
            <p className="text-[10px] text-slate-500 mt-1">{settings.address}</p>
            <p className="text-[10px] text-slate-500">Tel: {settings.phone} | WA: {settings.whatsapp}</p>
            <p className="text-[10px] text-slate-500 font-semibold">Tax / Reg: {settings.taxNumber}</p>
          </div>

          {/* Invoice Details */}
          <div className="py-3 border-b border-dashed border-slate-300 space-y-1 text-[11px]">
            <div className="flex justify-between">
              <span className="text-slate-500">Invoice #:</span>
              <span className="font-bold">{sale.invoiceNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Date/Time:</span>
              <span>{formatDate(sale.createdAt, 'en')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Cashier:</span>
              <span>{sale.cashierName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Customer:</span>
              <span className="font-semibold">{sale.customerName}</span>
            </div>
          </div>

          {/* Items List */}
          <div className="py-3 border-b border-dashed border-slate-300">
            <table className="w-full text-start text-[11px]">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 pb-1">
                  <th className="text-start pb-1">Item</th>
                  <th className="text-center pb-1">Qty</th>
                  <th className="text-end pb-1">Price</th>
                  <th className="text-end pb-1">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sale.items.map((item, idx) => (
                  <tr key={idx} className="py-1">
                    <td className="py-1 pe-1">
                      <div className="font-medium line-clamp-1">{item.productName}</div>
                      {item.imeiOrSerial && (
                        <div className="text-[9px] text-slate-500">SN/IMEI: {item.imeiOrSerial}</div>
                      )}
                    </td>
                    <td className="py-1 text-center font-bold">{item.quantity}</td>
                    <td className="py-1 text-end">{formatCurrency(item.unitPrice, settings.currencySymbol)}</td>
                    <td className="py-1 text-end font-bold">{formatCurrency(item.total, settings.currencySymbol)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Summary / Totals */}
          <div className="py-3 border-b border-dashed border-slate-300 space-y-1.5 text-[11px]">
            <div className="flex justify-between">
              <span className="text-slate-600">Subtotal:</span>
              <span>{formatCurrency(sale.subtotal, settings.currencySymbol)}</span>
            </div>
            {sale.discountAmount > 0 && (
              <div className="flex justify-between text-rose-600">
                <span>Discount:</span>
                <span>-{formatCurrency(sale.discountAmount, settings.currencySymbol)}</span>
              </div>
            )}
            {sale.taxAmount > 0 && (
              <div className="flex justify-between text-slate-600">
                <span>VAT ({sale.taxRate}%):</span>
                <span>{formatCurrency(sale.taxAmount, settings.currencySymbol)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm font-extrabold pt-1 border-t border-slate-200">
              <span>TOTAL:</span>
              <span className="text-blue-600">{formatCurrency(sale.total, settings.currencySymbol)}</span>
            </div>
          </div>

          {/* Payment breakdown */}
          <div className="py-3 border-b border-dashed border-slate-300 space-y-1 text-[11px]">
            <div className="flex justify-between">
              <span className="text-slate-500">Payment Method:</span>
              <span className="uppercase font-semibold">{sale.paymentMethod}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Paid Amount:</span>
              <span>{formatCurrency(sale.paidAmount, settings.currencySymbol)}</span>
            </div>
            <div className="flex justify-between font-bold">
              <span className="text-slate-500">Change Returned:</span>
              <span>{formatCurrency(sale.changeAmount, settings.currencySymbol)}</span>
            </div>
          </div>

          {/* Barcode & Footer */}
          <div className="pt-4 text-center space-y-2">
            <div 
              className="w-48 mx-auto text-slate-800"
              dangerouslySetInnerHTML={{ __html: generateBarcodeSvg(sale.invoiceNumber, 35) }}
            />
            <p className="text-[10px] text-slate-600 leading-tight">
              {settings.receiptFooterEn}
            </p>
            <p className="text-[10px] text-slate-600 leading-tight">
              {settings.receiptFooterAr}
            </p>
            <p className="text-[9px] text-slate-400 pt-1">
              *** THANK YOU FOR YOUR BUSINESS ***
            </p>
          </div>
        </div>

        {/* Modal Close */}
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
