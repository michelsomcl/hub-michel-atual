
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tag } from "../types";
import { generateId } from "../lib/utils";
import { TagForm } from "./TagForm";
import { getTags, saveTags } from "../services/localStorage";
import { toast } from "@/hooks/use-toast";

interface QuickTagModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateTag: (tag: Tag) => void;
}

export const QuickTagModal = ({ isOpen, onClose, onCreateTag }: QuickTagModalProps) => {
  const [tagName, setTagName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!tagName.trim()) return;
    
    const trimmedName = tagName.trim();
    
    setLoading(true);
    try {
      // Check if tag already exists
      const currentTags = await getTags();
      const tagExists = currentTags.some(tag => 
        tag.name.toLowerCase() === trimmedName.toLowerCase()
      );
      
      if (tagExists) {
        setError("Tag já cadastrada");
        toast({
          title: "Erro",
          description: "Tag já cadastrada",
          variant: "destructive"
        });
        return;
      }
      
      const newTag: Tag = {
        id: generateId(),
        name: trimmedName,
        createdAt: new Date()
      };
      
      // Get current tags, add the new one, and sort alphabetically
      const updatedTags = [...currentTags, newTag]
        .sort((a, b) => a.name.localeCompare(b.name));
      
      // Atualizar Supabase
      await saveTags(updatedTags);
      
      onCreateTag(newTag);
      resetForm();
      onClose();
      
      toast({
        title: "Tag criada",
        description: `A tag "${newTag.name}" foi criada com sucesso.`
      });
    } catch (error) {
      console.error("Erro ao criar tag:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao criar a tag.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  const resetForm = () => {
    setTagName("");
    setError("");
  };
  
  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nova Tag</DialogTitle>
        </DialogHeader>
        
        <TagForm 
          tagName={tagName}
          setTagName={setTagName}
          onSubmit={handleSubmit}
          onClose={handleClose}
          isEditing={false}
          error={error}
          isLoading={loading}
        />
      </DialogContent>
    </Dialog>
  );
};
