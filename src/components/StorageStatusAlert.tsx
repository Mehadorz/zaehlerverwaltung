
import { AlertTriangle, Database, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { StorageStatus } from "@/hooks/useStoragePreference";

interface StorageStatusAlertProps {
  useDatabase: boolean;
  status: StorageStatus;
}

export const StorageStatusAlert = ({ useDatabase, status }: StorageStatusAlertProps) => {
  const { isConnected, connectionError, storageStatusMessage } = status;

  if (!storageStatusMessage) return null;

  return (
    <>
      {storageStatusMessage && (
        <Alert variant={useDatabase && isConnected ? "default" : "default"} 
               className={`mt-2 ${useDatabase && isConnected ? "bg-blue-50 border-blue-200" : "bg-gray-50"}`}>
          {useDatabase && isConnected ? (
            <Database className="h-4 w-4 text-blue-500" />
          ) : (
            <Info className="h-4 w-4 text-gray-500" />
          )}
          <AlertDescription className={`text-xs ${useDatabase && isConnected ? "text-blue-700" : "text-gray-700"}`}>
            {storageStatusMessage}
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
    </>
  );
};
