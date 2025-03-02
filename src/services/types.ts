
/**
 * Schnittstelle für einen Zählerstand
 * Definiert die Struktur eines Zählerstands mit Datum, Wert und optionalen Notizen
 */
export interface Reading {
  date: string;
  value: number;
  notes?: string;
}

/**
 * Schnittstelle für einen Zähler
 * Definiert die Struktur eines Zählers mit ID, Name, Einheit, Aktivitätsstatus und Zählerständen
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
 * Schnittstelle für Datenbank-Konfiguration
 * Enthält die Einstellungen für die Verbindung zur Datenbank
 */
export interface DbConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
}
