
import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tag } from "../types";
import { X, Filter } from "lucide-react";

interface MarketingFiltersProps {
  filters: {
    name: string;
    firstName: string;
    phone: string;
    selectedTagId: string | null;
    hasMessage: string | null;
  };
  tags: Tag[];
  onFilterChange: (key: string, value: string | null) => void;
  onClearFilters: () => void;
}

export const MarketingFilters = ({
  filters,
  tags,
  onFilterChange,
  onClearFilters,
}: MarketingFiltersProps) => {
  const hasActiveFilters = Object.values(filters).some(value => value !== "" && value !== null);

  return (
    <div className="bg-white p-4 rounded-lg border space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Filter className="h-4 w-4" />
        <h3 className="text-sm font-medium">Filtros</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">
            Nome Completo
          </label>
          <Input
            placeholder="Filtrar por nome..."
            value={filters.name}
            onChange={(e) => onFilterChange("name", e.target.value)}
          />
        </div>

        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">
            Primeiro Nome
          </label>
          <Input
            placeholder="Filtrar por primeiro nome..."
            value={filters.firstName}
            onChange={(e) => onFilterChange("firstName", e.target.value)}
          />
        </div>

        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">
            Telefone
          </label>
          <Input
            placeholder="Filtrar por telefone..."
            value={filters.phone}
            onChange={(e) => onFilterChange("phone", e.target.value)}
          />
        </div>

        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">
            Tags
          </label>
          <Select 
            value={filters.selectedTagId || "all-tags"} 
            onValueChange={value => onFilterChange("selectedTagId", value === "all-tags" ? null : value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Todas as tags" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-tags">Todas as tags</SelectItem>
              <SelectItem value="no-tags">Sem tags</SelectItem>
              {tags.map(tag => (
                <SelectItem key={tag.id} value={tag.id}>
                  {tag.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">
            Mensagem
          </label>
          <Select 
            value={filters.hasMessage || "all-messages"} 
            onValueChange={value => onFilterChange("hasMessage", value === "all-messages" ? null : value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Todas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-messages">Todas</SelectItem>
              <SelectItem value="with-message">Com mensagem</SelectItem>
              <SelectItem value="without-message">Sem mensagem</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {hasActiveFilters && (
        <div className="flex items-center gap-2 pt-2 border-t">
          <span className="text-sm text-muted-foreground">Filtros ativos:</span>
          
          {filters.name && (
            <Badge variant="outline" className="flex items-center gap-1">
              Nome: {filters.name}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => onFilterChange("name", "")}
              />
            </Badge>
          )}
          
          {filters.firstName && (
            <Badge variant="outline" className="flex items-center gap-1">
              Primeiro: {filters.firstName}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => onFilterChange("firstName", "")}
              />
            </Badge>
          )}
          
          {filters.phone && (
            <Badge variant="outline" className="flex items-center gap-1">
              Telefone: {filters.phone}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => onFilterChange("phone", "")}
              />
            </Badge>
          )}
          
          {filters.selectedTagId && (
            <Badge className="bg-primary text-white flex items-center gap-1">
              {filters.selectedTagId === "no-tags" ? "Sem tags" : 
                tags.find(t => t.id === filters.selectedTagId)?.name}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => onFilterChange("selectedTagId", null)}
              />
            </Badge>
          )}
          
          {filters.hasMessage && (
            <Badge variant="outline" className="flex items-center gap-1">
              {filters.hasMessage === "with-message" ? "Com mensagem" : "Sem mensagem"}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => onFilterChange("hasMessage", null)}
              />
            </Badge>
          )}
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClearFilters}
            className="text-sm h-7"
          >
            Limpar todos
          </Button>
        </div>
      )}
    </div>
  );
};
