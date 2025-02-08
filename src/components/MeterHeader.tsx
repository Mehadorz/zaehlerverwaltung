// Import der UI-Komponenten
import { CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
// Import der Icons aus der lucide-react Bibliothek
import { Pencil, Trash2 } from "lucide-react";
// Import der Dialog-Komponenten für das Bearbeiten von Zählern
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { NotesDialog } from "./NotesDialog";

// Definition der Props für den MeterHeader
interface MeterHeaderProps {
  id: string;
  name: string;
  unit: string;
  notes?: string;
  isActive: boolean;
  onToggle: (id: string, value: boolean) => void;
  onEdit: (id: string, name: string, unit: string) => void;
  onDelete: (id: string) => void;
  onUpdateNotes: (id: string, notes: string) => void;
}

// MeterHeader Komponente: Zeigt den Header eines Zählers mit Aktions-Buttons
export const MeterHeader = ({
  id,
  name,
  unit,
  notes,
  isActive,
  onToggle,
  onEdit,
  onDelete,
  onUpdateNotes,
}: MeterHeaderProps) => {
  // State für den Dialog zum Bearbeiten des Zählers
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editName, setEditName] = useState(name);
  const [editUnit, setEditUnit] = useState(unit);

  // Handler für das Speichern der Änderungen
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onEdit(id, editName, editUnit);
    setIsEditDialogOpen(false);
  };

  return (
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-xl font-semibold">{name}</CardTitle>
      <div className="flex items-center space-x-2">
        <Switch checked={isActive} onCheckedChange={(checked) => onToggle(id, checked)} />
        <NotesDialog
          title="Zähler Notizen"
          initialNotes={notes}
          onSave={(notes) => onUpdateNotes(id, notes)}
        />
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon">
              <Pencil className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Zähler bearbeiten</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Name</Label>
                <Input id="edit-name" value={editName} onChange={(e) => setEditName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-unit">Einheit</Label>
                <Input id="edit-unit" value={editUnit} onChange={(e) => setEditUnit(e.target.value)} />
              </div>
              <Button type="submit" className="w-full">Speichern</Button>
            </form>
          </DialogContent>
        </Dialog>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="icon">
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Zähler löschen</AlertDialogTitle>
              <AlertDialogDescription>
                Möchten Sie den Zähler "{name}" wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Abbrechen</AlertDialogCancel>
              <AlertDialogAction onClick={() => onDelete(id)}>Löschen</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </CardHeader>
  );
};
