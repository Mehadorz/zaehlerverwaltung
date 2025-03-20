
import { useStoragePreference } from "@/hooks/useStoragePreference";
import { DbConfigDialog } from "@/components/DbConfigDialog";
import { StorageStatusAlert } from "@/components/StorageStatusAlert";
import { StorageToggleButton } from "@/components/StorageToggleButton";

interface StorageToggleProps {
  onStorageChange: (useDatabase: boolean) => void;
}

export const StorageToggle = ({ onStorageChange }: StorageToggleProps) => {
  const {
    useDatabase,
    storageStatus,
    handleStorageChange,
    handleConfigChange
  } = useStoragePreference(onStorageChange);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <StorageToggleButton 
          useDatabase={useDatabase} 
          status={storageStatus} 
          onToggle={handleStorageChange} 
        />
        
        <DbConfigDialog onConfigChange={handleConfigChange} />
      </div>
      
      <StorageStatusAlert useDatabase={useDatabase} status={storageStatus} />
    </div>
  );
};
