
import { StorageToggle } from "@/components/StorageToggle";

interface HeaderSectionProps {
  onStorageChange: (useDatabase: boolean) => void;
}

export const HeaderSection = ({ onStorageChange }: HeaderSectionProps) => {
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">Zählermanagement</h1>
      <div className="w-full">
        <StorageToggle onStorageChange={onStorageChange} />
      </div>
    </div>
  );
};
