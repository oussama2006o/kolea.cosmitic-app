import React, { useState, useRef } from 'react';
import { Product } from '../types';
import { useCart } from '../graphql/client';
import { animateQuickAdd } from '../utils/animations';
import { ShoppingBag, Check, Eye, Package, Flame, AlertCircle } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onOpenDetails?: (product: Product) => void;
}

export function ProductCard({ product, onOpenDetails }: ProductCardProps) {
  const { addToCart, cartSummary } = useCart();
  const [justAdded, setJustAdded] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Check how many of this item is already in the cart
  const cartItem = cartSummary.items.find((item) => item.product.id === product.id);
  const currentQuantity = cartItem?.quantity || 0;

  // Authoritative stock calculation
  const stockQty =
    typeof product.stockQuantity === 'number'
      ? product.stockQuantity
      : product.inStock
      ? 25
      : 0;
  const isOutOfStock = stockQty <= 0 || !product.inStock;
  const isLowStock = !isOutOfStock && stockQty <= 8;
  const isMaxInBag = currentQuantity >= stockQty && !isOutOfStock;

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isOutOfStock || isMaxInBag) return;

    addToCart(product.id, 1);
    animateQuickAdd(buttonRef.current);
    setJustAdded(true);
    setTimeout(() => {
      setJustAdded(false);
    }, 1200);
  };

  return (
    <div
      onClick={() => onOpenDetails && onOpenDetails(product)}
      className="product-card-item group relative bg-white border border-stone-200/90 rounded-xl overflow-hidden hover:shadow-md transition-all duration-300 flex flex-col cursor-pointer"
    >
      {/* Visual Canvas */}
      <div className="relative aspect-[4/3] w-full bg-stone-100 overflow-hidden">
        <img
          src={product.image}
          alt={product.title}
          loading="lazy"
          className="w-full h-full object-cover object-center group-hover:scale-103 transition-transform duration-500 ease-out"
        />

        {/* Quick view floating hint on desktop hover */}
        <div className="absolute inset-0 bg-stone-900/15 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center p-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/95 text-stone-900 text-xs font-medium rounded-md shadow-sm backdrop-blur-xs">
            <Eye className="w-3.5 h-3.5 text-stone-700" />
            Quick Inspect
          </span>
        </div>

        {/* Client Stock Badge on Top Left */}
        <div className="absolute top-2.5 left-2.5 z-10 pointer-events-none">
          {isOutOfStock ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium bg-stone-900/90 text-rose-300 border border-rose-500/30 rounded-md shadow-xs backdrop-blur-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
              <span>0 pieces left</span>
            </span>
          ) : isLowStock ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold bg-amber-950/90 text-amber-200 border border-amber-500/40 rounded-md shadow-xs backdrop-blur-xs animate-pulse">
              <Flame className="w-3 h-3 text-amber-400 fill-amber-400" />
              <span>Only {stockQty} pieces left!</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium bg-stone-900/80 text-emerald-300 rounded-md shadow-xs backdrop-blur-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>{stockQty} pieces in stock</span>
            </span>
          )}
        </div>

        {/* Existing quantity badge if already in cart */}
        {currentQuantity > 0 && (
          <span className="absolute top-2.5 right-2.5 z-10 bg-stone-900/90 text-white text-[11px] font-mono px-2 py-0.5 rounded-sm tabular-nums">
            In Bag: {currentQuantity}
          </span>
        )}
      </div>

      {/* Product Content Block */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-1.5">
          {/* Clean Unboxed Metadata: Category & Volume */}
          <div className="flex items-center gap-2 text-xs text-stone-500 font-sans">
            <span className="uppercase tracking-wider font-medium text-[11px] text-stone-600">
              {product.category}
              {product.subCategory ? ` · ${product.subCategory}` : ''}
            </span>
            <span aria-hidden="true" className="text-stone-300">·</span>
            <span>{product.volume}</span>
          </div>

          {/* Product Title */}
          <h3 className="font-sans text-[15px] sm:text-base font-semibold text-stone-900 leading-snug line-clamp-1 group-hover:text-stone-700 transition-colors">
            {product.title}
          </h3>

          {/* Subtitle / Key Benefit */}
          <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed">
            {product.subtitle}
          </p>
        </div>

        {/* Clear Client Stock Inventory Indicator Bar */}
        <div className={`p-2 rounded-lg border text-xs flex items-center justify-between transition-colors ${
          isOutOfStock
            ? 'bg-rose-50/70 border-rose-200 text-rose-800'
            : isLowStock
            ? 'bg-amber-50/80 border-amber-200 text-amber-900'
            : 'bg-stone-50 border-stone-200/80 text-stone-700'
        }`}>
          <div className="flex items-center gap-1.5 min-w-0">
            <Package className={`w-3.5 h-3.5 shrink-0 ${
              isOutOfStock ? 'text-rose-500' : isLowStock ? 'text-amber-600' : 'text-stone-500'
            }`} />
            <span className="truncate text-[11px]">
              {isOutOfStock ? (
                <span className="font-semibold text-rose-700">Out of Stock · 0 pcs rest</span>
              ) : isLowStock ? (
                <span>
                  Limited stock: <strong className="font-mono font-bold text-amber-950 underline">{stockQty} pieces rest</strong>
                </span>
              ) : (
                <span>
                  Inventory: <strong className="font-mono font-semibold text-stone-900">{stockQty} pieces rest in stock</strong>
                </span>
              )}
            </span>
          </div>

          <span className="text-[10px] uppercase tracking-wider text-stone-400 font-mono shrink-0 pl-1">
            {isOutOfStock ? 'Sold Out' : `${stockQty} pcs`}
          </span>
        </div>

        {/* Price & Primary CTA */}
        <div className="pt-2 border-t border-stone-100 flex items-center justify-between gap-3">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-wider text-stone-400 font-medium">Price</span>
            <span className="font-mono text-base font-semibold text-stone-900 tabular-nums">
              {product.price.toLocaleString()} <span className="text-xs text-stone-600 font-sans">{product.currency}</span>
            </span>
          </div>

          {isOutOfStock ? (
            <button
              disabled
              className="px-3.5 py-2 text-xs font-medium uppercase tracking-wider rounded-lg bg-stone-200 text-stone-400 cursor-not-allowed whitespace-nowrap shrink-0 flex items-center gap-1.5"
              aria-label="Product is out of stock"
            >
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Out of Stock</span>
            </button>
          ) : isMaxInBag ? (
            <button
              disabled
              className="px-3 py-2 text-[11px] font-medium uppercase tracking-wider rounded-lg bg-stone-100 text-stone-500 border border-stone-200 cursor-not-allowed whitespace-nowrap shrink-0 flex items-center gap-1"
              aria-label="Max stock reached in bag"
            >
              <Check className="w-3.5 h-3.5 text-stone-500" />
              <span>Max in Bag ({stockQty})</span>
            </button>
          ) : (
            <button
              ref={buttonRef}
              onClick={handleAdd}
              className={`px-3.5 py-2 text-xs font-medium uppercase tracking-wider rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shadow-xs whitespace-nowrap shrink-0 ${
                justAdded
                  ? 'bg-emerald-800 text-white'
                  : 'bg-stone-900 hover:bg-stone-800 active:bg-black text-white'
              }`}
              aria-label={`Add ${product.title} to cart`}
            >
              {justAdded ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Added</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Add to Cart</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
