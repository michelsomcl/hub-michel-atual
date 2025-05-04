
import { supabase } from "./baseService";
import { Client } from "../types";

// ====== CLIENTS ======
export const getClients = async (): Promise<Client[]> => {
  const { data: clients, error } = await supabase
    .from('clients')
    .select('*');

  if (error) {
    console.error('Erro ao buscar clientes:', error);
    return [];
  }

  // Formatando as datas
  return clients.map((client: any) => ({
    ...client,
    id: client.id,
    createdAt: new Date(client.created_at),
    updatedAt: new Date(client.updated_at),
    serviceHistory: [], // Será preenchido depois
    tasks: [], // Será preenchido depois
    tags: [], // Será preenchido depois
  }));
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

    // Se for uma atualização, vamos limpar as relações existentes antes de recriar
    if (client.id) {
      // Não vamos apagar serviços e tarefas, apenas tags
      const { error: deleteTagsError } = await supabase
        .from('client_tags')
        .delete()
        .eq('client_id', client.id);

      if (deleteTagsError) {
        console.error('Erro ao limpar tags do cliente:', deleteTagsError);
      }
    }

    // Salvar tags relacionadas
    if (client.tags.length > 0) {
      const clientTagsData = client.tags.map(tag => ({
        client_id: savedClient.id,
        tag_id: tag.id
      }));

      const { error: tagsError } = await supabase
        .from('client_tags')
        .insert(clientTagsData);

      if (tagsError) {
        console.error('Erro ao salvar tags do cliente:', tagsError);
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
