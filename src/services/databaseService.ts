
import axios from 'axios';
import mysql from 'mysql2/promise';

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
  private connection: mysql.Connection | null = null;
  private lastError: string | null = null;

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

  // Datenbank verbinden
  private async connect(): Promise<mysql.Connection> {
    if (!this.dbConfig) {
      throw new Error("Die Datenbank-Konfiguration wurde nicht gesetzt");
    }

    try {
      if (this.connection) {
        // Prüfe, ob die Verbindung noch aktiv ist
        await this.connection.ping();
        return this.connection;
      }
      
      console.log('Verbindung zur Datenbank wird hergestellt:', {
        host: this.dbConfig.host,
        port: this.dbConfig.port,
        database: this.dbConfig.database,
        user: this.dbConfig.username
      });
      
      // Erstelle eine neue Verbindung
      this.connection = await mysql.createConnection({
        host: this.dbConfig.host,
        port: this.dbConfig.port,
        user: this.dbConfig.username,
        password: this.dbConfig.password,
        database: this.dbConfig.database
      });
      
      return this.connection;
    } catch (error) {
      console.error('Fehler beim Verbinden zur Datenbank:', error);
      if (error instanceof Error) {
        this.lastError = `Verbindungsfehler: ${error.message}`;
      } else {
        this.lastError = 'Unbekannter Verbindungsfehler zur Datenbank';
      }
      throw error;
    }
  }

  // Prüfe die Datenbankverbindung
  async testConnection(): Promise<boolean> {
    try {
      if (!this.dbConfig) {
        this.lastError = "Die Datenbank-Konfiguration wurde nicht gesetzt";
        return false;
      }
      
      console.log('Teste Verbindung zu:', this.dbConfig.host);
      this.lastError = null;
      
      // Verbindung erstellen und testen
      const connection = await mysql.createConnection({
        host: this.dbConfig.host,
        port: this.dbConfig.port,
        user: this.dbConfig.username,
        password: this.dbConfig.password,
        database: this.dbConfig.database
      });
      
      // Ping, um die Verbindung zu testen
      await connection.ping();
      
      // Alles OK, Verbindung schließen
      await connection.end();
      
      console.log('Verbindungstest erfolgreich');
      return true;
    } catch (error) {
      // Detaillierte Fehlerbehandlung
      if (error instanceof Error) {
        // Bekannte MySQL-Fehlercodes analysieren
        const errorMsg = error.message.toLowerCase();
        
        if (errorMsg.includes('access denied')) {
          this.lastError = `Zugriff verweigert: Benutzername oder Passwort ist falsch.`;
        } else if (errorMsg.includes('econnrefused')) {
          this.lastError = `Verbindung verweigert: Der Server unter ${this.dbConfig?.host}:${this.dbConfig?.port} ist nicht erreichbar. Bitte überprüfen Sie, ob der Datenbankserver läuft und die Adresse korrekt ist.`;
        } else if (errorMsg.includes('unknown database')) {
          this.lastError = `Unbekannte Datenbank '${this.dbConfig?.database}'. Bitte stellen Sie sicher, dass die Datenbank existiert.`;
        } else {
          this.lastError = `Datenbankfehler: ${error.message}`;
        }
      } else {
        this.lastError = 'Unbekannter Verbindungsfehler zur Datenbank';
      }
      
      console.error('Datenbank-Verbindungsfehler:', this.lastError);
      return false;
    }
  }

  // Hole alle Zähler aus der Datenbank
  async getAllMeters(): Promise<Meter[]> {
    try {
      this.lastError = null;
      const conn = await this.connect();
      
      // Hole Zähler
      const [metersRows] = await conn.execute('SELECT * FROM meters');
      const meters = metersRows as any[];
      
      // Für jeden Zähler die Zählerstände laden
      const result: Meter[] = [];
      
      for (const meter of meters) {
        const [readingsRows] = await conn.execute(
          'SELECT * FROM readings WHERE meter_id = ? ORDER BY reading_date',
          [meter.id]
        );
        
        // Formatiere die Daten
        const readings: Reading[] = (readingsRows as any[]).map(row => ({
          date: row.reading_date.toISOString().split('T')[0],
          value: parseFloat(row.value),
          notes: row.notes
        }));
        
        result.push({
          id: meter.id,
          name: meter.name,
          unit: meter.unit,
          isActive: meter.is_active === 1,
          notes: meter.notes,
          readings
        });
      }
      
      return result;
    } catch (error) {
      this.handleError('Fehler beim Laden der Zähler', error);
      return [];
    }
  }

  // Füge einen neuen Zähler hinzu
  async addMeter(meter: Omit<Meter, 'id'>): Promise<Meter | null> {
    try {
      this.lastError = null;
      const conn = await this.connect();
      
      // Erzeuge eine neue UUID
      const id = crypto.randomUUID();
      
      // Füge den Zähler hinzu
      await conn.execute(
        'INSERT INTO meters (id, name, unit, is_active, notes) VALUES (?, ?, ?, ?, ?)',
        [id, meter.name, meter.unit, meter.isActive ? 1 : 0, meter.notes || null]
      );
      
      // Rückgabe des neuen Zählers mit ID
      return {
        id,
        name: meter.name,
        unit: meter.unit,
        isActive: meter.isActive,
        notes: meter.notes,
        readings: []
      };
    } catch (error) {
      this.handleError('Fehler beim Hinzufügen des Zählers', error);
      return null;
    }
  }

  // Aktualisiere einen Zähler
  async updateMeter(meter: Meter): Promise<boolean> {
    try {
      this.lastError = null;
      const conn = await this.connect();
      
      // Aktualisiere den Zähler
      await conn.execute(
        'UPDATE meters SET name = ?, unit = ?, is_active = ?, notes = ? WHERE id = ?',
        [meter.name, meter.unit, meter.isActive ? 1 : 0, meter.notes || null, meter.id]
      );
      
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
      const conn = await this.connect();
      
      // Lösche den Zähler
      await conn.execute('DELETE FROM meters WHERE id = ?', [id]);
      
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
      const conn = await this.connect();
      
      // Aktualisiere die Notizen
      await conn.execute(
        'UPDATE meters SET notes = ? WHERE id = ?',
        [notes, id]
      );
      
      return true;
    } catch (error) {
      this.handleError('Fehler beim Aktualisieren der Notizen', error);
      return false;
    }
  }

  // Füge einen Zählerstand hinzu oder aktualisiere ihn
  async addOrUpdateReading(meterId: string, date: string, value: number): Promise<boolean> {
    try {
      this.lastError = null;
      const conn = await this.connect();
      
      // Prüfe, ob der Zählerstand bereits existiert
      const [rows] = await conn.execute(
        'SELECT id FROM readings WHERE meter_id = ? AND reading_date = ?', 
        [meterId, date]
      );
      
      const existingReadings = rows as any[];
      
      if (existingReadings.length > 0) {
        // Aktualisiere den Zählerstand
        await conn.execute(
          'UPDATE readings SET value = ? WHERE meter_id = ? AND reading_date = ?',
          [value, meterId, date]
        );
      } else {
        // Füge einen neuen Zählerstand hinzu
        const readingId = crypto.randomUUID();
        await conn.execute(
          'INSERT INTO readings (id, meter_id, reading_date, value) VALUES (?, ?, ?, ?)',
          [readingId, meterId, date, value]
        );
      }
      
      return true;
    } catch (error) {
      this.handleError('Fehler beim Speichern des Zählerstands', error);
      return false;
    }
  }

  // Aktualisiere Notizen für einen Zählerstand
  async updateReadingNotes(meterId: string, date: string, notes: string): Promise<boolean> {
    try {
      this.lastError = null;
      const conn = await this.connect();
      
      // Aktualisiere die Notizen
      await conn.execute(
        'UPDATE readings SET notes = ? WHERE meter_id = ? AND reading_date = ?',
        [notes, meterId, date]
      );
      
      return true;
    } catch (error) {
      this.handleError('Fehler beim Aktualisieren der Notizen', error);
      return false;
    }
  }

  // Lösche einen Zählerstand
  async deleteReading(meterId: string, date: string): Promise<boolean> {
    try {
      this.lastError = null;
      const conn = await this.connect();
      
      // Lösche den Zählerstand
      await conn.execute(
        'DELETE FROM readings WHERE meter_id = ? AND reading_date = ?',
        [meterId, date]
      );
      
      return true;
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
