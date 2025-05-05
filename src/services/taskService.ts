
import { supabase } from "./baseService";
import { Task } from "../types";

// ====== TASKS ======
export const addTask = async (task: Task): Promise<Task | null> => {
  try {
    console.log("Adicionando tarefa:", task);
    
    // Garantir que a data seja armazenada em UTC
    let dueDateISO = null;
    if (task.dueDate) {
      // Criar uma cópia da data para não modificar o objeto original
      const dueDate = new Date(task.dueDate);
      // Certificar que estamos usando a data exata e não convertendo para UTC
      dueDateISO = dueDate.toISOString();
      console.log("Data original:", task.dueDate);
      console.log("Data ISO para salvar:", dueDateISO);
    }
    
    // Preparar objeto de tarefa para o Supabase
    const taskData = {
      id: task.id,
      client_id: task.clientId,
      description: task.description,
      completed: task.completed,
      due_date: dueDateISO
      // Não incluímos created_at pois é gerenciado pelo banco
    };

    // Inserir tarefa
    const { data: savedTask, error } = await supabase
      .from('tasks')
      .insert(taskData)
      .select()
      .single();

    if (error) {
      console.error('Erro ao adicionar tarefa:', error);
      return null;
    }

    console.log("Tarefa salva com sucesso:", savedTask);
    
    // Retornar tarefa no formato da aplicação
    return {
      id: savedTask.id,
      clientId: savedTask.client_id,
      description: savedTask.description,
      completed: savedTask.completed,
      createdAt: new Date(savedTask.created_at),
      dueDate: savedTask.due_date ? new Date(savedTask.due_date) : undefined
    };
  } catch (error) {
    console.error('Erro ao adicionar tarefa:', error);
    return null;
  }
};

export const updateTaskCompletion = async (taskId: string, completed: boolean): Promise<boolean> => {
  try {
    // Atualizar status de conclusão da tarefa
    const { error } = await supabase
      .from('tasks')
      .update({ completed })
      .eq('id', taskId);

    if (error) {
      console.error('Erro ao atualizar status da tarefa:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Erro ao atualizar status da tarefa:', error);
    return false;
  }
};
