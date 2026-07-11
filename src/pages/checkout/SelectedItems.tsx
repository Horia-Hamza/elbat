import React from 'react';
import { X } from 'lucide-react';
import type { SelectedPajama } from './types';

interface SelectedItemsProps {
  selectedPajamas: (SelectedPajama | null)[];
  onRemove: (index: number) => void;
}

const SelectedItems: React.FC<SelectedItemsProps> = ({ selectedPajamas, onRemove }) => {
  const filledCount = selectedPajamas.filter(Boolean).length;

  return (
    <div className="selected-items-bar">
      <div className="selected-items-inner">
        <div className="selected-items-title">
          <span className="selected-items-badge">{filledCount}/3</span>
          <span>بجامات مختارة</span>
        </div>

        <div className="selected-thumbnails">
          {[0, 1, 2].map((i) => {
            const item = selectedPajamas[i];
            return (
              <div key={i} className={`selected-thumb ${item ? 'filled' : 'empty'}`}>
                {item ? (
                  <>
                    <img src={item.image} alt={item.name} />
                    <div
                      className="thumb-color-dot"
                      style={{ backgroundColor: item.colorHex }}
                    />
                    <button
                      className="thumb-remove-btn"
                      onClick={() => onRemove(i)}
                      aria-label={`حذف ${item.name}`}
                    >
                      <X size={10} strokeWidth={3} />
                    </button>
                  </>
                ) : (
                  <span className="thumb-empty-label">{i + 1}</span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SelectedItems;
