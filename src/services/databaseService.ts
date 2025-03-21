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
  private connectionValidated = false; // Flag, ob die Verbindung bereits validiert wurde
  private dbStorage: Map<string, any> = new Map(); // Simulierte Datenbank-Speicherung

  constructor() {
    // Load config and initialize connection status
    this.loadConfig();
    
    // Try to load DB state immediately at startup
    this.loadDbStateFromPersistentStorage();
  }

  /**
   * Setze Konfiguration für die Datenbankverbindung
   * @param config Datenbank-Konfiguration
   */
  setConfig(config: DbConfig) {
    // Wenn sich die Konfiguration ändert, setzen wir den Verbindungsstatus zurück
    if (this.dbConfig && 
        (this.dbConfig.host !== config.host || 
         this.dbConfig.port !== config.port || 
         this.dbConfig.username !== config.username || 
         this.dbConfig.password !== config.password || 
         this.dbConfig.database !== config.database)) {
      this.isConnected = false;
      this.connectionValidated = false;
    }
    
    this.dbConfig = config;
    
    // Speichere Konfiguration im localStorage für die Persistenz
    localStorage.setItem('dbConfig', JSON.stringify(config));
    
    console.log('Datenbank-Konfiguration aktualisiert:', {
      host: config.host,
      port: config.port,
      database: config.database,
      username: config.username,
      connectionValidated: this.connectionValidated
    });
  }

  /**
   * Lade gespeicherte Konfiguration aus dem localStorage
   * @returns Datenbank-Konfiguration oder null, wenn keine vorhanden
   */
  loadConfig(): DbConfig | null {
    const saved = localStorage.getItem('dbConfig');
    if (saved) {
      try {
        this.dbConfig = JSON.parse(saved);
        console.log('Gespeicherte Datenbankkonfiguration geladen:', {
          host: this.dbConfig.host,
          port: this.dbConfig.port,
          database: this.dbConfig.database
        });
        return this.dbConfig;
      } catch (e) {
        console.error('Fehler beim Laden der Datenbankkonfiguration:', e);
      }
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
    return this.isConnected && this.connectionValidated;
  }

  /**
   * Initialisiert die simulierte Datenbank mit den lokalen Daten
   * Dies wird nach einer erfolgreichen Verbindung durchgeführt
   */
  private initDbStorage(): void {
    // Nur initialisieren, wenn die DB-Speicherung leer ist
    if (this.dbStorage.size === 0) {
      // Versuche zuerst, den gespeicherten DB-Zustand zu laden
      const savedDbState = localStorage.getItem('db_meters');
      if (savedDbState) {
        try {
          const parsedData = JSON.parse(savedDbState);
          this.dbStorage.set('meters', parsedData);
          console.log('DB-Speicherung initialisiert mit gespeicherten DB-Daten:', parsedData.length, 'Zähler');
          return;
        } catch (e) {
          console.error('Fehler beim Laden des DB-Zustands:', e);
        }
      }
      
      // Wenn kein DB-Zustand vorhanden ist, verwende lokale Daten
      const localMeters = loadLocalMeters();
      this.dbStorage.set('meters', JSON.parse(JSON.stringify(localMeters)));
      console.log('DB-Speicherung initialisiert mit lokalen Daten:', localMeters.length, 'Zähler');
      
      // Speichern wir den initialisierten DB-Zustand auch im localStorage
      this.saveDbStateToPersistentStorage();
    }
  }

  /**
   * Speichert den aktuellen Zustand der simulierten DB im LocalStorage
   * Damit wir bei einem Page Refresh die "Datenbank-Daten" erhalten
   */
  private saveDbStateToPersistentStorage(): void {
    if (this.dbStorage.has('meters')) {
      const metersToSave = this.dbStorage.get('meters');
      localStorage.setItem('db_meters', JSON.stringify(metersToSave));
      console.log('DB-Status im LocalStorage gespeichert mit', metersToSave.length, 'Zählern');
    }
  }

  /**
   * Lädt den gespeicherten DB-Zustand aus dem LocalStorage
   * Damit wir bei einem Page Refresh die "Datenbank-Daten" erhalten
   */
  private loadDbStateFromPersistentStorage(): boolean {
    const savedDbState = localStorage.getItem('db_meters');
    if (savedDbState) {
      try {
        const parsedData = JSON.parse(savedDbState);
        this.dbStorage.set('meters', parsedData);
        console.log('DB-Status aus LocalStorage geladen mit', parsedData.length, 'Zählern');
        return true;
      } catch (e) {
        console.error('Fehler beim Laden des DB-Zustands:', e);
      }
    } else {
      console.log('Kein gespeicherter DB-Status gefunden');
    }
    return false;
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
        this.connectionValidated = false;
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
      
      // Setze die Verbindungsflags basierend auf dem Ergebnis
      this.isConnected = canConnect;
      this.connectionValidated = true;
      this.useLocalStorage = !canConnect;
      
      // Bei erfolgreicher Verbindung die DB-Speicherung initialisieren
      if (canConnect) {
        // Lade zuerst gespeicherte DB-Daten, wenn vorhanden
        const loaded = this.loadDbStateFromPersistentStorage();
        // Dann initialisiere mit lokalen Daten, falls DB leer ist
        if (!loaded || this.dbStorage.size === 0) {
          this.initDbStorage();
        }
      }
      
      console.log('Verbindungstest abgeschlossen:', {
        isConnected: this.isConnected,
        useLocalStorage: this.useLocalStorage,
        lastError: this.lastError,
        dbStorageSize: this.dbStorage.size
      });
      
      return canConnect;
    } catch (error) {
      if (error instanceof Error) {
        this.lastError = `Verbindungsfehler: ${error.message}`;
      } else {
        this.lastError = 'Unbekannter Verbindungsfehler zur Datenbank';
      }
      
      // Bei Verbindungsfehler wieder auf lokalen Speicher umschalten
      this.isConnected = false;
      this.connectionValidated = true;
      this.useLocalStorage = true;
      
      console.error('Datenbank-Verbindungsfehler:', this.lastError, 'Verwende lokalen Speicher:', this.useLocalStorage);
      return false;
    }
  }

  /**
   * Simuliert eine Datenbankverbindung
   * Für eine Demo-Anwendung müssen wir die Datenbankverbindung simulieren
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
    
    // Alle Verbindungen werden als erfolgreich angesehen, solange die Grundvalidierung besteht
    console.log('Verbindung zu Datenbank simuliert:', this.dbConfig.host);
    return true;
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
        if (!this.isConnected || !this.connectionValidated) {
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
        
        // Verwende die simulierte DB-Speicherung statt des lokalen Speichers
        if (!this.dbStorage.has('meters')) {
          // Initialisiere, falls noch nicht geschehen
          const loaded = this.loadDbStateFromPersistentStorage();
          if (!loaded) {
            // Falls keine gespeicherten DB-Daten vorhanden, initialisiere mit Mock-Daten
            this.initDbStorage();
          }
        }
        
        const dbMeters = this.dbStorage.get('meters') || [];
        console.log('Datenbank: Gebe', dbMeters.length, 'Zähler zurück');
        
        return dbMeters.length > 0 ? dbMeters : generateMockMeters();
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
        
        // Im simulierten Datenbankmodus verwenden wir den DB-Speicher
        if (!this.dbStorage.has('meters')) {
          // Initialisiere DB-Speicher, falls noch nicht geschehen
          this.loadDbStateFromPersistentStorage();
          this.initDbStorage();
        }
        
        const dbMeters = this.dbStorage.get('meters') || [];
        dbMeters.push(newMeter);
        this.dbStorage.set('meters', dbMeters);
        
        // Für die Demo speichern wir den DB-Zustand auch im localStorage
        this.saveDbStateToPersistentStorage();
        
        console.log('Datenbank: Zähler hinzugefügt, neue Anzahl:', dbMeters.length);
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
        
        // Hole vorhandene Zähler
        const localMeters = loadLocalMeters();
        
        // Finde und aktualisiere den Zähler
        const updatedMeters = localMeters.map(m => 
          m.id === meter.id ? meter : m
        );
        
        // Speichere die aktualisierten Zähler
        saveLocalMeters(updatedMeters);
      } else {
        console.log('Datenbank: Aktualisiere Zähler:', meter);
        
        // In einer realen Anwendung würden wir hier eine SQL-Anweisung ausführen
        // z.B.: UPDATE meters SET name = ?, unit = ?, ... WHERE id = ?
        
        // Im simulierten Datenbankmodus verwenden wir den DB-Speicher
        const dbMeters = this.dbStorage.get('meters') || [];
        const updatedMeters = dbMeters.map(m => 
          m.id === meter.id ? meter : m
        );
        this.dbStorage.set('meters', updatedMeters);
        
        // Für die Demo speichern wir den DB-Zustand auch im localStorage
        this.saveDbStateToPersistentStorage();
        
        console.log('Datenbank: Zähler aktualisiert');
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
        
        // Hole vorhandene Zähler
        const localMeters = loadLocalMeters();
        
        // Filtere den zu löschenden Zähler
        const filteredMeters = localMeters.filter(m => m.id !== id);
        
        // Speichere die aktualisierten Zähler
        saveLocalMeters(filteredMeters);
      } else {
        console.log('Datenbank: Lösche Zähler:', id);
        
        // In einer realen Anwendung würden wir hier eine SQL-Anweisung ausführen
        // z.B.: DELETE FROM meters WHERE id = ?
        
        // Im simulierten Datenbankmodus verwenden wir den DB-Speicher
        const dbMeters = this.dbStorage.get('meters') || [];
        const filteredMeters = dbMeters.filter(m => m.id !== id);
        this.dbStorage.set('meters', filteredMeters);
        
        // Für die Demo speichern wir den DB-Zustand auch im localStorage
        this.saveDbStateToPersistentStorage();
        
        console.log('Datenbank: Zähler gelöscht, neue Anzahl:', filteredMeters.length);
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
      } else {
        console.log('Datenbank: Aktualisiere Zählernotizen:', id, notes);
        
        // Im simulierten Datenbankmodus verwenden wir den DB-Speicher
        const dbMeters = this.dbStorage.get('meters') || [];
        const updatedMeters = dbMeters.map(m => {
          if (m.id === id) {
            return { ...m, notes };
          }
          return m;
        });
        this.dbStorage.set('meters', updatedMeters);
        
        // Für die Demo speichern wir den DB-Zustand auch im localStorage
        this.saveDbStateToPersistentStorage();
        
        console.log('Datenbank: Zählernotizen aktualisiert');
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
      } else {
        console.log('Datenbank: Aktualisiere Zählerstand:', meterId, date, value);
        
        // Im simulierten Datenbankmodus verwenden wir den DB-Speicher
        const dbMeters = this.dbStorage.get('meters') || [];
        
        // Finde den Zähler
        const updatedMeters = dbMeters.map(m => {
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
        
        this.dbStorage.set('meters', updatedMeters);
        
        // Für die Demo speichern wir den DB-Zustand auch im localStorage
        this.saveDbStateToPersistentStorage();
        
        console.log('Datenbank: Zählerstand aktualisiert');
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
      } else {
        console.log('Datenbank: Aktualisiere Zählerstandnotizen:', meterId, date, notes);
        
        // Im simulierten Datenbankmodus verwenden wir den DB-Speicher
        const dbMeters = this.dbStorage.get('meters') || [];
        
        // Finde den Zähler und den Zählerstand
        const updatedMeters = dbMeters.map(m => {
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
        
        this.dbStorage.set('meters', updatedMeters);
        
        // Für die Demo speichern wir den DB-Zustand auch im localStorage
        this.saveDbStateToPersistentStorage();
        
        console.log('Datenbank: Zählerstandnotizen aktualisiert');
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
      } else {
        console.log('Datenbank: Lösche Zählerstand:', meterId, date);
        
        // Im simulierten Datenbankmodus verwenden wir den DB-Speicher
        const dbMeters = this.dbStorage.get('meters') || [];
        
        // Finde den Zähler und lösche den Zählerstand
        const updatedMeters = dbMeters.map(m => {
          if (m.id === meterId) {
            return {
              ...m,
              readings: m.readings.filter(r => r.date !== date)
            };
          }
          return m;
        });
        
        this.dbStorage.set('meters', updatedMeters);
        
        // Für die Demo speichern wir den DB-Zustand auch im localStorage
        this.saveDbStateToPersistentStorage();
        
        console.log('Datenbank: Zählerstand gelöscht');
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
