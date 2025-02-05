import { useState } from "react";
import { format, parse } from "date-fns";
import { de } from "date-fns/locale";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AddReadingDialogProps {
  meterId: string;
  onAddReading: (meterId: string, value: number, date: string) => void;
}

export const AddReadingDialog = ({ meterId, onAddReading }: AddReadingDialogProps) => {
  const [value, setValue] = useState("");
  const [dateInput, setDateInput] = useState(format(new Date(), "dd.MM.yyyy"));
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numValue = parseFloat(value);
    
    try {
      const parsedDate = parse(dateInput, "dd.MM.yyyy", new Date());
      
      if (isNaN(parsedDate.getTime())) {
        toast({
          title: "Ungültiges Datum",
          description: "Bitte geben Sie ein gültiges Datum im Format TT.MM.JJJJ ein.",
          variant: "destructive",
          duration: 10000,
        });
        return;
      }

      if (isNaN(numValue)) {
        toast({
          title: "Ungültiger Wert",
          description: "Bitte geben Sie einen gültigen Zahlenwert ein.",
          variant: "destructive",
          duration: 10000,
        });
        return;
      }

      onAddReading(meterId, numValue, format(parsedDate, "yyyy-MM-dd"));
      setValue("");
      setDateInput(format(new Date(), "dd.MM.yyyy"));
      setOpen(false);
      
      toast({
        title: "Zählerstand hinzugefügt",
        description: `Neuer Zählerstand ${numValue} für ${format(parsedDate, "dd.MM.yyyy", { locale: de })} wurde gespeichert.`,
        duration: 10000,
      });
    } catch (error) {
      toast({
        title: "Ungültiges Datum",
        description: "Bitte geben Sie ein gültiges Datum im Format TT.MM.JJJJ ein.",
        variant: "destructive",
        duration: 10000,
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Zählerstand hinzufügen
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Neuen Zählerstand eintragen</DialogTitle>
          <DialogDescription>
            Geben Sie den Zählerstand ein und das Datum im Format TT.MM.JJJJ.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reading">Zählerstand</Label>
            <Input
              id="reading"
              type="number"
              step="0.01"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Zählerstand eingeben"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="date">Datum (TT.MM.JJJJ)</Label>
            <Input
              id="date"
              type="text"
              value={dateInput}
              onChange={(e) => setDateInput(e.target.value)}
              placeholder="TT.MM.JJJJ"
            />
          </div>
          <Button type="submit" className="w-full">Zählerstand speichern</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};