
import { supabase } from "../baseService";
import { Client } from "../../types";

/**
 * Fetches all clients with their related data (tags, tasks, service history)
 */
export const getClients = async (): Promise<Client[]> => {
  try {
    console.log("Starting to fetch clients data...");
    
    // Fetch all clients
    const { data: clients, error } = await supabase
      .from('clients')
      .select('*');

    if (error) {
      console.error('Erro ao buscar clientes:', error);
      return [];
    }

    console.log(`Retrieved ${clients.length} clients from database`);

    // Format clients with empty arrays for relations
    const formattedClients = clients.map((client: any) => ({
      id: client.id,
      name: client.name,
      phone: client.phone,
      source: client.source,
      level: client.level as 'Lead' | 'Cliente',
      createdAt: new Date(client.created_at),
      updatedAt: new Date(client.updated_at),
      serviceHistory: [],
      tasks: [],
      tags: []
    }));

    // Fetch all tags for later use
    const { data: allTags, error: tagsError } = await supabase
      .from('tags')
      .select('*');

    if (tagsError) {
      console.error('Erro ao buscar tags:', tagsError);
    } else {
      console.log(`Retrieved ${allTags.length} tags from database`);
    }

    // Fetch all client-tag relationships
    const { data: clientTags, error: clientTagsError } = await supabase
      .from('client_tags')
      .select('*');

    if (clientTagsError) {
      console.error('Erro ao buscar relações cliente-tag:', clientTagsError);
    } else if (clientTags && allTags) {
      console.log(`Retrieved ${clientTags.length} client-tag relationships`);
      
      // Map tags to each client
      clientTags.forEach((ct: any) => {
        const clientIndex = formattedClients.findIndex(c => c.id === ct.client_id);
        if (clientIndex !== -1) {
          const tag = allTags.find((t: any) => t.id === ct.tag_id);
          if (tag) {
            formattedClients[clientIndex].tags.push({
              id: tag.id,
              name: tag.name,
              createdAt: new Date(tag.created_at)
            });
          }
        }
      });
      
      // Logging for debug
      formattedClients.forEach(client => {
        console.log(`Client ${client.name} has ${client.tags.length} tags:`, 
          client.tags.map(tag => tag.name).join(', '));
      });
    }

    // Fetch all tasks
    const { data: tasks, error: tasksError } = await supabase
      .from('tasks')
      .select('*');

    if (tasksError) {
      console.error('Erro ao buscar tarefas:', tasksError);
    } else if (tasks) {
      console.log(`Retrieved ${tasks.length} tasks from database`);
      
      // Map tasks to each client
      tasks.forEach((task: any) => {
        const clientIndex = formattedClients.findIndex(c => c.id === task.client_id);
        if (clientIndex !== -1) {
          formattedClients[clientIndex].tasks.push({
            id: task.id,
            clientId: task.client_id,
            description: task.description,
            completed: task.completed,
            createdAt: new Date(task.created_at),
            dueDate: task.due_date ? new Date(task.due_date) : undefined
          });
        }
      });
    }

    // Fetch all service history
    const { data: serviceHistory, error: serviceHistoryError } = await supabase
      .from('service_history')
      .select('*');

    if (serviceHistoryError) {
      console.error('Erro ao buscar histórico de serviços:', serviceHistoryError);
    } else if (serviceHistory) {
      console.log(`Retrieved ${serviceHistory.length} service history entries from database`);
      
      // Map service history to each client
      serviceHistory.forEach((sh: any) => {
        const clientIndex = formattedClients.findIndex(c => c.id === sh.client_id);
        if (clientIndex !== -1) {
          formattedClients[clientIndex].serviceHistory.push({
            id: sh.id,
            clientId: sh.client_id,
            date: new Date(sh.date),
            observations: sh.observations,
            createdAt: new Date(sh.created_at)
          });
        }
      });
    }

    console.log("Finished preparing client data with all relations");
    return formattedClients;
  } catch (error) {
    console.error('Erro ao buscar clientes e relações:', error);
    return [];
  }
};

/**
 * Fetches a single client with all related data
 */
export const getClientWithRelations = async (clientId: string): Promise<Client | null> => {
  try {
    // Fetch the client
    const { data: client, error } = await supabase
      .from('clients')
      .select('*')
      .eq('id', clientId)
      .single();

    if (error) {
      console.error('Erro ao buscar cliente:', error);
      return null;
    }

    // Fetch service history
    const { data: serviceHistory, error: serviceError } = await supabase
      .from('service_history')
      .select('*')
      .eq('client_id', clientId);

    if (serviceError) {
      console.error('Erro ao buscar histórico de serviço:', serviceError);
      return null;
    }

    // Fetch tasks
    const { data: tasks, error: tasksError } = await supabase
      .from('tasks')
      .select('*')
      .eq('client_id', clientId);

    if (tasksError) {
      console.error('Erro ao buscar tarefas:', tasksError);
      return null;
    }

    // Fetch tags associated with the client
    const { data: clientTags, error: tagsError } = await supabase
      .from('client_tags')
      .select('tag_id')
      .eq('client_id', clientId);

    if (tagsError) {
      console.error('Erro ao buscar tags do cliente:', tagsError);
      return null;
    }

    // If there are tags, fetch their details
    let tags = [];
    if (clientTags && clientTags.length > 0) {
      const tagIds = clientTags.map((ct: any) => ct.tag_id);
      
      const { data: tagsData, error: tagsDataError } = await supabase
        .from('tags')
        .select('*')
        .in('id', tagIds);

      if (tagsDataError) {
        console.error('Erro ao buscar detalhes das tags:', tagsDataError);
      } else {
        tags = tagsData.map((tag: any) => ({
          id: tag.id,
          name: tag.name,
          createdAt: new Date(tag.created_at)
        }));
      }
    }

    // Format the client with all relations
    return {
      id: client.id,
      name: client.name,
      phone: client.phone,
      source: client.source,
      level: client.level as 'Lead' | 'Cliente',
      createdAt: new Date(client.created_at),
      updatedAt: new Date(client.updated_at),
      serviceHistory: serviceHistory.map((sh: any) => ({
        id: sh.id,
        clientId: sh.client_id,
        date: new Date(sh.date),
        observations: sh.observations,
        createdAt: new Date(sh.created_at)
      })),
      tasks: tasks.map((task: any) => ({
        id: task.id,
        clientId: task.client_id,
        description: task.description,
        completed: task.completed,
        createdAt: new Date(task.created_at),
        dueDate: task.due_date ? new Date(task.due_date) : undefined
      })),
      tags: tags
    };
  } catch (error) {
    console.error('Erro ao buscar cliente e suas relações:', error);
    return null;
  }
};
