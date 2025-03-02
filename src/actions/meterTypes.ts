
import { Meter, Reading } from "@/services/types";

/**
 * Typdefinition für die Toast-Funktion
 * Wird verwendet, um Benachrichtigungen an den Benutzer anzuzeigen
 */
export interface ToastFunction {
  (props: {
    title: string;
    description: string;
    duration?: number;
    variant?: "default" | "destructive";
  }): void;
}

/**
 * Schnittstelle für die Meter-Aktionen
 * Definiert alle verfügbaren Aktionen für die Zählerverwaltung
 */
export interface MeterActions {
  handleStorageChange: (useDb: boolean) => boolean;
  handleAddMeter: (name: string, unit: string) => Promise<void>;
  handleEditMeter: (id: string, name: string, unit: string) => Promise<void>;
  handleToggleMeter: (id: string, isActive: boolean) => Promise<void>;
  handleDeleteMeter: (id: string) => Promise<void>;
  handleEditReading: (meterId: string, date: string, value: number) => Promise<void>;
  handleDeleteReading: (meterId: string, date: string) => Promise<void>;
  handleUpdateMeterNotes: (id: string, notes: string) => Promise<void>;
  handleUpdateReadingNotes: (meterId: string, date: string, notes: string) => Promise<void>;
}
