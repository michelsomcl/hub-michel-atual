
import React from "react";
import { SearchBar } from "./SearchBar";
import { Tag } from "../types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ClientFiltersProps {
  searchTerm: string;
  selectedTagId: string | null;
  selectedLevel: string | null;
  tags: Tag[];
  onSearch: (term: string) => void;
  onTagChange: (tagId: string | null) => void;
  onLevelChange: (level: string | null) => void;
  clearFilters: () => void;
}

export const ClientFilters = ({
  searchTerm,
  selectedTagId,
  selectedLevel,
  tags,
  onSearch,
  onTagChange,
  onLevelChange,
  clearFilters,
}: ClientFiltersProps) => {
  return (
    <div className="bg-white p-4 rounded-lg border">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <SearchBar
            onSearch={onSearch}
            placeholder="Buscar clientes por nome..."
          />
        </div>
        
        <div className="flex gap-2">
          <Select 
            value={selectedTagId || "all-tags"} 
            onValueChange={value => onTagChange(value === "all-tags" ? null : value)}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filtrar por tag" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-tags">Todas as tags</SelectItem>
              {tags.map(tag => (
                <SelectItem key={tag.id} value={tag.id}>
                  <div className="flex items-center gap-2">
                    <span 
                      className="w-2 h-2 rounded-full bg-primary" 
                    />
                    {tag.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select 
            value={selectedLevel || "all-levels"} 
            onValueChange={value => onLevelChange(value === "all-levels" ? null : value)}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filtrar por nível" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-levels">Todos os níveis</SelectItem>
              <SelectItem value="Lead">Lead</SelectItem>
              <SelectItem value="Cliente">Cliente</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {(searchTerm || selectedTagId || selectedLevel) && (
        <div className="mt-4 flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Filtros ativos:</span>
          
          {searchTerm && (
            <Badge variant="outline" className="flex items-center gap-1">
              Busca: {searchTerm}
            </Badge>
          )}
          
          {selectedTagId && (
            <Badge className="bg-primary text-white">
              {tags.find(t => t.id === selectedTagId)?.name}
            </Badge>
          )}
          
          {selectedLevel && (
            <Badge variant="outline">
              Nível: {selectedLevel}
            </Badge>
          )}
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={clearFilters}
            className="text-sm h-7"
          >
            Limpar filtros
          </Button>
        </div>
      )}
    </div>
  );
};
