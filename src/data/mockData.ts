import { Product, StoreInfo } from '../types';
import {
  heroImg,
  radianceSerumImg,
  velvetCreamImg,
  botanicalCleanserImg,
  roseElixirImg,
  bodyEmulsionImg,
  ritualSetImg,
} from '../assets/images';

export const STORE_INFO: StoreInfo = {
  name: 'Kolea Cosmetic',
  phone: '0784986932',
  phoneFormatted: '0784 98 69 32',
  instagram: 'https://www.instagram.com/kolea.cosmetic/',
  instagramHandle: '@kolea.cosmetic',
  addressText: 'Rue de la République, Koléa 42400, Tipaza, Algérie',
  googleMapsUrl: 'https://maps.app.goo.gl/rC7LA1H2T6DqBDci7',
  city: 'Koléa, Tipaza',
  country: 'Algeria',
  openingHours: 'Samedi – Jeudi : 08:30 – 21:30 | Vendredi : 15:00 – 19:00',
};

export const INITIAL_PRODUCTS: Product[] = [
  // --- Skincare ---
  {
    id: 'prod-01',
    title: 'Botanical Hyaluronic Radiance Serum',
    subtitle: 'Triple-molecular hydration with Mediterranean damask rose',
    price: 1800,
    currency: 'DZD',
    category: 'Skincare',
    subCategory: 'Serums',
    volume: '30ml / 1.0 fl oz',
    image: radianceSerumImg,
    isFeatured: true,
    inStock: true,
    stockQuantity: 18,
    rating: 4.9,
    reviewsCount: 128,
    description: 'An ultra-light, rapid-absorbing serum formulating botanical hyaluronic acids and cold-pressed Damask rose water. Plumps dermal layers, restores elasticity, and delivers an enduring glass-skin finish without stickiness.',
    ingredients: [
      'Botanical Hyaluronic Acid (Multi-weight)',
      'Organic Damask Rose Hydrosol',
      'Aloe Barbadensis Leaf Juice',
      'Vegetable Squalane',
      'Niacinamide (Vitamin B3 4%)'
    ],
    benefits: [
      'Delivers up to 72 hours of cellular hydration',
      'Visibly softens fine lines and revitalizes dull texture',
      'Enhances natural skin barrier resistance'
    ]
  },
  {
    id: 'prod-02',
    title: 'Revitalizing Advanced Velvet Cream',
    subtitle: 'Bio-peptide lipid repair with alpine jasmine and shea butter',
    price: 4400,
    currency: 'DZD',
    category: 'Skincare',
    subCategory: 'Moisturizers',
    volume: '50ml / 1.7 oz',
    image: velvetCreamImg,
    isFeatured: true,
    inStock: true,
    stockQuantity: 24,
    rating: 4.95,
    reviewsCount: 94,
    description: 'Rich yet weightless nutritive emulsion infused with biomimetic copper peptides, organic shea butter, and precious botanical squalane. Deeply replenishes moisture barriers while firming epidermal contours.',
    ingredients: [
      'Biomimetic Copper Tripeptide-1',
      'Refined African Shea Butter',
      'Cold-Pressed Jojoba Seed Oil',
      'Ceramide NP & AP Complex',
      'Alpine Jasmine Essential Distillate'
    ],
    benefits: [
      'Restores lipid barrier against environmental stress',
      'Velvety matte absorption, ideal under cosmetics',
      'Firms and improves skin bounce within 14 days'
    ]
  },
  {
    id: 'prod-03',
    title: 'Gentle Botanical Cleansing Gel',
    subtitle: 'pH-balanced purifying foam with chamomile and cucumber',
    price: 2400,
    currency: 'DZD',
    category: 'Skincare',
    subCategory: 'Cleansers',
    volume: '250ml / 8.4 fl oz',
    image: botanicalCleanserImg,
    isFeatured: true,
    inStock: true,
    stockQuantity: 35,
    rating: 4.85,
    reviewsCount: 76,
    description: 'Sulfate-free botanical cleanser designed to dissolve impurities, excess sebum, and waterproof makeup while respecting the skin microbiome. Leaves the complexion clean, hydrated, and refreshed.',
    ingredients: [
      'Organic Roman Chamomile Extract',
      'Cucumber Hydrosol',
      'Decyl Glucoside (Coconut derived)',
      'Vegetable Glycerin',
      'Panthenol (Pro-Vitamin B5)'
    ],
    benefits: [
      'Non-stripping formulation balances natural sebum',
      'Calms redness and reactive skin tones',
      'Prepares skin for optimal active serum absorption'
    ]
  },
  {
    id: 'prod-04',
    title: 'Organic Rosehip & Peptide Night Facial Oil',
    subtitle: 'Restorative nocturnal lipid elixir with cold-pressed rosehip seed',
    price: 4900,
    currency: 'DZD',
    category: 'Skincare',
    subCategory: 'Elixirs',
    volume: '50ml / 1.7 fl oz',
    image: roseElixirImg,
    isFeatured: true,
    inStock: true,
    stockQuantity: 6,
    rating: 5.0,
    reviewsCount: 162,
    description: 'Pure nocturnal elixir formulated with virgin cold-pressed wild rosehip seed oil, bakuchiol (natural retinol alternative), and omega 3-6-9 fatty acids. Reawakens cellular regeneration overnight.',
    ingredients: [
      'Rosa Canina (Organic Rosehip Seed Oil)',
      'Bakuchiol 1.5% (Plant Retinoid Alternative)',
      'Prickly Pear Seed Extract (Koléa reserve)',
      'Natural Tocopherol (Vitamin E)',
      'French Lavender Flower Essence'
    ],
    benefits: [
      'Intense overnight renewal with zero pore congestion',
      'Helps attenuate post-blemish pigmentation',
      'Imparts a luminous, supple morning glow'
    ]
  },
  {
    id: 'prod-05',
    title: 'Centella Asiatica Soothing Barrier Mist',
    subtitle: 'Calming micro-droplet toner with madecassoside & green tea',
    price: 2800,
    currency: 'DZD',
    category: 'Skincare',
    subCategory: 'Treatments',
    volume: '150ml / 5.1 fl oz',
    image: radianceSerumImg,
    isFeatured: false,
    inStock: true,
    stockQuantity: 14,
    rating: 4.8,
    reviewsCount: 52,
    description: 'A comforting facial essence mist formulated with 82% Centella Asiatica leaf water and green tea polyphenols. Delivers instant relief from urban heat, air dryness, and reactive sensitivity.',
    ingredients: [
      'Centella Asiatica (Gotu Kola) Extract',
      'Camellia Sinensis (Green Tea) Leaf Water',
      'Madecassoside',
      'Allantoin',
      'Witch Hazel Distillate (Alcohol-free)'
    ],
    benefits: [
      'Immediate temperature drop and skin soothing',
      'Reinforces sensitive skin against external irritants',
      'Can be applied before makeup or throughout the day'
    ]
  },
  {
    id: 'prod-06',
    title: 'Mineral Velvet Invisible SPF 50+ Sun Veil',
    subtitle: 'Broad-spectrum non-nano zinc oxide with hydrating squalane',
    price: 3200,
    currency: 'DZD',
    category: 'Skincare',
    subCategory: 'Sun Care',
    volume: '50ml / 1.7 fl oz',
    image: velvetCreamImg,
    isFeatured: false,
    inStock: true,
    stockQuantity: 4,
    rating: 4.9,
    reviewsCount: 110,
    description: 'Ultra-sheer mineral sunscreen offering SPF 50+ UVA/UVB protection without white cast or greasy sheen. Infused with olive squalane and licorice root to protect against hyperpigmentation.',
    ingredients: [
      'Non-nano Zinc Oxide 18.5%',
      'Licorice Root Glabridin',
      'Olive-derived Squalane',
      'Bisabolol',
      'Zinc PCA'
    ],
    benefits: [
      'Zero white cast, transparent on all melanin skin tones',
      'Reef-safe and biodegradable physical filter',
      'Silky non-comedogenic primer finish'
    ]
  },

  // --- Body Care ---
  {
    id: 'prod-07',
    title: 'Botanical Nourishing Velvet Body Emulsion',
    subtitle: 'Deep lipid restoration with organic shea butter and jojoba',
    price: 2800,
    currency: 'DZD',
    category: 'Body Care',
    subCategory: 'Emulsions',
    volume: '300ml / 10.0 fl oz',
    image: bodyEmulsionImg,
    isFeatured: true,
    inStock: true,
    stockQuantity: 28,
    rating: 4.92,
    reviewsCount: 88,
    description: 'A comforting, silky body emulsion formulated with unrefined shea butter, sweet almond lipid extract, and Mediterranean aloe vera. Sinks immediately into thirsty epidermis with zero greasy residue.',
    ingredients: [
      'Unrefined Shea Butter (Fair Trade)',
      'Cold-Pressed Sweet Almond Oil',
      'Golden Jojoba Seed Distillate',
      'Calendula Officinalis Flower Hydrosol',
      'Vitamin E Acetate'
    ],
    benefits: [
      '48-hour moisture seal for rough elbows, knees, and dry limbs',
      'Instantly soothes tight, dry, and post-shower skin',
      'Delicate, subtle natural botanical fragrance'
    ]
  },
  {
    id: 'prod-08',
    title: 'Mediterranean Neroli & Argan Satin Dry Body Oil',
    subtitle: 'Weightless dry oil mist for radiant, satin-sheen body nourishment',
    price: 3500,
    currency: 'DZD',
    category: 'Body Care',
    subCategory: 'Body Oils',
    volume: '100ml / 3.4 fl oz',
    image: roseElixirImg,
    isFeatured: false,
    inStock: true,
    stockQuantity: 9,
    rating: 4.88,
    reviewsCount: 64,
    description: 'A quick-dry botanical body oil blending virgin Moroccan Argan oil with cold-pressed orange blossom (Neroli) and squalane. Enhances natural skin luminosity with a dry velvet finish.',
    ingredients: [
      'Virgin Argania Spinosa Kernel Oil',
      'Citrus Aurantium (Neroli) Flower Extract',
      'Olive Squalane',
      'Grapeseed Oil (High Linoleic)',
      'Rosemary Leaf Antioxidant'
    ],
    benefits: [
      'Non-greasy satin sheen that dries in seconds',
      'Deeply softens sun-exposed and dehydrated skin',
      'Can be applied to dry hair ends and décolleté'
    ]
  },
  {
    id: 'prod-09',
    title: 'Dead Sea Salt & Wild Verbena Exfoliating Polish',
    subtitle: 'Smoothing body treatment with mineral crystals and crushed olive seed',
    price: 2600,
    currency: 'DZD',
    category: 'Body Care',
    subCategory: 'Scrubs',
    volume: '250g / 8.8 oz',
    image: velvetCreamImg,
    isFeatured: false,
    inStock: true,
    stockQuantity: 15,
    rating: 4.81,
    reviewsCount: 47,
    description: 'Gentle refining body polish suspended in botanical almond oil and verbena leaf infusion. Sloughs away dead cellular buildup while leaving skin silky, nourished, and glowing.',
    ingredients: [
      'Pure Dead Sea Salt Crystals',
      'Sweet Almond Kernel Oil',
      'Crushed Koléa Olive Stone Exfoliant',
      'Wild Lemon Verbena Essential Oil',
      'Vegetable Glycerin'
    ],
    benefits: [
      'Polishes uneven texture and dry patches',
      'Nourishing oil suspension means no need for post-scrub lotion',
      'Stimulates microcirculation and dermal glow'
    ]
  },

  // --- Collections ---
  {
    id: 'prod-10',
    title: 'The Radiance Atelier Collection Box',
    subtitle: 'Limited-edition 3-piece gift set for complete head-to-toe vitality',
    price: 7800,
    currency: 'DZD',
    category: 'Collections',
    subCategory: 'Gift Sets',
    volume: '3 Full-Size Items',
    image: ritualSetImg,
    isFeatured: true,
    inStock: true,
    stockQuantity: 5,
    rating: 5.0,
    reviewsCount: 71,
    description: 'An exclusive gift presentation box containing our bestselling Botanical Hyaluronic Radiance Serum (30ml), Revitalizing Velvet Cream (50ml), and Satin Body Oil (100ml) in an artisan linen-wrapped keepsake box.',
    ingredients: [
      'Includes Full-Size Botanical Hyaluronic Radiance Serum (30ml)',
      'Includes Full-Size Revitalizing Advanced Velvet Cream (50ml)',
      'Includes Full-Size Mediterranean Neroli Satin Body Oil (100ml)'
    ],
    benefits: [
      'Comprehensive 3-step morning and evening ritual',
      'Save 1,900 DZD compared to individual purchase',
      'Luxury gift packaging with signature Koléa ribbon and card'
    ]
  },
  {
    id: 'prod-11',
    title: 'The Nocturnal Renewal Restorative Duo',
    subtitle: 'Intensive overnight skin transformation pairing night oil with velvet cream',
    price: 8200,
    currency: 'DZD',
    category: 'Collections',
    subCategory: 'Duo Sets',
    volume: '2 Full-Size Formulations',
    image: heroImg,
    isFeatured: true,
    inStock: true,
    stockQuantity: 8,
    rating: 4.96,
    reviewsCount: 39,
    description: 'Specially paired nocturnal treatment featuring the Organic Rosehip & Peptide Night Facial Oil alongside the Bio-Peptide Velvet Cream to regenerate the skin barrier during deep sleep.',
    ingredients: [
      'Rosehip & Bakuchiol Night Facial Oil (50ml)',
      'Revitalizing Advanced Velvet Cream (50ml)',
      'Atelier Koléa Bamboo Application Spatula'
    ],
    benefits: [
      'Maximizes cellular renewal during circadian repair cycle',
      'Delivers waking plumpness and radiant skin clarity',
      '1,100 DZD bundled savings'
    ]
  },
  {
    id: 'prod-12',
    title: 'The Koléa Essential Discovery Trio',
    subtitle: 'Purify, hydrate, and shield: the fundamental everyday botanical trio',
    price: 6200,
    currency: 'DZD',
    category: 'Collections',
    subCategory: 'Discovery Sets',
    volume: '3 Curated Formulations',
    image: radianceSerumImg,
    isFeatured: true,
    inStock: true,
    stockQuantity: 12,
    rating: 4.89,
    reviewsCount: 54,
    description: 'The definitive gateway to Koléa Cosmetic: Gentle Botanical Cleanser (250ml), Centella Soothing Barrier Mist (150ml), and Hyaluronic Radiance Serum (30ml).',
    ingredients: [
      'Gentle Botanical Cleansing Gel (250ml)',
      'Centella Asiatica Soothing Barrier Mist (150ml)',
      'Botanical Hyaluronic Radiance Serum (30ml)'
    ],
    benefits: [
      'Complete 3-step foundational regimen for all skin types',
      'Strengthens compromised skin barriers and calms irritation',
      'Ideal gift or starter ritual'
    ]
  }
];
