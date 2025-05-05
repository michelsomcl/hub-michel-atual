
// Export all client-related services from a single entry point
export { 
  getClients, 
  getClientWithRelations 
} from './clientQueries';

export { 
  saveClient, 
  deleteClient 
} from './clientMutations';
