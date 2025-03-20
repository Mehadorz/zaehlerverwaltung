
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { databaseService, DbConfig } from "@/services/databaseService";
import { useToast } from "@/hooks/use-toast";
import { DatabaseIcon, AlertTriangle, Info, Server } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface DbConfigDialogProps {
  onConfigChange: () => void;
}

export function DbConfigDialog({ onConfigChange }: DbConfigDialogProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [configError, setConfigError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<string | null>(null);
  
  const savedConfig = databaseService.loadConfig() || {
    host: "localhost",
    port: 3306,  // Standardport für MySQL
    username: "meter_user",
    password: "meter_password",
    database: "meter_db"
  };
  
  const [config, setConfig] = useState<DbConfig>(savedConfig);

  // Effekt zum Laden des Verbindungsstatus beim Öffnen des Dialogs
  useEffect(() => {
    const checkConnection = async () => {
      if (open && databaseService.isDbConnected()) {
        setConnectionStatus("Verbunden mit Datenbank");
      } else if (open) {
        setConnectionStatus(null);
      }
    };
    
    checkConnection();
  }, [open]);

  // Handler für Änderungen der Konfigurationsfelder
  const handleChange = (field: keyof DbConfig, value: string) => {
    setConfigError(null);
    setConnectionStatus(null);
    setConfig(prev => ({
      ...prev,
      [field]: field === 'port' ? parseInt(value) || 0 : value
    }));
  };

  // Validierung der Konfigurationsdaten
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

  // Handler für das Speichern der Konfiguration
  const handleSave = async () => {
    if (!validateConfig()) {
      return;
    }
    
    setIsSaving(true);
    setConfigError(null);
    setConnectionStatus(null);
    
    try {
      // Konfiguration speichern
      databaseService.setConfig(config);
      
      // Feedback für den Benutzer
      toast({
        title: "Konfiguration gespeichert",
        description: "Prüfe Verbindung mit den neuen Einstellungen...",
        duration: 2000,
      });
      
      // Verbindungstest durchführen
      const connected = await databaseService.testConnection();
      
      if (connected) {
        // Bei erfolgreicher Verbindung
        setConnectionStatus("Verbunden mit Datenbank");
        toast({
          title: "Verbindung erfolgreich",
          description: "Die Datenbankverbindung wurde erfolgreich eingerichtet.",
          duration: 3000,
        });
        
        // Dialog schließen
        setOpen(false);
      } else {
        // Bei Verbindungsfehler
        const errorMsg = databaseService.getLastError() || "Unbekannter Fehler";
        setConfigError(errorMsg);
        setConnectionStatus("Keine Verbindung möglich");
        toast({
          title: "Verbindungsproblem",
          description: errorMsg,
          variant: "destructive",
          duration: 5000,
        });
      }
    } catch (error) {
      // Bei unerwarteten Fehlern
      toast({
        title: "Fehler",
        description: "Beim Speichern der Konfiguration ist ein Fehler aufgetreten.",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsSaving(false);
      onConfigChange(); // Benachrichtigung an die übergeordnete Komponente
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <DatabaseIcon className="w-4 h-4 mr-2" />
          DB Konfiguration
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Datenbank Konfiguration</DialogTitle>
          <DialogDescription>
            Bitte geben Sie die Verbindungsdaten für Ihre Datenbank ein.
            <div className="mt-2 p-2 bg-amber-50 text-amber-800 text-xs rounded border border-amber-200">
              <strong>Hinweis:</strong> Für diese Demo-Version werden nur bestimmte vordefinierte 
              Verbindungskonfigurationen akzeptiert. Verwenden Sie die empfohlene Konfiguration unten.
            </div>
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {connectionStatus && (
            <Alert variant="default" className="bg-green-50 border-green-200">
              <Server className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-xs text-green-700">
                <strong>{connectionStatus}</strong>
              </AlertDescription>
            </Alert>
          )}
          
          {configError && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{configError}</AlertDescription>
            </Alert>
          )}
          
          {/* Empfohlene Konfiguration */}
          <Alert variant="default" className="bg-blue-50 border-blue-200">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-xs text-blue-700">
              <strong>Empfohlene Konfiguration für Demo:</strong><br/>
              Host: localhost<br/>
              Port: 3306<br/>
              Benutzername: meter_user<br/>
              Passwort: meter_password<br/>
              Datenbank: meter_db
            </AlertDescription>
          </Alert>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="host" className="text-right">
              Host
            </Label>
            <Input
              id="host"
              value={config.host}
              onChange={(e) => handleChange('host', e.target.value)}
              className="col-span-3"
              placeholder="localhost"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="port" className="text-right">
              Port
            </Label>
            <Input
              id="port"
              type="number"
              value={config.port}
              onChange={(e) => handleChange('port', e.target.value)}
              className="col-span-3"
              placeholder="3306"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="username" className="text-right">
              Benutzername
            </Label>
            <Input
              id="username"
              value={config.username}
              onChange={(e) => handleChange('username', e.target.value)}
              className="col-span-3"
              placeholder="meter_user"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="password" className="text-right">
              Passwort
            </Label>
            <Input
              id="password"
              type="password"
              value={config.password}
              onChange={(e) => handleChange('password', e.target.value)}
              className="col-span-3"
              placeholder="•••••••••"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="database" className="text-right">
              Datenbank
            </Label>
            <Input
              id="database"
              value={config.database}
              onChange={(e) => handleChange('database', e.target.value)}
              className="col-span-3"
              placeholder="meter_db"
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                Speichern...
              </>
            ) : (
              "Speichern"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
