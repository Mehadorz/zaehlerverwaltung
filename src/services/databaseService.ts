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
  private isConnected = false; // Neues Flag für den Verbindungsstatus

  /**
   * Setze Konfiguration für die Datenbankverbindung
   * @param config Datenbank-Konfiguration
   */
  setConfig(config: DbConfig) {
    this.dbConfig = config;
    
    // Speichere Konfiguration im localStorage für die Persistenz
    localStorage.setItem('dbConfig', JSON.stringify(config));

    // Nach dem Setzen der Konfiguration wechseln wir nicht automatisch zum Datenbankbetrieb
    // Dies wird erst nach erfolgreichem Verbindungstest erfolgen
    
    console.log('Datenbank-Konfiguration aktualisiert:', {
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
   * Prüft, ob eine aktive Datenbankverbindung besteht
   * @returns True, wenn verbunden
   */
  isDbConnected(): boolean {
    return this.isConnected;
  }

  /**
   * Prüfe die Datenbankverbindung
   * @returns Promise<boolean> - True bei erfolgreicher Verbindung
   */
  async testConnection(): Promise<boolean> {
    try {
      if (!this.dbConfig) {
        this.lastError = "Die Datenbank-Konfiguration wurde nicht gesetzt";
        this.isConnected = false;
        return false;
      }
      
      console.log('Teste Verbindung zu:', this.dbConfig.host);
      this.lastError = null;
      
      // Simuliere einen echten Verbindungstest
      // In einer echten Implementierung würden wir hier eine tatsächliche Verbindung testen
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Durchführen eines Pseudo-Verbindungstests
      const canConnect = await this.simulateDbConnection();
      if (!canConnect) {
        // Verbindungstest fehlgeschlagen, verbleibe im lokalen Modus
        this.useLocalStorage = true;
        this.isConnected = false;
        return false;
      }
      
      // Verbindungstest erfolgreich, setzen wir useLocalStorage auf false
      this.useLocalStorage = false;
      this.isConnected = true;
      
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
      this.isConnected = false;
      
      console.error('Datenbank-Verbindungsfehler:', this.lastError, 'Verwende lokalen Speicher:', this.useLocalStorage);
      return false;
    }
  }

  /**
   * Simuliert eine Datenbankverbindung
   * HINWEIS: Hier würde normalerweise eine echte Verbindungsprüfung stattfinden
   */
  private async simulateDbConnection(): Promise<boolean> {
    if (!this.dbConfig) return false;
    
    // Grundlegende Validierung der Eingaben
    if (!this.dbConfig.host || this.dbConfig.host.trim() === '') {
      this.lastError = "Host darf nicht leer sein";
      return false;
    }
    
    if (!this.dbConfig.port || this.dbConfig.port <= 0 || this.dbConfig.port > 65535) {
      this.lastError = "Port muss zwischen 1 und 65535 liegen";
      return false;
    }
    
    if (!this.dbConfig.username || this.dbConfig.username.trim() === '') {
      this.lastError = "Benutzername darf nicht leer sein";
      return false;
    }
    
    if (!this.dbConfig.password || this.dbConfig.password.trim() === '') {
      this.lastError = "Passwort darf nicht leer sein";
      return false;
    }
    
    if (!this.dbConfig.database || this.dbConfig.database.trim() === '') {
      this.lastError = "Datenbankname darf nicht leer sein";
      return false;
    }
    
    // Simuliere tatsächliches Verbindungstesten
    // In einer realen Anwendung würden wir hier eine tatsächliche DB-Verbindung testen
    
    // Im Demofall simulieren wir, dass bestimmte Host-Werte erreichbar sind 
    // und andere nicht, um realistischeres Verhalten zu demonstrieren
    const validHosts = ['localhost', '127.0.0.1', 'db', 'database', 'mysql'];
    
    // Für die Demo: nur bestimmte Hosts sind "erreichbar"
    // In einer echten Anwendung würde hier ein tatsächlicher Verbindungstest stattfinden
    if (validHosts.includes(this.dbConfig.host.toLowerCase())) {
      return true;
    }
    
    // Teste IP-Format
    const ipPattern = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
    if (ipPattern.test(this.dbConfig.host)) {
      // In einer echten Anwendung: teste tatsächliche Verbindung
      // Für die Demo: Gib an, dass nicht zu jeder IP verbunden werden kann
      const ipParts = this.dbConfig.host.split('.');
      // Simuliere, dass bestimmte IP-Adressen nicht erreichbar sind
      if (ipParts[0] === '192' || ipParts[0] === '10') {
        this.lastError = `Verbindung zu ${this.dbConfig.host} konnte nicht hergestellt werden (Zeitüberschreitung)`;
        return false;
      }
      return false; // Generell keine IP-Verbindungen im Demo-Modus
    }
    
    // Bei echten Domain-Namen simulieren wir einen Verbindungsfehler
    this.lastError = `Host ${this.dbConfig.host} ist nicht erreichbar`;
    return false;
  }

  /**
   * Validiere den Host-Namen (simuliert)
   * @param host Host-Name
   * @returns True wenn der Host gültig ist
   */
  private validateHost(host: string): boolean {
    // Beispielvalidierung: localhost, 127.0.0.1 und db sind gültig
    const validHosts = ['localhost', '127.0.0.1', 'db', 'database', 'mysql'];
    if (host.trim() === '') return false;
    if (validHosts.includes(host.toLowerCase())) return true;
    
    // IP-Adressen-Format prüfen
    const ipPattern = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
    if (ipPattern.test(host)) return true;
    
    // Domain-Format prüfen
    const domainPattern = /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})+$/;
    return domainPattern.test(host);
  }

  /**
   * Validiere den Port (simuliert)
   * @param port Port
   * @returns True wenn der Port gültig ist
   */
  private validatePort(port: number): boolean {
    // Port muss eine Zahl zwischen 1 und 65535 sein
    return port > 0 && port <= 65535;
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
        if (!this.isConnected) {
          // Wenn wir nicht verbunden sind, versuche eine Verbindung herzustellen
          const connected = await this.testConnection();
          if (!connected) {
            // Wenn keine Verbindung hergestellt werden kann, verwende lokalen Speicher
            console.log('Konnte keine Datenbankverbindung herstellen, verwende lokalen Speicher');
            return loadLocalMeters();
          }
        }
        
        console.log('Verwende Datenbank für getAllMeters');
        
        // In einer realen Anwendung würden wir hier eine SQL-Abfrage ausführen
        // z.B.: SELECT * FROM meters
        
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
      
      // Wenn wir im Datenbank-Modus sind aber keine Verbindung besteht,
      // versuche eine Verbindung herzustellen
      if (!this.useLocalStorage && !this.isConnected) {
        const connected = await this.testConnection();
        if (!connected) {
          this.lastError = "Keine Datenbankverbindung: Zähler konnte nicht gespeichert werden";
          return null;
        }
      }
      
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
        
        // In einer realen Anwendung würden wir hier eine SQL-Anweisung ausführen
        // z.B.: INSERT INTO meters (id, name, unit, is_active, notes) VALUES (...)
        
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
      
      // Wenn wir im Datenbank-Modus sind aber keine Verbindung besteht,
      // versuche eine Verbindung herzustellen
      if (!this.useLocalStorage && !this.isConnected) {
        const connected = await this.testConnection();
        if (!connected) {
          this.lastError = "Keine Datenbankverbindung: Zähler konnte nicht aktualisiert werden";
          return false;
        }
      }
      
      if (this.useLocalStorage) {
        console.log('Lokaler Speicher: Aktualisiere Zähler:', meter);
      } else {
        console.log('Datenbank: Aktualisiere Zähler:', meter);
        // In einer realen Anwendung würden wir hier eine SQL-Anweisung ausführen
        // z.B.: UPDATE meters SET name = ?, unit = ?, ... WHERE id = ?
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
