
import React from "react";
import { Layout } from "../components/Layout";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <Layout>
      <div className="flex flex-col items-center justify-center py-16 space-y-4 text-center">
        <h1 className="text-6xl font-bold text-blue">404</h1>
        <h2 className="text-2xl font-semibold">Página não encontrada</h2>
        <p className="text-muted-foreground max-w-md">
          A página que você está procurando não existe ou foi movida.
        </p>
        <Button 
          className="btn-primary mt-4" 
          onClick={() => navigate("/")}
        >
          Voltar para o Dashboard
        </Button>
      </div>
    </Layout>
  );
};

export default NotFound;
