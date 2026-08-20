'use client';

import { useState } from 'react';
import Link from 'next/link';
import { categories as fallbackCategories, type Category } from '@/data/categories';

export default function CategoryStrip({ categories = fallbackCategories }: { categories?: Category[] }) {
  const [active, setActive] = useState('All Categories');

  return (
    <section className="category-row" aria-label="Product categories">
      {categories.map((category) => (
        <Link
          key={category.id}
          className={active === category.name ? 'category active' : 'category'}
          href={`/category/${category.slug}`}
          onClick={() => setActive(category.name)}
        >
          <span className="category-icon">{category.icon}</span>
          {category.name}
        </Link>
      ))}
    </section>
  );
}
