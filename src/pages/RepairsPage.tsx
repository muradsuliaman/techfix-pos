import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import { formatCurrency, formatDate } from '../utils/formatters';
import { RepairTicket, RepairStatus } from '../types';
import { StatusBadge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { RepairIntakeReceiptModal } from '../components/receipts/RepairIntakeReceiptModal';
import { 
  Wrench, 
  Plus, 
  Search, 
  Filter, 
  Printer, 
  Phone, 
  MessageSquare, 
  CheckCircle2, 
  Clock, 
  ExternalLink,
  ChevronRight,
  Sparkles,
  ArrowRight
} from 'lucide-react';

export const RepairsPage: React.FC = () => {
  const { repairs, createRepairTicket, updateRepairStatus, addRepairPart, recordRepairPayment, customers, settings } = useApp();
  const { t, language } = useLanguage();
  const { showToast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // New Ticket Modal
  const [newModalOpen, setNewModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    customerId: 'cust-walkin',
    customerName: '',
    customerPhone: '',
    deviceType: 'smartphone' as const,
    brand: '',
    model: '',
    serialNumber: '',
    imei1: '',
    imei2: '',
    color: '',
    condition: '',
    accessoriesReceived: '',
    problemReported: '',
    estimatedCost: 0,
    deposit: 0,
    expectedCompletionDate: '',
    warrantyPeriod: '90 Days',
    technicianName: 'Samer Haddad'
  });

  // Ticket Detail Drawer / Modal
  const [selectedTicket, setSelectedTicket] = useState<RepairTicket | null>(null);
  const [statusNote, setStatusNote] = useState('');
  const [newPartName, setNewPartName] = useState('');
  const [newPartPrice, setNewPartPrice] = useState<number>(0);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);

  // Intake Print Modal
  const [printTicket, setPrintTicket] = useState<RepairTicket | null>(null);

  const statuses: { id: RepairStatus | 'all'; label: string }[] = [
    { id: 'all', label: language === 'ar' ? 'الكل' : 'All Tickets' },
    { id: 'received', label: t('status_received') },
    { id: 'diagnosing', label: t('status_diagnosing') },
    { id: 'waiting_approval', label: t('status_waiting_approval') },
    { id: 'waiting_parts', label: t('status_waiting_parts') },
    { id: 'in_repair', label: t('status_in_repair') },
    { id: 'ready_for_pickup', label: t('status_ready_for_pickup') },
    { id: 'delivered', label: t('status_delivered') },
    { id: 'cancelled', label: t('status_cancelled') },
  ];

  const filteredRepairs = repairs.filter((r) => {
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    const q = searchQuery.toLowerCase().trim();
    if (!q) return matchesStatus;

    return matchesStatus && (
      r.ticketNumber.toLowerCase().includes(q) ||
      r.customerName.toLowerCase().includes(q) ||
      r.customerPhone.includes(q) ||
      r.brand.toLowerCase().includes(q) ||
      r.model.toLowerCase().includes(q) ||
      (r.imei1 && r.imei1.includes(q))
    );
  });

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.brand || !formData.model || !formData.problemReported) {
      showToast('Please fill in required device fields', 'error');
      return;
    }

    const cust = customers.find((c) => c.id === formData.customerId) || customers[0];

    const newTicket = createRepairTicket({
      customerId: cust.id,
      customerName: formData.customerName || cust.name,
      customerPhone: formData.customerPhone || cust.phone,
      customerWhatsapp: '970' + (formData.customerPhone || cust.phone).replace(/^0+/, ''),
      deviceType: formData.deviceType,
      brand: formData.brand,
      model: formData.model,
      serialNumber: formData.serialNumber,
      imei1: formData.imei1,
      imei2: formData.imei2,
      color: formData.color,
      condition: formData.condition,
      accessoriesReceived: formData.accessoriesReceived,
      problemReported: formData.problemReported,
      requiredParts: [],
      estimatedCost: formData.estimatedCost,
      finalCost: formData.estimatedCost,
      deposit: formData.deposit,
      remainingBalance: Math.max(0, formData.estimatedCost - formData.deposit),
      technicianName: formData.technicianName,
      receivedDate: new Date().toISOString(),
      expectedCompletionDate: formData.expectedCompletionDate,
      warrantyPeriod: formData.warrantyPeriod,
      status: 'received',
      paymentStatus: formData.deposit >= formData.estimatedCost ? 'paid' : formData.deposit > 0 ? 'partial' : 'unpaid'
    });

    setNewModalOpen(false);
    setPrintTicket(newTicket);
    showToast(`Created ticket ${newTicket.ticketNumber}`, 'success');
  };

  return (
    <div className="space-y-6">
      {/* Top Header Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Wrench className="w-5 h-5 text-blue-600" />
            <span>{t('repairs')}</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {language === 'ar' ? 'إدارة ورشة الصيانة، الفحص، وتسليم الأجهزة' : 'Manage device intake, diagnostic lifecycle, and releases'}
          </p>
        </div>

        <button
          onClick={() => setNewModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs md:text-sm font-bold shadow-lg shadow-blue-500/25 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>{t('new_repair')}</span>
        </button>
      </div>

      {/* Search & Status Filters */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3 shadow-sm">
        <div className="relative">
          <Search className="absolute start-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={language === 'ar' ? 'ابحث برقم التذكرة، اسم العميل، الهاتف، الموديل، أو الـ IMEI...' : 'Search by ticket #, customer, phone, model, or IMEI...'}
            className="w-full ps-9 pe-4 py-2.5 bg-slate-100 dark:bg-slate-800 border-none rounded-2xl text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>

        {/* Status Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {statuses.map((st) => {
            const isSelected = statusFilter === st.id;
            const count = st.id === 'all' 
              ? repairs.length 
              : repairs.filter((r) => r.status === st.id).length;

            return (
              <button
                key={st.id}
                onClick={() => setStatusFilter(st.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex-shrink-0 flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <span>{st.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Repairs Table / Cards */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-start text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 text-slate-500 font-semibold">
                <th className="text-start p-4">Ticket</th>
                <th className="text-start p-4">Customer</th>
                <th className="text-start p-4">Device</th>
                <th className="text-start p-4">Reported Problem</th>
                <th className="text-center p-4">Cost / Due</th>
                <th className="text-center p-4">Status</th>
                <th className="text-end p-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredRepairs.map((ticket) => (
                <tr 
                  key={ticket.id}
                  className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors cursor-pointer"
                  onClick={() => setSelectedTicket(ticket)}
                >
                  <td className="p-4 font-mono font-extrabold text-blue-600">
                    {ticket.ticketNumber}
                    <div className="text-[10px] text-slate-400 font-sans font-normal mt-0.5">
                      {formatDate(ticket.receivedDate).split(',')[0]}
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="font-bold text-slate-900 dark:text-white block">{ticket.customerName}</span>
                    <span className="text-[11px] text-slate-500 font-mono">{ticket.customerPhone}</span>
                  </td>
                  <td className="p-4">
                    <span className="font-bold text-slate-900 dark:text-white capitalize block">
                      {ticket.brand} {ticket.model}
                    </span>
                    <span className="text-[10px] text-slate-400 capitalize">
                      {ticket.deviceType} &bull; {ticket.color}
                    </span>
                  </td>
                  <td className="p-4 max-w-xs truncate text-slate-600 dark:text-slate-300">
                    {ticket.problemReported}
                  </td>
                  <td className="p-4 text-center">
                    <span className="font-extrabold font-mono text-slate-900 dark:text-white block">
                      {formatCurrency(ticket.finalCost || ticket.estimatedCost, settings.currencySymbol, language)}
                    </span>
                    {ticket.remainingBalance > 0 ? (
                      <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400">
                        Due: {formatCurrency(ticket.remainingBalance, settings.currencySymbol, language)}
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-emerald-600">Paid</span>
                    )}
                  </td>
                  <td className="p-4 text-center">
                    <StatusBadge status={ticket.status} />
                  </td>
                  <td className="p-4 text-end" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setPrintTicket(ticket)}
                        title="Print Claim Receipt"
                        className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                      >
                        <Printer className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setSelectedTicket(ticket)}
                        className="px-3 py-1.5 bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 rounded-xl font-bold text-xs hover:bg-blue-100"
                      >
                        Manage
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ticket Details & Lifecycle Drawer Modal */}
      {selectedTicket && (
        <Modal
          isOpen={!!selectedTicket}
          onClose={() => setSelectedTicket(null)}
          title={`Manage Ticket ${selectedTicket.ticketNumber}`}
          maxWidth="3xl"
        >
          <div className="space-y-6">
            {/* Status Workflow Stepper */}
            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Repair Progression
                </span>
                <StatusBadge status={selectedTicket.status} />
              </div>

              {/* Quick Status Updater */}
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                <select
                  value={selectedTicket.status}
                  onChange={(e) => {
                    const newSt = e.target.value as RepairStatus;
                    const note = prompt(language === 'ar' ? 'ملاحظة التحديث:' : 'Status change note:') || 'Status updated';
                    updateRepairStatus(selectedTicket.id, newSt, note);
                    setSelectedTicket({ ...selectedTicket, status: newSt });
                    showToast(`Updated to ${newSt}`, 'success');
                  }}
                  className="px-3 py-2 text-xs font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"
                >
                  {statuses.filter((s) => s.id !== 'all').map((st) => (
                    <option key={st.id} value={st.id}>{st.label}</option>
                  ))}
                </select>

                <button
                  onClick={() => {
                    const nextMap: Record<RepairStatus, RepairStatus> = {
                      received: 'diagnosing',
                      diagnosing: 'waiting_approval',
                      waiting_approval: 'in_repair',
                      waiting_parts: 'in_repair',
                      in_repair: 'ready_for_pickup',
                      ready_for_pickup: 'delivered',
                      delivered: 'delivered',
                      cancelled: 'cancelled'
                    };
                    const nextSt = nextMap[selectedTicket.status];
                    if (nextSt !== selectedTicket.status) {
                      updateRepairStatus(selectedTicket.id, nextSt, 'Advanced to next stage');
                      setSelectedTicket({ ...selectedTicket, status: nextSt });
                      showToast(`Advanced to ${nextSt}`, 'success');
                    }
                  }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow transition-colors flex items-center gap-1.5"
                >
                  <span>Advance Stage</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Device & Customer Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                <span className="text-slate-400 block text-[10px]">Customer</span>
                <span className="font-bold text-slate-900 dark:text-white">{selectedTicket.customerName}</span>
                <span className="text-slate-500 font-mono block">{selectedTicket.customerPhone}</span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                <span className="text-slate-400 block text-[10px]">Device Model</span>
                <span className="font-bold text-slate-900 dark:text-white">{selectedTicket.brand} {selectedTicket.model}</span>
                <span className="text-slate-500 capitalize block">{selectedTicket.color}</span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                <span className="text-slate-400 block text-[10px]">Serial / IMEI</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white block truncate">
                  {selectedTicket.imei1 || selectedTicket.serialNumber || 'N/A'}
                </span>
              </div>
            </div>

            {/* Problem & Diagnosis */}
            <div className="space-y-2 text-xs">
              <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 rounded-xl">
                <span className="font-bold text-amber-800 dark:text-amber-400 block mb-1">Customer Problem:</span>
                <p className="text-slate-700 dark:text-slate-300">{selectedTicket.problemReported}</p>
              </div>
              {selectedTicket.diagnosis && (
                <div className="p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/50 rounded-xl">
                  <span className="font-bold text-blue-800 dark:text-blue-400 block mb-1">Technician Diagnosis:</span>
                  <p className="text-slate-700 dark:text-slate-300">{selectedTicket.diagnosis}</p>
                </div>
              )}
            </div>

            {/* Repair Parts Attached */}
            <div>
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                Parts Installed & Used
              </h4>
              <div className="space-y-1.5">
                {selectedTicket.requiredParts.map((p, i) => (
                  <div key={i} className="flex justify-between items-center p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs">
                    <span className="font-medium text-slate-900 dark:text-white">{p.name} (x{p.quantity})</span>
                    <span className="font-mono font-bold text-blue-600">{formatCurrency(p.price * p.quantity, settings.currencySymbol)}</span>
                  </div>
                ))}
              </div>

              {/* Add Part Inline */}
              <div className="flex gap-2 mt-2">
                <input
                  type="text"
                  placeholder="Add replacement part name..."
                  value={newPartName}
                  onChange={(e) => setNewPartName(e.target.value)}
                  className="flex-1 px-3 py-1.5 text-xs bg-slate-100 dark:bg-slate-800 rounded-xl outline-none"
                />
                <input
                  type="number"
                  placeholder="Price"
                  value={newPartPrice || ''}
                  onChange={(e) => setNewPartPrice(parseFloat(e.target.value) || 0)}
                  className="w-24 px-3 py-1.5 text-xs bg-slate-100 dark:bg-slate-800 rounded-xl outline-none font-mono text-end"
                />
                <button
                  onClick={() => {
                    if (!newPartName.trim()) return;
                    addRepairPart(selectedTicket.id, {
                      name: newPartName.trim(),
                      cost: newPartPrice * 0.6,
                      price: newPartPrice,
                      quantity: 1
                    });
                    setNewPartName('');
                    setNewPartPrice(0);
                    showToast('Part added to repair quote', 'success');
                  }}
                  className="px-3 py-1.5 bg-blue-600 text-white rounded-xl text-xs font-bold"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Financials & Balance Payment */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-400 block">Total Cost:</span>
                <span className="text-base font-extrabold text-slate-900 dark:text-white font-mono">
                  {formatCurrency(selectedTicket.finalCost, settings.currencySymbol)}
                </span>
                <span className="text-[11px] text-slate-500 block">Deposit: {formatCurrency(selectedTicket.deposit, settings.currencySymbol)}</span>
              </div>

              {selectedTicket.remainingBalance > 0 ? (
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    placeholder="Pay amount"
                    value={paymentAmount || ''}
                    onChange={(e) => setPaymentAmount(parseFloat(e.target.value) || 0)}
                    className="w-28 px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border rounded-xl font-mono text-end"
                  />
                  <button
                    onClick={() => {
                      if (paymentAmount <= 0) return;
                      recordRepairPayment(selectedTicket.id, paymentAmount);
                      setPaymentAmount(0);
                      showToast('Payment recorded in register', 'success');
                    }}
                    className="px-3 py-1.5 bg-emerald-600 text-white rounded-xl font-bold shadow"
                  >
                    Receive Payment
                  </button>
                </div>
              ) : (
                <span className="px-3 py-1 bg-emerald-100 text-emerald-700 font-bold rounded-full">
                  Fully Paid
                </span>
              )}
            </div>

            {/* History Log */}
            <div>
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                Ticket Activity Audit
              </h4>
              <div className="space-y-2 max-h-40 overflow-y-auto pe-1">
                {selectedTicket.history.map((h, i) => (
                  <div key={i} className="p-2.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl text-xs flex justify-between items-center">
                    <div>
                      <span className="font-bold capitalize text-slate-800 dark:text-slate-200">{h.status.replace('_', ' ')}</span>
                      <p className="text-[11px] text-slate-500">{h.note}</p>
                    </div>
                    <span className="text-[10px] text-slate-400">{formatDate(h.date)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* New Repair Ticket Intake Modal */}
      <Modal
        isOpen={newModalOpen}
        onClose={() => setNewModalOpen(false)}
        title={t('new_repair')}
        maxWidth="2xl"
      >
        <form onSubmit={handleCreateTicket} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Customer Select
              </label>
              <select
                value={formData.customerId}
                onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-100 dark:bg-slate-800 rounded-xl border-none outline-none font-bold"
              >
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>{c.name} ({c.phone})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Device Type
              </label>
              <select
                value={formData.deviceType}
                onChange={(e) => setFormData({ ...formData, deviceType: e.target.value as any })}
                className="w-full px-3 py-2 text-xs bg-slate-100 dark:bg-slate-800 rounded-xl border-none outline-none font-bold"
              >
                <option value="smartphone">Smartphone / جوال</option>
                <option value="laptop">Laptop / لابتوب</option>
                <option value="desktop">Desktop PC / كمبيوتر مكتبي</option>
                <option value="tablet">Tablet / تابلت</option>
                <option value="console">Console / بلايستيشن</option>
                <option value="other">Other Device / أخرى</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Brand *
              </label>
              <input
                type="text"
                required
                placeholder="Apple, Samsung, Dell, HP..."
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-100 dark:bg-slate-800 rounded-xl border-none outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Model *
              </label>
              <input
                type="text"
                required
                placeholder="iPhone 15, XPS 15, Galaxy S23..."
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-100 dark:bg-slate-800 rounded-xl border-none outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                IMEI 1 / Serial
              </label>
              <input
                type="text"
                placeholder="359201102938475"
                value={formData.imei1}
                onChange={(e) => setFormData({ ...formData, imei1: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-100 dark:bg-slate-800 rounded-xl border-none outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Color & Cosmetic Condition
              </label>
              <input
                type="text"
                placeholder="Black, minor scratches on back"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-100 dark:bg-slate-800 rounded-xl border-none outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Accessories Received with Device
            </label>
            <input
              type="text"
              placeholder="e.g. Charger, USB Cable, Protective Case, None"
              value={formData.accessoriesReceived}
              onChange={(e) => setFormData({ ...formData, accessoriesReceived: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-slate-100 dark:bg-slate-800 rounded-xl border-none outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Reported Problem by Customer *
            </label>
            <textarea
              required
              rows={2}
              placeholder="Describe the defect, symptoms, or requested upgrade..."
              value={formData.problemReported}
              onChange={(e) => setFormData({ ...formData, problemReported: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-slate-100 dark:bg-slate-800 rounded-xl border-none outline-none"
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Estimated Cost (₪)
              </label>
              <input
                type="number"
                min="0"
                value={formData.estimatedCost || ''}
                onChange={(e) => setFormData({ ...formData, estimatedCost: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 text-xs bg-slate-100 dark:bg-slate-800 rounded-xl border-none outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Deposit Received (₪)
              </label>
              <input
                type="number"
                min="0"
                value={formData.deposit || ''}
                onChange={(e) => setFormData({ ...formData, deposit: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 text-xs bg-slate-100 dark:bg-slate-800 rounded-xl border-none outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Expected Ready Date
              </label>
              <input
                type="date"
                value={formData.expectedCompletionDate}
                onChange={(e) => setFormData({ ...formData, expectedCompletionDate: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-100 dark:bg-slate-800 rounded-xl border-none outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setNewModalOpen(false)}
              className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-500/25 transition-all"
            >
              Create Ticket & Intake Receipt
            </button>
          </div>
        </form>
      </Modal>

      {/* Intake Claim Receipt Modal */}
      <RepairIntakeReceiptModal
        isOpen={!!printTicket}
        onClose={() => setPrintTicket(null)}
        ticket={printTicket}
      />
    </div>
  );
};
