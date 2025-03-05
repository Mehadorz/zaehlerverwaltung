
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
  private isConnected = false; // Flag für den Verbindungsstatus

  /**
   * Setze Konfiguration für die Datenbankverbindung
   * @param config Datenbank-Konfiguration
   */
  setConfig(config: DbConfig) {
    this.dbConfig = config;
    
    // Speichere Konfiguration im localStorage für die Persistenz
    localStorage.setItem('dbConfig', JSON.stringify(config));

    // Nach dem Setzen der Konfiguration setzen wir die Verbindung zurück
    // Ein erneuter Verbindungstest muss durchgeführt werden
    this.isConnected = false;
    
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
        this.useLocalStorage = true; // Fallback auf lokalen Speicher
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
        console.log('Verbindungstest fehlgeschlagen, verbleibe im lokalen Modus', this.lastError);
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
   * @returns Promise<boolean> - True bei erfolgreicher Verbindung
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
    
    // In einer Demo-Umgebung simulieren wir, dass nur bestimmte Hosts erreichbar sind
    // In einer Produktionsumgebung würde hier eine echte Verbindungsprüfung stattfinden
    
    // Im Demo-Modus: Für Testzwecke zulässige Hosts
    const validHosts = ['localhost', '127.0.0.1', 'db', 'database', 'mysql'];
    
    // Teste tatsächliche Verbindung (simuliert für Demo)
    const isValidHost = validHosts.includes(this.dbConfig.host.toLowerCase());
    
    // Überprüfe, ob es sich um eine IP-Adresse handelt
    const ipPattern = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
    const isIPAddress = ipPattern.test(this.dbConfig.host);
    
    if (isValidHost) {
      // Bekannte Hosts sind immer erreichbar (in der Demo)
      console.log(`Verbindung zu bekanntem Host ${this.dbConfig.host} erfolgreich simuliert`);
      
      // Simuliere, dass die Anmeldedaten geprüft werden
      // In einer echten Anwendung würde hier mit den Anmeldedaten eine Verbindung getestet
      
      // Nur für die Demo: Prüfe Kombination von Benutzername und Passwort für localhost/127.0.0.1
      if ((this.dbConfig.host === 'localhost' || this.dbConfig.host === '127.0.0.1') && 
          this.dbConfig.username === 'meter_user' && 
          this.dbConfig.password === 'meter_password') {
        return true;
      }
      
      // Für die Demo-Implementierung: Zufällig Erfolg/Fehler für andere Anmeldedaten
      const randomSuccess = Math.random() > 0.3; // 70% Erfolgsrate
      
      if (!randomSuccess) {
        this.lastError = `Anmeldung fehlgeschlagen: Benutzername oder Passwort ungültig`;
        return false;
      }
      
      return true;
    } else if (isIPAddress) {
      // Prüfe, ob es sich um eine lokale IP handelt
      const ipParts = this.dbConfig.host.split('.');
      const firstOctet = parseInt(ipParts[0]);
      
      const isLocalIP = firstOctet === 192 || firstOctet === 10 || 
                        (firstOctet === 172 && parseInt(ipParts[1]) >= 16 && parseInt(ipParts[1]) <= 31) ||
                        this.dbConfig.host === '127.0.0.1';
      
      if (isLocalIP) {
        console.log(`Verbindung zu lokaler IP ${this.dbConfig.host} simuliert`);
        // Für lokale IPs: überprüfe die Anmeldedaten (simuliert)
        
        // Für die Demo-Implementierung: Zufällig Erfolg/Fehler
        const randomSuccess = Math.random() > 0.3; // 70% Erfolgsrate
        
        if (!randomSuccess) {
          this.lastError = `Anmeldung fehlgeschlagen: Benutzername oder Passwort ungültig`;
          return false;
        }
        
        return true;
      }
      
      // Für andere IPs simulieren wir eine 50/50 Chance auf Erfolg/Fehler
      const canConnect = Math.random() > 0.5;
      
      if (!canConnect) {
        this.lastError = `Verbindung zu ${this.dbConfig.host} konnte nicht hergestellt werden (Zeitüberschreitung)`;
        return false;
      }
      
      return true;
    } else {
      // Bei Domain-Namen simulieren wir eine 50/50 Chance auf Erfolg/Fehler
      const canConnect = Math.random() > 0.5;
      
      if (!canConnect) {
        this.lastError = `Host ${this.dbConfig.host} ist nicht erreichbar`;
        return false;
      }
      
      return true;
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
        // Wichtig: Überprüfe, ob wir tatsächlich verbunden sind
        if (!this.isConnected) {
          console.log('Nicht mit Datenbank verbunden, teste Verbindung...');
          const connected = await this.testConnection();
          if (!connected) {
            console.log('Konnte keine Datenbankverbindung herstellen, verwende lokalen Speicher');
            return loadLocalMeters();
          }
        }
        
        console.log('Verwende Datenbank für getAllMeters, isConnected:', this.isConnected);
        
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
      
      // Überprüfe erneut den Verbindungsstatus, wenn im Datenbankmodus
      if (!this.useLocalStorage && !this.isConnected) {
        console.log('Nicht mit Datenbank verbunden, teste Verbindung...');
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
        
        // Im simulierten Modus verwenden wir den lokalen Speicher als Ersatz für die DB
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
      
      // Überprüfe erneut den Verbindungsstatus, wenn im Datenbankmodus
      if (!this.useLocalStorage && !this.isConnected) {
        console.log('Nicht mit Datenbank verbunden, teste Verbindung...');
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
      
      // Überprüfe erneut den Verbindungsstatus, wenn im Datenbankmodus
      if (!this.useLocalStorage && !this.isConnected) {
        console.log('Nicht mit Datenbank verbunden, teste Verbindung...');
        const connected = await this.testConnection();
        if (!connected) {
          this.lastError = "Keine Datenbankverbindung: Zähler konnte nicht gelöscht werden";
          return false;
        }
      }
      
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
