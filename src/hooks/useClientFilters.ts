
import { useState, useEffect } from "react";
import { Client } from "../types";

export const useClientFilters = (
  clients: Client[],
  initialSearch: string | null,
  initialTagId: string | null
) => {
  const [filteredClients, setFilteredClients] = useState<Client[]>(clients);
  const [searchTerm, setSearchTerm] = useState(initialSearch || "");
  const [selectedTagId, setSelectedTagId] = useState<string | null>(initialTagId);
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  
  const applyFilters = (search: string, tagId: string | null, level: string | null) => {
    let filtered = [...clients];
    
    // Apply search filter
    if (search) {
      filtered = filtered.filter(client => 
        client.name.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    // Apply tag filter
    if (tagId) {
      filtered = filtered.filter(client => 
        client.tags.some(tag => tag.id === tagId)
      );
    }
    
    // Apply level filter
    if (level) {
      filtered = filtered.filter(client => client.level === level);
    }
    
    setFilteredClients(filtered);
  };

  useEffect(() => {
    applyFilters(searchTerm, selectedTagId, selectedLevel);
  }, [clients, searchTerm, selectedTagId, selectedLevel]);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    return term;
  };
  
  const handleTagChange = (tagId: string | null) => {
    setSelectedTagId(tagId);
    return tagId;
  };
  
  const handleLevelChange = (level: string | null) => {
    setSelectedLevel(level);
  };
  
  const clearFilters = () => {
    setSearchTerm("");
    setSelectedTagId(null);
    setSelectedLevel(null);
  };

  return {
    filteredClients,
    searchTerm,
    selectedTagId,
    selectedLevel,
    handleSearch,
    handleTagChange,
    handleLevelChange,
    clearFilters
  };
};
