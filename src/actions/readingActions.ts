
import { Meter } from "@/services/types";
import { databaseService } from "@/services/databaseService";
import { ToastFunction } from "./meterTypes";
import { saveMetersToLocalStorage } from "./localStorageActions";

/**
 * Bearbeitet einen Zählerstand oder fügt einen neuen hinzu
 * @param meterId ID des Zählers
 * @param date Datum des Zählerstands
 * @param value Wert des Zählerstands
 * @param meters Aktuelles Array von Zählern
 * @param setMeters State-Setter für die Zähler
 * @param useDatabase Flag, ob die Datenbank verwendet werden soll
 * @param toast Toast-Funktion für Benachrichtigungen
 */
export const editReading = async (
  meterId: string,
  date: string,
  value: number,
  meters: Meter[],
  setMeters: React.Dispatch<React.SetStateAction<Meter[]>>,
  useDatabase: boolean,
  toast: ToastFunction
): Promise<void> => {
  const updateMetersState = (success: boolean = true) => {
    if (success) {
      setMeters(prev => prev.map(meter => {
        if (meter.id === meterId) {
          const existingReadingIndex = meter.readings.findIndex(r => r.date === date);
          let newReadings;
          
          if (existingReadingIndex >= 0) {
            newReadings = [...meter.readings];
            newReadings[existingReadingIndex] = { 
              date, 
              value,
              notes: meter.readings[existingReadingIndex].notes 
            };
          } else {
            newReadings = [...meter.readings, { date, value }];
          }
          
          newReadings.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
          return { ...meter, readings: newReadings };
        }
        return meter;
      }));
    }
  };

  if (useDatabase) {
    const success = await databaseService.addOrUpdateReading(meterId, date, value);
    updateMetersState(success);
  } else {
    updateMetersState();
    saveMetersToLocalStorage(meters);
  }
  
  toast({
    title: "Zählerstand aktualisiert",
    description: "Der Zählerstand wurde erfolgreich aktualisiert.",
    duration: 10000,
  });
};

/**
 * Löscht einen Zählerstand
 * @param meterId ID des Zählers
 * @param date Datum des Zählerstands
 * @param meters Aktuelles Array von Zählern
 * @param setMeters State-Setter für die Zähler
 * @param useDatabase Flag, ob die Datenbank verwendet werden soll
 * @param toast Toast-Funktion für Benachrichtigungen
 */
export const deleteReading = async (
  meterId: string,
  date: string,
  meters: Meter[],
  setMeters: React.Dispatch<React.SetStateAction<Meter[]>>,
  useDatabase: boolean,
  toast: ToastFunction
): Promise<void> => {
  if (useDatabase) {
    const success = await databaseService.deleteReading(meterId, date);
    if (success) {
      setMeters(prev => prev.map(meter => {
        if (meter.id === meterId) {
          return {
            ...meter,
            readings: meter.readings.filter(r => r.date !== date),
          };
        }
        return meter;
      }));
    }
  } else {
    const updatedMeters = meters.map(meter => {
      if (meter.id === meterId) {
        return {
          ...meter,
          readings: meter.readings.filter(r => r.date !== date),
        };
      }
      return meter;
    });
    setMeters(updatedMeters);
    saveMetersToLocalStorage(updatedMeters);
  }
  
  toast({
    title: "Zählerstand gelöscht",
    description: "Der Zählerstand wurde erfolgreich gelöscht.",
    variant: "destructive",
    duration: 10000,
  });
};

/**
 * Aktualisiert die Notizen eines Zählerstands
 * @param meterId ID des Zählers
 * @param date Datum des Zählerstands
 * @param notes Neue Notizen
 * @param meters Aktuelles Array von Zählern
 * @param setMeters State-Setter für die Zähler
 * @param useDatabase Flag, ob die Datenbank verwendet werden soll
 * @param toast Toast-Funktion für Benachrichtigungen
 */
export const updateReadingNotes = async (
  meterId: string,
  date: string,
  notes: string,
  meters: Meter[],
  setMeters: React.Dispatch<React.SetStateAction<Meter[]>>,
  useDatabase: boolean,
  toast: ToastFunction
): Promise<void> => {
  if (useDatabase) {
    const success = await databaseService.updateReadingNotes(meterId, date, notes);
    if (success) {
      setMeters(prev => prev.map(meter => {
        if (meter.id === meterId) {
          return {
            ...meter,
            readings: meter.readings.map(reading =>
              reading.date === date ? { ...reading, notes } : reading
            )
          };
        }
        return meter;
      }));
    }
  } else {
    const updatedMeters = meters.map(meter => {
      if (meter.id === meterId) {
        return {
          ...meter,
          readings: meter.readings.map(reading =>
            reading.date === date ? { ...reading, notes } : reading
          )
        };
      }
      return meter;
    });
    setMeters(updatedMeters);
    saveMetersToLocalStorage(updatedMeters);
  }
  
  toast({
    title: "Notizen aktualisiert",
    description: "Die Notizen wurden erfolgreich gespeichert.",
    duration: 10000,
  });
};
