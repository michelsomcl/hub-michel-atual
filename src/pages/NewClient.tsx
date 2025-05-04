
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "../components/Layout";
import { ClientForm } from "../components/ClientForm";
import { Client, Tag } from "../types";
import { toast } from "@/hooks/use-toast";
import { saveClient, getTags, saveTag } from "../services/supabaseClient";
import { generateId } from "../lib/utils";

const NewClient = () => {
  const navigate = useNavigate();
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Carregar tags disponíveis quando o componente montar
  useEffect(() => {
    const loadTags = async () => {
      try {
        setIsLoading(true);
        const tagsData = await getTags();
        setAvailableTags(tagsData);
      } catch (error) {
        console.error("Erro ao carregar tags:", error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar as tags. Tente novamente.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadTags();
  }, []);

  const handleSubmit = async (client: Client) => {
    try {
      // Garantir que o cliente tenha um ID
      const clientWithId: Client = {
        ...client,
        id: generateId(),
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      // Salvar o cliente
      const savedClient = await saveClient(clientWithId);
      
      if (!savedClient) {
        throw new Error("Erro ao salvar cliente");
      }
      
      toast({
        title: "Cliente adicionado",
        description: "O cliente foi adicionado com sucesso."
      });
      
      navigate("/clients");
    } catch (error) {
      console.error("Erro ao adicionar cliente:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao cadastrar o cliente",
        variant: "destructive"
      });
    }
  };
  
  const handleCreateTag = async (tag: Tag) => {
    try {
      // Garantir que a tag tenha um ID
      const tagWithId: Tag = {
        ...tag,
        id: generateId(),
        createdAt: new Date()
      };
      
      // Salvar a tag
      const savedTag = await saveTag(tagWithId);
      
      if (!savedTag) {
        throw new Error("Erro ao criar tag");
      }
      
      // Atualizar lista local de tags
      setAvailableTags(prev => [...prev, savedTag]);
      
      toast({
        title: "Tag criada",
        description: `A tag "${tag.name}" foi criada com sucesso.`
      });
      
      return savedTag;
    } catch (error) {
      console.error("Erro ao criar tag:", error);
      toast({
        title: "Erro",
        description: "Não foi possível criar a tag. Tente novamente.",
        variant: "destructive"
      });
      return null;
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
          />
        </div>
      </div>
    </Layout>
  );
};

export default NewClient;
