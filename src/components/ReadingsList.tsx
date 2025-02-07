
// Import der UI-Komponenten
import { Button } from "@/components/ui/button";
// Import der Icons aus der lucide-react Bibliothek
import { Pencil, Trash2 } from "lucide-react";
// Import von date-fns Funktionen für die Datumsformatierung
import { format, parse } from "date-fns";
import { de } from "date-fns/locale";

// Definition der Schnittstelle für einen Zählerstand
interface Reading {
  date: string;
  value: number;
}

// Definition der Props für die ReadingsList
interface ReadingsListProps {
  readings: Reading[];
  unit: string;
  onEditReading: (date: string, value: number) => void;
  onDeleteReading: (date: string) => void;
}

// ReadingsList Komponente: Zeigt eine Liste aller Zählerstände mit Bearbeitungsmöglichkeiten
export const ReadingsList = ({ readings, unit, onEditReading, onDeleteReading }: ReadingsListProps) => {
  // Funktion zum Formatieren des Datums
  const formatDate = (date: string) => {
    return format(parse(date, "yyyy-MM-dd", new Date()), "dd.MM.yyyy", { locale: de });
  };

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-medium">Zählerstände</h4>
      <div className="space-y-2">
        {readings.map((reading, idx) => (
          <div key={reading.date} className="flex items-center justify-between bg-secondary/50 p-2 rounded-md">
            <div className="space-y-1">
              <div className="text-sm">{formatDate(reading.date)}</div>
              <div className="text-sm font-medium">{reading.value} {unit}</div>
              {idx > 0 && (
                <div className="text-xs text-muted-foreground">
                  Verbrauch: {(reading.value - readings[idx - 1].value).toFixed(2)} {unit}
                </div>
              )}
            </div>
            <div className="flex space-x-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  const newValue = window.prompt("Neuen Wert eingeben:", reading.value.toString());
                  if (newValue && !isNaN(parseFloat(newValue))) {
                    onEditReading(reading.date, parseFloat(newValue));
                  }
                }}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDeleteReading(reading.date)}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
