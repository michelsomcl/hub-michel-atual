
import React from "react";
import { TagCard } from "./TagCard";
import { Tag } from "../types";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface TagsListProps {
  tags: Tag[];
  onEdit: (tag: Tag) => void;
  onDelete: (tagId: string) => void;
  onAddTag: () => void;
}

export const TagsList = ({ tags, onEdit, onDelete, onAddTag }: TagsListProps) => {
  // Sort tags alphabetically by name
  const sortedTags = [...tags].sort((a, b) => 
    a.name.localeCompare(b.name)
  );
  
  if (sortedTags.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground">Nenhuma tag cadastrada</p>
        <Button 
          className="mt-4 btn-primary" 
          onClick={onAddTag}
        >
          <Plus size={16} className="mr-2" />
          Criar Tag
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {sortedTags.map(tag => (
        <TagCard 
          key={tag.id} 
          tag={tag} 
          onEdit={onEdit} 
          onDelete={onDelete} 
        />
      ))}
    </div>
  );
};
