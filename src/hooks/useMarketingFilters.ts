
import { useState, useEffect } from "react";
import { MarketingMessage } from "../services/marketingService";

interface MarketingFilters {
  name: string;
  firstName: string;
  phone: string;
  selectedTagId: string | null;
  hasMessage: string | null;
}

export const useMarketingFilters = (messages: MarketingMessage[]) => {
  const [filters, setFilters] = useState<MarketingFilters>({
    name: "",
    firstName: "",
    phone: "",
    selectedTagId: null,
    hasMessage: null,
  });

  const [filteredMessages, setFilteredMessages] = useState<MarketingMessage[]>(messages);

  const applyFilters = () => {
    let filtered = [...messages];

    // Filtro por nome completo
    if (filters.name) {
      filtered = filtered.filter(msg => 
        msg.client?.name?.toLowerCase().includes(filters.name.toLowerCase()) || false
      );
    }

    // Filtro por primeiro nome
    if (filters.firstName) {
      filtered = filtered.filter(msg => 
        msg.first_name.toLowerCase().includes(filters.firstName.toLowerCase())
      );
    }

    // Filtro por telefone
    if (filters.phone) {
      filtered = filtered.filter(msg => 
        msg.phone.includes(filters.phone)
      );
    }

    // Filtro por tags
    if (filters.selectedTagId === "no-tags") {
      filtered = filtered.filter(msg => !msg.tags || msg.tags.length === 0);
    } else if (filters.selectedTagId) {
      filtered = filtered.filter(msg => 
        msg.tags && msg.tags.some(tag => tag.id === filters.selectedTagId)
      );
    }

    // Filtro por mensagem
    if (filters.hasMessage === "with-message") {
      filtered = filtered.filter(msg => msg.message && msg.message.trim() !== "");
    } else if (filters.hasMessage === "without-message") {
      filtered = filtered.filter(msg => !msg.message || msg.message.trim() === "");
    }

    setFilteredMessages(filtered);
  };

  useEffect(() => {
    applyFilters();
  }, [messages, filters]);

  const handleFilterChange = (key: string, value: string | null) => {
    setFilters(prev => ({
      ...prev,
      [key]: value || ""
    }));
  };

  const clearFilters = () => {
    setFilters({
      name: "",
      firstName: "",
      phone: "",
      selectedTagId: null,
      hasMessage: null,
    });
  };

  return {
    filters,
    filteredMessages,
    handleFilterChange,
    clearFilters,
  };
};
