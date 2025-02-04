import { useState } from "react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface AddReadingDialogProps {
  meterId: string;
  onAddReading: (meterId: string, value: number, date: string) => void;
}

export const AddReadingDialog = ({ meterId, onAddReading }: AddReadingDialogProps) => {
  const [value, setValue] = useState("");
  const [date, setDate] = useState<Date>(new Date());
  const [open, setOpen] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numValue = parseFloat(value);
    
    if (isNaN(numValue)) {
      toast({
        title: "Ungültiger Wert",
        description: "Bitte geben Sie einen gültigen Zahlenwert ein.",
        variant: "destructive",
      });
      return;
    }

    onAddReading(meterId, numValue, format(date, "yyyy-MM-dd"));
    setValue("");
    setDate(new Date());
    setOpen(false);
    
    toast({
      title: "Zählerstand hinzugefügt",
      description: `Neuer Zählerstand ${numValue} für ${format(date, "dd.MM.yyyy", { locale: de })} wurde gespeichert.`,
    });
  };

  const handleDateSelect = (newDate: Date | undefined) => {
    if (newDate) {
      setDate(newDate);
      setCalendarOpen(false);
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
            Geben Sie den Zählerstand ein und wählen Sie das Datum aus.
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
            <Label>Datum</Label>
            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  {format(date, "dd.MM.yyyy", { locale: de })}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={handleDateSelect}
                  initialFocus
                  locale={de}
                />
              </PopoverContent>
            </Popover>
          </div>
          <Button type="submit" className="w-full">Zählerstand speichern</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};