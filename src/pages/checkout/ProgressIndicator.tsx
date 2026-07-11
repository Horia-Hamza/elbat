import React from 'react';
import { Check } from 'lucide-react';
import type { SelectedPajama } from './types';

interface ProgressIndicatorProps {
  currentStep: number;
  selectedPajamas: (SelectedPajama | null)[];
}

const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({ currentStep, selectedPajamas }) => {
  const steps = [
    { label: 'البجامة الأولى', step: 0 },
    { label: 'البجامة الثانية', step: 1 },
    { label: 'البجامة الثالثة', step: 2 },
  ];

  const completedCount = selectedPajamas.filter(Boolean).length;

  return (
    <div className="progress-indicator">
      <div className="progress-steps">
        {steps.map(({ label, step }) => {
          const isCompleted = selectedPajamas[step] !== null;
          const isActive = currentStep === step && !isCompleted;
          return (
            <div
              key={step}
              className={`progress-step ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''}`}
            >
              <div className="progress-step-circle">
                {isCompleted ? (
                  <Check size={14} strokeWidth={3} />
                ) : (
                  <span>{step + 1}</span>
                )}
              </div>
              <span className="progress-step-label">{label}</span>
            </div>
          );
        })}

        {/* Connector lines */}
        <div className="progress-lines">
          <div className={`progress-line ${completedCount >= 1 ? 'filled' : ''}`} />
          <div className={`progress-line ${completedCount >= 2 ? 'filled' : ''}`} />
        </div>
      </div>

      <div className="progress-counter">
        <span className="progress-counter-num">{completedCount}</span>
        <span className="progress-counter-of">/ 3 بجامات مختارة</span>
      </div>
    </div>
  );
};

export default ProgressIndicator;
