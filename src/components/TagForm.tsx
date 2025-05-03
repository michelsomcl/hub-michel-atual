
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DialogFooter } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface TagFormProps {
  tagName: string;
  setTagName: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
  isEditing: boolean;
  error?: string;
  isLoading?: boolean;
}

export const TagForm = ({ 
  tagName, 
  setTagName, 
  onSubmit, 
  onClose, 
  isEditing,
  error,
  isLoading = false
}: TagFormProps) => {
  return (
    <form onSubmit={onSubmit} className="space-y-4 py-4">
      <div className="space-y-2">
        <Label htmlFor="tagName">Nome da Tag</Label>
        <Input
          id="tagName"
          value={tagName}
          onChange={(e) => setTagName(e.target.value)}
          placeholder="Ex: VIP, Ativo, Aposentado..."
          required
        />
      </div>
      
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose}>
          Cancelar
        </Button>
        <Button 
          type="submit" 
          className="btn-primary"
          disabled={isLoading}
        >
          {isLoading 
            ? "Processando..." 
            : isEditing ? "Atualizar" : "Salvar"}
        </Button>
      </DialogFooter>
    </form>
  );
};
