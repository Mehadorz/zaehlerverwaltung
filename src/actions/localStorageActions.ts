
import { Meter } from "@/services/types";

/**
 * Speichert die Speicherpräferenz im localStorage
 * @param useDb Gibt an, ob die Datenbank verwendet werden soll
 * @returns Der übergebene Wert wird zurückgegeben
 */
export const saveStoragePreference = (useDb: boolean): boolean => {
  localStorage.setItem("storagePreference", JSON.stringify(useDb));
  return useDb;
};

/**
 * Speichert die Meter im localStorage
 * @param meters Array der zu speichernden Meter
 */
export const saveMetersToLocalStorage = (meters: Meter[]): void => {
  localStorage.setItem("meters", JSON.stringify(meters));
};
