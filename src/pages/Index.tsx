
import { useState, useEffect } from "react";
import { AddMeterDialog } from "@/components/AddMeterDialog";
import { FilterSection } from "@/components/FilterSection";
import { HeaderSection } from "@/components/HeaderSection";
import { MeterList } from "@/components/MeterList";
import { useToast } from "@/hooks/use-toast";
import { subYears } from "date-fns";
import { databaseService } from "@/services/databaseService";

// Definition der Zählerstand-Schnittstelle
interface Reading {
  date: string;
  value: number;
}

// Definition der Zähler-Schnittstelle
interface Meter {
  id: string;
  name: string;
  unit: string;
  isActive: boolean;
  readings: Reading[];
}

// Definition der möglichen Filterstatus
type FilterStatus = "all" | "active" | "inactive";

// Hauptkomponente für die Zählerverwaltung
const Index = () => {
  // State-Verwaltung
  const [meters, setMeters] = useState<Meter[]>([]);
  const [useDatabase, setUseDatabase] = useState(false);
  const [dateRange, setDateRange] = useState({
    from: subYears(new Date(), 1),
    to: new Date(),
  });
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const { toast } = useToast();

  // Lade Zähler beim Start und bei Änderung der Speichermethode
  useEffect(() => {
    const loadMeters = async () => {
      if (useDatabase) {
        const dbMeters = await databaseService.getAllMeters();
        setMeters(dbMeters);
      } else {
        const localMeters = JSON.parse(localStorage.getItem("meters") || "[]");
        setMeters(localMeters);
      }
    };
    loadMeters();
  }, [useDatabase]);

  // Event Handler
  const handleStorageChange = (useDb: boolean) => {
    setUseDatabase(useDb);
  };

  const handleAddMeter = async (name: string, unit: string) => {
    const newMeter: Omit<Meter, 'id'> = {
      name,
      unit,
      isActive: true,
      readings: [],
    };

    if (useDatabase) {
      const addedMeter = await databaseService.addMeter(newMeter);
      if (addedMeter) {
        setMeters(prev => [...prev, addedMeter]);
      }
    } else {
      const meterWithId: Meter = {
        ...newMeter,
        id: crypto.randomUUID(),
      };
      setMeters(prev => [...prev, meterWithId]);
      localStorage.setItem("meters", JSON.stringify([...meters, meterWithId]));
    }

    toast({
      title: "Zähler hinzugefügt",
      description: `${name} wurde erfolgreich hinzugefügt.`,
      duration: 10000,
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
      duration: 10000,
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
      duration: 10000,
    });
  };

  const handleDeleteMeter = (id: string) => {
    setMeters((prev) => prev.filter((meter) => meter.id !== id));
    toast({
      title: "Zähler gelöscht",
      description: "Der Zähler wurde erfolgreich gelöscht.",
      variant: "destructive",
      duration: 10000,
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
      duration: 10000,
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
      duration: 10000,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <HeaderSection onStorageChange={handleStorageChange} />
        
        <FilterSection
          dateRange={dateRange}
          filterStatus={filterStatus}
          onDateRangeChange={setDateRange}
          onFilterStatusChange={setFilterStatus}
        />
        
        <MeterList
          meters={meters}
          dateRange={dateRange}
          filterStatus={filterStatus}
          onToggleMeter={handleToggleMeter}
          onEditMeter={handleEditMeter}
          onDeleteMeter={handleDeleteMeter}
          onDeleteReading={handleDeleteReading}
          onEditReading={handleEditReading}
        />

        <AddMeterDialog onAddMeter={handleAddMeter} />
      </div>
    </div>
  );
};

export default Index;

