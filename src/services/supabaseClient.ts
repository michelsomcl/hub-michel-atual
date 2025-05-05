
// This file reexports everything from the individual service files
// to maintain compatibility with existing code
export { supabase, initializeDatabase } from './baseService';

// Supabase services (with priority in the export)
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

export {
  addServiceHistory
} from './serviceHistoryService';

export {
  addTask,
  updateTaskCompletion
} from './taskService';

// LocalStorage functions - renamed to avoid conflicts
export {
  getClients as getClientsFromLocalStorage,
  getTags as getTagsFromLocalStorage,
  saveClients,
  saveTags,
  clearLocalStorage,
  initializeLocalStorage
} from './localStorage';
