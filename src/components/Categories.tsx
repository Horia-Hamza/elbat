import React, { useRef } from 'react';
import * as Icons from 'lucide-react';
import type { Category } from '../types/api';

interface CategoriesProps {
  categories: Category[];
  activeCategory: string;
  onCategorySelect: (key: string) => void;
}

export const Categories: React.FC<CategoriesProps> = ({ categories, activeCategory, onCategorySelect }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 200;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section className="section-container" style={{ paddingBottom: '1rem', position: 'relative' }}>
      <div className="section-header">
        <h2 className="section-title">تسوق حسب فئات البط</h2>
      </div>
      
      <div className="categories-wrapper">
        <button className="scroll-arrow scroll-right" onClick={() => scroll('right')}>
          <Icons.ChevronRight size={24} />
        </button>

        <div className="categories-grid" ref={scrollRef}>
          <div
            className={`category-card ${activeCategory === 'all' ? 'active' : ''}`}
            onClick={() => onCategorySelect('all')}
          >
            <div className="category-icon-wrapper">
              <Icons.LayoutGrid size={24} />
            </div>
            <span className="category-name">كل المنتجات</span>
          </div>
          
          {categories.map((cat) => {
            const IconComponent = Icons.Folder; // Fallback since API doesn't have icons
            const isActive = activeCategory === cat.id.toString();
            
            return (
              <div
                key={cat.id.toString()}
                className={`category-card ${isActive ? 'active' : ''}`}
                onClick={() => onCategorySelect(cat.id.toString())}
              >
                <div className="category-icon-wrapper">
                  <IconComponent size={24} />
                </div>
                <span className="category-name">{cat.name}</span>
              </div>
            );
          })}
        </div>

        <button className="scroll-arrow scroll-left" onClick={() => scroll('left')}>
          <Icons.ChevronLeft size={24} />
        </button>
      </div>
    </section>
  );
};
