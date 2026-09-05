import { Category, Brand } from '../types';

export const initialCategories: Category[] = [
  { id: 'all', name: 'All Categories', nameAr: 'جميع الفئات', icon: 'Grid' },
  { id: 'chargers', name: 'Chargers & Adapters', nameAr: 'شواحن ومحولات', icon: 'Zap' },
  { id: 'cables', name: 'Cables & Hubs', nameAr: 'كوابل ووصلات', icon: 'Cable' },
  { id: 'powerbanks', name: 'Power Banks', nameAr: 'بنوك طاقة', icon: 'BatteryCharging' },
  { id: 'audio', name: 'Earphones & Audio', nameAr: 'سماعات وصوتيات', icon: 'Headphones' },
  { id: 'cases', name: 'Cases & Protection', nameAr: 'كفرات وحماية', icon: 'Shield' },
  { id: 'storage', name: 'SSDs & Storage', nameAr: 'أقراص وتخزين', icon: 'HardDrive' },
  { id: 'ram', name: 'RAM & Memory', nameAr: 'ذاكرة عشوائية (رام)', icon: 'Cpu' },
  { id: 'peripherals', name: 'Mice & Keyboards', nameAr: 'فأرات ولوحات مفاتيح', icon: 'Mouse' },
  { id: 'laptop_power', name: 'Laptop Chargers', nameAr: 'شواحن لابتوب', icon: 'Laptop' },
  { id: 'parts', name: 'Batteries & Repair Parts', nameAr: 'بطاريات وقطع غيار', icon: 'Wrench' },
  { id: 'used_devices', name: 'Used Devices (Phones & PCs)', nameAr: 'أجهزة مستعملة', icon: 'Smartphone' },
  { id: 'networking', name: 'Networking & WiFi', nameAr: 'شبكات وراوترات', icon: 'Wifi' },
];

export const initialBrands: Brand[] = [
  { id: 'apple', name: 'Apple' },
  { id: 'samsung', name: 'Samsung' },
  { id: 'anker', name: 'Anker' },
  { id: 'baseus', name: 'Baseus' },
  { id: 'kingston', name: 'Kingston' },
  { id: 'crucial', name: 'Crucial' },
  { id: 'logitech', name: 'Logitech' },
  { id: 'dell', name: 'Dell' },
  { id: 'hp', name: 'HP' },
  { id: 'lenovo', name: 'Lenovo' },
  { id: 'redragon', name: 'Redragon' },
  { id: 'tplink', name: 'TP-Link' },
  { id: 'sandisk', name: 'SanDisk' },
  { id: 'sony', name: 'Sony' },
];
