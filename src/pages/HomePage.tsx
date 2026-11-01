import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useRouter } from '../router/Router';
import { useGraphQLQuery } from '../graphql/client';
import { FeaturedSlider } from '../components/FeaturedSlider';
import { ProductDetailModal } from '../components/ProductDetailModal';
import { Product } from '../types';
import { heroImg } from '../assets/images';
import { animateFadeIn } from '../utils/animations';
import {
  ArrowRight,
  Leaf,
  Shield,
  Award,
  Sparkles,
  Droplets,
  ChevronDown,
} from 'lucide-react';

export function HomePage() {
  const { navigate } = useRouter();
  const heroRef = useRef<HTMLDivElement>(null);
  const aboutRef = useRef<HTMLDivElement>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Phone edition: Automatic navigation to product page on swipe down or scrolling past 90%
  const [isMobileRedirecting, setIsMobileRedirecting] = useState(false);
  const touchStartY = useRef<number | null>(null);
  const touchStartX = useRef<number | null>(null);
  const touchStartTime = useRef<number>(0);
  const hasNavigatedRef = useRef<boolean>(false);
  const canListenRef = useRef<boolean>(false);

  const { data: featuredData } = useGraphQLQuery<{ featuredProducts: Product[] }>(
    `query GetFeatured {
      featuredProducts {
        id
        title
        subtitle
        price
        currency
        category
        subCategory
        volume
        image
        isFeatured
        inStock
        stockQuantity
        rating
        reviewsCount
        description
        ingredients
        benefits
      }
    }`
  );

  useEffect(() => {
    animateFadeIn(heroRef.current, 0.1);
    animateFadeIn(aboutRef.current, 0.3);
  }, []);

  const triggerMobileProductNavigation = useCallback(() => {
    // Only on phone screens (< 768px)
    if (window.innerWidth >= 768) return;
    if (!canListenRef.current || hasNavigatedRef.current) return;

    hasNavigatedRef.current = true;
    setIsMobileRedirecting(true);

    setTimeout(() => {
      navigate('/products');
      window.scrollTo({ top: 0, behavior: 'instant' });
    }, 180);
  }, [navigate]);

  useEffect(() => {
    hasNavigatedRef.current = false;
    canListenRef.current = false;

    // Small delay on mount to ensure clean layout calculation and prevent bounce
    const timer = setTimeout(() => {
      canListenRef.current = true;
    }, 350);

    const checkScrollDepth = () => {
      if (window.innerWidth >= 768) return;

      const scrollTop = window.scrollY || document.documentElement.scrollTop || 0;
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = window.innerHeight;

      const totalScrollable = scrollHeight - clientHeight;
      const scrollPercentage = totalScrollable > 0 ? scrollTop / totalScrollable : 0;
      const viewportCoverage = (scrollTop + clientHeight) / scrollHeight;

      // Condition: Customer scrolls past 90% of the homepage
      if (scrollPercentage >= 0.90 || viewportCoverage >= 0.90) {
        triggerMobileProductNavigation();
      }
    };

    // 1. Window scroll listener for reaching 90% of page
    const handleScroll = () => {
      checkScrollDepth();
    };

    // 2. Touch gesture listener for mobile phones (swipes down or scrolling past 90%)
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches && e.touches.length > 0) {
        touchStartX.current = e.touches[0].clientX;
        touchStartY.current = e.touches[0].clientY;
        touchStartTime.current = Date.now();
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (window.innerWidth >= 768) return;
      if (touchStartY.current === null || touchStartX.current === null) return;
      if (!e.touches || e.touches.length === 0) return;

      const currentX = e.touches[0].clientX;
      const currentY = e.touches[0].clientY;
      const deltaY = currentY - touchStartY.current;
      const deltaX = currentX - touchStartX.current;

      // Condition: Downward swipe gesture (finger dragged down by > 60px with vertical dominance)
      if (deltaY > 60 && Math.abs(deltaY) > Math.abs(deltaX) * 1.3) {
        triggerMobileProductNavigation();
        return;
      }

      // Check 90% threshold during active touch movement
      checkScrollDepth();
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (window.innerWidth >= 768) return;
      if (touchStartY.current === null || touchStartX.current === null) return;
      if (!e.changedTouches || e.changedTouches.length === 0) return;

      const endX = e.changedTouches[0].clientX;
      const endY = e.changedTouches[0].clientY;
      const deltaY = endY - touchStartY.current;
      const deltaX = endX - touchStartX.current;
      const duration = Date.now() - touchStartTime.current;

      // Quick downward flick gesture (< 600ms and > 45px)
      if (deltaY > 45 && Math.abs(deltaY) > Math.abs(deltaX) * 1.2 && duration < 600) {
        triggerMobileProductNavigation();
        return;
      }

      touchStartY.current = null;
      touchStartX.current = null;
    };

    // 3. Wheel event for trackpads or emulator scrolling past 90%
    const handleWheel = (e: WheelEvent) => {
      if (window.innerWidth >= 768) return;
      if (e.deltaY > 0) {
        checkScrollDepth();
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });
    window.addEventListener('wheel', handleWheel, { passive: true });

    return () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('wheel', handleWheel);
    };
  }, [triggerMobileProductNavigation]);

  const featured = featuredData?.featuredProducts || [];

  return (
    <div className="space-y-16 sm:space-y-24 pb-16">
      {/* Phone Edition: Quick Transition Indicator when scroll past 90% or swipe down triggered */}
      {isMobileRedirecting && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center pointer-events-none animate-in fade-in duration-200">
          <div className="bg-white/95 px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-stone-200">
            <div className="w-4 h-4 border-2 border-stone-900 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-semibold text-stone-900 uppercase tracking-wider">
              Entering Products Page...
            </span>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section ref={heroRef} className="relative pt-6 sm:pt-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl overflow-hidden bg-stone-900 border border-stone-800 shadow-xl">
            {/* Background Photography with measured contrast scrim */}
            <div className="absolute inset-0 z-0">
              <img
                src={heroImg}
                alt="Koléa Cosmetic Luxury Botanical Skincare Collection"
                className="w-full h-full object-cover object-center opacity-45 scale-102 transform duration-1000 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/60 to-transparent" />
            </div>

            {/* Hero Copy */}
            <div className="relative z-10 max-w-2xl px-6 py-16 sm:px-12 sm:py-28 lg:py-36 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-stone-200 text-xs font-medium tracking-widest uppercase">
                <Sparkles className="w-3.5 h-3.5 text-stone-300" />
                Koléa Botanical Atelier
              </div>

              <h1 className="font-editorial text-4xl sm:text-5xl lg:text-6xl text-white font-medium tracking-tight leading-[1.12]">
                Pure Botanical Science for Timeless Skin Vitality
              </h1>

              <p className="text-base sm:text-lg text-stone-300 leading-relaxed font-light">
                Meticulously formulated in Koléa, Algeria. We fuse bioactive Mediterranean flora with dermatological hyaluronic complexes and skin-barrier lipids to rebalance and illuminate your complexion.
              </p>

              {/* CTAs */}
              <div className="pt-2 flex flex-wrap items-center gap-4">
                <button
                  onClick={() => navigate('/products')}
                  className="px-6 py-3.5 bg-white text-stone-900 text-xs font-semibold uppercase tracking-wider rounded-lg hover:bg-stone-100 transition-all flex items-center gap-2 cursor-pointer shadow-sm"
                >
                  <span>Explore Formulations</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => navigate('/contact')}
                  className="px-6 py-3.5 bg-stone-900/60 hover:bg-stone-800/80 text-white text-xs font-semibold uppercase tracking-wider rounded-lg border border-stone-700 backdrop-blur-sm transition-all cursor-pointer"
                >
                  Visit Atelier & Contact
                </button>
              </div>

              {/* Badges strip */}
              <div className="pt-8 border-t border-stone-800/80 flex flex-wrap items-center gap-6 sm:gap-10 text-xs text-stone-400 font-sans">
                <div className="flex items-center gap-2">
                  <Leaf className="w-4 h-4 text-emerald-400" />
                  <span>100% Cruelty Free</span>
                </div>
                <div className="flex items-center gap-2">
                  <Droplets className="w-4 h-4 text-sky-400" />
                  <span>Dermatologist Approved</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-stone-400" />
                  <span>Clean Ingredients</span>
                </div>
              </div>

              {/* Mobile Cue */}
              <div className="md:hidden pt-4 border-t border-white/10 flex items-center justify-between text-xs text-stone-300">
                <span className="text-[11px] uppercase tracking-wider text-stone-400 font-medium">
                  Scroll or swipe down for catalog
                </span>
                <ChevronDown className="w-4 h-4 text-stone-400 animate-bounce" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products Slider Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FeaturedSlider
          products={featured}
          onOpenDetails={(product) => setSelectedProduct(product)}
        />
      </section>

      {/* Concise 'About Us' Section */}
      <section ref={aboutRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white border border-stone-200/90 rounded-3xl p-8 sm:p-12 lg:p-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Story Column */}
            <div className="lg:col-span-6 space-y-6">
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-stone-500 font-semibold">
                <Award className="w-3.5 h-3.5 text-stone-700" />
                Our Story & Philosophy
              </div>

              <h2 className="font-editorial text-3xl sm:text-4xl text-stone-900 font-semibold tracking-tight leading-tight">
                About Koléa Cosmetic
              </h2>

              <div className="space-y-4 text-stone-600 text-sm sm:text-base leading-relaxed font-light">
                <p>
                  Rooted in the historic botanical richness of <strong>Koléa, Tipaza</strong>, our cosmetic atelier was founded with a singular conviction: skincare should be pure, biocompatible, and scientifically transparent.
                </p>
                <p>
                  Surrounded by coastal Mediterranean flora, we hand-select potent active extracts—from Damask rose hydrosols to organic prickly pear seed oils—and pair them with multi-molecular hyaluronic acids, ceramides, and peptides.
                </p>
                <p>
                  Every Koléa Cosmetic formulation is manufactured with strict quality standards, free from parabens, mineral oils, harsh synthetic dyes, and artificial fragrances that disrupt your skin’s delicate barrier.
                </p>
              </div>

              <div className="pt-2 flex items-center gap-6">
                <button
                  onClick={() => navigate('/products')}
                  className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-stone-900 hover:text-stone-700 transition-colors group cursor-pointer"
                >
                  <span>Discover the Complete Catalog</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>

            {/* Right Architectural Pillars Grid */}
            <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-6 bg-stone-50 rounded-2xl border border-stone-200/80 space-y-2">
                <span className="font-mono text-xs text-stone-400 font-semibold">01</span>
                <h4 className="text-base font-semibold text-stone-900">Botanical Purity</h4>
                <p className="text-xs text-stone-500 leading-relaxed">
                  Wild-harvested and organic Mediterranean extracts cold-pressed to preserve cellular integrity.
                </p>
              </div>

              <div className="p-6 bg-stone-50 rounded-2xl border border-stone-200/80 space-y-2">
                <span className="font-mono text-xs text-stone-400 font-semibold">02</span>
                <h4 className="text-base font-semibold text-stone-900">Bioactive Precision</h4>
                <p className="text-xs text-stone-500 leading-relaxed">
                  Biomimetic peptides and multi-tier hyaluronic weights calibrated for dermal absorption.
                </p>
              </div>

              <div className="p-6 bg-stone-50 rounded-2xl border border-stone-200/80 space-y-2">
                <span className="font-mono text-xs text-stone-400 font-semibold">03</span>
                <h4 className="text-base font-semibold text-stone-900">Microbiome Friendly</h4>
                <p className="text-xs text-stone-500 leading-relaxed">
                  Physiological pH balanced between 4.8 and 5.5 to reinforce epidermal lipid health.
                </p>
              </div>

              <div className="p-6 bg-stone-50 rounded-2xl border border-stone-200/80 space-y-2">
                <span className="font-mono text-xs text-stone-400 font-semibold">04</span>
                <h4 className="text-base font-semibold text-stone-900">Local Atelier Pride</h4>
                <p className="text-xs text-stone-500 leading-relaxed">
                  Proudly based in Koléa, connecting Algerian heritage with modern luxury cosmetic rigor.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Phone Edition: 90% Scroll Transition Section into Products */}
      <section className="md:hidden max-w-7xl mx-auto px-4 pt-2">
        <div
          onClick={triggerMobileProductNavigation}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-stone-900 via-stone-900 to-black text-white p-6 border border-stone-800 shadow-xl text-center cursor-pointer group"
        >
          <div className="flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-widest text-emerald-400 mb-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>90% Scrolled · Next Page</span>
          </div>
          <h3 className="font-editorial text-2xl font-medium text-white mb-2">
            Discover All Formulations
          </h3>
          <p className="text-xs text-stone-300 font-light max-w-xs mx-auto mb-4">
            Swipe down or scroll to enter the complete boutique catalog.
          </p>
          <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-stone-900 rounded-xl text-xs font-semibold uppercase tracking-wider shadow-sm group-hover:bg-stone-100 transition-colors">
            <span>Enter Products Page</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </section>

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </div>
  );
}
