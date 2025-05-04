
import { supabase } from "./baseService";
import { ServiceHistory } from "../types";

// ====== SERVICE HISTORY ======
export const addServiceHistory = async (history: ServiceHistory): Promise<ServiceHistory | null> => {
  try {
    // Preparar objeto de histórico para o Supabase
    const historyData = {
      id: history.id,
      client_id: history.clientId,
      date: history.date.toISOString(),
      observations: history.observations
      // Não incluímos created_at pois é gerenciado pelo banco
    };

    // Inserir histórico de serviço
    const { data: savedHistory, error } = await supabase
      .from('service_history')
      .insert(historyData)
      .select()
      .single();

    if (error) {
      console.error('Erro ao adicionar histórico de serviço:', error);
      return null;
    }

    return {
      id: savedHistory.id,
      clientId: savedHistory.client_id,
      date: new Date(savedHistory.date),
      observations: savedHistory.observations,
      createdAt: new Date(savedHistory.created_at)
    };
  } catch (error) {
    console.error('Erro ao adicionar histórico de serviço:', error);
    return null;
  }
};
