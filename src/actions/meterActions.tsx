
import { Meter } from "@/services/types";
import { saveStoragePreference } from "./localStorageActions";
import { addMeter, editMeter, toggleMeter, deleteMeter, updateMeterNotes } from "./meterCrudActions";
import { editReading, deleteReading, updateReadingNotes } from "./readingActions";
import { MeterActions, ToastFunction } from "./meterTypes";

/**
 * Factory-Funktion zur Erstellung aller Meter-Aktionen
 * 
 * @param meters Aktuelles Array von Zählern
 * @param setMeters State-Setter für die Zähler
 * @param useDatabase Flag, ob die Datenbank verwendet werden soll
 * @param toast Toast-Funktion für Benachrichtigungen
 * @returns Objekt mit allen Aktionen für die Zählerverwaltung
 */
export function createMeterActions(
  meters: Meter[],
  setMeters: React.Dispatch<React.SetStateAction<Meter[]>>,
  useDatabase: boolean,
  toast: ToastFunction
): MeterActions {
  
  /**
   * Speichert die Speicherpräferenz und gibt sie zurück
   * @param useDb Flag, ob die Datenbank verwendet werden soll
   * @returns Der übergebene Wert
   */
  const handleStorageChange = (useDb: boolean) => {
    return saveStoragePreference(useDb);
  };

  /**
   * Fügt einen neuen Zähler hinzu
   * @param name Name des Zählers
   * @param unit Einheit des Zählers
   */
  const handleAddMeter = async (name: string, unit: string) => {
    await addMeter(name, unit, meters, setMeters, useDatabase, toast);
  };

  /**
   * Bearbeitet einen vorhandenen Zähler
   * @param id ID des zu bearbeitenden Zählers
   * @param name Neuer Name des Zählers
   * @param unit Neue Einheit des Zählers
   */
  const handleEditMeter = async (id: string, name: string, unit: string) => {
    await editMeter(id, name, unit, meters, setMeters, useDatabase, toast);
  };

  /**
   * Ändert den Status eines Zählers (aktiv/inaktiv)
   * @param id ID des Zählers
   * @param isActive Neuer Status des Zählers
   */
  const handleToggleMeter = async (id: string, isActive: boolean) => {
    await toggleMeter(id, isActive, meters, setMeters, useDatabase, toast);
  };

  /**
   * Löscht einen Zähler
   * @param id ID des zu löschenden Zählers
   */
  const handleDeleteMeter = async (id: string) => {
    await deleteMeter(id, meters, setMeters, useDatabase, toast);
  };

  /**
   * Bearbeitet einen Zählerstand oder fügt einen neuen hinzu
   * @param meterId ID des Zählers
   * @param date Datum des Zählerstands
   * @param value Wert des Zählerstands
   */
  const handleEditReading = async (meterId: string, date: string, value: number) => {
    await editReading(meterId, date, value, meters, setMeters, useDatabase, toast);
  };

  /**
   * Löscht einen Zählerstand
   * @param meterId ID des Zählers
   * @param date Datum des Zählerstands
   */
  const handleDeleteReading = async (meterId: string, date: string) => {
    await deleteReading(meterId, date, meters, setMeters, useDatabase, toast);
  };

  /**
   * Aktualisiert die Notizen eines Zählers
   * @param id ID des Zählers
   * @param notes Neue Notizen
   */
  const handleUpdateMeterNotes = async (id: string, notes: string) => {
    await updateMeterNotes(id, notes, meters, setMeters, useDatabase, toast);
  };

  /**
   * Aktualisiert die Notizen eines Zählerstands
   * @param meterId ID des Zählers
   * @param date Datum des Zählerstands
   * @param notes Neue Notizen
   */
  const handleUpdateReadingNotes = async (meterId: string, date: string, notes: string) => {
    await updateReadingNotes(meterId, date, notes, meters, setMeters, useDatabase, toast);
  };

  return {
    handleStorageChange,
    handleAddMeter,
    handleEditMeter,
    handleToggleMeter,
    handleDeleteMeter,
    handleEditReading,
    handleDeleteReading,
    handleUpdateMeterNotes,
    handleUpdateReadingNotes
  };
}
