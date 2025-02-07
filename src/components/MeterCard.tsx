
// Import der UI-Komponenten für das Layout
import { Card, CardContent } from "@/components/ui/card";
// Import der Dialog-Komponenten für das Hinzufügen und Bearbeiten von Zählerständen
import { AddReadingDialog } from "./AddReadingDialog";
import { MeterHeader } from "./MeterHeader";
// Import der Komponenten für die Darstellung der Verbrauchsdaten
import { ConsumptionChart } from "./ConsumptionChart";
import { ReadingsList } from "./ReadingsList";

// Definition der Schnittstelle für einen Zählerstand
interface Reading {
  date: string;
  value: number;
}

// Definition der Props für die MeterCard
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

// MeterCard Komponente: Zeigt alle Informationen und Aktionen für einen Zähler an
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
  // Berechnet den Gesamtverbrauch aus allen Zählerständen
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
