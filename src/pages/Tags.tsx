
import React, { useState, useEffect } from "react";
import { Layout } from "../components/Layout";
import { Tag } from "../types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { generateId } from "../lib/utils";
import { toast } from "@/hooks/use-toast";
import { TagsHeader } from "../components/TagsHeader";
import { TagsList } from "../components/TagsList";
import { TagForm } from "../components/TagForm";
import { getTags, saveTags } from "../services/localStorage";

const Tags = () => {
  const [tags, setTags] = useState<Tag[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [tagName, setTagName] = useState("");
  const [error, setError] = useState("");
  
  // Carregar tags do localStorage quando o componente montar
  useEffect(() => {
    const storedTags = getTags();
    // Sort tags alphabetically
    const sortedTags = [...storedTags].sort((a, b) => a.name.localeCompare(b.name));
    setTags(sortedTags);
  }, []);

  const handleAddTag = () => {
    setTagName("");
    setEditingTag(null);
    setError("");
    setIsDialogOpen(true);
  };
  
  const handleEditTag = (tag: Tag) => {
    setTagName(tag.name);
    setEditingTag(tag);
    setError("");
    setIsDialogOpen(true);
  };
  
  const handleDeleteTag = (tagId: string) => {
    const updatedTags = tags.filter(tag => tag.id !== tagId);
    setTags(updatedTags);
    saveTags(updatedTags);
    
    toast({
      title: "Tag excluída",
      description: "A tag foi removida com sucesso."
    });
  };
  
  const handleDialogSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!tagName.trim()) return;
    
    const trimmedName = tagName.trim();
    
    let updatedTags: Tag[];
    let tagExists = false;
    
    if (editingTag) {
      // Check if another tag with same name exists (when editing)
      tagExists = tags.some(
        tag => tag.id !== editingTag.id && 
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
      
      // Update existing tag
      updatedTags = tags.map(tag => 
        tag.id === editingTag.id 
          ? { ...tag, name: trimmedName } 
          : tag
      );
      
      toast({
        title: "Tag atualizada",
        description: `A tag "${trimmedName}" foi atualizada com sucesso.`
      });
    } else {
      // Check if tag with same name already exists (when creating new)
      tagExists = tags.some(
        tag => tag.name.toLowerCase() === trimmedName.toLowerCase()
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
      
      // Create new tag
      const newTag: Tag = {
        id: generateId(),
        name: trimmedName,
        createdAt: new Date()
      };
      
      updatedTags = [...tags, newTag];
      
      toast({
        title: "Tag criada",
        description: `A tag "${trimmedName}" foi criada com sucesso.`
      });
    }
    
    // Sort tags alphabetically
    const sortedTags = updatedTags.sort((a, b) => a.name.localeCompare(b.name));
    
    // Atualizar estado e salvar no localStorage
    setTags(sortedTags);
    saveTags(sortedTags);
    setIsDialogOpen(false);
    setError("");
  };
  
  const handleClose = () => {
    setIsDialogOpen(false);
    setEditingTag(null);
    setError("");
  };

  return (
    <Layout>
      <div className="space-y-8">
        <TagsHeader onAddTag={handleAddTag} />
        
        <TagsList 
          tags={tags} 
          onEdit={handleEditTag} 
          onDelete={handleDeleteTag} 
          onAddTag={handleAddTag}
        />
        
        <Dialog open={isDialogOpen} onOpenChange={handleClose}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingTag ? "Editar Tag" : "Nova Tag"}
              </DialogTitle>
            </DialogHeader>
            
            <TagForm 
              tagName={tagName}
              setTagName={setTagName}
              onSubmit={handleDialogSubmit}
              onClose={handleClose}
              isEditing={!!editingTag}
              error={error}
            />
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default Tags;
