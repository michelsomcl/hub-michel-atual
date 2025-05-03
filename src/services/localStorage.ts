
import { Client, Tag } from "../types";

const CLIENTS_KEY = 'clients_data';
const TAGS_KEY = 'tags_data';

export const saveClients = (clients: Client[]): void => {
  localStorage.setItem(CLIENTS_KEY, JSON.stringify(clients));
};

export const getClients = (): Client[] => {
  const data = localStorage.getItem(CLIENTS_KEY);
  if (!data) return [];
  
  try {
    const parsedData = JSON.parse(data);
    // Converter strings de data para objetos Date
    return parsedData.map((client: any) => ({
      ...client,
      createdAt: new Date(client.createdAt),
      updatedAt: new Date(client.updatedAt),
      serviceHistory: client.serviceHistory.map((history: any) => ({
        ...history,
        date: new Date(history.date),
        createdAt: new Date(history.createdAt)
      })),
      tasks: client.tasks.map((task: any) => ({
        ...task,
        createdAt: new Date(task.createdAt),
        dueDate: task.dueDate ? new Date(task.dueDate) : undefined
      })),
    }));
  } catch (error) {
    console.error('Erro ao carregar clientes do localStorage:', error);
    return [];
  }
};

export const saveTags = (tags: Tag[]): void => {
  localStorage.setItem(TAGS_KEY, JSON.stringify(tags));
  
  // Update the tags in all clients
  const clients = getClients();
  const updatedClients = clients.map(client => {
    // Update client tags with the latest tag information
    const updatedTags = client.tags.map(clientTag => {
      const updatedTag = tags.find(t => t.id === clientTag.id);
      return updatedTag || clientTag;
    });
    
    return {
      ...client,
      tags: updatedTags
    };
  });
  
  // Save the updated clients
  saveClients(updatedClients);
};

export const getTags = (): Tag[] => {
  const data = localStorage.getItem(TAGS_KEY);
  if (!data) return [];
  
  try {
    const parsedData = JSON.parse(data);
    // Converter strings de data para objetos Date
    return parsedData.map((tag: any) => ({
      ...tag,
      createdAt: new Date(tag.createdAt)
    }));
  } catch (error) {
    console.error('Erro ao carregar tags do localStorage:', error);
    return [];
  }
};

export const initializeLocalStorage = (): void => {
  // Verificar se já existem dados no localStorage
  if (!localStorage.getItem(CLIENTS_KEY) || !localStorage.getItem(TAGS_KEY)) {
    // Importar dados mockados para inicializar
    import('../data/mockData').then(({ mockClients, mockTags }) => {
      if (!localStorage.getItem(CLIENTS_KEY)) {
        saveClients(mockClients);
      }
      
      if (!localStorage.getItem(TAGS_KEY)) {
        saveTags(mockTags);
      }
    });
  }
};
