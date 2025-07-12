import React from 'react';
import '../Analysis.css';

interface Step {
  number: number;
  title: string;
  subItems: string[];
}

interface StepIndicatorProps {
  steps: Step[];
  currentStep: number;
  selectedEye: 'left' | 'right';
}

const StepIndicator: React.FC<StepIndicatorProps> = ({ steps, currentStep, selectedEye }) => {
  return (
    <div className="step-sidebar">
      {steps.map((step) => {
        const isActive = currentStep === step.number;
        return (
          <div key={step.number} className={`step-item ${isActive ? 'active' : ''}`}>
            <div className="step-header">
              <div className={`step-number ${isActive ? 'active' : ''}`}>{step.number}</div>
              <span className="step-title">{step.title}</span>
            </div>
            {isActive && step.subItems && step.subItems.length > 0 && (
              <div className="step-subitems">
                {step.subItems.map((item, index) => {
                  const isLeftEye = item.includes('좌안');
                  const isRightEye = item.includes('우안');
                  const isSelected =
                    (isLeftEye && selectedEye === 'left') ||
                    (isRightEye && selectedEye === 'right');

                  return (
                    <div key={index} className={`subitem ${isSelected ? 'selected' : ''}`}>
                      • {item}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default StepIndicator; 