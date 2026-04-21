import React from "react";
import { Terminal } from "./Terminal";

interface OpenDOSPromptProps {
  onReboot: () => void;
  neuralBridgeActive: boolean;
  neuralBridgeEnabled: boolean;
}

export const OpenDOSPrompt: React.FC<OpenDOSPromptProps> = ({
  onReboot,
  neuralBridgeActive,
  neuralBridgeEnabled,
}) => {
  return (
    <div className="w-full h-full bg-black text-[#00ff41] font-mono overflow-hidden">
      <Terminal
        onReboot={onReboot}
        guiEnabled={true}
        onStartGUI={() => {}}
        neuralBridgeEnabled={neuralBridgeEnabled}
        neuralBridgeActive={neuralBridgeActive}
        onActivateBridge={() => {}}
      />
    </div>
  );
};
