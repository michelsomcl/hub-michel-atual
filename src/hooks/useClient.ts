
import { useState } from "react";
import { Client, ServiceHistory, Task, Tag } from "../types";
import { toast } from "@/hooks/use-toast";
import { supabase } from "../integrations/supabase/client";

export const useClient = (initialClient?: Client | null) => {
  const [client, setClient] = useState<Client | null>(initialClient || null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchClient = async (clientId: string): Promise<Client | null> => {
    setLoading(true);
    try {
      // Get client data
      const { data: clientData, error: clientError } = await supabase
        .from("clients")
        .select("*")
        .eq("id", clientId)
        .single();

      if (clientError) throw clientError;

      if (!clientData) {
        return null;
      }

      // Get service history
      const { data: serviceHistoryData } = await supabase
        .from("service_history")
        .select("*")
        .eq("client_id", clientId);

      // Get tasks
      const { data: tasksData } = await supabase
        .from("tasks")
        .select("*")
        .eq("client_id", clientId);

      // Get client tags
      const { data: clientTagsData } = await supabase
        .from("client_tags")
        .select("tag_id")
        .eq("client_id", clientId);

      // Get actual tag objects
      const tagIds = clientTagsData?.map(ct => ct.tag_id) || [];
      let tagsData: Tag[] = [];
      
      if (tagIds.length > 0) {
        const { data: tags } = await supabase
          .from("tags")
          .select("*")
          .in("id", tagIds);
        
        tagsData = tags?.map(tag => ({
          id: tag.id,
          name: tag.name,
          createdAt: new Date(tag.created_at)
        })) || [];
      }

      // Construct the complete client object
      const completeClient: Client = {
        id: clientData.id,
        name: clientData.name,
        phone: clientData.phone,
        source: clientData.source,
        level: clientData.level,
        createdAt: new Date(clientData.created_at),
        updatedAt: new Date(clientData.updated_at),
        serviceHistory: serviceHistoryData?.map((sh) => ({
          id: sh.id,
          clientId: sh.client_id,
          date: new Date(sh.date),
          observations: sh.observations,
          createdAt: new Date(sh.created_at),
        })) || [],
        tasks: tasksData?.map((task) => ({
          id: task.id,
          clientId: task.client_id,
          description: task.description,
          completed: task.completed,
          createdAt: new Date(task.created_at),
          dueDate: task.due_date ? new Date(task.due_date) : undefined,
        })) || [],
        tags: tagsData,
      };

      setClient(completeClient);
      return completeClient;
    } catch (error) {
      console.error("Error fetching client:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao carregar os dados do cliente.",
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateClient = async (updatedClient: Client): Promise<boolean> => {
    setSaving(true);
    try {
      // Update the client record
      const { error: clientError } = await supabase
        .from("clients")
        .update({
          name: updatedClient.name,
          phone: updatedClient.phone,
          source: updatedClient.source,
          level: updatedClient.level,
          updated_at: new Date().toISOString(),
        })
        .eq("id", updatedClient.id);

      if (clientError) throw clientError;

      // Handle tags - first remove all client_tags
      const { error: deleteTagsError } = await supabase
        .from("client_tags")
        .delete()
        .eq("client_id", updatedClient.id);

      if (deleteTagsError) throw deleteTagsError;

      // Then add all current tags
      if (updatedClient.tags.length > 0) {
        const client_tags = updatedClient.tags.map(tag => ({
          client_id: updatedClient.id,
          tag_id: tag.id
        }));

        const { error: addTagsError } = await supabase
          .from("client_tags")
          .insert(client_tags);

        if (addTagsError) throw addTagsError;
      }

      // Update the client in state
      setClient(updatedClient);
      
      return true;
    } catch (error) {
      console.error("Error updating client:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao atualizar o cliente.",
        variant: "destructive",
      });
      return false;
    } finally {
      setSaving(false);
    }
  };

  const addServiceHistory = async (history: ServiceHistory): Promise<boolean> => {
    if (!client) return false;
    
    setSaving(true);
    try {
      // Save service history to Supabase
      const { error } = await supabase
        .from("service_history")
        .insert({
          id: history.id,
          client_id: history.clientId,
          date: history.date.toISOString(),
          observations: history.observations,
          created_at: history.createdAt.toISOString(),
        });

      if (error) throw error;

      // Update client in state
      const updatedClient = {
        ...client,
        serviceHistory: [...client.serviceHistory, history],
        updatedAt: new Date(),
      };
      
      setClient(updatedClient);
      
      // Update the client's updated_at in Supabase
      await supabase
        .from("clients")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", client.id);
      
      return true;
    } catch (error) {
      console.error("Erro ao registrar atendimento:", error);
      return false;
    } finally {
      setSaving(false);
    }
  };

  const addTask = async (task: Task): Promise<boolean> => {
    if (!client) return false;
    
    setSaving(true);
    try {
      // Save task to Supabase
      const { error } = await supabase
        .from("tasks")
        .insert({
          id: task.id,
          client_id: task.clientId,
          description: task.description,
          completed: task.completed,
          due_date: task.dueDate?.toISOString() || null,
          created_at: task.createdAt.toISOString(),
        });

      if (error) throw error;

      // Update client in state
      const updatedClient = {
        ...client,
        tasks: [...client.tasks, task],
        updatedAt: new Date(),
      };
      
      setClient(updatedClient);
      
      // Update the client's updated_at in Supabase
      await supabase
        .from("clients")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", client.id);
      
      return true;
    } catch (error) {
      console.error("Erro ao adicionar tarefa:", error);
      return false;
    } finally {
      setSaving(false);
    }
  };

  const updateTaskStatus = async (taskId: string, completed: boolean): Promise<boolean> => {
    if (!client) return false;
    
    setSaving(true);
    try {
      // Update task in Supabase
      const { error } = await supabase
        .from("tasks")
        .update({ completed })
        .eq("id", taskId);

      if (error) throw error;

      // Update client in state
      const updatedTasks = client.tasks.map(task => 
        task.id === taskId ? { ...task, completed } : task
      );
      
      const updatedClient = {
        ...client,
        tasks: updatedTasks,
        updatedAt: new Date(),
      };
      
      setClient(updatedClient);
      
      // Update the client's updated_at in Supabase
      await supabase
        .from("clients")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", client.id);
      
      return true;
    } catch (error) {
      console.error("Erro ao atualizar tarefa:", error);
      return false;
    } finally {
      setSaving(false);
    }
  };

  return {
    client,
    setClient,
    loading,
    saving,
    fetchClient,
    updateClient,
    addServiceHistory,
    addTask,
    updateTaskStatus
  };
};
