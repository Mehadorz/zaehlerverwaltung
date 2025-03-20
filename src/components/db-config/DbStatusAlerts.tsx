
import { AlertTriangle, Server, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface DbStatusAlertsProps {
  connectionStatus: string | null;
  configError: string | null;
}

export function DbStatusAlerts({ 
  connectionStatus, 
  configError 
}: DbStatusAlertsProps) {
  return (
    <>
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
    </>
  );
}
