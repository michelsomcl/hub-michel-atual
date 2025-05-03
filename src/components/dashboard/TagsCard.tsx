
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { Tag } from "../../types";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface TagsCardProps {
  tags: Tag[];
}

export const TagsCard = ({ tags }: TagsCardProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  
  // Sort tags alphabetically and filter by search term
  const filteredTags = [...tags]
    .sort((a, b) => a.name.localeCompare(b.name))
    .filter(tag => tag.name.toLowerCase().includes(searchTerm.toLowerCase()));
  
  return (
    <Card className="border card-hover">
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Tags</h2>
          <Link to="/tags" className="text-primary hover:underline text-sm">
            Gerenciar
          </Link>
        </div>
        
        <div className="relative mb-4">
          <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          <Input 
            placeholder="Buscar tag..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        
        <div className="flex flex-wrap gap-2">
          {filteredTags.map((tag) => (
            <div key={tag.id} className="flex items-center">
              <Badge className="bg-primary">
                {tag.name}
              </Badge>
            </div>
          ))}
          
          {filteredTags.length === 0 && (
            <div className="text-center py-4 w-full">
              {tags.length === 0 ? (
                <p className="text-muted-foreground">Nenhuma tag cadastrada</p>
              ) : (
                <p className="text-muted-foreground">Nenhuma tag encontrada</p>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
