
import React from "react";
import { ClientList } from "../ClientList";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { Client } from "../../types";

interface FilteredClientsListProps {
  activeFilter: string | null;
  filteredClients: Client[];
  filterTitle: string;
  onClearFilter: () => void;
}

export const FilteredClientsList = ({
  activeFilter,
  filteredClients,
  filterTitle,
  onClearFilter
}: FilteredClientsListProps) => {
  if (!activeFilter) return null;
  
  return (
    <div className="bg-white p-4 rounded-lg border">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <span>{filterTitle}</span>
          <Badge variant="outline" className="ml-2">
            {filteredClients.length} {filteredClients.length === 1 ? 'resultado' : 'resultados'}
          </Badge>
        </h2>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onClearFilter}
          className="text-sm flex items-center gap-1"
        >
          <X size={16} />
          Limpar filtro
        </Button>
      </div>
      
      <ClientList clients={filteredClients} />
    </div>
  );
};
