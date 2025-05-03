
import React from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const ClientsHeader = () => {
  const navigate = useNavigate();
  
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold">Clientes</h1>
        <p className="text-muted-foreground">
          Gerencie seus clientes e leads
        </p>
      </div>
      
      <Button 
        className="btn-primary" 
        onClick={() => navigate("/clients/new")}
      >
        <Plus size={16} className="mr-2" />
        Novo Cliente
      </Button>
    </div>
  );
};
