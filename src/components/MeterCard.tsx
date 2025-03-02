
// Import der UI-Komponenten für das Layout
import { Card, CardContent } from "@/components/ui/card";
// Import der Dialog-Komponenten für das Hinzufügen und Bearbeiten von Zählerständen
import { AddReadingDialog } from "./AddReadingDialog";
import { MeterHeader } from "./MeterHeader";
// Import der Komponenten für die Darstellung der Verbrauchsdaten
import { ConsumptionChart } from "./ConsumptionChart";
import { ReadingsList } from "./ReadingsList";
import { Reading } from "@/hooks/useMeterData";

/**
 * @interface MeterCardProps - Props für die MeterCard Komponente
 * @property {string} id - Eindeutige ID des Zählers
 * @property {string} name - Name des Zählers
 * @property {string} unit - Maßeinheit des Zählers
 * @property {string} [notes] - Optionale Notizen zum Zähler
 * @property {boolean} isActive - Status des Zählers (aktiv/inaktiv)
 * @property {Reading[]} readings - Array aller Zählerstände
 * @property {Function} onToggle - Callback für Statusänderungen
 * @property {Function} onEdit - Callback für Bearbeitungen
 * @property {Function} onDelete - Callback für das Löschen
 * @property {Function} onDeleteReading - Callback für das Löschen eines Zählerstands
 * @property {Function} onEditReading - Callback für das Bearbeiten eines Zählerstands
 * @property {Function} onUpdateMeterNotes - Callback für das Aktualisieren der Zählernotizen
 * @property {Function} onUpdateReadingNotes - Callback für das Aktualisieren der Zählerstandnotizen
 */
interface MeterCardProps {
  id: string;
  name: string;
  unit: string;
  notes?: string;
  isActive: boolean;
  readings: Reading[];
  onToggle: (id: string, value: boolean) => void;
  onEdit: (id: string, name: string, unit: string) => void;
  onDelete: (id: string) => void;
  onDeleteReading: (meterId: string, date: string) => void;
  onEditReading: (meterId: string, date: string, newValue: number) => void;
  onUpdateMeterNotes: (id: string, notes: string) => void;
  onUpdateReadingNotes: (meterId: string, date: string, notes: string) => void;
}

/**
 * MeterCard Komponente
 * 
 * Zeigt detaillierte Informationen über einen einzelnen Zähler an, einschließlich:
 * - Kopfzeile mit Name und Aktionen
 * - Status (aktiv/inaktiv)
 * - Gesamtverbrauch
 * - Verbrauchsdiagramm
 * - Liste aller Zählerstände
 * - Button zum Hinzufügen neuer Zählerstände
 */
export const MeterCard = ({
  id,
  name,
  unit,
  notes,
  isActive,
  readings,
  onToggle,
  onEdit,
  onDelete,
  onDeleteReading,
  onEditReading,
  onUpdateMeterNotes,
  onUpdateReadingNotes,
}: MeterCardProps) => {
  // Berechnet den Gesamtverbrauch aus allen Zählerständen
  // Verbrauch = Differenz zwischen aufeinanderfolgenden Zählerständen
  const totalConsumption = readings.reduce((acc, curr, idx) => {
    if (idx === 0) return 0;
    return acc + (curr.value - readings[idx - 1].value);
  }, 0);

  return (
    <Card className="meter-card overflow-hidden">
      {/* Kopfzeile mit Name und Aktionen */}
      <MeterHeader
        id={id}
        name={name}
        unit={unit}
        notes={notes}
        isActive={isActive}
        onToggle={onToggle}
        onEdit={onEdit}
        onDelete={onDelete}
        onUpdateNotes={onUpdateMeterNotes}
      />
      <CardContent>
        <div className="mt-2 space-y-4">
          {/* Statusinformationen */}
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Status</span>
            <span className={`text-sm font-medium ${isActive ? 'text-green-500' : 'text-red-500'}`}>
              {isActive ? 'Aktiv' : 'Inaktiv'}
            </span>
          </div>
          
          {/* Gesamtverbrauch */}
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Gesamtverbrauch</span>
            <span className="text-sm font-medium">{totalConsumption.toFixed(2)} {unit}</span>
          </div>
          
          {/* Verbrauchsdiagramm */}
          <ConsumptionChart readings={readings} />
          
          {/* Liste aller Zählerstände */}
          <ReadingsList
            readings={readings}
            unit={unit}
            onEditReading={(date, value) => onEditReading(id, date, value)}
            onDeleteReading={(date) => onDeleteReading(id, date)}
            onUpdateNotes={(date, notes) => onUpdateReadingNotes(id, date, notes)}
          />
          
          {/* Dialog zum Hinzufügen neuer Zählerstände */}
          <AddReadingDialog meterId={id} onAddReading={(meterId, value, date) => onEditReading(meterId, date, value)} />
        </div>
      </CardContent>
    </Card>
  );
};
