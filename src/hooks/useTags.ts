
import { useState, useEffect } from "react";
import { Tag } from "../types";
import { toast } from "@/hooks/use-toast";
import { supabase } from "../integrations/supabase/client";

export const useTags = () => {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchTags = async (): Promise<Tag[]> => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("tags")
        .select("*")
        .order("name");

      if (error) throw error;

      const formattedTags = data.map(tag => ({
        id: tag.id,
        name: tag.name,
        createdAt: new Date(tag.created_at)
      }));
      
      setTags(formattedTags);
      return formattedTags;
    } catch (error) {
      console.error("Error fetching tags:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao carregar as tags.",
        variant: "destructive"
      });
      return [];
    } finally {
      setLoading(false);
    }
  };

  const createTag = async (newTag: Tag): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from("tags")
        .insert({
          id: newTag.id,
          name: newTag.name,
          created_at: newTag.createdAt.toISOString()
        });

      if (error) throw error;

      // Update local state
      setTags(prev => [...prev, newTag].sort((a, b) => a.name.localeCompare(b.name)));
      
      return true;
    } catch (error) {
      console.error("Error creating tag:", error);
      return false;
    }
  };

  // Load tags on initial mount
  useEffect(() => {
    fetchTags();
  }, []);

  return { tags, loading, fetchTags, createTag };
};
