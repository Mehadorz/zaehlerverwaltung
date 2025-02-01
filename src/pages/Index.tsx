import { useState } from "react";
import { MeterCard } from "@/components/MeterCard";
import { AddMeterDialog } from "@/components/AddMeterDialog";
import { AddReadingDialog } from "@/components/AddReadingDialog";
import { useToast } from "@/components/ui/use-toast";

interface Meter {
  id: string;
  name: string;
  isActive: boolean;
  readings: { date: string; value: number }[];
}

const Index = () => {
  const [meters, setMeters] = useState<Meter[]>([]);
  const { toast } = useToast();

  const handleAddMeter = (name: string) => {
    const newMeter: Meter = {
      id: crypto.randomUUID(),
      name,
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

  const handleAddReading = (meterId: string, value: number) => {
    setMeters((prev) =>
      prev.map((meter) => {
        if (meter.id === meterId) {
          const newReadings = [
            ...meter.readings,
            { date: new Date().toLocaleDateString(), value },
          ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
          return { ...meter, readings: newReadings };
        }
        return meter;
      })
    );
    toast({
      title: "Reading Added",
      description: "New reading has been recorded successfully.",
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
              <div className="space-y-4">
                <MeterCard
                  {...meter}
                  onToggle={handleToggleMeter}
                  onEdit={() => {}}
                  onDelete={handleDeleteMeter}
                />
                <div className="px-4">
                  <AddReadingDialog
                    meterId={meter.id}
                    onAddReading={handleAddReading}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <AddMeterDialog onAddMeter={handleAddMeter} />
      </div>
    </div>
  );
};

export default Index;