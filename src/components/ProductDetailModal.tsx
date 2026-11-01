import React, { useState } from 'react';
import { Product } from '../types';
import { useCart } from '../graphql/client';
import {
  X,
  Check,
  ShoppingBag,
  Plus,
  Minus,
  Sparkles,
  ShieldCheck,
  Package,
  Flame,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
}

export function ProductDetailModal({ product, onClose }: ProductDetailModalProps) {
  const { addToCart, cartSummary } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  if (!product) return null;

  // Cart quantity already reserved
  const cartItem = cartSummary.items.find((item) => item.product.id === product.id);
  const inCartQty = cartItem?.quantity || 0;

  // Authoritative stock calculation
  const stockQty =
    typeof product.stockQuantity === 'number'
      ? product.stockQuantity
      : product.inStock
      ? 25
      : 0;
  const isOutOfStock = stockQty <= 0 || !product.inStock;
  const isLowStock = !isOutOfStock && stockQty <= 8;
  const maxAddable = Math.max(0, stockQty - inCartQty);

  const handleAdd = () => {
    if (isOutOfStock || maxAddable <= 0) return;
    const addCount = Math.min(quantity, maxAddable);
    addToCart(product.id, addCount);
    setAdded(true);
    setTimeout(() => {
      setAdded(false);
      onClose();
    }, 900);
  };

  const handleIncrease = () => {
    if (quantity < maxAddable) {
      setQuantity((prev) => prev + 1);
    }
  };

  const handleDecrease = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
      <div
        className="fixed inset-0 bg-stone-900/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
        <div className="relative transform overflow-hidden rounded-2xl bg-white text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-2xl border border-stone-200">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 text-stone-500 hover:text-stone-900 bg-white/80 backdrop-blur-sm rounded-full transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="grid grid-cols-1 sm:grid-cols-2">
            {/* Visual Column */}
            <div className="relative bg-stone-100 aspect-square sm:aspect-auto sm:h-full">
              <img
                src={product.image}
                alt={product.title}
                className="w-full h-full object-cover"
              />

              {/* Floating Stock Tag on Image */}
              <div className="absolute top-4 left-4 z-10">
                {isOutOfStock ? (
                  <span className="px-3 py-1.5 text-xs font-semibold bg-stone-900/90 text-rose-300 border border-rose-500/40 rounded-lg shadow-sm backdrop-blur-xs flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-400" />
                    <span>0 pieces left</span>
                  </span>
                ) : isLowStock ? (
                  <span className="px-3 py-1.5 text-xs font-semibold bg-amber-950/90 text-amber-200 border border-amber-500/50 rounded-lg shadow-sm backdrop-blur-xs flex items-center gap-1.5 animate-pulse">
                    <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    <span>Only {stockQty} pieces left!</span>
                  </span>
                ) : (
                  <span className="px-3 py-1.5 text-xs font-medium bg-stone-900/80 text-emerald-300 rounded-lg shadow-sm backdrop-blur-xs flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span>{stockQty} pieces in stock</span>
                  </span>
                )}
              </div>
            </div>

            {/* Content Column */}
            <div className="p-6 sm:p-8 flex flex-col justify-between space-y-5">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs text-stone-500">
                  <span className="uppercase tracking-widest font-medium text-stone-700">
                    {product.category}
                    {product.subCategory ? ` · ${product.subCategory}` : ''}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>{product.volume}</span>
                </div>

                <h2 className="font-editorial text-2xl font-semibold text-stone-900 leading-snug">
                  {product.title}
                </h2>

                <p className="text-sm text-stone-600 leading-relaxed font-light">
                  {product.description}
                </p>

                {/* Prominent Client Stock Indicator Box */}
                <div
                  className={`p-3 rounded-xl border text-xs transition-all ${
                    isOutOfStock
                      ? 'bg-rose-50 border-rose-200 text-rose-900'
                      : isLowStock
                      ? 'bg-amber-50 border-amber-200 text-amber-950'
                      : 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                  }`}
                >
                  <div className="flex items-center justify-between font-medium">
                    <span className="flex items-center gap-2">
                      {isOutOfStock ? (
                        <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      ) : isLowStock ? (
                        <Flame className="w-4 h-4 text-amber-600 fill-amber-500 shrink-0" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      )}
                      <span>
                        {isOutOfStock
                          ? 'Out of Stock'
                          : isLowStock
                          ? 'Limited Availability'
                          : 'Available at Atelier'}
                      </span>
                    </span>

                    <span className="font-mono font-bold text-sm">
                      {isOutOfStock ? '0 pcs' : `${stockQty} pieces left`}
                    </span>
                  </div>

                  <p className="mt-1 text-[11px] leading-relaxed opacity-90">
                    {isOutOfStock
                      ? '0 pieces rest in the stock at our Koléa atelier. Check back shortly for restocking.'
                      : isLowStock
                      ? `Hurry! Only ${stockQty} pieces rest in the stock. Order now to secure yours before it sells out.`
                      : `Currently ${stockQty} pieces are available in stock for immediate order and nationwide dispatch.`}
                  </p>

                  {inCartQty > 0 && !isOutOfStock && (
                    <div className="mt-1.5 pt-1.5 border-t border-stone-200/60 text-[11px] text-stone-600 flex justify-between">
                      <span>Already in your shopping bag:</span>
                      <strong className="font-mono text-stone-900">{inCartQty} pcs</strong>
                    </div>
                  )}
                </div>

                {/* Benefits */}
                <div className="pt-2 space-y-1.5 border-t border-stone-100">
                  <span className="text-xs uppercase tracking-wider font-semibold text-stone-700 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-stone-600" />
                    Key Dermal Benefits
                  </span>
                  <ul className="text-xs text-stone-600 space-y-1 list-disc list-inside">
                    {product.benefits.map((b, idx) => (
                      <li key={idx}>{b}</li>
                    ))}
                  </ul>
                </div>

                {/* Key Ingredients */}
                <div className="pt-2 space-y-1 border-t border-stone-100">
                  <span className="text-xs uppercase tracking-wider font-semibold text-stone-700 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-stone-600" />
                    Botanical Actives
                  </span>
                  <p className="text-xs text-stone-500 leading-normal">
                    {product.ingredients.join(', ')}
                  </p>
                </div>
              </div>

              {/* Purchase Module */}
              <div className="pt-4 border-t border-stone-200 space-y-4">
                <div className="flex items-baseline justify-between">
                  <div>
                    <span className="text-xs text-stone-500 block">Formulation Price</span>
                    <span className="font-mono text-xl font-bold text-stone-900 tabular-nums">
                      {product.price.toLocaleString()} {product.currency}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] uppercase tracking-wider text-stone-400 block font-medium">
                      Stock Status
                    </span>
                    <span className="text-xs font-mono font-semibold text-stone-800">
                      {isOutOfStock ? (
                        <span className="text-rose-600">0 pieces</span>
                      ) : (
                        <span>{stockQty} pieces rest in stock</span>
                      )}
                    </span>
                  </div>
                </div>

                {isOutOfStock ? (
                  <div className="p-3 bg-stone-100 rounded-xl text-center text-xs text-stone-500 font-medium">
                    This formulation is currently sold out (0 pieces in stock).
                  </div>
                ) : maxAddable <= 0 ? (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-center text-xs text-amber-900 font-medium">
                    You have all available {stockQty} pieces in your shopping bag.
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center border border-stone-300 rounded-lg bg-stone-50">
                        <button
                          onClick={handleDecrease}
                          disabled={quantity <= 1}
                          className="px-2.5 py-2 text-stone-600 hover:text-stone-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-2 text-xs font-mono font-medium text-stone-900 tabular-nums">
                          {quantity}
                        </span>
                        <button
                          onClick={handleIncrease}
                          disabled={quantity >= maxAddable}
                          className="px-2.5 py-2 text-stone-600 hover:text-stone-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <button
                        onClick={handleAdd}
                        className={`flex-1 py-3 px-4 text-xs font-semibold uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs ${
                          added
                            ? 'bg-emerald-800 text-white'
                            : 'bg-stone-900 hover:bg-stone-800 text-white'
                        }`}
                      >
                        {added ? (
                          <>
                            <Check className="w-4 h-4" />
                            <span>Added to Bag</span>
                          </>
                        ) : (
                          <>
                            <ShoppingBag className="w-4 h-4" />
                            <span>Add {quantity} to Bag</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="text-[11px] text-stone-500 text-center font-mono">
                      {quantity >= maxAddable ? (
                        <span className="text-amber-800 font-medium">
                          Maximum available atelier stock selected ({maxAddable} pieces)
                        </span>
                      ) : (
                        <span>
                          {stockQty - (inCartQty + quantity)} pieces remaining in stock after this
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
