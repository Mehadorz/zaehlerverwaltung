
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
  
  // State für den Ladezustand
  const [isLoading, setIsLoading] = useState(true);
  
  // Toast-Hook für Benachrichtigungen
  const { toast } = useToast();

  // Effekt zum Laden der gespeicherten Speicherpräferenz beim Start
  useEffect(() => {
    const init = async () => {
      // Load saved storage preference
      const savedPreference = localStorage.getItem("storagePreference");
      if (savedPreference) {
        const shouldUseDatabase = JSON.parse(savedPreference);
        setUseDatabase(shouldUseDatabase);
        
        // Load saved DB configuration if database is selected
        if (shouldUseDatabase) {
          const config = databaseService.loadConfig();
          if (config) {
            databaseService.setConfig(config);
            console.log("Gespeicherte Datenbankkonfiguration geladen");
            
            // Test connection to ensure it's working
            const connected = await databaseService.testConnection();
            if (!connected) {
              console.warn("Gespeicherte Datenbankkonfiguration konnte nicht verbunden werden");
              
              // Fallback to local storage if connection fails
              setUseDatabase(false);
              localStorage.setItem("storagePreference", "false");
              
              toast({
                title: "Datenbankverbindung fehlgeschlagen",
                description: "Es wird auf lokale Speicherung zurückgegriffen.",
                variant: "destructive",
                duration: 5000,
              });
            }
          }
        }
      }
      
      // Now load meters
      loadMeters();
    };
    
    init();
  }, []);

  // Effekt zum Laden der Zähler beim Start oder bei Änderung der Speichermethode
  useEffect(() => {
    loadMeters();
  }, [useDatabase]);

  /**
   * Lädt die Zähler aus der ausgewählten Speicherquelle
   * Bei Fehlern wird eine Toast-Benachrichtigung angezeigt
   */
  const loadMeters = async () => {
    setIsLoading(true);
    try {
      console.log(`Lade Zähler, verwende ${useDatabase ? 'Datenbank' : 'lokale Speicherung'}...`);
      
      if (useDatabase) {
        try {
          // Ensure database connection is active
          if (!databaseService.isDbConnected()) {
            const connected = await databaseService.testConnection();
            if (!connected) {
              throw new Error("Datenbankverbindung konnte nicht hergestellt werden");
            }
          }
          
          // Zähler aus der Datenbank laden
          const dbMeters = await databaseService.getAllMeters();
          console.log('Aus Datenbank geladene Zähler:', dbMeters);
          setMeters(dbMeters);
        } catch (error) {
          console.error('Fehler beim Laden der Zähler aus Datenbank:', error);
          
          // Fallback to local storage on database errors
          const localMeters = JSON.parse(localStorage.getItem("meters") || "[]");
          setMeters(localMeters);
          
          // Switch storage mode to local
          setUseDatabase(false);
          localStorage.setItem("storagePreference", "false");
          
          toast({
            title: "Datenbankfehler",
            description: "Fehler beim Zugriff auf die Datenbank. Verwende lokale Speicherung.",
            variant: "destructive",
            duration: 5000,
          });
        }
      } else {
        // Zähler aus dem lokalen Speicher laden
        const localMeters = JSON.parse(localStorage.getItem("meters") || "[]");
        console.log('Aus lokalem Speicher geladene Zähler:', localMeters);
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
      
      // Ensure we have some data to display
      setMeters([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Effekt zum Speichern von Änderungen im lokalen Speicher
  useEffect(() => {
    // Nur speichern, wenn lokaler Speicher verwendet wird und nicht im Ladezustand
    if (!useDatabase && !isLoading && meters.length > 0) {
      console.log('Speichere Zähler im lokalen Speicher:', meters);
      localStorage.setItem("meters", JSON.stringify(meters));
    }
  }, [meters, useDatabase, isLoading]);

  // Rückgabe aller Zustandsvariablen und Setter
  return {
    meters,
    setMeters,
    useDatabase,
    dateRange,
    filterStatus,
    isLoading,
    setUseDatabase,
    setDateRange,
    setFilterStatus,
    toast,
    loadMeters // Export loadMeters to allow manual refresh
  };
}
