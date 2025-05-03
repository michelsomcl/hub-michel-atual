
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ClientDetailsHeaderProps {
  title?: string;
}

export const ClientDetailsHeader = ({ title }: ClientDetailsHeaderProps) => {
  const navigate = useNavigate();

  return (
    <div>
      <Button 
        variant="ghost" 
        onClick={() => navigate("/clients")}
        className="flex items-center gap-1 mb-4"
      >
        <ArrowLeft size={16} />
        Voltar para a lista de clientes
      </Button>
      
      {title && <h1 className="text-2xl font-semibold">{title}</h1>}
    </div>
  );
};
