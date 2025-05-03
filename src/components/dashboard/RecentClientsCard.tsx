
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link, useNavigate } from "react-router-dom";
import { Client } from "../../types";

interface RecentClientsCardProps {
  recentClients: Client[];
}

export const RecentClientsCard = ({ recentClients }: RecentClientsCardProps) => {
  const navigate = useNavigate();
  
  return (
    <Card className="border card-hover">
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Clientes Recentes</h2>
          <Link to="/clients" className="text-primary hover:underline text-sm">
            Ver todos
          </Link>
        </div>
        
        <div className="space-y-4">
          {recentClients.map(client => (
            <div 
              key={client.id} 
              className="flex justify-between items-center p-3 bg-muted/40 rounded-md cursor-pointer hover:bg-muted"
              onClick={() => navigate(`/clients/${client.id}`)}
            >
              <div>
                <div className="font-medium">{client.name}</div>
                <div className="text-sm text-muted-foreground">
                  {client.level === "Lead" ? "Lead" : "Cliente"}
                </div>
              </div>
              <div className="flex space-x-2">
                {client.tags.map(tag => (
                  <Badge key={tag.id} className="bg-primary">
                    {tag.name}
                  </Badge>
                ))}
              </div>
            </div>
          ))}
          
          {recentClients.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Nenhum cliente cadastrado</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
