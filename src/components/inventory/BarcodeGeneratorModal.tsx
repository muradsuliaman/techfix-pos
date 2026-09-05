import React from 'react';
import { Modal } from '../common/Modal';
import { Product } from '../../types';
import { useApp } from '../../context/AppContext';
import { useLanguage } from '../../context/LanguageContext';
import { formatCurrency, generateBarcodeSvg } from '../../utils/formatters';
import { Printer, Tag } from 'lucide-react';

interface BarcodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
}

export const BarcodeGeneratorModal: React.FC<BarcodeModalProps> = ({
  isOpen,
  onClose,
  product
}) => {
  const { settings } = useApp();
  const { t, language } = useLanguage();

  if (!product) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('barcode_label')} maxWidth="md">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between bg-blue-50 dark:bg-blue-950/40 p-3 rounded-xl border border-blue-200 dark:border-blue-900/50">
          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
            <Tag className="w-5 h-5" />
            <span className="text-sm font-bold">Shelf Label (50mm x 30mm)</span>
          </div>

          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>{t('print_barcode')}</span>
          </button>
        </div>

        {/* Printable Label Preview */}
        <div 
          id="printable-receipt"
          className="bg-white text-slate-900 p-4 rounded-xl border-2 border-slate-300 shadow-md max-w-xs mx-auto w-full text-center space-y-1.5"
        >
          <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
            {settings.shopName}
          </p>
          <h4 className="font-bold text-xs line-clamp-2 px-1">
            {language === 'ar' ? product.nameAr : product.name}
          </h4>
          <div 
            className="w-44 mx-auto my-1"
            dangerouslySetInnerHTML={{ __html: generateBarcodeSvg(product.barcode, 40) }}
          />
          <p className="font-mono text-xs font-bold tracking-widest">{product.barcode}</p>
          <div className="flex items-center justify-between px-2 pt-1 border-t border-slate-200">
            <span className="text-[10px] font-medium text-slate-500">SKU: {product.sku}</span>
            <span className="text-sm font-extrabold text-blue-700">
              {formatCurrency(product.sellingPrice, settings.currencySymbol)}
            </span>
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
