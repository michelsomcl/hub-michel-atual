
import React from "react";
import { Client, Task } from "../../types";
import { useNavigate } from "react-router-dom";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatPhoneNumber } from "../../lib/utils";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ClientWithTask extends Client {
  pendingTask?: Task;
}

interface FilteredClientsListProps {
  activeFilter: string | null;
  filteredClients: ClientWithTask[];
  filterTitle: string;
  onClearFilter: () => void;
}

export const FilteredClientsList = ({
  activeFilter,
  filteredClients,
  filterTitle,
  onClearFilter
}: FilteredClientsListProps) => {
  const navigate = useNavigate();
  
  if (!activeFilter) return null;
  
  const isPendingTasksFilter = activeFilter === 'pendingTasks';
  
  return (
    <div className="bg-white rounded-lg border shadow-sm">
      <div className="p-4 bg-muted/30 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-medium">
            {filterTitle}
          </span>
          <Badge variant="secondary">
            {filteredClients.length} {filteredClients.length === 1 ? "resultado" : "resultados"}
          </Badge>
        </div>
        <Button 
          variant="ghost" 
          size="icon"
          onClick={onClearFilter}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Nível</TableHead>
            <TableHead>Telefone</TableHead>
            <TableHead>Fonte</TableHead>
            <TableHead>Tags</TableHead>
            <TableHead>{isPendingTasksFilter ? "Vencimento" : "Cadastro"}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredClients.map((client) => (
            <TableRow 
              key={client.id}
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => navigate(`/clients/${client.id}`)}
            >
              <TableCell className="font-medium">{client.name}</TableCell>
              <TableCell>
                <Badge variant={client.level === "Cliente" ? "default" : "outline"}>
                  {client.level}
                </Badge>
              </TableCell>
              <TableCell>{formatPhoneNumber(client.phone)}</TableCell>
              <TableCell>{client.source}</TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {client.tags && client.tags.length > 0 ? (
                    client.tags.map((tag) => (
                      <Badge key={tag.id} variant="secondary" className="text-xs">
                        {tag.name}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-muted-foreground text-xs">Sem tags</span>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {isPendingTasksFilter && client.pendingTask?.dueDate
                  ? client.pendingTask.dueDate.toLocaleDateString()
                  : client.createdAt.toLocaleDateString()}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
