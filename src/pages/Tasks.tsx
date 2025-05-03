import React, { useState, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Link } from "react-router-dom";
import { Task, Client, ClientLevel } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";
import { CalendarIcon, CheckIcon } from "@radix-ui/react-icons";

interface TaskWithClient extends Task {
  client: Client;
}

const Tasks = () => {
  const [tasks, setTasks] = useState<TaskWithClient[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      // Get all incomplete tasks
      const { data: tasksData, error: tasksError } = await supabase
        .from("tasks")
        .select("*, clients(*)")
        .eq("completed", false)
        .order("due_date", { ascending: true, nullsLast: true });

      if (tasksError) throw tasksError;

      // Format the tasks with client data
      const formattedTasks: TaskWithClient[] = tasksData.map((task) => {
        const client = task.clients;
        
        const clientData = {
          id: client.id,
          name: client.name,
          phone: client.phone,
          source: client.source,
          level: client.level as ClientLevel, // Ensure proper type casting
          serviceHistory: [],
          tasks: [],
          tags: [],
          createdAt: new Date(client.created_at),
          updatedAt: new Date(client.updated_at)
        };

        return {
          id: task.id,
          clientId: task.client_id,
          description: task.description,
          completed: task.completed,
          createdAt: new Date(task.created_at),
          dueDate: task.due_date ? new Date(task.due_date) : undefined,
          client: clientData,
        };
      });

      setTasks(formattedTasks);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as tarefas.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTaskComplete = async (taskId: string) => {
    try {
      // Update the task in the database
      const { error } = await supabase
        .from("tasks")
        .update({ completed: true })
        .eq("id", taskId);

      if (error) throw error;

      // Update local state
      setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));

      toast({
        title: "Tarefa concluída",
        description: "A tarefa foi marcada como concluída.",
      });
    } catch (error) {
      console.error("Error completing task:", error);
      toast({
        title: "Erro",
        description: "Não foi possível concluir a tarefa.",
        variant: "destructive",
      });
    }
  };

  const formatDueDate = (date?: Date) => {
    if (!date) return "Sem data definida";
    return format(date, "dd 'de' MMMM", { locale: ptBR });
  };

  return (
    <Layout>
      <div className="container mx-auto py-6">
        <h1 className="text-3xl font-bold mb-6">Tarefas Pendentes</h1>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-1/2 mb-2" />
                  <Skeleton className="h-4 w-1/4" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : tasks.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <CheckIcon className="mx-auto h-12 w-12 text-green-500 mb-4" />
                <h3 className="text-xl font-medium mb-2">
                  Nenhuma tarefa pendente
                </h3>
                <p className="text-muted-foreground">
                  Você não tem tarefas pendentes no momento.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {tasks.map((task) => (
              <Card key={task.id}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex justify-between">
                    <span>{task.description}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                      onClick={() => handleTaskComplete(task.id)}
                    >
                      <Checkbox id={`task-${task.id}`} className="mr-2" />
                      <label htmlFor={`task-${task.id}`}>Concluir</label>
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div>
                      <Link
                        to={`/clients/${task.client.id}`}
                        className="text-blue-600 hover:underline font-medium"
                      >
                        {task.client.name}
                      </Link>
                      <div className="text-sm text-muted-foreground">
                        {task.client.phone}
                      </div>
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <CalendarIcon className="mr-1 h-4 w-4" />
                      {formatDueDate(task.dueDate)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Tasks;
