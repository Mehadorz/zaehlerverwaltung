import { format } from "date-fns";
import { de } from "date-fns/locale";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

interface DateRangeFilterProps {
  dateRange: {
    from: Date;
    to: Date;
  };
  onDateRangeChange: (range: { from: Date; to: Date }) => void;
}

export const DateRangeFilter = ({ dateRange, onDateRangeChange }: DateRangeFilterProps) => {
  const handleFromChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const date = new Date(e.target.value);
      if (!isNaN(date.getTime())) {
        onDateRangeChange({ ...dateRange, from: date });
      }
    } catch (error) {
      console.error("Invalid date format");
    }
  };

  const handleToChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const date = new Date(e.target.value);
      if (!isNaN(date.getTime())) {
        onDateRangeChange({ ...dateRange, to: date });
      }
    } catch (error) {
      console.error("Invalid date format");
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 space-y-2">
            <Label htmlFor="fromDate">Von</Label>
            <Input
              type="date"
              id="fromDate"
              value={format(dateRange.from, "yyyy-MM-dd")}
              onChange={handleFromChange}
            />
          </div>
          <div className="flex-1 space-y-2">
            <Label htmlFor="toDate">Bis</Label>
            <Input
              type="date"
              id="toDate"
              value={format(dateRange.to, "yyyy-MM-dd")}
              onChange={handleToChange}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};