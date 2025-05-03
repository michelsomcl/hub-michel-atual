
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface SearchBarProps {
  onSearch: (term: string) => void;
  placeholder?: string;
}

export const SearchBar = ({ onSearch, placeholder = "Buscar..." }: SearchBarProps) => {
  const [searchTerm, setSearchTerm] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchTerm);
  };

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-md gap-2">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
        <Input
          type="search"
          placeholder={placeholder}
          className="pl-10 w-full"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <Button type="submit" className="btn-primary">Buscar</Button>
    </form>
  );
};
