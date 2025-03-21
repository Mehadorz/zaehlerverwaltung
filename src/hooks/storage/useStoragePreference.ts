
import { useState, useEffect, useCallback } from "react";
import { databaseService } from "@/services/databaseService";
import { useToast } from "@/hooks/use-toast";
import { useConnectionChecker } from "./useConnectionChecker";
import { useStorageStatus } from "./useStorageStatus";
import type { StorageStatus } from "./types";

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
    console.log("Prüfe Datenbankverbindung (useStoragePreference)...");
    setCheckingConnection(true);
    try {
      const result = await checkDatabaseConnection();
      console.log("Verbindungsergebnis:", result);
      return handleConnectionResult(result);
    } finally {
      setCheckingConnection(false);
    }
  }, [checkDatabaseConnection, handleConnectionResult, setCheckingConnection]);

  // Load saved storage preference
  useEffect(() => {
    const init = async () => {
      console.log("Initialisiere useStoragePreference...");
      
      // Load saved storage setting
      const savedPreference = localStorage.getItem("storagePreference");
      if (savedPreference) {
        const shouldUseDatabase = JSON.parse(savedPreference);
        setUseDatabase(shouldUseDatabase);
        setStorageMessage(shouldUseDatabase);
        
        // Ensure explicit update to parent component
        onStorageChange(shouldUseDatabase);
        
        // Load saved DB configuration if available
        const config = databaseService.loadConfig();
        if (config) {
          databaseService.setConfig(config);
          
          // Check connection if database is selected
          if (shouldUseDatabase) {
            console.log("Prüfe gespeicherte Datenbankverbindung...");
            const connected = await checkConnection();
            
            // Fall back to local storage if connection fails
            if (!connected) {
              console.log("Fallback auf lokale Speicherung wegen Verbindungsfehler");
              setUseDatabase(false);
              localStorage.setItem("storagePreference", JSON.stringify(false));
              onStorageChange(false);
              setStorageMessage(false);
              
              toast({
                title: "Zur lokalen Speicherung gewechselt",
                description: "Die gespeicherte Datenbankkonfiguration konnte nicht verbunden werden.",
                duration: 3000,
              });
            } else {
              // Explicitly inform parent component about database usage
              onStorageChange(true);
              console.log("Datenbank erfolgreich verbunden. Daten werden in der Datenbank gespeichert.");
            }
          }
        }
      } else {
        // If no preference set, default to local storage
        setStorageMessage(false);
        onStorageChange(false);
      }
    };
    
    init();
  }, [checkConnection, onStorageChange, setStorageMessage, toast]);

  // Monitor connection status when database is active
  useEffect(() => {
    let interval: number | undefined;
    
    if (useDatabase) {
      // Initial connection check
      checkConnection();
      
      // Set initial status
      updateStorageStatus({ isConnected: databaseService.isDbConnected() });
      
      // Check status regularly
      interval = window.setInterval(async () => {
        console.log("Periodische Verbindungsprüfung...");
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
          
          // Auto-switch to local storage
          setUseDatabase(false);
          localStorage.setItem("storagePreference", JSON.stringify(false));
          onStorageChange(false);
          setStorageMessage(false);
        } else if (connected) {
          updateStorageStatus({ isConnected: true });
        } else if (!connected && !storageStatus.isConnected) {
          // Try to reconnect
          await checkConnection();
        }
      }, 5000); // Check every 5 seconds
    }
    
    return () => {
      if (interval) window.clearInterval(interval);
    };
  }, [useDatabase, storageStatus.isConnected, toast, updateStorageStatus, onStorageChange, setStorageMessage, checkConnection]);

  // Handle storage method change
  const handleStorageChange = async (checked: boolean) => {
    console.log("Speichermethode wird gewechselt:", checked ? "Datenbank" : "Lokal");
    
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
        onStorageChange(false);
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
    console.log("Datenbank-Konfiguration wurde geändert");
    
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
        toast({
          title: "Verbindung hergestellt",
          description: "Verbindung zur Datenbank erfolgreich aktualisiert.",
          duration: 3000,
        });
        onStorageChange(true);
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
