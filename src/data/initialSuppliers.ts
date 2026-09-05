import { Supplier } from '../types';

export const initialSuppliers: Supplier[] = [
  {
    id: 'sup-001',
    name: 'SmartLine Distribution Co.',
    contactPerson: 'Ziad Masri (زياد المصري)',
    phone: '022987110',
    whatsapp: '970599001122',
    email: 'sales@smartline-dist.ps',
    address: 'Industrial Zone, Beitunia',
    notes: 'Official authorized distributor for Anker, Baseus, and Joyroom accessories',
    balance: 1450,
    createdAt: '2025-11-01'
  },
  {
    id: 'sup-002',
    name: 'iTech Wholesale Parts Ltd.',
    contactPerson: 'Rami Jabari (رامي الجعبري)',
    phone: '022234567',
    whatsapp: '970599443322',
    email: 'rami@itech-parts.com',
    address: 'Bab Al-Zawiya, Hebron',
    notes: 'Specializes in OEM iPhone screens, batteries, cameras, and Apple genuine accessories',
    balance: 850,
    createdAt: '2025-12-15'
  },
  {
    id: 'sup-003',
    name: 'Global Tech Imports',
    contactPerson: 'Hassan Darwish (حسن درويش)',
    phone: '092389900',
    whatsapp: '970569778899',
    email: 'orders@globaltech.ps',
    address: 'Faisal Street, Nablus',
    notes: 'Direct importer of audio gear, Sony, Logitech, and networking gear',
    balance: 0,
    createdAt: '2026-01-20'
  },
  {
    id: 'sup-004',
    name: 'CompTech Hardware Solutions',
    contactPerson: 'Omar Khalidi (عمر الخالدي)',
    phone: '022409811',
    whatsapp: '970598112233',
    email: 'supply@comptech-solutions.ps',
    address: 'Al-Irsal Street, Ramallah',
    notes: 'Kingston, Crucial, Dell and HP parts, RAM, SSDs, and notebook chargers',
    balance: 2100,
    createdAt: '2026-02-05'
  }
];
