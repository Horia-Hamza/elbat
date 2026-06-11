import React, { useRef } from 'react';
import * as Icons from 'lucide-react';
import { CATEGORIES } from '../data/products';

interface CategoriesProps {
  activeCategory: string;
  onCategorySelect: (key: string) => void;
}

export const Categories: React.FC<CategoriesProps> = ({ activeCategory, onCategorySelect }) => {
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
          {CATEGORIES.map((cat) => {
            const IconComponent = (Icons as any)[cat.icon] || Icons.HelpCircle;
            const isActive = activeCategory === cat.key;
            
            return (
              <div
                key={cat.key}
                className={`category-card ${isActive ? 'active' : ''}`}
                onClick={() => onCategorySelect(cat.key)}
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
