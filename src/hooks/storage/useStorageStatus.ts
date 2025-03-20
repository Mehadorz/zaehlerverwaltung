
import { useState, useCallback } from "react";
import { StorageStatus, StorageStatusUpdate, ConnectionCheckResult } from "./types";

/**
 * Hook that manages storage status state
 */
export function useStorageStatus() {
  const [storageStatus, setStorageStatus] = useState<StorageStatus>({
    isConnected: null,
    connectionError: null,
    storageStatusMessage: null,
    isCheckingConnection: false
  });

  /**
   * Update storage status
   */
  const updateStorageStatus = useCallback((update: StorageStatusUpdate) => {
    setStorageStatus(prev => ({ ...prev, ...update }));
  }, []);

  /**
   * Set checking connection status
   */
  const setCheckingConnection = useCallback((isChecking: boolean) => {
    updateStorageStatus({ 
      isCheckingConnection: isChecking,
      connectionError: isChecking ? null : storageStatus.connectionError 
    });
  }, [storageStatus.connectionError, updateStorageStatus]);

  /**
   * Update status based on connection check results
   */
  const handleConnectionResult = useCallback((result: ConnectionCheckResult) => {
    updateStorageStatus({
      isConnected: result.connected,
      connectionError: result.connected ? null : result.errorMsg || null
    });
    return result.connected;
  }, [updateStorageStatus]);

  /**
   * Set storage message based on whether database is in use
   */
  const setStorageMessage = useCallback((useDatabase: boolean) => {
    updateStorageStatus({
      storageStatusMessage: useDatabase 
        ? "Daten werden in der Datenbank gespeichert"
        : "Daten werden lokal im Browser gespeichert"
    });
  }, [updateStorageStatus]);

  return {
    storageStatus,
    updateStorageStatus,
    setCheckingConnection,
    handleConnectionResult,
    setStorageMessage
  };
}
