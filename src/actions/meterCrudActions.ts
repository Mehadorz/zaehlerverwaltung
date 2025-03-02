
import { Meter } from "@/services/types";
import { databaseService } from "@/services/databaseService";
import { ToastFunction } from "./meterTypes";
import { saveMetersToLocalStorage } from "./localStorageActions";

/**
 * Fügt einen neuen Zähler hinzu
 * @param name Name des Zählers
 * @param unit Einheit des Zählers
 * @param meters Aktuelles Array von Zählern
 * @param setMeters State-Setter für die Zähler
 * @param useDatabase Flag, ob die Datenbank verwendet werden soll
 * @param toast Toast-Funktion für Benachrichtigungen
 */
export const addMeter = async (
  name: string,
  unit: string,
  meters: Meter[],
  setMeters: React.Dispatch<React.SetStateAction<Meter[]>>,
  useDatabase: boolean,
  toast: ToastFunction
): Promise<void> => {
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
    saveMetersToLocalStorage([...meters, meterWithId]);
  }

  toast({
    title: "Zähler hinzugefügt",
    description: `${name} wurde erfolgreich hinzugefügt.`,
    duration: 10000,
  });
};

/**
 * Bearbeitet einen vorhandenen Zähler
 * @param id ID des zu bearbeitenden Zählers
 * @param name Neuer Name des Zählers
 * @param unit Neue Einheit des Zählers
 * @param meters Aktuelles Array von Zählern
 * @param setMeters State-Setter für die Zähler
 * @param useDatabase Flag, ob die Datenbank verwendet werden soll
 * @param toast Toast-Funktion für Benachrichtigungen
 */
export const editMeter = async (
  id: string,
  name: string,
  unit: string,
  meters: Meter[],
  setMeters: React.Dispatch<React.SetStateAction<Meter[]>>,
  useDatabase: boolean,
  toast: ToastFunction
): Promise<void> => {
  if (useDatabase) {
    const meterToUpdate = meters.find(m => m.id === id);
    if (meterToUpdate) {
      const updatedMeter = { ...meterToUpdate, name, unit };
      const success = await databaseService.updateMeter(updatedMeter);
      if (success) {
        setMeters(prev => prev.map(meter => 
          meter.id === id ? { ...meter, name, unit } : meter
        ));
      }
    }
  } else {
    const updatedMeters = meters.map(meter => 
      meter.id === id ? { ...meter, name, unit } : meter
    );
    setMeters(updatedMeters);
    saveMetersToLocalStorage(updatedMeters);
  }
  
  toast({
    title: "Zähler bearbeitet",
    description: `Zähler wurde erfolgreich aktualisiert.`,
    duration: 10000,
  });
};

/**
 * Ändert den Status eines Zählers (aktiv/inaktiv)
 * @param id ID des Zählers
 * @param isActive Neuer Status des Zählers
 * @param meters Aktuelles Array von Zählern
 * @param setMeters State-Setter für die Zähler
 * @param useDatabase Flag, ob die Datenbank verwendet werden soll
 * @param toast Toast-Funktion für Benachrichtigungen
 */
export const toggleMeter = async (
  id: string,
  isActive: boolean,
  meters: Meter[],
  setMeters: React.Dispatch<React.SetStateAction<Meter[]>>,
  useDatabase: boolean,
  toast: ToastFunction
): Promise<void> => {
  if (useDatabase) {
    const meterToUpdate = meters.find(m => m.id === id);
    if (meterToUpdate) {
      const updatedMeter = { ...meterToUpdate, isActive };
      const success = await databaseService.updateMeter(updatedMeter);
      if (success) {
        setMeters(prev => prev.map(meter => 
          meter.id === id ? { ...meter, isActive } : meter
        ));
      }
    }
  } else {
    const updatedMeters = meters.map(meter => 
      meter.id === id ? { ...meter, isActive } : meter
    );
    setMeters(updatedMeters);
    saveMetersToLocalStorage(updatedMeters);
  }
  
  toast({
    title: "Status aktualisiert",
    description: `Zähler wurde ${isActive ? 'aktiviert' : 'deaktiviert'}.`,
    duration: 10000,
  });
};

/**
 * Löscht einen Zähler
 * @param id ID des zu löschenden Zählers
 * @param meters Aktuelles Array von Zählern
 * @param setMeters State-Setter für die Zähler
 * @param useDatabase Flag, ob die Datenbank verwendet werden soll
 * @param toast Toast-Funktion für Benachrichtigungen
 */
export const deleteMeter = async (
  id: string,
  meters: Meter[],
  setMeters: React.Dispatch<React.SetStateAction<Meter[]>>,
  useDatabase: boolean,
  toast: ToastFunction
): Promise<void> => {
  if (useDatabase) {
    const success = await databaseService.deleteMeter(id);
    if (success) {
      setMeters(prev => prev.filter(meter => meter.id !== id));
    }
  } else {
    const updatedMeters = meters.filter(meter => meter.id !== id);
    setMeters(updatedMeters);
    saveMetersToLocalStorage(updatedMeters);
  }
  
  toast({
    title: "Zähler gelöscht",
    description: "Der Zähler wurde erfolgreich gelöscht.",
    variant: "destructive",
    duration: 10000,
  });
};

/**
 * Aktualisiert die Notizen eines Zählers
 * @param id ID des Zählers
 * @param notes Neue Notizen
 * @param meters Aktuelles Array von Zählern
 * @param setMeters State-Setter für die Zähler
 * @param useDatabase Flag, ob die Datenbank verwendet werden soll
 * @param toast Toast-Funktion für Benachrichtigungen
 */
export const updateMeterNotes = async (
  id: string,
  notes: string,
  meters: Meter[],
  setMeters: React.Dispatch<React.SetStateAction<Meter[]>>,
  useDatabase: boolean,
  toast: ToastFunction
): Promise<void> => {
  if (useDatabase) {
    const success = await databaseService.updateMeterNotes(id, notes);
    if (success) {
      setMeters(prev => prev.map(meter => 
        meter.id === id ? { ...meter, notes } : meter
      ));
    }
  } else {
    const updatedMeters = meters.map(meter => 
      meter.id === id ? { ...meter, notes } : meter
    );
    setMeters(updatedMeters);
    saveMetersToLocalStorage(updatedMeters);
  }
  
  toast({
    title: "Notizen aktualisiert",
    description: "Die Notizen wurden erfolgreich gespeichert.",
    duration: 10000,
  });
};
