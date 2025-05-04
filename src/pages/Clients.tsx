
import React, { useState, useEffect } from "react";
import { Layout } from "../components/Layout";
import { ClientList } from "../components/ClientList";
import { useSearchParams } from "react-router-dom";
import { ClientsHeader } from "../components/ClientsHeader";
import { ClientFilters } from "../components/ClientFilters";
import { useClientFilters } from "../hooks/useClientFilters";
import { getClients, getTags } from "../services/localStorage";

const Clients = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [clients, setClients] = useState(getClients());
  const [tags, setTags] = useState(getTags());
  
  // Refresh tags from localStorage when component mounts
  useEffect(() => {
    const loadedTags = getTags();
    setTags(loadedTags);
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
          <ClientList clients={filteredClients} />
        </div>
      </div>
    </Layout>
  );
};

export default Clients;
