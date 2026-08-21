'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { Category } from '@/data/categories';

export default function CategoryStrip({ categories }: { categories: Category[] }) {
  const [active, setActive] = useState('All Categories');

  return (
    <section className="category-row" id="categories" aria-label="Product categories">
      {categories.map((category) => (
        <Link
          key={category.id}
          className={active === category.name ? 'category active' : 'category'}
          href={`/category/${category.id}`}
          onClick={() => setActive(category.name)}
        >
          {category.image ? <img className="category-image" src={category.image} alt="" /> : <span className="category-icon">{category.icon}</span>}
          {category.name}
        </Link>
      ))}
    </section>
  );
}
