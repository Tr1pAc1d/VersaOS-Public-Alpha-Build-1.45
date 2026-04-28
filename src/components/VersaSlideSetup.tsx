import React from 'react';
import { GenericSetupWizard } from './GenericSetupWizard';

interface VersaSlideSetupProps {
  vfs: any;
  onComplete: () => void;
  onCancel: () => void;
}

export const VersaSlideSetup: React.FC<VersaSlideSetupProps> = ({ vfs, onComplete, onCancel }) => {
  return (
    <GenericSetupWizard
      appId="versaslide"
      appName="VersaSlide Presentation Suite"
      appVersion="1.0"
      customIcon="/Icons/bar_graph-1.png"
      vfs={vfs}
      onComplete={onComplete}
      onCancel={onCancel}
    />
  );
};
