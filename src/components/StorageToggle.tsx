
import { useEffect, useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { CheckCircle, XCircle } from "lucide-react";
import { databaseService } from "@/services/databaseService";
import { useToast } from "@/hooks/use-toast";

interface StorageToggleProps {
  onStorageChange: (useDatabase: boolean) => void;
}

export const StorageToggle = ({ onStorageChange }: StorageToggleProps) => {
  // State für die Datenbanknutzung und den Verbindungsstatus
  const [useDatabase, setUseDatabase] = useState(false);
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const { toast } = useToast();

  // Lade die gespeicherte Einstellung beim Start
  useEffect(() => {
    const savedPreference = localStorage.getItem("storagePreference");
    if (savedPreference) {
      const shouldUseDatabase = JSON.parse(savedPreference);
      setUseDatabase(shouldUseDatabase);
      handleStorageChange(shouldUseDatabase);
    }
  }, []);

  // Prüfe die Datenbankverbindung wenn useDatabase aktiviert wird
  const checkDatabaseConnection = async () => {
    const connected = await databaseService.testConnection();
    setIsConnected(connected);
    return connected;
  };

  // Handler für Änderungen der Speichermethode
  const handleStorageChange = async (checked: boolean) => {
    if (checked) {
      // Prüfe die Datenbankverbindung wenn Datenbank gewählt wurde
      const connected = await checkDatabaseConnection();
      if (!connected) {
        toast({
          title: "Verbindungsfehler",
          description: "Keine Verbindung zur Datenbank möglich. Lokale Speicherung wird beibehalten.",
          variant: "destructive",
          duration: 5000,
        });
        setUseDatabase(false);
        return;
      }
      toast({
        title: "Verbindung hergestellt",
        description: "Erfolgreich mit der Datenbank verbunden.",
        duration: 3000,
      });
    }

    // Speichere die Präferenz und informiere die übergeordnete Komponente
    setUseDatabase(checked);
    localStorage.setItem("storagePreference", JSON.stringify(checked));
    onStorageChange(checked);
  };

  return (
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
          {isConnected ? (
            <CheckCircle className="w-5 h-5 text-green-500" />
          ) : (
            <XCircle className="w-5 h-5 text-red-500" />
          )}
        </div>
      )}
    </div>
  );
};
