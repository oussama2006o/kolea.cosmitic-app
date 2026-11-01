import { doc, setDoc, updateDoc, collection, query, orderBy, onSnapshot, getDocs } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase/config';
import { INITIAL_PRODUCTS } from '../data/mockData';
import { productService } from './productService';

export type OrderStatus = 'Pending' | 'Confirmed' | 'Preparing' | 'Shipped' | 'Delivered' | 'Cancelled';

export interface OrderLineItem {
  productId: string;
  title: string;
  volume: string;
  price: number;
  quantity: number;
  lineTotal: number;
  image: string;
}

export interface CustomerOrder {
  id: string;
  customerName: string;
  customerPhone: string;
  wilaya: string;
  address: string;
  notes?: string;
  items: OrderLineItem[];
  subtotal: number;
  shipping: number;
  total: number;
  currency: string;
  status: OrderStatus;
  createdAt: string;
}

export interface CheckoutCustomerInput {
  name: string;
  phone: string;
  wilaya: string;
  address: string;
  notes?: string;
}

class OrderService {
  private inFlightSubmissions = new Set<string>();

  /**
   * Validates cart items against the authoritative product catalog,
   * calculates accurate pricing, and persists the order to Firebase Firestore.
   */
  public async submitOrder(
    customer: CheckoutCustomerInput,
    cartItemsMap: Map<string, number>
  ): Promise<CustomerOrder> {
    if (!customer.name.trim()) throw new Error('Customer name is required.');
    if (!customer.phone.trim()) throw new Error('Customer phone number is required.');
    if (!customer.address.trim()) throw new Error('Delivery address is required.');

    // Prevent duplicate submission with idempotency key based on phone and payload hash
    const submissionKey = `${customer.phone.trim()}_${Array.from(cartItemsMap.entries()).sort().join('_')}`;
    if (this.inFlightSubmissions.has(submissionKey)) {
      throw new Error('An identical order submission is currently being processed. Please wait a moment.');
    }

    this.inFlightSubmissions.add(submissionKey);

    try {
      // 1. Authoritative Validation: verify product IDs and prices against trusted INITIAL_PRODUCTS
      const validatedItems: OrderLineItem[] = [];
      let calculatedSubtotal = 0;

      for (const [productId, quantity] of cartItemsMap.entries()) {
        if (quantity <= 0) continue;
        const trustedProduct = productService.getProduct(productId) || INITIAL_PRODUCTS.find((p) => p.id === productId);
        if (!trustedProduct) {
          throw new Error(`Product reference "${productId}" is no longer available in the catalog.`);
        }

        const price = trustedProduct.price; // Trust only catalog price
        const lineTotal = price * quantity;
        calculatedSubtotal += lineTotal;

        validatedItems.push({
          productId: trustedProduct.id,
          title: trustedProduct.title,
          volume: trustedProduct.volume,
          price,
          quantity,
          lineTotal,
          image: trustedProduct.image,
        });
      }

      if (validatedItems.length === 0) {
        throw new Error('Cannot place an order with an empty shopping bag.');
      }

      // 2. Authoritative Shipping calculation
      // Free delivery for Pôle Universitaire Koléa or orders >= 6000 DZD
      const isPoleUniv = customer.wilaya === 'Pôle Universitaire Koléa';
      const shipping = isPoleUniv || calculatedSubtotal >= 6000 ? 0 : 500;
      const total = calculatedSubtotal + shipping;

      // 3. Unique Order ID generation
      const timestamp = Date.now();
      const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
      const orderId = `KC-${timestamp.toString().slice(-6)}-${randomSuffix}`;

      const orderData: CustomerOrder = {
        id: orderId,
        customerName: customer.name.trim(),
        customerPhone: customer.phone.trim(),
        wilaya: customer.wilaya.trim(),
        address: customer.address.trim(),
        notes: customer.notes?.trim() || '',
        items: validatedItems,
        subtotal: calculatedSubtotal,
        shipping,
        total,
        currency: 'DZD',
        status: 'Pending',
        createdAt: new Date().toISOString(),
      };

      // 4. Save to Firestore
      const path = `orders/${orderId}`;
      try {
        const orderRef = doc(db, 'orders', orderId);
        await setDoc(orderRef, orderData);
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, path);
      }

      // 5. Deduct pieces from inventory in real-time so client sees updated stock
      for (const item of validatedItems) {
        try {
          await productService.decrementStock(item.productId, item.quantity);
        } catch (e) {
          console.warn('Could not decrement stock for item', item.productId, e);
        }
      }

      return orderData;
    } finally {
      // Release in-flight lock after short delay to prevent double-clicks
      setTimeout(() => {
        this.inFlightSubmissions.delete(submissionKey);
      }, 3000);
    }
  }

  /**
   * Subscribes to real-time order updates for the Admin Dashboard
   */
  public subscribeToOrders(
    onUpdate: (orders: CustomerOrder[]) => void,
    onError: (error: Error) => void
  ): () => void {
    const ordersQuery = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));

    return onSnapshot(
      ordersQuery,
      (snapshot) => {
        const orders: CustomerOrder[] = [];
        snapshot.forEach((docSnap) => {
          orders.push(docSnap.data() as CustomerOrder);
        });
        onUpdate(orders);
      },
      (error) => {
        try {
          handleFirestoreError(error, OperationType.LIST, 'orders');
        } catch (wrappedErr: any) {
          onError(wrappedErr);
        }
      }
    );
  }

  /**
   * Admin-only status update (Pending -> Confirmed -> Preparing -> Shipped -> Delivered -> Cancelled)
   */
  public async updateOrderStatus(orderId: string, newStatus: OrderStatus): Promise<void> {
    const path = `orders/${orderId}`;
    try {
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, { status: newStatus });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, path);
    }
  }
}

export const orderService = new OrderService();
