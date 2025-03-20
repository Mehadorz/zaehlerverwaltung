
import { useState, useEffect, useCallback } from "react";
import { databaseService } from "@/services/databaseService";
import { useToast } from "@/hooks/use-toast";

export type StorageStatus = {
  isConnected: boolean | null;
  connectionError: string | null;
  storageStatusMessage: string | null;
  isCheckingConnection: boolean;
};

export function useStoragePreference(onStorageChange: (useDatabase: boolean) => void) {
  const [useDatabase, setUseDatabase] = useState(false);
  const [storageStatus, setStorageStatus] = useState<StorageStatus>({
    isConnected: null,
    connectionError: null,
    storageStatusMessage: null,
    isCheckingConnection: false
  });
  const { toast } = useToast();

  // Check database connection
  const checkDatabaseConnection = useCallback(async () => {
    setStorageStatus(prev => ({ 
      ...prev, 
      connectionError: null, 
      isCheckingConnection: true 
    }));
    
    try {
      console.log("Prüfe Datenbankverbindung...");
      const connected = await databaseService.testConnection();
      setStorageStatus(prev => ({ ...prev, isConnected: connected }));
      
      if (!connected) {
        const errorMsg = databaseService.getLastError();
        setStorageStatus(prev => ({ ...prev, connectionError: errorMsg }));
        console.error("Verbindungsfehler:", errorMsg);
      } else {
        console.log("Datenbankverbindung erfolgreich hergestellt");
      }
      
      return connected;
    } finally {
      setStorageStatus(prev => ({ ...prev, isCheckingConnection: false }));
    }
  }, []);

  // Load saved storage preference
  useEffect(() => {
    const init = async () => {
      // Load saved storage setting
      const savedPreference = localStorage.getItem("storagePreference");
      if (savedPreference) {
        const shouldUseDatabase = JSON.parse(savedPreference);
        setUseDatabase(shouldUseDatabase);
        
        if (shouldUseDatabase) {
          setStorageStatus(prev => ({ 
            ...prev, 
            storageStatusMessage: "Daten werden in der Datenbank gespeichert" 
          }));
        } else {
          setStorageStatus(prev => ({ 
            ...prev, 
            storageStatusMessage: "Daten werden lokal im Browser gespeichert" 
          }));
        }
        
        // Load saved DB configuration if available
        const config = databaseService.loadConfig();
        if (config) {
          databaseService.setConfig(config);
          
          // Check connection if database is selected
          if (shouldUseDatabase) {
            const connected = await checkDatabaseConnection();
            
            // Fall back to local storage if connection fails
            if (!connected) {
              setUseDatabase(false);
              localStorage.setItem("storagePreference", JSON.stringify(false));
              onStorageChange(false);
              setStorageStatus(prev => ({ 
                ...prev, 
                storageStatusMessage: "Daten werden lokal im Browser gespeichert" 
              }));
              
              toast({
                title: "Zur lokalen Speicherung gewechselt",
                description: "Die gespeicherte Datenbankkonfiguration konnte nicht verbunden werden.",
                duration: 3000,
              });
            }
          }
        }
      } else {
        setStorageStatus(prev => ({ 
          ...prev, 
          storageStatusMessage: "Daten werden lokal im Browser gespeichert" 
        }));
      }
    };
    
    init();
  }, [checkDatabaseConnection, onStorageChange, toast]);

  // Monitor connection status when database is active
  useEffect(() => {
    let interval: number | undefined;
    
    if (useDatabase) {
      // Set initial status
      setStorageStatus(prev => ({ ...prev, isConnected: databaseService.isDbConnected() }));
      
      // Check status regularly
      interval = window.setInterval(() => {
        const connected = databaseService.isDbConnected();
        setStorageStatus(prev => ({ ...prev, isConnected: connected }));
        
        // Show a notification if connection is lost
        if (!connected && storageStatus.isConnected) {
          setStorageStatus(prev => ({ 
            ...prev, 
            connectionError: databaseService.getLastError() || "Verbindung verloren",
            storageStatusMessage: "Verbindung zur Datenbank unterbrochen!"
          }));
          
          toast({
            title: "Datenbankverbindung verloren",
            description: "Die Verbindung zur Datenbank wurde unterbrochen.",
            variant: "destructive",
            duration: 5000,
          });
        }
      }, 5000); // Check every 5 seconds
    }
    
    return () => {
      if (interval) window.clearInterval(interval);
    };
  }, [useDatabase, storageStatus.isConnected, toast]);

  // Handle storage method change
  const handleStorageChange = async (checked: boolean) => {
    if (checked) {
      // Update status and show UI feedback
      setStorageStatus(prev => ({ ...prev, isCheckingConnection: true }));
      toast({
        title: "Verbindung wird geprüft",
        description: "Prüfe Verbindung zur Datenbank...",
        duration: 2000,
      });
      
      // Check database connection when database is selected
      const connected = await checkDatabaseConnection();
      
      if (!connected) {
        const errorMsg = databaseService.getLastError() || "Keine Verbindung zur Datenbank möglich.";
        toast({
          title: "Verbindungsfehler",
          description: errorMsg,
          variant: "destructive",
          duration: 5000,
        });
        setUseDatabase(false);
        setStorageStatus(prev => ({ 
          ...prev, 
          storageStatusMessage: "Daten werden lokal im Browser gespeichert" 
        }));
        return;
      }
      
      toast({
        title: "Verbindung hergestellt",
        description: "Erfolgreich mit der Datenbank verbunden. Daten werden in der Datenbank gespeichert.",
        duration: 3000,
      });
      
      setStorageStatus(prev => ({ 
        ...prev, 
        storageStatusMessage: "Daten werden in der Datenbank gespeichert" 
      }));
    } else {
      toast({
        title: "Lokale Speicherung aktiviert",
        description: "Die Daten werden jetzt lokal im Browser gespeichert.",
        duration: 3000,
      });
      
      setStorageStatus(prev => ({ 
        ...prev, 
        storageStatusMessage: "Daten werden lokal im Browser gespeichert" 
      }));
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
      const connected = await checkDatabaseConnection();
      
      // Fall back to local storage if connection fails
      if (!connected) {
        setUseDatabase(false);
        localStorage.setItem("storagePreference", JSON.stringify(false));
        onStorageChange(false);
        setStorageStatus(prev => ({ 
          ...prev, 
          storageStatusMessage: "Daten werden lokal im Browser gespeichert" 
        }));
        
        toast({
          title: "Lokale Speicherung aktiviert",
          description: "Keine Verbindung zur Datenbank möglich. Die Daten werden lokal gespeichert.",
          duration: 3000,
        });
      } else {
        // If connection is successful
        setStorageStatus(prev => ({ 
          ...prev, 
          storageStatusMessage: "Daten werden in der Datenbank gespeichert" 
        }));
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
