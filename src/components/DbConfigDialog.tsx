
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
import { useDbConfig } from "@/hooks/useDbConfig";
import { DatabaseIcon } from "lucide-react";
import { DbConfigForm } from "@/components/db-config/DbConfigForm";
import { DbStatusAlerts } from "@/components/db-config/DbStatusAlerts";

interface DbConfigDialogProps {
  onConfigChange: () => void;
}

export function DbConfigDialog({ onConfigChange }: DbConfigDialogProps) {
  const [open, setOpen] = useState(false);
  
  const {
    config,
    isSaving,
    configError,
    connectionStatus,
    handleChange,
    saveConfig,
    checkConnectionStatus
  } = useDbConfig(onConfigChange);

  // Check connection status when dialog opens
  useEffect(() => {
    if (open) {
      checkConnectionStatus();
    }
  }, [open]);

  // Handle save button click
  const handleSave = async () => {
    const success = await saveConfig();
    if (success) {
      setOpen(false);
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
          </DialogDescription>
        </DialogHeader>
        
        <DbStatusAlerts 
          connectionStatus={connectionStatus} 
          configError={configError} 
        />
        
        <DbConfigForm 
          config={config} 
          onChange={handleChange} 
        />
        
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
