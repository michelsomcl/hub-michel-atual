
import { Client, Tag } from "../types";
import { supabase } from "@/integrations/supabase/client";

const convertSupabaseClient = (item: any): Client => {
  // Transform from Supabase format to our app format
  const client: Client = {
    id: item.id,
    name: item.name,
    phone: item.phone,
    source: item.source,
    level: item.level,
    createdAt: new Date(item.created_at),
    updatedAt: new Date(item.updated_at),
    serviceHistory: [],
    tasks: [],
    tags: []
  };
  
  return client;
};

const convertClientToSupabase = (client: Client) => {
  return {
    id: client.id,
    name: client.name,
    phone: client.phone,
    source: client.source,
    level: client.level
  };
};

export const saveClients = async (clients: Client[]): Promise<void> => {
  // This function is more complex now as it needs to handle inserts, updates and relationships
  // We'll implement it for each client
  for (const client of clients) {
    await saveClient(client);
  }
};

export const saveClient = async (client: Client): Promise<void> => {
  const clientData = convertClientToSupabase(client);
  
  // Upsert the client
  const { error: clientError } = await supabase
    .from('clients')
    .upsert(clientData)
    .select();
  
  if (clientError) {
    console.error('Erro ao salvar cliente no Supabase:', clientError);
    return;
  }

  // Handle service history
  for (const history of client.serviceHistory) {
    const { error: historyError } = await supabase
      .from('service_history')
      .upsert({
        id: history.id,
        client_id: client.id,
        date: history.date.toISOString(),
        observations: history.observations,
        created_at: history.createdAt.toISOString()
      });
      
    if (historyError) {
      console.error('Erro ao salvar histórico de serviço:', historyError);
    }
  }
  
  // Handle tasks
  for (const task of client.tasks) {
    const { error: taskError } = await supabase
      .from('tasks')
      .upsert({
        id: task.id,
        client_id: client.id,
        description: task.description,
        completed: task.completed,
        created_at: task.createdAt.toISOString(),
        due_date: task.dueDate ? task.dueDate.toISOString() : null
      });
      
    if (taskError) {
      console.error('Erro ao salvar tarefa:', taskError);
    }
  }
  
  // Handle tags (many-to-many relationship)
  // First delete all existing relationships for this client
  const { error: deleteError } = await supabase
    .from('client_tags')
    .delete()
    .eq('client_id', client.id);
    
  if (deleteError) {
    console.error('Erro ao deletar relações de tags:', deleteError);
  }
  
  // Then insert all current relationships
  for (const tag of client.tags) {
    const { error: tagRelError } = await supabase
      .from('client_tags')
      .insert({
        client_id: client.id,
        tag_id: tag.id
      });
      
    if (tagRelError) {
      console.error('Erro ao adicionar relação de tag:', tagRelError);
    }
  }
};

export const getClients = async (): Promise<Client[]> => {
  try {
    // Fetch clients
    const { data: clientsData, error: clientsError } = await supabase
      .from('clients')
      .select('*');
      
    if (clientsError) {
      console.error('Erro ao buscar clientes:', clientsError);
      return [];
    }
    
    // Convert to our format
    const clients: Client[] = clientsData.map(item => convertSupabaseClient(item));
    
    // Fetch service history for all clients
    const { data: historyData, error: historyError } = await supabase
      .from('service_history')
      .select('*');
      
    if (historyError) {
      console.error('Erro ao buscar histórico de serviços:', historyError);
    } else if (historyData) {
      // Attach service history to respective clients
      historyData.forEach(history => {
        const client = clients.find(c => c.id === history.client_id);
        if (client) {
          client.serviceHistory.push({
            id: history.id,
            clientId: history.client_id,
            date: new Date(history.date),
            observations: history.observations,
            createdAt: new Date(history.created_at)
          });
        }
      });
    }
    
    // Fetch tasks for all clients
    const { data: tasksData, error: tasksError } = await supabase
      .from('tasks')
      .select('*');
      
    if (tasksError) {
      console.error('Erro ao buscar tarefas:', tasksError);
    } else if (tasksData) {
      // Attach tasks to respective clients
      tasksData.forEach(task => {
        const client = clients.find(c => c.id === task.client_id);
        if (client) {
          client.tasks.push({
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
    
    // Fetch client_tags relationships
    const { data: clientTagsData, error: clientTagsError } = await supabase
      .from('client_tags')
      .select('*');
      
    if (clientTagsError) {
      console.error('Erro ao buscar relações de tags:', clientTagsError);
    }
    
    // Fetch all tags
    const { data: tagsData, error: tagsError } = await supabase
      .from('tags')
      .select('*');
      
    if (tagsError) {
      console.error('Erro ao buscar tags:', tagsError);
    } else if (tagsData && clientTagsData) {
      // Create a mapping of tag id to tag object
      const tagsMap = tagsData.reduce((acc, tag) => {
        acc[tag.id] = {
          id: tag.id,
          name: tag.name,
          createdAt: new Date(tag.created_at)
        };
        return acc;
      }, {});
      
      // Attach tags to respective clients
      clientTagsData.forEach(relation => {
        const client = clients.find(c => c.id === relation.client_id);
        const tag = tagsMap[relation.tag_id];
        if (client && tag) {
          client.tags.push(tag);
        }
      });
    }
    
    return clients;
  } catch (error) {
    console.error('Erro ao carregar clientes do Supabase:', error);
    return [];
  }
};

export const saveTags = async (tags: Tag[]): Promise<void> => {
  // Convert tags to Supabase format and upsert them
  const supabaseTags = tags.map(tag => ({
    id: tag.id,
    name: tag.name,
    created_at: tag.createdAt.toISOString()
  }));
  
  const { error } = await supabase
    .from('tags')
    .upsert(supabaseTags);
    
  if (error) {
    console.error('Erro ao salvar tags no Supabase:', error);
  }
  
  // Update the tags in all clients
  const clients = await getClients();
  for (const client of clients) {
    // Update client tags with the latest tag information
    const updatedTags = client.tags.map(clientTag => {
      const updatedTag = tags.find(t => t.id === clientTag.id);
      return updatedTag || clientTag;
    });
    
    client.tags = updatedTags;
    await saveClient(client);
  }
};

export const getTags = async (): Promise<Tag[]> => {
  try {
    const { data, error } = await supabase
      .from('tags')
      .select('*');
      
    if (error) {
      console.error('Erro ao buscar tags:', error);
      return [];
    }
    
    // Convert to our format
    return data.map(tag => ({
      id: tag.id,
      name: tag.name,
      createdAt: new Date(tag.created_at)
    }));
  } catch (error) {
    console.error('Erro ao carregar tags do Supabase:', error);
    return [];
  }
};

export const initializeLocalStorage = async (): Promise<void> => {
  // Check if we have data in Supabase already
  const clients = await getClients();
  const tags = await getTags();
  
  if (clients.length === 0 || tags.length === 0) {
    // Import mock data to initialize
    const { mockClients, mockTags } = await import('../data/mockData');
    
    if (clients.length === 0) {
      await saveClients(mockClients);
    }
    
    if (tags.length === 0) {
      await saveTags(mockTags);
    }
  }
};
