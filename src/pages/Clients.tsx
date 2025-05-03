
import React, { useState, useEffect } from "react";
import { Layout } from "../components/Layout";
import { ClientList } from "../components/ClientList";
import { useSearchParams } from "react-router-dom";
import { ClientsHeader } from "../components/ClientsHeader";
import { ClientFilters } from "../components/ClientFilters";
import { useClientFilters } from "../hooks/useClientFilters";
import { getClients, getTags } from "../services/localStorage";
import { Client } from "../types";

const Clients = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [clients, setClients] = useState<Client[]>([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Load clients and tags from Supabase when component mounts
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const loadedClients = await getClients();
        const loadedTags = await getTags();
        setClients(loadedClients);
        setTags(loadedTags);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);
  
  const {
    filteredClients,
    searchTerm,
    selectedTagId,
    selectedLevel,
    handleSearch,
    handleTagChange,
    handleLevelChange,
    clearFilters
  } = useClientFilters(
    clients, 
    searchParams.get("search"), 
    searchParams.get("tag")
  );
  
  const onSearch = (term: string) => {
    const newTerm = handleSearch(term);
    
    // Update URL
    if (newTerm) {
      searchParams.set("search", newTerm);
    } else {
      searchParams.delete("search");
    }
    setSearchParams(searchParams);
  };
  
  const onTagChange = (tagId: string | null) => {
    const newTagId = handleTagChange(tagId);
    
    // Update URL
    if (newTagId) {
      searchParams.set("tag", newTagId);
    } else {
      searchParams.delete("tag");
    }
    setSearchParams(searchParams);
  };
  
  const onClearFilters = () => {
    clearFilters();
    searchParams.delete("search");
    searchParams.delete("tag");
    setSearchParams(searchParams);
  };
  
  return (
    <Layout>
      <div className="space-y-8">
        <ClientsHeader />
        
        <ClientFilters
          searchTerm={searchTerm}
          selectedTagId={selectedTagId}
          selectedLevel={selectedLevel}
          tags={tags}
          onSearch={onSearch}
          onTagChange={onTagChange}
          onLevelChange={handleLevelChange}
          clearFilters={onClearFilters}
        />
        
        <div>
          {loading ? (
            <div className="flex justify-center py-10">
              <p className="text-muted-foreground">Carregando clientes...</p>
            </div>
          ) : (
            <ClientList 
              clients={filteredClients}
              onClientDeleted={async () => {
                // Reload clients after deletion
                const updatedClients = await getClients();
                setClients(updatedClients);
              }} 
            />
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Clients;
