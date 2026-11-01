import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Product } from '../types';
import { useCart } from '../graphql/client';
import { useRouter } from '../router/Router';
import { animateSliderTransition, animateQuickAdd } from '../utils/animations';
import {
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
  Check,
  Sparkles,
  ArrowRight,
  Eye,
  Layers,
  PackageOpen,
  Droplets,
  Flame,
  Package,
} from 'lucide-react';

interface FeaturedSliderProps {
  products: Product[];
  onOpenDetails?: (product: Product) => void;
}

type FilterTab = 'All' | 'Collections' | 'Skincare' | 'Body Care';

export function FeaturedSlider({ products, onOpenDetails }: FeaturedSliderProps) {
  const [activeTab, setActiveTab] = useState<FilterTab>('All');
  const [currentIndex, setCurrentIndex] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const { addToCart } = useCart();
  const { navigate } = useRouter();
  const [addedId, setAddedId] = useState<string | null>(null);

  // Filter products by selected tab if user wants to narrow down
  const filteredProducts = useMemo(() => {
    if (activeTab === 'All') return products;
    return products.filter((p) => p.category === activeTab);
  }, [products, activeTab]);

  const total = filteredProducts.length;

  // Whenever filter tab changes, reset to first slide smoothly
  useEffect(() => {
    setCurrentIndex(0);
    if (trackRef.current) {
      animateSliderTransition(trackRef.current, 0, total);
    }
  }, [activeTab, total]);

  const goToSlide = useCallback(
    (index: number) => {
      if (total <= 0) return;
      let nextIdx = index;
      if (nextIdx < 0) nextIdx = total - 1;
      if (nextIdx >= total) nextIdx = 0;
      setCurrentIndex(nextIdx);

      if (trackRef.current) {
        animateSliderTransition(trackRef.current, nextIdx, total);
      }
    },
    [total]
  );

  const handlePrev = () => goToSlide(currentIndex - 1);
  const handleNext = () => goToSlide(currentIndex + 1);

  // Autoplay with hover pause
  const [isPaused, setIsPaused] = useState(false);
  useEffect(() => {
    if (isPaused || total <= 1) return;
    const interval = setInterval(() => {
      goToSlide(currentIndex + 1);
    }, 5000);
    return () => clearInterval(interval);
  }, [currentIndex, isPaused, total, goToSlide]);

  // Touch Swipe handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      handleNext();
    } else if (isRightSwipe) {
      handlePrev();
    }

    touchStartX.current = null;
    touchEndX.current = null;
  };

  const handleAdd = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    addToCart(product.id, 1);
    animateQuickAdd(e.currentTarget as HTMLElement);
    setAddedId(product.id);
    setTimeout(() => setAddedId(null), 1200);
  };

  if (!products.length) return null;

  return (
    <div
      className="relative w-full py-4 space-y-6"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Top Header & Interactive Segmented Filter */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-stone-500 font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-stone-700" />
            Curated Atelier Highlights
          </div>
          <h2 className="font-editorial text-3xl sm:text-4xl font-semibold text-stone-900 tracking-tight">
            Featured Collections & Formulations
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 font-light max-w-lg">
            Discover our signature gift boxes, transformative duo sets, and award-winning botanical concentrates.
          </p>
        </div>

        {/* Filter controls + Arrow Navigation */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Quick tab filter */}
          <div className="flex items-center gap-1 p-1 bg-stone-200/60 rounded-xl">
            <button
              onClick={() => setActiveTab('All')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                activeTab === 'All'
                  ? 'bg-white text-stone-900 shadow-2xs font-semibold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              All ({products.length})
            </button>
            <button
              onClick={() => setActiveTab('Collections')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                activeTab === 'Collections'
                  ? 'bg-white text-stone-900 shadow-2xs font-semibold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <PackageOpen className="w-3.5 h-3.5" />
              <span>Collections</span>
            </button>
            <button
              onClick={() => setActiveTab('Skincare')}
              className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                activeTab === 'Skincare'
                  ? 'bg-white text-stone-900 shadow-2xs font-semibold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Droplets className="w-3.5 h-3.5" />
              <span>Skincare</span>
            </button>
          </div>

          {/* Carousel Prev/Next Buttons */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={handlePrev}
              className="p-2.5 rounded-full border border-stone-300 bg-white text-stone-700 hover:text-stone-950 hover:border-stone-500 hover:bg-stone-50 transition-all cursor-pointer shadow-2xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-800"
              aria-label="Previous product"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNext}
              className="p-2.5 rounded-full border border-stone-300 bg-white text-stone-700 hover:text-stone-950 hover:border-stone-500 hover:bg-stone-50 transition-all cursor-pointer shadow-2xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-800"
              aria-label="Next product"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Slider Track Container */}
      <div
        className="relative overflow-hidden rounded-3xl border border-stone-200/90 bg-white shadow-xs"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div
          ref={trackRef}
          className="flex will-change-transform transition-transform duration-500 ease-out"
          style={{
            width: `${total * 100}%`,
            transform: `translateX(-${(currentIndex * 100) / Math.max(1, total)}%)`,
          }}
        >
          {filteredProducts.map((product) => {
            const isAdded = addedId === product.id;
            const stockQty =
              typeof product.stockQuantity === 'number'
                ? product.stockQuantity
                : product.inStock
                ? 25
                : 0;
            const isOutOfStock = stockQty <= 0 || !product.inStock;
            const isLowStock = !isOutOfStock && stockQty <= 8;

            return (
              <div
                key={product.id}
                className="w-full flex-shrink-0"
                style={{ width: `${100 / Math.max(1, total)}%` }}
              >
                <div
                  onClick={() => onOpenDetails && onOpenDetails(product)}
                  className="grid grid-cols-1 lg:grid-cols-12 cursor-pointer group"
                >
                  {/* Left Imagery (7 cols desktop) */}
                  <div className="lg:col-span-7 relative aspect-[4/3] lg:aspect-auto lg:h-[460px] bg-stone-100 overflow-hidden">
                    <img
                      src={product.image}
                      alt={product.title}
                      className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-700 ease-out"
                    />

                    {/* Category pill */}
                    <div className="absolute top-4 left-4 bg-stone-900/85 backdrop-blur-xs text-white text-[11px] uppercase tracking-widest px-3 py-1.5 rounded-md font-medium flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      <span>{product.category}</span>
                      {product.subCategory && <span>· {product.subCategory}</span>}
                    </div>

                    {/* Prominent Stock Badge on Slide Image */}
                    <div className="absolute top-4 right-4 z-10 pointer-events-none">
                      {isOutOfStock ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-stone-900/90 text-rose-300 border border-rose-500/30 rounded-md shadow-xs backdrop-blur-xs">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                          <span>0 pieces left</span>
                        </span>
                      ) : isLowStock ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-amber-950/90 text-amber-200 border border-amber-500/40 rounded-md shadow-xs backdrop-blur-xs animate-pulse">
                          <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                          <span>Only {stockQty} pieces left!</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-stone-900/85 text-emerald-300 rounded-md shadow-xs backdrop-blur-xs">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          <span>{stockQty} pieces in stock</span>
                        </span>
                      )}
                    </div>

                    {/* Quick Inspect Hint */}
                    <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-xs text-stone-900 text-xs px-3 py-1.5 rounded-md font-medium shadow-xs flex items-center gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
                      <Eye className="w-3.5 h-3.5 text-stone-700" />
                      <span>Quick Inspect</span>
                    </div>
                  </div>

                  {/* Right Content (5 cols desktop) */}
                  <div className="lg:col-span-5 p-6 sm:p-8 lg:p-10 flex flex-col justify-between space-y-6 bg-white">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-xs text-stone-500 flex-wrap">
                        <span className="uppercase tracking-wider font-semibold text-stone-800">
                          {product.category}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>{product.volume}</span>
                        <span aria-hidden="true">·</span>
                        {isOutOfStock ? (
                          <span className="text-rose-600 font-semibold">Out of Stock (0 pcs)</span>
                        ) : isLowStock ? (
                          <span className="text-amber-700 font-semibold flex items-center gap-1">
                            <Flame className="w-3 h-3 text-amber-600 fill-amber-500" />
                            Only {stockQty} pieces rest in stock!
                          </span>
                        ) : (
                          <span className="text-emerald-700 font-medium flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                            {stockQty} pieces in stock
                          </span>
                        )}
                      </div>

                      <h3 className="font-editorial text-2xl sm:text-3xl lg:text-4xl font-medium text-stone-900 leading-snug">
                        {product.title}
                      </h3>

                      <p className="text-sm text-stone-600 leading-relaxed font-light">
                        {product.description}
                      </p>

                      <div className="pt-2 border-t border-stone-100">
                        <p className="text-xs uppercase tracking-wider font-semibold text-stone-800 mb-1.5">
                          Formulation Highlights:
                        </p>
                        <ul className="text-xs text-stone-500 space-y-1">
                          {product.benefits.slice(0, 2).map((benefit, i) => (
                            <li key={i} className="flex items-start gap-1.5">
                              <span className="text-stone-400">✓</span>
                              <span>{benefit}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Price & Action Module */}
                    <div className="pt-6 border-t border-stone-100 flex items-center justify-between gap-4">
                      <div>
                        <span className="text-[10px] uppercase tracking-wider text-stone-400 block font-medium">
                          Boutique Price
                        </span>
                        <span className="font-mono text-xl sm:text-2xl font-bold text-stone-900 tabular-nums">
                          {product.price.toLocaleString()}{' '}
                          <span className="text-xs font-sans font-medium text-stone-500">
                            {product.currency}
                          </span>
                        </span>
                        <div className="flex items-center gap-1 text-[11px] text-stone-500 mt-1">
                          <Package className="w-3 h-3 text-stone-400" />
                          <span>
                            Inventory:{' '}
                            <strong className={isLowStock ? 'text-amber-800 font-bold' : 'text-stone-700'}>
                              {isOutOfStock ? '0 pcs' : `${stockQty} pieces rest in stock`}
                            </strong>
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {isOutOfStock ? (
                          <button
                            disabled
                            className="px-5 py-3 text-xs font-semibold uppercase tracking-wider rounded-xl bg-stone-200 text-stone-400 cursor-not-allowed shadow-xs"
                            aria-label="Sold out"
                          >
                            Out of Stock
                          </button>
                        ) : (
                          <button
                            onClick={(e) => handleAdd(e, product)}
                            className={`px-5 py-3 text-xs font-semibold uppercase tracking-wider rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-xs ${
                              isAdded
                                ? 'bg-emerald-800 text-white'
                                : 'bg-stone-900 hover:bg-stone-800 text-white active:bg-black'
                            }`}
                            aria-label={`Add ${product.title} to bag`}
                          >
                            {isAdded ? (
                              <>
                                <Check className="w-4 h-4" />
                                <span>Added</span>
                              </>
                            ) : (
                              <>
                                <ShoppingBag className="w-4 h-4" />
                                <span>Add to Bag</span>
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Slider Footer: Indicators + Direct Link to Catalog Collections */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
        {/* Active Index Counter & Dots */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-stone-400 tabular-nums">
            {String(currentIndex + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
          </span>

          <div className="flex items-center gap-1.5">
            {filteredProducts.map((p, idx) => (
              <button
                key={p.id}
                onClick={() => goToSlide(idx)}
                className={`h-1.5 transition-all duration-300 rounded-full cursor-pointer ${
                  idx === currentIndex
                    ? 'w-7 bg-stone-900'
                    : 'w-2 bg-stone-300 hover:bg-stone-400'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>

        {/* View All Collections Button */}
        <button
          onClick={() => navigate('/products')}
          className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-stone-800 hover:text-stone-950 transition-colors group cursor-pointer"
        >
          <span>View All Formulations & Collections in Catalog</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
}
