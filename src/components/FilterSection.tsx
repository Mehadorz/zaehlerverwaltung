
// Import der DateRangeFilter Komponente für die Datumauswahl
import { DateRangeFilter } from "@/components/DateRangeFilter";
// Import der Select-Komponenten für das Dropdown-Menü
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// Import der Card-Komponenten für das Layout
import { Card, CardContent } from "@/components/ui/card";

// Definition der Props für die FilterSection Komponente
interface FilterSectionProps {
  dateRange: {
    from: Date;
    to: Date;
  };
  filterStatus: "all" | "active" | "inactive";
  onDateRangeChange: (range: { from: Date; to: Date }) => void;
  onFilterStatusChange: (value: "all" | "active" | "inactive") => void;
}

// FilterSection Komponente: Stellt die Filteroptionen für Datum und Zählerstatus dar
export const FilterSection = ({
  dateRange,
  filterStatus,
  onDateRangeChange,
  onFilterStatusChange,
}: FilterSectionProps) => {
  return (
    <Card className="mb-6 glass-card">
      <CardContent className="p-6">
        <h2 className="text-xl font-semibold mb-4 text-left">Verbrauch anzeigen für</h2>
        <div className="flex flex-col sm:flex-row gap-6">
          <div className="flex-1">
            <DateRangeFilter dateRange={dateRange} onDateRangeChange={onDateRangeChange} />
          </div>
          <div className="w-full sm:w-48 flex flex-col justify-end">
            <Select value={filterStatus} onValueChange={onFilterStatusChange}>
              <SelectTrigger className="w-full bg-white/50 backdrop-blur-sm border border-white/20">
                <SelectValue placeholder="Status Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Zähler</SelectItem>
                <SelectItem value="active">Aktive Zähler</SelectItem>
                <SelectItem value="inactive">Inaktive Zähler</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
