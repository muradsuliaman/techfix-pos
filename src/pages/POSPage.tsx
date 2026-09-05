import React, { useState, useRef, useEffect } from 'react';
import { useApp, CartItem } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import { formatCurrency } from '../utils/formatters';
import { Product, PaymentMethod, SplitPaymentDetail } from '../types';
import { ReceiptModal } from '../components/receipts/ReceiptModal';
import { Modal } from '../components/common/Modal';
import { initialCategories } from '../data/categories';
import { 
  Search, 
  Barcode, 
  Plus, 
  Minus, 
  Trash2, 
  ShoppingCart, 
  PauseCircle, 
  PlayCircle, 
  CreditCard, 
  DollarSign, 
  Banknote, 
  Percent, 
  UserPlus, 
  RotateCcw,
  CheckCircle2,
  X,
  Printer,
  FileText,
  ScanLine
} from 'lucide-react';

export const POSPage: React.FC = () => {
  const { 
    products, 
    cart, 
    addToCart, 
    updateCartQuantity, 
    updateCartDiscount, 
    removeFromCart, 
    clearCart,
    heldSales,
    holdCurrentSale,
    restoreHeldSale,
    deleteHeldSale,
    processSale,
    sales,
    refundSale,
    customers,
    selectedCustomerId,
    setSelectedCustomerId,
    settings,
    addCustomer
  } = useApp();

  const { t, language } = useLanguage();
  const { showToast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [discountType, setDiscountType] = useState<'percent' | 'fixed'>('fixed');
  const [discountValue, setDiscountValue] = useState<number>(0);
  
  // Checkout Modal State
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [cashTendered, setCashTendered] = useState<number>(0);
  const [splitCash, setSplitCash] = useState<number>(0);
  const [splitCard, setSplitCard] = useState<number>(0);
  const [saleNote, setSaleNote] = useState('');

  // Held Sales Modal
  const [heldModalOpen, setHeldModalOpen] = useState(false);
  const [holdNameInput, setHoldNameInput] = useState('');

  // Quick New Customer Modal
  const [newCustModalOpen, setNewCustModalOpen] = useState(false);
  const [newCustName, setNewCustName] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');

  // Completed Receipt Modal
  const [completedSale, setCompletedSale] = useState<any>(null);
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);

  // Recent Sales tab
  const [posTab, setPosTab] = useState<'pos' | 'recent'>('pos');

  // Input ref for barcode scanning
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    searchInputRef.current?.focus();
  }, []);

  // Filter products
  const filteredProducts = products.filter((p) => {
    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
    const query = searchQuery.toLowerCase().trim();
    if (!query) return matchesCategory;

    const matchesName = p.name.toLowerCase().includes(query) || p.nameAr.includes(query);
    const matchesSku = p.sku.toLowerCase().includes(query);
    const matchesBarcode = p.barcode.includes(query);
    const matchesSerial = p.imeiList?.some((im) => im.toLowerCase().includes(query));

    return matchesCategory && (matchesName || matchesSku || matchesBarcode || matchesSerial);
  });

  // Handle instant Barcode Scan submit (Enter Key)
  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      // Find exact barcode or SKU match
      const exactMatch = products.find(
        (p) => p.barcode === searchQuery.trim() || p.sku.toLowerCase() === searchQuery.trim().toLowerCase()
      );
      if (exactMatch) {
        addToCart(exactMatch);
        showToast(`Added ${language === 'ar' ? exactMatch.nameAr : exactMatch.name} to cart`, 'success');
        setSearchQuery('');
      } else if (filteredProducts.length === 1) {
        addToCart(filteredProducts[0]);
        showToast(`Added ${language === 'ar' ? filteredProducts[0].nameAr : filteredProducts[0].name}`, 'success');
        setSearchQuery('');
      }
    }
  };

  // Cart Totals Calculation
  const subtotal = cart.reduce((sum, item) => sum + (item.product.sellingPrice - item.discount) * item.quantity, 0);
  const discountAmount = discountType === 'percent' 
    ? (subtotal * discountValue) / 100 
    : discountValue;
  const afterDiscount = Math.max(0, subtotal - discountAmount);
  const taxAmount = settings.enableTax ? (afterDiscount * settings.taxRate) / 100 : 0;
  const grandTotal = afterDiscount + taxAmount;
  const changeDue = Math.max(0, cashTendered - grandTotal);

  // Quick cash chips
  const quickCashPresets = [20, 50, 100, 200, 500];

  const handleOpenCheckout = () => {
    if (cart.length === 0) {
      showToast(t('empty_cart'), 'warning');
      return;
    }
    setCashTendered(grandTotal);
    setSplitCash(Math.floor(grandTotal / 2));
    setSplitCard(Math.ceil(grandTotal - Math.floor(grandTotal / 2)));
    setCheckoutModalOpen(true);
  };

  const handleCompleteSale = () => {
    let splitDetails: SplitPaymentDetail[] | undefined = undefined;
    if (paymentMethod === 'split') {
      splitDetails = [
        { method: 'cash', amount: splitCash },
        { method: 'card', amount: splitCard }
      ];
    }

    const sale = processSale({
      customerId: selectedCustomerId,
      paymentMethod,
      splitPayments: splitDetails,
      discountType,
      discountValue,
      paidAmount: paymentMethod === 'cash' ? cashTendered : grandTotal,
      note: saleNote
    });

    setCheckoutModalOpen(false);
    setCompletedSale(sale);
    setReceiptModalOpen(true);
    showToast(language === 'ar' ? 'تمت عملية البيع بنجاح!' : 'Sale processed successfully!', 'success');
    setDiscountValue(0);
    setSaleNote('');
  };

  const handleCreateCustomer = () => {
    if (!newCustName.trim() || !newCustPhone.trim()) return;
    const created = addCustomer({
      name: newCustName.trim(),
      phone: newCustPhone.trim(),
      whatsapp: '970' + newCustPhone.replace(/^0+/, ''),
    });
    setSelectedCustomerId(created.id);
    setNewCustName('');
    setNewCustPhone('');
    setNewCustModalOpen(false);
    showToast(language === 'ar' ? 'تمت إضافة العميل' : 'Customer added', 'success');
  };

  const activeCustomer = customers.find((c) => c.id === selectedCustomerId) || customers[0];

  return (
    <div className="flex flex-col h-[calc(100vh-5.5rem)] space-y-4">
      {/* POS Screen Header Tabs */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPosTab('pos')}
            className={`px-4 py-2 rounded-xl text-xs md:text-sm font-bold transition-all flex items-center gap-2 ${
              posTab === 'pos'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <ShoppingCart className="w-4 h-4" />
            <span>{t('pos')}</span>
          </button>
          <button
            onClick={() => setPosTab('recent')}
            className={`px-4 py-2 rounded-xl text-xs md:text-sm font-bold transition-all flex items-center gap-2 ${
              posTab === 'recent'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <RotateCcw className="w-4 h-4" />
            <span>{t('recent_sales')}</span>
            <span className="text-[11px] px-1.5 py-0.2 bg-slate-200 dark:bg-slate-800 rounded-full">
              {sales.length}
            </span>
          </button>
        </div>

        {/* Held Sales Button */}
        {heldSales.length > 0 && (
          <button
            onClick={() => setHeldModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 text-white text-xs font-bold rounded-xl shadow animate-bounce"
          >
            <PauseCircle className="w-4 h-4" />
            <span>{t('held_sales')} ({heldSales.length})</span>
          </button>
        )}
      </div>

      {posTab === 'recent' ? (
        /* Recent Sales History Tab */
        <div className="flex-1 bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 overflow-y-auto">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
            {t('recent_sales')}
          </h3>
          <div className="space-y-3">
            {sales.map((sale) => (
              <div
                key={sale.id}
                className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex flex-wrap items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-extrabold text-blue-600 text-sm">{sale.invoiceNumber}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                      sale.status === 'refunded' ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {sale.status}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">({sale.paymentMethod})</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                    {sale.customerName} &bull; {sale.items.length} items &bull; Cashier: {sale.cashierName}
                  </p>
                  <p className="text-[10px] text-slate-400">{sale.createdAt}</p>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-base font-extrabold text-slate-900 dark:text-white">
                    {formatCurrency(sale.total, settings.currencySymbol, language)}
                  </span>
                  <button
                    onClick={() => {
                      setCompletedSale(sale);
                      setReceiptModalOpen(true);
                    }}
                    className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors"
                    title="Print Receipt"
                  >
                    <Printer className="w-4 h-4" />
                  </button>
                  {sale.status !== 'refunded' && (
                    <button
                      onClick={() => {
                        const reason = prompt(language === 'ar' ? 'سبب الإرجاع:' : 'Reason for return:');
                        if (reason) {
                          refundSale(sale.id, reason);
                          showToast(language === 'ar' ? 'تم إرجاع الفاتورة واستعادة المخزون' : 'Sale refunded and stock restored', 'info');
                        }
                      }}
                      className="px-3 py-1.5 bg-rose-50 dark:bg-rose-950 text-rose-600 hover:bg-rose-100 rounded-xl text-xs font-bold transition-colors"
                    >
                      {t('refund')}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Main High Speed POS Screen Grid */
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 min-h-0">
          {/* Left Column: Products Catalog (7 cols) */}
          <div className="lg:col-span-7 xl:col-span-8 flex flex-col bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-4 overflow-hidden">
            {/* Top Search Bar with Barcode Scanner Simulator */}
            <div className="flex items-center gap-2 mb-3">
              <div className="relative flex-1">
                <Search className="absolute start-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleSearchKeyDown}
                  placeholder={t('search_products')}
                  className="w-full ps-9 pe-4 py-2.5 bg-slate-100 dark:bg-slate-800 border-none rounded-2xl text-xs md:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-600 outline-none transition-all"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="absolute end-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Quick Barcode Scanner Trigger */}
              <button
                onClick={() => {
                  const demoBarcode = products[Math.floor(Math.random() * products.length)].barcode;
                  setSearchQuery(demoBarcode);
                  showToast(`Scanned Barcode: ${demoBarcode}`, 'info');
                }}
                className="flex items-center gap-1.5 px-3 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-2xl transition-colors flex-shrink-0"
                title="Scan Barcode Simulator"
              >
                <ScanLine className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="hidden sm:inline">{t('scan_barcode')}</span>
              </button>
            </div>

            {/* Category Pills Filter */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2.5 mb-2 no-scrollbar">
              {initialCategories.map((cat) => {
                const isSelected = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex-shrink-0 ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-900'
                    }`}
                  >
                    {language === 'ar' ? cat.nameAr : cat.name}
                  </button>
                );
              })}
            </div>

            {/* Products Grid */}
            <div className="flex-1 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 pe-1">
              {filteredProducts.map((product) => {
                const inCart = cart.find((ci) => ci.product.id === product.id);
                const isOutOfStock = product.quantity <= 0;

                return (
                  <div
                    key={product.id}
                    onClick={() => {
                      if (!isOutOfStock) {
                        addToCart(product);
                      } else {
                        showToast(language === 'ar' ? 'المنتج غير متوفر في المخزون' : 'Out of stock!', 'error');
                      }
                    }}
                    className={`relative flex flex-col justify-between p-3 rounded-2xl border transition-all cursor-pointer group select-none ${
                      inCart
                        ? 'bg-blue-50/70 dark:bg-blue-950/40 border-blue-500/60 shadow-md shadow-blue-500/10'
                        : 'bg-slate-50/70 dark:bg-slate-800/40 border-slate-200/80 dark:border-slate-800 hover:border-blue-400 hover:shadow-md'
                    } ${isOutOfStock ? 'opacity-50 cursor-not-allowed' : 'active:scale-95'}`}
                  >
                    {/* Badge / Indicator */}
                    {inCart && (
                      <span className="absolute -top-1.5 -end-1.5 w-6 h-6 bg-blue-600 text-white text-xs font-extrabold rounded-full flex items-center justify-center shadow-lg">
                        {inCart.quantity}
                      </span>
                    )}

                    {/* Image Thumbnail */}
                    <div className="w-full h-24 rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-700 mb-2 relative">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                      <span className="absolute bottom-1 start-1 px-1.5 py-0.5 bg-slate-900/80 backdrop-blur-md text-[10px] font-mono font-bold text-white rounded">
                        {product.brand}
                      </span>
                    </div>

                    {/* Details */}
                    <div>
                      <h4 className="font-bold text-xs text-slate-900 dark:text-white line-clamp-2 leading-tight">
                        {language === 'ar' ? product.nameAr : product.name}
                      </h4>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">{product.sku}</p>
                    </div>

                    {/* Price and Stock */}
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-200/60 dark:border-slate-800">
                      <span className="text-xs font-extrabold text-blue-600 dark:text-blue-400 font-mono">
                        {formatCurrency(product.sellingPrice, settings.currencySymbol, language)}
                      </span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        product.quantity <= product.minStock
                          ? 'bg-rose-100 dark:bg-rose-950 text-rose-600'
                          : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600'
                      }`}>
                        {product.quantity} {language === 'ar' ? 'قطعة' : 'left'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Checkout & Cart (5 cols) */}
          <div className="lg:col-span-5 xl:col-span-4 flex flex-col bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-4 shadow-xl">
            {/* Customer Selector Row */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-2">
              <div className="flex items-center gap-2 flex-1 me-2">
                <select
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                  className="w-full text-xs font-bold bg-slate-100 dark:bg-slate-800 border-none rounded-xl px-2.5 py-2 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-600"
                >
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} {c.outstandingBalance > 0 ? `(Debt: ${c.outstandingBalance} ₪)` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={() => setNewCustModalOpen(true)}
                title="Add New Customer"
                className="p-2 bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 hover:bg-blue-100 rounded-xl transition-colors"
              >
                <UserPlus className="w-4 h-4" />
              </button>
            </div>

            {/* Active Cart Items Scrollable List */}
            <div className="flex-1 overflow-y-auto space-y-2 pe-1">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                  <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3 text-slate-300">
                    <ShoppingCart className="w-8 h-8" />
                  </div>
                  <p className="text-xs font-semibold">{t('empty_cart')}</p>
                </div>
              ) : (
                cart.map((item) => (
                  <div
                    key={item.product.id}
                    className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800 flex items-center justify-between gap-2"
                  >
                    <div className="flex-1 min-w-0">
                      <h5 className="font-bold text-xs text-slate-900 dark:text-white truncate">
                        {language === 'ar' ? item.product.nameAr : item.product.name}
                      </h5>
                      <span className="text-[11px] font-mono text-blue-600 dark:text-blue-400 font-semibold">
                        {formatCurrency(item.product.sellingPrice, settings.currencySymbol, language)}
                      </span>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 px-2 py-1 rounded-xl border border-slate-200 dark:border-slate-700">
                      <button
                        onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                        className="p-1 hover:text-blue-600 transition-colors"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="font-bold text-xs w-5 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                        className="p-1 hover:text-blue-600 transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Total & Remove */}
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-900 dark:text-white font-mono">
                        {formatCurrency((item.product.sellingPrice - item.discount) * item.quantity, settings.currencySymbol, language)}
                      </span>
                      <button
                        onClick={() => removeFromCart(item.product.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Pricing Calculation Summary */}
            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2 mt-2 text-xs">
              <div className="flex justify-between text-slate-500">
                <span>{t('subtotal')}:</span>
                <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
                  {formatCurrency(subtotal, settings.currencySymbol, language)}
                </span>
              </div>

              {/* Order Discount Input */}
              <div className="flex items-center justify-between">
                <span className="text-slate-500">{t('discount')}:</span>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min="0"
                    value={discountValue || ''}
                    onChange={(e) => setDiscountValue(Math.max(0, parseFloat(e.target.value) || 0))}
                    placeholder="0"
                    className="w-16 px-2 py-1 text-end text-xs bg-slate-100 dark:bg-slate-800 rounded-lg border-none outline-none font-mono"
                  />
                  <button
                    onClick={() => setDiscountType(discountType === 'fixed' ? 'percent' : 'fixed')}
                    className="p-1 bg-slate-200 dark:bg-slate-700 rounded-lg text-[10px] font-bold"
                  >
                    {discountType === 'fixed' ? settings.currencySymbol : '%'}
                  </button>
                </div>
              </div>

              {/* Tax */}
              {settings.enableTax && (
                <div className="flex justify-between text-slate-500">
                  <span>{t('tax')} ({settings.taxRate}%):</span>
                  <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
                    {formatCurrency(taxAmount, settings.currencySymbol, language)}
                  </span>
                </div>
              )}

              {/* Grand Total */}
              <div className="flex justify-between items-center text-base font-black pt-2 border-t border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white">
                <span>{t('total')}:</span>
                <span className="text-blue-600 dark:text-blue-400 font-mono text-xl">
                  {formatCurrency(grandTotal, settings.currencySymbol, language)}
                </span>
              </div>
            </div>

            {/* POS Actions Buttons */}
            <div className="grid grid-cols-3 gap-2 mt-4 pt-2">
              <button
                onClick={() => {
                  if (cart.length === 0) return;
                  const name = prompt(language === 'ar' ? 'اسم البيع المعلق:' : 'Name for held sale:');
                  if (name !== null) {
                    holdCurrentSale(name);
                    showToast(language === 'ar' ? 'تم تعليق الفاتورة' : 'Sale held', 'info');
                  }
                }}
                disabled={cart.length === 0}
                className="py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-2xl text-xs font-bold transition-colors disabled:opacity-40 flex items-center justify-center gap-1"
              >
                <PauseCircle className="w-3.5 h-3.5" />
                <span>{t('hold_sale')}</span>
              </button>

              <button
                onClick={clearCart}
                disabled={cart.length === 0}
                className="py-2.5 bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 text-rose-600 rounded-2xl text-xs font-bold transition-colors disabled:opacity-40 flex items-center justify-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{t('clear_cart')}</span>
              </button>

              <button
                onClick={handleOpenCheckout}
                disabled={cart.length === 0}
                className="col-span-1 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl text-xs font-bold shadow-lg shadow-blue-500/25 transition-all transform active:scale-95 disabled:opacity-40 flex items-center justify-center gap-1.5"
              >
                <CreditCard className="w-4 h-4" />
                <span>{t('pay_now')}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      <Modal 
        isOpen={checkoutModalOpen} 
        onClose={() => setCheckoutModalOpen(false)} 
        title={t('pay_now')}
        maxWidth="lg"
      >
        <div className="space-y-6">
          {/* Amount Due Display */}
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-6 rounded-3xl text-center shadow-xl shadow-blue-500/10">
            <span className="text-xs uppercase tracking-wider text-blue-200 font-bold block mb-1">
              {t('total')}
            </span>
            <h2 className="text-4xl font-black font-mono">
              {formatCurrency(grandTotal, settings.currencySymbol, language)}
            </h2>
            <p className="text-xs text-blue-100 mt-2">
              Customer: {activeCustomer.name}
            </p>
          </div>

          {/* Payment Method Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
              Select Payment Method
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { id: 'cash' as PaymentMethod, label: t('cash'), icon: Banknote },
                { id: 'card' as PaymentMethod, label: t('card'), icon: CreditCard },
                { id: 'bank_transfer' as PaymentMethod, label: t('bank_transfer'), icon: DollarSign },
                { id: 'split' as PaymentMethod, label: t('split'), icon: Percent },
              ].map((m) => {
                const Icon = m.icon;
                const isSelected = paymentMethod === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => setPaymentMethod(m.id)}
                    className={`flex flex-col items-center gap-2 p-3 rounded-2xl border text-xs font-bold transition-all ${
                      isSelected
                        ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-600 text-blue-700 dark:text-blue-400 shadow-sm'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{m.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Cash Payment Tender & Change Calculator */}
          {paymentMethod === 'cash' && (
            <div className="space-y-3 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {t('tendered_amount')}:
                </label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={cashTendered || ''}
                  onChange={(e) => setCashTendered(parseFloat(e.target.value) || 0)}
                  className="w-36 text-end px-3 py-2 text-base font-mono font-bold bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              {/* Quick Cash Presets */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] font-bold text-slate-400 uppercase me-1">Quick:</span>
                <button
                  onClick={() => setCashTendered(grandTotal)}
                  className="px-2.5 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold hover:bg-blue-50"
                >
                  Exact
                </button>
                {quickCashPresets.map((amt) => (
                  <button
                    key={amt}
                    onClick={() => setCashTendered(amt)}
                    className="px-2.5 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold font-mono hover:bg-blue-50"
                  >
                    {amt} ₪
                  </button>
                ))}
              </div>

              {/* Change calculation */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-700 text-sm font-bold">
                <span className="text-slate-600 dark:text-slate-400">{t('change_due')}:</span>
                <span className="font-mono text-base text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(changeDue, settings.currencySymbol, language)}
                </span>
              </div>
            </div>
          )}

          {/* Split Payment Options */}
          {paymentMethod === 'split' && (
            <div className="space-y-3 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{t('cash')}:</span>
                <input
                  type="number"
                  min="0"
                  value={splitCash || ''}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value) || 0;
                    setSplitCash(val);
                    setSplitCard(Math.max(0, grandTotal - val));
                  }}
                  className="w-32 text-end px-3 py-1.5 text-xs font-mono font-bold bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 outline-none"
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{t('card')}:</span>
                <input
                  type="number"
                  min="0"
                  value={splitCard || ''}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value) || 0;
                    setSplitCard(val);
                    setSplitCash(Math.max(0, grandTotal - val));
                  }}
                  className="w-32 text-end px-3 py-1.5 text-xs font-mono font-bold bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 outline-none"
                />
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Invoice Note (Optional)
            </label>
            <input
              type="text"
              value={saleNote}
              onChange={(e) => setSaleNote(e.target.value)}
              placeholder="e.g. Gift receipt, specific customer request..."
              className="w-full px-3 py-2 text-xs bg-slate-100 dark:bg-slate-800 border-none rounded-xl text-slate-900 dark:text-white outline-none"
            />
          </div>

          {/* Checkout Submit Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              onClick={() => setCheckoutModalOpen(false)}
              className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 rounded-xl text-xs font-bold transition-colors"
            >
              {t('cancel')}
            </button>
            <button
              onClick={handleCompleteSale}
              className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-500/25 transition-all"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{t('complete_sale')}</span>
            </button>
          </div>
        </div>
      </Modal>

      {/* Held Sales Recall Modal */}
      <Modal
        isOpen={heldModalOpen}
        onClose={() => setHeldModalOpen(false)}
        title={t('held_sales')}
        maxWidth="md"
      >
        <div className="space-y-3">
          {heldSales.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-6">No held sales</p>
          ) : (
            heldSales.map((h) => (
              <div
                key={h.id}
                className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-between"
              >
                <div>
                  <h4 className="font-bold text-xs text-slate-900 dark:text-white">{h.name}</h4>
                  <p className="text-[10px] text-slate-500">{h.items.length} items &bull; {h.date}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      restoreHeldSale(h.id);
                      setHeldModalOpen(false);
                      showToast('Sale restored to cart', 'success');
                    }}
                    className="p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                  >
                    <PlayCircle className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteHeldSale(h.id)}
                    className="p-2 bg-rose-100 text-rose-600 hover:bg-rose-200 rounded-xl transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </Modal>

      {/* Quick Add Customer Modal */}
      <Modal
        isOpen={newCustModalOpen}
        onClose={() => setNewCustModalOpen(false)}
        title="Quick Add Customer"
        maxWidth="sm"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Customer Full Name
            </label>
            <input
              type="text"
              value={newCustName}
              onChange={(e) => setNewCustName(e.target.value)}
              placeholder="e.g. Zaid Odeh"
              className="w-full px-3 py-2 text-xs bg-slate-100 dark:bg-slate-800 rounded-xl border-none outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Mobile Phone
            </label>
            <input
              type="text"
              value={newCustPhone}
              onChange={(e) => setNewCustPhone(e.target.value)}
              placeholder="0599000000"
              className="w-full px-3 py-2 text-xs bg-slate-100 dark:bg-slate-800 rounded-xl border-none outline-none"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => setNewCustModalOpen(false)}
              className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-bold"
            >
              {t('cancel')}
            </button>
            <button
              onClick={handleCreateCustomer}
              className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold shadow"
            >
              {t('save')}
            </button>
          </div>
        </div>
      </Modal>

      {/* Printable Receipt Modal */}
      <ReceiptModal
        isOpen={receiptModalOpen}
        onClose={() => setReceiptModalOpen(false)}
        sale={completedSale}
      />
    </div>
  );
};
