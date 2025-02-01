import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface MeterCardProps {
  id: string;
  name: string;
  isActive: boolean;
  readings: { date: string; value: number }[];
  onToggle: (id: string, value: boolean) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export const MeterCard = ({
  id,
  name,
  isActive,
  readings,
  onToggle,
  onEdit,
  onDelete,
}: MeterCardProps) => {
  const totalConsumption = readings.reduce((acc, curr, idx) => {
    if (idx === 0) return 0;
    return acc + (curr.value - readings[idx - 1].value);
  }, 0);

  const consumptionData = readings.map((reading, idx) => ({
    date: reading.date,
    consumption: idx === 0 ? 0 : reading.value - readings[idx - 1].value,
  }));

  return (
    <Card className="meter-card overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl font-semibold">{name}</CardTitle>
        <div className="flex items-center space-x-2">
          <Switch
            checked={isActive}
            onCheckedChange={(checked) => onToggle(id, checked)}
          />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(id)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(id)}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mt-2 space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Status</span>
            <span className={`text-sm font-medium ${isActive ? 'text-green-500' : 'text-red-500'}`}>
              {isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Total Consumption</span>
            <span className="text-sm font-medium">{totalConsumption.toFixed(2)} units</span>
          </div>
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={consumptionData}>
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="consumption"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};