export type Category = {
  id: string;
  name: string;
  slug: string;
  icon: string;
  image?: string;
};

export const categories: Category[] = [
  { id: 'all', name: 'All Categories', slug: 'all', icon: '▦' },
  { id: 'cakes', name: 'Cakes', slug: 'cakes', icon: '🍰' },
  { id: 'breads', name: 'Breads', slug: 'breads', icon: '🥖' },
  { id: 'cookies', name: 'Cookies', slug: 'cookies', icon: '🍪' },
  { id: 'snacks', name: 'Snacks', slug: 'snacks', icon: '🥟' },
  { id: 'pastries', name: 'Pastries', slug: 'pastries', icon: '🧁' },
  { id: 'desserts', name: 'Desserts', slug: 'desserts', icon: '🍮' },
];
