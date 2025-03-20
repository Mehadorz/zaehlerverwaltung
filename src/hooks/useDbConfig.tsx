
import { useState, useEffect } from "react";
import { databaseService, DbConfig } from "@/services/databaseService";
import { useToast } from "@/hooks/use-toast";

export function useDbConfig(onConfigChange: () => void) {
  const { toast } = useToast();
  const [config, setConfig] = useState<DbConfig>(
    databaseService.loadConfig() || {
      host: "localhost",
      port: 3306,
      username: "meter_user",
      password: "meter_password",
      database: "meter_db"
    }
  );
  const [isSaving, setIsSaving] = useState(false);
  const [configError, setConfigError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<string | null>(null);

  // Check connection status when needed
  const checkConnectionStatus = async () => {
    if (databaseService.isDbConnected()) {
      setConnectionStatus("Verbunden mit Datenbank");
      return true;
    } else {
      setConnectionStatus(null);
      return false;
    }
  };

  // Handle field changes
  const handleChange = (field: keyof DbConfig, value: string) => {
    setConfigError(null);
    setConnectionStatus(null);
    setConfig(prev => ({
      ...prev,
      [field]: field === 'port' ? parseInt(value) || 0 : value
    }));
  };

  // Validate configuration
  const validateConfig = (): boolean => {
    if (!config.host || config.host.trim() === '') {
      setConfigError("Bitte geben Sie einen Host an");
      return false;
    }
    
    if (!config.port || config.port <= 0 || config.port > 65535) {
      setConfigError("Bitte geben Sie einen gültigen Port zwischen 1 und 65535 an");
      return false;
    }
    
    if (!config.username || config.username.trim() === '') {
      setConfigError("Bitte geben Sie einen Benutzernamen an");
      return false;
    }
    
    if (!config.password || config.password.trim() === '') {
      setConfigError("Bitte geben Sie ein Passwort an");
      return false;
    }
    
    if (!config.database || config.database.trim() === '') {
      setConfigError("Bitte geben Sie einen Datenbanknamen an");
      return false;
    }
    
    return true;
  };

  // Save configuration
  const saveConfig = async () => {
    if (!validateConfig()) {
      return false;
    }
    
    setIsSaving(true);
    setConfigError(null);
    setConnectionStatus(null);
    
    try {
      // Save configuration
      databaseService.setConfig(config);
      
      // Feedback for user
      toast({
        title: "Konfiguration gespeichert",
        description: "Prüfe Verbindung mit den neuen Einstellungen...",
        duration: 2000,
      });
      
      // Test connection
      const connected = await databaseService.testConnection();
      
      if (connected) {
        // Success
        setConnectionStatus("Verbunden mit Datenbank");
        toast({
          title: "Verbindung erfolgreich",
          description: "Die Datenbankverbindung wurde erfolgreich eingerichtet.",
          duration: 3000,
        });
        return true;
      } else {
        // Connection error
        const errorMsg = databaseService.getLastError() || "Unbekannter Fehler";
        setConfigError(errorMsg);
        setConnectionStatus("Keine Verbindung möglich");
        toast({
          title: "Verbindungsproblem",
          description: errorMsg,
          variant: "destructive",
          duration: 5000,
        });
        return false;
      }
    } catch (error) {
      // Unexpected error
      toast({
        title: "Fehler",
        description: "Beim Speichern der Konfiguration ist ein Fehler aufgetreten.",
        variant: "destructive",
        duration: 3000,
      });
      return false;
    } finally {
      setIsSaving(false);
      onConfigChange(); // Notify parent component
    }
  };

  return {
    config,
    isSaving,
    configError,
    connectionStatus,
    handleChange,
    saveConfig,
    checkConnectionStatus
  };
}
