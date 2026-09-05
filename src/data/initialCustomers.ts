import { Customer } from '../types';

export const initialCustomers: Customer[] = [
  {
    id: 'cust-walkin',
    name: 'Walk-in Customer (عميل نقدي)',
    phone: '0590000000',
    whatsapp: '970590000000',
    email: 'walkin@techfix.local',
    address: 'Store Front',
    notes: 'General default walk-in customer for quick checkout',
    totalPurchases: 4250,
    totalRepairs: 8,
    outstandingBalance: 0,
    createdAt: '2026-01-01'
  },
  {
    id: 'cust-001',
    name: 'Ahmad Al-Qadi (أحمد القاضي)',
    phone: '0599123456',
    whatsapp: '970599123456',
    email: 'ahmad.qadi@gmail.com',
    address: 'Main Street, Al-Masyoun, Ramallah',
    notes: 'Loyal customer, owns graphic design agency, frequently buys storage and repairs laptops',
    totalPurchases: 2840,
    totalRepairs: 4,
    outstandingBalance: 150,
    createdAt: '2026-02-10'
  },
  {
    id: 'cust-002',
    name: 'Sara Barghouthi (سارة البرغوثي)',
    phone: '0598765432',
    whatsapp: '970598765432',
    email: 'sara.b@outlook.com',
    address: 'Al-Tira, Ramallah',
    notes: 'iPhone user, prefers genuine Apple accessories',
    totalPurchases: 1420,
    totalRepairs: 2,
    outstandingBalance: 0,
    createdAt: '2026-03-01'
  },
  {
    id: 'cust-003',
    name: 'Tareq Natsheh (طارق النتشة)',
    phone: '0569882211',
    whatsapp: '970569882211',
    email: 'tareq.natsheh@yahoo.com',
    address: 'Ein Sara, Hebron',
    notes: 'PC gamer and computer enthusiast, buys custom parts',
    totalPurchases: 3600,
    totalRepairs: 3,
    outstandingBalance: 280,
    createdAt: '2026-04-15'
  },
  {
    id: 'cust-004',
    name: 'Eng. Mahmoud Zeid (م. محمود زيد)',
    phone: '0592334455',
    whatsapp: '970592334455',
    email: 'm.zeid@consulting.ps',
    address: 'Rafidia, Nablus',
    notes: 'IT manager at local school, bulk purchases',
    totalPurchases: 5400,
    totalRepairs: 6,
    outstandingBalance: 450,
    createdAt: '2026-05-20'
  },
  {
    id: 'cust-005',
    name: 'Noor Odeh (نور عودة)',
    phone: '0595112233',
    whatsapp: '970595112233',
    email: 'noor.odeh@gmail.com',
    address: 'Bethlehem Center',
    notes: 'Student, university discount',
    totalPurchases: 620,
    totalRepairs: 1,
    outstandingBalance: 0,
    createdAt: '2026-06-12'
  }
];
