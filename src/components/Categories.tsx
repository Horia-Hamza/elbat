import React from 'react';
import * as Icons from 'lucide-react';
import { CATEGORIES } from '../data/products';

interface CategoriesProps {
  activeCategory: string;
  onCategorySelect: (key: string) => void;
}

export const Categories: React.FC<CategoriesProps> = ({ activeCategory, onCategorySelect }) => {
  return (
    <section className="section-container" style={{ paddingBottom: '1rem' }}>
      <div className="section-header">
        <h2 className="section-title">تسوق حسب الفئات</h2>
      </div>
      
      <div className="categories-grid">
        {CATEGORIES.map((cat) => {
          // جلب الأيقونة ديناميكياً من مكتبة Lucide
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
    </section>
  );
};
