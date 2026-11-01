export type ProductCategory = 'Skincare' | 'Body Care' | 'Collections' | 'All' | string;

export interface Product {
  id: string;
  title: string;
  subtitle: string;
  price: number;
  currency: string;
  category: 'Skincare' | 'Body Care' | 'Collections' | string;
  subCategory?: string;
  volume: string;
  image: string;
  isFeatured: boolean;
  inStock: boolean;
  stockQuantity?: number;
  rating: number;
  reviewsCount: number;
  description: string;
  ingredients: string[];
  benefits: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  lineTotal: number;
}

export interface CartSummary {
  items: CartItem[];
  totalItems: number;
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
}

export interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  message: string;
  submittedAt: string;
  status: 'received' | 'processed';
}

export interface StoreInfo {
  name: string;
  phone: string;
  phoneFormatted: string;
  instagram: string;
  instagramHandle: string;
  addressText: string;
  googleMapsUrl: string;
  city: string;
  country: string;
  openingHours: string;
}
