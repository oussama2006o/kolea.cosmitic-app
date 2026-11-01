import React, { useState } from 'react';
import { useRouter, AppRoute } from '../router/Router';
import { useCart } from '../graphql/client';
import { ShoppingBag, Menu, X, ArrowRight } from 'lucide-react';

export function Header() {
  const { route, navigate } = useRouter();
  const { cartSummary, setIsCartOpen } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks: { label: string; href: AppRoute }[] = [
    { label: 'Home', href: '/home' },
    { label: 'Products', href: '/products' },
    { label: 'Contact', href: '/contact' },
  ];

  const handleNav = (href: AppRoute) => {
    navigate(href);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#FAF8F5]/95 backdrop-blur-md border-b border-stone-200/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-8">
          {/* Zone 1: Brand Wordmark (Single text element wordmark in display face) */}
          <button
            onClick={() => handleNav('/home')}
            className="text-left group cursor-pointer focus:outline-none"
            aria-label="Koléa Cosmetic Home"
          >
            <span className="font-editorial text-2xl sm:text-3xl font-medium tracking-wider text-stone-900 group-hover:text-stone-700 transition-colors uppercase">
              Koléa
            </span>
            <span className="font-sans text-[11px] tracking-[0.2em] uppercase text-stone-500 block -mt-1 font-medium">
              Cosmetic
            </span>
          </button>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium tracking-wide">
            {navLinks.map((link) => {
              const isActive = route === link.href;
              return (
                <button
                  key={link.href}
                  onClick={() => handleNav(link.href)}
                  className={`relative py-1 whitespace-nowrap shrink-0 transition-colors cursor-pointer text-[13px] uppercase tracking-[0.12em] ${
                    isActive
                      ? 'text-stone-900 font-semibold'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-stone-900 transition-all" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Primary Action (Cart Drawer Trigger) */}
          <div className="flex items-center gap-4 shrink-0">
            <button
              onClick={() => setIsCartOpen(true)}
              className="flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-stone-900 bg-stone-100 hover:bg-stone-200/80 active:bg-stone-200 rounded-lg transition-all border border-stone-300/60 cursor-pointer shadow-xs whitespace-nowrap shrink-0"
              aria-label={`Shopping bag containing ${cartSummary.totalItems} items`}
            >
              <div className="relative">
                <ShoppingBag className="w-4 h-4 text-stone-800" />
                {cartSummary.totalItems > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-stone-900 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center leading-none tabular-nums animate-in zoom-in-50">
                    {cartSummary.totalItems}
                  </span>
                )}
              </div>
              <span className="hidden sm:inline font-sans text-stone-700">Cart</span>
              {cartSummary.totalItems > 0 && (
                <span className="hidden lg:inline text-stone-500 font-mono text-[11px] tabular-nums">
                  · {cartSummary.subtotal.toLocaleString()} DZD
                </span>
              )}
            </button>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-stone-700 hover:text-stone-900 focus:outline-none"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-stone-200 space-y-2">
            {navLinks.map((link) => {
              const isActive = route === link.href;
              return (
                <button
                  key={link.href}
                  onClick={() => handleNav(link.href)}
                  className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive
                      ? 'bg-stone-200/60 text-stone-900 font-semibold'
                      : 'text-stone-600 hover:bg-stone-100'
                  }`}
                >
                  <span className="uppercase tracking-wider text-xs">{link.label}</span>
                  <ArrowRight className="w-4 h-4 text-stone-400" />
                </button>
              );
            })}
          </div>
        )}
      </div>
    </header>
  );
}
