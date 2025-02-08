
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { StickyNote } from "lucide-react";

interface NotesDialogProps {
  title: string;
  initialNotes?: string;
  onSave: (notes: string) => void;
}

export const NotesDialog = ({ title, initialNotes = "", onSave }: NotesDialogProps) => {
  const [notes, setNotes] = useState(initialNotes);
  const [open, setOpen] = useState(false);

  const handleSave = () => {
    onSave(notes);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <StickyNote className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Notizen eingeben..."
            className="min-h-[100px]"
          />
          <Button onClick={handleSave} className="w-full">
            Speichern
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

