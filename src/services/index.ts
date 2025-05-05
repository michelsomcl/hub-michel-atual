
// Arquivo de barrel para exportar todos os serviços
export { supabase, initializeDatabase } from './baseService';
export { 
  getClients,
  getClientWithRelations,
  saveClient,
  deleteClient
} from './clientService';
export { 
  getTags,
  saveTag,
  deleteTag
} from './tagService';
export { addServiceHistory } from './serviceHistoryService';
export { addTask, updateTaskCompletion } from './taskService';
export { 
  getClients as getClientsFromLocalStorage,
  getTags as getTagsFromLocalStorage,
  saveClients,
  saveTags,
  clearLocalStorage,
  initializeLocalStorage
} from './localStorage';
