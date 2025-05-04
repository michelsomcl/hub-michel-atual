
import React, { useState, useEffect } from "react";
import { Layout } from "../components/Layout";
import { TagsHeader } from "../components/TagsHeader";
import { TagsList } from "../components/TagsList";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tag } from "../types";
import { toast } from "@/hooks/use-toast";
import { getTags, saveTag, deleteTag } from "../services/supabaseClient";
import { TagForm } from "../components/TagForm";
import { generateId } from "../lib/utils";

const Tags = () => {
  const [tags, setTags] = useState<Tag[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentTag, setCurrentTag] = useState<Tag | null>(null);
  const [tagName, setTagName] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Carregar tags quando o componente montar
  useEffect(() => {
    const loadTags = async () => {
      try {
        setIsLoading(true);
        const tagsData = await getTags();
        setTags(tagsData);
      } catch (error) {
        console.error("Erro ao carregar tags:", error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar as tags. Tente novamente.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadTags();
  }, []);

  const handleAddClick = () => {
    setTagName("");
    setError("");
    setIsEditing(false);
    setCurrentTag(null);
    setIsDialogOpen(true);
  };

  const handleEditClick = (tag: Tag) => {
    setTagName(tag.name);
    setError("");
    setIsEditing(true);
    setCurrentTag(tag);
    setIsDialogOpen(true);
  };

  const handleDeleteClick = async (tagId: string) => {
    try {
      // Confirmar exclusão
      if (!confirm("Tem certeza que deseja excluir esta tag? Isso removerá a tag de todos os clientes que a utilizam.")) {
        return;
      }
      
      const success = await deleteTag(tagId);
      
      if (!success) {
        throw new Error("Erro ao excluir tag");
      }
      
      // Atualizar lista local de tags
      setTags(prev => prev.filter(tag => tag.id !== tagId));
      
      toast({
        title: "Tag excluída",
        description: "A tag foi excluída com sucesso."
      });
    } catch (error) {
      console.error("Erro ao excluir tag:", error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir a tag. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!tagName.trim()) return;
    
    const trimmedName = tagName.trim();
    
    // Verificar se o nome da tag já existe
    const tagExists = tags.some(tag => 
      tag.name.toLowerCase() === trimmedName.toLowerCase() && 
      (!currentTag || tag.id !== currentTag.id)
    );
    
    if (tagExists) {
      setError("Tag já cadastrada");
      return;
    }
    
    try {
      let tagToSave: Tag;
      
      if (isEditing && currentTag) {
        // Atualizar tag existente
        tagToSave = {
          ...currentTag,
          name: trimmedName
        };
      } else {
        // Criar nova tag
        tagToSave = {
          id: generateId(),
          name: trimmedName,
          createdAt: new Date()
        };
      }
      
      const savedTag = await saveTag(tagToSave);
      
      if (!savedTag) {
        throw new Error("Erro ao salvar tag");
      }
      
      // Atualizar lista local de tags
      setTags(prev => {
        if (isEditing && currentTag) {
          return prev.map(tag => tag.id === currentTag.id ? savedTag : tag);
        } else {
          return [...prev, savedTag];
        }
      });
      
      // Fechar diálogo
      setIsDialogOpen(false);
      
      // Mostrar mensagem de sucesso
      toast({
        title: isEditing ? "Tag atualizada" : "Tag criada",
        description: isEditing 
          ? "A tag foi atualizada com sucesso." 
          : "A tag foi criada com sucesso."
      });
    } catch (error) {
      console.error("Erro ao salvar tag:", error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar a tag. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <TagsHeader onAddTag={handleAddClick} />
        
        <TagsList 
          tags={tags} 
          onEdit={handleEditClick} 
          onDelete={handleDeleteClick} 
          onAddTag={handleAddClick}
        />
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{isEditing ? "Editar Tag" : "Nova Tag"}</DialogTitle>
            </DialogHeader>
            
            <TagForm 
              tagName={tagName}
              setTagName={setTagName}
              onSubmit={handleSubmit}
              onClose={() => setIsDialogOpen(false)}
              isEditing={isEditing}
              error={error}
            />
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default Tags;
