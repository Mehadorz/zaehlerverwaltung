import { useState } from "react";
import { MeterCard } from "@/components/MeterCard";
import { AddMeterDialog } from "@/components/AddMeterDialog";
import { useToast } from "@/hooks/use-toast";
import { subYears, isWithinInterval, parseISO } from "date-fns";
import { FilterSection } from "@/components/FilterSection";

interface Reading {
  date: string;
  value: number;
}

interface Meter {
  id: string;
  name: string;
  unit: string;
  isActive: boolean;
  readings: Reading[];
}

type FilterStatus = "all" | "active" | "inactive";

const Index = () => {
  const [meters, setMeters] = useState<Meter[]>([]);
  const [dateRange, setDateRange] = useState({
    from: subYears(new Date(), 1),
    to: new Date(),
  });
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const { toast } = useToast();

  const handleAddMeter = (name: string, unit: string) => {
    const newMeter: Meter = {
      id: crypto.randomUUID(),
      name,
      unit,
      isActive: true,
      readings: [],
    };
    setMeters((prev) => [...prev, newMeter]);
    toast({
      title: "Zähler hinzugefügt",
      description: `${name} wurde erfolgreich hinzugefügt.`,
    });
  };

  const handleEditMeter = (id: string, name: string, unit: string) => {
    setMeters((prev) =>
      prev.map((meter) =>
        meter.id === id ? { ...meter, name, unit } : meter
      )
    );
    toast({
      title: "Zähler bearbeitet",
      description: `Zähler wurde erfolgreich aktualisiert.`,
    });
  };

  const handleToggleMeter = (id: string, isActive: boolean) => {
    setMeters((prev) =>
      prev.map((meter) =>
        meter.id === id ? { ...meter, isActive } : meter
      )
    );
    toast({
      title: "Status aktualisiert",
      description: `Zähler wurde ${isActive ? 'aktiviert' : 'deaktiviert'}.`,
    });
  };

  const handleDeleteMeter = (id: string) => {
    setMeters((prev) => prev.filter((meter) => meter.id !== id));
    toast({
      title: "Zähler gelöscht",
      description: "Der Zähler wurde erfolgreich gelöscht.",
      variant: "destructive",
    });
  };

  const handleEditReading = (meterId: string, date: string, value: number) => {
    setMeters((prev) =>
      prev.map((meter) => {
        if (meter.id === meterId) {
          const existingReadingIndex = meter.readings.findIndex(r => r.date === date);
          let newReadings;
          
          if (existingReadingIndex >= 0) {
            newReadings = [...meter.readings];
            newReadings[existingReadingIndex] = { date, value };
          } else {
            newReadings = [...meter.readings, { date, value }];
          }
          
          newReadings.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
          return { ...meter, readings: newReadings };
        }
        return meter;
      })
    );
    toast({
      title: "Zählerstand aktualisiert",
      description: "Der Zählerstand wurde erfolgreich aktualisiert.",
    });
  };

  const handleDeleteReading = (meterId: string, date: string) => {
    setMeters((prev) =>
      prev.map((meter) => {
        if (meter.id === meterId) {
          return {
            ...meter,
            readings: meter.readings.filter((r) => r.date !== date),
          };
        }
        return meter;
      })
    );
    toast({
      title: "Zählerstand gelöscht",
      description: "Der Zählerstand wurde erfolgreich gelöscht.",
      variant: "destructive",
    });
  };

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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Zählermanagement</h1>
        </div>

        <FilterSection
          dateRange={dateRange}
          filterStatus={filterStatus}
          onDateRangeChange={setDateRange}
          onFilterStatusChange={setFilterStatus}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMeters.map((meter) => (
            <div key={meter.id} className="slide-in">
              <MeterCard
                {...meter}
                onToggle={handleToggleMeter}
                onEdit={handleEditMeter}
                onDelete={handleDeleteMeter}
                onDeleteReading={handleDeleteReading}
                onEditReading={handleEditReading}
              />
            </div>
          ))}
        </div>

        <AddMeterDialog onAddMeter={handleAddMeter} />
      </div>
    </div>
  );
};

export default Index;
