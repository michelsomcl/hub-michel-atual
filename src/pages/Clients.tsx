
import React, { useState, useEffect } from "react";
import { Layout } from "../components/Layout";
import { ClientsHeader } from "../components/ClientsHeader";
import { ClientFilters } from "../components/ClientFilters";
import { ClientList } from "../components/ClientList";
import { Client, Tag } from "../types";
import { getClients, getTags } from "../services/supabaseClient";
import { useSearchParams } from "react-router-dom";
import { useClientFilters } from "../hooks/useClientFilters";
import { toast } from "@/components/ui/use-toast";

const Clients = () => {
  const [searchParams] = useSearchParams();
  const [clients, setClients] = useState<Client[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Obtém os valores iniciais dos parâmetros de busca
  const initialSearch = searchParams.get("search");
  const initialTagId = searchParams.get("tag");
  
  // Usando o custom hook para filtrar os clientes
  const {
    filteredClients,
    searchTerm,
    selectedTagId,
    selectedLevel,
    handleSearch,
    handleTagChange,
    handleLevelChange,
    clearFilters
  } = useClientFilters(clients, initialSearch, initialTagId);

  // Buscar clientes e tags quando o componente montar
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Carregar clientes
        const clientsData = await getClients();
        setClients(clientsData);
        
        // Carregar tags
        const tagsData = await getTags();
        setTags(tagsData);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os dados. Tente novamente.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  return (
    <Layout>
      <div className="space-y-6">
        <ClientsHeader />
        
        <ClientFilters
          tags={tags}
          searchTerm={searchTerm}
          selectedTagId={selectedTagId}
          selectedLevel={selectedLevel}
          onSearch={handleSearch}
          onTagChange={handleTagChange}
          onLevelChange={handleLevelChange}
          clearFilters={clearFilters} // Corrigido de onClearFilters para clearFilters
          isLoading={isLoading}
        />
        
        <ClientList clients={filteredClients} />
      </div>
    </Layout>
  );
};

export default Clients;
