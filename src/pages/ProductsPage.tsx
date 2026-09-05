import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../utils/formatters';
import { Product } from '../types';
import { initialCategories, initialBrands } from '../data/categories';
import { Modal } from '../components/common/Modal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { BarcodeGeneratorModal } from '../components/inventory/BarcodeGeneratorModal';
import { 
  Package, 
  Plus, 
  Search, 
  Filter, 
  Barcode, 
  Edit, 
  Trash2, 
  Tag, 
  Boxes,
  AlertTriangle,
  Smartphone,
  CheckCircle2
} from 'lucide-react';

export const ProductsPage: React.FC = () => {
  const { products, addProduct, updateProduct, deleteProduct, suppliers, settings } = useApp();
  const { t, language } = useLanguage();
  const { showToast } = useToast();
  const { permissions } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [lowStockOnly, setLowStockOnly] = useState(false);

  // Modals
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteConfirmProduct, setDeleteConfirmProduct] = useState<Product | null>(null);
  const [barcodeProduct, setBarcodeProduct] = useState<Product | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    nameAr: '',
    sku: '',
    barcode: '',
    category: 'chargers',
    brand: 'Anker',
    purchasePrice: 0,
    sellingPrice: 0,
    quantity: 10,
    minStock: 3,
    warranty: '1 Year',
    image: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=500&auto=format&fit=crop&q=60',
    description: '',
    isSerialTracked: false,
    imeiListStr: ''
  });

  const openAddModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      nameAr: '',
      sku: 'SKU-' + Math.floor(1000 + Math.random() * 9000),
      barcode: '79' + Math.floor(1000000000 + Math.random() * 9000000000),
      category: 'chargers',
      brand: 'Anker',
      purchasePrice: 30,
      sellingPrice: 60,
      quantity: 10,
      minStock: 3,
      warranty: '1 Year',
      image: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=500&auto=format&fit=crop&q=60',
      description: '',
      isSerialTracked: false,
      imeiListStr: ''
    });
    setProductModalOpen(true);
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setFormData({
      name: p.name,
      nameAr: p.nameAr,
      sku: p.sku,
      barcode: p.barcode,
      category: p.category,
      brand: p.brand,
      purchasePrice: p.purchasePrice,
      sellingPrice: p.sellingPrice,
      quantity: p.quantity,
      minStock: p.minStock,
      warranty: p.warranty,
      image: p.image,
      description: p.description,
      isSerialTracked: !!p.isSerialTracked,
      imeiListStr: p.imeiList ? p.imeiList.join(', ') : ''
    });
    setProductModalOpen(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const imeis = formData.isSerialTracked 
      ? formData.imeiListStr.split(',').map((s) => s.trim()).filter(Boolean)
      : undefined;

    if (editingProduct) {
      updateProduct(editingProduct.id, {
        name: formData.name,
        nameAr: formData.nameAr,
        sku: formData.sku,
        barcode: formData.barcode,
        category: formData.category,
        brand: formData.brand,
        purchasePrice: formData.purchasePrice,
        sellingPrice: formData.sellingPrice,
        quantity: formData.quantity,
        minStock: formData.minStock,
        warranty: formData.warranty,
        image: formData.image,
        description: formData.description,
        isSerialTracked: formData.isSerialTracked,
        imeiList: imeis
      });
      showToast('Product updated successfully', 'success');
    } else {
      addProduct({
        name: formData.name,
        nameAr: formData.nameAr,
        sku: formData.sku,
        barcode: formData.barcode,
        category: formData.category,
        brand: formData.brand,
        purchasePrice: formData.purchasePrice,
        sellingPrice: formData.sellingPrice,
        quantity: formData.quantity,
        minStock: formData.minStock,
        warranty: formData.warranty,
        image: formData.image,
        description: formData.description,
        isSerialTracked: formData.isSerialTracked,
        imeiList: imeis
      });
      showToast('Product created successfully', 'success');
    }
    setProductModalOpen(false);
  };

  const filteredProducts = products.filter((p) => {
    const matchesCat = selectedCategory === 'all' || p.category === selectedCategory;
    const matchesBrand = selectedBrand === 'all' || p.brand.toLowerCase() === selectedBrand.toLowerCase();
    const matchesLow = !lowStockOnly || p.quantity <= p.minStock;
    const q = searchQuery.toLowerCase().trim();
    if (!q) return matchesCat && matchesBrand && matchesLow;

    const matchesQuery = p.name.toLowerCase().includes(q) || 
      p.nameAr.includes(q) || 
      p.sku.toLowerCase().includes(q) || 
      p.barcode.includes(q) ||
      (p.imeiList && p.imeiList.some(im => im.includes(q)));

    return matchesCat && matchesBrand && matchesLow && matchesQuery;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Package className="w-5 h-5 text-blue-600" />
            <span>{t('products')}</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {language === 'ar' ? 'كتالوج المنتجات، الأجهزة المستعملة، الباركود والأسعار' : 'Manage catalog items, used devices, prices, and barcodes'}
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs md:text-sm font-bold shadow-lg shadow-blue-500/25 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>{t('add_product')}</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute start-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('search_products')}
              className="w-full ps-9 pe-4 py-2 text-xs bg-slate-100 dark:bg-slate-800 border-none rounded-2xl text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 text-xs font-bold bg-slate-100 dark:bg-slate-800 rounded-2xl border-none outline-none"
          >
            {initialCategories.map((c) => (
              <option key={c.id} value={c.id}>{language === 'ar' ? c.nameAr : c.name}</option>
            ))}
          </select>

          <select
            value={selectedBrand}
            onChange={(e) => setSelectedBrand(e.target.value)}
            className="px-3 py-2 text-xs font-bold bg-slate-100 dark:bg-slate-800 rounded-2xl border-none outline-none"
          >
            <option value="all">{language === 'ar' ? 'جميع الماركات' : 'All Brands'}</option>
            {initialBrands.map((b) => (
              <option key={b.id} value={b.name}>{b.name}</option>
            ))}
          </select>

          <button
            onClick={() => setLowStockOnly(!lowStockOnly)}
            className={`px-3 py-2 rounded-2xl text-xs font-bold transition-colors flex items-center gap-1.5 ${
              lowStockOnly 
                ? 'bg-rose-500 text-white shadow' 
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>{t('low_stock')}</span>
          </button>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-start text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 text-slate-500 font-semibold">
                <th className="text-start p-4">Product</th>
                <th className="text-start p-4">SKU / Barcode</th>
                <th className="text-start p-4">Category / Brand</th>
                {permissions.canEditCostPrice && <th className="text-end p-4">Cost Price</th>}
                <th className="text-end p-4">Selling Price</th>
                <th className="text-center p-4">Stock</th>
                <th className="text-end p-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredProducts.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <img src={p.image} alt="" className="w-10 h-10 rounded-xl object-cover bg-slate-100 flex-shrink-0" />
                      <div className="truncate max-w-xs">
                        <span className="font-bold text-slate-900 dark:text-white block truncate">
                          {language === 'ar' ? p.nameAr : p.name}
                        </span>
                        {p.isSerialTracked && (
                          <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold flex items-center gap-0.5 mt-0.5">
                            <Smartphone className="w-3 h-3" /> IMEI Tracked ({p.imeiList?.length || 0})
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="p-4 font-mono">
                    <span className="text-slate-900 dark:text-white font-bold block">{p.sku}</span>
                    <span className="text-[10px] text-slate-400">{p.barcode}</span>
                  </td>
                  <td className="p-4">
                    <span className="font-semibold text-slate-800 dark:text-slate-200 capitalize block">{p.brand}</span>
                    <span className="text-[10px] text-slate-400 capitalize">{p.category}</span>
                  </td>
                  {permissions.canEditCostPrice && (
                    <td className="p-4 text-end font-mono text-slate-500">
                      {formatCurrency(p.purchasePrice, settings.currencySymbol, language)}
                    </td>
                  )}
                  <td className="p-4 text-end font-mono font-extrabold text-blue-600 dark:text-blue-400 text-sm">
                    {formatCurrency(p.sellingPrice, settings.currencySymbol, language)}
                  </td>
                  <td className="p-4 text-center">
                    <span className={`inline-block px-2 py-0.5 rounded-full font-bold font-mono ${
                      p.quantity <= p.minStock
                        ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400'
                        : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
                    }`}>
                      {p.quantity}
                    </span>
                  </td>
                  <td className="p-4 text-end">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setBarcodeProduct(p)}
                        title="Print Barcode Label"
                        className="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                      >
                        <Barcode className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openEditModal(p)}
                        title="Edit Product"
                        className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950 rounded-lg transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      {permissions.canDeleteRecords && (
                        <button
                          onClick={() => setDeleteConfirmProduct(p)}
                          title="Delete Product"
                          className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      <Modal
        isOpen={productModalOpen}
        onClose={() => setProductModalOpen(false)}
        title={editingProduct ? 'Edit Product' : 'Add New Product'}
        maxWidth="2xl"
      >
        <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Product Name (English) *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl outline-none"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">اسم المنتج (العربية) *</label>
              <input
                type="text"
                required
                value={formData.nameAr}
                onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
                className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl outline-none text-end"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">SKU Code *</label>
              <input
                type="text"
                required
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl outline-none font-mono"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Barcode (EAN-13 / Code128) *</label>
              <input
                type="text"
                required
                value={formData.barcode}
                onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl outline-none font-mono"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl outline-none font-bold"
              >
                {initialCategories.filter(c => c.id !== 'all').map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Brand</label>
              <input
                type="text"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl outline-none"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Cost Price (₪)</label>
              <input
                type="number"
                min="0"
                value={formData.purchasePrice || ''}
                onChange={(e) => setFormData({ ...formData, purchasePrice: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl outline-none font-mono"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Selling Price (₪) *</label>
              <input
                type="number"
                required
                min="0"
                value={formData.sellingPrice || ''}
                onChange={(e) => setFormData({ ...formData, sellingPrice: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl outline-none font-mono"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Initial Quantity</label>
              <input
                type="number"
                min="0"
                value={formData.quantity || ''}
                onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl outline-none font-mono"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Min. Stock Alert Level</label>
              <input
                type="number"
                min="1"
                value={formData.minStock || ''}
                onChange={(e) => setFormData({ ...formData, minStock: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl outline-none font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Product Image URL</label>
            <input
              type="url"
              value={formData.image}
              onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl outline-none"
            />
          </div>

          <div className="p-3 bg-blue-50 dark:bg-blue-950/40 rounded-xl border border-blue-200 dark:border-blue-900/50 space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isSerialTracked}
                onChange={(e) => setFormData({ ...formData, isSerialTracked: e.target.checked })}
                className="w-4 h-4 rounded text-blue-600"
              />
              <span className="font-bold text-blue-900 dark:text-blue-300">
                Track IMEI / Serial Numbers (Used phones, Laptops, Consoles)
              </span>
            </label>

            {formData.isSerialTracked && (
              <div>
                <label className="block text-[11px] text-slate-500 mb-1">
                  IMEI / Serial Numbers (comma separated)
                </label>
                <input
                  type="text"
                  placeholder="359201102938475, 359201102938476..."
                  value={formData.imeiListStr}
                  onChange={(e) => setFormData({ ...formData, imeiListStr: e.target.value })}
                  className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 rounded-lg outline-none font-mono text-xs"
                />
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setProductModalOpen(false)}
              className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl font-bold"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-xl font-bold shadow"
            >
              {t('save')}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deleteConfirmProduct}
        onClose={() => setDeleteConfirmProduct(null)}
        onConfirm={() => {
          if (deleteConfirmProduct) {
            deleteProduct(deleteConfirmProduct.id);
            showToast('Product deleted', 'info');
          }
        }}
        title="Delete Product"
        message={`Are you sure you want to delete "${deleteConfirmProduct?.name}"? This action cannot be undone.`}
      />

      {/* Barcode Label Modal */}
      <BarcodeGeneratorModal
        isOpen={!!barcodeProduct}
        onClose={() => setBarcodeProduct(null)}
        product={barcodeProduct}
      />
    </div>
  );
};
