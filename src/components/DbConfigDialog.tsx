
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

interface DbConfigDialogProps {
  onConfigChange: () => void;
}

export function DbConfigDialog({ onConfigChange }: DbConfigDialogProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  
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
    setConfig(prev => ({
      ...prev,
      [field]: field === 'port' ? parseInt(value) || 0 : value
    }));
  };

  const handleSave = async () => {
    databaseService.setConfig(config);
    setOpen(false);
    
    // Teste die Verbindung mit den neuen Einstellungen
    const connected = await databaseService.testConnection();
    
    if (connected) {
      toast({
        title: "Konfiguration gespeichert",
        description: "Die Datenbankverbindung wurde erfolgreich eingerichtet.",
        duration: 3000,
      });
    } else {
      const errorMsg = databaseService.getLastError() || "Unbekannter Fehler";
      toast({
        title: "Verbindungsproblem",
        description: errorMsg,
        variant: "destructive",
        duration: 5000,
      });
    }
    
    onConfigChange();
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
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
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
          <Button onClick={handleSave}>Speichern</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
