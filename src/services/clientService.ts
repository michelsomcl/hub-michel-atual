
import { supabase } from "./baseService";
import { Client } from "../types";

// ====== CLIENTS ======
export const getClients = async (): Promise<Client[]> => {
  try {
    console.log("Starting to fetch clients data...");
    
    // Primeiro, buscar todos os clientes
    const { data: clients, error } = await supabase
      .from('clients')
      .select('*');

    if (error) {
      console.error('Erro ao buscar clientes:', error);
      return [];
    }

    console.log(`Retrieved ${clients.length} clients from database`);

    // Formatar os clientes com arrays vazios para relações
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

    // Buscar todas as tags para uso posterior
    const { data: allTags, error: tagsError } = await supabase
      .from('tags')
      .select('*');

    if (tagsError) {
      console.error('Erro ao buscar tags:', tagsError);
    } else {
      console.log(`Retrieved ${allTags.length} tags from database`);
    }

    // Buscar todas as relações cliente-tag
    const { data: clientTags, error: clientTagsError } = await supabase
      .from('client_tags')
      .select('*');

    if (clientTagsError) {
      console.error('Erro ao buscar relações cliente-tag:', clientTagsError);
    } else if (clientTags && allTags) {
      console.log(`Retrieved ${clientTags.length} client-tag relationships`);
      
      // Mapear as tags para cada cliente
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
      
      // Logging para debug
      formattedClients.forEach(client => {
        console.log(`Client ${client.name} has ${client.tags.length} tags:`, 
          client.tags.map(tag => tag.name).join(', '));
      });
    }

    // Buscar todas as tarefas
    const { data: tasks, error: tasksError } = await supabase
      .from('tasks')
      .select('*');

    if (tasksError) {
      console.error('Erro ao buscar tarefas:', tasksError);
    } else if (tasks) {
      console.log(`Retrieved ${tasks.length} tasks from database`);
      
      // Mapear as tarefas para cada cliente
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

    // Buscar todo o histórico de serviços
    const { data: serviceHistory, error: serviceHistoryError } = await supabase
      .from('service_history')
      .select('*');

    if (serviceHistoryError) {
      console.error('Erro ao buscar histórico de serviços:', serviceHistoryError);
    } else if (serviceHistory) {
      console.log(`Retrieved ${serviceHistory.length} service history entries from database`);
      
      // Mapear o histórico de serviços para cada cliente
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

export const getClientWithRelations = async (clientId: string): Promise<Client | null> => {
  try {
    // Buscar o cliente
    const { data: client, error } = await supabase
      .from('clients')
      .select('*')
      .eq('id', clientId)
      .single();

    if (error) {
      console.error('Erro ao buscar cliente:', error);
      return null;
    }

    // Buscar histórico de serviço
    const { data: serviceHistory, error: serviceError } = await supabase
      .from('service_history')
      .select('*')
      .eq('client_id', clientId);

    if (serviceError) {
      console.error('Erro ao buscar histórico de serviço:', serviceError);
      return null;
    }

    // Buscar tarefas
    const { data: tasks, error: tasksError } = await supabase
      .from('tasks')
      .select('*')
      .eq('client_id', clientId);

    if (tasksError) {
      console.error('Erro ao buscar tarefas:', tasksError);
      return null;
    }

    // Buscar tags associadas ao cliente
    const { data: clientTags, error: tagsError } = await supabase
      .from('client_tags')
      .select('tag_id')
      .eq('client_id', clientId);

    if (tagsError) {
      console.error('Erro ao buscar tags do cliente:', tagsError);
      return null;
    }

    // Se tiver tags, buscar os detalhes delas
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

    // Formatar o cliente com todas as relações
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

export const saveClient = async (client: Client): Promise<Client | null> => {
  try {
    console.log("Salvando cliente:", client);
    console.log("Tags do cliente:", client.tags);
    
    // Preparar objeto do cliente para o Supabase
    const clientData = {
      id: client.id,
      name: client.name,
      phone: client.phone,
      source: client.source,
      level: client.level
      // Não incluímos created_at e updated_at pois são gerenciados pelo banco
    };

    // Inserir ou atualizar o cliente
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

    // Se for uma atualização, vamos limpar as relações existentes antes de recriar
    if (client.id) {
      // Não vamos apagar serviços e tarefas, apenas tags
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

    // Salvar tags relacionadas
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

    // Retornar o cliente com os dados atualizados
    return getClientWithRelations(savedClient.id);
  } catch (error) {
    console.error('Erro ao salvar cliente:', error);
    return null;
  }
};

export const deleteClient = async (clientId: string): Promise<boolean> => {
  try {
    // Excluir cliente (todas as relações serão excluídas devido a ON DELETE CASCADE)
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
