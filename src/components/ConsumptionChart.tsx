import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { format, parse } from "date-fns";
import { de } from "date-fns/locale";

interface Reading {
  date: string;
  value: number;
}

interface ConsumptionChartProps {
  readings: Reading[];
}

export const ConsumptionChart = ({ readings }: ConsumptionChartProps) => {
  const consumptionData = readings.map((reading, idx) => ({
    date: format(parse(reading.date, "yyyy-MM-dd", new Date()), "dd.MM.yyyy", { locale: de }),
    consumption: idx === 0 ? 0 : reading.value - readings[idx - 1].value,
  }));

  return (
    <div className="h-[200px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={consumptionData}>
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="consumption" stroke="hsl(var(--primary))" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};