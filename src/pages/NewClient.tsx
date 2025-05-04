
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "../components/Layout";
import { ClientForm } from "../components/ClientForm";
import { Client, Tag } from "../types";
import { toast } from "@/hooks/use-toast";
import { supabase } from "../integrations/supabase/client";
import { useTags } from "../hooks/useTags";
import { generateId } from "../lib/utils";

const NewClient = () => {
  const navigate = useNavigate();
  const { tags, createTag } = useTags();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (client: Client) => {
    setIsLoading(true);
    try {
      // Ensure client has a valid UUID
      const clientId = client.id;
      
      console.log("Creating client with ID:", clientId);
      console.log("Client data:", client);

      // Insert client into Supabase
      const { data, error: clientError } = await supabase
        .from("clients")
        .insert({
          id: clientId,
          name: client.name,
          phone: client.phone,
          source: client.source,
          level: client.level,
          created_at: client.createdAt.toISOString(),
          updated_at: client.updatedAt.toISOString(),
        })
        .select();

      if (clientError) {
        console.error("Error inserting client:", clientError);
        throw clientError;
      }

      console.log("Client created:", data);

      // Handle tags if present
      if (client.tags.length > 0) {
        const client_tags = client.tags.map(tag => ({
          client_id: clientId,
          tag_id: tag.id
        }));

        const { error: tagsError } = await supabase
          .from("client_tags")
          .insert(client_tags);

        if (tagsError) {
          console.error("Error inserting client tags:", tagsError);
          throw tagsError;
        }
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
        description: "Ocorreu um erro ao adicionar o cliente.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleCreateTag = async (tag: Tag) => {
    await createTag(tag);
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
            availableTags={tags}
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
