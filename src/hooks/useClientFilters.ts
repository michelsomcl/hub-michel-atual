
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
    
    // Apply tag filter - ensure we're properly checking the client's tags array
    if (tagId) {
      console.log("Filtering by tag ID:", tagId);
      filtered = filtered.filter(client => {
        const hasTag = client.tags && client.tags.some(tag => tag.id === tagId);
        console.log(`Client ${client.name} has tag ${tagId}:`, hasTag, client.tags);
        return hasTag;
      });
    }
    
    // Apply level filter
    if (level) {
      filtered = filtered.filter(client => client.level === level);
    }
    
    console.log("Filtered clients:", filtered.length);
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
    console.log("Tag changed to:", tagId);
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
