import { Sale, Purchase, Expense, CashRegisterSession, AppNotification, AppSettings, User } from '../types';

export const initialUsers: User[] = [
  {
    id: 'user-admin',
    name: 'Murad (System Owner)',
    username: 'admin',
    role: 'admin',
    email: 'admin@techfix.ps',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    active: true
  },
  {
    id: 'user-mgr',
    name: 'Rami Qasem (Shop Manager)',
    username: 'manager',
    role: 'manager',
    email: 'rami@techfix.ps',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    active: true
  },
  {
    id: 'user-cashier',
    name: 'Layla Mansour (Cashier)',
    username: 'cashier',
    role: 'cashier',
    email: 'layla@techfix.ps',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    active: true
  },
  {
    id: 'user-tech-1',
    name: 'Samer Haddad (Senior Technician)',
    username: 'tech_samer',
    role: 'technician',
    email: 'samer@techfix.ps',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    active: true
  },
  {
    id: 'user-tech-2',
    name: 'Khaled Mansour (Hardware Technician)',
    username: 'tech_khaled',
    role: 'technician',
    email: 'khaled@techfix.ps',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    active: true
  },
  {
    id: 'user-inv',
    name: 'Fadi Shami (Inventory Officer)',
    username: 'inventory',
    role: 'inventory_manager',
    email: 'fadi@techfix.ps',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    active: true
  }
];

export const initialSettings: AppSettings = {
  shopName: 'TechFix Maintenance & Accessories',
  shopNameAr: 'مركز تك فيكس لصيانة الكمبيوتر والموبايل',
  tagline: 'Professional Electronics Repair & Modern Accessories',
  taglineAr: 'صيانة احترافية للإلكترونيات والأجهزة الذكية وإكسسواراتها',
  phone: '+970 2 298 7654',
  whatsapp: '+970 599 123 456',
  email: 'info@techfix.ps',
  address: 'Main Boulevard, Technology Tower, Ground Floor, Ramallah',
  addressAr: 'شارع الإرسال، برج التكنولوجيا، الطابق الأرضي، رام الله',
  taxNumber: 'PS-VAT-902188472',
  currency: 'ILS',
  currencySymbol: '₪',
  taxRate: 17,
  enableTax: true,
  invoicePrefix: 'INV-2026-',
  repairPrefix: 'REP-2026-',
  receiptFooterEn: 'Thank you for shopping with TechFix! All repairs include warranty according to ticket terms. Please retain your receipt for warranty claims.',
  receiptFooterAr: 'شكراً لتعاملكم مع مركز تك فيكس! جميع أعمال الصيانة مشمولة بالضمان حسب شروط التذكرة. يرجى الاحتفاظ بالفاتورة لأي مراجعة.'
};

export const initialSales: Sale[] = [
  {
    id: 'sale-001',
    invoiceNumber: 'INV-2026-1001',
    customerId: 'cust-001',
    customerName: 'Ahmad Al-Qadi (أحمد القاضي)',
    customerPhone: '0599123456',
    items: [
      {
        productId: 'prod-001',
        productName: 'Anker PowerPort III 20W Fast Charger',
        productNameAr: 'شاحن أنكر سريع 20 واط تايب سي',
        sku: 'ANK-CHG-20W',
        barcode: '790011223301',
        unitPrice: 65,
        purchasePrice: 35,
        quantity: 1,
        discount: 0,
        total: 65
      },
      {
        productId: 'prod-005',
        productName: 'Baseus Cafule USB-C to Lightning Braided Cable 1.2m',
        productNameAr: 'كيبل بيسوس قماشي تايب سي إلى لايتنينج 1.2 متر',
        sku: 'BAS-CAB-CL12',
        barcode: '790011223305',
        unitPrice: 35,
        purchasePrice: 15,
        quantity: 2,
        discount: 5,
        total: 65
      }
    ],
    subtotal: 135,
    discountType: 'fixed',
    discountValue: 5,
    discountAmount: 5,
    taxRate: 17,
    taxAmount: 22.1,
    total: 152.1,
    paidAmount: 160,
    changeAmount: 7.9,
    paymentMethod: 'cash',
    cashierId: 'user-cashier',
    cashierName: 'Layla Mansour',
    status: 'completed',
    createdAt: '2026-09-05 11:20'
  },
  {
    id: 'sale-002',
    invoiceNumber: 'INV-2026-1002',
    customerId: 'cust-walkin',
    customerName: 'Walk-in Customer (عميل نقدي)',
    items: [
      {
        productId: 'prod-018',
        productName: 'Kingston KC3000 1TB PCIe 4.0 NVMe M.2 SSD',
        productNameAr: 'قرص تخزين كينغستون سريع 1 تيرا NVMe الجيل الرابع',
        sku: 'SSD-KNG-1TB4',
        barcode: '790011223318',
        unitPrice: 340,
        purchasePrice: 260,
        quantity: 1,
        discount: 0,
        total: 340
      },
      {
        productId: 'prod-021',
        productName: 'Kingston FURY Beast 16GB DDR4 3200MHz Desktop RAM',
        productNameAr: 'رام كينغستون فيوري 16 جيجا DDR4 3200 كمبيوتر مكتبي',
        sku: 'RAM-KNG-16D4',
        barcode: '790011223321',
        unitPrice: 165,
        purchasePrice: 110,
        quantity: 1,
        discount: 0,
        total: 165
      }
    ],
    subtotal: 505,
    discountType: 'percent',
    discountValue: 0,
    discountAmount: 0,
    taxRate: 17,
    taxAmount: 85.85,
    total: 590.85,
    paidAmount: 590.85,
    changeAmount: 0,
    paymentMethod: 'card',
    cashierId: 'user-cashier',
    cashierName: 'Layla Mansour',
    status: 'completed',
    createdAt: '2026-09-05 14:45'
  },
  {
    id: 'sale-003',
    invoiceNumber: 'INV-2026-1003',
    customerId: 'cust-003',
    customerName: 'Tareq Natsheh (طارق النتشة)',
    items: [
      {
        productId: 'prod-024',
        productName: 'Logitech G305 LIGHTSPEED Wireless Gaming Mouse',
        productNameAr: 'ماوس لوجيتك لاسلكي للألعاب G305 لايت سبيد',
        sku: 'LOG-MSE-G305',
        barcode: '790011223324',
        unitPrice: 185,
        purchasePrice: 125,
        quantity: 1,
        discount: 10,
        total: 175
      },
      {
        productId: 'prod-008',
        productName: 'Baseus Adaman 20,000mAh 65W Metal Power Bank',
        productNameAr: 'باور بانك بيسوس معدني 20 ألف ملي أمبير 65 واط',
        sku: 'BAS-PB-20K65W',
        barcode: '790011223308',
        unitPrice: 195,
        purchasePrice: 120,
        quantity: 1,
        discount: 0,
        total: 195
      }
    ],
    subtotal: 370,
    discountType: 'fixed',
    discountValue: 0,
    discountAmount: 0,
    taxRate: 17,
    taxAmount: 62.9,
    total: 432.9,
    paidAmount: 432.9,
    changeAmount: 0,
    paymentMethod: 'split',
    splitPayments: [
      { method: 'cash', amount: 200 },
      { method: 'card', amount: 232.9 }
    ],
    cashierId: 'user-cashier',
    cashierName: 'Layla Mansour',
    status: 'completed',
    createdAt: '2026-09-05 17:10'
  }
];

export const initialPurchases: Purchase[] = [
  {
    id: 'pur-001',
    invoiceNumber: 'PO-2026-501',
    supplierId: 'sup-001',
    supplierName: 'SmartLine Distribution Co.',
    items: [
      { productId: 'prod-001', productName: 'Anker PowerPort III 20W Fast Charger', quantity: 20, unitCost: 35, total: 700 },
      { productId: 'prod-005', productName: 'Baseus Cafule USB-C to Lightning Braided Cable', quantity: 30, unitCost: 15, total: 450 },
      { productId: 'prod-008', productName: 'Baseus Adaman 20,000mAh 65W Metal Power Bank', quantity: 10, unitCost: 120, total: 1200 }
    ],
    totalAmount: 2350,
    paidAmount: 1500,
    remainingAmount: 850,
    status: 'received',
    notes: 'Partial payment made via bank transfer, rest due end of month',
    createdAt: '2026-09-01 10:00'
  },
  {
    id: 'pur-002',
    invoiceNumber: 'PO-2026-502',
    supplierId: 'sup-004',
    supplierName: 'CompTech Hardware Solutions',
    items: [
      { productId: 'prod-018', productName: 'Kingston KC3000 1TB PCIe 4.0 NVMe M.2 SSD', quantity: 10, unitCost: 260, total: 2600 },
      { productId: 'prod-021', productName: 'Kingston FURY Beast 16GB DDR4 3200MHz Desktop RAM', quantity: 15, unitCost: 110, total: 1650 }
    ],
    totalAmount: 4250,
    paidAmount: 4250,
    remainingAmount: 0,
    status: 'received',
    notes: 'Paid in full upon delivery via company check',
    createdAt: '2026-09-03 14:30'
  }
];

export const initialExpenses: Expense[] = [
  {
    id: 'exp-001',
    date: '2026-09-01',
    category: 'rent',
    description: 'Monthly store premise rent (September 2026)',
    amount: 3500,
    paymentMethod: 'bank',
    employeeName: 'Murad',
    notes: 'Transacted via Bank of Palestine business account'
  },
  {
    id: 'exp-002',
    date: '2026-09-03',
    category: 'electricity',
    description: 'JDECO Commercial electricity bill for August',
    amount: 620,
    paymentMethod: 'bank',
    employeeName: 'Rami Qasem'
  },
  {
    id: 'exp-003',
    date: '2026-09-05',
    category: 'hospitality',
    description: 'Coffee, tea, and bottled water for client waiting lounge',
    amount: 85,
    paymentMethod: 'cash',
    employeeName: 'Layla Mansour',
    notes: 'Paid from cash register petty cash'
  },
  {
    id: 'exp-004',
    date: '2026-09-04',
    category: 'tools',
    description: '0.1mm micro-soldering copper jump wire and Relife solder wick',
    amount: 110,
    paymentMethod: 'cash',
    employeeName: 'Samer Haddad'
  }
];

export const initialRegisterSession: CashRegisterSession = {
  id: 'reg-2026-09-05',
  openedAt: '2026-09-05 08:30',
  openingCash: 500,
  cashSales: 352.1,
  cashRepairs: 300,
  customerDebtCash: 100,
  cashExpenses: 85,
  supplierCashPaid: 0,
  expectedCash: 1167.1,
  cashierName: 'Layla Mansour',
  status: 'open',
  notes: 'Morning shift register session'
};

export const initialNotifications: AppNotification[] = [
  {
    id: 'notif-001',
    type: 'low_stock',
    title: 'Low Stock Alert: Used Devices',
    titleAr: 'تنبيه: مخزون منخفض للأجهزة المستعملة',
    message: 'Used iPhone 13 128GB has reached threshold (2 left). Consider procuring more inventory.',
    messageAr: 'الآيفون 13 المستعمل وصل للحد الأدنى (متبقي 2 فقط). يرجى التوريد قريباً.',
    date: '2026-09-05 12:00',
    read: false,
    link: 'inventory'
  },
  {
    id: 'notif-002',
    type: 'repair_ready',
    title: 'Repair Ready: iPhone 14 Pro',
    titleAr: 'جاهز للاستلام: آيفون 14 برو',
    message: 'Ticket REP-2026-002 for Sara Barghouthi is ready for customer pickup.',
    messageAr: 'التذكرة REP-2026-002 الخاصة بسارة البرغوثي جاهزة لتسليم العميل.',
    date: '2026-09-05 16:35',
    read: false,
    link: 'repairs'
  },
  {
    id: 'notif-003',
    type: 'customer_debt',
    title: 'High Customer Debt: Eng. Mahmoud Zeid',
    titleAr: 'رصيد دين مستحق: م. محمود زيد',
    message: 'Customer outstanding balance is ₪450. Follow up via WhatsApp.',
    messageAr: 'رصيد الدين المستحق للعميل هو 450 ₪. يرجى المتابعة عبر الواتساب.',
    date: '2026-09-05 09:00',
    read: true,
    link: 'customers'
  },
  {
    id: 'notif-004',
    type: 'supplier_debt',
    title: 'Supplier Balance Owed: CompTech',
    titleAr: 'رصيد مورد مستحق: كمب تك',
    message: 'Total balance owed to CompTech Hardware Solutions is ₪2,100.',
    messageAr: 'الرصيد الإجمالي المستحق لشركة كمب تك هو 2,100 ₪.',
    date: '2026-09-04 15:30',
    read: true,
    link: 'suppliers'
  }
];
