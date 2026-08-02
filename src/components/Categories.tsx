import React, { useRef } from 'react';
import * as Icons from 'lucide-react';
import type { SubCategory } from '../types/api';

interface CategoriesProps {
  subCategories: SubCategory[];
  activeSubCategory: string;
  onSubCategorySelect: (key: string) => void;
}

export const Categories: React.FC<CategoriesProps> = ({
  subCategories = [],
  activeSubCategory,
  onSubCategorySelect,
}) => {
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

  const activeSubs = subCategories.filter((sc) => sc.isActive);

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
            className={`category-card ${activeSubCategory === 'all' ? 'active' : ''}`}
            onClick={() => onSubCategorySelect('all')}
          >
            <div className="category-icon-wrapper">
              <Icons.LayoutGrid size={24} />
            </div>
            <span className="category-name">كل المنتجات</span>
          </div>
          
          {activeSubs.map((sc) => {
            const isActive = activeSubCategory === sc.id.toString();
            
            return (
              <div
                key={sc.id.toString()}
                className={`category-card ${isActive ? 'active' : ''}`}
                onClick={() => onSubCategorySelect(sc.id.toString())}
              >
                <div className="category-icon-wrapper">
                  {sc.imageUrl ? (
                    <img src={sc.imageUrl} alt={sc.name} style={{ width: 28, height: 28, objectFit: 'contain' }} />
                  ) : (
                    <Icons.Shirt size={24} />
                  )}
                </div>
                <span className="category-name">{sc.name}</span>
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

