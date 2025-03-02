
import { MeterCard } from "@/components/MeterCard";
import { isWithinInterval, parseISO } from "date-fns";
import { Meter, FilterStatus } from "@/hooks/useMeterData";

/**
 * @interface MeterListProps - Props für die MeterList Komponente
 * @property {Meter[]} meters - Array aller verfügbaren Zähler
 * @property {Object} dateRange - Ausgewählter Datumsbereich für die Filterung
 * @property {FilterStatus} filterStatus - Aktueller Filterstatus (all/active/inactive)
 * @property {Function} onToggleMeter - Callback für Statusänderungen eines Zählers
 * @property {Function} onEditMeter - Callback für Bearbeitungen eines Zählers
 * @property {Function} onDeleteMeter - Callback für das Löschen eines Zählers
 * @property {Function} onDeleteReading - Callback für das Löschen eines Zählerstands
 * @property {Function} onEditReading - Callback für das Bearbeiten eines Zählerstands
 * @property {Function} onUpdateMeterNotes - Callback für das Aktualisieren der Zählernotizen
 * @property {Function} onUpdateReadingNotes - Callback für das Aktualisieren der Zählerstandnotizen
 */
interface MeterListProps {
  meters: Meter[];
  dateRange: {
    from: Date;
    to: Date;
  };
  filterStatus: FilterStatus;
  onToggleMeter: (id: string, isActive: boolean) => void;
  onEditMeter: (id: string, name: string, unit: string) => void;
  onDeleteMeter: (id: string) => void;
  onDeleteReading: (meterId: string, date: string) => void;
  onEditReading: (meterId: string, date: string, value: number) => void;
  onUpdateMeterNotes: (id: string, notes: string) => void;
  onUpdateReadingNotes: (meterId: string, date: string, notes: string) => void;
}

/**
 * MeterList Komponente
 * 
 * Zeigt eine gefilterte Liste aller Zähler an und leitet Benutzeraktionen an die übergeordnete Komponente weiter.
 * Implementiert Filterlogik für:
 * - Status-Filter (aktiv/inaktiv/alle)
 * - Datumsbereich-Filter für Zählerstände
 */
export const MeterList = ({
  meters,
  dateRange,
  filterStatus,
  onToggleMeter,
  onEditMeter,
  onDeleteMeter,
  onDeleteReading,
  onEditReading,
  onUpdateMeterNotes,
  onUpdateReadingNotes,
}: MeterListProps) => {
  // Filtere die Zähler basierend auf Status und Datumsbereich
  const filteredMeters = meters
    // 1. Filtere basierend auf dem ausgewählten Status
    .filter(meter => {
      switch (filterStatus) {
        case "active":
          return meter.isActive;
        case "inactive":
          return !meter.isActive;
        default: // "all"
          return true;
      }
    })
    // 2. Filtere die Zählerstände nach dem ausgewählten Datumsbereich
    .map(meter => ({
      ...meter,
      readings: meter.readings.filter(reading => 
        isWithinInterval(parseISO(reading.date), {
          start: dateRange.from,
          end: dateRange.to
        })
      )
    }));

  // Rendere die gefilterte Zählerliste in einem responsiven Grid-Layout
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredMeters.map((meter) => (
        <div key={meter.id} className="slide-in">
          <MeterCard
            {...meter}
            onToggle={onToggleMeter}
            onEdit={onEditMeter}
            onDelete={onDeleteMeter}
            onDeleteReading={onDeleteReading}
            onEditReading={onEditReading}
            onUpdateMeterNotes={onUpdateMeterNotes}
            onUpdateReadingNotes={onUpdateReadingNotes}
          />
        </div>
      ))}
    </div>
  );
};
