
import { useState, useEffect } from "react";
import { subYears } from "date-fns";
import { databaseService } from "@/services/databaseService";
import { useToast } from "@/hooks/use-toast";

/**
 * @interface Reading - Repräsentiert einen einzelnen Zählerstand
 * @property {string} date - Das Datum des Zählerstands im Format YYYY-MM-DD
 * @property {number} value - Der Wert des Zählerstands
 * @property {string} [notes] - Optionale Notizen zum Zählerstand
 */
export interface Reading {
  date: string;
  value: number;
  notes?: string;
}

/**
 * @interface Meter - Repräsentiert einen Zähler mit seinen Eigenschaften und Messwerten
 * @property {string} id - Eindeutige ID des Zählers
 * @property {string} name - Name des Zählers (z.B. "Strom", "Wasser")
 * @property {string} unit - Maßeinheit des Zählers (z.B. "kWh", "m³")
 * @property {boolean} isActive - Status des Zählers (aktiv/inaktiv)
 * @property {string} [notes] - Optionale Notizen zum Zähler
 * @property {Reading[]} readings - Array aller Zählerstände für diesen Zähler
 */
export interface Meter {
  id: string;
  name: string;
  unit: string;
  isActive: boolean;
  notes?: string;
  readings: Reading[];
}

/**
 * @type FilterStatus - Definiert die möglichen Filteroptionen für die Zähleranzeige
 * - 'all': Alle Zähler anzeigen
 * - 'active': Nur aktive Zähler anzeigen
 * - 'inactive': Nur inaktive Zähler anzeigen
 */
export type FilterStatus = "all" | "active" | "inactive";

/**
 * Custom Hook zur Verwaltung aller Zählerdaten und Filteroptionen
 * 
 * Dieser Hook handhabt:
 * - Das Laden der Zähler aus dem lokalen Speicher oder der Datenbank
 * - Die Verwaltung des ausgewählten Datumsbereichs
 * - Die Verwaltung des Filterstatus (alle/aktiv/inaktiv)
 * - Die Speicherpräferenz (lokaler Speicher vs. Datenbank)
 * 
 * @returns Ein Objekt mit allen notwendigen Zustandsvariablen und Settern
 */
export function useMeterData() {
  // State für die Zählerdaten
  const [meters, setMeters] = useState<Meter[]>([]);
  
  // State für die Speichermethode (lokal vs. Datenbank)
  const [useDatabase, setUseDatabase] = useState(false);
  
  // State für den ausgewählten Datumsbereich (standardmäßig das letzte Jahr)
  const [dateRange, setDateRange] = useState({
    from: subYears(new Date(), 1),
    to: new Date(),
  });
  
  // State für den Filterstatus
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  
  // Toast-Hook für Benachrichtigungen
  const { toast } = useToast();

  // Effekt zum Laden der gespeicherten Speicherpräferenz beim Start
  useEffect(() => {
    const savedPreference = localStorage.getItem("storagePreference");
    if (savedPreference) {
      setUseDatabase(JSON.parse(savedPreference));
    }
  }, []);

  // Effekt zum Laden der Zähler beim Start oder bei Änderung der Speichermethode
  useEffect(() => {
    /**
     * Lädt die Zähler aus der ausgewählten Speicherquelle
     * Bei Fehlern wird eine Toast-Benachrichtigung angezeigt
     */
    const loadMeters = async () => {
      try {
        if (useDatabase) {
          // Zähler aus der Datenbank laden
          const dbMeters = await databaseService.getAllMeters();
          setMeters(dbMeters);
        } else {
          // Zähler aus dem lokalen Speicher laden
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
  }, [useDatabase, toast]);

  // Effekt zum Speichern von Änderungen im lokalen Speicher
  useEffect(() => {
    // Nur speichern, wenn lokaler Speicher verwendet wird
    if (!useDatabase) {
      localStorage.setItem("meters", JSON.stringify(meters));
    }
  }, [meters, useDatabase]);

  // Rückgabe aller Zustandsvariablen und Setter
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
