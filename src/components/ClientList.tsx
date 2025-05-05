
import React from "react";
import { useNavigate } from "react-router-dom";
import { Client } from "../types";
import { Badge } from "@/components/ui/badge";
import { formatPhoneNumber } from "../lib/utils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Trash } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { deleteClient } from "../services/supabaseClient";

interface ClientListProps {
  clients: Client[];
  isLoading?: boolean;
}

export const ClientList = ({ clients, isLoading = false }: ClientListProps) => {
  const navigate = useNavigate();

  const handleDeleteClient = async (clientId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    
    if (!confirm("Tem certeza que deseja excluir este cliente?")) {
      return;
    }
    
    try {
      const success = await deleteClient(clientId);
      
      if (success) {
        // Mostrar mensagem de confirmação
        toast({
          title: "Cliente excluído",
          description: "O cliente foi excluído com sucesso."
        });
        
        // Forçar atualização da página para atualizar a lista
        window.location.reload();
      } else {
        throw new Error("Não foi possível excluir o cliente");
      }
    } catch (error) {
      console.error("Erro ao excluir cliente:", error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o cliente. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  // Ordenar clientes alfabeticamente por nome
  const sortedClients = [...clients].sort((a, b) => 
    a.name.localeCompare(b.name)
  );

  if (isLoading) {
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground">Carregando clientes...</p>
      </div>
    );
  }

  if (sortedClients.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground">Nenhum cliente encontrado</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Nível</TableHead>
            <TableHead>Telefone</TableHead>
            <TableHead>Fonte</TableHead>
            <TableHead>Tags</TableHead>
            <TableHead>Cadastro</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedClients.map((client) => (
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
                  {client.tags.map((tag) => (
                    <Badge key={tag.id} variant="secondary" className="text-xs">
                      {tag.name}
                    </Badge>
                  ))}
                </div>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {client.createdAt.toLocaleDateString()}
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem 
                      className="text-destructive focus:text-destructive cursor-pointer"
                      onClick={(e) => handleDeleteClient(client.id, e)}
                    >
                      <Trash className="mr-2 h-4 w-4" />
                      Excluir
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
