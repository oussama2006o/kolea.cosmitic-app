import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useGraphQLQuery, useCart } from '../graphql/client';
import { ProductCard } from '../components/ProductCard';
import { ProductDetailModal } from '../components/ProductDetailModal';
import { CategoryFilter, MainCategory } from '../components/CategoryFilter';
import { Product } from '../types';
import { animateStaggerCards } from '../utils/animations';
import { Search, ShoppingBag, ArrowRight, RotateCcw } from 'lucide-react';

export function ProductsPage() {
  const [selectedCategory, setSelectedCategory] = useState<MainCategory>('All');
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('featured');
  const [inspectProduct, setInspectProduct] = useState<Product | null>(null);

  const gridRef = useRef<HTMLDivElement>(null);
  const { cartSummary, setIsCartOpen } = useCart();

  // Fetch all products to compute category stats and counts dynamically
  const { data: allData } = useGraphQLQuery<{ products: Product[] }>(
    `query GetAllProductsSummary {
      products {
        id
        category
        subCategory
      }
    }`
  );

  const allProductsList = allData?.products || [];

  const categoryCounts = useMemo<Record<string, number>>(() => {
    const counts: Record<string, number> = {
      All: allProductsList.length,
    };
    allProductsList.forEach((p) => {
      counts[p.category] = (counts[p.category] || 0) + 1;
    });
    return counts;
  }, [allProductsList]);

  const dynamicCategories = useMemo(() => {
    const defaultList = ['Skincare', 'Body Care', 'Collections'];
    const cats = new Set(defaultList);
    allProductsList.forEach((p) => {
      if (p.category) cats.add(p.category);
    });
    return Array.from(cats);
  }, [allProductsList]);

  // Determine subcategory options for the currently selected main category
  const subCategoryOptions = useMemo(() => {
    if (selectedCategory === 'All') return [];
    if (selectedCategory === 'Skincare') {
      return ['All', 'Serums', 'Moisturizers', 'Cleansers', 'Elixirs', 'Treatments', 'Sun Care'];
    }
    if (selectedCategory === 'Body Care') {
      return ['All', 'Emulsions', 'Body Oils', 'Scrubs'];
    }
    if (selectedCategory === 'Collections') {
      return ['All', 'Gift Sets', 'Duo Sets', 'Discovery Sets'];
    }
    return [];
  }, [selectedCategory]);

  // Determine category variable for GraphQL query
  const queryCategoryParam = useMemo(() => {
    if (selectedSubCategory !== 'All') {
      return selectedSubCategory;
    }
    return selectedCategory;
  }, [selectedCategory, selectedSubCategory]);

  const { data, loading } = useGraphQLQuery<{ products: Product[] }>(
    `query GetProducts($category: String, $search: String, $sort: String) {
      products(category: $category, search: $search, sort: $sort) {
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
    }`,
    {
      category: queryCategoryParam,
      search: searchQuery,
      sort: sortBy,
    }
  );

  const products = useMemo(() => {
    return data?.products || [];
  }, [data]);

  useEffect(() => {
    if (gridRef.current && products.length > 0) {
      animateStaggerCards(gridRef.current);
    }
  }, [products]);

  const handleCategoryChange = (newCategory: MainCategory) => {
    setSelectedCategory(newCategory);
    setSelectedSubCategory('All');
  };

  const handleResetFilters = () => {
    setSelectedCategory('All');
    setSelectedSubCategory('All');
    setSearchQuery('');
    setSortBy('featured');
  };

  const isFiltering = selectedCategory !== 'All' || selectedSubCategory !== 'All' || searchQuery !== '';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Page Header & Live Cart Bar */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-stone-200">
        <div className="space-y-1.5">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500 font-mono">
            Atelier Catalog
          </span>
          <h1 className="font-editorial text-3xl sm:text-4xl lg:text-5xl font-semibold text-stone-900 tracking-tight">
            Formulations & Rituals
          </h1>
          <p className="text-sm text-stone-500 font-light max-w-xl">
            Explore pure Mediterranean botanical skincare, nourishing body care, and curated gift collections created in Koléa.
          </p>
        </div>

        {/* Real-Time Live Cart Summary Pill */}
        <div className="flex items-center gap-4 bg-white px-5 py-3 rounded-xl border border-stone-200/90 shadow-2xs self-start md:self-auto">
          <div className="relative">
            <ShoppingBag className="w-5 h-5 text-stone-800" />
            {cartSummary.totalItems > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-stone-900 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center tabular-nums">
                {cartSummary.totalItems}
              </span>
            )}
          </div>
          <div className="flex flex-col text-xs">
            <span className="text-stone-500">Live Cart Summary</span>
            <span className="font-semibold text-stone-900 font-mono tabular-nums">
              {cartSummary.totalItems === 0
                ? '0 items in bag'
                : `${cartSummary.totalItems} ${cartSummary.totalItems === 1 ? 'item' : 'items'} · ${cartSummary.subtotal.toLocaleString()} DZD`}
            </span>
          </div>
          <button
            onClick={() => setIsCartOpen(true)}
            className="ml-2 px-3 py-1.5 text-xs font-semibold bg-stone-900 hover:bg-stone-800 text-white rounded-md transition-colors cursor-pointer flex items-center gap-1.5"
            aria-label="Open Shopping Bag"
          >
            <span>View Bag</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Category Filter Component */}
      <section aria-label="Category Selection" className="space-y-4">
        <CategoryFilter
          selectedCategory={selectedCategory}
          onSelectCategory={handleCategoryChange}
          categoryCounts={categoryCounts}
          categoriesList={dynamicCategories}
        />

        {/* Sub-Category Filters (Shown when a specific department is chosen) */}
        {subCategoryOptions.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-0.5">
            <span className="text-[11px] font-medium uppercase tracking-wider text-stone-500 mr-2 shrink-0">
              Filter by type:
            </span>
            {subCategoryOptions.map((sub) => {
              const active = selectedSubCategory === sub;
              return (
                <button
                  key={sub}
                  onClick={() => setSelectedSubCategory(sub)}
                  className={`px-3 py-1 text-xs rounded-lg transition-all cursor-pointer whitespace-nowrap shrink-0 border ${
                    active
                      ? 'bg-stone-800 text-white border-stone-800 font-medium shadow-2xs'
                      : 'bg-white text-stone-600 border-stone-200/90 hover:border-stone-400 hover:text-stone-900'
                  }`}
                >
                  {sub === 'All' ? `All ${selectedCategory}` : sub}
                </button>
              );
            })}
          </div>
        )}

        {/* Search & Sort Controls Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
          <div className="relative flex-1 sm:max-w-md">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search within ${selectedCategory === 'All' ? 'all products' : selectedCategory}...`}
              className="w-full pl-9 pr-3 py-2.5 text-xs bg-white border border-stone-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-stone-900 shadow-2xs transition-all"
            />
          </div>

          <div className="flex items-center gap-3">
            <div className="relative shrink-0">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3.5 py-2.5 text-xs bg-white border border-stone-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-stone-900 text-stone-700 cursor-pointer shadow-2xs"
                aria-label="Sort products"
              >
                <option value="featured">Featured First</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>

            {isFiltering && (
              <button
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200/80 rounded-xl transition-colors cursor-pointer shrink-0"
                title="Reset all filters"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Dynamic Results Status Bar */}
        <div className="flex items-center justify-between text-xs text-stone-500 pt-1 border-t border-stone-200/70">
          <span>
            Displaying <strong className="text-stone-900 font-mono tabular-nums">{products.length}</strong> {products.length === 1 ? 'formulation' : 'formulations'}
            {selectedCategory !== 'All' && (
              <> in <span className="font-semibold text-stone-800">{selectedCategory}</span></>
            )}
            {selectedSubCategory !== 'All' && (
              <> · <span className="text-stone-600 font-medium">{selectedSubCategory}</span></>
            )}
          </span>
          {searchQuery && (
            <span className="italic text-stone-500">
              Matching &ldquo;{searchQuery}&rdquo;
            </span>
          )}
        </div>
      </section>

      {/* Card-Based Grid Layout */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {[1, 2, 3, 4, 5, 6].map((idx) => (
            <div
              key={idx}
              className="bg-white border border-stone-200 rounded-xl overflow-hidden animate-pulse h-96 flex flex-col"
            >
              <div className="aspect-[4/3] bg-stone-200" />
              <div className="p-5 flex-1 space-y-3">
                <div className="h-4 bg-stone-200 rounded w-1/3" />
                <div className="h-5 bg-stone-200 rounded w-3/4" />
                <div className="h-10 bg-stone-100 rounded w-full mt-4" />
              </div>
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="bg-white border border-stone-200 rounded-2xl p-12 text-center space-y-3">
          <p className="font-editorial text-2xl text-stone-800">No items found</p>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            We couldn't find any formulations in {selectedCategory} matching your criteria. Try resetting your filter.
          </p>
          <button
            onClick={handleResetFilters}
            className="px-4 py-2 text-xs font-semibold bg-stone-900 text-white rounded-lg hover:bg-stone-800 transition-colors cursor-pointer"
          >
            Show All Formulations
          </button>
        </div>
      ) : (
        <div
          ref={gridRef}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8"
        >
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onOpenDetails={(p) => setInspectProduct(p)}
            />
          ))}
        </div>
      )}

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={inspectProduct}
        onClose={() => setInspectProduct(null)}
      />
    </div>
  );
}
