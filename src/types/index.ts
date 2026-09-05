export type Role = 'admin' | 'manager' | 'cashier' | 'technician' | 'inventory_manager';

export interface User {
  id: string;
  name: string;
  username: string;
  role: Role;
  email: string;
  avatar?: string;
  active: boolean;
}

export interface Category {
  id: string;
  name: string;
  nameAr: string;
  icon?: string;
}

export interface Brand {
  id: string;
  name: string;
}

export interface Product {
  id: string;
  name: string;
  nameAr: string;
  sku: string;
  barcode: string;
  category: string;
  brand: string;
  purchasePrice: number;
  sellingPrice: number;
  quantity: number;
  minStock: number;
  supplierId?: string;
  supplierName?: string;
  warranty: string;
  image: string;
  description: string;
  isSerialTracked?: boolean;
  imeiList?: string[];
  variants?: {
    name: string;
    options: string[];
  }[];
}

export interface InventoryTransaction {
  id: string;
  productId: string;
  productName: string;
  type: 'in' | 'out' | 'adjustment' | 'sale' | 'purchase' | 'repair';
  quantity: number;
  previousStock: number;
  newStock: number;
  unitCost: number;
  date: string;
  reason: string;
  referenceId?: string;
  createdBy: string;
}

export type RepairStatus = 
  | 'received' 
  | 'diagnosing' 
  | 'waiting_approval' 
  | 'waiting_parts' 
  | 'in_repair' 
  | 'ready_for_pickup' 
  | 'delivered' 
  | 'cancelled';

export interface RepairPart {
  productId?: string;
  name: string;
  cost: number;
  price: number;
  quantity: number;
}

export interface RepairHistoryEntry {
  status: RepairStatus;
  date: string;
  note: string;
  updatedBy: string;
}

export interface RepairTicket {
  id: string;
  ticketNumber: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerWhatsapp?: string;
  deviceType: 'smartphone' | 'laptop' | 'desktop' | 'tablet' | 'console' | 'other';
  brand: string;
  model: string;
  serialNumber?: string;
  imei1?: string;
  imei2?: string;
  color: string;
  condition: string;
  accessoriesReceived: string;
  problemReported: string;
  technicianNotes?: string;
  diagnosis?: string;
  requiredParts: RepairPart[];
  estimatedCost: number;
  finalCost: number;
  deposit: number;
  remainingBalance: number;
  technicianId?: string;
  technicianName?: string;
  receivedDate: string;
  expectedCompletionDate?: string;
  completedDate?: string;
  warrantyPeriod: string;
  status: RepairStatus;
  paymentStatus: 'unpaid' | 'partial' | 'paid';
  history: RepairHistoryEntry[];
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  whatsapp?: string;
  email?: string;
  address?: string;
  notes?: string;
  totalPurchases: number;
  totalRepairs: number;
  outstandingBalance: number;
  createdAt: string;
}

export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  whatsapp?: string;
  email?: string;
  address?: string;
  notes?: string;
  balance: number; // money owed to supplier
  createdAt: string;
}

export interface SaleItem {
  productId: string;
  productName: string;
  productNameAr: string;
  sku: string;
  barcode: string;
  unitPrice: number;
  purchasePrice: number;
  quantity: number;
  discount: number; // per item discount
  total: number;
  imeiOrSerial?: string;
}

export type PaymentMethod = 'cash' | 'card' | 'bank_transfer' | 'cheque' | 'split';

export interface SplitPaymentDetail {
  method: 'cash' | 'card' | 'bank_transfer';
  amount: number;
}

export interface Sale {
  id: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  customerPhone?: string;
  items: SaleItem[];
  subtotal: number;
  discountType: 'percent' | 'fixed';
  discountValue: number;
  discountAmount: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  paidAmount: number;
  changeAmount: number;
  paymentMethod: PaymentMethod;
  splitPayments?: SplitPaymentDetail[];
  cashierId: string;
  cashierName: string;
  status: 'completed' | 'refunded' | 'held';
  refundReason?: string;
  refundDate?: string;
  note?: string;
  createdAt: string;
}

export interface PurchaseItem {
  productId: string;
  productName: string;
  quantity: number;
  unitCost: number;
  total: number;
}

export interface Purchase {
  id: string;
  invoiceNumber: string;
  supplierId: string;
  supplierName: string;
  items: PurchaseItem[];
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  status: 'received' | 'pending' | 'cancelled';
  notes?: string;
  createdAt: string;
}

export type ExpenseCategory = 
  | 'rent' 
  | 'electricity' 
  | 'internet' 
  | 'salaries' 
  | 'transport' 
  | 'maintenance' 
  | 'hospitality' 
  | 'tools' 
  | 'other';

export interface Expense {
  id: string;
  date: string;
  category: ExpenseCategory;
  description: string;
  amount: number;
  paymentMethod: 'cash' | 'bank';
  employeeName: string;
  notes?: string;
}

export interface CashRegisterSession {
  id: string;
  openedAt: string;
  closedAt?: string;
  openingCash: number;
  cashSales: number;
  cashRepairs: number;
  customerDebtCash: number;
  cashExpenses: number;
  supplierCashPaid: number;
  expectedCash: number;
  actualCash?: number;
  difference?: number;
  cashierName: string;
  status: 'open' | 'closed';
  notes?: string;
}

export interface AppNotification {
  id: string;
  type: 'low_stock' | 'repair_ready' | 'customer_debt' | 'supplier_debt' | 'warranty_expiry' | 'general';
  title: string;
  titleAr: string;
  message: string;
  messageAr: string;
  date: string;
  read: boolean;
  link?: string;
}

export interface AppSettings {
  shopName: string;
  shopNameAr: string;
  tagline: string;
  taglineAr: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  addressAr: string;
  taxNumber: string;
  currency: string;
  currencySymbol: string;
  taxRate: number;
  enableTax: boolean;
  invoicePrefix: string;
  repairPrefix: string;
  receiptFooterEn: string;
  receiptFooterAr: string;
}
