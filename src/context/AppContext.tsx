import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Product, 
  Sale, 
  SaleItem, 
  RepairTicket, 
  RepairStatus, 
  RepairPart,
  Customer, 
  Supplier, 
  Purchase, 
  Expense, 
  CashRegisterSession, 
  AppNotification, 
  AppSettings,
  InventoryTransaction,
  PaymentMethod,
  SplitPaymentDetail
} from '../types';

import { initialProducts } from '../data/initialProducts';
import { initialCustomers } from '../data/initialCustomers';
import { initialSuppliers } from '../data/initialSuppliers';
import { initialRepairs } from '../data/initialRepairs';
import { 
  initialSales, 
  initialPurchases, 
  initialExpenses, 
  initialRegisterSession, 
  initialNotifications, 
  initialSettings 
} from '../data/demoData';

export interface CartItem {
  product: Product;
  quantity: number;
  discount: number; // custom discount in currency per item
  selectedImei?: string;
}

export interface HeldSale {
  id: string;
  name: string;
  items: CartItem[];
  customerId: string;
  date: string;
}

interface AppContextType {
  // State
  products: Product[];
  repairs: RepairTicket[];
  customers: Customer[];
  suppliers: Supplier[];
  sales: Sale[];
  purchases: Purchase[];
  expenses: Expense[];
  registerSession: CashRegisterSession;
  settings: AppSettings;
  notifications: AppNotification[];
  inventoryTransactions: InventoryTransaction[];
  
  // Cart
  cart: CartItem[];
  selectedCustomerId: string;
  setSelectedCustomerId: (id: string) => void;
  addToCart: (product: Product, quantity?: number, selectedImei?: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  updateCartDiscount: (productId: string, discount: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  
  // Held Sales
  heldSales: HeldSale[];
  holdCurrentSale: (name: string) => void;
  restoreHeldSale: (heldId: string) => void;
  deleteHeldSale: (heldId: string) => void;

  // Sales
  processSale: (data: {
    customerId: string;
    paymentMethod: PaymentMethod;
    splitPayments?: SplitPaymentDetail[];
    discountType: 'percent' | 'fixed';
    discountValue: number;
    paidAmount: number;
    note?: string;
    cashierName?: string;
  }) => Sale;
  refundSale: (saleId: string, reason: string) => void;

  // Products & Inventory
  addProduct: (product: Omit<Product, 'id'>) => Product;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  adjustStock: (productId: string, deltaOrExact: number, reason: string, type: 'in' | 'out' | 'adjustment') => void;

  // Repairs
  createRepairTicket: (ticketData: Omit<RepairTicket, 'id' | 'ticketNumber' | 'history'>) => RepairTicket;
  updateRepairStatus: (ticketId: string, newStatus: RepairStatus, note: string, updatedBy?: string) => void;
  updateRepairDetails: (ticketId: string, updates: Partial<RepairTicket>) => void;
  addRepairPart: (ticketId: string, part: RepairPart) => void;
  recordRepairPayment: (ticketId: string, amount: number) => void;

  // Customers & Suppliers
  addCustomer: (cust: Omit<Customer, 'id' | 'totalPurchases' | 'totalRepairs' | 'outstandingBalance' | 'createdAt'>) => Customer;
  updateCustomer: (id: string, updates: Partial<Customer>) => void;
  settleCustomerDebt: (customerId: string, amount: number, paymentMethod: 'cash' | 'card' | 'bank') => void;
  addSupplier: (sup: Omit<Supplier, 'id' | 'balance' | 'createdAt'>) => Supplier;
  updateSupplier: (id: string, updates: Partial<Supplier>) => void;
  paySupplier: (supplierId: string, amount: number, paymentMethod: 'cash' | 'bank') => void;

  // Purchases & Expenses
  createPurchase: (data: {
    supplierId: string;
    items: { productId: string; quantity: number; unitCost: number }[];
    paidAmount: number;
    notes?: string;
  }) => Purchase;
  addExpense: (expense: Omit<Expense, 'id'>) => void;
  deleteExpense: (id: string) => void;

  // Register
  openRegisterSession: (openingCash: number, notes?: string) => void;
  closeRegisterSession: (actualCash: number, notes?: string) => void;

  // Settings & Notifications
  updateSettings: (updates: Partial<AppSettings>) => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;

  // Backup & Reset
  exportBackupJson: () => string;
  importBackupJson: (jsonString: string) => boolean;
  resetToDemoData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

function getStorage<T>(key: string, fallback: T): T {
  try {
    const saved = localStorage.getItem(`techfix_${key}`);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error('Failed reading key', key, e);
  }
  return fallback;
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(() => getStorage('products', initialProducts));
  const [repairs, setRepairs] = useState<RepairTicket[]>(() => getStorage('repairs', initialRepairs));
  const [customers, setCustomers] = useState<Customer[]>(() => getStorage('customers', initialCustomers));
  const [suppliers, setSuppliers] = useState<Supplier[]>(() => getStorage('suppliers', initialSuppliers));
  const [sales, setSales] = useState<Sale[]>(() => getStorage('sales', initialSales));
  const [purchases, setPurchases] = useState<Purchase[]>(() => getStorage('purchases', initialPurchases));
  const [expenses, setExpenses] = useState<Expense[]>(() => getStorage('expenses', initialExpenses));
  const [registerSession, setRegisterSession] = useState<CashRegisterSession>(() => getStorage('register', initialRegisterSession));
  const [settings, setSettings] = useState<AppSettings>(() => getStorage('settings', initialSettings));
  const [notifications, setNotifications] = useState<AppNotification[]>(() => getStorage('notifs', initialNotifications));
  const [inventoryTransactions, setInventoryTransactions] = useState<InventoryTransaction[]>(() => getStorage('inv_tx', []));

  // POS State
  const [cart, setCart] = useState<CartItem[]>(() => getStorage('active_cart', []));
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('cust-walkin');
  const [heldSales, setHeldSales] = useState<HeldSale[]>(() => getStorage('held_sales', []));

  // Sync to localStorage
  useEffect(() => { localStorage.setItem('techfix_products', JSON.stringify(products)); }, [products]);
  useEffect(() => { localStorage.setItem('techfix_repairs', JSON.stringify(repairs)); }, [repairs]);
  useEffect(() => { localStorage.setItem('techfix_customers', JSON.stringify(customers)); }, [customers]);
  useEffect(() => { localStorage.setItem('techfix_suppliers', JSON.stringify(suppliers)); }, [suppliers]);
  useEffect(() => { localStorage.setItem('techfix_sales', JSON.stringify(sales)); }, [sales]);
  useEffect(() => { localStorage.setItem('techfix_purchases', JSON.stringify(purchases)); }, [purchases]);
  useEffect(() => { localStorage.setItem('techfix_expenses', JSON.stringify(expenses)); }, [expenses]);
  useEffect(() => { localStorage.setItem('techfix_register', JSON.stringify(registerSession)); }, [registerSession]);
  useEffect(() => { localStorage.setItem('techfix_settings', JSON.stringify(settings)); }, [settings]);
  useEffect(() => { localStorage.setItem('techfix_notifs', JSON.stringify(notifications)); }, [notifications]);
  useEffect(() => { localStorage.setItem('techfix_inv_tx', JSON.stringify(inventoryTransactions)); }, [inventoryTransactions]);
  useEffect(() => { localStorage.setItem('techfix_active_cart', JSON.stringify(cart)); }, [cart]);
  useEffect(() => { localStorage.setItem('techfix_held_sales', JSON.stringify(heldSales)); }, [heldSales]);

  // Cart operations
  const addToCart = (product: Product, quantity: number = 1, selectedImei?: string) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) => 
          item.product.id === product.id 
            ? { ...item, quantity: item.quantity + quantity, selectedImei: selectedImei || item.selectedImei } 
            : item
        );
      }
      return [...prev, { product, quantity, discount: 0, selectedImei }];
    });
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) => prev.map((item) => item.product.id === productId ? { ...item, quantity } : item));
  };

  const updateCartDiscount = (productId: string, discount: number) => {
    setCart((prev) => prev.map((item) => item.product.id === productId ? { ...item, discount: Math.max(0, discount) } : item));
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
  };

  // Hold / Recall Sale
  const holdCurrentSale = (name: string) => {
    if (cart.length === 0) return;
    const newHeld: HeldSale = {
      id: 'held-' + Date.now(),
      name: name || `Sale #${heldSales.length + 1}`,
      items: [...cart],
      customerId: selectedCustomerId,
      date: new Date().toISOString()
    };
    setHeldSales((prev) => [newHeld, ...prev]);
    clearCart();
  };

  const restoreHeldSale = (heldId: string) => {
    const found = heldSales.find((h) => h.id === heldId);
    if (found) {
      setCart(found.items);
      setSelectedCustomerId(found.customerId || 'cust-walkin');
      deleteHeldSale(heldId);
    }
  };

  const deleteHeldSale = (heldId: string) => {
    setHeldSales((prev) => prev.filter((h) => h.id !== heldId));
  };

  // Complete Sale
  const processSale = (data: {
    customerId: string;
    paymentMethod: PaymentMethod;
    splitPayments?: SplitPaymentDetail[];
    discountType: 'percent' | 'fixed';
    discountValue: number;
    paidAmount: number;
    note?: string;
    cashierName?: string;
  }): Sale => {
    const cust = customers.find((c) => c.id === data.customerId) || customers[0];

    const saleItems: SaleItem[] = cart.map((item) => {
      const lineTotal = Math.max(0, (item.product.sellingPrice - item.discount) * item.quantity);
      return {
        productId: item.product.id,
        productName: item.product.name,
        productNameAr: item.product.nameAr,
        sku: item.product.sku,
        barcode: item.product.barcode,
        unitPrice: item.product.sellingPrice,
        purchasePrice: item.product.purchasePrice,
        quantity: item.quantity,
        discount: item.discount,
        total: lineTotal,
        imeiOrSerial: item.selectedImei
      };
    });

    const subtotal = saleItems.reduce((sum, item) => sum + item.total, 0);
    const discountAmount = data.discountType === 'percent' 
      ? (subtotal * data.discountValue) / 100 
      : data.discountValue;
    const afterDiscount = Math.max(0, subtotal - discountAmount);
    const taxAmount = settings.enableTax ? (afterDiscount * settings.taxRate) / 100 : 0;
    const total = afterDiscount + taxAmount;
    const changeAmount = Math.max(0, data.paidAmount - total);

    const invoiceNumber = settings.invoicePrefix + (sales.length + 1001);

    const newSale: Sale = {
      id: 'sale-' + Date.now(),
      invoiceNumber,
      customerId: cust.id,
      customerName: cust.name,
      customerPhone: cust.phone,
      items: saleItems,
      subtotal,
      discountType: data.discountType,
      discountValue: data.discountValue,
      discountAmount,
      taxRate: settings.enableTax ? settings.taxRate : 0,
      taxAmount,
      total,
      paidAmount: data.paidAmount,
      changeAmount,
      paymentMethod: data.paymentMethod,
      splitPayments: data.splitPayments,
      cashierId: 'cashier',
      cashierName: data.cashierName || 'Cashier',
      status: 'completed',
      note: data.note,
      createdAt: new Date().toISOString()
    };

    // Deduct stock and log transactions
    setProducts((prev) => 
      prev.map((prod) => {
        const cartItem = cart.find((ci) => ci.product.id === prod.id);
        if (cartItem) {
          const newQty = Math.max(0, prod.quantity - cartItem.quantity);
          // remove imei if used
          let newImeis = prod.imeiList;
          if (cartItem.selectedImei && prod.imeiList) {
            newImeis = prod.imeiList.filter((im) => im !== cartItem.selectedImei);
          }
          return { ...prod, quantity: newQty, imeiList: newImeis };
        }
        return prod;
      })
    );

    // Update customer stats
    setCustomers((prev) => 
      prev.map((c) => {
        if (c.id === cust.id) {
          return {
            ...c,
            totalPurchases: c.totalPurchases + total
          };
        }
        return c;
      })
    );

    // Update cash register session
    if (data.paymentMethod === 'cash') {
      const netCash = Math.min(data.paidAmount, total);
      setRegisterSession((prev) => ({
        ...prev,
        cashSales: prev.cashSales + netCash,
        expectedCash: prev.expectedCash + netCash
      }));
    } else if (data.paymentMethod === 'split' && data.splitPayments) {
      const cashPart = data.splitPayments.find((sp) => sp.method === 'cash')?.amount || 0;
      setRegisterSession((prev) => ({
        ...prev,
        cashSales: prev.cashSales + cashPart,
        expectedCash: prev.expectedCash + cashPart
      }));
    }

    setSales((prev) => [newSale, ...prev]);
    clearCart();
    return newSale;
  };

  // Refund Sale
  const refundSale = (saleId: string, reason: string) => {
    const sale = sales.find((s) => s.id === saleId);
    if (!sale || sale.status === 'refunded') return;

    // Restore stock
    setProducts((prev) => 
      prev.map((prod) => {
        const item = sale.items.find((si) => si.productId === prod.id);
        if (item) {
          return { ...prod, quantity: prod.quantity + item.quantity };
        }
        return prod;
      })
    );

    // Mark sale refunded
    setSales((prev) => 
      prev.map((s) => 
        s.id === saleId 
          ? { ...s, status: 'refunded', refundReason: reason, refundDate: new Date().toISOString() } 
          : s
      )
    );

    // Adjust cash register if was cash
    if (sale.paymentMethod === 'cash') {
      setRegisterSession((prev) => ({
        ...prev,
        cashSales: Math.max(0, prev.cashSales - sale.total),
        expectedCash: Math.max(0, prev.expectedCash - sale.total)
      }));
    }
  };

  // Products CRUD
  const addProduct = (prodData: Omit<Product, 'id'>): Product => {
    const newProduct: Product = {
      ...prodData,
      id: 'prod-' + Date.now()
    };
    setProducts((prev) => [newProduct, ...prev]);
    return newProduct;
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts((prev) => prev.map((p) => p.id === id ? { ...p, ...updates } : p));
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const adjustStock = (productId: string, quantity: number, reason: string, type: 'in' | 'out' | 'adjustment') => {
    const prod = products.find((p) => p.id === productId);
    if (!prod) return;

    let newStock = prod.quantity;
    if (type === 'in') newStock = prod.quantity + quantity;
    else if (type === 'out') newStock = Math.max(0, prod.quantity - quantity);
    else if (type === 'adjustment') newStock = Math.max(0, quantity);

    const tx: InventoryTransaction = {
      id: 'tx-' + Date.now(),
      productId,
      productName: prod.name,
      type,
      quantity,
      previousStock: prod.quantity,
      newStock,
      unitCost: prod.purchasePrice,
      date: new Date().toISOString(),
      reason,
      createdBy: 'User'
    };

    setProducts((prev) => prev.map((p) => p.id === productId ? { ...p, quantity: newStock } : p));
    setInventoryTransactions((prev) => [tx, ...prev]);
  };

  // Repairs
  const createRepairTicket = (ticketData: Omit<RepairTicket, 'id' | 'ticketNumber' | 'history'>): RepairTicket => {
    const ticketNumber = settings.repairPrefix + (repairs.length + 1).toString().padStart(3, '0');
    const newTicket: RepairTicket = {
      ...ticketData,
      id: 'rep-' + Date.now(),
      ticketNumber,
      history: [
        {
          status: ticketData.status || 'received',
          date: new Date().toISOString(),
          note: 'Ticket created and device checked in',
          updatedBy: ticketData.technicianName || 'Reception'
        }
      ]
    };

    // Update customer repair count & debt if remaining balance exists
    setCustomers((prev) => 
      prev.map((c) => {
        if (c.id === ticketData.customerId) {
          return {
            ...c,
            totalRepairs: c.totalRepairs + 1,
            outstandingBalance: c.outstandingBalance + (ticketData.remainingBalance || 0)
          };
        }
        return c;
      })
    );

    // If deposit was paid in cash, record in register
    if (ticketData.deposit > 0) {
      setRegisterSession((prev) => ({
        ...prev,
        cashRepairs: prev.cashRepairs + ticketData.deposit,
        expectedCash: prev.expectedCash + ticketData.deposit
      }));
    }

    setRepairs((prev) => [newTicket, ...prev]);
    return newTicket;
  };

  const updateRepairStatus = (ticketId: string, newStatus: RepairStatus, note: string, updatedBy: string = 'Staff') => {
    setRepairs((prev) => 
      prev.map((ticket) => {
        if (ticket.id === ticketId) {
          const completedDate = (newStatus === 'ready_for_pickup' || newStatus === 'delivered') 
            ? new Date().toISOString() 
            : ticket.completedDate;
          return {
            ...ticket,
            status: newStatus,
            completedDate,
            history: [
              ...ticket.history,
              {
                status: newStatus,
                date: new Date().toISOString(),
                note,
                updatedBy
              }
            ]
          };
        }
        return ticket;
      })
    );
  };

  const updateRepairDetails = (ticketId: string, updates: Partial<RepairTicket>) => {
    setRepairs((prev) => prev.map((t) => t.id === ticketId ? { ...t, ...updates } : t));
  };

  const addRepairPart = (ticketId: string, part: RepairPart) => {
    setRepairs((prev) => 
      prev.map((t) => {
        if (t.id === ticketId) {
          const updatedParts = [...t.requiredParts, part];
          const partsCost = updatedParts.reduce((sum, p) => sum + p.price * p.quantity, 0);
          const newFinalCost = Math.max(t.finalCost, partsCost);
          const newBalance = Math.max(0, newFinalCost - t.deposit);
          return {
            ...t,
            requiredParts: updatedParts,
            finalCost: newFinalCost,
            remainingBalance: newBalance
          };
        }
        return t;
      })
    );

    // If linked to a product, deduct 1 from stock
    if (part.productId) {
      adjustStock(part.productId, part.quantity, `Used in repair ticket ${ticketId}`, 'out');
    }
  };

  const recordRepairPayment = (ticketId: string, amount: number) => {
    setRepairs((prev) => 
      prev.map((t) => {
        if (t.id === ticketId) {
          const newDeposit = t.deposit + amount;
          const newRemaining = Math.max(0, t.finalCost - newDeposit);
          return {
            ...t,
            deposit: newDeposit,
            remainingBalance: newRemaining,
            paymentStatus: newRemaining === 0 ? 'paid' : 'partial'
          };
        }
        return t;
      })
    );

    // Register cash
    setRegisterSession((prev) => ({
      ...prev,
      cashRepairs: prev.cashRepairs + amount,
      expectedCash: prev.expectedCash + amount
    }));
  };

  // Customers
  const addCustomer = (custData: Omit<Customer, 'id' | 'totalPurchases' | 'totalRepairs' | 'outstandingBalance' | 'createdAt'>): Customer => {
    const newCust: Customer = {
      ...custData,
      id: 'cust-' + Date.now(),
      totalPurchases: 0,
      totalRepairs: 0,
      outstandingBalance: 0,
      createdAt: new Date().toISOString()
    };
    setCustomers((prev) => [newCust, ...prev]);
    return newCust;
  };

  const updateCustomer = (id: string, updates: Partial<Customer>) => {
    setCustomers((prev) => prev.map((c) => c.id === id ? { ...c, ...updates } : c));
  };

  const settleCustomerDebt = (customerId: string, amount: number, paymentMethod: 'cash' | 'card' | 'bank') => {
    setCustomers((prev) => 
      prev.map((c) => {
        if (c.id === customerId) {
          return {
            ...c,
            outstandingBalance: Math.max(0, c.outstandingBalance - amount)
          };
        }
        return c;
      })
    );

    if (paymentMethod === 'cash') {
      setRegisterSession((prev) => ({
        ...prev,
        customerDebtCash: prev.customerDebtCash + amount,
        expectedCash: prev.expectedCash + amount
      }));
    }
  };

  // Suppliers
  const addSupplier = (supData: Omit<Supplier, 'id' | 'balance' | 'createdAt'>): Supplier => {
    const newSup: Supplier = {
      ...supData,
      id: 'sup-' + Date.now(),
      balance: 0,
      createdAt: new Date().toISOString()
    };
    setSuppliers((prev) => [newSup, ...prev]);
    return newSup;
  };

  const updateSupplier = (id: string, updates: Partial<Supplier>) => {
    setSuppliers((prev) => prev.map((s) => s.id === id ? { ...s, ...updates } : s));
  };

  const paySupplier = (supplierId: string, amount: number, paymentMethod: 'cash' | 'bank') => {
    setSuppliers((prev) => 
      prev.map((s) => {
        if (s.id === supplierId) {
          return {
            ...s,
            balance: Math.max(0, s.balance - amount)
          };
        }
        return s;
      })
    );

    if (paymentMethod === 'cash') {
      setRegisterSession((prev) => ({
        ...prev,
        supplierCashPaid: prev.supplierCashPaid + amount,
        expectedCash: Math.max(0, prev.expectedCash - amount)
      }));
    }
  };

  // Purchases
  const createPurchase = (data: {
    supplierId: string;
    items: { productId: string; quantity: number; unitCost: number }[];
    paidAmount: number;
    notes?: string;
  }): Purchase => {
    const sup = suppliers.find((s) => s.id === data.supplierId) || suppliers[0];
    const totalAmount = data.items.reduce((sum, it) => sum + it.quantity * it.unitCost, 0);
    const remainingAmount = Math.max(0, totalAmount - data.paidAmount);

    const purchaseItems = data.items.map((it) => {
      const prod = products.find((p) => p.id === it.productId);
      return {
        productId: it.productId,
        productName: prod ? prod.name : 'Item',
        quantity: it.quantity,
        unitCost: it.unitCost,
        total: it.quantity * it.unitCost
      };
    });

    const newPurchase: Purchase = {
      id: 'pur-' + Date.now(),
      invoiceNumber: 'PO-' + (purchases.length + 501),
      supplierId: sup.id,
      supplierName: sup.name,
      items: purchaseItems,
      totalAmount,
      paidAmount: data.paidAmount,
      remainingAmount,
      status: 'received',
      notes: data.notes,
      createdAt: new Date().toISOString()
    };

    // Auto restock products & update purchase price
    setProducts((prev) => 
      prev.map((p) => {
        const item = data.items.find((it) => it.productId === p.id);
        if (item) {
          return {
            ...p,
            quantity: p.quantity + item.quantity,
            purchasePrice: item.unitCost
          };
        }
        return p;
      })
    );

    // Increase supplier balance if remaining > 0
    if (remainingAmount > 0) {
      setSuppliers((prev) => 
        prev.map((s) => s.id === sup.id ? { ...s, balance: s.balance + remainingAmount } : s)
      );
    }

    setPurchases((prev) => [newPurchase, ...prev]);
    return newPurchase;
  };

  // Expenses
  const addExpense = (expData: Omit<Expense, 'id'>) => {
    const newExp: Expense = {
      ...expData,
      id: 'exp-' + Date.now()
    };

    if (expData.paymentMethod === 'cash') {
      setRegisterSession((prev) => ({
        ...prev,
        cashExpenses: prev.cashExpenses + expData.amount,
        expectedCash: Math.max(0, prev.expectedCash - expData.amount)
      }));
    }

    setExpenses((prev) => [newExp, ...prev]);
  };

  const deleteExpense = (id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  };

  // Register Sessions
  const openRegisterSession = (openingCash: number, notes?: string) => {
    setRegisterSession({
      id: 'reg-' + Date.now(),
      openedAt: new Date().toISOString(),
      openingCash,
      cashSales: 0,
      cashRepairs: 0,
      customerDebtCash: 0,
      cashExpenses: 0,
      supplierCashPaid: 0,
      expectedCash: openingCash,
      cashierName: 'Layla Mansour',
      status: 'open',
      notes
    });
  };

  const closeRegisterSession = (actualCash: number, notes?: string) => {
    const difference = actualCash - registerSession.expectedCash;
    setRegisterSession((prev) => ({
      ...prev,
      closedAt: new Date().toISOString(),
      actualCash,
      difference,
      status: 'closed',
      notes: notes ? `${prev.notes || ''} | ${notes}` : prev.notes
    }));
  };

  // Settings & Notifications
  const updateSettings = (updates: Partial<AppSettings>) => {
    setSettings((prev) => ({ ...prev, ...updates }));
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
  };

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  // Backup & Reset
  const exportBackupJson = () => {
    const dump = {
      timestamp: new Date().toISOString(),
      products,
      repairs,
      customers,
      suppliers,
      sales,
      purchases,
      expenses,
      registerSession,
      settings,
      notifications,
      inventoryTransactions
    };
    return JSON.stringify(dump, null, 2);
  };

  const importBackupJson = (jsonString: string): boolean => {
    try {
      const data = JSON.parse(jsonString);
      if (data.products) setProducts(data.products);
      if (data.repairs) setRepairs(data.repairs);
      if (data.customers) setCustomers(data.customers);
      if (data.suppliers) setSuppliers(data.suppliers);
      if (data.sales) setSales(data.sales);
      if (data.purchases) setPurchases(data.purchases);
      if (data.expenses) setExpenses(data.expenses);
      if (data.settings) setSettings(data.settings);
      return true;
    } catch (e) {
      console.error('Failed to import backup', e);
      return false;
    }
  };

  const resetToDemoData = () => {
    setProducts(initialProducts);
    setRepairs(initialRepairs);
    setCustomers(initialCustomers);
    setSuppliers(initialSuppliers);
    setSales(initialSales);
    setPurchases(initialPurchases);
    setExpenses(initialExpenses);
    setRegisterSession(initialRegisterSession);
    setSettings(initialSettings);
    setNotifications(initialNotifications);
    setCart([]);
    setHeldSales([]);
    localStorage.clear();
  };

  return (
    <AppContext.Provider value={{
      products,
      repairs,
      customers,
      suppliers,
      sales,
      purchases,
      expenses,
      registerSession,
      settings,
      notifications,
      inventoryTransactions,
      cart,
      selectedCustomerId,
      setSelectedCustomerId,
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
      refundSale,
      addProduct,
      updateProduct,
      deleteProduct,
      adjustStock,
      createRepairTicket,
      updateRepairStatus,
      updateRepairDetails,
      addRepairPart,
      recordRepairPayment,
      addCustomer,
      updateCustomer,
      settleCustomerDebt,
      addSupplier,
      updateSupplier,
      paySupplier,
      createPurchase,
      addExpense,
      deleteExpense,
      openRegisterSession,
      closeRegisterSession,
      updateSettings,
      markNotificationAsRead,
      markAllNotificationsAsRead,
      exportBackupJson,
      importBackupJson,
      resetToDemoData
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
