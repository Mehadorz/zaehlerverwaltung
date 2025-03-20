import { useEffect, useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { CheckCircle, XCircle, AlertTriangle, Database, Info } from "lucide-react";
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
  const [isCheckingConnection, setIsCheckingConnection] = useState(false);
  const [storageStatus, setStorageStatus] = useState<string | null>(null);
  const { toast } = useToast();

  // Lade die gespeicherte Einstellung beim Start
  useEffect(() => {
    const init = async () => {
      // Lade die gespeicherte Speichereinstellung
      const savedPreference = localStorage.getItem("storagePreference");
      if (savedPreference) {
        const shouldUseDatabase = JSON.parse(savedPreference);
        setUseDatabase(shouldUseDatabase);
        
        if (shouldUseDatabase) {
          setStorageStatus("Daten werden in der Datenbank gespeichert");
        } else {
          setStorageStatus("Daten werden lokal im Browser gespeichert");
        }
        
        // Lade gespeicherte DB-Konfiguration, falls vorhanden
        const config = databaseService.loadConfig();
        if (config) {
          databaseService.setConfig(config);
          
          // Wenn Datenbank ausgewählt wurde, Verbindung prüfen
          if (shouldUseDatabase) {
            const connected = await checkDatabaseConnection();
            
            // Falls keine Verbindung hergestellt werden konnte, auf lokalen Speicher zurückschalten
            if (!connected) {
              setUseDatabase(false);
              localStorage.setItem("storagePreference", JSON.stringify(false));
              onStorageChange(false);
              setStorageStatus("Daten werden lokal im Browser gespeichert");
              
              toast({
                title: "Zur lokalen Speicherung gewechselt",
                description: "Die gespeicherte Datenbankkonfiguration konnte nicht verbunden werden.",
                duration: 3000,
              });
            }
          }
        }
      } else {
        setStorageStatus("Daten werden lokal im Browser gespeichert");
      }
    };
    
    init();
  }, []);

  // Aktualisiere den Verbindungsstatus regelmäßig wenn Datenbank aktiv ist
  useEffect(() => {
    let interval: number | undefined;
    
    if (useDatabase) {
      // Initial den Status setzen
      setIsConnected(databaseService.isDbConnected());
      
      // Prüfe den Status regelmäßig
      interval = window.setInterval(() => {
        const connected = databaseService.isDbConnected();
        setIsConnected(connected);
        
        // Wenn die Verbindung verloren geht, eine Meldung anzeigen
        if (!connected && isConnected) {
          setConnectionError(databaseService.getLastError() || "Verbindung verloren");
          setStorageStatus("Verbindung zur Datenbank unterbrochen!");
          
          toast({
            title: "Datenbankverbindung verloren",
            description: "Die Verbindung zur Datenbank wurde unterbrochen.",
            variant: "destructive",
            duration: 5000,
          });
        }
      }, 5000); // Alle 5 Sekunden prüfen
    }
    
    return () => {
      if (interval) window.clearInterval(interval);
    };
  }, [useDatabase, isConnected, toast]);

  // Prüfe die Datenbankverbindung
  const checkDatabaseConnection = async () => {
    setConnectionError(null);
    setIsCheckingConnection(true);
    try {
      console.log("Prüfe Datenbankverbindung...");
      const connected = await databaseService.testConnection();
      setIsConnected(connected);
      
      if (!connected) {
        const errorMsg = databaseService.getLastError();
        setConnectionError(errorMsg);
        console.error("Verbindungsfehler:", errorMsg);
      } else {
        console.log("Datenbankverbindung erfolgreich hergestellt");
      }
      
      return connected;
    } finally {
      setIsCheckingConnection(false);
    }
  };

  // Handler für Änderungen der Speichermethode
  const handleStorageChange = async (checked: boolean) => {
    if (checked) {
      // Status aktualisieren und UI-Feedback zeigen
      setIsCheckingConnection(true);
      toast({
        title: "Verbindung wird geprüft",
        description: "Prüfe Verbindung zur Datenbank...",
        duration: 2000,
      });
      
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
        setStorageStatus("Daten werden lokal im Browser gespeichert");
        return;
      }
      
      toast({
        title: "Verbindung hergestellt",
        description: "Erfolgreich mit der Datenbank verbunden. Daten werden in der Datenbank gespeichert.",
        duration: 3000,
      });
      
      setStorageStatus("Daten werden in der Datenbank gespeichert");
    } else {
      toast({
        title: "Lokale Speicherung aktiviert",
        description: "Die Daten werden jetzt lokal im Browser gespeichert.",
        duration: 3000,
      });
      
      setStorageStatus("Daten werden lokal im Browser gespeichert");
    }

    // Speichere die Präferenz und informiere die übergeordnete Komponente
    setUseDatabase(checked);
    localStorage.setItem("storagePreference", JSON.stringify(checked));
    onStorageChange(checked);
  };

  // Handler für Konfigurationsänderungen
  const handleConfigChange = async () => {
    // Nach Konfigurationsänderung immer den Verbindungsstatus prüfen
    if (useDatabase) {
      // Teste die Verbindung mit den neuen Einstellungen
      const connected = await checkDatabaseConnection();
      
      // Wenn keine Verbindung hergestellt werden konnte, schalte auf lokalen Speicher zurück
      if (!connected) {
        setUseDatabase(false);
        localStorage.setItem("storagePreference", JSON.stringify(false));
        onStorageChange(false);
        setStorageStatus("Daten werden lokal im Browser gespeichert");
        
        toast({
          title: "Lokale Speicherung aktiviert",
          description: "Keine Verbindung zur Datenbank möglich. Die Daten werden lokal gespeichert.",
          duration: 3000,
        });
      } else {
        // Bei erfolgreicher Verbindung
        setStorageStatus("Daten werden in der Datenbank gespeichert");
      }
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
              disabled={isCheckingConnection}
            />
            <Label htmlFor="storage-toggle">
              {useDatabase ? "Datenbank Speicherung" : "Lokale Speicherung"}
            </Label>
          </div>
          {useDatabase && (
            <div className="flex items-center">
              {isCheckingConnection && (
                <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              )}
              {!isCheckingConnection && isConnected === true && (
                <CheckCircle className="w-5 h-5 text-green-500" />
              )}
              {!isCheckingConnection && isConnected === false && (
                <XCircle className="w-5 h-5 text-red-500" />
              )}
              {!isCheckingConnection && isConnected === null && (
                <AlertTriangle className="w-5 h-5 text-yellow-500" />
              )}
            </div>
          )}
        </div>
        
        <DbConfigDialog onConfigChange={handleConfigChange} />
      </div>
      
      {storageStatus && (
        <Alert variant={useDatabase && isConnected ? "default" : "default"} 
               className={`mt-2 ${useDatabase && isConnected ? "bg-blue-50 border-blue-200" : "bg-gray-50"}`}>
          {useDatabase && isConnected ? (
            <Database className="h-4 w-4 text-blue-500" />
          ) : (
            <Info className="h-4 w-4 text-gray-500" />
          )}
          <AlertDescription className={`text-xs ${useDatabase && isConnected ? "text-blue-700" : "text-gray-700"}`}>
            {storageStatus}
          </AlertDescription>
        </Alert>
      )}
      
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
}
