
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
  const [isLoading, setIsLoading] = useState(false);

  // Load tags from Supabase when component mounts
  useEffect(() => {
    const loadTags = async () => {
      const loadedTags = await getTags();
      setAvailableTags(loadedTags);
    };
    loadTags();
  }, []);

  const handleSubmit = async (client: Client) => {
    setIsLoading(true);
    try {
      // Get current clients and add the new one
      const currentClients = await getClients();
      await saveClients([...currentClients, client]);
      
      toast({
        title: "Cliente adicionado",
        description: "O cliente foi adicionado com sucesso."
      });
      
      navigate("/clients");
    } catch (error) {
      console.error("Erro ao adicionar cliente:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao adicionar o cliente.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleCreateTag = async (tag: Tag) => {
    try {
      // Update state with new tag
      setAvailableTags(prevTags => [...prevTags, tag]);
      
      // Save to Supabase (local state is already updated)
      await saveTags([...availableTags, tag]);
      
      toast({
        title: "Tag criada",
        description: `A tag "${tag.name}" foi criada com sucesso.`
      });
    } catch (error) {
      console.error("Erro ao criar tag:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao criar a tag.",
        variant: "destructive"
      });
    }
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
            isLoading={isLoading}
          />
        </div>
      </div>
    </Layout>
  );
};

export default NewClient;
