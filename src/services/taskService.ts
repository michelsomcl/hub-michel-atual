
import { supabase } from "./baseService";
import { Task } from "../types";

// ====== TASKS ======
export const addTask = async (task: Task): Promise<Task | null> => {
  try {
    // Preparar objeto de tarefa para o Supabase
    const taskData = {
      id: task.id,
      client_id: task.clientId,
      description: task.description,
      completed: task.completed,
      due_date: task.dueDate ? task.dueDate.toISOString() : null
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
