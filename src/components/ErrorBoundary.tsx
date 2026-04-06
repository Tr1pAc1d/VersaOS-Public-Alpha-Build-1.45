import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  errorMessage: string;
}

export class ErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false,
    errorMessage: ""
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, errorMessage: error.message };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center w-full h-full bg-[#0000aa] text-white font-mono p-4">
          <div className="bg-white text-[#0000aa] px-2 py-1 font-bold mb-4">
            FATAL APPLICATION EXCEPTION
          </div>
          <p className="mb-4 text-center">
            A fatal exception has occurred in the application at memory location 0x00000000.
            The current application will be terminated.
          </p>
          <p className="text-yellow-300 font-bold mb-8 text-center bg-black p-2">
            ERR: {this.state.errorMessage}
          </p>
          <p className="text-sm">
            Please close this window and restart the application.
          </p>
        </div>
      );
    }

    return (this as any).props.children;
  }
}
