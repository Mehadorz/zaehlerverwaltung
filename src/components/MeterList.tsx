
import { MeterCard } from "@/components/MeterCard";
import { isWithinInterval, parseISO } from "date-fns";
import { Meter, FilterStatus } from "@/hooks/useMeterData";

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
    .filter(meter => {
      switch (filterStatus) {
        case "active":
          return meter.isActive;
        case "inactive":
          return !meter.isActive;
        default:
          return true;
      }
    })
    .map(meter => ({
      ...meter,
      readings: meter.readings.filter(reading => 
        isWithinInterval(parseISO(reading.date), {
          start: dateRange.from,
          end: dateRange.to
        })
      )
    }));

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
