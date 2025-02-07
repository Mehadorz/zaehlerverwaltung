
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
// Import von date-fns Funktionen für die Datumsformatierung
import { format, parse } from "date-fns";
import { de } from "date-fns/locale";

// Definition der Schnittstelle für einen Zählerstand
interface Reading {
  date: string;
  value: number;
}

// Definition der Props für das ConsumptionChart
interface ConsumptionChartProps {
  readings: Reading[];
}

// ConsumptionChart Komponente: Stellt den Verbrauch als Liniendiagramm dar
export const ConsumptionChart = ({ readings }: ConsumptionChartProps) => {
  // Berechnet die Verbrauchsdaten aus den Zählerständen
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
