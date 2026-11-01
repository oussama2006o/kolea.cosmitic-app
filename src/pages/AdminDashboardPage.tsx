import React, { useState, useEffect, useMemo, useRef } from 'react';
import { auth, googleProvider } from '../firebase/config';
import { signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { orderService, CustomerOrder, OrderStatus } from '../services/orderService';
import { productService } from '../services/productService';
import { Product } from '../types';
import { useRouter } from '../router/Router';
import { compressImageFile } from '../utils/imageCompressor';
import {
  radianceSerumImg,
  velvetCreamImg,
  botanicalCleanserImg,
  roseElixirImg,
  bodyEmulsionImg,
  ritualSetImg,
} from '../assets/images';
import {
  Shield,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Package,
  Truck,
  XCircle,
  Phone,
  MapPin,
  Calendar,
  LogOut,
  LogIn,
  Eye,
  AlertTriangle,
  RefreshCw,
  ShoppingBag,
  Plus,
  Trash2,
  Edit3,
  Upload,
  Image as ImageIcon,
  Layers,
  Tag,
  Check,
  X,
  Sparkles,
  Database,
  ArrowUpDown,
  Boxes,
} from 'lucide-react';

const ADMIN_EMAIL = 'tafatioussama@gmail.com';

const STATUS_CONFIG: Record<OrderStatus, { label: string; bg: string; text: string; border: string; icon: any }> = {
  Pending: { label: 'Pending', bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200', icon: Clock },
  Confirmed: { label: 'Confirmed', bg: 'bg-blue-50', text: 'text-blue-800', border: 'border-blue-200', icon: CheckCircle2 },
  Preparing: { label: 'Preparing', bg: 'bg-purple-50', text: 'text-purple-800', border: 'border-purple-200', icon: Package },
  Shipped: { label: 'Shipped', bg: 'bg-indigo-50', text: 'text-indigo-800', border: 'border-indigo-200', icon: Truck },
  Delivered: { label: 'Delivered', bg: 'bg-emerald-50', text: 'text-emerald-800', border: 'border-emerald-200', icon: CheckCircle2 },
  Cancelled: { label: 'Cancelled', bg: 'bg-rose-50', text: 'text-rose-800', border: 'border-rose-200', icon: XCircle },
};

const PRESET_IMAGES = [
  { name: 'Radiance Serum', src: radianceSerumImg },
  { name: 'Velvet Cream', src: velvetCreamImg },
  { name: 'Cleansing Gel', src: botanicalCleanserImg },
  { name: 'Rose Elixir', src: roseElixirImg },
  { name: 'Body Emulsion', src: bodyEmulsionImg },
  { name: 'Ritual Set', src: ritualSetImg },
];

export function AdminDashboardPage() {
  const { navigate } = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  // Active Tab
  const [activeTab, setActiveTab] = useState<'orders' | 'products'>('orders');

  // Orders State
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState<string | null>(null);
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<OrderStatus | 'All'>('All');
  const [selectedOrder, setSelectedOrder] = useState<CustomerOrder | null>(null);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [statusSuccessMessage, setStatusSuccessMessage] = useState<string | null>(null);

  // Products & Categories State
  const [products, setProducts] = useState<Product[]>(() => productService.getProducts());
  const [categories, setCategories] = useState<string[]>(() => productService.getCategories());
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [productSearch, setProductSearch] = useState('');
  const [stockFilter, setStockFilter] = useState<'all' | 'in_stock' | 'low_stock' | 'out_of_stock'>('all');

  // Category Creation State
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCatInput, setNewCatInput] = useState('');

  // Product Modal State (Add or Edit)
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isSavingProduct, setIsSavingProduct] = useState(false);
  const [productActionError, setProductActionError] = useState<string | null>(null);
  const [deleteConfirmProduct, setDeleteConfirmProduct] = useState<Product | null>(null);
  const [cloudSyncMessage, setCloudSyncMessage] = useState<string | null>(null);
  const [isCloudSyncing, setIsCloudSyncing] = useState(false);

  // Form Fields
  const [formTitle, setFormTitle] = useState('');
  const [formSubtitle, setFormSubtitle] = useState('');
  const [formPrice, setFormPrice] = useState<number | string>(1800);
  const [formStockQuantity, setFormStockQuantity] = useState<number | string>(40);
  const [formInStock, setFormInStock] = useState(true);
  const [formCategory, setFormCategory] = useState('Skincare');
  const [formCustomCategory, setFormCustomCategory] = useState('');
  const [formSubCategory, setFormSubCategory] = useState('');
  const [formVolume, setFormVolume] = useState('50ml');
  const [formImage, setFormImage] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formIsFeatured, setFormIsFeatured] = useState(false);
  const [isCompressingImage, setIsCompressingImage] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Monitor Firebase Auth state
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setAuthLoading(false);
    });
    return unsub;
  }, []);

  const isAuthorized = useMemo(() => {
    if (!currentUser) return false;
    return currentUser.email === ADMIN_EMAIL;
  }, [currentUser]);

  // Subscribe to real-time Firestore orders when authorized
  useEffect(() => {
    if (!isAuthorized) {
      setOrders([]);
      return;
    }

    setOrdersLoading(true);
    setOrdersError(null);

    const unsub = orderService.subscribeToOrders(
      (updatedOrders) => {
        setOrders(updatedOrders);
        setOrdersLoading(false);
      },
      (err) => {
        console.error('Failed to stream orders:', err);
        setOrdersError('Failed to load orders. Please verify Firestore security rules and authentication.');
        setOrdersLoading(false);
      }
    );

    return unsub;
  }, [isAuthorized]);

  // Subscribe to products and categories
  useEffect(() => {
    const unsubProducts = productService.subscribe((updated) => {
      setProducts(updated);
    });
    const unsubCategories = productService.subscribeCategories((cats) => {
      setCategories(cats);
    });
    return () => {
      unsubProducts();
      unsubCategories();
    };
  }, []);

  const handleSignIn = async () => {
    setAuthError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      setAuthError(err?.message || 'Authentication with Google failed.');
    }
  };

  const handleSignOut = async () => {
    await signOut(auth);
    setSelectedOrder(null);
  };

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    setUpdatingOrderId(orderId);
    setStatusSuccessMessage(null);
    try {
      await orderService.updateOrderStatus(orderId, newStatus);
      setStatusSuccessMessage(`Order ${orderId} updated to "${newStatus}"`);
      setTimeout(() => setStatusSuccessMessage(null), 3000);
    } catch (err: any) {
      alert(`Could not update order: ${err?.message || 'Permission denied'}`);
    } finally {
      setUpdatingOrderId(null);
    }
  };

  // Filtered orders
  const filteredOrders = useMemo(() => {
    let result = [...orders];
    if (orderStatusFilter !== 'All') {
      result = result.filter((o) => o.status === orderStatusFilter);
    }
    if (orderSearchQuery.trim()) {
      const q = orderSearchQuery.toLowerCase().trim();
      result = result.filter(
        (o) =>
          o.id.toLowerCase().includes(q) ||
          o.customerName.toLowerCase().includes(q) ||
          o.customerPhone.includes(q) ||
          o.wilaya.toLowerCase().includes(q) ||
          o.address.toLowerCase().includes(q) ||
          o.items.some((i) => i.title.toLowerCase().includes(q))
      );
    }
    return result;
  }, [orders, orderStatusFilter, orderSearchQuery]);

  // Order Metrics
  const orderMetrics = useMemo(() => {
    const totalRevenue = orders
      .filter((o) => o.status !== 'Cancelled')
      .reduce((sum, o) => sum + o.total, 0);

    return {
      total: orders.length,
      pending: orders.filter((o) => o.status === 'Pending').length,
      inProgress: orders.filter((o) => o.status === 'Confirmed' || o.status === 'Preparing').length,
      shipped: orders.filter((o) => o.status === 'Shipped').length,
      delivered: orders.filter((o) => o.status === 'Delivered').length,
      revenue: totalRevenue,
    };
  }, [orders]);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (selectedCategory !== 'All') {
      result = result.filter((p) => p.category === selectedCategory);
    }

    if (stockFilter === 'in_stock') {
      result = result.filter((p) => p.inStock && (p.stockQuantity ?? 1) > 0);
    } else if (stockFilter === 'low_stock') {
      result = result.filter((p) => (p.stockQuantity ?? 0) > 0 && (p.stockQuantity ?? 0) <= 10);
    } else if (stockFilter === 'out_of_stock') {
      result = result.filter((p) => !p.inStock || (p.stockQuantity ?? 0) === 0);
    }

    if (productSearch.trim()) {
      const q = productSearch.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.subtitle.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          (p.subCategory && p.subCategory.toLowerCase().includes(q))
      );
    }

    return result;
  }, [products, selectedCategory, stockFilter, productSearch]);

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { All: products.length };
    products.forEach((p) => {
      counts[p.category] = (counts[p.category] || 0) + 1;
    });
    return counts;
  }, [products]);

  // Open modal for Adding New Product
  const handleOpenAddProduct = () => {
    setEditingProduct(null);
    setFormTitle('');
    setFormSubtitle('');
    setFormPrice(2200);
    setFormStockQuantity(50);
    setFormInStock(true);
    setFormCategory(selectedCategory !== 'All' ? selectedCategory : 'Skincare');
    setFormCustomCategory('');
    setFormSubCategory('');
    setFormVolume('50ml');
    setFormImage(radianceSerumImg);
    setFormDescription('Artisanal botanical formulation crafted in Koléa atelier.');
    setFormIsFeatured(false);
    setProductActionError(null);
    setIsProductModalOpen(true);
  };

  // Open modal for Editing Existing Product
  const handleOpenEditProduct = (prod: Product) => {
    setEditingProduct(prod);
    setFormTitle(prod.title);
    setFormSubtitle(prod.subtitle || '');
    setFormPrice(prod.price);
    setFormStockQuantity(prod.stockQuantity ?? (prod.inStock ? 35 : 0));
    setFormInStock(prod.inStock);
    setFormCategory(prod.category);
    setFormCustomCategory('');
    setFormSubCategory(prod.subCategory || '');
    setFormVolume(prod.volume || '50ml');
    setFormImage(prod.image);
    setFormDescription(prod.description || '');
    setFormIsFeatured(prod.isFeatured || false);
    setProductActionError(null);
    setIsProductModalOpen(true);
  };

  // Quick adjust stock directly in the list
  const handleQuickAdjustStock = async (product: Product, delta: number) => {
    const currentQty = product.stockQuantity ?? (product.inStock ? 30 : 0);
    const newQty = Math.max(0, currentQty + delta);
    const newInStock = newQty > 0;

    try {
      await productService.saveProduct({
        ...product,
        stockQuantity: newQty,
        inStock: newInStock,
      });
    } catch (e: any) {
      alert(`Could not adjust stock: ${e.message}`);
    }
  };

  // Quick toggle in-stock
  const handleToggleInStock = async (product: Product) => {
    const currentInStock = product.inStock && (product.stockQuantity ?? 1) > 0;
    const nextInStock = !currentInStock;
    const nextQty = nextInStock ? (product.stockQuantity && product.stockQuantity > 0 ? product.stockQuantity : 25) : 0;

    try {
      await productService.saveProduct({
        ...product,
        inStock: nextInStock,
        stockQuantity: nextQty,
      });
    } catch (e: any) {
      alert(`Could not toggle stock: ${e.message}`);
    }
  };

  // Handle Image File Upload (converted to optimized WebP/JPEG data URL)
  const handleImageFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsCompressingImage(true);
    setProductActionError(null);

    try {
      const dataUrl = await compressImageFile(file, 900, 0.85);
      setFormImage(dataUrl);
    } catch (err: any) {
      setProductActionError('Failed to process image file. Please try another image.');
    } finally {
      setIsCompressingImage(false);
    }
  };

  // Save Product (Create or Update)
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      setProductActionError('Product name is required.');
      return;
    }

    const priceNum = Number(formPrice);
    if (isNaN(priceNum) || priceNum < 0) {
      setProductActionError('Please enter a valid price in DZD.');
      return;
    }

    const stockNum = Number(formStockQuantity);
    if (isNaN(stockNum) || stockNum < 0) {
      setProductActionError('Please enter a valid quantity in stock.');
      return;
    }

    const finalCategory =
      formCategory === '__NEW__'
        ? formCustomCategory.trim() || 'Skincare'
        : formCategory.trim() || 'Skincare';

    setIsSavingProduct(true);
    setProductActionError(null);

    try {
      await productService.saveProduct({
        id: editingProduct ? editingProduct.id : undefined,
        title: formTitle.trim(),
        subtitle: formSubtitle.trim(),
        price: priceNum,
        stockQuantity: stockNum,
        inStock: stockNum > 0 && formInStock,
        category: finalCategory,
        subCategory: formSubCategory.trim(),
        volume: formVolume.trim() || '50ml',
        image: formImage.trim() || radianceSerumImg,
        description: formDescription.trim(),
        isFeatured: formIsFeatured,
      });

      setStatusSuccessMessage(
        editingProduct
          ? `Product "${formTitle.trim()}" updated successfully.`
          : `New product "${formTitle.trim()}" added to ${finalCategory}.`
      );
      setTimeout(() => setStatusSuccessMessage(null), 4000);

      setIsProductModalOpen(false);
      setEditingProduct(null);
    } catch (err: any) {
      setProductActionError(err?.message || 'Failed to save product. Please try again.');
    } finally {
      setIsSavingProduct(false);
    }
  };

  // Delete Product
  const handleConfirmDeleteProduct = async () => {
    if (!deleteConfirmProduct) return;
    try {
      await productService.deleteProduct(deleteConfirmProduct.id);
      setStatusSuccessMessage(`Product "${deleteConfirmProduct.title}" was removed.`);
      setTimeout(() => setStatusSuccessMessage(null), 3000);
      setDeleteConfirmProduct(null);
    } catch (err: any) {
      alert(`Could not delete product: ${err?.message}`);
    }
  };

  // Add Category
  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatInput.trim()) return;
    try {
      await productService.addCategory(newCatInput.trim());
      setSelectedCategory(newCatInput.trim());
      setNewCatInput('');
      setIsAddingCategory(false);
    } catch (e: any) {
      alert(`Could not add category: ${e.message}`);
    }
  };

  // Delete Category
  const handleDeleteCategory = async (catName: string) => {
    if (confirm(`Are you sure you want to remove the category "${catName}"?`)) {
      await productService.removeCategory(catName);
      if (selectedCategory === catName) {
        setSelectedCategory('All');
      }
    }
  };

  // Sync / Seed initial catalog to Cloud Firestore
  const handleSyncCatalogToCloud = async () => {
    setIsCloudSyncing(true);
    setCloudSyncMessage(null);
    try {
      const count = await productService.seedDefaultCatalogToFirestore();
      setCloudSyncMessage(`Successfully synchronized ${count} formulations to Cloud Firestore.`);
      setTimeout(() => setCloudSyncMessage(null), 4000);
    } catch (err: any) {
      setCloudSyncMessage(`Sync note: ${err?.message || 'Updated in local store'}`);
    } finally {
      setIsCloudSyncing(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex items-center gap-3 text-stone-600 text-sm">
          <RefreshCw className="w-5 h-5 animate-spin text-stone-900" />
          <span>Verifying administrator credentials...</span>
        </div>
      </div>
    );
  }

  // View: Not signed in
  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto my-16 px-4">
        <div className="bg-white border border-stone-200/90 rounded-2xl p-8 shadow-sm text-center space-y-6">
          <div className="w-14 h-14 mx-auto rounded-full bg-stone-100 flex items-center justify-center text-stone-900 border border-stone-200">
            <Shield className="w-6 h-6" />
          </div>

          <div className="space-y-2">
            <h1 className="font-editorial text-2xl font-semibold text-stone-900">
              Koléa Atelier Management
            </h1>
            <p className="text-xs text-stone-500 font-light leading-relaxed">
              This area is strictly restricted to authorized Koléa Cosmetic administrators. Please sign in with your administrator Google account to manage customer orders and products.
            </p>
          </div>

          {authError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 text-left">
              {authError}
            </div>
          )}

          <button
            onClick={handleSignIn}
            className="w-full py-3 px-4 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
          >
            <LogIn className="w-4 h-4" />
            <span>Sign In with Google</span>
          </button>

          <div className="pt-2 text-[11px] text-stone-400 border-t border-stone-100">
            Authorized Account: <span className="font-mono text-stone-600 font-medium">{ADMIN_EMAIL}</span>
          </div>
        </div>
      </div>
    );
  }

  // View: Signed in, but unauthorized email
  if (!isAuthorized) {
    return (
      <div className="max-w-md mx-auto my-16 px-4">
        <div className="bg-white border border-rose-200 rounded-2xl p-8 shadow-sm text-center space-y-6">
          <div className="w-14 h-14 mx-auto rounded-full bg-rose-50 flex items-center justify-center text-rose-700 border border-rose-200">
            <AlertTriangle className="w-6 h-6" />
          </div>

          <div className="space-y-2">
            <h1 className="font-editorial text-2xl font-semibold text-stone-900">
              Access Restricted
            </h1>
            <p className="text-xs text-stone-600 leading-relaxed">
              You are signed in as <strong className="font-mono text-stone-900">{currentUser.email}</strong>, which is not registered as the authorized administrator for Koléa Cosmetic.
            </p>
            <p className="text-[11px] text-stone-400">
              Authorized admin account: <span className="font-mono">{ADMIN_EMAIL}</span>
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={handleSignOut}
              className="flex-1 py-2.5 px-3 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-medium rounded-lg transition-colors cursor-pointer"
            >
              Sign Out & Switch Account
            </button>
            <button
              onClick={() => navigate('/home')}
              className="py-2.5 px-4 bg-stone-900 hover:bg-stone-800 text-white text-xs font-medium rounded-lg transition-colors cursor-pointer"
            >
              Return Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // View: Authorized Admin Dashboard
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-stone-500 font-mono">
            <Shield className="w-3.5 h-3.5 text-emerald-700" />
            <span>Private Atelier Portal</span>
          </div>
          <h1 className="font-editorial text-3xl sm:text-4xl font-semibold text-stone-900 tracking-tight">
            Koléa Atelier Operations
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block text-xs">
            <p className="font-medium text-stone-900">{currentUser.displayName || 'Atelier Admin'}</p>
            <p className="font-mono text-stone-500 text-[11px]">{currentUser.email}</p>
          </div>

          <button
            onClick={handleSignOut}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-stone-100 hover:bg-stone-200/80 text-stone-700 text-xs font-medium rounded-lg transition-colors cursor-pointer"
            title="Sign Out"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Global Success / Notice Banners */}
      {statusSuccessMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{statusSuccessMessage}</span>
        </div>
      )}

      {cloudSyncMessage && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-800 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
          <span>{cloudSyncMessage}</span>
        </div>
      )}

      {/* Primary Dashboard Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-stone-200">
        <button
          onClick={() => setActiveTab('orders')}
          className={`flex items-center gap-2.5 px-5 py-3 text-xs sm:text-sm font-medium border-b-2 transition-all cursor-pointer ${
            activeTab === 'orders'
              ? 'border-stone-900 text-stone-900 font-semibold'
              : 'border-transparent text-stone-500 hover:text-stone-800 hover:border-stone-300'
          }`}
        >
          <Truck className="w-4 h-4" />
          <span>Customer Orders & Dispatch</span>
          <span className="ml-1 px-2 py-0.5 text-[11px] rounded-full bg-stone-100 font-mono text-stone-700 font-bold">
            {orders.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('products')}
          className={`flex items-center gap-2.5 px-5 py-3 text-xs sm:text-sm font-medium border-b-2 transition-all cursor-pointer ${
            activeTab === 'products'
              ? 'border-stone-900 text-stone-900 font-semibold'
              : 'border-transparent text-stone-500 hover:text-stone-800 hover:border-stone-300'
          }`}
        >
          <Boxes className="w-4 h-4" />
          <span>Products & Inventory</span>
          <span className="ml-1 px-2 py-0.5 text-[11px] rounded-full bg-stone-100 font-mono text-stone-700 font-bold">
            {products.length}
          </span>
        </button>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: ORDERS & DISPATCH                                 */}
      {/* ======================================================== */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          {/* KPI Overview Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="p-4 bg-white border border-stone-200/90 rounded-xl space-y-1">
              <span className="text-[11px] uppercase tracking-wider text-stone-500 font-medium">Total Orders</span>
              <p className="font-mono text-2xl font-bold text-stone-900 tabular-nums">{orderMetrics.total}</p>
            </div>
            <div className="p-4 bg-white border border-amber-200/90 rounded-xl space-y-1">
              <span className="text-[11px] uppercase tracking-wider text-amber-700 font-medium flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Pending Action
              </span>
              <p className="font-mono text-2xl font-bold text-amber-900 tabular-nums">{orderMetrics.pending}</p>
            </div>
            <div className="p-4 bg-white border border-blue-200/90 rounded-xl space-y-1">
              <span className="text-[11px] uppercase tracking-wider text-blue-700 font-medium">In Preparation</span>
              <p className="font-mono text-2xl font-bold text-blue-900 tabular-nums">{orderMetrics.inProgress}</p>
            </div>
            <div className="p-4 bg-white border border-emerald-200/90 rounded-xl space-y-1">
              <span className="text-[11px] uppercase tracking-wider text-emerald-700 font-medium">Delivered</span>
              <p className="font-mono text-2xl font-bold text-emerald-900 tabular-nums">{orderMetrics.delivered}</p>
            </div>
            <div className="col-span-2 lg:col-span-1 p-4 bg-stone-900 text-white rounded-xl space-y-1">
              <span className="text-[11px] uppercase tracking-wider text-stone-400 font-medium">Total Revenue</span>
              <p className="font-mono text-xl sm:text-2xl font-bold text-white tabular-nums">
                {orderMetrics.revenue.toLocaleString()} <span className="text-xs font-sans font-normal text-stone-400">DZD</span>
              </p>
            </div>
          </div>

          {/* Search & Filters */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            {/* Status Tabs */}
            <div className="flex items-center gap-1 p-1 bg-stone-200/70 rounded-xl overflow-x-auto">
              {(['All', 'Pending', 'Confirmed', 'Preparing', 'Shipped', 'Delivered', 'Cancelled'] as const).map(
                (st) => {
                  const isActive = orderStatusFilter === st;
                  return (
                    <button
                      key={st}
                      onClick={() => setOrderStatusFilter(st)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                        isActive
                          ? 'bg-stone-900 text-white shadow-2xs font-semibold'
                          : 'text-stone-600 hover:text-stone-900'
                      }`}
                    >
                      {st}
                    </button>
                  );
                }
              )}
            </div>

            {/* Search Box */}
            <div className="relative flex-1 sm:max-w-xs">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={orderSearchQuery}
                onChange={(e) => setOrderSearchQuery(e.target.value)}
                placeholder="Search by ID, name, phone, wilaya..."
                className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-900"
              />
            </div>
          </div>

          {/* Orders Table */}
          {ordersLoading ? (
            <div className="bg-white border border-stone-200 rounded-2xl p-12 text-center text-stone-500 text-xs space-y-2">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto text-stone-700" />
              <p>Syncing orders from Firestore...</p>
            </div>
          ) : ordersError ? (
            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-8 text-center text-rose-800 text-xs space-y-2">
              <AlertTriangle className="w-6 h-6 mx-auto text-rose-600" />
              <p className="font-semibold">{ordersError}</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="bg-white border border-stone-200 rounded-2xl p-12 text-center space-y-2 text-stone-500">
              <ShoppingBag className="w-8 h-8 mx-auto text-stone-400" />
              <p className="font-medium text-stone-800">No orders found</p>
              <p className="text-xs">
                {orderSearchQuery || orderStatusFilter !== 'All'
                  ? 'Try adjusting your search query or filter.'
                  : 'When customers place orders, they will appear here in real-time.'}
              </p>
            </div>
          ) : (
            <div className="bg-white border border-stone-200/90 rounded-2xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 uppercase tracking-wider font-semibold font-mono">
                    <tr>
                      <th className="py-3 px-4">Order ID & Date</th>
                      <th className="py-3 px-4">Customer & Phone</th>
                      <th className="py-3 px-4">Destination</th>
                      <th className="py-3 px-4">Items</th>
                      <th className="py-3 px-4">Total</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {filteredOrders.map((order) => {
                      const statusInfo = STATUS_CONFIG[order.status] || STATUS_CONFIG.Pending;
                      const isUpdating = updatingOrderId === order.id;

                      return (
                        <tr key={order.id} className="hover:bg-stone-50/60 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="font-mono font-semibold text-stone-900">{order.id}</div>
                            <div className="text-[11px] text-stone-400">
                              {new Date(order.createdAt).toLocaleDateString()} at{' '}
                              {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="font-medium text-stone-900">{order.customerName}</div>
                            <a
                              href={`tel:${order.customerPhone}`}
                              className="font-mono text-[11px] text-stone-500 hover:text-stone-900 inline-flex items-center gap-1"
                            >
                              <Phone className="w-3 h-3 text-stone-400" />
                              <span>{order.customerPhone}</span>
                            </a>
                          </td>

                          <td className="py-3.5 px-4 max-w-[180px]">
                            <div className="font-medium text-stone-800 truncate" title={order.wilaya}>
                              {order.wilaya}
                            </div>
                            <div className="text-[11px] text-stone-400 truncate" title={order.address}>
                              {order.address}
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <span className="font-medium text-stone-800">
                              {order.items.reduce((s, i) => s + i.quantity, 0)} items
                            </span>
                            <div className="text-[11px] text-stone-400 truncate max-w-[160px]" title={order.items.map((i) => i.title).join(', ')}>
                              {order.items.map((i) => i.title).join(', ')}
                            </div>
                          </td>

                          <td className="py-3.5 px-4 font-mono font-bold text-stone-900 tabular-nums">
                            {order.total.toLocaleString()} DZD
                          </td>

                          <td className="py-3.5 px-4">
                            <select
                              disabled={isUpdating}
                              value={order.status}
                              onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                              className={`text-xs font-semibold px-2 py-1 rounded-md border cursor-pointer focus:outline-none focus:ring-1 focus:ring-stone-900 ${statusInfo.bg} ${statusInfo.text} ${statusInfo.border}`}
                            >
                              <option value="Pending">Pending</option>
                              <option value="Confirmed">Confirmed</option>
                              <option value="Preparing">Preparing</option>
                              <option value="Shipped">Shipped</option>
                              <option value="Delivered">Delivered</option>
                              <option value="Cancelled">Cancelled</option>
                            </select>
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            <button
                              onClick={() => setSelectedOrder(order)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-medium rounded-md transition-colors cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Inspect</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: PRODUCTS & INVENTORY ("near categories")          */}
      {/* ======================================================== */}
      {activeTab === 'products' && (
        <div className="space-y-6">
          {/* Header Bar with Action Buttons */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2">
            <div>
              <h2 className="font-editorial text-2xl font-semibold text-stone-900">
                Product Catalog & Inventory
              </h2>
              <p className="text-xs text-stone-500 font-light mt-0.5">
                Edit product names, prices in DZD, quantities in stock, formulation photos, and organize categories.
              </p>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap">
              <button
                onClick={handleSyncCatalogToCloud}
                disabled={isCloudSyncing}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-medium rounded-xl transition-colors cursor-pointer border border-stone-200"
                title="Synchronize all catalog products to Cloud Firestore"
              >
                <Database className={`w-3.5 h-3.5 ${isCloudSyncing ? 'animate-spin' : 'text-stone-600'}`} />
                <span>{isCloudSyncing ? 'Syncing...' : 'Sync Cloud Catalog'}</span>
              </button>

              <button
                onClick={handleOpenAddProduct}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold rounded-xl transition-all cursor-pointer shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>+ Add New Product</span>
              </button>
            </div>
          </div>

          {/* Near Categories Bar: Categories Tabs & Management */}
          <div className="bg-white border border-stone-200/90 rounded-2xl p-4 shadow-2xs space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-stone-600" />
                <span className="font-semibold uppercase tracking-wider text-stone-800 text-[11px] font-mono">
                  Catalog Categories
                </span>
                <span className="text-stone-400">· Filter products by department</span>
              </div>

              {selectedCategory !== 'All' && !['Skincare', 'Body Care', 'Collections'].includes(selectedCategory) && (
                <button
                  onClick={() => handleDeleteCategory(selectedCategory)}
                  className="text-[11px] text-rose-600 hover:text-rose-800 flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Remove category &ldquo;{selectedCategory}&rdquo;</span>
                </button>
              )}
            </div>

            {/* Category Pills & Add Category */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {['All', ...categories.filter((c) => c !== 'All')].map((cat) => {
                const isActive = selectedCategory === cat;
                const count = categoryCounts[cat] ?? 0;
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium rounded-xl transition-all cursor-pointer border ${
                      isActive
                        ? 'bg-stone-900 text-white border-stone-900 shadow-2xs font-semibold'
                        : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100 hover:text-stone-900'
                    }`}
                  >
                    <span>{cat === 'All' ? 'All Products' : cat}</span>
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                        isActive ? 'bg-stone-800 text-white' : 'bg-stone-200 text-stone-600'
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}

              {/* Add New Category Button / Inline Input */}
              {isAddingCategory ? (
                <form onSubmit={handleCreateCategory} className="flex items-center gap-1">
                  <input
                    type="text"
                    value={newCatInput}
                    onChange={(e) => setNewCatInput(e.target.value)}
                    placeholder="Category name..."
                    autoFocus
                    className="px-2.5 py-1 text-xs border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-900 w-36"
                  />
                  <button
                    type="submit"
                    className="p-1.5 bg-stone-900 text-white rounded-lg hover:bg-stone-800 cursor-pointer"
                    title="Add Category"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingCategory(false);
                      setNewCatInput('');
                    }}
                    className="p-1.5 bg-stone-200 text-stone-600 rounded-lg hover:bg-stone-300 cursor-pointer"
                    title="Cancel"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </form>
              ) : (
                <button
                  onClick={() => setIsAddingCategory(true)}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-stone-600 hover:text-stone-900 bg-white border border-dashed border-stone-300 hover:border-stone-500 rounded-xl transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ New Category</span>
                </button>
              )}
            </div>
          </div>

          {/* Search & Stock Filter Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 p-1 bg-stone-200/70 rounded-xl overflow-x-auto">
              {(
                [
                  { id: 'all', label: 'All Items' },
                  { id: 'in_stock', label: 'In Stock' },
                  { id: 'low_stock', label: 'Low Stock (≤10)' },
                  { id: 'out_of_stock', label: 'Out of Stock' },
                ] as const
              ).map((f) => {
                const isActive = stockFilter === f.id;
                return (
                  <button
                    key={f.id}
                    onClick={() => setStockFilter(f.id)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                      isActive
                        ? 'bg-stone-900 text-white shadow-2xs font-semibold'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    {f.label}
                  </button>
                );
              })}
            </div>

            <div className="relative flex-1 sm:max-w-xs">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                placeholder="Search products by title, subtitle, or category..."
                className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-900"
              />
            </div>
          </div>

          {/* Products Table */}
          {filteredProducts.length === 0 ? (
            <div className="bg-white border border-stone-200 rounded-2xl p-12 text-center space-y-3 text-stone-500">
              <Boxes className="w-10 h-10 mx-auto text-stone-300" />
              <p className="font-semibold text-stone-800 text-sm">No products found</p>
              <p className="text-xs max-w-sm mx-auto">
                {productSearch || selectedCategory !== 'All' || stockFilter !== 'all'
                  ? 'No products matched your active filters. Try resetting search or selecting All Products.'
                  : 'Your catalog is empty. Click "+ Add New Product" to create your first formulation.'}
              </p>
              <button
                onClick={handleOpenAddProduct}
                className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 bg-stone-900 text-white text-xs font-medium rounded-lg hover:bg-stone-800 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Create New Product</span>
              </button>
            </div>
          ) : (
            <div className="bg-white border border-stone-200/90 rounded-2xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 uppercase tracking-wider font-semibold font-mono">
                    <tr>
                      <th className="py-3 px-4">Product Formulation</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Price (DZD)</th>
                      <th className="py-3 px-4">Stock Quantity ("Quintet")</th>
                      <th className="py-3 px-4">Availability</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {filteredProducts.map((prod) => {
                      const qty = prod.stockQuantity ?? (prod.inStock ? 35 : 0);
                      const isLow = qty > 0 && qty <= 10;
                      const isOut = qty === 0 || !prod.inStock;

                      return (
                        <tr key={prod.id} className="hover:bg-stone-50/70 transition-colors">
                          {/* Image & Title */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <div className="relative group shrink-0">
                                <img
                                  src={prod.image}
                                  alt={prod.title}
                                  className="w-14 h-14 object-cover rounded-lg border border-stone-200 bg-stone-100 shadow-2xs"
                                />
                                <button
                                  onClick={() => handleOpenEditProduct(prod)}
                                  className="absolute inset-0 bg-stone-900/60 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center rounded-lg transition-opacity cursor-pointer text-[10px] font-semibold"
                                  title="Change product picture"
                                >
                                  Change
                                </button>
                              </div>

                              <div className="max-w-xs">
                                <div className="font-semibold text-stone-900 text-sm flex items-center gap-2">
                                  <span>{prod.title}</span>
                                  {prod.isFeatured && (
                                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded bg-amber-100 text-amber-900 text-[10px] font-medium font-sans">
                                      <Sparkles className="w-2.5 h-2.5" /> Featured
                                    </span>
                                  )}
                                </div>
                                <div className="text-[11px] text-stone-400 line-clamp-1">{prod.subtitle}</div>
                                <div className="text-[10px] text-stone-400 font-mono mt-0.5">{prod.volume}</div>
                              </div>
                            </div>
                          </td>

                          {/* Category Badge */}
                          <td className="py-3.5 px-4">
                            <span className="inline-block px-2.5 py-1 rounded-md text-[11px] font-medium bg-stone-100 text-stone-800 border border-stone-200/80">
                              {prod.category}
                            </span>
                            {prod.subCategory && (
                              <div className="text-[10px] text-stone-400 mt-1">{prod.subCategory}</div>
                            )}
                          </td>

                          {/* Price in DZD */}
                          <td className="py-3.5 px-4">
                            <div className="font-mono text-sm font-bold text-stone-900 tabular-nums">
                              {prod.price.toLocaleString()} DZD
                            </div>
                          </td>

                          {/* Stock Quantity ("Quintet") with Steppers */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => handleQuickAdjustStock(prod, -1)}
                                className="w-6 h-6 flex items-center justify-center rounded-md bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs transition-colors cursor-pointer"
                                title="Decrease quantity"
                              >
                                -
                              </button>
                              <span className="font-mono font-bold text-stone-900 min-w-8 text-center text-xs tabular-nums">
                                {qty}
                              </span>
                              <button
                                onClick={() => handleQuickAdjustStock(prod, 1)}
                                className="w-6 h-6 flex items-center justify-center rounded-md bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs transition-colors cursor-pointer"
                                title="Increase quantity"
                              >
                                +
                              </button>
                            </div>
                          </td>

                          {/* Stock Status Pill & Switch */}
                          <td className="py-3.5 px-4">
                            <button
                              onClick={() => handleToggleInStock(prod)}
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border cursor-pointer transition-colors ${
                                isOut
                                  ? 'bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100'
                                  : isLow
                                  ? 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                                  : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                              }`}
                              title="Click to toggle in-stock / out-of-stock"
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  isOut ? 'bg-rose-600' : isLow ? 'bg-amber-500' : 'bg-emerald-600'
                                }`}
                              />
                              <span>{isOut ? 'Out of Stock' : isLow ? `Low Stock (${qty})` : `In Stock (${qty})`}</span>
                            </button>
                          </td>

                          {/* Actions: Edit & Remove */}
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleOpenEditProduct(prod)}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-medium rounded-md transition-colors cursor-pointer"
                                title="Edit product formulation, name, price, quantity, pic"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                                <span>Edit</span>
                              </button>

                              <button
                                onClick={() => setDeleteConfirmProduct(prod)}
                                className="p-1.5 text-stone-400 hover:text-rose-700 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                                title="Remove / delete product"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: ADD / EDIT PRODUCT                                */}
      {/* ======================================================== */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
          <div
            className="fixed inset-0 bg-stone-900/40 backdrop-blur-xs transition-opacity"
            onClick={() => !isSavingProduct && setIsProductModalOpen(false)}
          />

          <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
            <div className="relative transform overflow-hidden rounded-2xl bg-white text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-2xl border border-stone-200 p-6 sm:p-8 space-y-6">
              {/* Modal Header */}
              <div className="flex items-start justify-between pb-4 border-b border-stone-100">
                <div>
                  <span className="font-mono text-xs text-stone-400 uppercase tracking-wider font-semibold">
                    {editingProduct ? 'Update Formulation' : 'New Formulation'}
                  </span>
                  <h3 className="font-editorial text-2xl font-semibold text-stone-900 mt-0.5">
                    {editingProduct ? `Edit: ${editingProduct.title}` : 'Add Product to Atelier'}
                  </h3>
                </div>

                <button
                  disabled={isSavingProduct}
                  onClick={() => setIsProductModalOpen(false)}
                  className="p-1.5 text-stone-400 hover:text-stone-700 rounded-md transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {productActionError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{productActionError}</span>
                </div>
              )}

              <form onSubmit={handleSaveProduct} className="space-y-5 text-xs">
                {/* 1. Picture of Product with live preview and upload */}
                <div className="space-y-2">
                  <label className="block font-semibold uppercase tracking-wider text-stone-700 text-[11px]">
                    Product Picture
                  </label>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 bg-stone-50 rounded-xl border border-stone-200">
                    <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-stone-300 bg-white shrink-0 shadow-2xs">
                      {formImage ? (
                        <img src={formImage} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-stone-400">
                          <ImageIcon className="w-6 h-6" />
                          <span className="text-[10px] mt-1">No Pic</span>
                        </div>
                      )}
                      {isCompressingImage && (
                        <div className="absolute inset-0 bg-stone-900/60 text-white flex items-center justify-center text-[10px]">
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        </div>
                      )}
                    </div>

                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleImageFileUpload}
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded-lg font-medium inline-flex items-center gap-1.5 cursor-pointer shadow-2xs"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>Upload Photo from Device</span>
                        </button>
                        <span className="text-[11px] text-stone-400">or enter URL / pick preset below</span>
                      </div>

                      {/* Image URL input */}
                      <div>
                        <input
                          type="text"
                          value={formImage}
                          onChange={(e) => setFormImage(e.target.value)}
                          placeholder="Image URL or data:image..."
                          className="w-full px-3 py-1.5 bg-white border border-stone-300 rounded-lg text-[11px] font-mono focus:outline-none focus:ring-1 focus:ring-stone-900"
                        />
                      </div>

                      {/* Presets */}
                      <div className="pt-1">
                        <span className="text-[10px] text-stone-400 uppercase tracking-wider block mb-1">
                          Koléa Atelier Presets:
                        </span>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {PRESET_IMAGES.map((preset) => (
                            <button
                              key={preset.name}
                              type="button"
                              onClick={() => setFormImage(preset.src)}
                              className="px-2 py-0.5 bg-white hover:bg-stone-200 border border-stone-300 rounded text-[10px] text-stone-700 cursor-pointer transition-colors"
                            >
                              {preset.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Product Name / Title */}
                <div className="space-y-1">
                  <label className="block font-semibold uppercase tracking-wider text-stone-700 text-[11px]">
                    Product Name (Title) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="e.g., Botanical Hyaluronic Radiance Serum"
                    className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-900 text-stone-900 font-medium"
                  />
                </div>

                {/* 3. Subtitle / Formulation tagline */}
                <div className="space-y-1">
                  <label className="block font-semibold uppercase tracking-wider text-stone-700 text-[11px]">
                    Subtitle / Formulation Tagline
                  </label>
                  <input
                    type="text"
                    value={formSubtitle}
                    onChange={(e) => setFormSubtitle(e.target.value)}
                    placeholder="e.g., Triple-molecular hydration with Mediterranean damask rose"
                    className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-900 text-stone-800"
                  />
                </div>

                {/* 4. Price & Stock Quantity ("Quintet") */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Price */}
                  <div className="space-y-1">
                    <label className="block font-semibold uppercase tracking-wider text-stone-700 text-[11px]">
                      Price (DZD) *
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        step="50"
                        required
                        value={formPrice}
                        onChange={(e) => setFormPrice(e.target.value)}
                        placeholder="1800"
                        className="w-full pl-3 pr-14 py-2 bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-900 font-mono font-semibold text-stone-900"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-[11px] text-stone-500 font-semibold pointer-events-none">
                        DZD
                      </span>
                    </div>
                  </div>

                  {/* Stock Quantity / Quintet */}
                  <div className="space-y-1">
                    <label className="block font-semibold uppercase tracking-wider text-stone-700 text-[11px]">
                      Quantity in Stock ("Quintet") *
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        required
                        value={formStockQuantity}
                        onChange={(e) => {
                          const val = e.target.value;
                          setFormStockQuantity(val);
                          if (Number(val) > 0) setFormInStock(true);
                        }}
                        placeholder="45"
                        className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-900 font-mono font-semibold text-stone-900"
                      />
                      <label className="inline-flex items-center gap-1.5 shrink-0 text-xs cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={formInStock}
                          onChange={(e) => setFormInStock(e.target.checked)}
                          className="rounded text-stone-900 focus:ring-stone-900"
                        />
                        <span>In Stock</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* 5. Category & Subcategory */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block font-semibold uppercase tracking-wider text-stone-700 text-[11px]">
                      Category *
                    </label>
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-900 text-stone-800"
                    >
                      {categories.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                      <option value="__NEW__">+ Add Custom Category...</option>
                    </select>

                    {formCategory === '__NEW__' && (
                      <input
                        type="text"
                        required
                        value={formCustomCategory}
                        onChange={(e) => setFormCustomCategory(e.target.value)}
                        placeholder="Type new category name..."
                        className="mt-1.5 w-full px-3 py-1.5 bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-900 text-xs"
                      />
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="block font-semibold uppercase tracking-wider text-stone-700 text-[11px]">
                      Sub-Category
                    </label>
                    <input
                      type="text"
                      value={formSubCategory}
                      onChange={(e) => setFormSubCategory(e.target.value)}
                      placeholder="e.g., Serums, Moisturizers, Cleansers"
                      className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-900 text-stone-800"
                    />
                  </div>
                </div>

                {/* 6. Volume & Featured Flag */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                  <div className="space-y-1">
                    <label className="block font-semibold uppercase tracking-wider text-stone-700 text-[11px]">
                      Volume / Size
                    </label>
                    <input
                      type="text"
                      value={formVolume}
                      onChange={(e) => setFormVolume(e.target.value)}
                      placeholder="e.g., 50ml / 1.7 oz"
                      className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-900 text-stone-800"
                    />
                  </div>

                  <div className="pt-4">
                    <label className="flex items-center gap-2 p-2.5 bg-stone-50 border border-stone-200 rounded-lg cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={formIsFeatured}
                        onChange={(e) => setFormIsFeatured(e.target.checked)}
                        className="rounded text-stone-900 focus:ring-stone-900"
                      />
                      <div>
                        <span className="font-semibold text-stone-900 block">Featured on Homepage</span>
                        <span className="text-[10px] text-stone-500">Show in the prominent featured carousel</span>
                      </div>
                    </label>
                  </div>
                </div>

                {/* 7. Description */}
                <div className="space-y-1">
                  <label className="block font-semibold uppercase tracking-wider text-stone-700 text-[11px]">
                    Detailed Description
                  </label>
                  <textarea
                    rows={3}
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="Describe the texture, benefits, and application rituals..."
                    className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-900 text-stone-800"
                  />
                </div>

                {/* Modal Footer Buttons */}
                <div className="pt-4 flex items-center justify-end gap-3 border-t border-stone-100">
                  <button
                    type="button"
                    disabled={isSavingProduct}
                    onClick={() => setIsProductModalOpen(false)}
                    className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl font-medium transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingProduct || isCompressingImage}
                    className="px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl font-semibold transition-all inline-flex items-center gap-2 cursor-pointer shadow-xs"
                  >
                    {isSavingProduct && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                    <span>{editingProduct ? 'Save Changes' : 'Create Product'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: DELETE PRODUCT CONFIRMATION                       */}
      {/* ======================================================== */}
      {deleteConfirmProduct && (
        <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
          <div
            className="fixed inset-0 bg-stone-900/40 backdrop-blur-xs transition-opacity"
            onClick={() => setDeleteConfirmProduct(null)}
          />

          <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
            <div className="relative transform overflow-hidden rounded-2xl bg-white text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-md border border-stone-200 p-6 space-y-4">
              <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-700 flex items-center justify-center mx-auto border border-rose-200">
                <Trash2 className="w-5 h-5" />
              </div>

              <div className="text-center space-y-2">
                <h3 className="font-editorial text-xl font-semibold text-stone-900">
                  Delete Formulation?
                </h3>
                <p className="text-xs text-stone-500 leading-relaxed">
                  Are you sure you want to remove <strong className="text-stone-900">{deleteConfirmProduct.title}</strong> from the catalog? This will remove it from the store and categories.
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setDeleteConfirmProduct(null)}
                  className="flex-1 py-2.5 px-3 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-medium rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDeleteProduct}
                  className="flex-1 py-2.5 px-3 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer shadow-xs"
                >
                  Yes, Remove Product
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: ORDER DETAILS DOSSIER                             */}
      {/* ======================================================== */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
          <div
            className="fixed inset-0 bg-stone-900/40 backdrop-blur-xs transition-opacity"
            onClick={() => setSelectedOrder(null)}
          />

          <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
            <div className="relative transform overflow-hidden rounded-2xl bg-white text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-2xl border border-stone-200 p-6 sm:p-8 space-y-6">
              {/* Modal Header */}
              <div className="flex items-start justify-between pb-4 border-b border-stone-100">
                <div>
                  <span className="font-mono text-xs text-stone-400 font-semibold">Order Dossier</span>
                  <h3 className="font-mono text-xl font-bold text-stone-900">{selectedOrder.id}</h3>
                  <div className="text-xs text-stone-500 mt-1 flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{new Date(selectedOrder.createdAt).toLocaleString()}</span>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-1.5 text-stone-400 hover:text-stone-700 rounded-md transition-colors cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Customer Information Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-stone-50 p-4 rounded-xl border border-stone-200/80 text-xs">
                <div className="space-y-1">
                  <span className="text-stone-400 uppercase tracking-wider font-semibold text-[10px]">Client</span>
                  <p className="font-semibold text-stone-900 text-sm">{selectedOrder.customerName}</p>
                  <a
                    href={`tel:${selectedOrder.customerPhone}`}
                    className="font-mono text-stone-700 hover:text-black inline-flex items-center gap-1 font-medium"
                  >
                    <Phone className="w-3.5 h-3.5 text-stone-400" />
                    <span>{selectedOrder.customerPhone}</span>
                  </a>
                </div>

                <div className="space-y-1">
                  <span className="text-stone-400 uppercase tracking-wider font-semibold text-[10px]">Delivery Destination</span>
                  <p className="font-semibold text-stone-900 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-stone-500 shrink-0" />
                    <span>{selectedOrder.wilaya}</span>
                  </p>
                  <p className="text-stone-600 leading-snug">{selectedOrder.address}</p>
                </div>

                {selectedOrder.notes && (
                  <div className="col-span-full pt-2 border-t border-stone-200/60">
                    <span className="text-stone-400 uppercase tracking-wider font-semibold text-[10px] block">Customer Notes</span>
                    <p className="italic text-stone-700 mt-0.5">{selectedOrder.notes}</p>
                  </div>
                )}
              </div>

              {/* Itemized Products */}
              <div className="space-y-3">
                <h4 className="text-xs uppercase tracking-wider font-semibold text-stone-700">
                  Ordered Products ({selectedOrder.items.length})
                </h4>

                <div className="divide-y divide-stone-100 border border-stone-100 rounded-xl overflow-hidden">
                  {selectedOrder.items.map((item) => (
                    <div key={item.productId} className="p-3 flex items-center justify-between gap-4 bg-white">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-12 h-12 object-cover rounded-md border border-stone-200 bg-stone-100 shrink-0"
                        />
                        <div>
                          <p className="font-medium text-stone-900 text-xs">{item.title}</p>
                          <p className="text-[11px] text-stone-400">{item.volume}</p>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="text-xs text-stone-500">
                          {item.quantity} × {item.price.toLocaleString()} DZD
                        </p>
                        <p className="font-mono font-bold text-stone-900 text-xs tabular-nums">
                          {item.lineTotal.toLocaleString()} DZD
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cost Summary */}
              <div className="p-4 bg-stone-50 rounded-xl space-y-1.5 text-xs text-stone-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-mono text-stone-900 tabular-nums">{selectedOrder.subtotal.toLocaleString()} DZD</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Fee</span>
                  <span className="font-mono text-stone-900 tabular-nums">
                    {selectedOrder.shipping === 0 ? 'FREE (0 DZD)' : `${selectedOrder.shipping.toLocaleString()} DZD`}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-stone-200 font-bold text-sm text-stone-900">
                  <span>Total Payable (COD)</span>
                  <span className="font-mono tabular-nums">{selectedOrder.total.toLocaleString()} DZD</span>
                </div>
              </div>

              {/* Status Update Quick Bar */}
              <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-stone-100">
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-stone-500 font-medium">Update Order Status:</span>
                  <select
                    value={selectedOrder.status}
                    onChange={(e) => {
                      const newSt = e.target.value as OrderStatus;
                      handleStatusChange(selectedOrder.id, newSt);
                      setSelectedOrder({ ...selectedOrder, status: newSt });
                    }}
                    className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-stone-300 bg-white cursor-pointer"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Preparing">Preparing</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>

                <button
                  onClick={() => setSelectedOrder(null)}
                  className="px-4 py-2 bg-stone-900 text-white rounded-lg text-xs font-semibold hover:bg-stone-800 transition-colors cursor-pointer"
                >
                  Close Dossier
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
