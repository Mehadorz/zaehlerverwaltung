
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

// Service-Klasse für Datenbankoperationen
class DatabaseService {
  private apiUrl = 'http://localhost:3000/api'; // URL des Backend-Services

  // Prüfe die Datenbankverbindung
  async testConnection(): Promise<boolean> {
    try {
      await axios.get(`${this.apiUrl}/health`);
      return true;
    } catch (error) {
      console.error('Datenbank-Verbindungsfehler:', error);
      return false;
    }
  }

  // Hole alle Zähler aus der Datenbank
  async getAllMeters(): Promise<Meter[]> {
    try {
      const response = await axios.get(`${this.apiUrl}/meters`);
      return response.data;
    } catch (error) {
      console.error('Fehler beim Laden der Zähler:', error);
      return [];
    }
  }

  // Füge einen neuen Zähler hinzu
  async addMeter(meter: Omit<Meter, 'id'>): Promise<Meter | null> {
    try {
      const response = await axios.post(`${this.apiUrl}/meters`, meter);
      return response.data;
    } catch (error) {
      console.error('Fehler beim Hinzufügen des Zählers:', error);
      return null;
    }
  }

  // Aktualisiere einen Zähler
  async updateMeter(meter: Meter): Promise<boolean> {
    try {
      await axios.put(`${this.apiUrl}/meters/${meter.id}`, meter);
      return true;
    } catch (error) {
      console.error('Fehler beim Aktualisieren des Zählers:', error);
      return false;
    }
  }

  // Lösche einen Zähler
  async deleteMeter(id: string): Promise<boolean> {
    try {
      await axios.delete(`${this.apiUrl}/meters/${id}`);
      return true;
    } catch (error) {
      console.error('Fehler beim Löschen des Zählers:', error);
      return false;
    }
  }

  // Füge eine Notiz zu einem Zähler hinzu
  async updateMeterNotes(id: string, notes: string): Promise<boolean> {
    try {
      await axios.patch(`${this.apiUrl}/meters/${id}/notes`, { notes });
      return true;
    } catch (error) {
      console.error('Fehler beim Aktualisieren der Notizen:', error);
      return false;
    }
  }

  // Füge eine Notiz zu einem Zählerstand hinzu
  async updateReadingNotes(meterId: string, date: string, notes: string): Promise<boolean> {
    try {
      await axios.patch(`${this.apiUrl}/meters/${meterId}/readings/${date}/notes`, { notes });
      return true;
    } catch (error) {
      console.error('Fehler beim Aktualisieren der Notizen:', error);
      return false;
    }
  }
}

export const databaseService = new DatabaseService();

