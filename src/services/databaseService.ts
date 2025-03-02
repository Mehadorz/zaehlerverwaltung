
import axios from 'axios';

// Schnittstelle für einen Zählerstand
interface Reading {
  date: string;
  value: number;
  notes?: string;
}

// Schnittstelle für einen Zähler
interface Meter {
  id: string;
  name: string;
  unit: string;
  isActive: boolean;
  notes?: string;
  readings: Reading[];
}

// Schnittstelle für Datenbank-Konfiguration
export interface DbConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
}

// Service-Klasse für Datenbankoperationen
class DatabaseService {
  private dbConfig: DbConfig | null = null;
  private lastError: string | null = null;
  private mockDataEnabled = true; // Im Browsermodus aktivieren wir Mock-Daten

  // Setze Konfiguration für die Datenbankverbindung
  setConfig(config: DbConfig) {
    this.dbConfig = config;
    
    // Speichere Konfiguration im localStorage für die Persistenz
    localStorage.setItem('dbConfig', JSON.stringify(config));
    
    console.log('Datenbank-Konfiguration aktualisiert:', {
      host: config.host,
      port: config.port,
      database: config.database,
      username: config.username
    });
  }

  // Lade gespeicherte Konfiguration aus dem localStorage
  loadConfig(): DbConfig | null {
    const saved = localStorage.getItem('dbConfig');
    if (saved) {
      this.dbConfig = JSON.parse(saved);
      return this.dbConfig;
    }
    return null;
  }

  // Liefere den letzten Fehler zurück
  getLastError(): string | null {
    return this.lastError;
  }

  // Prüfe die Datenbankverbindung (simuliert im Browser)
  async testConnection(): Promise<boolean> {
    try {
      if (!this.dbConfig) {
        this.lastError = "Die Datenbank-Konfiguration wurde nicht gesetzt";
        return false;
      }
      
      console.log('Teste Verbindung zu:', this.dbConfig.host);
      this.lastError = null;
      
      // Im Browser-Kontext simulieren wir eine erfolgreiche Verbindung
      // In einer echten Anwendung würde hier ein API-Endpunkt aufgerufen werden
      
      // Wir simulieren hier einen Verbindungstest mit einem kurzen Timeout
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Erfolgreiche Verbindung simulieren
      console.log('Verbindungstest erfolgreich (simuliert)');
      return true;
    } catch (error) {
      if (error instanceof Error) {
        this.lastError = `Verbindungsfehler: ${error.message}`;
      } else {
        this.lastError = 'Unbekannter Verbindungsfehler zur Datenbank';
      }
      
      console.error('Datenbank-Verbindungsfehler:', this.lastError);
      return false;
    }
  }

  // Hole alle Zähler (simuliert im Browser)
  async getAllMeters(): Promise<Meter[]> {
    try {
      this.lastError = null;
      
      // Im Browser-Modus simulieren wir die Datenbankabfrage mit Mock-Daten
      if (this.mockDataEnabled) {
        console.log('Verwende simulierte Daten für getAllMeters');
        
        // Hole lokale Daten wenn vorhanden
        const localMeters = localStorage.getItem('meters');
        if (localMeters) {
          return JSON.parse(localMeters);
        }
        
        // Erstelle Mock-Daten wenn keine lokalen Daten gefunden wurden
        const mockMeters: Meter[] = [
          {
            id: crypto.randomUUID(),
            name: 'Strom',
            unit: 'kWh',
            isActive: true,
            readings: [
              { date: '2024-01-01', value: 1000 },
              { date: '2024-02-01', value: 1150 },
              { date: '2024-03-01', value: 1300 }
            ]
          },
          {
            id: crypto.randomUUID(),
            name: 'Wasser',
            unit: 'm³',
            isActive: true,
            readings: [
              { date: '2024-01-01', value: 120 },
              { date: '2024-02-01', value: 135 },
              { date: '2024-03-01', value: 150 }
            ]
          }
        ];
        
        // Speichere Mock-Daten für spätere Verwendung
        localStorage.setItem('meters', JSON.stringify(mockMeters));
        return mockMeters;
      }
      
      // In einer echten Anwendung würde hier eine API-Anfrage erfolgen
      // return await axios.get('/api/meters').then(res => res.data);
      
      return [];
    } catch (error) {
      this.handleError('Fehler beim Laden der Zähler', error);
      return [];
    }
  }

  // Füge einen neuen Zähler hinzu
  async addMeter(meter: Omit<Meter, 'id'>): Promise<Meter | null> {
    try {
      this.lastError = null;
      
      // Im Browser-Modus simulieren wir das Hinzufügen
      if (this.mockDataEnabled) {
        console.log('Füge Zähler mit simulierter DB hinzu:', meter);
        
        // Erzeuge eine neue UUID
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
        
        // Hole vorhandene Zähler
        const localMeters = JSON.parse(localStorage.getItem('meters') || '[]');
        
        // Füge neuen Zähler hinzu und speichere
        localMeters.push(newMeter);
        localStorage.setItem('meters', JSON.stringify(localMeters));
        
        return newMeter;
      }
      
      // In einer echten Anwendung würde hier eine API-Anfrage erfolgen
      // return await axios.post('/api/meters', meter).then(res => res.data);
      
      return null;
    } catch (error) {
      this.handleError('Fehler beim Hinzufügen des Zählers', error);
      return null;
    }
  }

  // Aktualisiere einen Zähler
  async updateMeter(meter: Meter): Promise<boolean> {
    try {
      this.lastError = null;
      
      // Im Browser-Modus simulieren wir die Aktualisierung
      if (this.mockDataEnabled) {
        console.log('Aktualisiere Zähler mit simulierter DB:', meter);
        
        // Hole vorhandene Zähler
        const localMeters: Meter[] = JSON.parse(localStorage.getItem('meters') || '[]');
        
        // Finde und aktualisiere den Zähler
        const updatedMeters = localMeters.map(m => 
          m.id === meter.id ? meter : m
        );
        
        // Speichere die aktualisierten Zähler
        localStorage.setItem('meters', JSON.stringify(updatedMeters));
        
        return true;
      }
      
      // In einer echten Anwendung würde hier eine API-Anfrage erfolgen
      // return await axios.put(`/api/meters/${meter.id}`, meter).then(() => true);
      
      return false;
    } catch (error) {
      this.handleError('Fehler beim Aktualisieren des Zählers', error);
      return false;
    }
  }

  // Lösche einen Zähler
  async deleteMeter(id: string): Promise<boolean> {
    try {
      this.lastError = null;
      
      // Im Browser-Modus simulieren wir das Löschen
      if (this.mockDataEnabled) {
        console.log('Lösche Zähler mit simulierter DB:', id);
        
        // Hole vorhandene Zähler
        const localMeters: Meter[] = JSON.parse(localStorage.getItem('meters') || '[]');
        
        // Filtere den zu löschenden Zähler
        const filteredMeters = localMeters.filter(m => m.id !== id);
        
        // Speichere die aktualisierten Zähler
        localStorage.setItem('meters', JSON.stringify(filteredMeters));
        
        return true;
      }
      
      // In einer echten Anwendung würde hier eine API-Anfrage erfolgen
      // return await axios.delete(`/api/meters/${id}`).then(() => true);
      
      return false;
    } catch (error) {
      this.handleError('Fehler beim Löschen des Zählers', error);
      return false;
    }
  }

  // Füge eine Notiz zu einem Zähler hinzu
  async updateMeterNotes(id: string, notes: string): Promise<boolean> {
    try {
      this.lastError = null;
      
      // Im Browser-Modus simulieren wir die Aktualisierung
      if (this.mockDataEnabled) {
        console.log('Aktualisiere Zählernotizen mit simulierter DB:', id, notes);
        
        // Hole vorhandene Zähler
        const localMeters: Meter[] = JSON.parse(localStorage.getItem('meters') || '[]');
        
        // Finde und aktualisiere den Zähler
        const updatedMeters = localMeters.map(m => {
          if (m.id === id) {
            return { ...m, notes };
          }
          return m;
        });
        
        // Speichere die aktualisierten Zähler
        localStorage.setItem('meters', JSON.stringify(updatedMeters));
        
        return true;
      }
      
      // In einer echten Anwendung würde hier eine API-Anfrage erfolgen
      // return await axios.patch(`/api/meters/${id}/notes`, { notes }).then(() => true);
      
      return false;
    } catch (error) {
      this.handleError('Fehler beim Aktualisieren der Notizen', error);
      return false;
    }
  }

  // Füge einen Zählerstand hinzu oder aktualisiere ihn
  async addOrUpdateReading(meterId: string, date: string, value: number): Promise<boolean> {
    try {
      this.lastError = null;
      
      // Im Browser-Modus simulieren wir das Hinzufügen/Aktualisieren
      if (this.mockDataEnabled) {
        console.log('Aktualisiere Zählerstand mit simulierter DB:', meterId, date, value);
        
        // Hole vorhandene Zähler
        const localMeters: Meter[] = JSON.parse(localStorage.getItem('meters') || '[]');
        
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
        localStorage.setItem('meters', JSON.stringify(updatedMeters));
        
        return true;
      }
      
      // In einer echten Anwendung würde hier eine API-Anfrage erfolgen
      // return await axios.post(`/api/meters/${meterId}/readings`, { date, value }).then(() => true);
      
      return false;
    } catch (error) {
      this.handleError('Fehler beim Speichern des Zählerstands', error);
      return false;
    }
  }

  // Aktualisiere Notizen für einen Zählerstand
  async updateReadingNotes(meterId: string, date: string, notes: string): Promise<boolean> {
    try {
      this.lastError = null;
      
      // Im Browser-Modus simulieren wir die Aktualisierung
      if (this.mockDataEnabled) {
        console.log('Aktualisiere Zählerstandnotizen mit simulierter DB:', meterId, date, notes);
        
        // Hole vorhandene Zähler
        const localMeters: Meter[] = JSON.parse(localStorage.getItem('meters') || '[]');
        
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
        localStorage.setItem('meters', JSON.stringify(updatedMeters));
        
        return true;
      }
      
      // In einer echten Anwendung würde hier eine API-Anfrage erfolgen
      // return await axios.patch(`/api/meters/${meterId}/readings/${date}/notes`, { notes }).then(() => true);
      
      return false;
    } catch (error) {
      this.handleError('Fehler beim Aktualisieren der Notizen', error);
      return false;
    }
  }

  // Lösche einen Zählerstand
  async deleteReading(meterId: string, date: string): Promise<boolean> {
    try {
      this.lastError = null;
      
      // Im Browser-Modus simulieren wir das Löschen
      if (this.mockDataEnabled) {
        console.log('Lösche Zählerstand mit simulierter DB:', meterId, date);
        
        // Hole vorhandene Zähler
        const localMeters: Meter[] = JSON.parse(localStorage.getItem('meters') || '[]');
        
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
        localStorage.setItem('meters', JSON.stringify(updatedMeters));
        
        return true;
      }
      
      // In einer echten Anwendung würde hier eine API-Anfrage erfolgen
      // return await axios.delete(`/api/meters/${meterId}/readings/${date}`).then(() => true);
      
      return false;
    } catch (error) {
      this.handleError('Fehler beim Löschen des Zählerstands', error);
      return false;
    }
  }

  // Fehlerbehandlung für alle Methoden
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
