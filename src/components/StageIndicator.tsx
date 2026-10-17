import React from 'react';
import type { BirthdayStage } from '../types';

interface StageIndicatorProps {
  currentStage?: BirthdayStage;
  onSelectStage?: (stage: BirthdayStage) => void;
}

/**
 * Slide Navigation Indicator - Completely removed as per user request.
 * Returns null so no navigation pill, border, dots, or reserved space are rendered.
 */
export const StageIndicator: React.FC<StageIndicatorProps> = () => {
  return null;
};

export default StageIndicator;
