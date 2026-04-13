import { VStoreAccount } from '../VStoreAuth';

export interface VesperaPageProps {
  url: string;
  navigate: (url: string) => void;
  webAccount: VStoreAccount | null;
  onLaunchApp?: (appId: string) => void;
  onDownload?: (filename: string, source: string) => void;
  setWebLoginModal: (show: boolean) => void;
  handleWebLogout: () => void;
  startFailingDownload: (filename: string) => void;
  xtypeImage: string | null;
}
