export {};

declare global {
  interface Window {
    electronAPI?: {
      initiateLockdown: (config: {
        allowedApps: string[];
        primaryApp: string;
        duration: number;
        strictMode: boolean;
      }) => void;
      resumeLockdown: () => void;
      showBlockerSetup: () => void;
      endBreak: () => void;
      onTriggerBreak: (callback: () => void) => void;
      onUpdateApp: (callback: (app: any) => void) => void;
      onViolation: (callback: (data: { app: string }) => void) => void;
    };
  }
}
