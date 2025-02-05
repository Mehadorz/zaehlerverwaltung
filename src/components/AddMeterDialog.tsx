import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";

interface AddMeterDialogProps {
  onAddMeter: (name: string, unit: string) => void;
}

export const AddMeterDialog = ({ onAddMeter }: AddMeterDialogProps) => {
  const [name, setName] = useState("");
  const [unit, setUnit] = useState("kWh");
  const [open, setOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onAddMeter(name.trim(), unit);
      setName("");
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="fixed bottom-6 right-6 rounded-full shadow-lg">
          <Plus className="h-4 w-4 mr-2" />
          Zähler hinzufügen
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Neuen Zähler hinzufügen</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Zählername</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Zählername eingeben"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="unit">Einheit</Label>
            <Select value={unit} onValueChange={setUnit}>
              <SelectTrigger>
                <SelectValue placeholder="Einheit auswählen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="kWh">kWh</SelectItem>
                <SelectItem value="m³">m³</SelectItem>
                <SelectItem value="L">Liter</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" className="w-full">Zähler hinzufügen</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};