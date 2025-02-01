import { useState } from "react";
import { MeterCard } from "@/components/MeterCard";
import { AddMeterDialog } from "@/components/AddMeterDialog";
import { useToast } from "@/hooks/use-toast";

interface Reading {
  date: string;
  value: number;
}

interface Meter {
  id: string;
  name: string;
  unit: string;
  isActive: boolean;
  readings: Reading[];
}

const Index = () => {
  const [meters, setMeters] = useState<Meter[]>([]);
  const { toast } = useToast();

  const handleAddMeter = (name: string, unit: string) => {
    const newMeter: Meter = {
      id: crypto.randomUUID(),
      name,
      unit,
      isActive: true,
      readings: [],
    };
    setMeters((prev) => [...prev, newMeter]);
    toast({
      title: "Meter Added",
      description: `${name} has been added successfully.`,
    });
  };

  const handleToggleMeter = (id: string, isActive: boolean) => {
    setMeters((prev) =>
      prev.map((meter) =>
        meter.id === id ? { ...meter, isActive } : meter
      )
    );
    toast({
      title: "Status Updated",
      description: `Meter status has been ${isActive ? 'activated' : 'deactivated'}.`,
    });
  };

  const handleDeleteMeter = (id: string) => {
    setMeters((prev) => prev.filter((meter) => meter.id !== id));
    toast({
      title: "Meter Deleted",
      description: "The meter has been deleted successfully.",
      variant: "destructive",
    });
  };

  const handleEditReading = (meterId: string, date: string, value: number) => {
    setMeters((prev) =>
      prev.map((meter) => {
        if (meter.id === meterId) {
          const existingReadingIndex = meter.readings.findIndex(r => r.date === date);
          let newReadings;
          
          if (existingReadingIndex >= 0) {
            newReadings = [...meter.readings];
            newReadings[existingReadingIndex] = { date, value };
          } else {
            newReadings = [...meter.readings, { date, value }];
          }
          
          newReadings.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
          return { ...meter, readings: newReadings };
        }
        return meter;
      })
    );
    toast({
      title: "Reading Updated",
      description: "Reading has been updated successfully.",
    });
  };

  const handleDeleteReading = (meterId: string, date: string) => {
    setMeters((prev) =>
      prev.map((meter) => {
        if (meter.id === meterId) {
          return {
            ...meter,
            readings: meter.readings.filter((r) => r.date !== date),
          };
        }
        return meter;
      })
    );
    toast({
      title: "Reading Deleted",
      description: "Reading has been deleted successfully.",
      variant: "destructive",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Meter Management</h1>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {meters.map((meter) => (
            <div key={meter.id} className="slide-in">
              <MeterCard
                {...meter}
                onToggle={handleToggleMeter}
                onEdit={() => {}}
                onDelete={handleDeleteMeter}
                onDeleteReading={handleDeleteReading}
                onEditReading={handleEditReading}
              />
            </div>
          ))}
        </div>

        <AddMeterDialog onAddMeter={handleAddMeter} />
      </div>
    </div>
  );
};

export default Index;