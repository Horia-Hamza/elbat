import React, { useState } from 'react';
import { Check, ShoppingBag } from 'lucide-react';
import type { Pajama } from '../../data/pajamas';
import type { SelectedPajama } from './types';

interface PajamaCardProps {
  pajama: Pajama;
  slotIndex: number;
  isAlreadySelected: boolean;
  onSelect: (selected: SelectedPajama, slotIndex: number) => void;
}

const PajamaCard: React.FC<PajamaCardProps> = ({
  pajama,
  slotIndex,
  isAlreadySelected,
  onSelect,
}) => {
  const [selectedColor, setSelectedColor] = useState(pajama.colors[0]);
  const [selectedSize, setSelectedSize] = useState('');
  const [error, setError] = useState('');

  const handleSelect = () => {
    if (isAlreadySelected) return;
    if (!selectedSize) {
      setError('اختار المقاس أولاً');
      return;
    }
    setError('');
    onSelect(
      {
        pajamaId: pajama.id,
        color: selectedColor.color,
        colorHex: selectedColor.colorHex,
        size: selectedSize,
        image: pajama.image,
        name: pajama.name,
      },
      slotIndex
    );
  };

  return (
    <div className={`pajama-card ${isAlreadySelected ? 'pajama-card-selected' : ''}`}>
      {/* Badge */}
      {pajama.badge && !isAlreadySelected && (
        <div className="pajama-badge">{pajama.badge}</div>
      )}

      {/* Selected overlay */}
      {isAlreadySelected && (
        <div className="pajama-selected-overlay">
          <div className="pajama-selected-check">
            <Check size={32} strokeWidth={3} />
          </div>
          <span>تم الاختيار ✓</span>
        </div>
      )}

      {/* Product image */}
      <div className="pajama-card-image-wrap">
        <img
          src={pajama.image}
          alt={pajama.name}
          className="pajama-card-image"
          loading="lazy"
        />
      </div>

      {/* Product info */}
      <div className="pajama-card-body">
        <h3 className="pajama-card-name">{pajama.name}</h3>
        <p className="pajama-card-desc">{pajama.description}</p>

        {/* Color selector */}
        <div className="pajama-selector-group">
          <label className="pajama-selector-label">
            اللون: <span className="selected-value">{selectedColor.color}</span>
          </label>
          <div className="color-swatches">
            {pajama.colors.map((c) => (
              <button
                key={c.color}
                className={`color-swatch ${selectedColor.color === c.color ? 'active' : ''}`}
                style={{ backgroundColor: c.colorHex }}
                title={c.color}
                onClick={() => setSelectedColor(c)}
                aria-label={`اختار لون ${c.color}`}
              />
            ))}
          </div>
        </div>

        {/* Size selector */}
        <div className="pajama-selector-group">
          <label className="pajama-selector-label">
            المقاس:
            {selectedSize && <span className="selected-value"> {selectedSize}</span>}
          </label>
          <div className="size-options">
            {pajama.sizes.map((size) => (
              <button
                key={size}
                className={`size-btn ${selectedSize === size ? 'active' : ''}`}
                onClick={() => {
                  setSelectedSize(size);
                  setError('');
                }}
                aria-label={`مقاس ${size}`}
              >
                {size}
              </button>
            ))}
          </div>
          {error && <p className="selector-error">{error}</p>}
        </div>

        {/* CTA button */}
        <button
          className={`pajama-select-btn ${isAlreadySelected ? 'selected' : ''}`}
          onClick={handleSelect}
          disabled={isAlreadySelected}
          aria-label={isAlreadySelected ? 'تم اختيار هذه البجامة' : `اختار ${pajama.name}`}
        >
          {isAlreadySelected ? (
            <>
              <Check size={18} strokeWidth={3} />
              تم الاختيار
            </>
          ) : (
            <>
              <ShoppingBag size={18} />
              اختار هذه البجامة
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default PajamaCard;
