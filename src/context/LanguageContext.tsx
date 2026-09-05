import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'ar';

interface Translations {
  [key: string]: {
    en: string;
    ar: string;
  };
}

export const translations: Translations = {
  // Navigation
  dashboard: { en: 'Dashboard', ar: 'لوحة التحكم' },
  pos: { en: 'POS / Sales', ar: 'نقطة البيع (الكاشير)' },
  repairs: { en: 'Repairs', ar: 'الصيانة والورشة' },
  products: { en: 'Products', ar: 'المنتجات' },
  inventory: { en: 'Inventory', ar: 'المخزون والمستودع' },
  purchases: { en: 'Purchases', ar: 'المشتريات والتوريد' },
  customers: { en: 'Customers', ar: 'العملاء (CRM)' },
  suppliers: { en: 'Suppliers', ar: 'الموردين' },
  expenses: { en: 'Expenses', ar: 'المصروفات' },
  payments: { en: 'Payments & Register', ar: 'الصندوق والمدفوعات' },
  reports: { en: 'Reports', ar: 'التقارير المالية' },
  employees: { en: 'Employees', ar: 'الموظفين والصلاحيات' },
  notifications: { en: 'Notifications', ar: 'التنبيهات' },
  settings: { en: 'Settings', ar: 'الإعدادات العامة' },
  track_repair: { en: 'Track Repair', ar: 'تتبع جهازك' },

  // POS Screen
  search_products: { en: 'Search by name, SKU, barcode, IMEI...', ar: 'ابحث بالاسم، الباركود، الكود أو الرقم التسلسلي...' },
  scan_barcode: { en: 'Scan Barcode', ar: 'مسح الباركود' },
  all_categories: { en: 'All Categories', ar: 'جميع الأقسام' },
  cart: { en: 'Current Cart', ar: 'سلة المبيعات' },
  empty_cart: { en: 'Cart is empty. Add products to begin sale.', ar: 'السلة فارغة. اختر منتجات للبدء بالبيع.' },
  subtotal: { en: 'Subtotal', ar: 'المجموع الجزئي' },
  discount: { en: 'Discount', ar: 'الخصم' },
  tax: { en: 'VAT / Tax', ar: 'ضريبة القيمة المضافة' },
  total: { en: 'Total Amount', ar: 'المجموع الإجمالي' },
  customer: { en: 'Customer', ar: 'العميل' },
  walkin_customer: { en: 'Walk-in Customer', ar: 'عميل نقدي' },
  select_customer: { en: 'Select Customer', ar: 'اختر عميل' },
  pay_now: { en: 'Pay & Checkout', ar: 'الدفع وإصدار الفاتورة' },
  hold_sale: { en: 'Hold Sale', ar: 'تعليق البيع' },
  held_sales: { en: 'Held Sales', ar: 'المبيعات المعلقة' },
  clear_cart: { en: 'Clear Cart', ar: 'إفراغ السلة' },
  quick_cash: { en: 'Quick Cash', ar: 'نقد سريع' },
  cash: { en: 'Cash', ar: 'نقداً' },
  card: { en: 'Credit Card', ar: 'بطاقة ائتمان' },
  bank_transfer: { en: 'Bank Transfer', ar: 'تحويل بنكي' },
  split: { en: 'Split Payment', ar: 'دفع مقسم (كاش + بطاقة)' },
  tendered_amount: { en: 'Received Amount', ar: 'المبلغ المستلم' },
  change_due: { en: 'Change Due', ar: 'المتبقي للعميل (الفكة)' },
  complete_sale: { en: 'Complete Sale', ar: 'تأكيد البيع' },
  print_receipt: { en: 'Print Receipt', ar: 'طباعة الفاتورة' },
  recent_sales: { en: 'Recent Sales', ar: 'سجل المبيعات الحديثة' },
  refund: { en: 'Refund / Return', ar: 'إرجاع / استرداد' },

  // Repairs
  new_repair: { en: 'New Repair Ticket', ar: 'استلام جهاز جديد' },
  ticket_number: { en: 'Ticket #', ar: 'رقم التذكرة' },
  device_info: { en: 'Device Details', ar: 'تفاصيل الجهاز' },
  device_type: { en: 'Device Type', ar: 'نوع الجهاز' },
  brand_model: { en: 'Brand & Model', ar: 'الماركة والموديل' },
  reported_problem: { en: 'Reported Problem', ar: 'العطل المشتكى منه' },
  technician_notes: { en: 'Technician Diagnosis', ar: 'تقرير الفني والتشخيص' },
  estimated_cost: { en: 'Estimated Cost', ar: 'التكلفة المقدرة' },
  final_cost: { en: 'Final Cost', ar: 'التكلفة النهائية' },
  deposit: { en: 'Deposit Paid', ar: 'الدفعة المقدمة' },
  remaining_balance: { en: 'Remaining Balance', ar: 'المبلغ المتبقي' },
  technician: { en: 'Assigned Tech', ar: 'الفني المسؤول' },
  received_date: { en: 'Received Date', ar: 'تاريخ الاستلام' },
  ready_date: { en: 'Expected Ready', ar: 'التاريخ المتوقع' },
  status: { en: 'Status', ar: 'الحالة' },
  actions: { en: 'Actions', ar: 'الإجراءات' },
  public_tracking_link: { en: 'Customer Tracking Portal', ar: 'رابط تتبع العميل' },

  // Statuses
  status_received: { en: 'Received', ar: 'تم الاستلام' },
  status_diagnosing: { en: 'Diagnosing', ar: 'قيد الفحص والتشخيص' },
  status_waiting_approval: { en: 'Waiting Approval', ar: 'بانتظار موافقة العميل' },
  status_waiting_parts: { en: 'Waiting Parts', ar: 'بانتظار قطع الغيار' },
  status_in_repair: { en: 'In Repair', ar: 'قيد الصيانة والعمل' },
  status_ready_for_pickup: { en: 'Ready for Pickup', ar: 'جاهز للتسليم' },
  status_delivered: { en: 'Delivered', ar: 'تم التسليم' },
  status_cancelled: { en: 'Cancelled', ar: 'ملغى' },

  // Inventory & Products
  add_product: { en: 'Add Product', ar: 'إضافة منتج جديد' },
  stock_in: { en: 'Stock In (+)', ar: 'توريد مخزون (+)' },
  stock_out: { en: 'Stock Out (-)', ar: 'صرف مخزون (-)' },
  stock_adjustment: { en: 'Adjust Stock', ar: 'جرد وتعديل' },
  stock_level: { en: 'Stock Level', ar: 'المخزون المتوفر' },
  purchase_price: { en: 'Cost Price', ar: 'سعر التكلفة' },
  selling_price: { en: 'Selling Price', ar: 'سعر البيع' },
  low_stock: { en: 'Low Stock Alert', ar: 'مخزون منخفض' },
  barcode_label: { en: 'Barcode Label', ar: 'ملصق الباركود' },
  print_barcode: { en: 'Print Barcode', ar: 'طباعة الباركود' },
  inventory_valuation: { en: 'Inventory Valuation', ar: 'تقييم المخزون' },
  total_retail_value: { en: 'Total Retail Value', ar: 'القيمة البيعية الإجمالية' },
  total_cost_value: { en: 'Total Cost Value', ar: 'قيمة التكلفة الإجمالية' },
  potential_profit: { en: 'Potential Gross Profit', ar: 'هامش الربح المتوقع' },

  // General Buttons
  save: { en: 'Save', ar: 'حفظ' },
  cancel: { en: 'Cancel', ar: 'إلغاء' },
  delete: { en: 'Delete', ar: 'حذف' },
  edit: { en: 'Edit', ar: 'تعديل' },
  close: { en: 'Close', ar: 'إغلاق' },
  confirm: { en: 'Confirm', ar: 'تأكيد' },
  filter: { en: 'Filter', ar: 'تصفية' },
  export: { en: 'Export', ar: 'تصدير' },
  search: { en: 'Search...', ar: 'بحث...' },
  view_details: { en: 'View Details', ar: 'عرض التفاصيل' },
  whatsapp: { en: 'WhatsApp Chat', ar: 'محادثة واتساب' },

  // Roles
  role_admin: { en: 'Administrator', ar: 'مدير النظام' },
  role_manager: { en: 'Shop Manager', ar: 'مدير المتجر' },
  role_cashier: { en: 'Cashier', ar: 'أمين صندوق (كاشير)' },
  role_technician: { en: 'Technician', ar: 'فني صيانة' },
  role_inventory_manager: { en: 'Inventory Officer', ar: 'مسؤول المستودع' },
};

interface LanguageContextType {
  language: Language;
  direction: 'ltr' | 'rtl';
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem('techfix_lang') as Language) || 'en';
  });

  const direction = language === 'ar' ? 'rtl' : 'ltr';

  useEffect(() => {
    localStorage.setItem('techfix_lang', language);
    document.documentElement.dir = direction;
    document.documentElement.lang = language;
  }, [language, direction]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const toggleLanguage = () => {
    setLanguageState((prev) => (prev === 'en' ? 'ar' : 'en'));
  };

  const t = (key: string): string => {
    const item = translations[key];
    if (!item) return key;
    return item[language] || item['en'] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, direction, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within a LanguageProvider');
  return context;
};
