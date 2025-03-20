
/**
 * Types for storage preference functionality
 */

export type StorageStatus = {
  isConnected: boolean | null;
  connectionError: string | null;
  storageStatusMessage: string | null;
  isCheckingConnection: boolean;
};

export type StorageStatusUpdate = Partial<StorageStatus>;

export type ConnectionCheckResult = {
  connected: boolean;
  errorMsg?: string | null;
};
