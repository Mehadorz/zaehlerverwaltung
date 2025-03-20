
import { StorageToggle } from "@/components/StorageToggle";
import { Database, BarChart } from "lucide-react";

interface HeaderSectionProps {
  onStorageChange: (useDatabase: boolean) => void;
}

export const HeaderSection = ({ onStorageChange }: HeaderSectionProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <BarChart className="h-8 w-8 text-blue-500" />
        <h1 className="text-3xl font-bold">Zählermanagement</h1>
      </div>
      
      <div className="p-4 bg-white rounded-lg shadow-sm border">
        <div className="flex flex-col">
          <h2 className="text-lg font-medium mb-2 flex items-center">
            <Database className="h-5 w-5 text-blue-500 mr-2" />
            Datenspeicherung
          </h2>
          <p className="text-sm text-gray-600 mb-3">
            Wählen Sie, wo Ihre Zählerdaten gespeichert werden sollen. Bei der Datenbankspeicherung sind die Daten auf dem Server verfügbar.
          </p>
          <StorageToggle onStorageChange={onStorageChange} />
        </div>
      </div>
    </div>
  );
};
