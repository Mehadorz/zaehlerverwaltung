
// Import der date-fns Funktionen für Datumsformatierung
import { format } from "date-fns";
// Import der deutschen Lokalisierung
import { de } from "date-fns/locale";
// Import der UI-Komponenten
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

// Definition der Props für die DateRangeFilter Komponente
interface DateRangeFilterProps {
  dateRange: {
    from: Date;
    to: Date;
  };
  onDateRangeChange: (range: { from: Date; to: Date }) => void;
}

// DateRangeFilter Komponente: Ermöglicht die Auswahl eines Datumsbereichs
export const DateRangeFilter = ({ dateRange, onDateRangeChange }: DateRangeFilterProps) => {
  // Handler für Änderungen am "Von"-Datum
  const handleFromChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const date = new Date(e.target.value);
      if (!isNaN(date.getTime())) {
        onDateRangeChange({ ...dateRange, from: date });
      }
    } catch (error) {
      console.error("Ungültiges Datumsformat");
    }
  };

  // Handler für Änderungen am "Bis"-Datum
  const handleToChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const date = new Date(e.target.value);
      if (!isNaN(date.getTime())) {
        onDateRangeChange({ ...dateRange, to: date });
      }
    } catch (error) {
      console.error("Ungültiges Datumsformat");
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 space-y-2">
          <Label htmlFor="fromDate">Von</Label>
          <Input
            type="date"
            id="fromDate"
            value={format(dateRange.from, "yyyy-MM-dd")}
            onChange={handleFromChange}
            className="bg-white/50 backdrop-blur-sm border border-white/20"
          />
        </div>
        <div className="flex-1 space-y-2">
          <Label htmlFor="toDate">Bis</Label>
          <Input
            type="date"
            id="toDate"
            value={format(dateRange.to, "yyyy-MM-dd")}
            onChange={handleToChange}
            className="bg-white/50 backdrop-blur-sm border border-white/20"
          />
        </div>
      </div>
    </div>
  );
};
