
// Arquivo base com funções compartilhadas e importação do cliente Supabase
import { supabase } from "@/integrations/supabase/client";

export { supabase };

// Função para inicializar o banco de dados
export const initializeDatabase = async () => {
  try {
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
        
        // Importar os serviços necessários dinamicamente para evitar referências circulares
        const { saveTag } = await import('./tagService');
        const { saveClient } = await import('./clientService');
        
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
  } catch (error) {
    console.error('Erro na inicialização do banco:', error);
  }
};
