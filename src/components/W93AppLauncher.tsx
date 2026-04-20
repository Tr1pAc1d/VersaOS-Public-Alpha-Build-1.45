import React from 'react';

interface W93AppLauncherProps {
  appUrl: string;
}

export const W93AppLauncher: React.FC<W93AppLauncherProps> = ({ appUrl }) => {
  return (
    <div className="w-full h-full bg-black relative">
      <iframe
        src={appUrl}
        className="absolute inset-0 w-full h-full border-none"
        title="W93 Application Wrapper"
        sandbox="allow-scripts allow-same-origin"
      />
    </div>
  );
};
