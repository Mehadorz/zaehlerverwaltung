
import { useEffect, useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { databaseService } from "@/services/databaseService";
import { useToast } from "@/hooks/use-toast";
import { DbConfigDialog } from "@/components/DbConfigDialog";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface StorageToggleProps {
  onStorageChange: (useDatabase: boolean) => void;
}

export const StorageToggle = ({ onStorageChange }: StorageToggleProps) => {
  // State für die Datenbanknutzung und den Verbindungsstatus
  const [useDatabase, setUseDatabase] = useState(false);
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const { toast } = useToast();

  // Lade die gespeicherte Einstellung beim Start
  useEffect(() => {
    // Lade die gespeicherte Speichereinstellung
    const savedPreference = localStorage.getItem("storagePreference");
    if (savedPreference) {
      const shouldUseDatabase = JSON.parse(savedPreference);
      setUseDatabase(shouldUseDatabase);
      
      // Wenn Datenbank ausgewählt wurde, Verbindung prüfen
      if (shouldUseDatabase) {
        checkDatabaseConnection();
      }
    }
    
    // Lade gespeicherte DB-Konfiguration, falls vorhanden
    const config = databaseService.loadConfig();
    if (config) {
      databaseService.setConfig(config);
    }
  }, []);

  // Prüfe die Datenbankverbindung wenn useDatabase aktiviert wird
  const checkDatabaseConnection = async () => {
    setConnectionError(null);
    const connected = await databaseService.testConnection();
    setIsConnected(connected);
    
    if (!connected) {
      const errorMsg = databaseService.getLastError();
      setConnectionError(errorMsg);
      console.error("Verbindungsfehler:", errorMsg);
    }
    
    return connected;
  };

  // Handler für Änderungen der Speichermethode
  const handleStorageChange = async (checked: boolean) => {
    if (checked) {
      // Prüfe die Datenbankverbindung wenn Datenbank gewählt wurde
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
        return;
      }
      toast({
        title: "Verbindung hergestellt",
        description: "Erfolgreich mit der Datenbank verbunden. Daten werden in der Datenbank gespeichert.",
        duration: 3000,
      });
    } else {
      toast({
        title: "Lokale Speicherung aktiviert",
        description: "Die Daten werden jetzt lokal im Browser gespeichert.",
        duration: 3000,
      });
    }

    // Speichere die Präferenz und informiere die übergeordnete Komponente
    setUseDatabase(checked);
    localStorage.setItem("storagePreference", JSON.stringify(checked));
    onStorageChange(checked);
  };

  // Handler für Konfigurationsänderungen
  const handleConfigChange = () => {
    if (useDatabase) {
      // Teste die Verbindung mit den neuen Einstellungen
      checkDatabaseConnection();
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="storage-toggle"
              checked={useDatabase}
              onCheckedChange={handleStorageChange}
            />
            <Label htmlFor="storage-toggle">
              {useDatabase ? "Datenbank Speicherung" : "Lokale Speicherung"}
            </Label>
          </div>
          {useDatabase && (
            <div className="flex items-center">
              {isConnected === true && (
                <CheckCircle className="w-5 h-5 text-green-500" />
              )}
              {isConnected === false && (
                <XCircle className="w-5 h-5 text-red-500" />
              )}
              {isConnected === null && (
                <AlertTriangle className="w-5 h-5 text-yellow-500" />
              )}
            </div>
          )}
        </div>
        
        <DbConfigDialog onConfigChange={handleConfigChange} />
      </div>
      
      {useDatabase && connectionError && (
        <Alert variant="destructive" className="mt-2">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="text-xs">
            {connectionError}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};
