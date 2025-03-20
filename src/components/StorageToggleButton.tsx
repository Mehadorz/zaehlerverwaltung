
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { StorageStatus } from "@/hooks/useStoragePreference";

interface StorageToggleButtonProps {
  useDatabase: boolean;
  status: StorageStatus;
  onToggle: (checked: boolean) => void;
}

export const StorageToggleButton = ({ 
  useDatabase, 
  status, 
  onToggle 
}: StorageToggleButtonProps) => {
  const { isConnected, isCheckingConnection } = status;

  return (
    <div className="flex items-center space-x-4">
      <div className="flex items-center space-x-2">
        <Switch
          id="storage-toggle"
          checked={useDatabase}
          onCheckedChange={onToggle}
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
  );
};
