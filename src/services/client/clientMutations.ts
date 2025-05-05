
import { supabase } from "../baseService";
import { Client } from "../../types";
import { getClientWithRelations } from "./clientQueries";

/**
 * Creates or updates a client and their relationships
 */
export const saveClient = async (client: Client): Promise<Client | null> => {
  try {
    console.log("Salvando cliente:", client);
    console.log("Tags do cliente:", client.tags);
    
    // Prepare client data for Supabase
    const clientData = {
      id: client.id,
      name: client.name,
      phone: client.phone,
      source: client.source,
      level: client.level
      // created_at and updated_at are managed by the database
    };

    // Insert or update the client
    const { data: savedClient, error } = await supabase
      .from('clients')
      .upsert(clientData)
      .select()
      .single();

    if (error) {
      console.error('Erro ao salvar cliente:', error);
      return null;
    }

    console.log("Cliente salvo com sucesso:", savedClient);

    // If this is an update, clear existing tag relationships before recreating
    if (client.id) {
      // We'll only delete tags, not services and tasks
      const { error: deleteTagsError } = await supabase
        .from('client_tags')
        .delete()
        .eq('client_id', client.id);

      if (deleteTagsError) {
        console.error('Erro ao limpar tags do cliente:', deleteTagsError);
      } else {
        console.log("Tags antigas removidas com sucesso");
      }
    }

    // Save related tags
    if (client.tags && client.tags.length > 0) {
      console.log("Salvando tags relacionadas:", client.tags);
      
      const clientTagsData = client.tags.map(tag => ({
        client_id: savedClient.id,
        tag_id: tag.id
      }));

      const { data: insertedTags, error: tagsError } = await supabase
        .from('client_tags')
        .insert(clientTagsData)
        .select();

      if (tagsError) {
        console.error('Erro ao salvar tags do cliente:', tagsError);
      } else {
        console.log("Tags relacionadas salvas com sucesso:", insertedTags);
      }
    }

    // Return the updated client with all relations
    return getClientWithRelations(savedClient.id);
  } catch (error) {
    console.error('Erro ao salvar cliente:', error);
    return null;
  }
};

/**
 * Deletes a client and all related data
 */
export const deleteClient = async (clientId: string): Promise<boolean> => {
  try {
    // Delete client (all relations will be deleted due to ON DELETE CASCADE)
    const { error } = await supabase
      .from('clients')
      .delete()
      .eq('id', clientId);

    if (error) {
      console.error('Erro ao excluir cliente:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Erro ao excluir cliente:', error);
    return false;
  }
};
