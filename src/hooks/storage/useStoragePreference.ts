import { useState, useEffect, useCallback } from "react";
import { databaseService } from "@/services/databaseService";
import { useToast } from "@/hooks/use-toast";
import { useConnectionChecker } from "./useConnectionChecker";
import { useStorageStatus } from "./useStorageStatus";
import { StorageStatus } from "./types";

export type { StorageStatus };

/**
 * Hook that manages storage preference between local storage and database
 */
export function useStoragePreference(onStorageChange: (useDatabase: boolean) => void) {
  const [useDatabase, setUseDatabase] = useState(false);
  const { toast } = useToast();
  const { checkDatabaseConnection } = useConnectionChecker();
  const { 
    storageStatus, 
    setCheckingConnection, 
    handleConnectionResult,
    setStorageMessage,
    updateStorageStatus
  } = useStorageStatus();

  // Check database connection and handle results
  const checkConnection = useCallback(async () => {
    setCheckingConnection(true);
    try {
      const result = await checkDatabaseConnection();
      return handleConnectionResult(result);
    } finally {
      setCheckingConnection(false);
    }
  }, [checkDatabaseConnection, handleConnectionResult, setCheckingConnection]);

  // Load saved storage preference
  useEffect(() => {
    const init = async () => {
      // Load saved storage setting
      const savedPreference = localStorage.getItem("storagePreference");
      if (savedPreference) {
        const shouldUseDatabase = JSON.parse(savedPreference);
        setUseDatabase(shouldUseDatabase);
        setStorageMessage(shouldUseDatabase);
        
        // Load saved DB configuration if available
        const config = databaseService.loadConfig();
        if (config) {
          databaseService.setConfig(config);
          
          // Check connection if database is selected
          if (shouldUseDatabase) {
            const connected = await checkConnection();
            
            // Fall back to local storage if connection fails
            if (!connected) {
              setUseDatabase(false);
              localStorage.setItem("storagePreference", JSON.stringify(false));
              onStorageChange(false);
              setStorageMessage(false);
              
              toast({
                title: "Zur lokalen Speicherung gewechselt",
                description: "Die gespeicherte Datenbankkonfiguration konnte nicht verbunden werden.",
                duration: 3000,
              });
            }
          }
        }
      } else {
        setStorageMessage(false);
      }
    };
    
    init();
  }, [checkConnection, onStorageChange, setStorageMessage, toast]);

  // Monitor connection status when database is active
  useEffect(() => {
    let interval: number | undefined;
    
    if (useDatabase) {
      // Set initial status
      updateStorageStatus({ isConnected: databaseService.isDbConnected() });
      
      // Check status regularly
      interval = window.setInterval(() => {
        const connected = databaseService.isDbConnected();
        
        // Show a notification if connection is lost
        if (!connected && storageStatus.isConnected) {
          updateStorageStatus({ 
            isConnected: false,
            connectionError: databaseService.getLastError() || "Verbindung verloren",
            storageStatusMessage: "Verbindung zur Datenbank unterbrochen!"
          });
          
          toast({
            title: "Datenbankverbindung verloren",
            description: "Die Verbindung zur Datenbank wurde unterbrochen.",
            variant: "destructive",
            duration: 5000,
          });
        } else {
          updateStorageStatus({ isConnected: connected });
        }
      }, 5000); // Check every 5 seconds
    }
    
    return () => {
      if (interval) window.clearInterval(interval);
    };
  }, [useDatabase, storageStatus.isConnected, toast, updateStorageStatus]);

  // Handle storage method change
  const handleStorageChange = async (checked: boolean) => {
    if (checked) {
      // Update status and show UI feedback
      setCheckingConnection(true);
      toast({
        title: "Verbindung wird geprüft",
        description: "Prüfe Verbindung zur Datenbank...",
        duration: 2000,
      });
      
      // Check database connection when database is selected
      const connected = await checkConnection();
      
      if (!connected) {
        const errorMsg = databaseService.getLastError() || "Keine Verbindung zur Datenbank möglich.";
        toast({
          title: "Verbindungsfehler",
          description: errorMsg,
          variant: "destructive",
          duration: 5000,
        });
        setUseDatabase(false);
        setStorageMessage(false);
        return;
      }
      
      toast({
        title: "Verbindung hergestellt",
        description: "Erfolgreich mit der Datenbank verbunden. Daten werden in der Datenbank gespeichert.",
        duration: 3000,
      });
      
      setStorageMessage(true);
    } else {
      toast({
        title: "Lokale Speicherung aktiviert",
        description: "Die Daten werden jetzt lokal im Browser gespeichert.",
        duration: 3000,
      });
      
      setStorageMessage(false);
    }

    // Save preference and inform parent component
    setUseDatabase(checked);
    localStorage.setItem("storagePreference", JSON.stringify(checked));
    onStorageChange(checked);
  };

  // Handle configuration changes
  const handleConfigChange = async () => {
    // Always check connection status after configuration changes
    if (useDatabase) {
      // Test connection with new settings
      const connected = await checkConnection();
      
      // Fall back to local storage if connection fails
      if (!connected) {
        setUseDatabase(false);
        localStorage.setItem("storagePreference", JSON.stringify(false));
        onStorageChange(false);
        setStorageMessage(false);
        
        toast({
          title: "Lokale Speicherung aktiviert",
          description: "Keine Verbindung zur Datenbank möglich. Die Daten werden lokal gespeichert.",
          duration: 3000,
        });
      } else {
        // If connection is successful
        setStorageMessage(true);
      }
    }
  };

  return {
    useDatabase,
    storageStatus,
    handleStorageChange,
    handleConfigChange
  };
}
