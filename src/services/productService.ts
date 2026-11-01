import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  getDocs,
  query,
  writeBatch,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase/config';
import { Product } from '../types';
import { INITIAL_PRODUCTS } from '../data/mockData';

const CACHE_KEY = 'kolea_cosmetic_products_cache';
const CATEGORIES_KEY = 'kolea_cosmetic_categories_cache';
const DEFAULT_CATEGORIES = ['Skincare', 'Body Care', 'Collections'];

type ProductListener = (products: Product[]) => void;
type CategoryListener = (categories: string[]) => void;

class ProductService {
  private products: Product[] = [];
  private categories: string[] = DEFAULT_CATEGORIES;
  private productListeners: Set<ProductListener> = new Set();
  private categoryListeners: Set<CategoryListener> = new Set();
  private isInitialized = false;
  private unsubscribeFirestore: (() => void) | null = null;

  constructor() {
    this.loadFromCache();
    this.initFirestoreListener();
  }

  private loadFromCache() {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.products = parsed.map((p: any) => {
            const initial = INITIAL_PRODUCTS.find((init) => init.id === p.id);
            return {
              ...p,
              stockQuantity: typeof p.stockQuantity === 'number'
                ? p.stockQuantity
                : (initial?.stockQuantity ?? (p.inStock ? 25 : 0)),
            };
          });
        }
      }
    } catch (e) {
      console.warn('Could not read cached products', e);
    }

    if (this.products.length === 0) {
      // Default fallback to INITIAL_PRODUCTS
      this.products = INITIAL_PRODUCTS.map((p) => ({
        ...p,
        stockQuantity: p.stockQuantity ?? (p.inStock ? 25 : 0),
      }));
    }

    try {
      const cachedCats = localStorage.getItem(CATEGORIES_KEY);
      if (cachedCats) {
        const parsed = JSON.parse(cachedCats);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.categories = Array.from(new Set([...DEFAULT_CATEGORIES, ...parsed]));
        }
      }
    } catch {
      // Ignore
    }
  }

  private persistCache() {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(this.products));
      localStorage.setItem(CATEGORIES_KEY, JSON.stringify(this.categories));
    } catch (e) {
      console.warn('Could not persist products to local cache', e);
    }
  }

  private notify() {
    this.persistCache();
    this.productListeners.forEach((fn) => {
      try {
        fn([...this.products]);
      } catch (err) {
        console.error('Error in product listener', err);
      }
    });
  }

  private notifyCategories() {
    this.persistCache();
    this.categoryListeners.forEach((fn) => {
      try {
        fn([...this.categories]);
      } catch (err) {
        console.error('Error in category listener', err);
      }
    });
  }

  public subscribe(listener: ProductListener): () => void {
    this.productListeners.add(listener);
    // immediately invoke with current state
    listener([...this.products]);
    return () => {
      this.productListeners.delete(listener);
    };
  }

  public subscribeCategories(listener: CategoryListener): () => void {
    this.categoryListeners.add(listener);
    listener([...this.categories]);
    return () => {
      this.categoryListeners.delete(listener);
    };
  }

  private initFirestoreListener() {
    try {
      const productsCol = collection(db, 'products');
      this.unsubscribeFirestore = onSnapshot(
        productsCol,
        (snapshot) => {
          if (!snapshot.empty) {
            const firestoreProducts: Product[] = [];
            snapshot.forEach((docSnap) => {
              const data = docSnap.data() as Product;
              firestoreProducts.push({
                ...data,
                id: docSnap.id,
                stockQuantity: data.stockQuantity ?? (data.inStock ? 50 : 0),
              });
            });

            // Sort products by creation date or retain orderly display
            this.products = firestoreProducts;
            this.updateDerivedCategories();
            this.notify();
          } else if (!this.isInitialized) {
            // First time or collection empty - we keep initial products in local state
            this.notify();
          }
          this.isInitialized = true;
        },
        (error) => {
          console.warn('Firestore products listener warning (using cached catalog):', error.message);
          this.isInitialized = true;
        }
      );
    } catch (err) {
      console.warn('Failed to attach Firestore products listener:', err);
    }
  }

  private updateDerivedCategories() {
    const existing = new Set(this.categories);
    this.products.forEach((p) => {
      if (p.category && !existing.has(p.category)) {
        existing.add(p.category);
      }
    });
    this.categories = Array.from(existing);
  }

  public getProducts(): Product[] {
    return [...this.products];
  }

  public getProduct(id: string): Product | undefined {
    return this.products.find((p) => p.id === id);
  }

  public getCategories(): string[] {
    return [...this.categories];
  }

  /**
   * Seeds INITIAL_PRODUCTS into Firestore if admin wants to ensure cloud persistence.
   */
  public async seedDefaultCatalogToFirestore(): Promise<number> {
    try {
      const batch = writeBatch(db);
      for (const p of INITIAL_PRODUCTS) {
        const docRef = doc(db, 'products', p.id);
        const itemWithStock: Product = {
          ...p,
          stockQuantity: p.stockQuantity ?? 50,
          inStock: true,
          updatedAt: new Date().toISOString(),
        };
        batch.set(docRef, itemWithStock);
      }
      await batch.commit();
      return INITIAL_PRODUCTS.length;
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'products');
    }
  }

  /**
   * Creates or updates a product.
   * Can update: Name (title), Price, Quintet/Quantity (stockQuantity), Picture (image), Category, etc.
   */
  public async saveProduct(
    productData: Partial<Product> & { title: string; price: number; category: string }
  ): Promise<Product> {
    const isNew = !productData.id || productData.id.trim() === '';
    const id = isNew
      ? `prod_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`
      : productData.id!;

    const stockQty = Number(productData.stockQuantity ?? (productData.inStock === false ? 0 : 40));
    const isInStock = stockQty > 0 && productData.inStock !== false;

    const existingProduct = this.products.find((p) => p.id === id);

    const updatedProduct: Product = {
      id,
      title: productData.title.trim(),
      subtitle: productData.subtitle?.trim() || existingProduct?.subtitle || 'Luxury Botanical Formulation',
      price: Math.max(0, Math.round(Number(productData.price))),
      currency: 'DZD',
      category: productData.category.trim() || 'Skincare',
      subCategory: productData.subCategory?.trim() || existingProduct?.subCategory || '',
      volume: productData.volume?.trim() || existingProduct?.volume || '50ml',
      image: productData.image?.trim() || existingProduct?.image || '/placeholder-serum.png',
      isFeatured: productData.isFeatured ?? existingProduct?.isFeatured ?? false,
      inStock: isInStock,
      stockQuantity: stockQty,
      rating: productData.rating ?? existingProduct?.rating ?? 5.0,
      reviewsCount: productData.reviewsCount ?? existingProduct?.reviewsCount ?? 12,
      description:
        productData.description?.trim() ||
        existingProduct?.description ||
        'Formulated with Mediterranean botanicals in Koléa atelier.',
      ingredients: productData.ingredients || existingProduct?.ingredients || [
        'Botanical Complex',
        'Cold-Pressed Plant Oils',
        'Natural Damask Rose Hydrosol',
      ],
      benefits: productData.benefits || existingProduct?.benefits || [
        'Deep hydration and epidermal revitalisation',
        'Softens texture and enhances radiance',
      ],
      createdAt: existingProduct?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Update local cache and state immediately
    const existingIndex = this.products.findIndex((p) => p.id === id);
    if (existingIndex >= 0) {
      this.products[existingIndex] = updatedProduct;
    } else {
      this.products.unshift(updatedProduct);
    }

    if (!this.categories.includes(updatedProduct.category)) {
      this.categories.push(updatedProduct.category);
      this.notifyCategories();
    }

    this.notify();

    // Persist to Firestore
    try {
      const docRef = doc(db, 'products', id);
      await setDoc(docRef, updatedProduct);
    } catch (err: any) {
      console.warn('Firestore write warning (local state updated):', err?.message);
      // We don't throw if it's already updated locally, but if permission error we log
    }

    return updatedProduct;
  }

  /**
   * Removes / deletes a product
   */
  public async deleteProduct(id: string): Promise<void> {
    const existingIndex = this.products.findIndex((p) => p.id === id);
    if (existingIndex >= 0) {
      this.products.splice(existingIndex, 1);
      this.notify();
    }

    try {
      const docRef = doc(db, 'products', id);
      await deleteDoc(docRef);
    } catch (err: any) {
      console.warn('Firestore delete warning (local state updated):', err?.message);
    }
  }

  /**
   * Decrements stock quantity after a confirmed customer order
   */
  public async decrementStock(productId: string, quantityToDeduct: number): Promise<void> {
    const existingIndex = this.products.findIndex((p) => p.id === productId);
    if (existingIndex >= 0) {
      const prod = this.products[existingIndex];
      const currentStock = prod.stockQuantity ?? (prod.inStock ? 25 : 0);
      const newStock = Math.max(0, currentStock - quantityToDeduct);
      const updated: Product = {
        ...prod,
        stockQuantity: newStock,
        inStock: newStock > 0,
        updatedAt: new Date().toISOString(),
      };
      this.products[existingIndex] = updated;
      this.notify();

      try {
        const docRef = doc(db, 'products', productId);
        await setDoc(docRef, { stockQuantity: newStock, inStock: newStock > 0 }, { merge: true });
      } catch (err: any) {
        console.warn('Could not sync stock decrement to Firestore:', err?.message);
      }
    }
  }

  /**
   * Adds a new category
   */
  public async addCategory(name: string): Promise<void> {
    const clean = name.trim();
    if (!clean) return;
    if (!this.categories.includes(clean)) {
      this.categories.push(clean);
      this.notifyCategories();

      try {
        const catDoc = doc(db, 'categories', clean.toLowerCase().replace(/\s+/g, '-'));
        await setDoc(catDoc, { name: clean, createdAt: new Date().toISOString() });
      } catch (err) {
        console.warn('Firestore category write note:', err);
      }
    }
  }

  /**
   * Removes a category
   */
  public async removeCategory(name: string): Promise<void> {
    const clean = name.trim();
    this.categories = this.categories.filter((c) => c !== clean);
    this.notifyCategories();

    try {
      const catDoc = doc(db, 'categories', clean.toLowerCase().replace(/\s+/g, '-'));
      await deleteDoc(catDoc);
    } catch (err) {
      console.warn('Firestore category delete note:', err);
    }
  }
}

export const productService = new ProductService();
