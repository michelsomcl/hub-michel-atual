
// Este arquivo agora apenas reexporta tudo dos arquivos de serviço individuais
// para manter compatibilidade com código existente
export { supabase, initializeDatabase } from './baseService';

// Serviços do Supabase (com prioridade na exportação)
export {
  getClients as getClientsFromDB,
  getClientWithRelations,
  saveClient,
  deleteClient
} from './clientService';

export {
  getTags as getTagsFromDB,
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

// Funções do localStorage - renomeando para evitar conflitos
export {
  getClients as getClientsFromLocalStorage,
  getTags as getTagsFromLocalStorage,
  saveClients,
  saveTags,
  clearLocalStorage,
  initializeLocalStorage
} from './localStorage';

// Para compatibilidade com código existente, exporte as funções do Supabase como padrão
export const getClients = getClientsFromDB;
export const getTags = getTagsFromDB;
