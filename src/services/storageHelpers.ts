
import { Meter } from './types';

/**
 * Lädt Zähler aus dem localStorage
 * @returns Array von Zählern oder leeres Array, wenn keine Daten vorhanden sind
 */
export const loadLocalMeters = (): Meter[] => {
  const localMeters = localStorage.getItem('meters');
  if (localMeters) {
    return JSON.parse(localMeters);
  }
  return [];
};

/**
 * Speichert Zähler im localStorage
 * @param meters Array von Zählern, die gespeichert werden sollen
 */
export const saveLocalMeters = (meters: Meter[]): void => {
  localStorage.setItem('meters', JSON.stringify(meters));
};

/**
 * Generiert Mock-Daten für Zähler
 * Wird verwendet, wenn keine Daten im localStorage vorhanden sind
 * @returns Array von Mock-Zählern
 */
export const generateMockMeters = (): Meter[] => {
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
  saveLocalMeters(mockMeters);
  return mockMeters;
};
