
import React from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface TagsHeaderProps {
  onAddTag: () => void;
}

export const TagsHeader = ({ onAddTag }: TagsHeaderProps) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold">Tags</h1>
        <p className="text-muted-foreground">
          Gerencie as tags para categorizar seus clientes
        </p>
      </div>
      
      <Button 
        className="btn-primary" 
        onClick={onAddTag}
      >
        <Plus size={16} className="mr-2" />
        Nova Tag
      </Button>
    </div>
  );
};
