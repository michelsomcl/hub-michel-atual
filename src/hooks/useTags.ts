
import { useState, useEffect } from 'react';
import { Tag } from '../types';
import { supabase } from '../integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { generateId } from '../lib/utils';

export const useTags = () => {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);

  const loadTags = async () => {
    try {
      const { data, error } = await supabase
        .from('tags')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;

      const formattedTags: Tag[] = data.map(tag => ({
        id: tag.id,
        name: tag.name,
        createdAt: new Date(tag.created_at)
      }));

      setTags(formattedTags);
    } catch (error) {
      console.error('Error loading tags:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar as tags.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTags();
  }, []);

  const createTag = async (tag: Tag): Promise<Tag | null> => {
    try {
      // Ensure tag has a valid UUID
      const tagId = tag.id || generateId();
      
      const { data, error } = await supabase
        .from('tags')
        .insert({
          id: tagId,
          name: tag.name,
          created_at: tag.createdAt.toISOString()
        })
        .select();

      if (error) throw error;

      const newTag: Tag = {
        id: data[0].id,
        name: data[0].name,
        createdAt: new Date(data[0].created_at)
      };

      setTags(prev => [...prev, newTag]);
      return newTag;
    } catch (error) {
      console.error('Error creating tag:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível criar a tag.',
        variant: 'destructive'
      });
      return null;
    }
  };

  const updateTag = async (updatedTag: Tag): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('tags')
        .update({
          name: updatedTag.name,
        })
        .eq('id', updatedTag.id);

      if (error) throw error;

      setTags(prev => prev.map(tag => 
        tag.id === updatedTag.id ? updatedTag : tag
      ));
      
      return true;
    } catch (error) {
      console.error('Error updating tag:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar a tag.',
        variant: 'destructive'
      });
      return false;
    }
  };

  const deleteTag = async (tagId: string): Promise<boolean> => {
    try {
      // First, remove all client associations
      const { error: relError } = await supabase
        .from('client_tags')
        .delete()
        .eq('tag_id', tagId);

      if (relError) throw relError;

      // Then delete the tag
      const { error } = await supabase
        .from('tags')
        .delete()
        .eq('id', tagId);

      if (error) throw error;

      setTags(prev => prev.filter(tag => tag.id !== tagId));
      return true;
    } catch (error) {
      console.error('Error deleting tag:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir a tag.',
        variant: 'destructive'
      });
      return false;
    }
  };

  return {
    tags,
    loading,
    createTag,
    updateTag,
    deleteTag,
    refreshTags: loadTags
  };
};
