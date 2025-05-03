
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
import { saveTags, getTags } from "../services/localStorage";
import { toast } from "@/hooks/use-toast";

interface QuickTagModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateTag: (tag: Tag) => void;
}

export const QuickTagModal = ({ isOpen, onClose, onCreateTag }: QuickTagModalProps) => {
  const [tagName, setTagName] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!tagName.trim()) return;
    
    const trimmedName = tagName.trim();
    
    // Check if tag already exists
    const currentTags = getTags();
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
    
    // Atualizar localStorage
    saveTags(updatedTags);
    
    onCreateTag(newTag);
    resetForm();
    onClose();
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
        />
      </DialogContent>
    </Dialog>
  );
};
