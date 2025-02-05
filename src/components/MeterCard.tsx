import { Card, CardContent } from "@/components/ui/card";
import { AddReadingDialog } from "./AddReadingDialog";
import { MeterHeader } from "./MeterHeader";
import { ConsumptionChart } from "./ConsumptionChart";
import { ReadingsList } from "./ReadingsList";

interface Reading {
  date: string;
  value: number;
}

interface MeterCardProps {
  id: string;
  name: string;
  unit: string;
  isActive: boolean;
  readings: Reading[];
  onToggle: (id: string, value: boolean) => void;
  onEdit: (id: string, name: string, unit: string) => void;
  onDelete: (id: string) => void;
  onDeleteReading: (meterId: string, date: string) => void;
  onEditReading: (meterId: string, date: string, newValue: number) => void;
}

export const MeterCard = ({
  id,
  name,
  unit,
  isActive,
  readings,
  onToggle,
  onEdit,
  onDelete,
  onDeleteReading,
  onEditReading,
}: MeterCardProps) => {
  const totalConsumption = readings.reduce((acc, curr, idx) => {
    if (idx === 0) return 0;
    return acc + (curr.value - readings[idx - 1].value);
  }, 0);

  return (
    <Card className="meter-card overflow-hidden">
      <MeterHeader
        id={id}
        name={name}
        unit={unit}
        isActive={isActive}
        onToggle={onToggle}
        onEdit={onEdit}
        onDelete={onDelete}
      />
      <CardContent>
        <div className="mt-2 space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Status</span>
            <span className={`text-sm font-medium ${isActive ? 'text-green-500' : 'text-red-500'}`}>
              {isActive ? 'Aktiv' : 'Inaktiv'}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Gesamtverbrauch</span>
            <span className="text-sm font-medium">{totalConsumption.toFixed(2)} {unit}</span>
          </div>
          
          <ConsumptionChart readings={readings} />
          
          <ReadingsList
            readings={readings}
            unit={unit}
            onEditReading={(date, value) => onEditReading(id, date, value)}
            onDeleteReading={(date) => onDeleteReading(id, date)}
          />
          
          <AddReadingDialog meterId={id} onAddReading={(meterId, value, date) => onEditReading(meterId, date, value)} />
        </div>
      </CardContent>
    </Card>
  );
};