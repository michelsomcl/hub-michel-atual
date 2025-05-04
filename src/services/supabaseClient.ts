
import { supabase } from "@/integrations/supabase/client";
import { Client, Tag, ServiceHistory, Task } from "../types";

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
  let tags: Tag[] = [];
  if (clientTags && clientTags.length > 0) {
    const tagIds = clientTags.map(ct => ct.tag_id);
    
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
};

export const saveClient = async (client: Client): Promise<Client | null> => {
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
};

export const deleteClient = async (clientId: string): Promise<boolean> => {
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
};

// ====== TAGS ======
export const getTags = async (): Promise<Tag[]> => {
  const { data: tags, error } = await supabase
    .from('tags')
    .select('*');

  if (error) {
    console.error('Erro ao buscar tags:', error);
    return [];
  }

  // Formatando as datas
  return tags.map((tag: any) => ({
    id: tag.id,
    name: tag.name,
    createdAt: new Date(tag.created_at)
  }));
};

export const saveTag = async (tag: Tag): Promise<Tag | null> => {
  // Preparar objeto da tag para o Supabase
  const tagData = {
    id: tag.id,
    name: tag.name
    // Não incluímos created_at pois é gerenciado pelo banco
  };

  // Inserir ou atualizar a tag
  const { data: savedTag, error } = await supabase
    .from('tags')
    .upsert(tagData)
    .select()
    .single();

  if (error) {
    console.error('Erro ao salvar tag:', error);
    return null;
  }

  return {
    id: savedTag.id,
    name: savedTag.name,
    createdAt: new Date(savedTag.created_at)
  };
};

export const deleteTag = async (tagId: string): Promise<boolean> => {
  // Excluir tag
  const { error } = await supabase
    .from('tags')
    .delete()
    .eq('id', tagId);

  if (error) {
    console.error('Erro ao excluir tag:', error);
    return false;
  }

  return true;
};

// ====== SERVICE HISTORY ======
export const addServiceHistory = async (history: ServiceHistory): Promise<ServiceHistory | null> => {
  // Preparar objeto de histórico para o Supabase
  const historyData = {
    id: history.id,
    client_id: history.clientId,
    date: history.date.toISOString(),
    observations: history.observations
    // Não incluímos created_at pois é gerenciado pelo banco
  };

  // Inserir histórico de serviço
  const { data: savedHistory, error } = await supabase
    .from('service_history')
    .insert(historyData)
    .select()
    .single();

  if (error) {
    console.error('Erro ao adicionar histórico de serviço:', error);
    return null;
  }

  return {
    id: savedHistory.id,
    clientId: savedHistory.client_id,
    date: new Date(savedHistory.date),
    observations: savedHistory.observations,
    createdAt: new Date(savedHistory.created_at)
  };
};

// ====== TASKS ======
export const addTask = async (task: Task): Promise<Task | null> => {
  // Preparar objeto de tarefa para o Supabase
  const taskData = {
    id: task.id,
    client_id: task.clientId,
    description: task.description,
    completed: task.completed,
    due_date: task.dueDate ? task.dueDate.toISOString() : null
    // Não incluímos created_at pois é gerenciado pelo banco
  };

  // Inserir tarefa
  const { data: savedTask, error } = await supabase
    .from('tasks')
    .insert(taskData)
    .select()
    .single();

  if (error) {
    console.error('Erro ao adicionar tarefa:', error);
    return null;
  }

  return {
    id: savedTask.id,
    clientId: savedTask.client_id,
    description: savedTask.description,
    completed: savedTask.completed,
    createdAt: new Date(savedTask.created_at),
    dueDate: savedTask.due_date ? new Date(savedTask.due_date) : undefined
  };
};

export const updateTaskCompletion = async (taskId: string, completed: boolean): Promise<boolean> => {
  // Atualizar status de conclusão da tarefa
  const { error } = await supabase
    .from('tasks')
    .update({ completed })
    .eq('id', taskId);

  if (error) {
    console.error('Erro ao atualizar status da tarefa:', error);
    return false;
  }

  return true;
};

// Função para inicializar o banco de dados com dados mockados
export const initializeDatabase = async () => {
  // Verificar se já existem dados no banco
  const { count, error } = await supabase
    .from('clients')
    .select('*', { count: 'exact', head: true });

  if (error) {
    console.error('Erro ao verificar dados existentes:', error);
    return;
  }

  // Se não houver dados, importar dados mockados
  if (count === 0) {
    try {
      const { mockClients, mockTags } = await import('../data/mockData');
      
      // Primeiro salvar as tags
      for (const tag of mockTags) {
        await saveTag(tag);
      }
      
      // Depois salvar os clientes com suas relações
      for (const client of mockClients) {
        await saveClient(client);
      }
      
      console.log('Dados mockados importados com sucesso para o Supabase!');
    } catch (error) {
      console.error('Erro ao importar dados mockados:', error);
    }
  }
};
