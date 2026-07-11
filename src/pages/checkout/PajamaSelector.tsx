import React, { useRef } from 'react';
import { PAJAMAS } from '../../data/pajamas';
import PajamaCard from './PajamaCard';
import ProgressIndicator from './ProgressIndicator';
import type { SelectedPajama } from './types';

interface PajamaSelectorProps {
  currentStep: number;
  selectedPajamas: (SelectedPajama | null)[];
  onSelect: (selected: SelectedPajama, slotIndex: number) => void;
}

const PajamaSelector: React.FC<PajamaSelectorProps> = ({
  currentStep,
  selectedPajamas,
  onSelect,
}) => {
  const sectionRef = useRef<HTMLDivElement>(null);

  // Which pajama IDs are already selected (to disable re-selection of same model)
  const selectedIds = selectedPajamas.filter(Boolean).map((p) => p!.pajamaId);

  const handleSelect = (selected: SelectedPajama, slotIndex: number) => {
    onSelect(selected, slotIndex);
  };

  return (
    <section className="pajama-selector-section" ref={sectionRef} id="pajama-selector">
      <div className="pajama-selector-header">
        <h2 className="section-heading">اختار بجاماتك الـ 3</h2>
        <p className="section-subheading">
          كل بجامة بالمقاس واللون اللي تحبه
        </p>
      </div>

      <ProgressIndicator currentStep={currentStep} selectedPajamas={selectedPajamas} />

      {/* Current step label */}
      {selectedPajamas.filter(Boolean).length < 3 && (
        <div className="step-indicator-pill">
          <span className="step-dot" />
          <span>
            اختار البجامة{' '}
            {currentStep === 0 ? 'الأولى' : currentStep === 1 ? 'الثانية' : 'الثالثة'}
          </span>
        </div>
      )}

      {/* Product grid */}
      <div className="pajama-grid">
        {PAJAMAS.map((pajama) => {
          const isAlreadySelected = selectedIds.includes(pajama.id);
          return (
            <PajamaCard
              key={pajama.id}
              pajama={pajama}
              slotIndex={currentStep}
              isAlreadySelected={isAlreadySelected}
              onSelect={handleSelect}
            />
          );
        })}
      </div>
    </section>
  );
};

export default PajamaSelector;
