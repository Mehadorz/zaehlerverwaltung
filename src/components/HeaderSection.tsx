
import { StorageToggle } from "@/components/StorageToggle";

interface HeaderSectionProps {
  onStorageChange: (useDatabase: boolean) => void;
}

export const HeaderSection = ({ onStorageChange }: HeaderSectionProps) => {
  return (
    <div className="flex justify-between items-center">
      <h1 className="text-3xl font-bold">Zählermanagement</h1>
      <StorageToggle onStorageChange={onStorageChange} />
    </div>
  );
};

