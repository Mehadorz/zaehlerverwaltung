import { CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";

interface MeterHeaderProps {
  id: string;
  name: string;
  unit: string;
  isActive: boolean;
  onToggle: (id: string, value: boolean) => void;
  onEdit: (id: string, name: string, unit: string) => void;
  onDelete: (id: string) => void;
}

export const MeterHeader = ({
  id,
  name,
  unit,
  isActive,
  onToggle,
  onEdit,
  onDelete,
}: MeterHeaderProps) => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editName, setEditName] = useState(name);
  const [editUnit, setEditUnit] = useState(unit);

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
        <Button variant="ghost" size="icon" onClick={() => onDelete(id)}>
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </div>
    </CardHeader>
  );
};