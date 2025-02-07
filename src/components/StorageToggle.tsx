
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useState } from "react";

interface StorageToggleProps {
  onStorageChange: (useDatabase: boolean) => void;
}

export const StorageToggle = ({ onStorageChange }: StorageToggleProps) => {
  const [useDatabase, setUseDatabase] = useState(false);

  const handleToggle = (checked: boolean) => {
    setUseDatabase(checked);
    onStorageChange(checked);
  };

  return (
    <div className="flex items-center space-x-2 mb-4">
      <Switch
        id="storage-toggle"
        checked={useDatabase}
        onCheckedChange={handleToggle}
      />
      <Label htmlFor="storage-toggle">
        {useDatabase ? "MariaDB Speicherung" : "Lokale Speicherung"}
      </Label>
    </div>
  );
};
