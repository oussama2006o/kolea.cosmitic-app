import React from 'react';
import { Sparkles, HeartHandshake, PackageOpen, Layers, Tag } from 'lucide-react';

export type MainCategory = string;

interface CategoryFilterProps {
  selectedCategory: MainCategory;
  onSelectCategory: (category: MainCategory) => void;
  categoryCounts: Record<string, number>;
  categoriesList?: string[];
}

interface CategoryConfig {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

const DEFAULT_CATEGORY_METADATA: Record<string, { label: string; icon: any; description: string }> = {
  All: {
    label: 'All Formulations',
    icon: Layers,
    description: 'Explore the complete Koléa atelier portfolio of botanical skincare, body care, and curated collections.',
  },
  Skincare: {
    label: 'Skincare',
    icon: Sparkles,
    description: 'High-performance facial serums, bio-peptide moisturizers, calming toners, and restorative nocturnal oils.',
  },
  'Body Care': {
    label: 'Body Care',
    icon: HeartHandshake,
    description: 'Nourishing velvet body emulsions, Mediterranean dry oils, and exfoliating mineral polishes.',
  },
  Collections: {
    label: 'Collections',
    icon: PackageOpen,
    description: 'Curated gift boxes, signature ritual duos, and complete multi-step starter regimens.',
  },
};

export function CategoryFilter({
  selectedCategory,
  onSelectCategory,
  categoryCounts,
  categoriesList = ['Skincare', 'Body Care', 'Collections'],
}: CategoryFilterProps) {
  const allIds = ['All', ...categoriesList.filter((c) => c !== 'All')];
  const currentMeta = DEFAULT_CATEGORY_METADATA[selectedCategory] || {
    label: selectedCategory,
    icon: Tag,
    description: `Refined botanical formulations in the ${selectedCategory} category.`,
  };

  return (
    <div className="space-y-3.5">
      {/* Category Toggle Segmented Tabs */}
      <div
        role="tablist"
        aria-label="Product categories"
        className="flex items-center gap-1.5 p-1.5 bg-stone-200/70 rounded-2xl overflow-x-auto border border-stone-200/80 shadow-2xs"
      >
        {allIds.map((catId) => {
          const isActive = selectedCategory === catId;
          const meta = DEFAULT_CATEGORY_METADATA[catId] || {
            label: catId,
            icon: Tag,
            description: '',
          };
          const Icon = meta.icon;
          const count = categoryCounts[catId] ?? 0;

          return (
            <button
              key={catId}
              role="tab"
              aria-selected={isActive}
              onClick={() => onSelectCategory(catId)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium rounded-xl transition-all cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-900 ${
                isActive
                  ? 'bg-stone-900 text-white shadow-xs font-semibold'
                  : 'text-stone-700 hover:text-stone-950 hover:bg-stone-100/90'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-stone-300' : 'text-stone-500'}`} />
              <span className="tracking-wide">{meta.label}</span>
              <span
                className={`text-[11px] font-mono tabular-nums ${
                  isActive ? 'text-stone-300' : 'text-stone-500'
                }`}
              >
                ({count})
              </span>
            </button>
          );
        })}
      </div>

      {/* Category Context Line */}
      <div className="flex items-center justify-between text-xs px-1 text-stone-500">
        <p className="line-clamp-1 font-light italic text-stone-600">
          {currentMeta.description}
        </p>
        <span className="font-mono text-[11px] tabular-nums shrink-0 ml-4 hidden sm:inline">
          {categoryCounts[selectedCategory] ?? 0} {categoryCounts[selectedCategory] === 1 ? 'item' : 'items'} in view
        </span>
      </div>
    </div>
  );
}
