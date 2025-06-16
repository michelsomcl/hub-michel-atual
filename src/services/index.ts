
// Barrel file to export all services
export { supabase, initializeDatabase } from './baseService';
export { 
  getClients,
  getClientWithRelations,
  saveClient,
  deleteClient
} from './client';
export { 
  getTags,
  saveTag,
  deleteTag
} from './tagService';
export { addServiceHistory } from './serviceHistoryService';
export { addTask, updateTaskCompletion } from './taskService';
export { 
  getMarketingMessages,
  updateMarketingMessages,
  sendToWebhook
} from './marketingService';
export { 
  getClients as getClientsFromLocalStorage,
  getTags as getTagsFromLocalStorage,
  saveClients,
  saveTags,
  clearLocalStorage,
  initializeLocalStorage
} from './localStorage';
