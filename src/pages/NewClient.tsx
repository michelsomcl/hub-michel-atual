
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "../components/Layout";
import { ClientForm } from "../components/ClientForm";
import { Client, Tag } from "../types";
import { toast } from "@/hooks/use-toast";
import { getClients, saveClients, getTags } from "../services/localStorage";

const NewClient = () => {
  const navigate = useNavigate();
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);

  // Load tags from localStorage when component mounts
  useEffect(() => {
    const loadedTags = getTags();
    setAvailableTags(loadedTags);
  }, []);

  const handleSubmit = (client: Client) => {
    // Get current clients and add the new one
    const currentClients = getClients();
    saveClients([...currentClients, client]);
    
    toast({
      title: "Cliente adicionado",
      description: "O cliente foi adicionado com sucesso."
    });
    
    navigate("/clients");
  };
  
  const handleCreateTag = (tag: Tag) => {
    // Update state with new tag
    setAvailableTags(prevTags => [...prevTags, tag]);
    
    toast({
      title: "Tag criada",
      description: `A tag "${tag.name}" foi criada com sucesso.`
    });
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Novo Cliente</h1>
          <p className="text-muted-foreground">
            Preencha as informações para cadastrar um novo cliente.
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-lg border">
          <ClientForm 
            availableTags={availableTags}
            onSubmit={handleSubmit}
            onCreateTag={handleCreateTag}
          />
        </div>
      </div>
    </Layout>
  );
};

export default NewClient;
