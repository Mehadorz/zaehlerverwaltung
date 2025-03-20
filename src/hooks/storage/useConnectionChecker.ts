
import { useCallback } from "react";
import { databaseService } from "@/services/databaseService";
import { ConnectionCheckResult } from "./types";

/**
 * Hook that provides database connection checking functionality
 */
export function useConnectionChecker() {
  /**
   * Check if the database is connected
   */
  const checkDatabaseConnection = useCallback(async (): Promise<ConnectionCheckResult> => {
    console.log("Prüfe Datenbankverbindung...");
    
    try {
      const connected = await databaseService.testConnection();
      
      if (!connected) {
        const errorMsg = databaseService.getLastError();
        console.error("Verbindungsfehler:", errorMsg);
        return { connected: false, errorMsg };
      } else {
        console.log("Datenbankverbindung erfolgreich hergestellt");
        return { connected: true };
      }
    } catch (error) {
      console.error("Fehler bei der Verbindungsprüfung:", error);
      return { 
        connected: false, 
        errorMsg: error instanceof Error ? error.message : "Unbekannter Verbindungsfehler" 
      };
    }
  }, []);

  return { checkDatabaseConnection };
}
