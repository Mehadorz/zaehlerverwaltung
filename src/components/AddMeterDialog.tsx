
import { useState } from "react";
// Import der Dialog-Komponenten aus der shadcn/ui Bibliothek für das Modal-Fenster
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
// Import der UI-Basis-Komponenten
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// Import des Plus-Icons aus der lucide-react Bibliothek
import { Plus } from "lucide-react";

// Definition der Props für den AddMeterDialog
interface AddMeterDialogProps {
  onAddMeter: (name: string, unit: string) => void;
}

// AddMeterDialog Komponente: Ermöglicht das Hinzufügen neuer Zähler über ein Modal-Fenster
export const AddMeterDialog = ({ onAddMeter }: AddMeterDialogProps) => {
  // State für die Eingabefelder und den Dialog-Status
  const [name, setName] = useState("");
  const [unit, setUnit] = useState("kWh");
  const [open, setOpen] = useState(false);

  // Handler für das Absenden des Formulars
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
