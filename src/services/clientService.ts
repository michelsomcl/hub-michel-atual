
// This file is kept for backwards compatibility
// It re-exports all client-related services from the refactored modules
import { 
  getClients, 
  getClientWithRelations, 
  saveClient, 
  deleteClient 
} from './client';

// Re-export all client services
export { 
  getClients, 
  getClientWithRelations, 
  saveClient, 
  deleteClient 
};
