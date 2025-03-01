
import { useState, useEffect } from "react";
import { subYears } from "date-fns";
import { databaseService } from "@/services/databaseService";
import { useToast } from "@/hooks/use-toast";

// Definition der Zählerstand-Schnittstelle
export interface Reading {
  date: string;
  value: number;
  notes?: string;
}

// Definition der Zähler-Schnittstelle
export interface Meter {
  id: string;
  name: string;
  unit: string;
  isActive: boolean;
  notes?: string;
  readings: Reading[];
}

// Definition der möglichen Filterstatus
export type FilterStatus = "all" | "active" | "inactive";

export function useMeterData() {
  // State-Verwaltung
  const [meters, setMeters] = useState<Meter[]>([]);
  const [useDatabase, setUseDatabase] = useState(false);
  const [dateRange, setDateRange] = useState({
    from: subYears(new Date(), 1),
    to: new Date(),
  });
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const { toast } = useToast();

  // Lade die gespeicherte Storage-Präferenz beim Start
  useEffect(() => {
    const savedPreference = localStorage.getItem("storagePreference");
    if (savedPreference) {
      setUseDatabase(JSON.parse(savedPreference));
    }
  }, []);

  // Lade Zähler beim Start und bei Änderung der Speichermethode
  useEffect(() => {
    const loadMeters = async () => {
      try {
        if (useDatabase) {
          const dbMeters = await databaseService.getAllMeters();
          setMeters(dbMeters);
        } else {
          const localMeters = JSON.parse(localStorage.getItem("meters") || "[]");
          setMeters(localMeters);
        }
      } catch (error) {
        console.error('Fehler beim Laden der Zähler:', error);
        toast({
          title: "Fehler beim Laden",
          description: "Die Zähler konnten nicht geladen werden.",
          variant: "destructive",
          duration: 5000,
        });
      }
    };
    loadMeters();
  }, [useDatabase]);

  // Synchronisiere Änderungen mit der ausgewählten Speichermethode
  useEffect(() => {
    if (!useDatabase) {
      localStorage.setItem("meters", JSON.stringify(meters));
    }
  }, [meters, useDatabase]);

  return {
    meters,
    setMeters,
    useDatabase,
    dateRange,
    filterStatus,
    setUseDatabase,
    setDateRange,
    setFilterStatus,
    toast
  };
}
