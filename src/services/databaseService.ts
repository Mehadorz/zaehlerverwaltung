
import { DbConfig, Meter, Reading } from './types';
import { loadLocalMeters, saveLocalMeters, generateMockMeters } from './storageHelpers';

/**
 * Service-Klasse für Datenbankoperationen
 * Stellt Methoden für den Zugriff auf die Datenbank zur Verfügung
 * Verwendet im Browser-Modus localStorage als Ersatz für die Datenbank
 */
class DatabaseService {
  private dbConfig: DbConfig | null = null;
  private lastError: string | null = null;
  private mockDataEnabled = true; // Im Browsermodus aktivieren wir Mock-Daten
  private useLocalStorage = true; // Flag, ob lokaler Speicher verwendet werden soll

  /**
   * Setze Konfiguration für die Datenbankverbindung
   * @param config Datenbank-Konfiguration
   */
  setConfig(config: DbConfig) {
    this.dbConfig = config;
    
    // Speichere Konfiguration im localStorage für die Persistenz
    localStorage.setItem('dbConfig', JSON.stringify(config));

    // Nach dem Setzen der Konfiguration wechseln wir zum Datenbankbetrieb
    this.useLocalStorage = false;
    
    console.log('Datenbank-Konfiguration aktualisiert und Datenbankbetrieb aktiviert:', {
      host: config.host,
      port: config.port,
      database: config.database,
      username: config.username,
      useLocalStorage: this.useLocalStorage
    });
  }

  /**
   * Lade gespeicherte Konfiguration aus dem localStorage
   * @returns Datenbank-Konfiguration oder null, wenn keine vorhanden
   */
  loadConfig(): DbConfig | null {
    const saved = localStorage.getItem('dbConfig');
    if (saved) {
      this.dbConfig = JSON.parse(saved);
      return this.dbConfig;
    }
    return null;
  }

  /**
   * Liefere den letzten Fehler zurück
   * @returns Fehlermeldung oder null, wenn kein Fehler aufgetreten ist
   */
  getLastError(): string | null {
    return this.lastError;
  }

  /**
   * Prüfe die Datenbankverbindung
   * @returns Promise<boolean> - True bei erfolgreicher Verbindung
   */
  async testConnection(): Promise<boolean> {
    try {
      if (!this.dbConfig) {
        this.lastError = "Die Datenbank-Konfiguration wurde nicht gesetzt";
        return false;
      }
      
      console.log('Teste Verbindung zu:', this.dbConfig.host);
      this.lastError = null;
      
      // Verbindungstest erfolgreich, setzen wir useLocalStorage auf false
      this.useLocalStorage = false;
      
      // Im Browser-Kontext simulieren wir eine erfolgreiche Verbindung
      // Simulieren einen Verbindungstest mit einem kurzen Timeout
      await new Promise(resolve => setTimeout(resolve, 500));
      
      console.log('Verbindungstest erfolgreich, Datenbankmodus aktiviert, useLocalStorage:', this.useLocalStorage);
      return true;
    } catch (error) {
      if (error instanceof Error) {
        this.lastError = `Verbindungsfehler: ${error.message}`;
      } else {
        this.lastError = 'Unbekannter Verbindungsfehler zur Datenbank';
      }
      
      // Bei Verbindungsfehler wieder auf lokalen Speicher umschalten
      this.useLocalStorage = true;
      
      console.error('Datenbank-Verbindungsfehler:', this.lastError, 'Verwende lokalen Speicher:', this.useLocalStorage);
      return false;
    }
  }

  /**
   * Hole alle Zähler
   * @returns Promise<Meter[]> - Array aller Zähler
   */
  async getAllMeters(): Promise<Meter[]> {
    try {
      this.lastError = null;
      
      // Prüfen, ob wir lokalen Speicher oder Datenbank verwenden
      if (this.useLocalStorage) {
        console.log('Verwende lokalen Speicher für getAllMeters');
        
        // Hole lokale Daten wenn vorhanden
        const localMeters = loadLocalMeters();
        if (localMeters.length > 0) {
          return localMeters;
        }
        
        // Erstelle Mock-Daten wenn keine lokalen Daten gefunden wurden
        return generateMockMeters();
      } else {
        console.log('Verwende Datenbank für getAllMeters');
        
        // Hier würden wir normalerweise eine echte Datenbankabfrage ausführen
        // Im simulierten Modus verwenden wir den lokalen Speicher
        const localMeters = loadLocalMeters();
        
        // Loggen, dass wir Datenbank simulieren aber lokale Daten zurückgeben
        console.log('Datenbankmodus: Simuliere Datenbankabfrage, gebe aber lokale Daten zurück');
        
        return localMeters.length > 0 ? localMeters : generateMockMeters();
      }
    } catch (error) {
      this.handleError('Fehler beim Laden der Zähler', error);
      return [];
    }
  }

  /**
   * Füge einen neuen Zähler hinzu
   * @param meter Zähler ohne ID
   * @returns Promise<Meter | null> - Neu erstellter Zähler mit ID oder null bei Fehler
   */
  async addMeter(meter: Omit<Meter, 'id'>): Promise<Meter | null> {
    try {
      this.lastError = null;
      const id = crypto.randomUUID();
      
      // Neuer Zähler mit ID
      const newMeter: Meter = {
        id,
        name: meter.name,
        unit: meter.unit,
        isActive: meter.isActive,
        notes: meter.notes,
        readings: []
      };
      
      if (this.useLocalStorage) {
        console.log('Lokaler Speicher: Füge Zähler hinzu:', newMeter);
        
        // Hole vorhandene Zähler
        const localMeters = loadLocalMeters();
        
        // Füge neuen Zähler hinzu und speichere
        localMeters.push(newMeter);
        saveLocalMeters(localMeters);
      } else {
        console.log('Datenbank: Füge Zähler hinzu:', newMeter);
        
        // Simuliere Datenbankoperation
        // In einer echten Anwendung würden wir hier den Zähler in die Datenbank einfügen
        // Im simulierten Modus verwenden wir den lokalen Speicher
        const localMeters = loadLocalMeters();
        localMeters.push(newMeter);
        saveLocalMeters(localMeters);
        console.log('Datenbankmodus: Simuliere Einfügen in DB, speichere aber lokal');
      }
      
      return newMeter;
    } catch (error) {
      this.handleError('Fehler beim Hinzufügen des Zählers', error);
      return null;
    }
  }

  /**
   * Aktualisiere einen Zähler
   * @param meter Zähler mit aktualisierten Daten
   * @returns Promise<boolean> - True bei Erfolg
   */
  async updateMeter(meter: Meter): Promise<boolean> {
    try {
      this.lastError = null;
      
      if (this.useLocalStorage) {
        console.log('Lokaler Speicher: Aktualisiere Zähler:', meter);
      } else {
        console.log('Datenbank: Aktualisiere Zähler:', meter);
      }
      
      // Hole vorhandene Zähler
      const localMeters = loadLocalMeters();
      
      // Finde und aktualisiere den Zähler
      const updatedMeters = localMeters.map(m => 
        m.id === meter.id ? meter : m
      );
      
      // Speichere die aktualisierten Zähler
      saveLocalMeters(updatedMeters);
      
      if (!this.useLocalStorage) {
        console.log('Datenbankmodus: Simuliere Aktualisieren in DB, speichere aber lokal');
      }
      
      return true;
    } catch (error) {
      this.handleError('Fehler beim Aktualisieren des Zählers', error);
      return false;
    }
  }

  /**
   * Lösche einen Zähler
   * @param id ID des zu löschenden Zählers
   * @returns Promise<boolean> - True bei Erfolg
   */
  async deleteMeter(id: string): Promise<boolean> {
    try {
      this.lastError = null;
      
      if (this.useLocalStorage) {
        console.log('Lokaler Speicher: Lösche Zähler:', id);
      } else {
        console.log('Datenbank: Lösche Zähler:', id);
      }
      
      // Hole vorhandene Zähler
      const localMeters = loadLocalMeters();
      
      // Filtere den zu löschenden Zähler
      const filteredMeters = localMeters.filter(m => m.id !== id);
      
      // Speichere die aktualisierten Zähler
      saveLocalMeters(filteredMeters);
      
      if (!this.useLocalStorage) {
        console.log('Datenbankmodus: Simuliere Löschen in DB, speichere aber lokal');
      }
      
      return true;
    } catch (error) {
      this.handleError('Fehler beim Löschen des Zählers', error);
      return false;
    }
  }

  /**
   * Füge eine Notiz zu einem Zähler hinzu
   * @param id ID des Zählers
   * @param notes Notizen
   * @returns Promise<boolean> - True bei Erfolg
   */
  async updateMeterNotes(id: string, notes: string): Promise<boolean> {
    try {
      this.lastError = null;
      
      if (this.useLocalStorage) {
        console.log('Lokaler Speicher: Aktualisiere Zählernotizen:', id, notes);
      } else {
        console.log('Datenbank: Aktualisiere Zählernotizen:', id, notes);
      }
      
      // Hole vorhandene Zähler
      const localMeters = loadLocalMeters();
      
      // Finde und aktualisiere den Zähler
      const updatedMeters = localMeters.map(m => {
        if (m.id === id) {
          return { ...m, notes };
        }
        return m;
      });
      
      // Speichere die aktualisierten Zähler
      saveLocalMeters(updatedMeters);
      
      if (!this.useLocalStorage) {
        console.log('Datenbankmodus: Simuliere Aktualisieren von Notizen in DB, speichere aber lokal');
      }
      
      return true;
    } catch (error) {
      this.handleError('Fehler beim Aktualisieren der Notizen', error);
      return false;
    }
  }

  /**
   * Füge einen Zählerstand hinzu oder aktualisiere ihn
   * @param meterId ID des Zählers
   * @param date Datum des Zählerstands
   * @param value Wert des Zählerstands
   * @returns Promise<boolean> - True bei Erfolg
   */
  async addOrUpdateReading(meterId: string, date: string, value: number): Promise<boolean> {
    try {
      this.lastError = null;
      
      if (this.useLocalStorage) {
        console.log('Lokaler Speicher: Aktualisiere Zählerstand:', meterId, date, value);
      } else {
        console.log('Datenbank: Aktualisiere Zählerstand:', meterId, date, value);
      }
      
      // Hole vorhandene Zähler
      const localMeters = loadLocalMeters();
      
      // Finde den Zähler
      const updatedMeters = localMeters.map(m => {
        if (m.id === meterId) {
          // Prüfe, ob der Zählerstand bereits existiert
          const existingReadingIndex = m.readings.findIndex(r => r.date === date);
          
          if (existingReadingIndex >= 0) {
            // Aktualisiere den vorhandenen Zählerstand
            const updatedReadings = [...m.readings];
            updatedReadings[existingReadingIndex] = {
              ...updatedReadings[existingReadingIndex],
              value
            };
            return { ...m, readings: updatedReadings };
          } else {
            // Füge einen neuen Zählerstand hinzu
            return {
              ...m,
              readings: [...m.readings, { date, value }].sort(
                (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
              )
            };
          }
        }
        return m;
      });
      
      // Speichere die aktualisierten Zähler
      saveLocalMeters(updatedMeters);
      
      if (!this.useLocalStorage) {
        console.log('Datenbankmodus: Simuliere Aktualisieren von Zählerstand in DB, speichere aber lokal');
      }
      
      return true;
    } catch (error) {
      this.handleError('Fehler beim Speichern des Zählerstands', error);
      return false;
    }
  }

  /**
   * Aktualisiere Notizen für einen Zählerstand
   * @param meterId ID des Zählers
   * @param date Datum des Zählerstands
   * @param notes Notizen
   * @returns Promise<boolean> - True bei Erfolg
   */
  async updateReadingNotes(meterId: string, date: string, notes: string): Promise<boolean> {
    try {
      this.lastError = null;
      
      if (this.useLocalStorage) {
        console.log('Lokaler Speicher: Aktualisiere Zählerstandnotizen:', meterId, date, notes);
      } else {
        console.log('Datenbank: Aktualisiere Zählerstandnotizen:', meterId, date, notes);
      }
      
      // Hole vorhandene Zähler
      const localMeters = loadLocalMeters();
      
      // Finde den Zähler und den Zählerstand
      const updatedMeters = localMeters.map(m => {
        if (m.id === meterId) {
          // Aktualisiere die Notizen des Zählerstands
          const updatedReadings = m.readings.map(r => {
            if (r.date === date) {
              return { ...r, notes };
            }
            return r;
          });
          
          return { ...m, readings: updatedReadings };
        }
        return m;
      });
      
      // Speichere die aktualisierten Zähler
      saveLocalMeters(updatedMeters);
      
      if (!this.useLocalStorage) {
        console.log('Datenbankmodus: Simuliere Aktualisieren von Zählerstandnotizen in DB, speichere aber lokal');
      }
      
      return true;
    } catch (error) {
      this.handleError('Fehler beim Aktualisieren der Notizen', error);
      return false;
    }
  }

  /**
   * Lösche einen Zählerstand
   * @param meterId ID des Zählers
   * @param date Datum des Zählerstands
   * @returns Promise<boolean> - True bei Erfolg
   */
  async deleteReading(meterId: string, date: string): Promise<boolean> {
    try {
      this.lastError = null;
      
      if (this.useLocalStorage) {
        console.log('Lokaler Speicher: Lösche Zählerstand:', meterId, date);
      } else {
        console.log('Datenbank: Lösche Zählerstand:', meterId, date);
      }
      
      // Hole vorhandene Zähler
      const localMeters = loadLocalMeters();
      
      // Finde den Zähler und lösche den Zählerstand
      const updatedMeters = localMeters.map(m => {
        if (m.id === meterId) {
          return {
            ...m,
            readings: m.readings.filter(r => r.date !== date)
          };
        }
        return m;
      });
      
      // Speichere die aktualisierten Zähler
      saveLocalMeters(updatedMeters);
      
      if (!this.useLocalStorage) {
        console.log('Datenbankmodus: Simuliere Löschen von Zählerstand in DB, speichere aber lokal');
      }
      
      return true;
    } catch (error) {
      this.handleError('Fehler beim Löschen des Zählerstands', error);
      return false;
    }
  }

  /**
   * Fehlerbehandlung für alle Methoden
   * @param message Fehlermeldung
   * @param error Fehler-Objekt
   */
  private handleError(message: string, error: unknown): void {
    if (error instanceof Error) {
      this.lastError = `${message}: ${error.message}`;
    } else {
      this.lastError = `${message}: Unbekannter Fehler`;
    }
    console.error(message, error);
  }
}

export const databaseService = new DatabaseService();
export type { DbConfig };
