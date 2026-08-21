export type Product = {
  id: string;
  slug: string;
  name: string;
  category: string;
  weight: string;
  price: number;
  originalPrice?: number;
  discount?: string;
  rating: number;
  reviews: number;
  calories: number;
  keywords: string[];
  image: string;
  badge?: string;
  description?: string;
  sku?: string;
  ingredients?: string[];
  nutrition?: Array<{ name: string; value: number; unit: string }>;
  stock?: number;
};

const images = {
  cake: '/WhatsApp_Image_2026-08-20_at_11.40.38_AM.jpeg',
  cookies: '/WhatsApp_Image_2026-08-20_at_11.40.38_AM(2).jpeg',
  bread: '/WhatsApp_Image_2026-08-20_at_11.40.39_AM.jpeg',
};

export const products: Product[] = [
  { id: 'truffle-cake', slug: 'chocolate-truffle-cake', name: 'Chocolate Truffle Cake', category: 'Cakes', weight: '500 g', price: 549, originalPrice: 610, discount: '10% OFF', rating: 4.6, reviews: 128, calories: 1850, keywords: ['cake', 'chocolate', 'birthday'], image: images.cake },
  { id: 'choco-cookies', slug: 'choco-chip-cookies', name: 'Choco Chip Cookies', category: 'Cookies', weight: '250 g', price: 127, originalPrice: 150, discount: '15% OFF', rating: 4.5, reviews: 96, calories: 1200, keywords: ['cookies', 'chocolate', 'biscuit'], image: images.cookies },
  { id: 'multigrain-bread', slug: 'multigrain-bread', name: 'Multigrain Bread', category: 'Breads', weight: '400 g', price: 69, originalPrice: 75, discount: '8% OFF', rating: 4.4, reviews: 75, calories: 950, keywords: ['bread', 'atta', 'healthy'], image: images.bread },
  { id: 'red-velvet-cupcake', slug: 'red-velvet-cupcake', name: 'Red Velvet Cupcake', category: 'Desserts', weight: '1 piece', price: 79, rating: 4.7, reviews: 60, calories: 320, keywords: ['cake', 'cupcake', 'red velvet'], image: images.cake },
  { id: 'black-forest-pastry', slug: 'black-forest-pastry', name: 'Black Forest Pastry', category: 'Pastries', weight: '1 piece', price: 132, originalPrice: 150, discount: '12% OFF', rating: 4.6, reviews: 110, calories: 450, keywords: ['cake', 'pastry', 'chocolate'], image: images.cake },
  { id: 'samosa-pack', slug: 'samosa-pack-of-4', name: 'Samosa (Pack of 4)', category: 'Snacks', weight: '4 pieces', price: 72, originalPrice: 80, discount: '10% OFF', rating: 4.3, reviews: 88, calories: 800, keywords: ['samosa', 'snack', 'namkeen'], image: images.cookies },
  { id: 'garlic-bread', slug: 'garlic-bread', name: 'Garlic Bread', category: 'Breads', weight: '2 pieces', price: 66, originalPrice: 70, discount: '5% OFF', rating: 4.4, reviews: 56, calories: 600, keywords: ['bread', 'garlic', 'snack'], image: images.bread },
  { id: 'choco-doughnut', slug: 'choco-doughnut', name: 'Choco Doughnut', category: 'Desserts', weight: '1 piece', price: 49, rating: 4.5, reviews: 40, calories: 310, keywords: ['doughnut', 'chocolate', 'dessert'], image: images.cookies, badge: 'NEW' },
  { id: 'pineapple-cake', slug: 'pineapple-cake', name: 'Pineapple Cake', category: 'Cakes', weight: '500 g', price: 499, originalPrice: 560, discount: '11% OFF', rating: 4.5, reviews: 82, calories: 1600, keywords: ['cake', 'pineapple', 'birthday'], image: images.cake },
  { id: 'atta-bread', slug: 'atta-bread', name: 'Classic Atta Bread', category: 'Breads', weight: '400 g', price: 55, originalPrice: 60, discount: '8% OFF', rating: 4.3, reviews: 49, calories: 880, keywords: ['bread', 'atta'], image: images.bread },
];

export const getProduct = (slug: string) => products.find((product) => product.slug === slug || product.id === slug);
