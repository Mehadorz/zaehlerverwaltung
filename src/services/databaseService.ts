
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
  private dbUrl: string = 'http://localhost:3000'; // Standard-URL des Datenbankservers
  private lastError: string | null = null;

  // Setze Konfiguration für die Datenbankverbindung
  setConfig(config: DbConfig) {
    // Erstelle die Datenbank-URL basierend auf den Konfigurationsdaten
    this.dbUrl = `http://${config.host}:${config.port}`;
    
    // Speichere Konfiguration im localStorage für die Persistenz
    localStorage.setItem('dbConfig', JSON.stringify(config));
    
    console.log('Datenbank-Konfiguration aktualisiert:', {
      dbUrl: this.dbUrl,
      host: config.host,
      port: config.port,
      database: config.database
    });
  }

  // Lade gespeicherte Konfiguration aus dem localStorage
  loadConfig(): DbConfig | null {
    const saved = localStorage.getItem('dbConfig');
    if (saved) {
      return JSON.parse(saved);
    }
    return null;
  }

  // Liefere den letzten Fehler zurück
  getLastError(): string | null {
    return this.lastError;
  }

  // Prüfe die Datenbankverbindung
  async testConnection(): Promise<boolean> {
    try {
      console.log('Teste Verbindung zu:', this.dbUrl);
      this.lastError = null;
      
      // Health-Check Endpunkt aufrufen, um die Verbindung zu testen
      const response = await axios.get(`${this.dbUrl}/health`, { 
        timeout: 5000 // Timeout nach 5 Sekunden
      });
      
      if (response.status !== 200) {
        this.lastError = `Server-Fehler: ${response.status} ${response.statusText}`;
        console.error('Verbindungstest fehlgeschlagen:', this.lastError);
        return false;
      }
      
      console.log('Verbindungstest erfolgreich:', response.data);
      return true;
    } catch (error) {
      // Detaillierte Fehlerbehandlung
      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
          this.lastError = `Verbindung verweigert: Der Server unter ${this.dbUrl} ist nicht erreichbar. Bitte überprüfen Sie, ob der Server läuft und die Adresse korrekt ist.`;
        } else if (error.response) {
          this.lastError = `HTTP Fehler ${error.response.status}: ${error.response.statusText}`;
        } else if (error.request) {
          this.lastError = `Keine Antwort vom Server: ${error.message}`;
        } else {
          this.lastError = `Verbindungsfehler: ${error.message}`;
        }
      } else if (error instanceof Error) {
        this.lastError = `Fehler: ${error.message}`;
      } else {
        this.lastError = 'Unbekannter Verbindungsfehler';
      }
      
      console.error('Datenbank-Verbindungsfehler:', this.lastError);
      return false;
    }
  }

  // Hole alle Zähler aus der Datenbank
  async getAllMeters(): Promise<Meter[]> {
    try {
      this.lastError = null;
      const response = await axios.get(`${this.dbUrl}/meters`);
      return response.data;
    } catch (error) {
      this.handleError('Fehler beim Laden der Zähler', error);
      return [];
    }
  }

  // Füge einen neuen Zähler hinzu
  async addMeter(meter: Omit<Meter, 'id'>): Promise<Meter | null> {
    try {
      this.lastError = null;
      const response = await axios.post(`${this.dbUrl}/meters`, meter);
      return response.data;
    } catch (error) {
      this.handleError('Fehler beim Hinzufügen des Zählers', error);
      return null;
    }
  }

  // Aktualisiere einen Zähler
  async updateMeter(meter: Meter): Promise<boolean> {
    try {
      this.lastError = null;
      await axios.put(`${this.dbUrl}/meters/${meter.id}`, meter);
      return true;
    } catch (error) {
      this.handleError('Fehler beim Aktualisieren des Zählers', error);
      return false;
    }
  }

  // Lösche einen Zähler
  async deleteMeter(id: string): Promise<boolean> {
    try {
      this.lastError = null;
      await axios.delete(`${this.dbUrl}/meters/${id}`);
      return true;
    } catch (error) {
      this.handleError('Fehler beim Löschen des Zählers', error);
      return false;
    }
  }

  // Füge eine Notiz zu einem Zähler hinzu
  async updateMeterNotes(id: string, notes: string): Promise<boolean> {
    try {
      this.lastError = null;
      await axios.patch(`${this.dbUrl}/meters/${id}/notes`, { notes });
      return true;
    } catch (error) {
      this.handleError('Fehler beim Aktualisieren der Notizen', error);
      return false;
    }
  }

  // Füge eine Notiz zu einem Zählerstand hinzu
  async updateReadingNotes(meterId: string, date: string, notes: string): Promise<boolean> {
    try {
      this.lastError = null;
      await axios.patch(`${this.dbUrl}/meters/${meterId}/readings/${date}/notes`, { notes });
      return true;
    } catch (error) {
      this.handleError('Fehler beim Aktualisieren der Notizen', error);
      return false;
    }
  }

  // Fehlerbehandlung für alle Methoden
  private handleError(message: string, error: unknown): void {
    if (axios.isAxiosError(error)) {
      if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
        this.lastError = `Verbindung verweigert: Der Server ist nicht erreichbar.`;
      } else if (error.response) {
        this.lastError = `HTTP Fehler ${error.response.status}: ${error.response.statusText}`;
      } else if (error.request) {
        this.lastError = `Keine Antwort vom Server: ${error.message}`;
      } else {
        this.lastError = `Verbindungsfehler: ${error.message}`;
      }
    } else if (error instanceof Error) {
      this.lastError = `${message}: ${error.message}`;
    } else {
      this.lastError = `${message}: Unbekannter Fehler`;
    }
    console.error(message, error);
  }
}

export const databaseService = new DatabaseService();
