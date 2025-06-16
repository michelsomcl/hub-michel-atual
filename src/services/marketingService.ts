
import { supabase } from "./baseService";
import { Client, Tag } from "../types";

export interface MarketingMessage {
  id: string;
  client_id: string;
  first_name: string;
  phone: string;
  message?: string;
  created_at: Date;
  updated_at: Date;
  client?: Client;
  tags?: Tag[];
}

/**
 * Busca todas as mensagens de marketing com dados dos clientes e tags
 */
export const getMarketingMessages = async (): Promise<MarketingMessage[]> => {
  try {
    console.log("Buscando mensagens de marketing...");
    
    // Buscar mensagens de marketing
    const { data: messages, error } = await supabase
      .from('marketing_messages')
      .select('*');

    if (error) {
      console.error('Erro ao buscar mensagens de marketing:', error);
      return [];
    }

    console.log(`Encontradas ${messages.length} mensagens de marketing`);

    // Buscar clientes relacionados
    const { data: clients, error: clientsError } = await supabase
      .from('clients')
      .select('*');

    if (clientsError) {
      console.error('Erro ao buscar clientes:', clientsError);
      return [];
    }

    // Buscar todas as tags
    const { data: allTags, error: tagsError } = await supabase
      .from('tags')
      .select('*');

    if (tagsError) {
      console.error('Erro ao buscar tags:', tagsError);
      return [];
    }

    // Buscar relações cliente-tag
    const { data: clientTags, error: clientTagsError } = await supabase
      .from('client_tags')
      .select('*');

    if (clientTagsError) {
      console.error('Erro ao buscar relações cliente-tag:', clientTagsError);
      return [];
    }

    // Mapear dados
    const formattedMessages = messages.map((message: any) => {
      const client = clients.find(c => c.id === message.client_id);
      
      // Encontrar tags do cliente
      const clientTagIds = clientTags.filter(ct => ct.client_id === message.client_id);
      const tags = clientTagIds.map(ct => {
        const tag = allTags.find(t => t.id === ct.tag_id);
        return tag ? {
          id: tag.id,
          name: tag.name,
          createdAt: new Date(tag.created_at)
        } : null;
      }).filter(Boolean);

      return {
        id: message.id,
        client_id: message.client_id,
        first_name: message.first_name,
        phone: message.phone,
        message: message.message,
        created_at: new Date(message.created_at),
        updated_at: new Date(message.updated_at),
        client: client ? {
          id: client.id,
          name: client.name,
          phone: client.phone,
          source: client.source,
          level: client.level,
          createdAt: new Date(client.created_at),
          updatedAt: new Date(client.updated_at),
          serviceHistory: [],
          tasks: [],
          tags: []
        } : undefined,
        tags: tags
      };
    });

    return formattedMessages;
  } catch (error) {
    console.error('Erro ao buscar mensagens de marketing:', error);
    return [];
  }
};

/**
 * Atualiza mensagens de marketing para clientes selecionados
 */
export const updateMarketingMessages = async (
  clientIds: string[], 
  message: string
): Promise<boolean> => {
  try {
    console.log("Atualizando mensagens para clientes:", clientIds);
    console.log("Mensagem:", message);

    const { error } = await supabase
      .from('marketing_messages')
      .update({ 
        message: message,
        updated_at: new Date().toISOString()
      })
      .in('client_id', clientIds);

    if (error) {
      console.error('Erro ao atualizar mensagens:', error);
      return false;
    }

    console.log("Mensagens atualizadas com sucesso");
    return true;
  } catch (error) {
    console.error('Erro ao atualizar mensagens:', error);
    return false;
  }
};

/**
 * Envia dados para webhook do n8n
 */
export const sendToWebhook = async (
  webhookUrl: string,
  selectedMessages: MarketingMessage[]
): Promise<boolean> => {
  try {
    console.log("Enviando dados para webhook:", webhookUrl);
    
    // Filtrar apenas mensagens que têm conteúdo
    const messagesToSend = selectedMessages
      .filter(msg => msg.message && msg.message.trim() !== '')
      .map(msg => ({
        first_name: msg.first_name,
        phone: msg.phone,
        message: msg.message
      }));

    console.log("Dados a serem enviados:", messagesToSend);

    if (messagesToSend.length === 0) {
      throw new Error("Nenhuma mensagem válida para enviar");
    }

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(messagesToSend),
    });

    if (!response.ok) {
      throw new Error(`Erro no webhook: ${response.status} ${response.statusText}`);
    }

    console.log("Dados enviados com sucesso para o webhook");
    return true;
  } catch (error) {
    console.error('Erro ao enviar para webhook:', error);
    throw error;
  }
};
