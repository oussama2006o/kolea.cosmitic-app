import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import { Product, CartItem, CartSummary, ContactSubmission, StoreInfo } from '../types';
import { STORE_INFO } from '../data/mockData';
import { productService } from '../services/productService';

type Listener = () => void;

interface GraphQLState {
  products: Product[];
  cart: Map<string, number>; // productId -> quantity
  contactSubmissions: ContactSubmission[];
  storeInfo: StoreInfo;
}

class GraphQLService {
  private state: GraphQLState;
  private listeners: Set<Listener> = new Set();
  private isBatching = false;
  private pendingBroadcast = false;

  constructor() {
    const savedCart = this.loadCartFromStorage();
    this.state = {
      products: productService.getProducts(),
      cart: savedCart,
      contactSubmissions: [],
      storeInfo: STORE_INFO,
    };

    // Keep in sync with productService updates in real time
    productService.subscribe((updatedProducts) => {
      this.state.products = updatedProducts;
      this.notify();
    });
  }

  private loadCartFromStorage(): Map<string, number> {
    try {
      const data = localStorage.getItem('kolea_cosmetic_cart');
      if (data) {
        const parsed = JSON.parse(data);
        return new Map(Object.entries(parsed));
      }
    } catch {
      // Ignore storage errors in restricted contexts
    }
    // Default initial cart: start empty or with 1 sample item if desired
    return new Map();
  }

  private persistCart() {
    try {
      const obj: Record<string, number> = {};
      this.state.cart.forEach((qty, id) => {
        obj[id] = qty;
      });
      localStorage.setItem('kolea_cosmetic_cart', JSON.stringify(obj));
    } catch {
      // Ignore
    }
  }

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    if (this.isBatching) {
      this.pendingBroadcast = true;
      return;
    }
    this.listeners.forEach((fn) => fn());
  }

  // High-frequency batched update utility
  public batch(fn: () => void) {
    this.isBatching = true;
    try {
      fn();
    } finally {
      this.isBatching = false;
      if (this.pendingBroadcast) {
        this.pendingBroadcast = false;
        this.notify();
      }
    }
  }

  public getCartSummary(): CartSummary {
    const items: CartItem[] = [];
    let totalItems = 0;
    let subtotal = 0;

    this.state.cart.forEach((quantity, productId) => {
      const product = this.state.products.find((p) => p.id === productId);
      if (product && quantity > 0) {
        const lineTotal = product.price * quantity;
        items.push({
          product,
          quantity,
          lineTotal,
        });
        totalItems += quantity;
        subtotal += lineTotal;
      }
    });

    // Free delivery threshold: above 6000 DZD, standard delivery 500 DZD (or 0 if empty)
    const shipping = subtotal > 0 ? (subtotal >= 6000 ? 0 : 500) : 0;
    const tax = 0;
    const total = subtotal + shipping;

    return {
      items,
      totalItems,
      subtotal,
      shipping,
      tax,
      total,
    };
  }

  // GraphQL Executor interface: query & mutation
  public async execute<TData = any>(
    queryOrMutation: string,
    variables: Record<string, any> = {}
  ): Promise<{ data?: TData; errors?: { message: string }[] }> {
    const normalized = queryOrMutation.replace(/\s+/g, ' ').trim();

    // Query: products
    if (normalized.includes('products(') || normalized.includes('products {') || normalized.includes('query GetProducts')) {
      let filtered = [...this.state.products];
      if (variables.category && variables.category !== 'All') {
        filtered = filtered.filter(
          (p) => p.category === variables.category || p.subCategory === variables.category
        );
      }
      if (variables.search) {
        const s = variables.search.toLowerCase().trim();
        filtered = filtered.filter(
          (p) =>
            p.title.toLowerCase().includes(s) ||
            p.subtitle.toLowerCase().includes(s) ||
            p.description.toLowerCase().includes(s)
        );
      }
      if (variables.sort) {
        if (variables.sort === 'price-asc') {
          filtered.sort((a, b) => a.price - b.price);
        } else if (variables.sort === 'price-desc') {
          filtered.sort((a, b) => b.price - a.price);
        } else if (variables.sort === 'rating') {
          filtered.sort((a, b) => b.rating - a.rating);
        }
      }
      return { data: { products: filtered } as unknown as TData };
    }

    // Query: featuredProducts
    if (normalized.includes('featuredProducts')) {
      const featured = this.state.products.filter((p) => p.isFeatured);
      return { data: { featuredProducts: featured } as unknown as TData };
    }

    // Query: product by ID
    if (normalized.includes('product(') || normalized.includes('query GetProduct(')) {
      const p = this.state.products.find((item) => item.id === variables.id);
      return { data: { product: p || null } as unknown as TData };
    }

    // Query: cartSummary
    if (normalized.includes('cartSummary')) {
      return { data: { cartSummary: this.getCartSummary() } as unknown as TData };
    }

    // Query: storeInfo
    if (normalized.includes('storeInfo')) {
      return { data: { storeInfo: this.state.storeInfo } as unknown as TData };
    }

    // Mutation: addToCart
    if (normalized.includes('addToCart')) {
      const { productId, quantity = 1 } = variables;
      const targetProduct = this.state.products.find((p) => p.id === productId);
      const maxStock = targetProduct
        ? (typeof targetProduct.stockQuantity === 'number'
            ? targetProduct.stockQuantity
            : (targetProduct.inStock ? 25 : 0))
        : 99;

      if (maxStock <= 0) {
        return { data: { addToCart: this.getCartSummary() } as unknown as TData };
      }

      const current = this.state.cart.get(productId) || 0;
      const targetQty = Math.min(maxStock, current + quantity);
      this.state.cart.set(productId, targetQty);
      this.persistCart();
      this.notify();
      return { data: { addToCart: this.getCartSummary() } as unknown as TData };
    }

    // Mutation: updateCartQuantity
    if (normalized.includes('updateCartQuantity')) {
      const { productId, quantity } = variables;
      if (quantity <= 0) {
        this.state.cart.delete(productId);
      } else {
        const targetProduct = this.state.products.find((p) => p.id === productId);
        const maxStock = targetProduct
          ? (typeof targetProduct.stockQuantity === 'number'
              ? targetProduct.stockQuantity
              : (targetProduct.inStock ? 25 : 0))
          : 99;
        const targetQty = Math.min(maxStock, quantity);
        this.state.cart.set(productId, targetQty);
      }
      this.persistCart();
      this.notify();
      return { data: { updateCartQuantity: this.getCartSummary() } as unknown as TData };
    }

    // Mutation: removeFromCart
    if (normalized.includes('removeFromCart')) {
      const { productId } = variables;
      this.state.cart.delete(productId);
      this.persistCart();
      this.notify();
      return { data: { removeFromCart: this.getCartSummary() } as unknown as TData };
    }

    // Mutation: clearCart
    if (normalized.includes('clearCart')) {
      this.state.cart.clear();
      this.persistCart();
      this.notify();
      return { data: { clearCart: this.getCartSummary() } as unknown as TData };
    }

    // Mutation: submitContact
    if (normalized.includes('submitContact')) {
      const { input } = variables;
      const submission: ContactSubmission = {
        id: `sub_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        name: input.name,
        email: input.email,
        message: input.message,
        submittedAt: new Date().toISOString(),
        status: 'received',
      };
      this.state.contactSubmissions.push(submission);
      this.notify();
      return { data: { submitContact: submission } as unknown as TData };
    }

    return { errors: [{ message: `Unrecognized GraphQL operation: ${queryOrMutation}` }] };
  }

  public getCartMap(): Map<string, number> {
    return new Map(this.state.cart);
  }
}

export const graphQLClient = new GraphQLService();

// React Context & Hooks
interface GraphQLContextValue {
  client: GraphQLService;
  cartSummary: CartSummary;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  addToCart: (productId: string, quantity?: number) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  getCartMap: () => Map<string, number>;
}

const GraphQLContext = createContext<GraphQLContextValue | null>(null);

export function GraphQLProvider({ children }: { children: ReactNode }) {
  const [cartSummary, setCartSummary] = useState<CartSummary>(() => graphQLClient.getCartSummary());
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = graphQLClient.subscribe(() => {
      setCartSummary(graphQLClient.getCartSummary());
    });
    return unsubscribe;
  }, []);

  const addToCart = useCallback((productId: string, quantity = 1) => {
    graphQLClient.execute(
      `mutation AddToCart($productId: ID!, $quantity: Int) {
        addToCart(productId: $productId, quantity: $quantity) {
          totalItems
        }
      }`,
      { productId, quantity }
    );
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    graphQLClient.execute(
      `mutation UpdateCartQuantity($productId: ID!, $quantity: Int!) {
        updateCartQuantity(productId: $productId, quantity: $quantity) {
          totalItems
        }
      }`,
      { productId, quantity }
    );
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    graphQLClient.execute(
      `mutation RemoveFromCart($productId: ID!) {
        removeFromCart(productId: $productId) {
          totalItems
        }
      }`,
      { productId }
    );
  }, []);

  const clearCart = useCallback(() => {
    graphQLClient.execute(`mutation ClearCart { clearCart { totalItems } }`);
  }, []);

  const getCartMap = useCallback(() => {
    return graphQLClient.getCartMap();
  }, []);

  return (
    <GraphQLContext.Provider
      value={{
        client: graphQLClient,
        cartSummary,
        isCartOpen,
        setIsCartOpen,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        getCartMap,
      }}
    >
      {children}
    </GraphQLContext.Provider>
  );
}

export function useCart() {
  const context = useContext(GraphQLContext);
  if (!context) {
    throw new Error('useCart must be used within a GraphQLProvider');
  }
  return context;
}

export function useGraphQLQuery<TData = any>(
  query: string,
  variables: Record<string, any> = {}
) {
  const [data, setData] = useState<TData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const serializedVars = JSON.stringify(variables);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await graphQLClient.execute<TData>(query, JSON.parse(serializedVars));
      if (res.errors && res.errors.length > 0) {
        setError(res.errors[0].message);
      } else if (res.data) {
        setData(res.data);
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to execute query');
    } finally {
      setLoading(false);
    }
  }, [query, serializedVars]);

  useEffect(() => {
    fetch();
    const unsub = graphQLClient.subscribe(() => {
      fetch();
    });
    return unsub;
  }, [fetch]);

  return { data, loading, error, refetch: fetch };
}
