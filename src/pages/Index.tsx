import { useState, useEffect } from "react";
import { MeterCard } from "@/components/MeterCard";
import { AddMeterDialog } from "@/components/AddMeterDialog";
import { StorageToggle } from "@/components/StorageToggle";
import { useToast } from "@/hooks/use-toast";
import { subYears, isWithinInterval, parseISO } from "date-fns";
import { FilterSection } from "@/components/FilterSection";
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

  // Speichere Änderungen
  const saveMeters = async (newMeters: Meter[]) => {
    if (useDatabase) {
      // Datenbankaktualisierung erfolgt über individuelle Service-Aufrufe
    } else {
      localStorage.setItem("meters", JSON.stringify(newMeters));
    }
    setMeters(newMeters);
  };

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

  // Methode zum Bearbeiten eines existierenden Zählers
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

  // Methode zum Aktivieren/Deaktivieren eines Zählers
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

  // Methode zum Löschen eines Zählers
  const handleDeleteMeter = (id: string) => {
    setMeters((prev) => prev.filter((meter) => meter.id !== id));
    toast({
      title: "Zähler gelöscht",
      description: "Der Zähler wurde erfolgreich gelöscht.",
      variant: "destructive",
      duration: 10000,
    });
  };

  // Methode zum Bearbeiten eines Zählerstands
  const handleEditReading = (meterId: string, date: string, value: number) => {
    setMeters((prev) =>
      prev.map((meter) => {
        if (meter.id === meterId) {
          const existingReadingIndex = meter.readings.findIndex(r => r.date === date);
          let newReadings;
          
          // Prüft ob bereits ein Zählerstand für dieses Datum existiert
          if (existingReadingIndex >= 0) {
            newReadings = [...meter.readings];
            newReadings[existingReadingIndex] = { date, value };
          } else {
            newReadings = [...meter.readings, { date, value }];
          }
          
          // Sortiere die Zählerstände nach Datum
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

  // Methode zum Löschen eines Zählerstands
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Zählermanagement</h1>
          <StorageToggle onStorageChange={handleStorageChange} />
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
