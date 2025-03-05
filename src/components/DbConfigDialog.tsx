
import { useState } from "react";
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
import { DatabaseIcon } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

interface DbConfigDialogProps {
  onConfigChange: () => void;
}

export function DbConfigDialog({ onConfigChange }: DbConfigDialogProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [configError, setConfigError] = useState<string | null>(null);
  
  // Lade gespeicherte Konfiguration oder setze Standardwerte
  const savedConfig = databaseService.loadConfig() || {
    host: "localhost",
    port: 3000,
    username: "meter_user",
    password: "meter_password",
    database: "meter_db"
  };
  
  const [config, setConfig] = useState<DbConfig>(savedConfig);

  const handleChange = (field: keyof DbConfig, value: string) => {
    setConfigError(null);
    setConfig(prev => ({
      ...prev,
      [field]: field === 'port' ? parseInt(value) || 0 : value
    }));
  };

  const validateConfig = (): boolean => {
    // Prüfe, ob alle erforderlichen Felder gefüllt sind
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

  const handleSave = async () => {
    // Zuerst Konfiguration validieren
    if (!validateConfig()) {
      return;
    }
    
    setIsSaving(true);
    setConfigError(null);
    
    try {
      // Konfiguration im Service speichern
      databaseService.setConfig(config);
      
      // Teste die Verbindung mit den neuen Einstellungen
      toast({
        title: "Konfiguration gespeichert",
        description: "Prüfe Verbindung mit den neuen Einstellungen...",
        duration: 2000,
      });
      
      const connected = await databaseService.testConnection();
      
      if (connected) {
        toast({
          title: "Verbindung erfolgreich",
          description: "Die Datenbankverbindung wurde erfolgreich eingerichtet.",
          duration: 3000,
        });
        
        // Dialog schließen
        setOpen(false);
      } else {
        const errorMsg = databaseService.getLastError() || "Unbekannter Fehler";
        setConfigError(errorMsg);
        toast({
          title: "Verbindungsproblem",
          description: errorMsg,
          variant: "destructive",
          duration: 5000,
        });
      }
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Beim Speichern der Konfiguration ist ein Fehler aufgetreten.",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsSaving(false);
      onConfigChange();
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
              <strong>Hinweis:</strong> In der Demo-Version können Sie sich 
              nur mit localhost, 127.0.0.1, db, database oder mysql verbinden.
            </div>
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {configError && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{configError}</AlertDescription>
            </Alert>
          )}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="host" className="text-right">
              Host
            </Label>
            <Input
              id="host"
              value={config.host}
              onChange={(e) => handleChange('host', e.target.value)}
              className="col-span-3"
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
