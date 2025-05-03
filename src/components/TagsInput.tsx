
import React, { useState } from "react";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tag } from "../types";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";

interface TagsInputProps {
  selectedTags: Tag[];
  availableTags: Tag[];
  onChange: (tags: Tag[]) => void;
  onAddTagClick: () => void;
}

export const TagsInput = ({ selectedTags, availableTags, onChange, onAddTagClick }: TagsInputProps) => {
  const [open, setOpen] = useState(false);
  
  const handleRemoveTag = (tagId: string) => {
    onChange(selectedTags.filter(tag => tag.id !== tagId));
  };
  
  const handleSelectTag = (tagId: string) => {
    const tagToAdd = availableTags.find(tag => tag.id === tagId);
    if (tagToAdd && !selectedTags.find(tag => tag.id === tagId)) {
      onChange([...selectedTags, tagToAdd]);
    }
    setOpen(false);
  };
  
  // Sort the selected tags alphabetically
  const sortedSelectedTags = [...selectedTags].sort((a, b) => 
    a.name.localeCompare(b.name)
  );
  
  const availableUnselectedTags = availableTags
    .filter(tag => !selectedTags.some(selectedTag => selectedTag.id === tag.id))
    .sort((a, b) => a.name.localeCompare(b.name)); // Sort available tags alphabetically

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2 p-2 border rounded-md min-h-10">
        {sortedSelectedTags.map(tag => (
          <Badge 
            key={tag.id}
            className="flex items-center gap-1 py-1"
          >
            {tag.name}
            <X
              className="h-3.5 w-3.5 cursor-pointer hover:bg-white/20 rounded"
              onClick={() => handleRemoveTag(tag.id)}
            />
          </Badge>
        ))}
      </div>
      
      <div className="flex gap-2">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-9 text-sm"
            >
              Adicionar Tag
            </Button>
          </PopoverTrigger>
          <PopoverContent className="p-0" align="start">
            <Command>
              <CommandInput placeholder="Buscar tag..." />
              <CommandList>
                <CommandEmpty>Nenhuma tag encontrada</CommandEmpty>
                <CommandGroup>
                  {availableUnselectedTags.map(tag => (
                    <CommandItem
                      key={tag.id}
                      onSelect={() => handleSelectTag(tag.id)}
                      className="flex items-center gap-2"
                    >
                      {tag.name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-9 text-sm text-blue-light hover:text-blue hover:bg-blue-light/10"
          onClick={onAddTagClick}
        >
          Cadastrar Nova Tag
        </Button>
      </div>
    </div>
  );
};
